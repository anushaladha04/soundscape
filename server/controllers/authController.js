import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { config } from "../config.js";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: "7d" });
};

const googleClient = new OAuth2Client(config.googleClientId);

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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

    const user = await User.findById(userId).select("_id name email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const googleAuth = async (req, res) => {
  console.log("Google auth endpoint hit, body:", req.body);
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
      user = await User.create({
        name: name || email,
        email,
        googleId: sub,
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
      },
      token,
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    return res.status(500).json({ message: "Failed to sign in with Google", error: err.message });
  }
};


