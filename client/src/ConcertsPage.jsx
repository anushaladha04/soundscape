import { useState, useEffect } from "react";

const PAGE_SIZE = 5;

export default function ConcertsPage() {
  const [artist, setArtist] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedGenres, setSelectedGenres] = useState([]); // multi-select
  const [availableGenres, setAvailableGenres] = useState([]); // from backend

  // core fetch function
  const fetchEvents = async (pageToUse = page) => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(pageToUse),
      limit: String(PAGE_SIZE),
    });

    const trimmed = artist.trim();
    if (trimmed !== "") {
      params.append("artist", trimmed);
    }

    // add each selected genre as a ?genre= param
    selectedGenres.forEach((g) => {
      params.append("genre", g);
    });

    try {
      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Server error");
      }

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

  // load all concerts on first mount
  useEffect(() => {
    fetchEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load available genres once on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("/api/events/genres");
        const data = await res.json();
        if (res.ok) {
          setAvailableGenres(data.genres || []);
        } else {
          console.error("Failed to load genres:", data.message);
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };

    fetchGenres();
  }, []);

  // Called when user hits Enter or clicks Search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = artist.trim();

    if (trimmed !== "" && trimmed.length < 2) {
      setError("Please enter at least 2 characters to search.");
      return;
    }

    setError("");
    fetchEvents(1);
  };

  const handlePrev = () => {
    if (page > 1) {
      fetchEvents(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      fetchEvents(page + 1);
    }
  };

  // --- Genre filter handlers ---

  const handleToggleGenre = (genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        // remove if already selected
        return prev.filter((g) => g !== genre);
      }
      // add if not selected
      return [...prev, genre];
    });
  };

  const handleAllGenres = () => {
    setSelectedGenres([]);
  };

  // when genres change, refetch from page 1
  useEffect(() => {
    fetchEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenres]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-semibold mb-2">Discover Concerts</h1>
      <p className="text-sm text-gray-300 mb-6">
        Browse and filter upcoming events
      </p>

      <div className="flex gap-8">
        {/* LEFT SIDEBAR: GENRE FILTERS */}
        <aside className="w-64 bg-[#050505] border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Genre</h2>

          {/* All Genres radio */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="radio"
              id="all-genres"
              name="genre"
              checked={selectedGenres.length === 0}
              onChange={handleAllGenres}
            />
            <label htmlFor="all-genres" className="text-sm">
              All Genres
            </label>
          </div>

          {/* Individual genre checkboxes */}
          <div className="space-y-2">
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
            className="flex gap-2 mb-2 max-w-xl"
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

          {/* status + result count */}
          {error && <p className="text-red-400 mb-2">{error}</p>}
          {loading && (
            <p className="mb-2 text-sm text-gray-300">Loading concerts...</p>
          )}

          {!loading && !error && (
            <p className="mb-4 text-sm text-gray-300">
              Showing {events.length} of {total} concert
              {total === 1 ? "" : "s"}
            </p>
          )}

          {/* events grid */}
          {!loading && events.length === 0 && !error && (
            <p>No concerts found.</p>
          )}

          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="border border-gray-700 p-4 rounded bg-black/40"
              >
                <h2 className="text-xl font-semibold mb-1">{ev.artist}</h2>

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

          {/* Pagination */}
          <div className="mt-4 flex items-center gap-4">
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
