const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  spotNumber: {
    type: String,
    required: true,
    unique: true
  },
  area: {
    type: String,
    required: true,
    enum: ['GirlsHostel', 'EighthBlock', 'AdminBlock', 'TiffacCore', 'EleventhBlock', 'PolytechnicBlock']
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['two_wheeler', 'four_wheeler', 'bus']
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  location: {
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
