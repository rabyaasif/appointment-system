require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Health check: browser mein http://localhost:5000/ kholein
app.get('/', (req, res) => {
  res.json({ message: 'Appointment System API chal rahi hai ✅' });
});

// Routes
app.use('/api/auth', authRoutes);
// Phase 2 mein yahan aur routes judengay: services, availability, appointments

// Route na milne par
app.use((req, res) => {
  res.status(404).json({ message: 'Yeh route maujood nahi hai.' });
});

// Koi unexpected error aaye to
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error.' });
});

const PORT = process.env.PORT || 5000;

// Pehle database check karo, phir server start karo
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connect nahi hua:', err.message);
    console.error('   .env file aur schema.sql check karein.');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET .env mein set nahi hai.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} par chal raha hai`);
  });
})();
