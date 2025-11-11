// server/routes/index.js
import express from "express";
import authRoutes from "./auth.js";
import eventRoutes from "./events.js";
import bookmarksRoutes from "./bookmarks.js";
import { getRecommendedEvents } from "../controllers/recommendationsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// health check
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// auth routes: /api/auth/...
router.use("/auth", authRoutes);

// event routes: /api/events/...
router.use("/events", eventRoutes);
router.get("/events/recommendations", requireAuth, getRecommendedEvents);

// bookmark routes: /api/bookmarks/...
router.use("/bookmarks", bookmarksRoutes);

export default router;
