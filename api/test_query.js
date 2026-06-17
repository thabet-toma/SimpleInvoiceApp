const db = require('./db');
async function test() {
  try {
    const query = `
      SELECT l.ProductID as productId, 
             SUBSTRING_INDEX(GROUP_CONCAT(l.UnitPrice ORDER BY i.SalesInvoiceID DESC), ',', 1) as lastPrice 
      FROM sales_module_invoice_lines l 
      JOIN sales_module_invoices i ON l.InvoiceID = i.SalesInvoiceID 
      WHERE i.CustomerID = 91 
      GROUP BY l.ProductID`;
    const [res] = await db.query(query);
    console.log(res);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
