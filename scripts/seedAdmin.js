// Script to create an admin user in the database.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Run the seed script
(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Get admin credentials from env or use defaults
        const username = process.env.ADMIN_USERNAME || "admin";
        const password = process.env.ADMIN_PASSWORD || "admin1!!";

        // Check if admin user already exists
        const existing = await User.findOne({ username, role: "admin" });
        // If exists, exit
        if (existing) {
            console.log("ℹ️ Admin already exists:", username);
            process.exit(0);
        }

        // *** Create new admin user ***
        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);
        // Save new admin user to database
        await User.create({ username, passwordHash, role: "admin" });

        // Log success and exit
        console.log(`✅ Admin created: ${username} / ${password}`);
        process.exit(0);
    } catch (e) {
        // Log error and exit with failure
        console.error("❌ Seed failed:", e.message);
        process.exit(1);
    }
})();