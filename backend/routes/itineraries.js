import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET itinerary with all destinations that have items in it
router.get("/:itineraryId/destinations", async (req, res) => {
  try {
    const { itineraryId } = req.params;

    // Return all destinations, marking which ones are part of this itinerary
    // This lets the frontend show every destination and highlight those already in the itinerary
    const { rows: destinations } = await pool.query(
      `SELECT
        d.id,
        d.name,
        d.description,
        d.latitude,
        d.longitude,
        d.image_url,
        d.created_at,
        CASE WHEN EXISTS (
          SELECT 1 FROM itinerary_items ii WHERE ii.destination_id = d.id AND ii.itinerary_id = $1
        ) THEN true ELSE false END as in_itinerary
      FROM destinations d
      ORDER BY d.name ASC`,
      [itineraryId]
    );

    res.json(destinations);
  } catch (err) {
    console.error("GET /api/itineraries/:id/destinations error:", err);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

// GET itinerary details
router.get("/:itineraryId", async (req, res) => {
  try {
    const { itineraryId } = req.params;

    const { rows } = await pool.query(
      "SELECT * FROM itineraries WHERE id = $1",
      [itineraryId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/itineraries/:id error:", err);
    res.status(500).json({ error: "Failed to fetch itinerary" });
  }
});

export default router;
