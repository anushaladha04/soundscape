// server/routes/events.js
import express from "express";
import Event from "../models/Event.js";
import { syncTicketmasterEvents, searchTicketmasterDirectly } from "../controllers/eventController.js";

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

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const queryConditions = [
      { date: { $gte: now } },
      {
        $or: [
          { city: { $regex: /los angeles/i } },
          { 
            city: { $exists: false },
            venue: { $regex: /los angeles|la|hollywood|beverly hills/i }
          }
        ]
      }
    ];

    if (artist && artist.trim() !== "") {
      const searchTerm = artist.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      queryConditions.push({
        $or: [
          { artist: { $regex: searchTerm, $options: "i" } },
          { venue: { $regex: searchTerm, $options: "i" } }
        ]
      });
    }

    const query = { $and: queryConditions };

    if (genre) {
      const genres = Array.isArray(genre) ? genre : [genre];
      queryConditions.push({ genre: { $in: genres } });
    }

    const pageNum = Number(page) || 1;
    const perPage = Number(limit) || 5;
    const skip = (pageNum - 1) * perPage;

    const allMatchingEvents = await Event.find(query)
      .sort({ date: 1 })
      .limit(1000);

    let total = allMatchingEvents.length;
    let events = allMatchingEvents.slice(skip, skip + perPage);
    let fromTicketmaster = false;

    // Hybrid approach: If no results in DB and user searched, search Ticketmaster directly
    if (total === 0 && artist && artist.trim() !== "") {
      try {
        const tmEvents = await searchTicketmasterDirectly(artist.trim(), 100);
        
        if (tmEvents.length > 0) {
          // Save to DB for future searches (async)
          Event.bulkWrite(
            tmEvents.map((doc) => ({
              updateOne: {
                filter: { ticketmaster_id: doc.ticketmaster_id },
                update: { $set: doc },
                upsert: true,
              },
            })),
            { ordered: false }
          ).catch(err => console.error("Error saving TM results to DB:", err));

          total = tmEvents.length;
          events = tmEvents.slice(skip, skip + perPage);
          fromTicketmaster = true;
        }
      } catch (tmError) {
        console.error("Error searching Ticketmaster:", tmError);
      }
    }

    res.json({
      events,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / perPage),
      fromTicketmaster, // Flag to show these came from live search
    });
  } catch (err) {
    console.error("Error in GET /api/events:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/events/debug
 * Debug endpoint to see what's in the database
 */
router.get("/debug", async (req, res) => {
  try {
    const total = await Event.countDocuments({});
    const sample = await Event.find({}).limit(5);
    const laEvents = await Event.countDocuments({ city: { $regex: /los angeles/i } });
    const futureEvents = await Event.countDocuments({ date: { $gte: new Date() } });
    
    // Check if "Pink Skies" exists
    const pinkSkies = await Event.find({
      $or: [
        { artist: { $regex: /pink skies/i } },
        { venue: { $regex: /pink skies/i } }
      ]
    });
    
    res.json({
      totalEvents: total,
      laEvents,
      futureEvents,
      pinkSkiesFound: pinkSkies.length,
      pinkSkiesEvents: pinkSkies.map(e => ({
        artist: e.artist,
        city: e.city,
        date: e.date,
        venue: e.venue
      })),
      sampleEvents: sample.map(e => ({
        artist: e.artist,
        city: e.city,
        date: e.date,
        venue: e.venue
      }))
    });
  } catch (err) {
    console.error("Error in debug endpoint:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/events/genres
 * Returns distinct list of genres from Event collection (Los Angeles only)
 */
router.get("/genres", async (req, res) => {
  try {
    // Only get genres from Los Angeles events
    let genres = await Event.distinct("genre", {
      city: { $regex: /los angeles/i },
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

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
