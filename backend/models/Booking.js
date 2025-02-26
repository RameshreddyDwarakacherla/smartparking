const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingArea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingArea',
    required: true
  },
  spotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  spotNumber: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['two_wheeler', 'four_wheeler', 'bus'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
