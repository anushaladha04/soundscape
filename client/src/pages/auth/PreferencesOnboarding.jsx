import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../../config.js'

const allGenres = [
  'Rock',
  'Pop',
  'Hip-Hop/Rap',
  'Jazz',
  'Electronic',
  'Classical',
  'Country',
  'R&B',
  'Indie',
  'Metal',
  'Folk',
  'Latin',
]

const PreferencesOnboarding = ({ user, onUserUpdate }) => {
  const [selectedGenres, setSelectedGenres] = useState(user?.genres || [])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (selectedGenres.length === 0) {
      setError('Please select at least one music genre')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setError('You must be signed in to continue')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ genres: selectedGenres }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to save preferences')
        return
      }

      if (onUserUpdate && data.user) {
        onUserUpdate(data.user)
      }

      navigate('/', { replace: true })
    } catch {
      setError('Failed to save preferences')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8 text-white">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-3xl mb-4">
            ♪
          </div>
          <h1 className="text-3xl font-semibold">Choose your vibe</h1>
          <p className="text-sm text-neutral-400">
            Select at least one genre so we can personalize your Soundscape.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#1c1c1c] bg-[#070707]/95 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-md space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-200">
                Music Genre Preferences
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-neutral-200">
                {allGenres.map((genre) => (
                  <label
                    key={genre}
                    className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1 hover:border-[#333]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                      className="h-3.5 w-3.5 rounded border border-[#444] bg-transparent text-[#f26f5e] focus:ring-0"
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-neutral-500">
                You can update these later from your profile.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#f26f5e] py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#ff8270] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PreferencesOnboarding


