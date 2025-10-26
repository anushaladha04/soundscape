import express from "express";
import authRoutes from "./auth.js";
import postsRoutes from "./posts.js";
import eventRoutes from "./events.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/posts", postsRoutes);
router.use("/events", eventRoutes);

export default router;
