// server/routes/events.js
import express from "express";
import Event from "../models/Event.js";
import { syncTicketmasterEvents } from "../controllers/eventController.js";

const router = express.Router();

/**
 * GET /api/events/sync-ticketmaster
 *
 * Manually trigger a sync from Ticketmaster → MongoDB.
 * After calling this, /api/events will return those concerts.
 */
router.get("/sync-ticketmaster", syncTicketmasterEvents);

/**
 * GET /api/events
 * Query: artist, genre (multi), page, limit
 *
 * This is what your ConcertsPage uses for search + filter + pagination.
 */
router.get("/", async (req, res) => {
  try {
    const { artist, genre, page = 1, limit = 5 } = req.query;

    const query = {};

    // artist subset + case-insensitive search
    if (artist && artist.trim() !== "") {
      query.artist = { $regex: artist.trim(), $options: "i" };
    }

    // genre multi-select: genre can be string or array of strings
    if (genre) {
      const genres = Array.isArray(genre) ? genre : [genre];
      query.genre = { $in: genres };
    }

    const pageNum = Number(page) || 1;
    const perPage = Number(limit) || 5;
    const skip = (pageNum - 1) * perPage;

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ date: 1 }) // soonest concerts first
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

/**
 * GET /api/events/genres
 * Returns distinct list of genres from Event collection
 */
router.get("/genres", async (req, res) => {
  try {
    let genres = await Event.distinct("genre");

    // remove empty / null
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
