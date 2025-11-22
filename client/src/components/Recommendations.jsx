import { useEffect, useState } from 'react'

function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [genreInput, setGenreInput] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    if (token) {
      fetchRecommendations()
    }
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to see recommendations')
        return
      }

      const res = await fetch('/api/recommendations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to fetch recommendations')
        return
      }

      setRecommendations(data.recommendations || [])
      setGenres(data.genres || [])
    } catch (err) {
      setError('Could not reach server')
    } finally {
      setLoading(false)
    }
  }

  const updateGenrePreferences = async (newGenres) => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to update preferences')
        return
      }

      const res = await fetch('/api/recommendations/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ genres: newGenres }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to update preferences')
        return
      }

      setGenres(data.user.genres || [])
      // Refresh recommendations
      await fetchRecommendations()
    } catch (err) {
      setError('Could not reach server')
    } finally {
      setLoading(false)
    }
  }

  const addGenre = () => {
    if (!genreInput.trim()) return
    const newGenres = [...genres, genreInput.trim()]
    setGenreInput('')
    updateGenrePreferences(newGenres)
  }

  const removeGenre = (genreToRemove) => {
    const newGenres = genres.filter((g) => g !== genreToRemove)
    updateGenrePreferences(newGenres)
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Personalized Recommendations</h2>
          <p className="text-gray-400">Please login to see personalized event recommendations</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">Your Recommendations</h2>

      {/* Genre Preferences Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Your Genre Preferences</h3>
        
        {genres.length === 0 ? (
          <p className="text-gray-400 mb-4">No genre preferences set. Add some to get recommendations!</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {genres.map((genre) => (
              <span
                key={genre}
                className="bg-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {genre}
                <button
                  onClick={() => removeGenre(genre)}
                  className="hover:text-red-400"
                  aria-label={`Remove ${genre}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGenre()}
            placeholder="Add genre (e.g., Rock, Pop, Jazz)"
            className="flex-1 p-2 rounded bg-gray-700 text-white"
          />
          <button
            onClick={addGenre}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
            disabled={loading}
          >
            Add
          </button>
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-2 text-gray-400">Loading recommendations...</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && recommendations.length === 0 && !error && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400">
            No recommendations available. {genres.length === 0 ? 'Add some genre preferences above!' : 'Try refreshing or adding more genres.'}
          </p>
        </div>
      )}

      {!loading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((event) => (
            <div
              key={event.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition"
            >
              <div className="mb-4">
                {event.genre && (
                  <span className="bg-purple-600 text-xs px-2 py-1 rounded-full">
                    {event.genre}
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                {event.name}
              </h3>
              
              {event.artist && (
                <p className="text-gray-400 mb-2">
                  🎤 {event.artist}
                </p>
              )}
              
              <button className="mt-4 w-full py-2 bg-blue-600 rounded hover:bg-blue-500 transition">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Recommendations

