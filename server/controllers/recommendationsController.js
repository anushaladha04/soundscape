import fetch from "node-fetch";
import User from "../models/User.js";
import { config } from "../config.js";

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const buildKeywordFromGenres = (genres = []) => {
  if (!genres.length) return "music";
  return genres.join(",");
};

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


