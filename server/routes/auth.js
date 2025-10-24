import express from "express";
import { loginUser, registerUser, getCurrentUser, googleAuth } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/me", requireAuth, getCurrentUser);

export default router;


