const express = require('express');
const router = express.Router();

const Customer = require('../models/Customer');
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function signToken(payload, secret, expiresIn = '7d') {
  return jwt.sign(payload, secret, { expiresIn });
}

// POST /api/login
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ ok: false, error: 'Missing JWT_SECRET on server' });
    }

    // 1) Try CUSTOMER login
    const customer = await Customer.findOne({ username }).lean();
    if (customer) {
      const okPw = await bcrypt.compare(password, customer.passwordHash || customer.password);
      if (!okPw) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

      const token = signToken({ sub: customer._id, role: 'customer', username: customer.username }, secret);
      return res.json({
        ok: true,
        token,
        user: { id: String(customer._id), username: customer.username, role: 'customer' }
      });
    }

    // 2) Try ADMIN login
    const admin = await User.findOne({ username }).lean();
    if (!admin) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    const okPw = await bcrypt.compare(password, admin.passwordHash || admin.password);
    if (!okPw) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    const token = signToken(
      { sub: admin._id, role: 'admin', username: admin.username },
      secret
    );

    return res.json({
      ok: true,
      token,
      user: { id: String(admin._id), username: admin.username, role: 'admin' }
    });
  } catch (err) {
    console.error('POST /api/login error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
