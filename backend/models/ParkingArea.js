const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  spotNumber: { type: String, required: true },
  type: { type: String, enum: ['two_wheeler', 'four_wheeler', 'bus'], required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  }
});

const parkingAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  capacity: {
    two_wheeler: { type: Number, default: 0 },
    four_wheeler: { type: Number, default: 0 },
    bus: { type: Number, default: 0 }
  },
  spots: [parkingSpotSchema]
});

module.exports = mongoose.model('ParkingArea', parkingAreaSchema);
