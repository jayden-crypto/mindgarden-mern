const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionDate: {
    type: Date,
    required: true
  },
  sessionTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60 // minutes
  },
  type: {
    type: String,
    enum: ['individual', 'group', 'emergency'],
    default: 'individual'
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  notes: {
    student: String,
    counselor: String,
    admin: String
  },
  meetingLink: String,
  location: String,
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },
  reminderSent: { type: Boolean, default: false },
  followUpScheduled: Date
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ student: 1, sessionDate: 1 });
bookingSchema.index({ counselor: 1, sessionDate: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
