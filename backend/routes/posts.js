const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Post = require('../models/Post');
const llmService = require('../services/llm');

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      page = 1, 
      limit = 10,
      status = 'active'
    } = req.query;

    let query = { status };

    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Remove author info for anonymous posts
    const sanitizedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (post.isAnonymous) {
        postObj.author = { name: 'Anonymous' };
      }
      return postObj;
    });

    const total = await Post.countDocuments(query);

    res.json({
      posts: sanitizedPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to get posts' });
  }
});

// Create post
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('content').isLength({ min: 10, max: 5000 }),
  body('category').isIn(['support', 'advice', 'experience', 'question', 'celebration']),
  body('isAnonymous').isBoolean().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags, isAnonymous = true } = req.body;

    // Analyze sentiment
    const sentiment = llmService.analyzeSentiment(content);

    const post = new Post({
      author: req.user._id,
      title,
      content,
      category,
      tags: tags || [],
      isAnonymous,
      sentiment
    });

    await post.save();
    await post.populate('author', 'name');

    // Sanitize response for anonymous posts
    const responsePost = post.toObject();
    if (post.isAnonymous) {
      responsePost.author = { name: 'Anonymous' };
    }

    res.status(201).json({
      message: 'Post created successfully',
      post: responsePost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name')
      .populate('comments.author', 'name');

    if (!post || post.status !== 'active') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    // Sanitize response for anonymous posts
    const responsePost = post.toObject();
    if (post.isAnonymous) {
      responsePost.author = { name: 'Anonymous' };
    }

    // Sanitize comments
    responsePost.comments = responsePost.comments.map(comment => {
      if (comment.isAnonymous) {
        comment.author = { name: 'Anonymous' };
      }
      return comment;
    });

    res.json({ post: responsePost });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Failed to get post' });
  }
});

// Like post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked
    const existingLike = post.likes.find(like => like.userId.equals(req.user._id));
    
    if (existingLike) {
      // Remove like
      post.likes = post.likes.filter(like => !like.userId.equals(req.user._id));
    } else {
      // Add like
      post.likes.push({ userId: req.user._id });
    }

    await post.save();

    res.json({
      message: existingLike ? 'Like removed' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
});

// Add comment
router.post('/:id/comments', auth, [
  body('content').isLength({ min: 1, max: 1000 }),
  body('isAnonymous').isBoolean().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, isAnonymous = true } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      author: req.user._id,
      content,
      isAnonymous
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'name');

    // Get the new comment
    const newComment = post.comments[post.comments.length - 1].toObject();
    if (newComment.isAnonymous) {
      newComment.author = { name: 'Anonymous' };
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Flag post
router.post('/:id/flag', auth, [
  body('reason').isIn(['inappropriate', 'spam', 'harmful', 'off_topic', 'other']),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason, description } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already flagged this post
    const existingFlag = post.flags.find(flag => flag.userId.equals(req.user._id));
    if (existingFlag) {
      return res.status(400).json({ message: 'You have already flagged this post' });
    }

    post.flags.push({
      userId: req.user._id,
      reason,
      description
    });

    // Auto-hide post if it gets multiple flags
    if (post.flags.length >= 3) {
      post.status = 'flagged';
    }

    await post.save();

    res.json({
      message: 'Post flagged successfully',
      flagsCount: post.flags.length
    });
  } catch (error) {
    console.error('Flag post error:', error);
    res.status(500).json({ message: 'Failed to flag post' });
  }
});

// Get flagged posts (counselors and admins)
router.get('/moderation/flagged', auth, authorize('counselor', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      $or: [
        { status: 'flagged' },
        { 'flags.0': { $exists: true } }
      ]
    })
    .populate('author', 'name')
    .populate('flags.userId', 'name')
    .sort({ 'flags.0.flaggedAt': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      $or: [
        { status: 'flagged' },
        { 'flags.0': { $exists: true } }
      ]
    });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get flagged posts error:', error);
    res.status(500).json({ message: 'Failed to get flagged posts' });
  }
});

// Moderate post (counselors and admins)
router.patch('/:id/moderate', auth, authorize('counselor', 'admin'), [
  body('action').isIn(['approve', 'hide', 'remove']),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, notes } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const statusMap = {
      approve: 'active',
      hide: 'hidden',
      remove: 'removed'
    };

    post.status = statusMap[action];
    post.moderationNotes = notes;
    post.moderatedBy = req.user._id;
    post.moderatedAt = new Date();

    await post.save();

    res.json({
      message: `Post ${action}d successfully`,
      post
    });
  } catch (error) {
    console.error('Moderate post error:', error);
    res.status(500).json({ message: 'Failed to moderate post' });
  }
});

// Get post categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    { value: 'support', label: 'Support & Encouragement' },
    { value: 'advice', label: 'Advice & Tips' },
    { value: 'experience', label: 'Personal Experience' },
    { value: 'question', label: 'Questions' },
    { value: 'celebration', label: 'Celebrations & Wins' }
  ];

  res.json({ categories });
});

module.exports = router;
