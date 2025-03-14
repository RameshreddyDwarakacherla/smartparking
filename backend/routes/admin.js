const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const User = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');
const Settings = require('../models/Settings');

// Admin Registration (Super Admin Only)
router.post('/register', auth, admin, async (req, res) => {
  try {
    const { name, email, password, phone, adminType, permissions } = req.body;

    // Check if requester is super admin
    const requestingAdmin = await Admin.findById(req.user.id);
    if (!requestingAdmin || !requestingAdmin.isSuperAdmin()) {
      return res.status(403).json({ message: 'Only super admins can create new admins' });
    }

    // Check if admin exists
    let adminUser = await Admin.findOne({ email });
    if (adminUser) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Create admin
    adminUser = new Admin({
      name,
      email,
      password,
      phone,
      adminType: adminType || 'parking_admin',
      permissions: permissions || ['manage_bookings', 'view_reports']
    });

    await adminUser.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        adminType: adminUser.adminType,
        permissions: adminUser.permissions
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(401).json({ message: 'Your account is not active. Please contact super admin.' });
    }

    // Verify password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create token
    const token = jwt.sign(
      { 
        id: admin._id,
        role: 'admin',
        type: admin.adminType,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        adminType: admin.adminType,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get dashboard stats
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSpots, occupiedSpots, todayBookings, activeUsers, revenue] = await Promise.all([
      ParkingSpot.countDocuments(),
      ParkingSpot.countDocuments({ isOccupied: true }),
      Booking.countDocuments({
        createdAt: { $gte: today },
        status: { $ne: 'cancelled' }
      }),
      User.countDocuments({ role: 'user' }),
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    res.json({
      totalSpots,
      occupiedSpots,
      todayBookings,
      activeUsers,
      revenue: revenue.length > 0 ? revenue[0].total : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all admins (Super Admin Only)
router.get('/all', auth, admin, async (req, res) => {
  try {
    const requestingAdmin = await Admin.findById(req.user.id);
    if (!requestingAdmin || !requestingAdmin.isSuperAdmin()) {
      return res.status(403).json({ message: 'Only super admins can view all admins' });
    }

    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admin status (Super Admin Only)
router.patch('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Check if requester is super admin
    const requestingAdmin = await Admin.findById(req.user.id);
    if (!requestingAdmin || !requestingAdmin.isSuperAdmin()) {
      return res.status(403).json({ message: 'Only super admins can update admin status' });
    }

    const adminToUpdate = await Admin.findById(req.params.id);
    if (!adminToUpdate) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    adminToUpdate.status = status;
    await adminToUpdate.save();

    res.json({ message: 'Admin status updated successfully', admin: adminToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings
router.get('/bookings', auth, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('parkingSpot')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.patch('/bookings/:id', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // If booking is cancelled or completed, free up the spot
    if (status === 'cancelled' || status === 'completed') {
      const spot = await ParkingSpot.findById(booking.parkingSpot);
      if (spot) {
        spot.isOccupied = false;
        await spot.save();
      }
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management Routes
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

router.patch('/users/:id', auth, admin, async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (status) user.status = status;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// Booking Management Routes
router.get('/bookings', auth, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('parkingSpot', 'spotNumber area');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

router.patch('/bookings/:id', auth, admin, async (req, res) => {
  try {
    const { status, payment, amount } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (status) booking.status = status;
    if (payment) booking.payment = payment;
    if (amount) booking.amount = amount;

    await booking.save();
    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error while updating booking' });
  }
});

router.delete('/bookings/:id', auth, admin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.remove();
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error while deleting booking' });
  }
});

// Reports Routes
router.get('/reports/bookings', auth, admin, async (req, res) => {
  try {
    const { timeRange } = req.query;
    const startDate = new Date();
    
    switch(timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const bookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(bookings);
  } catch (error) {
    console.error('Error generating bookings report:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
});

router.get('/reports/revenue', auth, admin, async (req, res) => {
  try {
    const { timeRange } = req.query;
    const startDate = new Date();
    
    switch(timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const revenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(revenue);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
});

// Settings Routes
router.get('/settings', auth, admin, async (req, res) => {
  try {
    const settings = await Settings.findOne() || {};
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error while fetching settings' });
  }
});

router.put('/settings', auth, admin, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (settings) {
      Object.assign(settings, req.body);
      await settings.save();
    } else {
      await Settings.create(req.body);
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error while updating settings' });
  }
});

// Admin Profile Routes
router.get('/profile', auth, admin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

router.patch('/profile', auth, admin, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    await admin.save();
    res.json({ message: 'Profile updated successfully', admin });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

router.post('/profile/change-password', auth, admin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

module.exports = router;
