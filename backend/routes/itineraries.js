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

// POST - Create a new itinerary with day items
router.post("/", async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { title, destinations, preferences, days, itinerary } = req.body;

    if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
      return res.status(400).json({ error: "Itinerary items are required" });
    }

    await client.query('BEGIN');

    // Create the itinerary (only using columns that exist)
    const itineraryTitle = title || `Trip to ${destinations?.join(", ") || "Unknown"}`;
    const { rows: [newItinerary] } = await client.query(
      `INSERT INTO itineraries (title)
       VALUES ($1)
       RETURNING *`,
      [itineraryTitle]
    );

    // Create itinerary items (one per day) using existing schema
    // Store day title and content in notes field as JSON
    const itemPromises = itinerary.map((day, index) =>
      client.query(
        `INSERT INTO itinerary_items (itinerary_id, day, position, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          newItinerary.id,
          index + 1,
          index,
          JSON.stringify({
            title: day.title || `Day ${index + 1}`,
            content: day.content || "",
            destinations: destinations || [],
            preferences: preferences || []
          })
        ]
      )
    );

    const itemResults = await Promise.all(itemPromises);
    const items = itemResults.map(r => r.rows[0]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      itinerary: newItinerary,
      items: items
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("POST /api/itineraries error:", err);
    res.status(500).json({ error: "Failed to save itinerary" });
  } finally {
    client.release();
  }
});

// GET all itineraries (for listing)
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM itineraries ORDER BY created_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/itineraries error:", err);
    res.status(500).json({ error: "Failed to fetch itineraries" });
  }
});

// DELETE an itinerary and its items
router.delete("/:itineraryId", async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { itineraryId } = req.params;

    await client.query('BEGIN');

    // Delete itinerary items first (foreign key constraint)
    await client.query(
      'DELETE FROM itinerary_items WHERE itinerary_id = $1',
      [itineraryId]
    );

    // Delete the itinerary
    const { rows } = await client.query(
      'DELETE FROM itineraries WHERE id = $1 RETURNING *',
      [itineraryId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Itinerary not found" });
    }

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: "Itinerary deleted successfully",
      deleted: rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("DELETE /api/itineraries/:id error:", err);
    res.status(500).json({ error: "Failed to delete itinerary" });
  } finally {
    client.release();
  }
});

export default router;
