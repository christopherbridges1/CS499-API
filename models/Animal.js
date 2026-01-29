// Mongoose schema and model for an animal rescue application
const mongoose = require("mongoose");

// Define the Animal schema
const AnimalSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        breed: { type: String, required: true, index: true, trim: true },
        sex: { type: String, trim: true }, // Male or Female
        ageWeeks: { type: Number, min: 0 },
        rescueType: { type: String, trim: true, index: true }, // Water, Mountain, Disaster
        status: { type: String, trim: true, default: "Available", index: true },
        description: { type: String, trim: true },
        location: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: undefined } // Longitude, Latitude
        }
    },
    // Timestamps and collection name
    { timestamps: true, collection: "animals" }
);

// Create and export the Animal model
module.exports = mongoose.model("Animal", AnimalSchema);