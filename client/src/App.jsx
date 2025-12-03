import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import SubmitPostModal from './components/SubmitPostModal'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import PreferencesOnboarding from './pages/auth/PreferencesOnboarding'
import AccountSettings from './pages/AccountSettings'
import Home from './pages/Home'
import Community from './pages/Community'

function AppContent() {
  const [user, setUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  // Load existing token on first mount and hydrate user
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || user) return

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          localStorage.removeItem('token')
          setUser(null)
          return
        }
        const data = await res.json()
        setUser(data.user)
      } catch {
        // network error, keep token but no user
      }
    }

    fetchUser()
  }, [user])

  const handleAuthSuccess = (data) => {
    if (!data || !data.token || !data.user) return
    localStorage.setItem('token', data.token)
    setUser(data.user)

    const hasGenres = Array.isArray(data.user.genres) && data.user.genres.length > 0
    if (!hasGenres) {
      navigate('/onboarding/preferences', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handlePostSubmitted = () => {
    // Trigger refresh of Community page if we're on it
    if (location.pathname === '/community') {
      setRefreshKey(prev => prev + 1)
    }
  }

  const isAuthenticated = !!user

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        user={user}
        onOpenModal={handleOpenModal}
      />

      <main className="max-w-5xl mx-auto px-4 pb-12">
        {location.pathname === '/' && (
          <header className="pt-10 text-center">
            <h1 className="text-4xl font-semibold mb-2">Soundscape</h1>
            <p className="text-sm text-gray-300">
              Discover live concerts, immersive soundscapes, and
              community-curated events.
            </p>
          </header>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={<Community key={refreshKey} onOpenModal={handleOpenModal} />}
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Signup onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/onboarding/preferences"
            element={
              <ProtectedRoute>
                <PreferencesOnboarding user={user} onUserUpdate={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountSettings
                  user={user}
                  onLogout={handleLogout}
                  onUserUpdate={setUser}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <SubmitPostModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onPostSubmitted={handlePostSubmitted}
      />
    </div>
  )
}

export default AppContent
