import { fetchTicketmasterEvents } from "../services/ticketmasterService.js";

export const getTicketmasterEvents = async (req, res) => {
  try {
    const { keyword, genre, city, startDateTime, endDateTime, size } =
      req.query;

    const events = await fetchTicketmasterEvents({
      keyword,
      classificationName: genre,
      city,
      startDateTime,
      endDateTime,
      size,
    });

    res.json({ events });
  } catch (error) {
    console.error("Ticketmaster fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};

