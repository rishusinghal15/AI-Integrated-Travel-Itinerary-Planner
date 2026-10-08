import { useState } from 'react'

export default function TravelForm({ onGenerate }) {
    const [form, setForm] = useState({
        destination: '',
        days: '3',
        budget: '',
        travelers: '2',
        style: 'balanced'
    })
    const [error, setError] = useState('')

    const handleChange = (e) => {
        if (error) setError('')
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        if (!form.destination.trim() || !form.budget) {
            setError('Please fill in both destination and budget!')
            return
        }
        setError('')
        onGenerate(form)
    }

    return (
        <div className="form-card">
            <h2>🗺️ Plan Your Dream Trip</h2>
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Destination</label>
                    <input
                        name="destination"
                        placeholder="e.g. Goa, Rajasthan, Manali, Kerala..."
                        value={form.destination}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Number of Days</label>
                    <input
                        name="days"
                        type="number"
                        min="1" max="14"
                        value={form.days}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Total Trip Budget (₹)</label>
                    <input
                        name="budget"
                        type="number"
                        placeholder="e.g. 15000 (covers everything)"
                        value={form.budget}
                        onChange={handleChange}
                    />
                    {form.budget && form.days && (
                        <span style={{ fontSize: '0.8rem', color: '#667eea', marginTop: '4px' }}>
                            ≈ ₹{Math.round(form.budget / form.days).toLocaleString()} per day
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Number of Travelers</label>
                    <input
                        name="travelers"
                        type="number"
                        min="1" max="20"
                        value={form.travelers}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Travel Style</label>
                    <select name="style" value={form.style} onChange={handleChange}>
                        <option value="balanced">Balanced (Mix of everything)</option>
                        <option value="adventure">Adventure & Outdoors</option>
                        <option value="cultural">Cultural & Historical</option>
                        <option value="food">Food & Local Experience</option>
                        <option value="relaxation">Relaxation & Leisure</option>
                        <option value="budget">Budget Backpacker</option>
                        <option value="luxury">Luxury Experience</option>
                    </select>
                </div>
            </div>

            {error && (
                <div
                    className="form-error"
                    style={{
                        color: '#e53e3e',
                        backgroundColor: '#fff5f5',
                        border: '1px solid #fed7d7',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            <button className="generate-btn" onClick={handleSubmit}>
                🤖 Generate My Itinerary with AI
            </button>
        </div>
    )
}