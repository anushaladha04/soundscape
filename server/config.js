// server/config.js
import dotenv from "dotenv";

dotenv.config(); // loads server/.env

export const config = {
  port: process.env.PORT || 5050,
  mongoUri: process.env.MONGODB_URI,      // 👈 VERY IMPORTANT
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
};