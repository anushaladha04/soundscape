import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('Checking backend...')
  const [error, setError] = useState('')

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

  return (
    <div className="min-h-screen bg-dark text-white p-8">
      <h1 className="text-3xl font-semibold mb-4">Soundscape</h1>
      <p className="text-lg mb-2">{status}</p>
      {error && <p className="text-red-400">{error}</p>}
    </div>
  )
}

export default App
