const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLocation',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide vehicle number']
  },
  vehicleType: {
    type: String,
    enum: ['two-wheeler', 'four-wheeler', 'bus'],
    required: [true, 'Please specify vehicle type']
  },
  startTime: {
    type: Date,
    required: [true, 'Please specify start time'],
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add duration virtual property
BookingSchema.virtual('duration').get(function() {
  if (!this.endTime) return null;
  const durationMs = this.endTime - this.startTime;
  return {
    ms: durationMs,
    minutes: Math.floor(durationMs / (1000 * 60)),
    hours: Math.floor(durationMs / (1000 * 60 * 60))
  };
});

// Set virtuals when converting to JSON
BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', BookingSchema); 