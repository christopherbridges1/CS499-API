const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true, collection: "customers" }
);

module.exports = mongoose.model("Customer", CustomerSchema);