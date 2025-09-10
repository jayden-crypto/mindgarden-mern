const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'counselor', 'admin'],
    default: 'student'
  },
  profile: {
    age: Number,
    gender: String,
    university: String,
    course: String,
    year: Number,
    bio: String,
    specialization: String, // For counselors
    experience: Number, // For counselors
    availability: [{
      day: String,
      startTime: String,
      endTime: String
    }]
  },
  garden: {
    level: { type: Number, default: 1 },
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActivity: Date,
    plants: [{
      type: { type: String },
      level: { type: Number },
      unlockedAt: { type: Date }
    }],
    badges: [{
      name: { type: String },
      description: { type: String },
      earnedAt: { type: Date },
      icon: { type: String }
    }]
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    privacy: { type: String, enum: ['public', 'private'], default: 'private' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  consentGiven: { type: Boolean, default: false },
  consentDate: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing password for user:', this.email);
    console.log('Stored hash:', this.password);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
