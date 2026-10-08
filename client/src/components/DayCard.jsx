export default function DayCard({ day, totalDays }) {

    const openMaps = (locationName) => {
        const query = encodeURIComponent(locationName)
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer')
    }

    const bookHotel = (platform, hotelName, location) => {
        const hotel = encodeURIComponent(hotelName)
        const place = encodeURIComponent(location || hotelName)
        const urls = {
            makemytrip: `https://www.makemytrip.com/hotels/hotel-listing/?city=${place}&searchText=${hotel}`,
            goibibo: `https://www.goibibo.com/hotels/hotels-in-${place.toLowerCase()}/`,
            agoda: `https://www.agoda.com/search?city=${place}&textToSearch=${hotel}`
        }
        window.open(urls[platform], '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="day-card">
            <div className="day-header">
                <span className="day-number">Day {day.day}</span>
                <span className="day-theme">{day.theme}</span>
                <span className="day-total">Est. {day.estimatedDailyTotal}</span>
            </div>

            <div className="slots-grid">
                {['morning', 'afternoon', 'evening'].map(slot => (
                    day[slot] && (
                        <div className="slot" key={slot}>
                            <div className="slot-title">
                                {slot === 'morning' ? '🌅' : slot === 'afternoon' ? '☀️' : '🌙'} {slot}
                            </div>
                            <h4>{day[slot].activity}</h4>
                            <p>{day[slot].description}</p>
                            <p>⏱ {day[slot].duration}</p>
                            <p className="cost">{day[slot].cost}</p>
                            {day[slot].locationName && (
                                <button
                                    className="maps-btn"
                                    onClick={() => openMaps(day[slot].locationName)}
                                >
                                    📍 View on Maps
                                </button>
                            )}
                        </div>
                    )
                ))}
            </div>

            {day.food && (
                <div className="food-section">
                    <h4>🍽️ Food Recommendations</h4>
                    <div className="food-grid">
                        {['breakfast', 'lunch', 'dinner'].map(meal => (
                            <div className="food-item" key={meal}>
                                <strong>{meal.charAt(0).toUpperCase() + meal.slice(1)}</strong>
                                {day.food[meal]}
                                <button
                                    className="maps-btn"
                                    style={{ marginTop: '6px' }}
                                    onClick={() => openMaps(day.food[meal].split(' - ')[0])}
                                >
                                    📍 View on Maps
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {day.accommodation && day.day !== totalDays && (
                <div className="stay-section">
                    <h4>🏨 Where to Stay</h4>
                    <p><strong>{day.accommodation.name}</strong> — {day.accommodation.type}</p>
                    <p style={{ color: '#8e44ad', marginTop: '4px', marginBottom: '10px' }}>
                        {day.accommodation.estimatedCost}
                    </p>
                    <div className="booking-buttons">
                        <button className="book-btn mmt" onClick={() => bookHotel('makemytrip', day.accommodation.name, day.accommodation.location)}>
                            🏨 MakeMyTrip
                        </button>
                        <button className="book-btn goibibo" onClick={() => bookHotel('goibibo', day.accommodation.name, day.accommodation.location)}>
                            🏨 Goibibo
                        </button>
                        <button className="book-btn agoda" onClick={() => bookHotel('agoda', day.accommodation.name, day.accommodation.location)}>
                            🏨 Agoda
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}