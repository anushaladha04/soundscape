import fetch from "node-fetch";
import User from "../models/User.js";
import { config } from "../config.js";
import { fetchTicketmasterEvents } from "../services/ticketmasterService.js";

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const buildKeywordFromGenres = (genres = []) => {
  if (!genres.length) return "music";
  return genres.join(",");
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

    const genres = Array.isArray(user.genres) ? user.genres : [];
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

    const userGenres = Array.isArray(user.genres) ? user.genres : [];
    if (userGenres.length === 0) {
      return res.status(200).json({
        recommendations: [],
        genres: [],
        message: "No genre preferences set. Please update your profile.",
      });
    }

    // Fetch events from ALL user's preferred genres
    const allEvents = [];
    const genreResults = {};

    for (const genre of userGenres) {
      try {
        const events = await fetchTicketmasterEvents({
          classificationName: genre,
          size: 10,
        });
        allEvents.push(...events);
        genreResults[genre] = events.length;
      } catch (error) {
        console.error(`Failed to fetch events for genre ${genre}:`, error.message);
        genreResults[genre] = 0;
      }
    }

    // Remove duplicates (same event ID)
    const uniqueEvents = allEvents.filter(
      (event, index, self) => index === self.findIndex((e) => e.id === event.id)
    );

    // Shuffle and take 5 random events from all genres
    const shuffled = uniqueEvents.sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 5);

    res.json({
      recommendations,
      genres: userGenres,
      genreResults,
      totalAvailable: uniqueEvents.length,
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
      { genres },
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
