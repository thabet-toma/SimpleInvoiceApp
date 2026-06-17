require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === (process.env.APP_USERNAME || 'admin') && password === (process.env.APP_PASSWORD || '123456')) {
    res.json({ token: 'simple-jwt-token', user: { username, name: 'مسؤول', role: 'admin' } });
  } else if (username === 'aaa' && password === '123456') {
    res.json({ token: 'simple-jwt-token', user: { username: 'aaa', name: 'سائد', role: 'user' } });
  } else {
    try {
      const [customers] = await db.query('SELECT * FROM customer_credentials WHERE username = ? AND password = ?', [username, password]);
      if (customers.length > 0) {
        return res.json({ token: 'simple-jwt-token', user: { username, name: username, partnerId: customers[0].partner_id, role: 'customer' } });
      }
    } catch (e) { console.error(e); }
    res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }
});

app.get('/api/tenants', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT TenantID as id, CompanyName as name FROM tenants');
    res.json(rows);
  } catch (error) {
    console.error("API ERROR:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.get('/api/partners', async (req, res) => {
  try {
    const { type, tenantId } = req.query; 
    let query = 'SELECT PartnerID as id, Name as name, Type as type FROM partners WHERE is_deleted=0';
    if (tenantId) query += ` AND TenantID=${db.escape(tenantId)}`;
    if (type) query += ` AND Type=${db.escape(type)}`;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("API ERROR:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    const { name, type, tenantId } = req.body;
    const tid = tenantId || 6; 
    const [result] = await db.query(
      `INSERT INTO partners (TenantID, Name, Type, CurrencyID, SourceDiscountAmount, SourceDiscountPercent, CreatedAt) VALUES (?, ?, ?, 1, 0, 0, NOW())`,
      [tid, name, type]
    );
    res.json({ id: result.insertId, name, type });
  } catch (error) {
    console.error("API ERROR:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { tenantId } = req.query;
    let query = 'SELECT ProductID as id, Name_AR as name, AvgCost as cost, OnlinePrice as price, (QuantityOnHand + 0) as stock FROM products';
    if (tenantId) query += ` WHERE TenantID=${db.escape(tenantId)}`;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("API ERROR:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, cost, tenantId } = req.body;
    const tid = tenantId || 6;
    const sku = 'P-' + Date.now();
    const [result] = await db.query(
      `INSERT INTO products (TenantID, Name_AR, Name_EN, OnlinePrice, AvgCost, SKU, AllowNegativeStock, IsService, IsSerialized, IsForSaleOnline, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, NOW())`,
      [tid, name, name, price || 0, cost || 0, sku]
    );
    res.json({ id: result.insertId, name, price, cost });
  } catch (error) {
    console.error("API ERROR:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.post('/api/invoices/sale', async (req, res) => {
  try {
    const { partnerId, lines, total, tenantId, userName } = req.body;
    const tid = tenantId || 6;
    const invoiceNumber = 'SI-' + Date.now();
    const note = 'قادم من الموقع المبسط' + (userName ? ` بواسطة ${userName}` : '');
    
    // Fetch default accounts for the tenant dynamically
    const [accounts] = await db.query(
      `SELECT Code, AccountID FROM chartofaccounts WHERE Code IN ('1103', '1110B0001', '41') AND TenantID=?`,
      [tid]
    );
    let arAccount = null, cashAccount = null, revAccount = null;
    accounts.forEach(acc => {
      if (acc.Code === '1103') arAccount = acc.AccountID;
      if (acc.Code === '1110B0001') cashAccount = acc.AccountID;
      if (acc.Code === '41') revAccount = acc.AccountID;
    });

    const [invResult] = await db.query(
      `INSERT INTO sales_module_invoices 
      (TenantID, InvoiceNumber, CustomerID, InvoiceDate, InvoiceKind, InvoiceType, CurrencyID, Status, GrandTotal, SubtotalExclTax, InvoiceDiscount, TaxAmount, AmountPaid, ExchangeRate, CreatedAt, UpdatedAt, StockOnPost, BookNumber, DiscountPercent, LicensedDealerNo, PricesIncludeTax, SettlementInvoiceNo, FinancialDocumentNo, AttachedCashAmount, AccountsReceivableAccountID, CashOrBankAccountID, RevenueAccountID, AttachedCashAccountID, Notes) 
      VALUES (?, ?, ?, CURDATE(), 'sale', 'credit', 1, 'draft', ?, ?, 0, 0, 0, 1, NOW(), NOW(), 0, 1, 0, '-', 0, '-', '-', 0, ?, ?, ?, ?, ?)`,
      [tid, invoiceNumber, partnerId, total, total, arAccount, cashAccount, revAccount, cashAccount, note]
    );
    
    const invoiceId = invResult.insertId;
    
    for (const line of lines) {
      await db.query(`
        INSERT INTO sales_module_invoice_lines (TenantID, InvoiceID, ProductID, Quantity, UnitPrice, LineTotalExclTax, LineTaxAmount, LineDiscount)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0)
      `, [tid, invoiceId, line.productId, line.quantity, line.price, line.quantity * line.price]);
    }

    // Handle Loyalty Points
    try {
      const [settingsRows] = await db.query('SELECT setting_key, setting_value FROM app_settings WHERE setting_key = "points_per_1000"');
      if (settingsRows.length > 0) {
        const ptsPer1000 = parseFloat(settingsRows[0].setting_value);
        if (ptsPer1000 > 0) {
          const pointsEarned = Math.floor(parseFloat(total) / 1000) * ptsPer1000;
          if (pointsEarned > 0) {
            await db.query('INSERT INTO customer_loyalty_points (partner_id, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = points + ?', [partnerId, pointsEarned, pointsEarned]);
          }
        }
      }
    } catch (e) { console.error('Points Error', e); }
    
    res.json({ success: true, invoiceId, invoiceNumber });
  } catch (error) {
    console.error("API ERROR:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.post('/api/invoices/purchase', async (req, res) => {
  try {
    const { partnerId, lines, total, tenantId, userName } = req.body;
    const tid = tenantId || 6;
    const invoiceNumber = 'PI-' + Date.now();
    const note = 'قادم من الموقع المبسط' + (userName ? ` بواسطة ${userName}` : '');
    
    // Fetch default cash account
    const [accounts] = await db.query(
      `SELECT AccountID FROM chartofaccounts WHERE Code = '1110B0001' AND TenantID=?`,
      [tid]
    );
    const cashAccount = accounts.length > 0 ? accounts[0].AccountID : null;

    const [invResult] = await db.query(
      `INSERT INTO purchase_invoices 
      (TenantID, InvoiceNumber, PartnerID, InvoiceDate, CurrencyID, Status, GrandTotal, Subtotal, DiscountAmount, TaxRate, TaxAmount, ShippingCost, ShippingIncluded, ExchangeRate, PaymentType, CreatedAt, UpdatedAt, TaxType, IsPosted, AttachedCashAmount, ReceiptStatus, CashBankAccountID, Notes) 
      VALUES (?, ?, ?, CURDATE(), 1, 'draft', ?, ?, 0, 0, 0, 0, 0, 1, 'credit', NOW(), NOW(), 'inclusive', 0, 0, 'not_receipted', ?, ?)`,
      [tid, invoiceNumber, partnerId, total, total, cashAccount, note]
    );
    
    const invoiceId = invResult.insertId;
    
    for (const line of lines) {
      const [productData] = await db.query('SELECT Name_AR FROM products WHERE ProductID = ?', [line.productId]);
      const productName = productData.length > 0 ? productData[0].Name_AR : '-';

      await db.query(
        `INSERT INTO purchase_invoice_items 
        (PurchaseInvoiceID, ProductID, Quantity, UnitPrice, TotalPrice, Name, BatchNumber, CatalogNumber, DescriptionLine, IsTaxable, ManufactureNumber, NameSnapshot, SerialNumber, Unit, Warehouse, ReceivedQuantity) 
        VALUES (?, ?, ?, ?, ?, ?, '-', '-', '-', 0, '-', ?, '-', '-', '-', 0)`,
        [invoiceId, line.productId, line.quantity, line.price, line.quantity * line.price, productName, productName]
      );
    }
    
    res.json({ success: true, invoiceId, invoiceNumber });
  } catch (error) {
    console.error("API ERROR:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.get('/api/invoices/sale', async (req, res) => {
  try {
    const { tenantId } = req.query;
    let query = `
      SELECT i.SalesInvoiceID as id, i.InvoiceNumber as number, DATE_FORMAT(i.InvoiceDate, '%Y-%m-%d') as date, i.GrandTotal as total, p.Name as partnerName 
      FROM sales_module_invoices i 
      LEFT JOIN partners p ON i.CustomerID = p.PartnerID 
      WHERE i.TenantID=? ORDER BY i.SalesInvoiceID DESC LIMIT 50`;
    const [rows] = await db.query(query, [tenantId || 6]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices/purchase', async (req, res) => {
  try {
    const { tenantId } = req.query;
    let query = `
      SELECT i.PurchaseInvoiceID as id, i.InvoiceNumber as number, DATE_FORMAT(i.InvoiceDate, '%Y-%m-%d') as date, i.GrandTotal as total, p.Name as partnerName 
      FROM purchase_invoices i 
      LEFT JOIN partners p ON i.PartnerID = p.PartnerID 
      WHERE i.TenantID=? ORDER BY i.PurchaseInvoiceID DESC LIMIT 50`;
    const [rows] = await db.query(query, [tenantId || 6]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices/sale/:id', async (req, res) => {
  try {
    const [lines] = await db.query(`
      SELECT l.Quantity as quantity, l.UnitPrice as price, l.LineTotalExclTax as total, p.Name_AR as productName 
      FROM sales_module_invoice_lines l 
      LEFT JOIN products p ON l.ProductID = p.ProductID 
      WHERE l.InvoiceID=?`, [req.params.id]);
    res.json(lines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices/purchase/:id', async (req, res) => {
  try {
    const [lines] = await db.query(`
      SELECT l.Quantity as quantity, l.UnitPrice as price, l.TotalPrice as total, p.Name_AR as productName 
      FROM purchase_invoice_items l 
      LEFT JOIN products p ON l.ProductID = p.ProductID 
      WHERE l.PurchaseInvoiceID=?`, [req.params.id]);
    res.json(lines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM app_settings');
    const settings = {};
    rows.forEach(r => settings[r.setting_key] = r.setting_value);
    res.json(settings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { points_per_1000, point_value_ils } = req.body;
    await db.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', ['points_per_1000', points_per_1000, points_per_1000]);
    await db.query('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', ['point_value_ils', point_value_ils, point_value_ils]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/customers/:id/points', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT points FROM customer_loyalty_points WHERE partner_id = ?', [req.params.id]);
    res.json({ points: rows.length > 0 ? rows[0].points : 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/customers/:id/invoices', async (req, res) => {
  try {
    const query = `
      SELECT i.SalesInvoiceID as id, i.InvoiceNumber as number, DATE_FORMAT(i.InvoiceDate, '%Y-%m-%d') as date, i.GrandTotal as total
      FROM sales_module_invoices i 
      WHERE i.CustomerID = ? 
      ORDER BY i.SalesInvoiceID DESC LIMIT 50`;
    const [rows] = await db.query(query, [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/customers/:id/prices', async (req, res) => {
  try {
    const query = `
      SELECT l.ProductID as productId, 
             SUBSTRING_INDEX(GROUP_CONCAT(l.UnitPrice ORDER BY i.SalesInvoiceID DESC), ',', 1) as lastPrice 
      FROM sales_module_invoice_lines l 
      JOIN sales_module_invoices i ON l.InvoiceID = i.SalesInvoiceID 
      WHERE i.CustomerID = ? 
      GROUP BY l.ProductID`;
    const [rows] = await db.query(query, [req.params.id]);
    const priceMap = {};
    rows.forEach(r => priceMap[r.productId] = parseFloat(r.lastPrice));
    res.json(priceMap);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
