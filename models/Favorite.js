const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }
  },
  { timestamps: true, collection: "favorites" }
);

// prevent duplicates
FavoriteSchema.index({ customerId: 1, animalId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", FavoriteSchema);