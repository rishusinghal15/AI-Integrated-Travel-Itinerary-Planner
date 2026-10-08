import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import TravelForm from './components/TravelForm'
import ItineraryDisplay from './components/ItineraryDisplay'
import ReplanChat from './components/ReplanChat'
import API_URL from './config'

function App() {
  const { user, token, loading, logout } = useAuth()
  const [view, setView] = useState('dashboard') // dashboard | form | itinerary
  const [itinerary, setItinerary] = useState(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState('')
  const [replanning, setReplanning] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [savedId, setSavedId] = useState(null)

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', minHeight: '100vh'
      }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  const handleGenerate = async (formData) => {
    setPageLoading(true)
    setError('')
    setItinerary(null)
    setChatHistory([])
    setSavedId(null)
    setView('itinerary')

    try {
      const res = await fetch(`${API_URL}/api/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.status === 401) {
        logout()
        return
      }

      const data = await res.json()
      if (data.success) {
        setItinerary(data.itinerary)
        autoSave(data.itinerary, formData.style)
      } else {
        setError(data.message || 'Failed to generate itinerary. Please try again.')
      }
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.')
    } finally {
      setPageLoading(false)
    }
  }

  const autoSave = async (itineraryData, travelStyle) => {
    try {
      const res = await fetch(`${API_URL}/api/itineraries/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itineraryData, travelStyle })
      })

      if (res.status === 401) {
        logout()
        return
      }

      const data = await res.json()
      if (data.success) {
        setSavedId(data.itinerary._id)
        console.log('Itinerary auto-saved!')
      }
    } catch {
      console.log('Auto-save failed silently')
    }
  }

  const handleReplan = async (userMessage) => {
    setReplanning(true)
    const newHistory = [...chatHistory, { role: 'user', text: userMessage }]
    setChatHistory(newHistory)

    try {
      const res = await fetch(`${API_URL}/api/replan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itinerary, userMessage })
      })

      if (res.status === 401) {
        logout()
        return
      }

      const data = await res.json()

      if (data.success) {
        setItinerary(data.itinerary)
        if (savedId) {
          await fetch(`${API_URL}/api/itineraries/${savedId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ itineraryData: data.itinerary })
          })
        }
        setChatHistory([...newHistory, {
          role: 'ai',
          text: "✅ Done! I've updated your itinerary. Scroll up to see the changes."
        }])
      } else {
        setChatHistory([...newHistory, {
          role: 'ai',
          text: data.message || '⚠️ Sorry, I could not update the itinerary. Please try rephrasing.'
        }])
      }
    } catch {
      setChatHistory([...newHistory, {
        role: 'ai',
        text: '⚠️ Connection error. Please make sure the server is running.'
      }])
    } finally {
      setReplanning(false)
    }
  }

  const handleReset = () => {
    setItinerary(null)
    setChatHistory([])
    setError('')
    setSavedId(null)
    setView('dashboard')
  }

  const handleLoadItinerary = (itineraryData, id = null) => {
    setItinerary(itineraryData)
    setChatHistory([])
    setSavedId(id)
    setView('itinerary')
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        onNewTrip={() => setView('form')}
        onLoadItinerary={handleLoadItinerary}
      />
    )
  }

  if (view === 'form') {
    return (
      <div className="app">
        <div className="top-bar">
          <button className="back-btn" onClick={() => setView('dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="header">
          <h1>✈️ AI Integrated Travel Itinerary Planner</h1>
          <p>A Smart Personalized Travel Planning System Powered by Artificial Intelligence</p>
        </div>
        <TravelForm onGenerate={handleGenerate} />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="top-bar">
        <button className="back-btn" onClick={handleReset}>
          ← Back to Dashboard
        </button>
        {savedId && (
          <span className="saved-badge">✅ Saved to your account</span>
        )}
      </div>

      <div className="header">
        <h1>✈️ AI Integrated Travel Itinerary Planner</h1>
        <p>A Smart Personalized Travel Planning System Powered by Artificial Intelligence</p>
      </div>

      {pageLoading && (
        <div className="loading-card">
          <div className="spinner"></div>
          <h3>Planning your perfect trip...</h3>
          <p>Our AI is crafting a personalized itinerary for you</p>
        </div>
      )}

      {error && (
        <div className="form-card" style={{ color: '#e74c3c', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {itinerary && (
        <>
          <ItineraryDisplay itinerary={itinerary} onReset={handleReset} />
          <ReplanChat
            onReplan={handleReplan}
            replanning={replanning}
            chatHistory={chatHistory}
          />
        </>
      )}
    </div>
  )
}

export default App