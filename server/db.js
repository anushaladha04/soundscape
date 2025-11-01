// server/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();  // ✅ loads .env from server/.env

const uri = process.env.MONGODB_URI;

export const connectDB = async () => {
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
    process.exit(1);
  }
};
