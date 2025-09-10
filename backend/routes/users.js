const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('profile.age').optional().isInt({ min: 16, max: 100 }),
  body('profile.gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('profile.university').optional().trim().isLength({ max: 100 }),
  body('profile.course').optional().trim().isLength({ max: 100 }),
  body('profile.year').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    if (req.body.name) user.name = req.body.name;

    // Update profile fields
    const profileFields = ['age', 'gender', 'university', 'course', 'year', 'bio'];
    profileFields.forEach(field => {
      if (req.body.profile && req.body.profile[field] !== undefined) {
        user.profile[field] = req.body.profile[field];
      }
    });

    // Update counselor-specific fields
    if (user.role === 'counselor') {
      if (req.body.profile?.specialization) {
        user.profile.specialization = req.body.profile.specialization;
      }
      if (req.body.profile?.experience !== undefined) {
        user.profile.experience = req.body.profile.experience;
      }
      if (req.body.profile?.availability) {
        user.profile.availability = req.body.profile.availability;
      }
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Update preferences
router.patch('/preferences', auth, [
  body('notifications').optional().isBoolean(),
  body('privacy').optional().isIn(['public', 'private']),
  body('theme').optional().isIn(['light', 'dark'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { notifications, privacy, theme } = req.body;

    if (notifications !== undefined) user.preferences.notifications = notifications;
    if (privacy) user.preferences.privacy = privacy;
    if (theme) user.preferences.theme = theme;

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

// Change password
router.patch('/password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Delete account
router.delete('/account', auth, [
  body('password').exists(),
  body('confirmation').equals('DELETE_MY_ACCOUNT')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    user.email = `deleted_${user._id}@mindgarden.deleted`;
    await user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
