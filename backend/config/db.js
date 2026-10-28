const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection pool: har request par naya connection nahi banta, purane reuse hotay hain
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'appointment_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // TIME / DATE columns ko string hi rehne do (timezone ke masle se bachne ke liye)
  dateStrings: true,
});

module.exports = pool;
