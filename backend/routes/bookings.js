const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');

const router = express.Router();

// Get all active counselors
router.get('/counselors', async (req, res) => {
  try {
    const counselors = await User.find({ 
      role: 'counselor',
      isActive: true 
    }).select('-password -__v');
    
    res.json({ counselors });
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({ message: 'Failed to fetch counselors' });
  }
});

// Create booking (students only)
router.post('/', auth, authorize('student'), [
  body('counselor').isMongoId(),
  body('sessionDate').isISO8601(),
  body('sessionTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('reason').isLength({ min: 10, max: 500 }),
  body('urgency').isIn(['low', 'medium', 'high', 'emergency']).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { counselor, sessionDate, sessionTime, reason, urgency, type, mode, notes } = req.body;

    // Verify counselor exists and is active
    const counselorUser = await User.findOne({ _id: counselor, role: 'counselor', isActive: true });
    if (!counselorUser) {
      return res.status(404).json({ message: 'Counselor not found or inactive' });
    }

    // Check for conflicting bookings
    const existingBooking = await Booking.findOne({
      counselor,
      sessionDate: new Date(sessionDate),
      sessionTime,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const booking = new Booking({
      student: req.user._id,
      counselor,
      sessionDate: new Date(sessionDate),
      sessionTime,
      reason,
      urgency: urgency || 'medium',
      type: type || 'individual',
      mode: mode || 'online',
      notes: { student: notes }
    });

    await booking.save();
    await booking.populate(['student', 'counselor'], 'name email profile');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Get all bookings (admin/counselor) or user's own bookings (student)
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      fields,
      status,
      startDate,
      endDate 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Default fields to return if none specified
    const defaultFields = 'sessionDate sessionTime status counselor student reason';
    const selectedFields = fields || defaultFields;
    
    let query = {};
    
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'counselor') {
      query.counselor = req.user._id;
    }
    
    if (status) {
      query.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .select(selectedFields)
        .populate('counselor', 'name email')
        .populate('student', 'name email')
        .sort({ sessionDate: 1, sessionTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Booking.countDocuments(query)
    ]);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
});

// Update booking status (counselors and admins)
router.patch('/:id/status', auth, authorize('counselor', 'admin'), [
  body('status').isIn(['approved', 'rejected', 'completed', 'cancelled', 'no_show']),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes, meetingLink, location } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Counselors can only update their own bookings
    if (req.user.role === 'counselor' && !booking.counselor.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = status;
    if (notes) {
      booking.notes.counselor = notes;
    }
    if (meetingLink) {
      booking.meetingLink = meetingLink;
    }
    if (location) {
      booking.location = location;
    }

    await booking.save();
    await booking.populate(['student', 'counselor'], 'name email profile');

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

// Submit feedback (students only)
router.post('/:id/feedback', auth, authorize('student'), [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only provide feedback for completed sessions' });
    }

    booking.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await booking.save();

    res.json({
      message: 'Feedback submitted successfully',
      booking
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// Get available counselors
router.get('/counselors', auth, async (req, res) => {
  try {
    const counselors = await User.find({
      role: 'counselor',
      isActive: true
    }).select('name profile.specialization profile.experience profile.availability');

    res.json({ counselors });
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({ message: 'Failed to get counselors' });
  }
});

// Get booking statistics (counselors and admins)
router.get('/stats', auth, authorize('counselor', 'admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let matchQuery = { createdAt: { $gte: startDate } };
    
    if (req.user.role === 'counselor') {
      matchQuery.counselor = req.user._id;
    }

    const stats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          averageRating: { $avg: '$feedback.rating' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalBookings: 0,
      pendingBookings: 0,
      approvedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      averageRating: 0
    });
  } catch (error) {
    console.error('Booking stats error:', error);
    res.status(500).json({ message: 'Failed to get booking statistics' });
  }
});

module.exports = router;
