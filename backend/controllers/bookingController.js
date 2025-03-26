const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingLocation = require('../models/ParkingLocation');

// @desc    Get all bookings
// @route   GET /api/booking
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by location if provided
    if (req.query.location) {
      query.location = req.query.location;
    }
    
    const bookings = await Booking.find(query)
      .populate({
        path: 'parkingSlot',
        select: 'slotNumber type status'
      })
      .populate({
        path: 'location',
        select: 'name description'
      })
      .populate({
        path: 'user',
        select: 'name email phoneNumber'
      })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/booking/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'parkingSlot',
        select: 'slotNumber type status'
      })
      .populate({
        path: 'location',
        select: 'name description'
      })
      .populate({
        path: 'user',
        select: 'name email phoneNumber'
      });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with id of ${req.params.id}`
      });
    }
    
    // Make sure user is booking owner or admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/booking
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Check if slot exists and is available
    const slot = await ParkingSlot.findById(req.body.parkingSlot);
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: `Parking slot not found with id of ${req.body.parkingSlot}`
      });
    }
    
    if (slot.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Parking slot is not available'
      });
    }
    
    // Check if slot type matches vehicle type
    if (slot.type !== req.body.vehicleType) {
      return res.status(400).json({
        success: false,
        message: `This slot is for ${slot.type} vehicles only`
      });
    }
    
    // Add location to booking
    req.body.location = slot.location;
    
    // Create booking
    const booking = await Booking.create(req.body);
    
    // Update slot status to reserved
    slot.status = 'reserved';
    await slot.save();
    
    // Update location occupancy
    const location = await ParkingLocation.findById(slot.location);
    
    if (location) {
      if (slot.type === 'two-wheeler') {
        location.occupancy.twoWheelers += 1;
      } else if (slot.type === 'four-wheeler') {
        location.occupancy.fourWheelers += 1;
      } else if (slot.type === 'bus') {
        location.occupancy.buses += 1;
      }
      
      await location.save();
    }
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking
// @route   PUT /api/booking/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with id of ${req.params.id}`
      });
    }
    
    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete booking
// @route   PUT /api/booking/:id/complete
// @access  Private
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with id of ${req.params.id}`
      });
    }
    
    // Only admin or booking owner can complete a booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to complete this booking'
      });
    }
    
    // Only complete active bookings
    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }
    
    // Update booking
    booking.status = 'completed';
    booking.endTime = Date.now();
    await booking.save();
    
    // Update slot status back to available
    const slot = await ParkingSlot.findById(booking.parkingSlot);
    
    if (slot) {
      slot.status = 'available';
      await slot.save();
      
      // Update location occupancy
      const location = await ParkingLocation.findById(booking.location);
      
      if (location) {
        if (booking.vehicleType === 'two-wheeler') {
          location.occupancy.twoWheelers = Math.max(0, location.occupancy.twoWheelers - 1);
        } else if (booking.vehicleType === 'four-wheeler') {
          location.occupancy.fourWheelers = Math.max(0, location.occupancy.fourWheelers - 1);
        } else if (booking.vehicleType === 'bus') {
          location.occupancy.buses = Math.max(0, location.occupancy.buses - 1);
        }
        
        await location.save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/booking/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with id of ${req.params.id}`
      });
    }
    
    // Only admin or booking owner can cancel
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Only cancel active bookings
    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }
    
    // Update booking
    booking.status = 'cancelled';
    booking.endTime = Date.now();
    await booking.save();
    
    // Update slot status back to available
    const slot = await ParkingSlot.findById(booking.parkingSlot);
    
    if (slot) {
      slot.status = 'available';
      await slot.save();
      
      // Update location occupancy
      const location = await ParkingLocation.findById(booking.location);
      
      if (location) {
        if (booking.vehicleType === 'two-wheeler') {
          location.occupancy.twoWheelers = Math.max(0, location.occupancy.twoWheelers - 1);
        } else if (booking.vehicleType === 'four-wheeler') {
          location.occupancy.fourWheelers = Math.max(0, location.occupancy.fourWheelers - 1);
        } else if (booking.vehicleType === 'bus') {
          location.occupancy.buses = Math.max(0, location.occupancy.buses - 1);
        }
        
        await location.save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 