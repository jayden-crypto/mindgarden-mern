const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Mood = require('../models/Mood');
const User = require('../models/User');
const Escalation = require('../models/Escalation');
const llmService = require('../services/llm');

const router = express.Router();

// Log mood
router.post('/', auth, [
  body('mood').isIn(['very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'stressed', 'angry']),
  body('intensity').isInt({ min: 1, max: 10 }),
  body('notes').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mood, intensity, notes, triggers, activities, location, weather, sleepHours } = req.body;

    // Analyze sentiment if notes provided
    let sentiment = null;
    let escalationNeeded = false;
    let escalationReason = '';

    if (notes) {
      sentiment = llmService.analyzeSentiment(notes);
      
      // Check for emergency keywords
      const emergencyDetected = llmService.detectEmergency(notes);
      if (emergencyDetected) {
        escalationNeeded = true;
        escalationReason = 'Emergency keywords detected in mood notes';
      } else if (sentiment.label === 'negative' && sentiment.magnitude > 0.7) {
        escalationNeeded = true;
        escalationReason = 'High negative sentiment detected';
      }
    }

    // Check mood-based escalation
    if (['very_sad', 'anxious', 'stressed'].includes(mood) && intensity >= 8) {
      escalationNeeded = true;
      escalationReason = escalationReason || 'High intensity negative mood';
    }

    const moodEntry = new Mood({
      userId: req.user._id,
      mood,
      intensity,
      notes,
      triggers: triggers || [],
      activities: activities || [],
      location,
      weather,
      sleepHours,
      sentiment,
      isEscalated: escalationNeeded,
      escalationReason
    });

    await moodEntry.save();

    // Award points and update garden
    const pointsAwarded = calculateMoodPoints(mood, intensity);
    await updateUserGarden(req.user._id, pointsAwarded);

    // Create escalation if needed
    if (escalationNeeded) {
      await createMoodEscalation(req.user._id, moodEntry._id, escalationReason, sentiment);
    }

    res.status(201).json({
      message: 'Mood logged successfully',
      mood: moodEntry,
      pointsAwarded,
      escalated: escalationNeeded
    });
  } catch (error) {
    console.error('Mood logging error:', error);
    res.status(500).json({ message: 'Failed to log mood' });
  }
});

// Get mood history with field selection and pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 5, fields, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Default fields to return if none specified
    const defaultFields = 'mood intensity createdAt notes';
    const selectedFields = fields || defaultFields;
    
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [moods, total] = await Promise.all([
      Mood.find(query)
        .select(selectedFields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Mood.countDocuments(query)
    ]);

    res.json({
      moods,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({ message: 'Failed to get mood history' });
  }
});

// Get mood analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await Mood.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Calculate analytics
    const analytics = {
      totalEntries: moods.length,
      averageIntensity: moods.reduce((sum, mood) => sum + mood.intensity, 0) / moods.length || 0,
      moodDistribution: {},
      weeklyTrends: [],
      commonTriggers: {},
      improvementScore: 0
    };

    // Mood distribution
    moods.forEach(mood => {
      analytics.moodDistribution[mood.mood] = (analytics.moodDistribution[mood.mood] || 0) + 1;
    });

    // Weekly trends
    const weeklyData = {};
    moods.forEach(mood => {
      const week = getWeekKey(mood.createdAt);
      if (!weeklyData[week]) {
        weeklyData[week] = { total: 0, sum: 0 };
      }
      weeklyData[week].total++;
      weeklyData[week].sum += mood.intensity;
    });

    analytics.weeklyTrends = Object.keys(weeklyData).map(week => ({
      week,
      averageIntensity: weeklyData[week].sum / weeklyData[week].total,
      entries: weeklyData[week].total
    }));

    // Common triggers
    moods.forEach(mood => {
      if (mood.triggers) {
        mood.triggers.forEach(trigger => {
          analytics.commonTriggers[trigger] = (analytics.commonTriggers[trigger] || 0) + 1;
        });
      }
    });

    res.json(analytics);
  } catch (error) {
    console.error('Mood analytics error:', error);
    res.status(500).json({ message: 'Failed to get mood analytics' });
  }
});

// Helper functions
function calculateMoodPoints(mood, intensity) {
  const basePo = { 
    'very_happy': 10, 'happy': 8, 'neutral': 5, 
    'sad': 3, 'very_sad': 2, 'anxious': 3, 'stressed': 3, 'angry': 3 
  };
  
  const base = basePo[mood] || 5;
  return Math.max(1, base + Math.floor(intensity / 2));
}

async function updateUserGarden(userId, points) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.garden.points += points;
    
    // Update streak
    const today = new Date();
    const lastActivity = user.garden.lastActivity;
    
    if (lastActivity) {
      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        user.garden.streak++;
      } else if (daysDiff > 1) {
        user.garden.streak = 1;
      }
    } else {
      user.garden.streak = 1;
    }

    user.garden.lastActivity = today;

    // Level up logic
    const newLevel = Math.floor(user.garden.points / 100) + 1;
    if (newLevel > user.garden.level) {
      user.garden.level = newLevel;
      // Award new plant
      const plants = ['seedling', 'flower', 'tree', 'garden', 'forest'];
      const plantIndex = Math.min(newLevel - 1, plants.length - 1);
      user.garden.plants.push({
        type: plants[plantIndex],
        level: 1,
        unlockedAt: today
      });
    }

    await user.save();
  } catch (error) {
    console.error('Garden update error:', error);
  }
}

async function createMoodEscalation(userId, moodId, reason, sentiment) {
  try {
    const severity = sentiment && sentiment.magnitude > 0.8 ? 'high' : 'medium';
    
    const escalation = new Escalation({
      userId,
      type: 'mood',
      severity,
      triggerData: {
        moodId,
        sentimentScore: sentiment?.score
      },
      description: reason
    });

    await escalation.save();
  } catch (error) {
    console.error('Escalation creation error:', error);
  }
}

function getWeekKey(date) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return startOfWeek.toISOString().split('T')[0];
}

module.exports = router;
