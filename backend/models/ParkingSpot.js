const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  spotNumber: { type: String, required: true },
  area: { 
    type: String, 
    enum: ['GirlsHostel', 'EighthBlock', 'AdminBlock', 'TiffacCore', 'EleventhBlock', 'PolytechnicBlock'],
    required: true 
  },
  vehicleType: { 
    type: String, 
    enum: ['bus', 'twoWheeler', 'fourWheeler'],
    required: true 
  },
  isOccupied: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  }
});

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
