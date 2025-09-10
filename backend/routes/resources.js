const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Resource = require('../models/Resource');

const router = express.Router();

// Get all resources (public)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      type, 
      search, 
      difficulty, 
      page = 1, 
      limit = 12,
      featured 
    } = req.query;

    let query = { isPublished: true };

    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (featured === 'true') query.isFeatured = true;

    if (search) {
      query.$text = { $search: search };
    }

    const resources = await Resource.find(query)
      .populate('createdBy', 'name')
      .sort(search ? { score: { $meta: 'textScore' } } : { isFeatured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments(query);

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Failed to get resources' });
  }
});

// Get single resource
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy', 'name profile.specialization');

    if (!resource || !resource.isPublished) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json({ resource });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Failed to get resource' });
  }
});

// Create resource (counselors and admins)
router.post('/', auth, authorize('counselor', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').isLength({ min: 10, max: 1000 }),
  body('content').isLength({ min: 50 }),
  body('type').isIn(['article', 'video', 'audio', 'pdf', 'link']),
  body('category').isIn(['anxiety', 'depression', 'stress', 'relationships', 'academic', 'self_care', 'mindfulness', 'emergency']),
  body('author').trim().isLength({ min: 2 }),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      content,
      type,
      category,
      tags,
      url,
      author,
      source,
      difficulty,
      duration
    } = req.body;

    const resource = new Resource({
      title,
      description,
      content,
      type,
      category,
      tags: tags || [],
      url,
      author,
      source,
      difficulty: difficulty || 'beginner',
      duration,
      createdBy: req.user._id,
      lastUpdated: new Date()
    });

    await resource.save();
    await resource.populate('createdBy', 'name');

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Failed to create resource' });
  }
});

// Update resource (counselors and admins)
router.put('/:id', auth, authorize('counselor', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 200 }).optional(),
  body('description').isLength({ min: 10, max: 1000 }).optional(),
  body('content').isLength({ min: 50 }).optional(),
  body('type').isIn(['article', 'video', 'audio', 'pdf', 'link']).optional(),
  body('category').isIn(['anxiety', 'depression', 'stress', 'relationships', 'academic', 'self_care', 'mindfulness', 'emergency']).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check ownership (counselors can only edit their own resources)
    if (req.user.role === 'counselor' && !resource.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateFields = [
      'title', 'description', 'content', 'type', 'category', 
      'tags', 'url', 'author', 'source', 'difficulty', 'duration'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    resource.lastUpdated = new Date();
    await resource.save();
    await resource.populate('createdBy', 'name');

    res.json({
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ message: 'Failed to update resource' });
  }
});

// Toggle featured status (admins only)
router.patch('/:id/featured', auth, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.isFeatured = !resource.isFeatured;
    await resource.save();

    res.json({
      message: `Resource ${resource.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      resource
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Failed to update featured status' });
  }
});

// Delete resource (admins only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
});

// Get resource categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    { value: 'anxiety', label: 'Anxiety & Panic' },
    { value: 'depression', label: 'Depression & Mood' },
    { value: 'stress', label: 'Stress Management' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'academic', label: 'Academic Pressure' },
    { value: 'self_care', label: 'Self Care' },
    { value: 'mindfulness', label: 'Mindfulness & Meditation' },
    { value: 'emergency', label: 'Crisis Resources' }
  ];

  res.json({ categories });
});

// Like resource (authenticated users)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.likes += 1;
    await resource.save();

    res.json({
      message: 'Resource liked successfully',
      likes: resource.likes
    });
  } catch (error) {
    console.error('Like resource error:', error);
    res.status(500).json({ message: 'Failed to like resource' });
  }
});

module.exports = router;
