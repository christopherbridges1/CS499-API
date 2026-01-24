const express = require("express");
const Animal = require("../models/Animal");

const router = express.Router();

// GET /api/animals
router.get("/", async (req, res) => {
  try {
    const { breed, rescueType, status, q } = req.query;
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);

    const filter = {};
    if (breed) filter.breed = breed;
    if (rescueType) filter.rescueType = rescueType;
    if (status) filter.status = status;

    if (q) {
      const regex = new RegExp(String(q), "i");
      filter.$or = [{ name: regex }, { breed: regex }, { description: regex }];
    }

    const animals = await Animal.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json({ ok: true, animals });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/animals/:id
router.get("/:id", async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, animal });
  } catch (e) {
    res.status(400).json({ ok: false, error: "Invalid id" });
  }
});

// POST /api/animals 
router.post("/", async (req, res) => {
  try {
    const created = await Animal.create(req.body);
    res.status(201).json({ ok: true, animal: created });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

module.exports = router;