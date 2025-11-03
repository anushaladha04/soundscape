// client/src/App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ConcertsPage from "./ConcertsPage.jsx";
import BookmarksPage from "./BookmarksPage.jsx";

function App() {
  const [bookmarkCount, setBookmarkCount] = useState(0);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {/* Simple top nav */}
        <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800 text-sm">
          <div className="font-semibold">SoundScape</div>
          <div className="space-x-6">
            <Link to="/" className="hover:text-gray-300">
              Discover
            </Link>
            <Link to="/bookmarks" className="hover:text-gray-300">
              My Bookmarks
              <span className="ml-1 text-xs text-gray-400">
                ({bookmarkCount})
              </span>
            </Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <ConcertsPage
                onBookmarkCountChange={(n) => setBookmarkCount(n)}
              />
            }
          />
          <Route
            path="/bookmarks"
            element={
              <BookmarksPage
                onBookmarkCountChange={(n) => setBookmarkCount(n)}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
