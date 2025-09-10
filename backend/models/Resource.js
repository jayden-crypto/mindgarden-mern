const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'audio', 'pdf', 'link'],
    required: true
  },
  category: {
    type: String,
    enum: ['anxiety', 'depression', 'stress', 'relationships', 'academic', 'self_care', 'mindfulness', 'emergency'],
    required: true
  },
  tags: [String],
  url: String, // For external resources
  fileUrl: String, // For uploaded files
  author: {
    type: String,
    required: true
  },
  source: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: Number, // in minutes
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: Date
}, {
  timestamps: true
});

// Text search index
resourceSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text'
});

// Category and type indexes
resourceSchema.index({ category: 1, type: 1 });
resourceSchema.index({ isPublished: 1, isFeatured: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
