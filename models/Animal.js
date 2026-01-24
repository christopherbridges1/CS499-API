const mongoose = require("mongoose");

const AnimalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    breed: { type: String, required: true, index: true, trim: true },
    sex: { type: String, trim: true },           // "Male" / "Female"
    ageWeeks: { type: Number, min: 0 },
    rescueType: { type: String, trim: true, index: true }, // "Water" / "Mountain" / "Disaster"
    status: { type: String, trim: true, default: "Available", index: true },
    description: { type: String, trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined } // [lng, lat]
    }
  },
  { timestamps: true, collection: "animals" }
);

module.exports = mongoose.model("Animal", AnimalSchema);