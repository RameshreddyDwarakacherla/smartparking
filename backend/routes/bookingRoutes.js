const express = require('express');
const router = express.Router();
const { 
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  completeBooking,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All booking routes require authentication

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.route('/:id')
  .get(getBooking)
  .put(updateBooking);

router.route('/:id/complete')
  .put(completeBooking);

router.route('/:id/cancel')
  .put(cancelBooking);

module.exports = router; 