import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { config } from "../config.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: "7d" });
};

// Normalize and deduplicate genre labels across the app
const normalizeGenres = (genres = []) => {
  const mapped = genres.map((g) => (g === "Hip-Hop" ? "Hip-Hop/Rap" : g));
  return Array.from(new Set(mapped));
};

const googleClient = new OAuth2Client(config.googleClientId);

const getClientBaseUrl = () => {
  return config.clientBaseUrl || "http://localhost:5173";
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, genres = [] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      genres: normalizeGenres(genres),
      emailVerificationToken,
    });

    const token = createToken(user._id);

    const verifyUrl = `${getClientBaseUrl()}/verify-email?token=${emailVerificationToken}`;
    console.log(`Verification email for ${email}: ${verifyUrl}`);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        genres: user.genres || [],
        emailVerified: user.emailVerified,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to register user" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        genres: user.genres || [],
        emailVerified: user.emailVerified,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to log in" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(userId).select("_id name email genres emailVerified");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Do not reveal whether the email exists
      return res.json({
        message: "If that email exists, a reset link has been sent",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(expires);
    await user.save();

    const resetUrl = `${getClientBaseUrl()}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
      console.log(`✅ Password reset token generated for ${email}`);
    } catch (emailErr) {
      console.error("❌ Error sending password reset email:", emailErr.message);
      // Log the reset URL so user can still reset manually if needed
      console.warn(`⚠️  Manual reset link for ${email}: ${resetUrl}`);
      // Still respond generically so we don't leak email existence
    }

    return res.json({
      message: "If that email exists, a reset link has been sent",
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to request password reset" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = createToken(user._id);

    return res.json({
      message: "Password has been reset",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        genres: user.genres || [],
        emailVerified: user.emailVerified,
      },
      token: authToken,
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ 
      message: "Failed to reset password",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    if (!config.googleClientId) {
      return res.status(500).json({ message: "GOOGLE_CLIENT_ID is not configured" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create a secure random password so the required `password` field is satisfied,
      // while still encouraging users to log in via Google instead of password.
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name: name || email,
        email,
        googleId: sub,
        password: hashedPassword,
        genres: [],
        emailVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }

    const token = createToken(user._id);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        genres: user.genres || [],
        emailVerified: user.emailVerified,
      },
      token,
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    return res.status(500).json({ message: "Failed to sign in with Google", error: err.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const { genres = [] } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { genres: normalizeGenres(genres) },
      { new: true, select: "_id name email genres" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update preferences" });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { email } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.findByIdAndUpdate(
      userId,
      {
        email,
        emailVerified: false,
        emailVerificationToken,
      },
      { new: true }
    ).select("_id name email genres emailVerified");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verifyUrl = `${getClientBaseUrl()}/verify-email?token=${emailVerificationToken}`;
    console.log(`Verification email for ${email}: ${verifyUrl}`);

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update email" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Missing verification token" });
    }

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return res.json({ message: "Email successfully verified" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to verify email" });
  }
};

