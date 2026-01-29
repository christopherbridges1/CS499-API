// Schema and model for managing customer favorite animals 
const mongoose = require("mongoose");

// Define the Favorite schema
const FavoriteSchema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        animalId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }
    },
    // Timestamps and collection name
    { timestamps: true, collection: "favorites" }
);

// Prevents duplicates
FavoriteSchema.index({ customerId: 1, animalId: 1 }, { unique: true });

// Create and export the Favorite model
module.exports = mongoose.model("Favorite", FavoriteSchema);