const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['mood', 'chat', 'post', 'manual'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  triggerData: {
    moodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mood'
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    chatMessage: String,
    keywords: [String],
    sentimentScore: Number
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'false_positive'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actions: [{
    type: {
      type: String,
      enum: ['contacted', 'booking_created', 'resources_shared', 'emergency_contacted', 'follow_up']
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: { type: Date, default: Date.now },
    notes: String
  }],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    contacted: Boolean,
    contactedAt: Date
  }],
  resolution: {
    outcome: String,
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
escalationSchema.index({ userId: 1, status: 1 });
escalationSchema.index({ severity: 1, status: 1 });
escalationSchema.index({ assignedTo: 1, status: 1 });
escalationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Escalation', escalationSchema);
