import dotenv from "dotenv";

dotenv.config();

const TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const mapEvent = (event) => {
  const classifications = event.classifications?.[0];
  const artists = event._embedded?.attractions?.map((a) => a.name) ?? [];

  return {
    id: event.id,
    name: event.name,
    artist: artists[0] ?? null,
    genre: classifications?.genre?.name ?? null,
    raw: event,
  };
};

export const fetchTicketmasterEvents = async (params = {}) => {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    throw new Error("TICKETMASTER_API_KEY is not set");
  }

  const searchParams = new URLSearchParams({
    apikey: apiKey,
    size: "10",
    ...Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== ""
      )
    ),
  });

  const response = await fetch(`${TM_BASE_URL}?${searchParams.toString()}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ticketmaster API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  const events = data._embedded?.events ?? [];

  return events.map(mapEvent);
};

