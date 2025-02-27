require('dotenv').config({ path: '../config.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/smart_parking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'user@test.com' });
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: user@test.com');
      console.log('Password: Test@123');
      process.exit(0);
    }

    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test@123', salt);

    const user = new User({
      name: 'Test User',
      email: 'user@test.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'user'
    });

    await user.save();
    console.log('Test user created successfully');
    console.log('Email: user@test.com');
    console.log('Password: Test@123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestUser();
