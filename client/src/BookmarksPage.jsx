// client/src/BookmarksPage.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5050/api";

export default function BookmarksPage({ onBookmarkCountChange }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookmarks = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/bookmarks`, {
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load bookmarks");
        }

        const events = (data.bookmarks || [])
          .map((b) => b.event)
          .filter(Boolean);

        setBookmarks(events);
        if (onBookmarkCountChange) onBookmarkCountChange(events.length);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-semibold mb-2">My Bookmarks</h1>
      <p className="text-sm text-gray-300 mb-6">
        You have {bookmarks.length} bookmarked event
        {bookmarks.length === 1 ? "" : "s"}.
      </p>

      {loading && <p className="text-gray-300">Loading bookmarks...</p>}
      {error && <p className="text-red-400 mb-2">{error}</p>}

      {!loading && bookmarks.length === 0 && !error && (
        <p className="text-gray-400 text-sm">
          You haven&apos;t bookmarked any concerts yet. Go to Discover and tap
          the bookmark icon on a concert to save it here.
        </p>
      )}

      <div className="mt-4 space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
        {bookmarks.map((ev) => (
          <div
            key={ev._id}
            className="border border-gray-700 p-4 rounded bg-black/40"
          >
            <h2 className="text-xl font-semibold mb-1">
              {ev.artist || ev.name}
            </h2>
            {ev.venue && (
              <p className="text-sm text-gray-300 mb-1">{ev.venue}</p>
            )}
            <p className="text-sm text-gray-400 mb-1">
              {ev.city && <span>{ev.city} • </span>}
              {ev.date ? new Date(ev.date).toLocaleString() : "Date TBA"}
            </p>
            {ev.genre && (
              <p className="text-sm text-gray-400 mb-1">{ev.genre}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
