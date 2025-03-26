const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const ParkingLocation = require('./models/ParkingLocation');
const ParkingSlot = require('./models/ParkingSlot');
const Booking = require('./models/Booking');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parking-system');

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@parking.com' });
    
    if (adminExists) {
      console.log('Admin already exists');
      return;
    }
    
    await User.create({
      name: 'Admin User',
      email: 'admin@parking.com',
      password: 'password123',
      role: 'admin',
      phoneNumber: '1234567890'
    });
    
    console.log('Admin user created');
  } catch (error) {
    console.error(error);
  }
};

// Create parking locations
const createParkingLocations = async () => {
  try {
    // Check if locations already exist
    const locationsExist = await ParkingLocation.countDocuments();
    
    if (locationsExist > 0) {
      console.log('Parking locations already exist');
      return;
    }
    
    const locations = [
      {
        name: 'Girls\' Hostel Frontside',
        description: 'Parking area in front of Girls\' Hostel',
        capacity: {
          buses: 50
        },
        location: {
          type: 'outdoor',
          zone: 'North'
        }
      },
      {
        name: '8th Block Frontside',
        description: 'Parking area in front of 8th Block',
        capacity: {
          twoWheelers: 30,
          fourWheelers: 10
        },
        location: {
          type: 'outdoor',
          zone: 'East'
        }
      },
      {
        name: 'Admin Block',
        description: 'Parking area near Admin Block',
        capacity: {
          twoWheelers: 30,
          fourWheelers: 10
        },
        location: {
          type: 'outdoor',
          zone: 'Central'
        }
      },
      {
        name: 'TIFFAC Core',
        description: 'Parking area at TIFFAC Core',
        capacity: {
          twoWheelers: 20,
          fourWheelers: 5
        },
        location: {
          type: 'indoor',
          zone: 'West'
        }
      },
      {
        name: '11th Block',
        description: 'Parking area near 11th Block',
        capacity: {
          buses: 10
        },
        location: {
          type: 'outdoor',
          zone: 'South'
        }
      },
      {
        name: 'Polytechnic Block',
        description: 'Parking area at Polytechnic Block',
        capacity: {
          twoWheelers: 20,
          fourWheelers: 10
        },
        location: {
          type: 'outdoor',
          zone: 'Southeast'
        }
      }
    ];
    
    await ParkingLocation.insertMany(locations);
    console.log('Parking locations created');
  } catch (error) {
    console.error(error);
  }
};

// Create parking slots
const createParkingSlots = async () => {
  try {
    // Check if slots already exist
    const slotsExist = await ParkingSlot.countDocuments();
    
    if (slotsExist > 0) {
      console.log('Parking slots already exist');
      return;
    }
    
    // Get all locations
    const locations = await ParkingLocation.find();
    
    // Create slots for each location
    for (const location of locations) {
      let slotNumber = 1;
      
      // Create two-wheeler slots
      for (let i = 0; i < location.capacity.twoWheelers; i++) {
        await ParkingSlot.create({
          slotNumber: `${location.name.substring(0, 3).toUpperCase()}-TW-${String(slotNumber).padStart(3, '0')}`,
          location: location._id,
          type: 'two-wheeler',
          position: {
            x: Math.floor(i / 5) * 50,
            y: (i % 5) * 30
          }
        });
        slotNumber++;
      }
      
      // Create four-wheeler slots
      for (let i = 0; i < location.capacity.fourWheelers; i++) {
        await ParkingSlot.create({
          slotNumber: `${location.name.substring(0, 3).toUpperCase()}-FW-${String(slotNumber).padStart(3, '0')}`,
          location: location._id,
          type: 'four-wheeler',
          position: {
            x: Math.floor(i / 3) * 80,
            y: (i % 3) * 60 + 200
          }
        });
        slotNumber++;
      }
      
      // Create bus slots
      for (let i = 0; i < location.capacity.buses; i++) {
        await ParkingSlot.create({
          slotNumber: `${location.name.substring(0, 3).toUpperCase()}-BUS-${String(slotNumber).padStart(3, '0')}`,
          location: location._id,
          type: 'bus',
          position: {
            x: Math.floor(i / 2) * 120,
            y: (i % 2) * 100 + 400
          }
        });
        slotNumber++;
      }
    }
    
    console.log('Parking slots created');
  } catch (error) {
    console.error(error);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await Booking.deleteMany();
    await ParkingSlot.deleteMany();
    await ParkingLocation.deleteMany();
    await User.deleteMany();
    
    console.log('All data deleted');
  } catch (error) {
    console.error(error);
  }
};

// Execute
const importData = async () => {
  try {
    await createAdmin();
    await createParkingLocations();
    await createParkingSlots();
    
    console.log('Data Imported');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData().then(() => process.exit());
} else {
  console.log('Please use correct command: node seeder -i (import) or -d (delete)');
  process.exit();
} 