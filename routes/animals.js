// Express router for managing animal records
const express = require("express");
const Animal = require("../models/Animal");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();

// GET /api/animals - public list
router.get("/", async (req, res) => {
    try {
        // Retrieve all animals, sorted by creation date descending
        const animals = await Animal.find().sort({ createdAt: -1 }).lean();
        res.json({ ok: true, animals });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});

// GET /api/animals/:id - public detail
router.get("/:id", async (req, res) => {
    try {
        // Retrieve animal by ID
        const animal = await Animal.findById(req.params.id).lean();
        if (!animal) return res.status(404).json({ ok: false, error: "not found" });
        res.json({ ok: true, animal });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});

// POST /api/animals - Admin create
router.post("/", requireAdmin, async (req, res) => {
    // Create a new animal record
    try {
        const {
            name,
            breed,
            sex,
            ageWeeks,
            rescueType,
            status,
            description,
            location
        } = req.body || {};

        // Validate required fields
        if (!name?.trim() || !breed?.trim()) {
            return res.status(400).json({ ok: false, error: "name and breed are required" });
        }

        // Build the animal document
        const doc = {
            name: name.trim(),
            breed: breed.trim(),
            sex: sex ? String(sex).trim() : undefined,
            ageWeeks: ageWeeks === undefined || ageWeeks === null ? undefined : Number(ageWeeks),
            rescueType: rescueType ? String(rescueType).trim() : undefined,
            status: status ? String(status).trim() : "Available",
            description: description ? String(description).trim() : undefined
        };

        // GeoJSON point: coordinates [longitude, latitude]
        // Validate and normalize location if provided
        if (location?.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
            const lng = Number(location.coordinates[0]);
            const lat = Number(location.coordinates[1]);
            // Only set location if valid numbers
            if (Number.isFinite(lng) && Number.isFinite(lat)) {
                doc.location = { type: "Point", coordinates: [lng, lat] };
            }
        }

        // Create the animal record in the database
        const created = await Animal.create(doc);
        res.status(201).json({ ok: true, animal: created });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});

// PUT /api/animals/:id - Admin update
router.put("/:id", requireAdmin, async (req, res) => {
    // Update an existing animal record
    try {
        const patch = { ...(req.body || {}) };

        // trim string fields if present
        if (typeof patch.name === "string") patch.name = patch.name.trim();
        if (typeof patch.breed === "string") patch.breed = patch.breed.trim();
        if (typeof patch.sex === "string") patch.sex = patch.sex.trim();
        if (typeof patch.rescueType === "string") patch.rescueType = patch.rescueType.trim();
        if (typeof patch.status === "string") patch.status = patch.status.trim();
        if (typeof patch.description === "string") patch.description = patch.description.trim();

        // normalize ageWeeks if present
        if (patch.ageWeeks !== undefined && patch.ageWeeks !== null) patch.ageWeeks = Number(patch.ageWeeks);

        // normalize location if present
        if (patch.location?.coordinates && Array.isArray(patch.location.coordinates) && patch.location.coordinates.length === 2) {
            const lng = Number(patch.location.coordinates[0]);
            const lat = Number(patch.location.coordinates[1]);
            // Only set location if valid numbers
            if (Number.isFinite(lng) && Number.isFinite(lat)) {
                patch.location = { type: "Point", coordinates: [lng, lat] };
            } else {
                delete patch.location;
            }
        }

        // Update the animal record in the database
        const updated = await Animal.findByIdAndUpdate(req.params.id, patch, {
            new: true,
            runValidators: true
        });

        // Handle not found
        if (!updated) return res.status(404).json({ ok: false, error: "not found" });
        res.json({ ok: true, animal: updated });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});

// DELETE /api/animals/:id - Admin delete
router.delete("/:id", requireAdmin, async (req, res) => {
    // Delete an animal record
    try {
        const deleted = await Animal.findByIdAndDelete(req.params.id);
        // Handle not found
        if (!deleted) return res.status(404).json({ ok: false, error: "not found" });
        res.json({ ok: true });
    } catch (e) {
        // Handle errors
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Export the router
module.exports = router;