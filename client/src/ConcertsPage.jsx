// client/src/ConcertsPage.jsx
import { useState, useEffect } from "react";

const PAGE_SIZE = 6;
const API_BASE = "http://localhost:5050/api";

export default function ConcertsPage({ onBookmarkCountChange }) {
  const [artist, setArtist] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);

  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  /* ---------- core: fetch events ---------- */
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

  /* ---------- fetch genres ---------- */
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`${API_BASE}/events/genres`);
        const data = await res.json();
        if (res.ok) setAvailableGenres(data.genres || []);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  /* ---------- load user bookmarks ---------- */
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/bookmarks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;

        const data = await res.json();
        // API returns an array of Event docs in data.bookmarks
        const events = data.bookmarks || [];
        const ids = events.map((ev) => ev._id).filter(Boolean);

        setBookmarkedIds(ids);
        if (onBookmarkCountChange) onBookmarkCountChange(ids.length);
      } catch (err) {
        console.error("Error loading bookmarks:", err);
      }
    };
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- search submit ---------- */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = artist.trim();
    if (trimmed && trimmed.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }
    fetchEvents(1);
  };

  /* ---------- pagination ---------- */
  const handlePrev = () => page > 1 && fetchEvents(page - 1);
  const handleNext = () => page < totalPages && fetchEvents(page + 1);

  /* ---------- genre filters ---------- */
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

  /* ---------- bookmarking ---------- */
  const handleToggleBookmark = async (eventId) => {
    const isBookmarked = bookmarkedIds.includes(eventId);

    // optimistic update
    let next;
    if (isBookmarked) {
      next = bookmarkedIds.filter((id) => id !== eventId);
    } else {
      next = [...bookmarkedIds, eventId];
    }
    setBookmarkedIds(next);
    if (onBookmarkCountChange) onBookmarkCountChange(next.length);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");

      if (!isBookmarked) {
        const res = await fetch(`${API_BASE}/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventId }),
        });
        if (!res.ok) throw new Error("Failed to bookmark");
      } else {
        const res = await fetch(`${API_BASE}/bookmarks/${eventId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to unbookmark");
      }
    } catch (err) {
      console.error(err);
      // rollback on error
      setBookmarkedIds(bookmarkedIds);
      if (onBookmarkCountChange) onBookmarkCountChange(bookmarkedIds.length);
    }
  };

  const BookmarkIcon = ({ active }) => (
    <svg
      viewBox="0 0 24 24"
      className={
        "w-6 h-6 transition-colors " +
        (active
          ? "text-yellow-400"
          : "text-gray-400 hover:text-yellow-300")
      }
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      {/* outline bookmark like your reference */}
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  );

  // Format date as "Dec 15, 2024 at 8:00 PM"
  const formatDate = (dateString, timeString) => {
    if (!dateString) return "Date TBA";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Use time field if available, otherwise extract from date
    let timeStr = "";
    if (timeString && timeString !== "TBA") {
      // Parse time string (format: "HH:mm:ss" or "HH:mm")
      const timeParts = timeString.split(":");
      if (timeParts.length >= 2) {
        let hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? `0${minutes}` : "00";
        timeStr = ` at ${hours}:${minutesStr} ${ampm}`;
      }
    } else {
      // Extract time from date object
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      timeStr = ` at ${hours}:${minutesStr} ${ampm}`;
    }
    
    return `${month} ${day}, ${year}${timeStr}`;
  };

  // Format location as "Venue, City"
  const formatLocation = (event) => {
    const parts = [];
    if (event.venue) parts.push(event.venue);
    if (event.city) parts.push(event.city);
    return parts.length > 0 ? parts.join(", ") : "Location TBA";
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold mb-2">Discover Concerts</h1>
        <p className="text-sm text-gray-400 mb-6">Browse and filter upcoming events.</p>

        <div className="flex gap-8">
          {/* SIDEBAR */}
          <aside className="w-64 flex-shrink-0">
            <h2 className="text-sm font-semibold mb-4 text-gray-300">Genre</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="genre"
                  checked={selectedGenres.length === 0}
                  onChange={() => setSelectedGenres([])}
                  className="w-4 h-4"
                />
                <span className="text-sm text-white">All Genres</span>
              </label>

              {availableGenres.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleToggleGenre(genre)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-white">{genre}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            {/* Search bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative mb-6 max-w-xl"
            >
              <input
                type="text"
                placeholder="Search concerts..."
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </form>

            {error && <p className="text-red-400 mb-4">{error}</p>}
            {loading && (
              <p className="mb-4 text-sm text-gray-400">Loading concerts...</p>
            )}

            {!loading && !error && (
              <p className="mb-6 text-sm text-gray-400">
                Showing {Math.min((page - 1) * PAGE_SIZE + events.length, total)} of {total} event{total !== 1 ? "s" : ""}
              </p>
            )}

            {!loading && events.length === 0 && !error && (
              <p className="text-gray-400">No concerts found.</p>
            )}

            {/* cards */}
            <div className="grid grid-cols-2 gap-4">
              {events.map((ev) => {
                const isBookmarked = bookmarkedIds.includes(ev._id);
                return (
                  <div
                    key={ev._id}
                    className="relative bg-[#1a1a1a] border border-gray-800 rounded-lg p-5"
                  >
                    {/* bookmark button */}
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(ev._id)}
                      className="absolute top-4 right-4"
                      aria-label={
                        isBookmarked ? "Remove bookmark" : "Add bookmark"
                      }
                    >
                      <BookmarkIcon active={isBookmarked} />
                    </button>

                    {/* Genre - uppercase, red color */}
                    {ev.genre && (
                      <p className="text-xs font-semibold text-[#f26f5e] mb-2 uppercase tracking-wide">
                        {ev.genre}
                      </p>
                    )}

                    {/* Title */}
                    <h2 className="text-lg font-semibold mb-3 text-white">
                      {ev.artist || ev.name}
                    </h2>

                    {/* Date and Time */}
                    <p className="text-sm text-gray-300 mb-2">
                      {formatDate(ev.date, ev.time)}
                    </p>

                    {/* Location */}
                    <p className="text-sm text-gray-400">
                      {formatLocation(ev)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252525]"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252525]"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
