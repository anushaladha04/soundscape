import mongoose from "mongoose";
import { config } from "./config.js";

const uri = config.mongoUri;

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
