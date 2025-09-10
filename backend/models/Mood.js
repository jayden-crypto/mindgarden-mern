const mongoose = require('mongoose');
const crypto = require('crypto');

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'stressed', 'angry'],
    required: true
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  encryptedNotes: String, // Encrypted version of notes
  triggers: [String],
  activities: [String],
  location: String,
  weather: String,
  sleepHours: Number,
  sentiment: {
    score: Number,
    magnitude: Number,
    label: String // positive, negative, neutral
  },
  isEscalated: { type: Boolean, default: false },
  escalationReason: String,
  pointsAwarded: { type: Number, default: 5 }
}, {
  timestamps: true
});

// Encrypt sensitive notes before saving
moodSchema.pre('save', function(next) {
  if (this.notes && this.isModified('notes')) {
    const algorithm = 'aes-256-cbc';
    // Ensure the key is exactly 32 bytes (64 hex characters)
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY || 'default-encryption-key-32-characters-long',
      'salt',
      32
    );
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(this.notes, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    this.encryptedNotes = iv.toString('hex') + ':' + encrypted;
    this.notes = undefined; // Remove plain text
  }
  next();
});

// Method to decrypt notes
moodSchema.methods.getDecryptedNotes = function() {
  if (!this.encryptedNotes) return null;
  
  try {
    const algorithm = 'aes-256-cbc';
    // Use the same key derivation function as in encryption
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY || 'default-encryption-key-32-characters-long',
      'salt',
      32
    );
    const [ivHex, encrypted] = this.encryptedNotes.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting notes:', error);
    return null;
  }
};

module.exports = mongoose.model('Mood', moodSchema);
