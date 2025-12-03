import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!token) {
      setError('Reset link is invalid or missing')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to reset password')
        return
      }
      setMessage('Password reset successful. You can now sign in with your new password.')
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Failed to reset password')
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
          <h1 className="text-3xl font-semibold">Reset password</h1>
          <p className="text-sm text-neutral-400">
            Choose a new password for your Soundscape account.
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
              <label htmlFor="password" className="text-sm text-neutral-300">
                New password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm text-neutral-300"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#3a3a3a]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[#f26f5e] py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#ff8270] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-2xl border border-[#1f1f1f] py-3 text-sm font-medium text-white transition hover:bg-[#0e0e0e]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword


