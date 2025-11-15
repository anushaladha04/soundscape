// server/controllers/eventController.js
import Event from "../models/Event.js";

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

/**
 * Search Ticketmaster directly for events (used as fallback when DB search returns no results)
 * Returns events in the same format as the database
 */
export const searchTicketmasterDirectly = async (searchTerm, limit = 20) => {
  try {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Ticketmaster API key");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateTime = today.toISOString().replace(/\.\d{3}Z$/, 'Z');

    // Fetch multiple pages to get more results (up to 3 pages = 300 events max)
    const allTmEvents = [];
    const maxPages = 3;
    const pageSize = 100;
    
    // Helper function to fetch a page
    const fetchPage = async (keyword, pageNum) => {
      const url = new URL(TM_BASE_URL);
      url.searchParams.set("apikey", apiKey);
      url.searchParams.set("classificationName", "music");
      url.searchParams.set("startDateTime", startDateTime);
      url.searchParams.set("keyword", keyword);
      url.searchParams.set("size", String(pageSize));
      url.searchParams.set("page", String(pageNum));

      const resp = await fetch(url);
      if (!resp.ok) {
        const text = await resp.text();
        console.error(`Ticketmaster search error (keyword: "${keyword}", page ${pageNum}): ${resp.status}`, text);
        return { events: [], totalElements: 0 };
      }

      const data = await resp.json();
      const pageEvents = data._embedded?.events || [];
      return { events: pageEvents, totalElements: data.page?.totalElements || 0 };
    };
    
    // Search with the original term
    for (let page = 0; page < maxPages; page++) {
      const result = await fetchPage(searchTerm, page);
      allTmEvents.push(...result.events);
      if (result.events.length < pageSize) break;
    }
    
    // Search for variations that keyword search might miss
    // For "zach", also try "zachariah", "porter", and "wiltern" to catch "Zachariah Porter"
    const searchTermLower = searchTerm.toLowerCase();
    if (searchTermLower === "zach") {
      const zachariahResult = await fetchPage("zachariah", 0);
      allTmEvents.push(...zachariahResult.events);
      
      const porterResult = await fetchPage("porter", 0);
      allTmEvents.push(...porterResult.events);
      
      const wilternResult = await fetchPage("wiltern", 0);
      allTmEvents.push(...wilternResult.events);
    }
    
    // Remove duplicates (same ticketmaster_id)
    const seen = new Set();
    const uniqueEvents = allTmEvents.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    
    const tmEvents = uniqueEvents;

    // Map to same format as database events
    const events = tmEvents
      .map((e) => {
        const venue = e._embedded?.venues?.[0];
        const eventDate = e.dates?.start?.dateTime
          ? new Date(e.dates.start.dateTime)
          : null;

        if (!eventDate || eventDate < today) return null;

        const eventCity = venue?.city?.name ?? "";
        const cityLower = eventCity.toLowerCase();
        const stateCode = venue?.state?.stateCode ?? "";
        const stateCodeLower = stateCode.toLowerCase();
        
        // Filter to Los Angeles area, CA only
        // Include LA proper and nearby cities in the metro area
        const laAreaCities = [
          "los angeles", "la", "inglewood", "hollywood", "burbank", 
          "glendale", "pasadena", "santa monica", "venice", "culver city",
          "beverly hills", "west hollywood", "sherman oaks", "studio city",
          "north hollywood", "encino", "tarzana", "woodland hills"
        ];
        
        const cityMatch = laAreaCities.some(city => cityLower.includes(city));
        const stateMatch = stateCodeLower === "ca" || stateCodeLower === "california";
        const isLAArea = cityMatch && stateMatch;
        
        if (!eventCity || !isLAArea) {
          return null;
        }
        
        // If we searched for variations like "porter" or "wiltern", ensure the event name contains the original search term
        // This prevents showing unrelated events from those searches
        const eventName = (e.name ?? "").toLowerCase();
        const venueName = (venue?.name ?? "").toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        
        // Check if event name or venue contains the search term (case-insensitive)
        // Special case: if searching "zach", also accept "zachariah" as a match
        if (!eventName.includes(searchTermLower) && !venueName.includes(searchTermLower)) {
          if (!(searchTermLower === "zach" && eventName.includes("zachariah"))) {
            return null;
          }
        }

        return {
          _id: e.id, // Use Ticketmaster ID as temp ID
          ticketmaster_id: e.id,
          artist: e.name ?? "Unknown Artist",
          venue: venue?.name ?? "",
          city: eventCity,
          date: eventDate,
          genre:
            e.classifications?.[0]?.genre?.name ||
            e.classifications?.[0]?.segment?.name ||
            "Other",
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    return events;
  } catch (err) {
    console.error("Error in searchTicketmasterDirectly:", err);
    return [];
  }
};

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

    const { artist } = req.query;

    // Only fetch events from today onwards
    // Ticketmaster requires format: YYYY-MM-DDTHH:mm:ssZ (no milliseconds)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Convert to ISO string and remove milliseconds (replace .000Z with Z)
    const startDateTime = today.toISOString().replace(/\.\d{3}Z$/, 'Z');

    // Build Ticketmaster URL - fetch multiple pages to get more events
    // Ticketmaster max size per request is 200, so we'll fetch 10 pages (2000 events max)
    // HARDCODED: Only fetch Los Angeles events
    const allTmEvents = [];
    const MAX_PAGES = 10; // Fetch up to 10 pages = 2000 events
    
    for (let page = 0; page < MAX_PAGES; page++) {
      const url = new URL(TM_BASE_URL);
      url.searchParams.set("apikey", apiKey);
      url.searchParams.set("classificationName", "music"); // only music events
      url.searchParams.set("startDateTime", startDateTime); // only future events
      // Try different city formats - Ticketmaster might need "Los Angeles, CA" or state code
      url.searchParams.set("city", "Los Angeles");
      url.searchParams.set("stateCode", "CA"); // Add state code for better filtering
      url.searchParams.set("size", "200"); // Max per request
      url.searchParams.set("page", String(page)); // Pagination

      // Add optional artist filter
      if (artist && artist.trim() !== "") {
        url.searchParams.set("keyword", artist.trim());
      }

      const resp = await fetch(url);
      if (!resp.ok) {
        const text = await resp.text();
        console.error("Ticketmaster API error:", resp.status, text);
        if (page === 0) {
          return res.status(500).json({ 
            message: "Ticketmaster API error",
            status: resp.status,
            error: text,
            url: url.toString().replace(apiKey, "API_KEY_HIDDEN")
          });
        }
        break;
      }

      const data = await resp.json();
      const pageEvents = data._embedded?.events || [];
      allTmEvents.push(...pageEvents);
      
      if (pageEvents.length < 200) break;
    }
    
    // Map Ticketmaster events → your Event schema, filter to only valid future events
    const docs = allTmEvents
      .map((e) => {
        const venue = e._embedded?.venues?.[0];
        const eventDate = e.dates?.start?.dateTime
          ? new Date(e.dates.start.dateTime)
          : null;

        // Skip events without a valid future date
        if (!eventDate || eventDate < today) {
          return null;
        }

        // Get city name - Ticketmaster might return "Los Angeles", "Los Angeles, CA", etc.
        const eventCity = venue?.city?.name ?? "";
        const cityLower = eventCity.toLowerCase();
        
        // Accept Los Angeles in various formats (Los Angeles, Los Angeles CA, etc.)
        if (!eventCity || (!cityLower.includes("los angeles") && !cityLower.includes("la"))) {
          return null;
        }

        return {
          ticketmaster_id: e.id,
          artist: e.name ?? "Unknown Artist",
          venue: venue?.name ?? "",
          city: eventCity, // Store the full city name as returned by Ticketmaster
          date: eventDate,
          genre:
            e.classifications?.[0]?.genre?.name ||
            e.classifications?.[0]?.segment?.name ||
            "Other",
        };
      })
      .filter(Boolean)
      .slice(0, 1000);

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
    }

    return res.json({
      message: "Ticketmaster events synced to DB",
      fetched: allTmEvents.length,
      filtered: docs.length,
      upserted: result ? (result.upsertedCount ?? result.nUpserted ?? 0) : 0,
    });
  } catch (err) {
    console.error("Ticketmaster sync error:", err);
    res.status(500).json({ message: "Failed to sync Ticketmaster events" });
  }
};
