import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import SubmitPostModal from './components/SubmitPostModal'
import Home from './pages/Home'
import Community from './pages/Community'
import './App.css'

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const location = useLocation()

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handlePostSubmitted = () => {
    // Trigger refresh of Community page if we're on it
    if (location.pathname === '/community') {
      setRefreshKey(prev => prev + 1)
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar onOpenModal={handleOpenModal} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community key={refreshKey} />} />
      </Routes>
      <SubmitPostModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onPostSubmitted={handlePostSubmitted}
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
