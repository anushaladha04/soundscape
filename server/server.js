import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import apiRoutes from "./routes/index.js";
import "./config.js"; // Loads dotenv

const app = express();

// Allow frontend (Vite dev server) to send cookies/auth to this API
app.use(
  cors({
    origin: "http://localhost:5173",
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

