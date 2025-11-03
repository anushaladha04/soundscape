// client/src/ConcertsPage.jsx
import { useState, useEffect } from "react";

const PAGE_SIZE = 5;
const API_BASE = "http://localhost:5050/api";

export default function ConcertsPage({ onBookmarkCountChange = () => {} }) {
  const [artist, setArtist] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);

  // IDs of events the user has bookmarked
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  /* ------------------ FETCH EVENTS ------------------ */
  const fetchEvents = async (pageToUse = page) => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(pageToUse),
      limit: String(PAGE_SIZE),
    });

    const trimmed = artist.trim();
    if (trimmed) params.append("artist", trimmed);

    selectedGenres.forEach((g) => params.append("genre", g));

    try {
      const res = await fetch(`${API_BASE}/events?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Server error");

      setEvents(data.events || []);
      setPage(data.page || pageToUse);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------ FETCH GENRES ------------------ */
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`${API_BASE}/events/genres`);
        const data = await res.json();
        if (res.ok) {
          setAvailableGenres(data.genres || []);
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  /* -------------- LOAD USER BOOKMARKS --------------- */
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await fetch(`${API_BASE}/bookmarks`, {
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();
        const ids =
          (data.bookmarks || [])
            .filter((b) => b.event?._id)
            .map((b) => b.event._id) || [];

        setBookmarkedIds(ids);
        onBookmarkCountChange(ids.length);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      }
    };

    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------ SEARCH SUBMIT ------------------ */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = artist.trim();
    if (trimmed && trimmed.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }
    setError("");
    fetchEvents(1);
  };

  /* ------------------- PAGINATION ------------------- */
  const handlePrev = () => {
    if (page > 1) fetchEvents(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) fetchEvents(page + 1);
  };

  /* ----------------- GENRE FILTERING ----------------- */
  const handleToggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  useEffect(() => {
    fetchEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenres]);

  /* ------------------- BOOKMARKING ------------------- */
  const handleToggleBookmark = async (eventId) => {
    const isBookmarked = bookmarkedIds.includes(eventId);

    try {
      if (!isBookmarked) {
        // ADD bookmark
        const res = await fetch(`${API_BASE}/bookmarks`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
        });
        if (!res.ok) throw new Error("Failed to bookmark");

        const next = [...bookmarkedIds, eventId];
        setBookmarkedIds(next);
        onBookmarkCountChange(next.length);
      } else {
        // REMOVE bookmark
        const res = await fetch(`${API_BASE}/bookmarks/${eventId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to unbookmark");

        const next = bookmarkedIds.filter((id) => id !== eventId);
        setBookmarkedIds(next);
        onBookmarkCountChange(next.length);
      }
    } catch (err) {
      console.error(err);
      // you could setError here if you want a message
    }
  };

  /* ------------------------ UI ----------------------- */
  return (
    <div className="min-h-screen bg-black text-white px-8 pb-8">
      <h1 className="text-3xl font-semibold mb-2 text-center">
        Discover Concerts
      </h1>
      <p className="text-sm text-gray-300 mb-6 text-center">
        Browse and filter upcoming events
      </p>

      <div className="flex gap-8">
        {/* LEFT SIDEBAR: GENRE FILTERS */}
        <aside className="w-64 bg-[#050505] border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Genre</h2>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="radio"
              id="all-genres"
              name="genre"
              checked={selectedGenres.length === 0}
              onChange={() => setSelectedGenres([])}
            />
            <label htmlFor="all-genres" className="text-sm">
              All Genres
            </label>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {availableGenres.length === 0 && (
              <p className="text-xs text-gray-500">
                No genres available yet.
              </p>
            )}

            {availableGenres.map((genre) => (
              <label
                key={genre}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleToggleGenre(genre)}
                />
                <span>{genre}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT: SEARCH + RESULTS */}
        <main className="flex-1">
          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 mb-3 max-w-xl mx-auto"
          >
            <input
              type="text"
              placeholder="Search concerts..."
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="flex-1 p-2 bg-gray-800 text-white rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              Search
            </button>
          </form>

          {error && (
            <p className="text-red-400 mb-2 text-center">{error}</p>
          )}
          {loading && (
            <p className="mb-2 text-sm text-gray-300 text-center">
              Loading concerts...
            </p>
          )}

          {!loading && !error && (
            <p className="mb-4 text-sm text-gray-300 text-center">
              Showing {events.length} of {total} concert
              {total === 1 ? "" : "s"}
            </p>
          )}

          {!loading && events.length === 0 && !error && (
            <p className="text-center">No concerts found.</p>
          )}

          {/* events grid */}
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {events.map((ev) => {
              const isBookmarked = bookmarkedIds.includes(ev._id);
              return (
                <div
                  key={ev._id}
                  className="relative border border-gray-700 p-4 rounded bg-black/40"
                >
                  {/* Bookmark icon */}
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(ev._id)}
                    className="absolute top-3 right-3 rounded-full p-1 hover:bg-gray-800 transition"
                    aria-label={
                      isBookmarked
                        ? "Remove bookmark"
                        : "Add bookmark"
                    }
                  >
                    {/* Outline bookmark icon that turns yellow when active */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                    >
                      <path
                        d="M6 3h12v18l-6-5-6 5V3z"
                        fill={isBookmarked ? "#facc15" : "none"} // yellow-400
                        stroke={isBookmarked ? "#facc15" : "#e5e7eb"} // gray-200
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <h2 className="text-xl font-semibold mb-1 text-center">
                    {ev.artist}
                  </h2>

                  {ev.venue && (
                    <p className="text-sm text-gray-300 mb-1 text-center">
                      {ev.venue}
                    </p>
                  )}

                  <p className="text-sm text-gray-400 mb-1 text-center">
                    {ev.city && <span>{ev.city} • </span>}
                    {ev.date
                      ? new Date(ev.date).toLocaleString()
                      : "Date TBA"}
                  </p>

                  {ev.genre && (
                    <p className="text-sm text-gray-400 mb-1 text-center">
                      {ev.genre}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={page <= 1}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
