const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Mood = require('../models/Mood');

// Load environment variables
dotenv.config();

async function deleteAllMoods() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Delete all mood entries
    const result = await Mood.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} mood entries`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error deleting mood entries:', error);
    process.exit(1);
  }
}

// Run the function
deleteAllMoods();
