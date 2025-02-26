const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Booking = require('../models/Booking');
const User = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');

// Get dashboard stats
router.get('/stats', [auth, admin], async (req, res) => {
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

// Get all bookings
router.get('/bookings', [auth, admin], async (req, res) => {
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
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.patch('/bookings/:id', [auth, admin], async (req, res) => {
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

module.exports = router;
