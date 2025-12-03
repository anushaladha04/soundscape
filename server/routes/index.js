import express from "express";
import authRoutes from "./auth.js";
<<<<<<< HEAD
import eventRoutes from "./events.js";
=======
import { getRecommendedEvents } from "../controllers/recommendationsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
>>>>>>> anusha/auth

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
<<<<<<< HEAD
router.use("/events", eventRoutes);
=======
router.get("/events/recommendations", requireAuth, getRecommendedEvents);
>>>>>>> anusha/auth

export default router;
