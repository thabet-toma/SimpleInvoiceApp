const db = require('./db');
async function test() {
  try {
    await db.query('CREATE TABLE IF NOT EXISTS customer_credentials (username VARCHAR(50) PRIMARY KEY, password VARCHAR(255), partner_id INT)');
    await db.query('INSERT IGNORE INTO customer_credentials (username, password, partner_id) VALUES ("anwar", "123456789", 91)');
    await db.query('INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES ("points_per_1000", "50"), ("point_value_ils", "1")');
    await db.query('INSERT IGNORE INTO customer_loyalty_points (partner_id, points) VALUES (91, 0)');
    console.log('DB Seeded');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
