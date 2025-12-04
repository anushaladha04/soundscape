// server/config.js
import dotenv from "dotenv";

dotenv.config(); // loads server/.env

export const config = {
  port: process.env.PORT || 5050,
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-prod",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  ticketmasterApiKey: process.env.TICKETMASTER_API_KEY || "",
};
