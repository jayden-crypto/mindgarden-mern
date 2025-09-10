const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindgarden', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('../models/User');

async function resetAdminPassword() {
  try {
    const newPassword = 'Admin@1234';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const result = await User.updateOne(
      { email: 'admin@mindgarden.com' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password reset result:', result);
    console.log('Admin password has been reset to: Admin@1234');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
