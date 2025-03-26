const ParkingLocation = require('../models/ParkingLocation');
const ParkingSlot = require('../models/ParkingSlot');

// @desc    Get all parking locations
// @route   GET /api/parking/locations
// @access  Public
exports.getLocations = async (req, res) => {
  try {
    const locations = await ParkingLocation.find();
    
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single parking location
// @route   GET /api/parking/locations/:id
// @access  Public
exports.getLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Parking location not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new parking location
// @route   POST /api/parking/locations
// @access  Private (Admin)
exports.createLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.create(req.body);
    
    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update parking location
// @route   PUT /api/parking/locations/:id
// @access  Private (Admin)
exports.updateLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Parking location not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete parking location
// @route   DELETE /api/parking/locations/:id
// @access  Private (Admin)
exports.deleteLocation = async (req, res) => {
  try {
    const location = await ParkingLocation.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Parking location not found with id of ${req.params.id}`
      });
    }
    
    // Check if any slots are associated with this location
    const slots = await ParkingSlot.find({ location: req.params.id });
    
    if (slots.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete location with active parking slots'
      });
    }
    
    await location.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all parking slots
// @route   GET /api/parking/slots
// @access  Public
exports.getSlots = async (req, res) => {
  try {
    let query = {};
    
    // Filter by location
    if (req.query.location) {
      query.location = req.query.location;
    }
    
    // Filter by vehicle type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const slots = await ParkingSlot.find(query)
      .populate('location', 'name description');
    
    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single parking slot
// @route   GET /api/parking/slots/:id
// @access  Public
exports.getSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id)
      .populate('location', 'name description');
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: `Parking slot not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new parking slot
// @route   POST /api/parking/slots
// @access  Private (Admin)
exports.createSlot = async (req, res) => {
  try {
    // Check if location exists
    const location = await ParkingLocation.findById(req.body.location);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Parking location not found with id of ${req.body.location}`
      });
    }
    
    const slot = await ParkingSlot.create(req.body);
    
    // Update location capacity and occupancy counts
    if (slot.type === 'two-wheeler') {
      location.capacity.twoWheelers += 1;
    } else if (slot.type === 'four-wheeler') {
      location.capacity.fourWheelers += 1;
    } else if (slot.type === 'bus') {
      location.capacity.buses += 1;
    }
    
    await location.save();
    
    res.status(201).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update parking slot
// @route   PUT /api/parking/slots/:id
// @access  Private (Admin)
exports.updateSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: `Parking slot not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete parking slot
// @route   DELETE /api/parking/slots/:id
// @access  Private (Admin)
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: `Parking slot not found with id of ${req.params.id}`
      });
    }
    
    // Only allow deletion if the slot is not occupied or reserved
    if (slot.status === 'occupied' || slot.status === 'reserved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an occupied or reserved parking slot'
      });
    }
    
    // Get the location to update capacity counts
    const location = await ParkingLocation.findById(slot.location);
    
    if (location) {
      // Update location capacity counts
      if (slot.type === 'two-wheeler') {
        location.capacity.twoWheelers -= 1;
      } else if (slot.type === 'four-wheeler') {
        location.capacity.fourWheelers -= 1;
      } else if (slot.type === 'bus') {
        location.capacity.buses -= 1;
      }
      
      await location.save();
    }
    
    await slot.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 