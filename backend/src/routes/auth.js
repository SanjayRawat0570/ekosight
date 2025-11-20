const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const u = new User({ email, passwordHash: hash, name });
    await u.save();
    const token = jwt.sign({ id: u._id, email: u.email }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: u._id, email: u.email, name: u.name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const u = await User.findOne({ email });
    if (!u) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: u._id, email: u.email }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { id: u._id, email: u.email, name: u.name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
