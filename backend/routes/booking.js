const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const ParkingArea = require('../models/ParkingArea');

// Get user's bookings
router.get('/user', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { areaId, spotId, startTime, endTime, vehicleNumber, vehicleType, duration } = req.body;

    // Basic validation
    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({ 
        success: false,
        message: 'Vehicle number and type are required' 
      });
    }

    if (!areaId || !spotId) {
      return res.status(400).json({ 
        success: false,
        message: 'Area ID and Spot ID are required' 
      });
    }

    if (!duration || duration < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid duration'
      });
    }

    // Validate booking times
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ 
        success: false,
        message: 'Start time must be in the future' 
      });
    }

    if (end <= start) {
      return res.status(400).json({ 
        success: false,
        message: 'End time must be after start time' 
      });
    }

    // Check for existing bookings for this spot
    const existingBooking = await Booking.findOne({
      spotId,
      status: 'active',
      $or: [
        {
          startTime: { $lte: end },
          endTime: { $gte: start }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Spot is already booked for this time period'
      });
    }

    // Create the booking
    const booking = new Booking({
      user: req.user.id,
      parkingArea: areaId,
      spotId,
      spotNumber: spotId.split('-')[2], // Extract spot number from ID
      startTime: start,
      endTime: end,
      vehicleNumber,
      vehicleType,
      duration,
      status: 'active'
    });

    await booking.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    // Update the spot status
    const parkingArea = await ParkingArea.findById(booking.parkingArea);
    if (parkingArea) {
      const spot = parkingArea.spots.id(booking.spotId);
      if (spot) {
        spot.status = 'available';
        await parkingArea.save();
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const bookings = await Booking.find()
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
