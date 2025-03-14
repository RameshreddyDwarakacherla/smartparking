const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  general: {
    siteName: {
      type: String,
      required: true,
      default: 'Smart Parking System'
    },
    contactEmail: {
      type: String,
      required: true,
      default: 'admin@smartparking.com'
    },
    contactPhone: {
      type: String,
      required: true,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
  },
  booking: {
    maxBookingDuration: {
      type: Number,
      required: true,
      default: 24
    },
    minBookingDuration: {
      type: Number,
      required: true,
      default: 1
    },
    advanceBookingDays: {
      type: Number,
      required: true,
      default: 7
    },
    allowMultipleBookings: {
      type: Boolean,
      default: false
    },
    requirePaymentUpfront: {
      type: Boolean,
      default: true
    }
  },
  notification: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    bookingReminders: {
      type: Boolean,
      default: true
    },
    adminNotifications: {
      type: Boolean,
      default: true
    }
  },
  payment: {
    currency: {
      type: String,
      required: true,
      default: 'INR'
    },
    taxRate: {
      type: Number,
      required: true,
      default: 18
    },
    minimumAmount: {
      type: Number,
      required: true,
      default: 50
    },
    acceptedPaymentMethods: {
      type: [String],
      default: ['card', 'upi']
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
