import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5050,
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-prod",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};

