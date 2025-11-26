import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-4 h-4"
  >
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path
      d="M4 19c0-3 3-5 8-5s8 2 8 5v1H4z"
      fill="currentColor"
    />
  </svg>
)

const Navbar = ({ isAuthenticated, onLogout, user, onOpenModal }) => {
  const location = useLocation()
  const onLogin = location.pathname === '/login'
  const onSignup = location.pathname === '/signup'
  const onDiscover = location.pathname === '/discover'
  const onBookmarks = location.pathname === '/bookmarks'
  const onCommunity = location.pathname === '/community'
  return (
    <header className="w-full border-b border-gray-800 bg-black/80 backdrop-blur">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={isAuthenticated ? '/' : '/welcome'} className="flex items-center gap-2">
          <span className="text-2xl text-[#f26f5e]">♪</span>
          <span className="text-2xl font-semibold">Soundscape</span>
        </Link>

        {isAuthenticated && (
          <div className="flex-1 flex items-center justify-center gap-8 text-sm">
            <Link
              to="/discover"
              className={`hover:text-[#f26f5e] ${
                onDiscover ? 'text-white' : 'text-gray-300'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/bookmarks"
              className={`hover:text-[#f26f5e] ${
                onBookmarks ? 'text-white' : 'text-gray-300'
              }`}
            >
              My Bookmarks
            </Link>
            <Link
              to="/community"
              className={`hover:text-[#f26f5e] ${
                onCommunity ? 'text-white' : 'text-gray-300'
              }`}
            >
              Your Community
            </Link>
          </div>
        )}

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white"
              > <div className="flex items-center gap-1"><ProfileIcon />
                <span>{user?.name || 'Account'}</span></div>
                
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 rounded bg-[#f26f5e] hover:bg-[#ff8270] text-sm font-medium text-white"
              >
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-3 py-1 rounded text-sm ${
                  onLogin
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`px-3 py-1 rounded text-sm font-medium ${
                  onSignup
                    ? 'bg-[#f26f5e] text-white'
                    : 'text-gray-300 hover:bg-[#f26f5e] hover:text-white'
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar


