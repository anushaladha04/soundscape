// server/routes/events.js
import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// GET /api/events?artist=...&genre=Rock&genre=Pop&page=1&limit=5
router.get("/", async (req, res) => {
  try {
    const { artist, page = 1, limit = 5, genre } = req.query;

    const query = {};

    // artist substring search
    if (artist && artist.trim() !== "") {
      query.artist = { $regex: artist.trim(), $options: "i" };
    }

    // genre multi-select
    let genres = [];
    if (genre) {
      if (Array.isArray(genre)) {
        genres = genre;
      } else {
        genres = [genre];
      }
    }

    if (genres.length > 0) {
      query.genre = { $in: genres };
    }

    const pageNum = Number(page) || 1;
    const perPage = Number(limit) || 5;
    const skip = (pageNum - 1) * perPage;

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(perPage),
      Event.countDocuments(query),
    ]);

    res.json({
      events,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (err) {
    console.error("Error in GET /api/events:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/events/genres  ->  returns unique list of genres
router.get("/genres", async (req, res) => {
  try {
    // get all distinct non-null genres from Mongo
    let genres = await Event.distinct("genre");

    // remove empty strings / nulls just in case
    genres = genres.filter((g) => g && g.trim() !== "");

    // sort alphabetically
    genres.sort((a, b) => a.localeCompare(b));

    res.json({ genres });
  } catch (err) {
    console.error("Error in GET /api/events/genres:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
