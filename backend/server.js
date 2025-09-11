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

// Trust first proxy (required for Railway)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
// CORS configuration
const allowedOrigins = [
  'https://cozy-sprinkles-8053d7.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Apply CORS with the configuration
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    // Use the X-Forwarded-For header since we're behind a proxy
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Provided' : 'Not provided');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindgarden', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.error('MongoDB URI used:', process.env.MONGODB_URI || 'mongodb://localhost:27017/mindgarden');
    process.exit(1); // Exit with failure
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

// Initialize database connection
connectDB();

// API Routes with /api prefix
app.use(cors(corsOptions));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/garden', gardenRoutes);

// Health check endpoint (public access)
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
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
