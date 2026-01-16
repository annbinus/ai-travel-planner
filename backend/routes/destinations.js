import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET all destinations
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM destinations ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/destinations error:", err);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

// POST create a new destination
router.post("/", async (req, res) => {
  try {
    const { name, description, latitude, longitude, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await pool.query(
      `INSERT INTO destinations (name, description, latitude, longitude, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, latitude || null, longitude || null, image_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/destinations error:", err);
    res.status(500).json({ error: err.message || "Failed to save destination" });
  }
});

export default router;
