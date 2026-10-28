// Pehla admin account banane ki script
// Chalane ka tareeqa:  npm run seed:admin
require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../config/db');

(async () => {
  try {
    const name = process.env.ADMIN_NAME || 'Admin';
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log(`ℹ️  Admin (${email}) pehle se maujood hai. Kuch nahi badla.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    );

    console.log('✅ Admin ban gaya!');
    console.log(`   Email: ${email}`);
    console.log('   Password: .env mein jo ADMIN_PASSWORD likha hai wohi');
    process.exit(0);
  } catch (err) {
    console.error('❌ Admin banane mein masla:', err.message);
    process.exit(1);
  }
})();
