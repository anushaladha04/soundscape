import express from "express";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  googleAuth,
  updatePreferences,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  updateEmail,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);
router.get("/me", requireAuth, getCurrentUser);
router.put("/preferences", requireAuth, updatePreferences);
router.put("/email", requireAuth, updateEmail);

export default router;


