// Mongoose schema and model for Customer 
const mongoose = require("mongoose");

// Define the Customer schema
const CustomerSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        lastLoginAt: { type: Date, default: null }
    },
    // Timestamps and collection name
    { timestamps: true, collection: "customers" }
);

// Create and export the Customer model
module.exports = mongoose.model("Customer", CustomerSchema);