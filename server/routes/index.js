import express from "express";
import authRoutes from "./auth.js";
import eventsRoutes from "./events.js";

const router = express.Router();

// health check
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// auth routes: /api/auth/...
router.use("/auth", authRoutes);

// events routes: /api/events/...
router.use("/events", eventsRoutes);

export default router;
