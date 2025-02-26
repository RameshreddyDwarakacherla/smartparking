const mongoose = require('mongoose');
require('dotenv').config();
const ParkingArea = require('../models/ParkingArea');

const parkingAreas = [
  {
    name: "Girls Hostel Frontside",
    description: "Parking area for university buses near Girls Hostel",
    capacity: {
      bus: 50,
      two_wheeler: 0,
      four_wheeler: 0
    }
  },
  {
    name: "8th Block Frontside",
    description: "Parking area for two-wheelers and four-wheelers near 8th Block",
    capacity: {
      two_wheeler: 30,
      four_wheeler: 10,
      bus: 0
    }
  },
  {
    name: "Admin Block",
    description: "Parking area near Admin Block",
    capacity: {
      two_wheeler: 30,
      four_wheeler: 10,
      bus: 0
    }
  },
  {
    name: "Tifac Core",
    description: "Parking area near Tifac Core",
    capacity: {
      two_wheeler: 20,
      four_wheeler: 5,
      bus: 0
    }
  },
  {
    name: "11th Block",
    description: "Bus parking area near 11th Block",
    capacity: {
      bus: 10,
      two_wheeler: 0,
      four_wheeler: 0
    }
  },
  {
    name: "Polytechnic Block",
    description: "Parking area near Polytechnic Block",
    capacity: {
      two_wheeler: 20,
      four_wheeler: 10,
      bus: 0
    }
  }
];

// Function to create parking spots with rectangle shapes
function generateSpots(capacity, areaIndex) {
  const spots = [];
  let spotCount = 1;
  
  // Define spot sizes and spacing
  const SPOT_SIZES = {
    two_wheeler: { width: 60, height: 120 },
    four_wheeler: { width: 120, height: 200 },
    bus: { width: 250, height: 800 }
  };
  
  // Define spots per row for better visualization
  const SPOTS_PER_ROW = {
    two_wheeler: 5,
    four_wheeler: 3,
    bus: 2
  };

  // Generate spots for each vehicle type
  Object.entries(capacity).forEach(([type, count]) => {
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / SPOTS_PER_ROW[type]);
        const col = i % SPOTS_PER_ROW[type];
        
        // Calculate position with spacing between spots
        const x = col * (SPOT_SIZES[type].width + 20) + 50; // 20px gap between spots
        const y = row * (SPOT_SIZES[type].height + 20) + 50; // 20px gap between rows
        
        spots.push({
          spotNumber: `${areaIndex + 1}-${type.charAt(0).toUpperCase()}${spotCount}`,
          type,
          status: 'available',
          position: {
            x,
            y,
            width: SPOT_SIZES[type].width,
            height: SPOT_SIZES[type].height
          }
        });
        spotCount++;
      }
    }
  });
  
  return spots;
}

async function initializeParkingAreas() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing parking areas
    await ParkingArea.deleteMany({});
    console.log('Cleared existing parking areas');

    // Create new parking areas with spots
    const areasWithSpots = parkingAreas.map((area, index) => ({
      ...area,
      spots: generateSpots(area.capacity, index)
    }));

    // Insert all parking areas
    await ParkingArea.insertMany(areasWithSpots);
    console.log('Successfully initialized parking areas');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error initializing parking areas:', error);
    process.exit(1);
  }
}

initializeParkingAreas();
