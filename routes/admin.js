const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateUsernamePassword } = require("../middleware/validate");

const router = express.Router();

// POST /api/admin/login
router.post("/login", validateUsernamePassword, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, role: "admin" });
    if (!user) return res.status(401).json({ ok: false, error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: "invalid credentials" });

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { subject: String(user._id), expiresIn: "7d" }
    );

    res.json({ ok: true, token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;