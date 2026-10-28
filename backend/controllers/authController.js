const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Token banane ka helper
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ---------------------------------------------------
// POST /api/auth/register
// Public register sirf "customer" bana sakta hai.
// (Admin seed script se banta hai, staff ko admin banayega - Phase 2)
// ---------------------------------------------------
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email aur password zaroori hain.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Email sahi format mein likhein.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password kam az kam 6 characters ka hona chahiye.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Email pehle se to maujood nahi?
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Yeh email pehle se registered hai.' });
    }

    // Password hash karna
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, 'customer', phone || null]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: 'customer',
      phone: phone || null,
    };

    return res.status(201).json({
      message: 'Account ban gaya!',
      token: generateToken(user),
      user,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error. Dobara koshish karein.' });
  }
};

// ---------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email aur password zaroori hain.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, phone FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    // Email ya password galat ho to same message (taake hacker ko hint na mile)
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ya password galat hai.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ya password galat hai.' });
    }

    // Password response mein wapis nahi bhejna
    delete user.password;

    return res.json({
      message: 'Login kamyab!',
      token: generateToken(user),
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error. Dobara koshish karein.' });
  }
};

// ---------------------------------------------------
// GET /api/auth/me   (token zaroori)
// Frontend page refresh par yeh call karke user wapis load karega
// ---------------------------------------------------
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User nahi mila.' });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Server error. Dobara koshish karein.' });
  }
};

module.exports = { register, login, getMe };
