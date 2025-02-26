const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ParkingSpot = require('../models/ParkingSpot');

dotenv.config();

const parkingAreas = [
  {
    name: 'GirlsHostel',
    spots: { bus: 50 }
  },
  {
    name: 'EighthBlock',
    spots: { twoWheeler: 30, fourWheeler: 10 }
  },
  {
    name: 'AdminBlock',
    spots: { twoWheeler: 30, fourWheeler: 10 }
  },
  {
    name: 'TiffacCore',
    spots: { twoWheeler: 20, fourWheeler: 5 }
  },
  {
    name: 'EleventhBlock',
    spots: { bus: 10 }
  },
  {
    name: 'PolytechnicBlock',
    spots: { twoWheeler: 20, fourWheeler: 10 }
  }
];

const initializeParking = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing spots
    await ParkingSpot.deleteMany({});
    console.log('Cleared existing parking spots');

    const spots = [];

    // Create spots for each area
    for (const area of parkingAreas) {
      let spotNumber = 1;
      
      // Create bus spots
      if (area.spots.bus) {
        for (let i = 0; i < area.spots.bus; i++) {
          spots.push({
            spotNumber: `${area.name}-B${spotNumber}`,
            area: area.name,
            vehicleType: 'bus'
          });
          spotNumber++;
        }
      }

      // Create two-wheeler spots
      if (area.spots.twoWheeler) {
        for (let i = 0; i < area.spots.twoWheeler; i++) {
          spots.push({
            spotNumber: `${area.name}-2W${spotNumber}`,
            area: area.name,
            vehicleType: 'twoWheeler'
          });
          spotNumber++;
        }
      }

      // Create four-wheeler spots
      if (area.spots.fourWheeler) {
        for (let i = 0; i < area.spots.fourWheeler; i++) {
          spots.push({
            spotNumber: `${area.name}-4W${spotNumber}`,
            area: area.name,
            vehicleType: 'fourWheeler'
          });
          spotNumber++;
        }
      }
    }

    // Insert all spots
    await ParkingSpot.insertMany(spots);
    console.log(`Created ${spots.length} parking spots`);

    console.log('Parking initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing parking:', error);
    process.exit(1);
  }
};

initializeParking();
