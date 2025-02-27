const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const ParkingSpot = require('../models/ParkingSpot');

// Get all parking spots
router.get('/', auth, async (req, res) => {
  try {
    const spots = await ParkingSpot.find();
    res.json({
      success: true,
      data: spots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get spots by area
router.get('/area/:area', auth, async (req, res) => {
  try {
    const spots = await ParkingSpot.find({ 
      area: req.params.area,
    }).sort({ spotNumber: 1 });
    
    if (!spots || spots.length === 0) {
      // If no spots found, create default spots for the area
      const defaultSpots = [];
      for (let i = 1; i <= 20; i++) {
        defaultSpots.push({
          spotNumber: `${req.params.area}-${i.toString().padStart(2, '0')}`,
          area: req.params.area,
          status: 'available',
          vehicleType: i <= 10 ? 'two_wheeler' : 'four_wheeler',
          isOccupied: false
        });
      }
      const createdSpots = await ParkingSpot.insertMany(defaultSpots);
      return res.json({
        success: true,
        data: createdSpots
      });
    }
    
    res.json({
      success: true,
      data: spots
    });
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parking spots'
    });
  }
});

// Update spot status (admin only)
router.patch('/:id', [auth, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const spot = await ParkingSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    spot.status = status;
    if (status === 'maintenance') {
      spot.isOccupied = true;
    } else if (status === 'available') {
      spot.isOccupied = false;
    }

    await spot.save();
    res.json({
      success: true,
      data: spot
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
