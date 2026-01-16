import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import destinationsRouter from "./routes/destinations.js";
import itineraryItemsRouter from "./routes/itineraryItems.js";
import itinerariesRouter from "./routes/itineraries.js";
import authRouter from "./routes/auth.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/destinations", destinationsRouter);
app.use("/api/itinerary-items", itineraryItemsRouter);
app.use("/api/itineraries", itinerariesRouter);
app.use("/api/auth", authRouter);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
