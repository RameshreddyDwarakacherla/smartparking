const express = require('express');
const router = express.Router();
const { 
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getSlots,
  getSlot,
  createSlot,
  updateSlot,
  deleteSlot
} = require('../controllers/parkingController');
const { protect, authorize } = require('../middleware/auth');

// Parking Locations routes
router.route('/locations')
  .get(getLocations)
  .post(protect, authorize('admin'), createLocation);

router.route('/locations/:id')
  .get(getLocation)
  .put(protect, authorize('admin'), updateLocation)
  .delete(protect, authorize('admin'), deleteLocation);

// Parking Slots routes
router.route('/slots')
  .get(getSlots)
  .post(protect, authorize('admin'), createSlot);

router.route('/slots/:id')
  .get(getSlot)
  .put(protect, authorize('admin'), updateSlot)
  .delete(protect, authorize('admin'), deleteSlot);

module.exports = router; 