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
    genres: ['Hip-Hop', 'R&B'],
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
        const res = await fetch('/api/events/recommendations', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message || 'Failed to load recommendations')
          return
        }
        setRecommendedEvents(data.events || [])
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
        <div className="mt-28 text-center space-y-4">
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
        <div className="mt-16 space-y-4">
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
          {!loading && !error && (
            <div className="grid gap-5 md:grid-cols-2">
              {recommendedEvents.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-2xl border border-[#1c1c1c] bg-[#090909]"
                >
                  <div className="relative h-52 overflow-hidden">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.name}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    )}
                  </div>

                  <div className="space-y-2 px-4 py-3">
                    <h4 className="text-sm font-semibold">{event.name}</h4>
                    <p className="text-xs text-neutral-400">
                      {event.city} {event.venue ? `• ${event.venue}` : ''}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {event.date} {event.time && `• ${event.time}`}
                    </p>
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-[11px] text-[#f26f5e] hover:underline"
                      >
                        View on Ticketmaster
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Home


