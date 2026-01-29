// Routes for managing favorite animals.
const express = require("express");
const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");
const Animal = require("../models/Animal");
const { authCustomer } = require("../middleware/authCustomer");

const router = express.Router();

// GET /api/favorites
router.get("/", authCustomer, async (req, res) => {
    try {
        // Get the customer ID from the authenticated request
        const customerId = mongoose.Types.ObjectId(req.customer.id);

        // Find all favorite animal IDs for the customer
        const favs = await Favorite.find({ customerId }).select("animalId").lean();
        const ids = favs.map(f => f.animalId);
        // Retrieve the animal details for the favorite IDs
        const animals = await Animal.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
        res.json({ ok: true, animals });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});

// POST /api/favorites/:animalId
router.post("/:animalId", authCustomer, async (req, res) => {
    try {
        // Get the customer ID and animal ID
        const customerId = mongoose.Types.ObjectId(req.customer.id);
        const animalId = mongoose.Types.ObjectId(req.params.animalId);

        // Add the favorite
        await Favorite.updateOne(
            { customerId, animalId },
            { $setOnInsert: { customerId, animalId } },
            { upsert: true }
        );

        // Respond with success
        res.status(201).json({ ok: true });
    } catch (e) {
        // Handle invalid IDs
        res.status(400).json({ ok: false, error: "Invalid id" });
    }
});

// DELETE /api/favorites/:animalId
router.delete("/:animalId", authCustomer, async (req, res) => {
    try {
        // Get the customer ID and animal ID
        const customerId = mongoose.Types.ObjectId(req.customer.id);
        const animalId = mongoose.Types.ObjectId(req.params.animalId);

        // Remove the favorite
        await Favorite.deleteOne({ customerId, animalId });
        res.json({ ok: true });
    } catch (e) {
        // Handle invalid IDs
        res.status(400).json({ ok: false, error: "Invalid id" });
    }
});

// Export the router
module.exports = router;