import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EVENTS = [
  { 
    id: 1,
    title: 'Aurora Nights Festival',
    location: 'Reykjavík, Iceland',
    date: 'March 22 • 9:00 PM',
    image:
      'https://images.pexels.com/photos/167404/pexels-photo-167404.jpeg?auto=compress&cs=tinysrgb&w=1200',
    genres: ['Electronic', 'Pop'],
    verified: true,
  },
  {
    id: 2,
    title: 'City Lights Live',
    location: 'Los Angeles, CA',
    date: 'April 5 • 8:00 PM',
    image:
      'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1200',
    genres: ['Hip-Hop/Rap', 'R&B'],
    verified: true,
  },
  {
    id: 3,
    title: 'Indie Under The Stars',
    location: 'Austin, TX',
    date: 'April 12 • 7:30 PM',
    image:
      'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1200',
    genres: ['Indie', 'Rock'],
    verified: false,
  },
  {
    id: 4,
    title: 'Jazz in the Park',
    location: 'New Orleans, LA',
    date: 'May 3 • 6:00 PM',
    image:
      'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=1200',
    genres: ['Jazz'],
    verified: false,
  },
]

const Home = ({ user }) => {
  const navigate = useNavigate()
  const userGenres = Array.isArray(user?.genres) ? user.genres : []
  const hasPreferences = userGenres.length > 0
  const [recommendedEvents, setRecommendedEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookmarkedIds, setBookmarkedIds] = useState([])

  const API_BASE = '/api'

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA'
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    const hoursRaw = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hoursRaw >= 12 ? 'PM' : 'AM'
    let hours = hoursRaw % 12
    hours = hours || 12
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes
    return `${month} ${day}, ${year} at ${hours}:${minutesStr} ${ampm}`
  }

  const formatLocation = (event) => {
    const parts = []
    if (event.venue) parts.push(event.venue)
    if (event.city) parts.push(event.city)
    return parts.length > 0 ? parts.join(', ') : 'Location TBA'
  }

  const BookmarkIcon = ({ active }) => (
    <svg
      viewBox="0 0 24 24"
      className={
        'w-5 h-5 transition-colors ' +
        (active ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300')
      }
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  )

  // Load existing bookmarks to show active icons
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch(`${API_BASE}/bookmarks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) return

        const data = await res.json()
        const events = data.bookmarks || []
        const ids = events.map((ev) => ev._id).filter(Boolean)
        setBookmarkedIds(ids)
      } catch {
        // ignore bookmark load errors on home
      }
    }

    fetchBookmarks()
  }, [])

  const handleToggleBookmark = async (eventId) => {
    const isBookmarked = bookmarkedIds.includes(eventId)

    let next
    if (isBookmarked) {
      next = bookmarkedIds.filter((id) => id !== eventId)
    } else {
      next = [...bookmarkedIds, eventId]
    }
    setBookmarkedIds(next)

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not logged in')

      if (!isBookmarked) {
        const res = await fetch(`${API_BASE}/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventId }),
        })
        if (!res.ok) throw new Error('Failed to bookmark')
      } else {
        const res = await fetch(`${API_BASE}/bookmarks/${eventId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error('Failed to unbookmark')
      }
    } catch {
      // revert optimistic update on error
      setBookmarkedIds(bookmarkedIds)
    }
  }

  useEffect(() => {
    if (!hasPreferences) {
      setRecommendedEvents([])
      return
    }

    const fetchRecommendations = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/recommendations', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message || 'Failed to load recommendations')
          return
        }
        setRecommendedEvents(data.recommendations || [])
      } catch {
        setError('Failed to load recommendations')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [hasPreferences, userGenres])

  return (
    <section className="mt-10 space-y-10">
      <div className="text-center space-y-4">
        <h2 className="mt-20 text-6xl md:text-6xl font-semibold mb-10">
          Discover Your Next
          <br />
          <span className="text-[#f26f5e]">Soundscape</span>
        </h2>
        <p className="text-md md:text-base text-gray-300 max-w-xl mx-auto">
        Explore live concerts, immersive music events, and unforgettable soundscapes. 
        Find tickets, bookmark favorites, and connect with the music community.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/discover')}
          className="px-5 lg:px-4 py-1.5 lg:py-1.5 rounded-xl bg-[#f26f5e] hover:bg-[#ff8270] text-sm md:text-base lg:text-sm"
        >
          Start Exploring
        </button>
        <button
          type="button"
          onClick={() => navigate('/community')}
          className="px-5 lg:px-4 py-1.5 lg:py-1.5 rounded-xl border border-gray-600 hover:bg-gray-800 text-sm md:text-base lg:text-sm"
        >
          Submit an Event
        </button>
      </div>

      {!hasPreferences ? (
        <div className="text-center space-y-4">
          <h3 className="text-2xl md:text-3xl font-semibold">
            Get Personalized Recommendations
          </h3>
          <p className="text-sm md:text-base text-neutral-400 max-w-lg mx-auto">
            Fill out your music genre preferences to see events tailored just for you.
          </p>
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="inline-flex items-center justify-center rounded-xl bg-[#f26f5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ff8270]"
          >
            Set My Preferences
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-semibold">
              Recommended For You
            </h3>
            <p className="text-xs md:text-sm text-neutral-400">
              Events based on your music preferences.
            </p>
          </div>

          {loading && (
            <p className="text-xs text-neutral-500">Loading recommendations…</p>
          )}
          {error && !loading && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          {!loading && !error && recommendedEvents.length === 0 && (
            <p className="text-xs text-neutral-400">
              No recommendations available yet. Try updating your preferences or syncing more events.
            </p>
          )}
          {!loading && !error && recommendedEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedEvents.slice(0, 4).map((event) => {
                const isBookmarked = bookmarkedIds.includes(event.id)
                return (
                  <div
                    key={event.id}
                    className="relative bg-[#1a1a1a] border border-gray-800 rounded-lg p-5"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(event.id)}
                      className="absolute top-4 right-4"
                      aria-label={
                        isBookmarked ? 'Remove bookmark' : 'Add bookmark'
                      }
                    >
                      <BookmarkIcon active={isBookmarked} />
                    </button>

                    {event.genre && (
                      <p className="text-xs font-semibold text-[#f26f5e] mb-2 uppercase tracking-wide">
                        {event.genre}
                      </p>
                    )}

                    <h4 className="text-lg font-semibold mb-3 text-white">
                      {event.artist || event.name}
                    </h4>

                    <p className="text-sm text-gray-300 mb-2">
                      {formatDate(event.date)}
                    </p>

                    <p className="text-sm text-gray-400">
                      {formatLocation(event)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Home


