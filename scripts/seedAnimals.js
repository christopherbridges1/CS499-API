// Seed script to populate the database with animal data
require("dotenv").config();
const mongoose = require("mongoose");
const Animal = require("../models/Animal");

// Sample animal data to be inserted into the database
const animals = [
    {
        name: "Buddy",
        breed: "Labrador Retriever",
        sex: "Male",
        ageWeeks: 52,
        rescueType: "Water",
        status: "Available",
        description: "Friendly, loyal, and great with families.",
        location: { type: "Point", coordinates: [-97.7431, 30.2672] }
    },
    {
        name: "Luna",
        breed: "German Shepherd",
        sex: "Female",
        ageWeeks: 64,
        rescueType: "Mountain",
        status: "Available",
        description: "Smart, alert, and highly trainable.",
        location: { type: "Point", coordinates: [-95.3698, 29.7604] }
    },
    {
        name: "Max",
        breed: "Mixed",
        sex: "Male",
        ageWeeks: 40,
        rescueType: "Disaster",
        status: "Transfer",
        description: "Calm temperament and easygoing personality.",
        location: { type: "Point", coordinates: [-96.7970, 32.7767] }
    },
    {
        name: "Bella",
        breed: "Golden Retriever",
        sex: "Female",
        ageWeeks: 48,
        rescueType: "Water",
        status: "Available",
        description: "Gentle, affectionate, and loves kids.",
        location: { type: "Point", coordinates: [-118.2437, 34.0522] }
    },
    {
        name: "Charlie",
        breed: "Beagle",
        sex: "Male",
        ageWeeks: 36,
        rescueType: "Disaster",
        status: "Available",
        description: "Curious nose and a playful spirit.",
        location: { type: "Point", coordinates: [-84.3880, 33.7490] }
    },
    {
        name: "Daisy",
        breed: "Australian Shepherd",
        sex: "Female",
        ageWeeks: 44,
        rescueType: "Mountain",
        status: "Available",
        description: "Energetic and loves outdoor adventures.",
        location: { type: "Point", coordinates: [-104.9903, 39.7392] }
    },
    {
        name: "Rocky",
        breed: "Boxer",
        sex: "Male",
        ageWeeks: 60,
        rescueType: "Disaster",
        status: "Transfer",
        description: "Strong, playful, and very loyal.",
        location: { type: "Point", coordinates: [-80.1918, 25.7617] }
    },
    {
        name: "Sadie",
        breed: "Border Collie",
        sex: "Female",
        ageWeeks: 32,
        rescueType: "Mountain",
        status: "Available",
        description: "Extremely intelligent and eager to work.",
        location: { type: "Point", coordinates: [-111.8910, 40.7608] }
    },
    {
        name: "Cooper",
        breed: "Corgi",
        sex: "Male",
        ageWeeks: 28,
        rescueType: "Disaster",
        status: "Available",
        description: "Short legs, big personality.",
        location: { type: "Point", coordinates: [-122.4194, 37.7749] }
    },
    {
        name: "Molly",
        breed: "Poodle",
        sex: "Female",
        ageWeeks: 56,
        rescueType: "Water",
        status: "Available",
        description: "Hypoallergenic coat and very smart.",
        location: { type: "Point", coordinates: [-71.0589, 42.3601] }
    },
    {
        name: "Tucker",
        breed: "Husky",
        sex: "Male",
        ageWeeks: 72,
        rescueType: "Mountain",
        status: "Transfer",
        description: "Vocal, energetic, and loves the cold.",
        location: { type: "Point", coordinates: [-149.9003, 61.2181] }
    },
    {
        name: "Lucy",
        breed: "Dachshund",
        sex: "Female",
        ageWeeks: 24,
        rescueType: "Disaster",
        status: "Available",
        description: "Small body, big attitude.",
        location: { type: "Point", coordinates: [-90.0715, 29.9511] }
    },
    {
        name: "Bear",
        breed: "Rottweiler",
        sex: "Male",
        ageWeeks: 80,
        rescueType: "Disaster",
        status: "Available",
        description: "Protective, confident, and calm.",
        location: { type: "Point", coordinates: [-112.0740, 33.4484] }
    },
    {
        name: "Zoey",
        breed: "Shih Tzu",
        sex: "Female",
        ageWeeks: 20,
        rescueType: "Water",
        status: "Available",
        description: "Sweet lap dog with a loving nature.",
        location: { type: "Point", coordinates: [-73.9352, 40.7306] }
    },
    {
        name: "Finn",
        breed: "Doberman Pinscher",
        sex: "Male",
        ageWeeks: 68,
        rescueType: "Disaster",
        status: "Transfer",
        description: "Athletic, alert, and very loyal.",
        location: { type: "Point", coordinates: [-87.6298, 41.8781] }
    }
];

// Main function to run the seed script
async function run() {
    if (!process.env.MONGODB_URI) {
        throw new Error("❌ Missing MONGODB_URI in .env");
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "cs499-cbridges-database",

        // Deletes entries
        // await Animal.deleteMany({});

        // Insert sample animals
        const result = await Animal.insertMany(animals);
        console.log(`✅ Inserted ${result.length} animals`);

        // Disconnect from the database
        await mongoose.disconnect();
    }
      // Execute the seed script
run().catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    });
