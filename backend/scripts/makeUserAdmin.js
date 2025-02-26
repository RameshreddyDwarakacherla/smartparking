require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        console.error('User not found');
        process.exit(1);
      }

      user.role = 'admin';
      await user.save();
      
      console.log(`Successfully updated user ${email} to admin role`);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
