const express = require('express');
const router = express.Router();
const ParkingArea = require('../models/ParkingArea');
const auth = require('../middleware/auth');

// Get all parking areas
router.get('/', auth, async (req, res) => {
  try {
    const areas = await ParkingArea.find();
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parking areas' });
  }
});

// Get specific parking area
router.get('/:id', auth, async (req, res) => {
  try {
    const area = await ParkingArea.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ message: 'Parking area not found' });
    }
    res.json(area);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parking area' });
  }
});

// Update spot status
router.patch('/:areaId/spots/:spotId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const area = await ParkingArea.findById(req.params.areaId);
    
    if (!area) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    const spot = area.spots.id(req.params.spotId);
    if (!spot) {
      return res.status(404).json({ message: 'Spot not found' });
    }

    spot.status = status;
    await area.save();

    res.json(spot);
  } catch (error) {
    res.status(500).json({ message: 'Error updating spot status' });
  }
});

module.exports = router;
