import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../../config.js'

const Login = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google) {
        setTimeout(initGoogle, 100)
        return
      }

      const buttonElement = document.getElementById('google-button')
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
                setServerError(data.message || 'Google sign-in failed')
                return
              }
              if (onAuthSuccess) onAuthSuccess(data)
            } catch {
              setServerError('Google login request failed')
            }
          },
        })

        google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: 320,          
        })
      } catch (err) {
        console.error('Google button error:', err)
      }
    }

    initGoogle()
  }, [onAuthSuccess])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    setServerError('')

    if (!email || !password) {
      setValidationError('Email and password are required')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.message || 'Login failed')
        return
      }
      if (onAuthSuccess) onAuthSuccess(data)
    } catch {
      setServerError('Login request failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const error = validationError || serverError

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8 text-white">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-3xl mb-4">
            ♪
          </div>
          <h1 className="text-3xl font-semibold">Welcome Back</h1>
          <p className="text-sm text-neutral-400">
          Sign in to your Soundscape account.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#1c1c1c] bg-[#070707]/95 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-md space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isSubmitting}
                required
                className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="password" className="text-neutral-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-[#f26f5e] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm textwhite placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#f26f5e] uppercase py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#ff8270] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="relative text-center text-[10px] tracking-[0.1em] text-neutral-500">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#1a1a1a]" />
            <span className="relative bg-[#070707] px-4">OR CONTINUE WITH</span>
          </div>

          <div className="flex justify-center">
            <div
              id="google-button"
              className="w-full [&>div]:w-full [&>div]:!flex [&>div]:!justify-center"
            />
          </div>

          <div className="space-y-2 text-center text-sm text-neutral-400">
            <p>Don’t have an account yet?</p>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full rounded-md border border-[#1f1f1f] py-3 text-sm font-medium text-white transition hover:bg-[#0e0e0e]"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login