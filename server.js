import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load variables from .env

const app = express();
app.use(cors());
app.use(express.json()); // for JSON requests
// #region agent log
app.use((req, res, next) => {
  if (req.path === '/api/destinations' && req.method === 'POST') {
    fetch('http://127.0.0.1:7242/ingest/345509ce-d467-4c32-92a2-12730e6e6fef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:10',message:'Middleware: POST /api/destinations request received',data:{method:req.method,path:req.path,headers:Object.keys(req.headers)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }
  next();
});
// #endregion

// Postgres pool
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  // support both DB_NAME and DB_DATABASE env names (project uses DB_DATABASE in .env)
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test DB connection
pool.connect((err) => {
  if (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/345509ce-d467-4c32-92a2-12730e6e6fef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:33',message:'Database connection error during pool.connect',data:{errorMessage:err?.message,errorCode:err?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'DB'})}).catch(()=>{});
    // #endregion
    console.error("Database connection error:", err && err.stack ? err.stack : err);
  } else {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/345509ce-d467-4c32-92a2-12730e6e6fef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:36',message:'Database pool connection successful',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'DB'})}).catch(()=>{});
    // #endregion
    console.log("Connected to Postgres!");
  }
});



// Example route to get destinations
app.get("/api/destinations", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM destinations ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

// Create a new destination
app.post('/api/destinations', async (req, res) => {
  try {
    const { name, description, latitude, longitude, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/345509ce-d467-4c32-92a2-12730e6e6fef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:63',message:'About to execute database INSERT query',data:{name,hasDescription:!!description,hasCoordinates:!!(latitude&&longitude)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'DB'})}).catch(()=>{});
    // #endregion

    const result = await pool.query(
      `INSERT INTO destinations (name, description, latitude, longitude, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description || null, latitude || null, longitude || null, image_url || null]
    );

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/345509ce-d467-4c32-92a2-12730e6e6fef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:69',message:'Database INSERT successful',data:{insertedId:result.rows[0]?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'DB'})}).catch(()=>{});
    // #endregion

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/345509ce-d467-4c32-92a2-12730e6e6fef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:71',message:'Database INSERT error caught',data:{errorMessage:err?.message,errorCode:err?.code,errorStack:err?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'DB'})}).catch(()=>{});
    // #endregion
    console.error('Failed to insert destination:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to save destination' });
  }
});

// Root route: helpful message so visiting / in a browser isn't a 404
app.get('/', (req, res) => {
  res.send('<h2>Travel Planner API</h2><p>Try <a href="/api/destinations">/api/destinations</a> to list seeded destinations.</p>');
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/345509ce-d467-4c32-92a2-12730e6e6fef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:72',message:'Root server.js started',data:{port:PORT,routesRegistered:['GET /api/destinations','POST /api/destinations']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
});
