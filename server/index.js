const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Validate environment variables on startup (fails fast if invalid/missing)
const { validateEnv } = require('./config/env');
const env = validateEnv();

const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust reverse proxy (e.g. Render, Heroku) for accurate client IP in rate limiting
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(helmet());

// Dynamic CORS configuration
const clientUrls = (env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...clientUrls,
  ...(env.NODE_ENV !== 'production'
    ? ['http://localhost:5173', 'http://127.0.0.1:5173']
    : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Apply general rate limiter to all /api routes
app.use('/api', apiLimiter);

// MongoDB connection
mongoose.connect(env.MONGO_URI)
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

// Central 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Not Found - ${req.method} ${req.originalUrl}`
  });
});

// Central error-handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Not allowed by CORS' });
  }

  const statusCode = err.status || err.statusCode || (res.statusCode >= 400 && res.statusCode < 600 ? res.statusCode : 500);

  const response = {
    message: err.message || 'Internal Server Error'
  };

  if (err.code) {
    response.code = err.code;
  }

  // Never leak stack traces in production
  if (env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// Start HTTP server
const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));