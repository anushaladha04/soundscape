import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  const uri = config.mongoUri;

  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};


