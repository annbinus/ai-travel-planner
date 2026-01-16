import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// POST /api/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Check if user exists
    const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
      [name, email, hashed]
    );

    const user = rows[0];
    res.status(201).json({ user });
  } catch (err) {
    console.error("POST /api/register error:", err);
    res.status(500).json({ error: "Failed to register" });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { rows } = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return user without password
    const safeUser = { id: user.id, name: user.name, email: user.email };
    res.json({ user: safeUser });
  } catch (err) {
    console.error("POST /api/login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

export default router;
