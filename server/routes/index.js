// server/routes/index.js
import express from "express";
import authRoutes from "./auth.js";
import eventsRoutes from "./events.js";
import bookmarksRoutes from "./bookmarks.js";

const router = express.Router();

// health check
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// auth routes: /api/auth/...
router.use("/auth", authRoutes);

// event routes: /api/events/...
router.use("/events", eventsRoutes);

// bookmark routes: /api/bookmarks/...
router.use("/bookmarks", bookmarksRoutes);

export default router;
