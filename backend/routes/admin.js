const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Mood = require('../models/Mood');
const Booking = require('../models/Booking');
const Post = require('../models/Post');
const Escalation = require('../models/Escalation');
const Resource = require('../models/Resource');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, authorize('admin', 'counselor'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Basic counts
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalCounselors = await User.countDocuments({ role: 'counselor' });
    const activeUsers = await User.countDocuments({ 
      role: 'student',
      lastLogin: { $gte: startDate }
    });

    // Mood statistics
    const totalMoods = await Mood.countDocuments({
      createdAt: { $gte: startDate }
    });

    const moodTrends = await Mood.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          averageIntensity: { $avg: "$intensity" },
          count: { $sum: 1 },
          moodDistribution: {
            $push: "$mood"
          }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Booking statistics
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate }
    });

    const bookingStats = await Booking.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Post statistics
    const totalPosts = await Post.countDocuments({
      createdAt: { $gte: startDate }
    });

    const flaggedPosts = await Post.countDocuments({
      'flags.0': { $exists: true }
    });

    // Escalation statistics
    const totalEscalations = await Escalation.countDocuments({
      createdAt: { $gte: startDate }
    });

    const escalationsByStatus = await Escalation.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const escalationsBySeverity = await Escalation.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      users: {
        total: totalUsers,
        counselors: totalCounselors,
        active: activeUsers,
        activePercentage: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(1) : 0
      },
      moods: {
        total: totalMoods,
        trends: moodTrends,
        averagePerDay: totalMoods / days
      },
      bookings: {
        total: totalBookings,
        byStatus: bookingStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      posts: {
        total: totalPosts,
        flagged: flaggedPosts
      },
      escalations: {
        total: totalEscalations,
        byStatus: escalationsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bySeverity: escalationsBySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

// Get all escalations
router.get('/escalations', auth, authorize('admin', 'counselor'), async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const escalations = await Escalation.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name')
      .populate('triggerData.moodId')
      .populate('triggerData.postId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Escalation.countDocuments(query);

    res.json({
      escalations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get escalations error:', error);
    res.status(500).json({ message: 'Failed to get escalations' });
  }
});

// Update escalation
router.patch('/escalations/:id', auth, authorize('admin', 'counselor'), async (req, res) => {
  try {
    const { status, assignedTo, notes, priority } = req.body;
    
    const escalation = await Escalation.findById(req.params.id);
    if (!escalation) {
      return res.status(404).json({ message: 'Escalation not found' });
    }

    if (status) escalation.status = status;
    if (assignedTo) escalation.assignedTo = assignedTo;
    if (priority) escalation.priority = priority;

    if (notes) {
      escalation.actions.push({
        type: 'follow_up',
        description: 'Status updated',
        performedBy: req.user._id,
        notes
      });
    }

    if (status === 'resolved') {
      escalation.resolution = {
        outcome: 'Resolved by admin/counselor',
        notes: notes || 'Marked as resolved',
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      };
    }

    await escalation.save();
    await escalation.populate(['userId', 'assignedTo'], 'name email');

    res.json({
      message: 'Escalation updated successfully',
      escalation
    });
  } catch (error) {
    console.error('Update escalation error:', error);
    res.status(500).json({ message: 'Failed to update escalation' });
  }
});

// Get all users
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (role) query.role = role;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Update user status
router.patch('/users/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: { id: user._id, name: user.name, isActive: user.isActive }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Get system health
router.get('/health', auth, authorize('admin'), async (req, res) => {
  try {
    const dbStatus = await checkDatabaseHealth();
    const apiStatus = await checkAPIHealth();
    
    res.json({
      database: dbStatus,
      api: apiStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ message: 'Health check failed' });
  }
});

// Export data (anonymized)
router.get('/export', auth, authorize('admin'), async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    let data = {};

    if (type === 'moods' || !type) {
      data.moods = await Mood.find(
        dateFilter.createdAt ? { createdAt: dateFilter } : {}
      ).select('mood intensity createdAt -_id -userId');
    }

    if (type === 'bookings' || !type) {
      data.bookings = await Booking.find(
        dateFilter.createdAt ? { createdAt: dateFilter } : {}
      ).select('status type urgency sessionDate createdAt -_id -student -counselor');
    }

    if (type === 'posts' || !type) {
      data.posts = await Post.find(
        dateFilter.createdAt ? { createdAt: dateFilter } : {}
      ).select('category sentiment.label views likes createdAt -_id -author');
    }

    res.json({
      message: 'Data exported successfully (anonymized)',
      exportDate: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

// Helper functions
async function checkDatabaseHealth() {
  try {
    await User.findOne().limit(1);
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

async function checkAPIHealth() {
  try {
    // Check if OpenAI API key is configured
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    return {
      status: 'healthy',
      services: {
        openai: openaiConfigured ? 'configured' : 'not configured'
      }
    };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

module.exports = router;
