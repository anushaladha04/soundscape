import "./config.js"; // Load environment variables first
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Allow frontend (local dev + production Render)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length === 1
      ? allowedOrigins[0]
      : (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Soundscape backend is running");
});

app.use("/api", apiRoutes);

const port = process.env.PORT || 5050;

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
};

startServer();

