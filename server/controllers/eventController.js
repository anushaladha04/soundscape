// server/controllers/eventController.js
import Event from "../models/Event.js";

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

/**
 * GET /api/events/sync-ticketmaster
 *
 * Fetches concerts from Ticketmaster and upserts them into MongoDB (Event collection).
 * Optional query params (artist, city) let you limit what you sync.
 */
export const syncTicketmasterEvents = async (req, res) => {
  try {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Missing Ticketmaster API key" });
    }

    const { artist, city } = req.query;

    // Build Ticketmaster URL
    const url = new URL(TM_BASE_URL);
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("classificationName", "music"); // only music events
    url.searchParams.set("size", "100");                 // how many to fetch

    if (artist && artist.trim() !== "") {
      url.searchParams.set("keyword", artist.trim());
    }
    if (city && city.trim() !== "") {
      url.searchParams.set("city", city.trim());
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      console.error("Ticketmaster API error:", resp.status, text);
      return res.status(500).json({ message: "Ticketmaster API error" });
    }

    const data = await resp.json();
    const tmEvents = data._embedded?.events || [];

    // Map Ticketmaster events → your Event schema
    const docs = tmEvents.map((e) => {
      const venue = e._embedded?.venues?.[0];

      return {
        ticketmaster_id: e.id,
        artist: e.name ?? "Unknown Artist",
        venue: venue?.name ?? "",
        city: venue?.city?.name ?? "",
        date: e.dates?.start?.dateTime
          ? new Date(e.dates.start.dateTime)
          : null,
        genre:
          e.classifications?.[0]?.genre?.name ||
          e.classifications?.[0]?.segment?.name ||
          "Other",
      };
    });

    // Upsert into Mongo so re-running doesn't create duplicates
    const bulkOps = docs.map((doc) => ({
      updateOne: {
        filter: { ticketmaster_id: doc.ticketmaster_id },
        update: { $set: doc },
        upsert: true,
      },
    }));

    let result = null;
    if (bulkOps.length > 0) {
      result = await Event.bulkWrite(bulkOps);
      console.log("Ticketmaster sync result:", result);
    }

    return res.json({
      message: "Ticketmaster events synced to DB",
      fetched: tmEvents.length,
      upserted: result ? (result.upsertedCount ?? result.nUpserted ?? 0) : 0,
    });
  } catch (err) {
    console.error("Ticketmaster sync error:", err);
    res.status(500).json({ message: "Failed to sync Ticketmaster events" });
  }
};
