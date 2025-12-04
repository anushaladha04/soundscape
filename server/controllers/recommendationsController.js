import User from "../models/User.js";
import { fetchTicketmasterEvents } from "../services/ticketmasterService.js";

/**
 * Get personalized event recommendations based on user's genre preferences
 * GET /api/recommendations
 * Requires authentication (JWT token)
 */
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Fetch user to get genre preferences
    const user = await User.findById(userId).select("genre_pref");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has genre preferences
    if (!user.genre_pref || user.genre_pref.length === 0) {
      return res.status(200).json({
        recommendations: [],
        message: "No genre preferences set. Please update your profile.",
      });
    }

    // Fetch events from ALL user's preferred genres
    const allEvents = [];
    const genreResults = {};

    for (const genre of user.genre_pref) {
      try {
        const events = await fetchTicketmasterEvents({
          classificationName: genre,
          size: 10, // Fetch 10 per genre
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
      genres: user.genre_pref,
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
 * Requires authentication (JWT token)
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

    // Update user's genre preferences
    const user = await User.findByIdAndUpdate(
      userId,
      { genre_pref: genres },
      { new: true }
    ).select("name email genre_pref");

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

