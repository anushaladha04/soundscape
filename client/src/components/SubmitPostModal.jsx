import { useState } from 'react';

export default function SubmitPostModal({ isOpen, onClose, onPostSubmitted }) {
  const [formData, setFormData] = useState({
    eventTitle: '',
    artistName: '',
    genre: 'electronic',
    date: '',
    time: '',
    venue: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitStatus({
          type: 'error',
          message: data.message || 'Failed to submit post',
          errors: data.errors,
        });
        return;
      }

      setSubmitStatus({
        type: 'success',
        message: 'Event submitted successfully!',
      });

      // Notify parent that post was submitted
      if (onPostSubmitted) {
        onPostSubmitted();
      }

      // Reset form
      setFormData({
        eventTitle: '',
        artistName: '',
        genre: 'electronic',
        date: '',
        time: '',
        venue: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus({ type: null, message: '' });
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          position: 'relative',
          zIndex: 10000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="px-6 py-4 flex justify-between items-center"
          style={{
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid #2a2a2a',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Submit an Event</h2>
            <p className="text-sm text-gray-400 mt-1">Share a concert or music event you've discovered with the community.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Messages */}
          {submitStatus.type === 'success' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <p className="text-green-400 font-semibold">{submitStatus.message}</p>
            </div>
          )}
          {submitStatus.type === 'error' && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-red-400 font-semibold">{submitStatus.message}</p>
              {submitStatus.errors && (
                <ul className="mt-2 list-disc list-inside text-red-400 text-sm">
                  {submitStatus.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Community Guidelines Section */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{ 
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  color: '#a855f7'
                }}
              >
                <span className="text-xs font-bold">i</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Community Guidelines</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Submit only real, verified music events</li>
                  <li>• Include accurate dates and venue information</li>
                  <li>• Events will be marked as unverified initially</li>
                  <li>• Community votes help verify legitimacy</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Event Details Section */}
          <div 
            className="p-6 rounded-lg"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(168, 85, 247, 0.3)' }}
          >
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              Event Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Event Title
                </label>
                <input
                  type="text"
                  name="eventTitle"
                  placeholder="e.g., Summer Music Festival 2025"
                  value={formData.eventTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Artist / Performer
                </label>
                <input
                  type="text"
                  name="artistName"
                  placeholder="e.g., The Beatles, Various Artists"
                  value={formData.artistName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Genre
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                >
                  <option value="rock">Rock</option>
                  <option value="pop">Pop</option>
                  <option value="electronic">Electronic</option>
                  <option value="folk">Folk</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="synthwave">Synthwave</option>
                  <option value="ambient">Ambient</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time Section */}
          <div 
            className="p-6 rounded-lg"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(168, 85, 247, 0.3)' }}
          >
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Date & Time
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div 
            className="p-6 rounded-lg"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(168, 85, 247, 0.3)' }}
          >
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="text-2xl">📍</span>
              Location
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Venue Name
                </label>
                <input
                  type="text"
                  name="venue"
                  placeholder="e.g., Madison Square Garden"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g., 33 E 33rd St"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                    style={{
                      backgroundColor: '#0f0f0f',
                      border: '1px solid #2a2a2a'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                    onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                    style={{
                      backgroundColor: '#0f0f0f',
                      border: '1px solid #2a2a2a'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                    onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg text-white focus:outline-none"
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#ff6b6b'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#ff5252')}
            onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#ff6b6b')}
          >
            {isLoading ? 'Submitting...' : 'Submit Event for Review'}
          </button>

          <p className="text-xs text-center" style={{ color: '#9ca3af' }}>
            All submissions are reviewed by our community moderators before being published.
          </p>
        </form>
      </div>
    </div>
  );
}
