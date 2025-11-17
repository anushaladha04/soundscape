import express from "express";
import {
  getRecommendations,
  updateGenrePreferences,
} from "../controllers/recommendationsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get personalized recommendations (requires auth)
router.get("/", requireAuth, getRecommendations);

// Update user's genre preferences (requires auth)
router.put("/preferences", requireAuth, updateGenrePreferences);

export default router;

