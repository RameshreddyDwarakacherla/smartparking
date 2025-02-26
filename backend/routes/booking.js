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
    const { areaId, spotId, startTime, endTime, vehicleNumber, vehicleType } = req.body;

    // Validate booking times
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ message: 'Start time must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Check if spot is available
    const parkingArea = await ParkingArea.findById(areaId);
    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    const spot = parkingArea.spots.id(spotId);
    if (!spot) {
      return res.status(404).json({ message: 'Spot not found' });
    }

    if (spot.status !== 'available') {
      return res.status(400).json({ message: 'Spot is not available' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      parkingArea: areaId,
      spotId,
      spotNumber: spot.spotNumber,
      startTime,
      endTime,
      vehicleNumber,
      vehicleType,
      status: 'pending'
    });

    // Update spot status
    spot.status = 'reserved';
    await parkingArea.save();
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel an active or completed booking' });
    }

    // Update spot status back to available
    const parkingArea = await ParkingArea.findById(booking.parkingArea);
    if (parkingArea) {
      const spot = parkingArea.spots.id(booking.spotId);
      if (spot) {
        spot.status = 'available';
        await parkingArea.save();
      }
    }

    await booking.remove();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
