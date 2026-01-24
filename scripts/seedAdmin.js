require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const username = process.env.ADMIN_USERNAME || "admin";
        const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

        const existing = await User.findOne({ username, role: "admin" });
        if (existing) {
            console.log("ℹ️ Admin already exists:", username);
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await User.create({ username, passwordHash, role: "admin" });

        console.log(`✅ Admin created: ${username} / ${password}`);
        process.exit(0);
    } catch (e) {
        console.error("❌ Seed failed:", e.message);
        process.exit(1);
    }
})();