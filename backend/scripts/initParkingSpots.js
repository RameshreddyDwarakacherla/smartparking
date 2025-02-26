const mongoose = require('mongoose');
const ParkingSpot = require('../models/ParkingSpot');
require('dotenv').config();

const parkingConfig = {
  'GirlsHostel': {
    name: 'Girls Hostel Frontside',
    spots: { buses: 50 },
    location: { lat: 17.4585, lng: 78.5735 }
  },
  'EighthBlock': {
    name: '8th Block Frontside',
    spots: { twoWheeler: 30, fourWheeler: 10 },
    location: { lat: 17.4580, lng: 78.5730 }
  },
  'AdminBlock': {
    name: 'Admin Block',
    spots: { twoWheeler: 30, fourWheeler: 10 },
    location: { lat: 17.4575, lng: 78.5725 }
  },
  'TiffacCore': {
    name: 'Tiffac Core',
    spots: { twoWheeler: 20, fourWheeler: 5 },
    location: { lat: 17.4570, lng: 78.5720 }
  },
  'EleventhBlock': {
    name: '11th Block',
    spots: { buses: 10 },
    location: { lat: 17.4565, lng: 78.5715 }
  },
  'PolytechnicBlock': {
    name: 'Polytechnic Block',
    spots: { twoWheeler: 20, fourWheeler: 10 },
    location: { lat: 17.4560, lng: 78.5710 }
  }
};

async function initializeParkingSpots() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing spots
    await ParkingSpot.deleteMany({});
    console.log('Cleared existing parking spots');

    const spots = [];

    // Create spots for each area
    for (const [areaKey, area] of Object.entries(parkingConfig)) {
      let spotNumber = 1;

      // Create bus spots
      if (area.spots.buses) {
        for (let i = 0; i < area.spots.buses; i++) {
          spots.push({
            spotNumber: `${areaKey}-B${String(spotNumber).padStart(2, '0')}`,
            area: areaKey,
            vehicleType: 'bus',
            status: 'available',
            location: area.location
          });
          spotNumber++;
        }
      }

      // Create two wheeler spots
      if (area.spots.twoWheeler) {
        for (let i = 0; i < area.spots.twoWheeler; i++) {
          spots.push({
            spotNumber: `${areaKey}-2W${String(spotNumber).padStart(2, '0')}`,
            area: areaKey,
            vehicleType: 'two_wheeler',
            status: 'available',
            location: area.location
          });
          spotNumber++;
        }
      }

      // Create four wheeler spots
      if (area.spots.fourWheeler) {
        for (let i = 0; i < area.spots.fourWheeler; i++) {
          spots.push({
            spotNumber: `${areaKey}-4W${String(spotNumber).padStart(2, '0')}`,
            area: areaKey,
            vehicleType: 'four_wheeler',
            status: 'available',
            location: area.location
          });
          spotNumber++;
        }
      }
    }

    // Insert all spots
    await ParkingSpot.insertMany(spots);
    console.log(`Created ${spots.length} parking spots`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error initializing parking spots:', error);
    process.exit(1);
  }
}

initializeParkingSpots();
