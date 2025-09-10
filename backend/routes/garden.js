const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user's garden
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('garden');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ garden: user.garden });
  } catch (error) {
    console.error('Get garden error:', error);
    res.status(500).json({ message: 'Failed to get garden' });
  }
});

// Award points manually (for testing or special achievements)
router.post('/points', auth, async (req, res) => {
  try {
    const { points, reason } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Valid points amount required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldLevel = user.garden.level;
    user.garden.points += points;

    // Check for level up
    const newLevel = Math.floor(user.garden.points / 100) + 1;
    let leveledUp = false;
    
    if (newLevel > oldLevel) {
      user.garden.level = newLevel;
      leveledUp = true;
      
      // Award new plant
      const plants = ['seedling', 'flower', 'tree', 'garden', 'forest'];
      const plantIndex = Math.min(newLevel - 1, plants.length - 1);
      
      user.garden.plants.push({
        type: plants[plantIndex],
        level: 1,
        unlockedAt: new Date()
      });

      // Award badge for leveling up
      user.garden.badges.push({
        name: `Level ${newLevel} Gardener`,
        description: `Reached garden level ${newLevel}`,
        earnedAt: new Date(),
        icon: '🌱'
      });
    }

    await user.save();

    res.json({
      message: 'Points awarded successfully',
      pointsAwarded: points,
      totalPoints: user.garden.points,
      leveledUp,
      newLevel: leveledUp ? newLevel : null,
      reason
    });
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({ message: 'Failed to award points' });
  }
});

// Get available badges
router.get('/badges', auth, async (req, res) => {
  try {
    const availableBadges = [
      {
        name: 'First Steps',
        description: 'Logged your first mood',
        icon: '👣',
        requirement: 'Log 1 mood entry'
      },
      {
        name: 'Consistent Tracker',
        description: 'Logged moods for 7 days straight',
        icon: '📅',
        requirement: '7-day streak'
      },
      {
        name: 'Wellness Warrior',
        description: 'Logged moods for 30 days straight',
        icon: '⚡',
        requirement: '30-day streak'
      },
      {
        name: 'Community Helper',
        description: 'Made your first community post',
        icon: '🤝',
        requirement: 'Create 1 community post'
      },
      {
        name: 'Resource Explorer',
        description: 'Read 10 wellness resources',
        icon: '📚',
        requirement: 'View 10 resources'
      },
      {
        name: 'Self Care Champion',
        description: 'Completed 5 wellness activities',
        icon: '🏆',
        requirement: 'Complete 5 activities'
      }
    ];

    const user = await User.findById(req.user._id).select('garden');
    
    res.json({
      availableBadges,
      earnedBadges: user.garden.badges
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Failed to get badges' });
  }
});

// Get garden leaderboard (anonymous)
router.get('/leaderboard', auth, async (req, res) => {
  try {
    // Note: This is kept private as per requirements - no public leaderboards
    // Only return user's own ranking
    const user = await User.findById(req.user._id).select('garden name');
    
    const userRank = await User.countDocuments({
      'garden.points': { $gt: user.garden.points }
    }) + 1;

    const totalUsers = await User.countDocuments({ role: 'student' });

    res.json({
      userRank,
      totalUsers,
      userPoints: user.garden.points,
      userLevel: user.garden.level,
      message: 'Rankings are kept private to maintain a supportive environment'
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to get leaderboard' });
  }
});

// Update garden preferences
router.patch('/preferences', auth, async (req, res) => {
  try {
    const { theme, notifications } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (theme) user.preferences.theme = theme;
    if (notifications !== undefined) user.preferences.notifications = notifications;

    await user.save();

    res.json({
      message: 'Garden preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update garden preferences error:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

module.exports = router;
