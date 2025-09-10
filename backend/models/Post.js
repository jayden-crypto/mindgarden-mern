const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    enum: ['support', 'advice', 'experience', 'question', 'celebration'],
    required: true
  },
  tags: [String],
  isAnonymous: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['active', 'flagged', 'hidden', 'removed'],
    default: 'active'
  },
  flags: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'harmful', 'off_topic', 'other']
    },
    description: String,
    flaggedAt: { type: Date, default: Date.now }
  }],
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: { type: Date, default: Date.now }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    isAnonymous: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: { type: Date, default: Date.now }
    }]
  }],
  views: { type: Number, default: 0 },
  sentiment: {
    score: Number,
    label: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ 'flags.0': 1 }); // Posts with flags

module.exports = mongoose.model('Post', postSchema);
