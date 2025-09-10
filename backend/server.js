const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} else {
  require('dotenv').config({ path: path.resolve(__dirname, '.env.production') });
}

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const moodRoutes = require('./routes/moods');
const bookingRoutes = require('./routes/bookings');
const resourceRoutes = require('./routes/resources');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const gardenRoutes = require('./routes/garden');

const app = express();

// Security middleware
app.use(helmet());
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://cozy-sprinkles-8053d7.netlify.app',
      'https://mindgarden-backend-production-0dab.up.railway.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:5173',
      'http://localhost:5001',
      'http://127.0.0.1:5001',
      'https://*.netlify.app',
      'https://*.railway.app'
    ];
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return (
        origin === allowedOrigin ||
        (allowedOrigin.includes('*') && 
         origin.endsWith(allowedOrigin.split('*')[1]))
      );
    });
    
    if (!isAllowed) {
      console.log('CORS blocked origin:', origin);
      const msg = `The CORS policy for this site does not allow access from ${origin}.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Access-Token',
    'X-Refresh-Token'
  ],
  exposedHeaders: [
    'Authorization',
    'X-Access-Token',
    'X-Refresh-Token',
    'Content-Length',
    'Content-Type'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindgarden', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/garden', gardenRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle CORS errors
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({ 
      success: false, 
      message: err.message 
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      error: err.name
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Default error response
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
