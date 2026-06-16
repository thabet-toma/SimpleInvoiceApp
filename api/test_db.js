require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000 // 10 seconds timeout
    });
    
    console.log('✅ Successfully connected to the remote database!');
    const [rows] = await connection.execute('SHOW TABLES;');
    console.log(`Found ${rows.length} tables in the database.`);
    
    // Check some specific tables
    const [invoiceRows] = await connection.execute('SELECT * FROM sales_module_invoices LIMIT 1');
    console.log('Tested reading from sales_module_invoices.');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.error('This usually means the database server is blocking the connection. Please ensure your current IP is added to the "Remote MySQL" whitelist in cPanel.');
    }
  }
}

testConnection();
