const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      areaId,
      spotNumber,
      startTime,
      endTime,
      vehicleNumber,
      vehicleType,
      duration
    } = req.body;

    // Validate required fields
    if (!spotNumber || !vehicleNumber || !vehicleType || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if spot is already booked
    const existingBooking = await Booking.findOne({
      areaId,
      spotNumber,
      status: 'active',
      $or: [
        {
          startTime: { $lte: new Date(startTime) },
          endTime: { $gt: new Date(startTime) }
        },
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gte: new Date(endTime) }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This spot is already booked for the selected time period'
      });
    }

    // Create new booking
    const booking = new Booking({
      user: req.user.id,
      areaId,
      spotNumber,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      vehicleNumber,
      vehicleType,
      status: 'active',
      duration
    });

    await booking.save();

    // Return the booking data immediately after creation
    const newBooking = await Booking.findById(booking._id)
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking. Please try again.'
    });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      user: req.user.id,
      status: { $in: ['active', 'upcoming'] },
      endTime: { $gt: new Date() }
    })
    .sort({ startTime: 1 })
    .populate('user', 'name email');

    // Update completed bookings
    const now = new Date();
    const completedBookings = bookings.filter(booking => 
      booking.status === 'active' && new Date(booking.endTime) < now
    );

    if (completedBookings.length > 0) {
      await Promise.all(completedBookings.map(booking => {
        booking.status = 'completed';
        return booking.save();
      }));
    }

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Cancel booking
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: 'active'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already cancelled'
      });
    }

    // Only allow cancellation of future bookings
    const now = new Date();
    if (new Date(booking.startTime) <= now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an active or completed booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

module.exports = router;
