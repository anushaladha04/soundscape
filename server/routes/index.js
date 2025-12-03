import express from "express";
import authRoutes from "./auth.js";
import eventRoutes from "./events.js";
import { getRecommendedEvents } from "../controllers/recommendationsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.get("/events/recommendations", requireAuth, getRecommendedEvents);

export default router;
