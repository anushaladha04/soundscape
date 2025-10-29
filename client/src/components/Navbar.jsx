import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = ({ isAuthenticated, onLogout, user }) => {
  const location = useLocation()
  const onLogin = location.pathname === '/login'
  const onSignup = location.pathname === '/signup'
  return (
    <header className="w-full border-b border-gray-800 bg-black/80 backdrop-blur">
      <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">♪</span>
          <span className="text-xl font-semibold">Soundscape</span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                <span className="text-lg">👤</span>
                <span>{user?.name || 'Account'}</span>
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-4 py-2 rounded text-sm ${
                  onLogin ? 'bg-gray-800' : 'bg-transparent hover:bg-gray-800'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`px-4 py-2 rounded text-sm ${
                  onSignup
                    ? 'bg-orange-500 hover:bg-orange-400'
                    : 'bg-transparent hover:bg-gray-800'
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


