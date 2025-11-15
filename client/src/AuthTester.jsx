/* global google */
import { useEffect, useState } from 'react'
import './App.css'

function AuthTester() {
  const [status, setStatus] = useState('Checking backend...')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [authResult, setAuthResult] = useState('')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health')
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        const data = await res.json()
        setStatus(`Backend status: ${data.status}`)
      } catch (err) {
        setError('Could not reach backend')
        setStatus('')
      }
    }

    checkBackend()
  }, [])

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
          client_id: '804265354120-k7vhqk03er8vcfslqsokpgbk4p7kqmpb.apps.googleusercontent.com',
          callback: async (response) => {
            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
              })
              const data = await res.json()
              if (!res.ok) {
                setAuthResult(`Google error: ${data.message || 'unknown error'}`)
                return
              }
              setAuthResult(`Logged in with Google as ${data.user.email}`)
              localStorage.setItem('token', data.token)
            } catch {
              setAuthResult('Google login request failed')
            }
          },
        })

        google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
        })
      } catch (err) {
        console.error('Google button error:', err)
      }
    }

    initGoogle()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthResult('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthResult(`Register error: ${data.message || 'unknown error'}`)
        return
      }
      setAuthResult(`Registered as ${data.user.email}`)
    } catch {
      setAuthResult('Register request failed')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthResult('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthResult(`Login error: ${data.message || 'unknown error'}`)
        return
      }
      setAuthResult(`Logged in as ${data.user.email}`)
      localStorage.setItem('token', data.token)
    } catch {
      setAuthResult('Login request failed')
    }
  }

  return (
    <div className="min-h-screen bg-dark text-white p-8">
      <h1 className="text-3xl font-semibold mb-4">Soundscape</h1>
      <p className="text-lg mb-2">{status}</p>
      {error && <p className="text-red-400">{error}</p>}
      <div className="mt-8 max-w-md space-y-4">
        <h2 className="text-2xl font-medium">Dummy Auth Tester</h2>
        <form className="space-y-2" onSubmit={handleRegister}>
          <input
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              Register
            </button>
            <button
              type="button"
              onClick={handleLogin}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
            >
              Login
            </button>
          </div>
        </form>
        <div id="google-button" className="mt-4" />
        {authResult && <p className="mt-2 text-sm">{authResult}</p>}
      </div>
    </div>
  )
}

export default AuthTester
