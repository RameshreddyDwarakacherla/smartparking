require('dotenv').config({ path: '../backend/config.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const createSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_parking';
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if super admin exists
    const existingSuperAdmin = await Admin.findOne({ adminType: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create super admin
    const superAdmin = new Admin({
      name: 'Super Admin',
      email: 'admin@smartparking.com',
      password: hashedPassword,
      phone: '1234567890',
      adminType: 'super_admin',
      permissions: [
        'manage_users',
        'manage_bookings',
        'manage_areas',
        'manage_admins',
        'view_reports',
        'manage_settings'
      ],
      status: 'active'
    });

    await superAdmin.save();
    console.log('Super admin created successfully');
    console.log('Email: admin@smartparking.com');
    console.log('Password: Admin@123');
    console.log('Please change these credentials after first login');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSuperAdmin();
