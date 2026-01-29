// Routes for customer registration and login
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const { validateUsernamePassword } = require("../middleware/validate");

const router = express.Router();

// POST /api/customers/register
router.post("/register", validateUsernamePassword, async (req, res) => {
    try {
        // Extract username and password from request body
        const { username, password } = req.body;

        // Check if username already exists
        const existing = await Customer.findOne({ username });
        if (existing) return res.status(409).json({ ok: false, error: "username already exists" });

        // Hash the password and create new customer
        const passwordHash = await bcrypt.hash(password, 10);
        const customer = await Customer.create({ username, passwordHash });

        // Respond with success and customer ID
        res.status(201).json({ ok: true, customerId: customer._id });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});

// POST /api/customers/login
router.post("/login", validateUsernamePassword, async (req, res) => {
    try {
        // Extract username and password from request body
        const { username, password } = req.body;

        // Find customer by username
        const customer = await Customer.findOne({ username });
        if (!customer) return res.status(401).json({ ok: false, error: "invalid credentials" });

        // Compare provided password with stored hash
        const ok = await bcrypt.compare(password, customer.passwordHash);
        if (!ok) return res.status(401).json({ ok: false, error: "invalid credentials" });

        // Update last login time
        customer.lastLoginAt = new Date();
        await customer.save();

        // Generate JWT token
        const token = jwt.sign(
            { username: customer.username },
            process.env.JWT_SECRET,
            { subject: String(customer._id), expiresIn: "7d" }
        );
        // Respond with token and customer info
        res.json({ ok: true, token, customer: { id: customer._id, username: customer.username } });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Export the router
module.exports = router;