const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: [true, 'Please add a slot number'],
    unique: true,
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLocation',
    required: true
  },
  type: {
    type: String,
    enum: ['two-wheeler', 'four-wheeler', 'bus'],
    required: [true, 'Please specify the slot type']
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  // For AI-based vehicle detection
  sensorData: {
    isOccupied: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    detectedVehicleType: {
      type: String,
      enum: ['two-wheeler', 'four-wheeler', 'bus', 'unknown', null],
      default: null
    }
  },
  // Physical position for UI representation
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the timestamp before saving
ParkingSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema); 