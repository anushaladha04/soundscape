import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../../config.js'

const Signup = ({ onAuthSuccess }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [genres, setGenres] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google) {
        setTimeout(initGoogle, 100)
        return
      }

      const buttonElement = document.getElementById('google-signup-button')
      if (!buttonElement) {
        setTimeout(initGoogle, 100)
        return
      }

      try {
        google.accounts.id.initialize({
          client_id:
            '445122271174-gcc16hsd431c8pirphollckoi89ujprn.apps.googleusercontent.com',
          callback: async (response) => {
            try {
              const res = await fetch(`${API_BASE}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
              })
              const data = await res.json()
              if (!res.ok) {
                setServerError(data.message || 'Google sign-up failed')
                return
              }

              let finalUser = data.user

              if (genres.length > 0) {
                try {
                  const prefRes = await fetch(`${API_BASE}/auth/preferences`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${data.token}`,
                    },
                    body: JSON.stringify({ genres }),
                  })
                  const prefData = await prefRes.json()
                  if (prefRes.ok && prefData.user) {
                    finalUser = prefData.user
                  }
                } catch {
                }
              }

              if (onAuthSuccess) {
                onAuthSuccess({ user: finalUser, token: data.token })
              }
            } catch {
              setServerError('Google sign-up request failed')
            }
          },
        })

        google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: 320,
        })
      } catch (err) {
        console.error('Google signup button error:', err)
      }
    }

    initGoogle()
  }, [genres, onAuthSuccess])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    setServerError('')

    if (!name.trim()) {
      setValidationError('Display name is required')
      return
    }
    if (!email.includes('@')) {
      setValidationError('Please enter a valid email')
      return
    }
    if (!password || password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (genres.length === 0) {
      setValidationError('Please select at least one music genre')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, genres }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.message || 'Signup failed')
        return
      }
      if (onAuthSuccess) {
        onAuthSuccess(data)
      }
    } catch {
      setServerError('Signup request failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const error = validationError || serverError

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

  const toggleGenre = (genre) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8 text-white">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-3xl mb-4">
            ♪
          </div>
          <h1 className="text-3xl font-semibold">Join Soundscape</h1>
          <p className="text-sm text-neutral-400">
          Create your account to start discovering events.
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
              <label htmlFor="name" className="text-sm text-neutral-300">
              Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-neutral-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="johndoe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-neutral-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm text-neutral-300"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

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
                      checked={genres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                      className="h-3.5 w-3.5 rounded border border-[#444] bg-transparent text-[#f26f5e] focus:ring-0"
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-neutral-500">
                Select at least one genre to personalize your experience.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#f26f5e] py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#ff8270] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="relative text-center text-[10px] tracking-[0.1em] text-neutral-500">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#1a1a1a]" />
            <span className="relative bg-[#070707] px-4">OR SIGN UP WITH</span>
          </div>

          <div className="flex justify-center">
            <div
              id="google-signup-button"
              className="w-full [&>div]:w-full [&>div]:!flex [&>div]:!justify-center"
            />
          </div>

          <div className="space-y-2 text-center text-sm text-neutral-400">
            <p>Already have an account?</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full rounded-md border border-[#1f1f1f] py-3 text-sm font-medium text-white transition hover:bg-[#0e0e0e]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup