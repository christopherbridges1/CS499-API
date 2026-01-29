// Admin user model definition for MongoDB
const mongoose = require("mongoose");

// Define the Admin user schema
const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true, index: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ["admin"], default: "admin" }
    },
    // Timestamps and collection name
    { timestamps: true, collection: "users" }
);

// Create and export the Admin user model
module.exports = mongoose.model("User", UserSchema);