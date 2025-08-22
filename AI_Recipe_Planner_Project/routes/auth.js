const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// REGISTER (username + email + password)
router.post('/register', async (req, res) => {
  try {
    console.log('📩 Register body:', req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = new User({ username, email, password: hashed });
    await user.save();

    const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.status(201).json({ token });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN (email + password)
router.post('/login', async (req, res) => {
  try {
    console.log('📩 Login body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PROFILE (GET)
router.get('/profile', auth, async (req, res) => {
  try {
    const u = await User.findById(req.user.id).select('-password');
    return res.json(u);
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PROFILE (PUT) update prefs
router.put('/profile', auth, async (req, res) => {
  try {
    const { dietaryPreferences, allergies } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { dietaryPreferences, allergies },
      { new: true }
    ).select('-password');
    return res.json(updated);
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
