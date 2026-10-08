const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://ai-integrated-travel-itinerary-plan.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const itineraryRoutes = require('./routes/itinerary');
app.use('/api', itineraryRoutes);

const replanningRoutes = require('./routes/replanning');
app.use('/api', replanningRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const savedItineraryRoutes = require('./routes/savedItineraries');
app.use('/api/itineraries', savedItineraryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Travel Planner API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});