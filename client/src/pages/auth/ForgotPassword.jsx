import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to send reset link')
        return
      }
      setMessage(
        data.message ||
          'If that email exists, we have sent a reset link to your inbox.',
      )
    } catch {
      setError('Failed to send reset link')
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
          <h1 className="text-3xl font-semibold">Forgot Password?</h1>
          <p className="text-sm text-neutral-400">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#1c1c1c] bg-[#070707]/95 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-md space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 text-center">
              {error}
            </div>
          )}
          {message && !error && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 text-center">
              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#f26f5e] py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#ff8270] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-md border border-[#1f1f1f] py-3 text-sm font-medium text-white transition hover:bg-[#0e0e0e]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword


