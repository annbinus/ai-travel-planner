import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET itinerary items by destination_id
// Returns itinerary items with their itinerary details, organized by day
router.get("/", async (req, res) => {
  try {
    const { destination_id } = req.query;

    if (!destination_id) {
      return res.status(400).json({ error: "destination_id is required" });
    }

    // Get itinerary items with itinerary details
    const { rows } = await pool.query(
      `SELECT 
        ii.id,
        ii.itinerary_id,
        ii.destination_id,
        ii.day,
        ii.position,
        ii.notes,
        i.title as itinerary_title,
        i.user_id,
        i.created_at as itinerary_created_at
      FROM itinerary_items ii
      JOIN itineraries i ON ii.itinerary_id = i.id
      WHERE ii.destination_id = $1
      ORDER BY ii.day ASC, ii.position ASC`,
      [destination_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/itinerary-items error:", err);
    res.status(500).json({ error: "Failed to fetch itinerary items" });
  }
});

// POST create a new itinerary item
router.post("/", async (req, res) => {
  try {
    const { itinerary_id, destination_id, day, position, notes } = req.body;

    if (!itinerary_id || !destination_id) {
      return res.status(400).json({ error: "itinerary_id and destination_id are required" });
    }

    const result = await pool.query(
      `INSERT INTO itinerary_items (itinerary_id, destination_id, day, position, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        itinerary_id,
        destination_id,
        day || null,
        position || null,
        notes || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/itinerary-items error:", err);
    res.status(500).json({ error: err.message || "Failed to save itinerary item" });
  }
});

export default router;
