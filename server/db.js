// server/db.js
import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  const uri = config.mongoUri;

  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  try {
    // Explicitly set database name to 'soundscape'
    await mongoose.connect(uri, {
      dbName: 'soundscape'
    });
    console.log("MongoDB connected to database: soundscape");
  } catch (err) {
    console.error("MongoDB error:", err);
    process.exit(1);
  }
};
