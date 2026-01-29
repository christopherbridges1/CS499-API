// Admin login route
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateUsernamePassword } = require("../middleware/validate");

const router = express.Router();

// POST /api/admin/login
router.post("/login", validateUsernamePassword, async (req, res) => {
    // Admin login logic
    try {
        const { username, password } = req.body;
        // Find admin user by username
        const user = await User.findOne({ username, role: "admin" });
        if (!user) return res.status(401).json({ ok: false, error: "invalid credentials" });

        // Compare provided password with stored hash
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ ok: false, error: "invalid credentials" });

        // Generate JWT token
        const token = jwt.sign(
            { username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { subject: String(user._id), expiresIn: "7d" }
        );

        // Respond with token and user info
        res.json({ ok: true, token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});
// Export the router
module.exports = router;