import fetch from "node-fetch";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { config } from "../config.js";
import { fetchTicketmasterEvents } from "../services/ticketmasterService.js";

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const buildKeywordFromGenres = (genres = []) => {
  if (!genres.length) return "music";
  return genres.join(",");
};

// Keep genre labels consistent across the app
const normalizeGenres = (genres = []) => {
  const mapped = genres.map((g) => (g === "Hip-Hop" ? "Hip-Hop/Rap" : g));
  return Array.from(new Set(mapped));
};

/**
 * Existing recommendations endpoint used by Home.jsx
 * GET /api/events/recommendations
 */
export const getRecommendedEvents = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const genres = Array.isArray(user.genres) ? normalizeGenres(user.genres) : [];
    if (!genres.length) {
      return res.status(400).json({ message: "No genre preferences set" });
    }

    if (!config.ticketmasterApiKey) {
      return res
        .status(500)
        .json({ message: "Ticketmaster API key is not configured" });
    }

    const params = new URLSearchParams({
      apikey: config.ticketmasterApiKey,
      classificationName: "music",
      keyword: buildKeywordFromGenres(genres),
      size: "5",
      sort: "date,asc",
    });

    const response = await fetch(`${TM_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      return res
        .status(502)
        .json({ message: "Failed to fetch recommendations from Ticketmaster" });
    }

    const data = await response.json();

    const events = (data?._embedded?.events || []).map((event) => {
      const image = event.images?.[0]?.url || "";
      const venue = event._embedded?.venues?.[0];
      const start = event.dates?.start;

      return {
        id: event.id,
        name: event.name,
        url: event.url,
        image,
        city: venue?.city?.name || "",
        venue: venue?.name || "",
        date: start?.localDate || "",
        time: start?.localTime || "",
      };
    });

    return res.json({ events });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch recommendations" });
  }
};

/**
 * Ishita's richer recommendations API used by the Recommendations UI
 * GET /api/recommendations
 */
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Fetch user to get genre preferences (reuse existing `genres` field)
    const user = await User.findById(userId).select("genres");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userGenres = Array.isArray(user.genres)
      ? normalizeGenres(user.genres)
      : [];
    if (userGenres.length === 0) {
      return res.status(200).json({
        recommendations: [],
        genres: [],
        message: "No genre preferences set. Please update your profile.",
      });
    }

    // Use existing events in Mongo (same source as Discover page)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseConditions = [{ date: { $gte: today } }];

    // Filter by the user's preferred genres (case-insensitive, partial match)
    const genreRegexes = userGenres.map(
      (g) => new RegExp(g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    );
    baseConditions.push({ genre: { $in: genreRegexes } });

    const query = { $and: baseConditions };

    // Fetch up to 200 matching events from the DB
    const matchingEvents = await Event.find(query).limit(200);

    let pool = [...matchingEvents];

    // If we don't have at least 6 matches for the user's genres, backfill
    // with other LA events so we can still show a full set of recommendations.
    if (pool.length < 6) {
      const usedIds = new Set(pool.map((e) => e._id.toString()));

      const fallbackQuery = {
        date: { $gte: today },
      };

      const fallbackEvents = await Event.find(fallbackQuery).limit(200);
      const fallbackFiltered = fallbackEvents.filter(
        (e) => !usedIds.has(e._id.toString())
      );

      pool = pool.concat(fallbackFiltered);
    }

    if (pool.length === 0) {
      return res.status(200).json({
        recommendations: [],
        genres: userGenres,
        totalAvailable: 0,
        message:
          "No matching events found for your preferences yet. Try syncing more events.",
      });
    }

    // Shuffle and take up to 4 random events
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    const recommendations = selected.map((e) => ({
      id: e._id.toString(),
      name: e.artist || e.venue || "Event",
      artist: e.artist || null,
      genre: e.genre || null,
      city: e.city || null,
      venue: e.venue || null,
      date: e.date,
    }));

    res.json({
      recommendations,
      genres: userGenres,
      totalAvailable: matchingEvents.length,
    });
  } catch (error) {
    console.error("Recommendations fetch error:", error);
    res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};

/**
 * Update user's genre preferences
 * PUT /api/recommendations/preferences
 */
export const updateGenrePreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const { genres } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!genres || !Array.isArray(genres)) {
      return res.status(400).json({
        message: "Genres must be an array of strings",
      });
    }

    // Update user's genre preferences (store in existing `genres` field)
    const user = await User.findByIdAndUpdate(
      userId,
      { genres: normalizeGenres(genres) },
      { new: true }
    ).select("name email genres");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Genre preferences updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      message: "Failed to update preferences",
      error: error.message,
    });
  }
};
