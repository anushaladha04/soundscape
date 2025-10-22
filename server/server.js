import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("connected");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

