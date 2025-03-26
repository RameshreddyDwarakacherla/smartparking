const mongoose = require('mongoose');

const ParkingLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a location name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  // Vehicle capacity segmented by type
  capacity: {
    twoWheelers: {
      type: Number,
      default: 0
    },
    fourWheelers: {
      type: Number,
      default: 0
    },
    buses: {
      type: Number,
      default: 0
    }
  },
  // Current occupancy counts
  occupancy: {
    twoWheelers: {
      type: Number,
      default: 0
    },
    fourWheelers: {
      type: Number,
      default: 0
    },
    buses: {
      type: Number,
      default: 0
    }
  },
  // Represents the physical characteristics of the parking location
  location: {
    type: {
      type: String,
      enum: ['indoor', 'outdoor'],
      default: 'outdoor'
    },
    zone: {
      type: String,
      required: [true, 'Please specify the zone (e.g., North, South, Central)']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for availability calculation
ParkingLocationSchema.virtual('availability').get(function() {
  return {
    twoWheelers: this.capacity.twoWheelers - this.occupancy.twoWheelers,
    fourWheelers: this.capacity.fourWheelers - this.occupancy.fourWheelers,
    buses: this.capacity.buses - this.occupancy.buses
  };
});

// Set virtuals when converting to JSON
ParkingLocationSchema.set('toJSON', { virtuals: true });
ParkingLocationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ParkingLocation', ParkingLocationSchema); 