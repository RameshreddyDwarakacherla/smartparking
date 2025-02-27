const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  areaId: {
    type: String,
    required: true,
    enum: ['GirlsHostel', 'EighthBlock', 'AdminBlock', 'TiffacCore', 'EleventhBlock']
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
    required: true,
    enum: ['two_wheeler', 'four_wheeler', 'bus']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  duration: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Add index for faster booking conflict checks
bookingSchema.index({ 
  areaId: 1, 
  spotNumber: 1, 
  status: 1, 
  startTime: 1, 
  endTime: 1 
});

module.exports = mongoose.model('Booking', bookingSchema);
