import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5050/api";

export default function BookmarksPage({ onBookmarkCountChange }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookmarks = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not logged in");
      }

      const res = await fetch(`${API_BASE}/bookmarks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load bookmarks");
      }

      const events = data.bookmarks || [];

      setBookmarks(events);
      if (onBookmarkCountChange) onBookmarkCountChange(events.length);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleUnbookmark = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not logged in");
      }

      const res = await fetch(`${API_BASE}/bookmarks/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove bookmark");
      }

      const updated = bookmarks.filter((ev) => ev._id !== eventId);
      setBookmarks(updated);
      if (onBookmarkCountChange) onBookmarkCountChange(updated.length);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove bookmark");
      loadBookmarks();
    }
  };

  const formatDate = (dateString, timeString) => {
    if (!dateString) return "Date TBA";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let timeStr = "";
    if (timeString && timeString !== "TBA") {
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

  const formatLocation = (event) => {
    const parts = [];
    if (event.venue) parts.push(event.venue);
    if (event.city) parts.push(event.city);
    return parts.length > 0 ? parts.join(", ") : "Location TBA";
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
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold mb-2">My Bookmarks</h1>
        <p className="text-sm text-gray-400 mb-6">
          You have {bookmarks.length} bookmarked event{bookmarks.length !== 1 ? "s" : ""}.
        </p>

        {loading && <p className="text-gray-400 mb-4">Loading bookmarks...</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {!loading && bookmarks.length === 0 && !error && (
          <p className="text-gray-400 text-sm">
            You haven&apos;t bookmarked any concerts yet. Go to Discover and tap
            the bookmark icon on a concert to save it here.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((ev) => (
            <div
              key={ev._id}
              className="relative bg-[#1a1a1a] border border-gray-800 rounded-lg p-5"
            >
              <button
                type="button"
                onClick={() => handleUnbookmark(ev._id)}
                className="absolute top-4 right-4"
                aria-label="Remove bookmark"
              >
                <BookmarkIcon active={true} />
              </button>

              {ev.genre && (
                <p className="text-xs font-semibold text-[#f26f5e] mb-2 uppercase tracking-wide">
                  {ev.genre}
                </p>
              )}

              <h2 className="text-lg font-semibold mb-3 text-white">
                {ev.artist || ev.name}
              </h2>

              <p className="text-sm text-gray-300 mb-2">
                {formatDate(ev.date, ev.time)}
              </p>

              <p className="text-sm text-gray-400">
                {formatLocation(ev)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
