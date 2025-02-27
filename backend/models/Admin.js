const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  adminType: {
    type: String,
    enum: ['super_admin', 'parking_admin'],
    default: 'parking_admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_bookings',
      'manage_areas',
      'manage_admins',
      'view_reports',
      'manage_settings'
    ]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt timestamp
adminSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to compare password
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Method to check if admin is super admin
adminSchema.methods.isSuperAdmin = function() {
  return this.adminType === 'super_admin';
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
