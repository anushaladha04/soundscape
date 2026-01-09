import React, { useState } from 'react'
import API_BASE from '../config.js'

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

const AccountSettings = ({ user, onLogout, onUserUpdate }) => {
  if (!user) return null

  const genres = Array.isArray(user.genres) ? user.genres : []

  const [selectedGenres, setSelectedGenres] = useState(genres)
  const [isEditing, setIsEditing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    )
  }

  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((val, idx) => val === sortedB[idx])
  }

  const handleSaveChanges = async (e) => {
    e.preventDefault()
    setError('')
    setStatusMessage('')

    const token = localStorage.getItem('token')
    if (!token) {
      setError('You must be signed in to update your settings')
      return
    }

    const genresChanged = !arraysEqual(selectedGenres, genres)

    if (!genresChanged) {
      setIsEditing(false)
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
        setError(data.message || 'Failed to update preferences')
        return
      }

      const updatedUser = data.user || user
      if (onUserUpdate && updatedUser) {
        onUserUpdate(updatedUser)
      }

      setStatusMessage('Music preferences updated.')
      setIsEditing(false)
    } catch {
      setError('Failed to save changes')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedGenres(genres)
    setError('')
    setStatusMessage('')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-3xl text-white space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Account Settings</h1>
            <p className="text-sm text-neutral-400">
              Manage your profile and preferences
            </p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true)
                setStatusMessage('')
                setError('')
              }}
              className="flex items-center gap-2 rounded-md border border-[#333] px-4 py-2 text-sm text-neutral-200 hover:bg-[#111]"
            >
              <span className="text-xs">✏️</span>
              <span>Edit</span>
            </button>
          )}
        </header>

        <section className="rounded-[28px] border border-[#1c1c1c] bg-[#070707]/95 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-md space-y-8">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 text-center">
              {error}
            </div>
          )}
          {statusMessage && !error && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 text-center">
              {statusMessage}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-2xl">
              <span>👤</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {user.name || 'User'}
              </h2>
            </div>
          </div>

          <div className="space-y-6 text-sm">
            <div>
              <p className="text-neutral-400 mb-1">Email Address</p>
              <>
                <p className="font-medium">{user.email}</p>
                {user.emailVerified && (
                  <p className="text-xs text-emerald-400 mt-1">✓ Verified</p>
                )}
              </>
            </div>

            <div>
              <p className="text-neutral-400 mb-1">Music Genre Preferences</p>
              {isEditing ? (
                <div className="space-y-3">
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
                          disabled={isSubmitting}
                        />
                        <span>{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="font-medium text-neutral-200">
                  {genres.length > 0 ? genres.join(', ') : 'No genres selected'}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="pt-6 border-t border-[#1a1a1a] flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-[#f26f5e] py-3 text-sm font-semibold text-white transition hover:bg-[#ff8270] disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 rounded-md border border-[#333] py-3 text-sm font-medium text-neutral-200 hover:bg-[#111]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
        <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-md bg-[#f26f5e] py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#ff8270]"
            >
              Log Out
            </button>
      </div>
    </div>
  )
}

export default AccountSettings


