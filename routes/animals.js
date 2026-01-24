const express = require("express");
const Animal = require("../models/Animal");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();

// GET /api/animals  (public list)
router.get("/", async (req, res) => {
  try {
    const animals = await Animal.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, animals });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/animals/:id  (public detail)
router.get("/:id", async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).lean();
    if (!animal) return res.status(404).json({ ok: false, error: "not found" });
    res.json({ ok: true, animal });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/animals  (admin create)
router.post("/", requireAdmin, async (req, res) => {
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

    if (!name?.trim() || !breed?.trim()) {
      return res.status(400).json({ ok: false, error: "name and breed are required" });
    }

    const doc = {
      name: name.trim(),
      breed: breed.trim(),
      sex: sex ? String(sex).trim() : undefined,
      ageWeeks: ageWeeks === undefined || ageWeeks === null ? undefined : Number(ageWeeks),
      rescueType: rescueType ? String(rescueType).trim() : undefined,
      status: status ? String(status).trim() : "Available",
      description: description ? String(description).trim() : undefined
    };

    // Optional GeoJSON point: { coordinates: [lng, lat] }
    if (location?.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      const lng = Number(location.coordinates[0]);
      const lat = Number(location.coordinates[1]);
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        doc.location = { type: "Point", coordinates: [lng, lat] };
      }
    }

    const created = await Animal.create(doc);
    res.status(201).json({ ok: true, animal: created });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PUT /api/animals/:id  (admin update)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const patch = { ...(req.body || {}) };

    // normalize strings if present
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
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        patch.location = { type: "Point", coordinates: [lng, lat] };
      } else {
        delete patch.location;
      }
    }

    const updated = await Animal.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ ok: false, error: "not found" });
    res.json({ ok: true, animal: updated });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// DELETE /api/animals/:id  (admin delete)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Animal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ ok: false, error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;