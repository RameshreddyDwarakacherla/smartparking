const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const ParkingSpot = require('../models/ParkingSpot');

// Get all parking spots
router.get('/', auth, async (req, res) => {
  try {
    const spots = await ParkingSpot.find();
    res.json(spots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get spots by area
router.get('/area/:area', auth, async (req, res) => {
  try {
    const spots = await ParkingSpot.find({ area: req.params.area });
    res.json(spots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update spot status (admin only)
router.patch('/:id', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const spot = await ParkingSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    spot.status = status;
    if (status === 'maintenance') {
      spot.isOccupied = true;
    } else if (status === 'available') {
      spot.isOccupied = false;
    }

    await spot.save();
    res.json(spot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
