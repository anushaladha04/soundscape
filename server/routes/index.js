import express from "express";
import authRoutes from "./auth.js";
import postsRoutes from "./posts.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/posts", postsRoutes);

export default router;
