# Smart Parking Management System

A comprehensive web-based parking management solution built with modern technologies to efficiently manage parking spaces across multiple locations with real-time availability tracking.

## 🚀 Features

### User Features
- **User Registration & Authentication**: Secure signup/login with JWT-based authentication
- **Real-time Parking Availability**: View available slots by vehicle type across all locations
- **Smart Booking System**: Book parking slots with automatic slot allocation
- **Booking Management**: View, cancel, and complete bookings with history tracking
- **Profile Management**: Update personal information and vehicle details
- **Dashboard Analytics**: Personalized dashboard with booking statistics

### Admin Features
- **Location Management**: Add, edit, and manage parking locations with capacity settings
- **User Management**: View and manage registered users with role assignments
- **Booking Oversight**: Monitor all bookings across locations with detailed information
- **Real-time Monitoring**: Track occupancy rates and availability in real-time
- **Report Generation**: Generate comprehensive reports for parking utilization
- **Slot Management**: Configure parking slots with position mapping

### System Features
- **Multi-Vehicle Support**: Separate management for two-wheelers, four-wheelers, and buses
- **Zone-based Organization**: Organize locations by zones (North, South, Central, etc.)
- **Automatic Occupancy Tracking**: Real-time updates of slot availability
- **Responsive Design**: Mobile-friendly interface with Material-UI components
- **Role-based Access Control**: Secure access with user and admin roles

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern JavaScript library for building user interfaces
- **Material-UI (MUI)**: React component library for consistent design
- **React Router DOM**: Client-side routing for single-page application
- **Axios**: HTTP client for API communication
- **Vite**: Fast build tool and development server
- **JWT Decode**: Token handling for authentication

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for secure authentication
- **bcryptjs**: Password hashing for security
- **CORS**: Cross-Origin Resource Sharing middleware

### Development Tools
- **Nodemon**: Development server with auto-restart
- **ESLint**: Code linting for consistent code quality
- **dotenv**: Environment variable management

## 📁 Project Structure

```
smartparking/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── parkingController.js
│   │   └── userController.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/              # Database schemas
│   │   ├── Booking.js
│   │   ├── ParkingLocation.js
│   │   ├── ParkingSlot.js
│   │   └── User.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── parkingRoutes.js
│   │   └── userRoutes.js
│   ├── seeder.js            # Database seeding
│   ├── server.js            # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── booking/     # Booking-related components
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── parking/     # Parking management components
│   │   │   └── user/        # User-specific components
│   │   ├── context/         # React context providers
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/parking-system
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```

4. Seed the database with initial data:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🔐 Default Admin Credentials
- **Email**: admin@parking.com
- **Password**: password123

## 📊 Database Schema

### User Schema
- Personal information (name, email, phone)
- Vehicle details (type, number)
- Role-based access (user/admin)
- Encrypted password storage

### Parking Location Schema
- Location details (name, description, zone)
- Capacity by vehicle type
- Real-time occupancy tracking
- Indoor/outdoor classification

### Parking Slot Schema
- Unique slot identification
- Vehicle type specification
- Position coordinates
- Availability status

### Booking Schema
- User and slot relationships
- Booking timeline (start/end times)
- Status tracking (active/completed/cancelled)
- Duration calculations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Parking Management
- `GET /api/parking/locations` - Get all locations
- `POST /api/parking/locations` - Create location (Admin)
- `GET /api/parking/slots` - Get available slots
- `PUT /api/parking/slots/:id` - Update slot status

### Booking Management
- `GET /api/booking` - Get user bookings
- `POST /api/booking` - Create new booking
- `PUT /api/booking/:id/complete` - Complete booking
- `PUT /api/booking/:id/cancel` - Cancel booking

### User Management
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete user (Admin)

## 🎯 Key Features Implementation

### Real-time Availability Tracking
- Automatic slot status updates on booking/completion
- Dynamic occupancy calculations with virtual properties
- Instant availability display across all locations

### Secure Authentication System
- JWT-based authentication with refresh tokens
- Password hashing using bcrypt
- Role-based access control for admin features

### Responsive User Interface
- Material-UI components for consistent design
- Mobile-first responsive layout
- Intuitive navigation with protected routes

### Comprehensive Booking System
- Smart slot allocation based on vehicle type
- Booking history with status tracking
- Automatic duration calculations

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application
3. Deploy to cloud platforms (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to hosting platforms (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Your Name** - Initial work and development

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- MongoDB team for the flexible database solution
- React team for the powerful frontend framework
- Express.js community for the robust backend framework

## 📞 Support

For support and queries, please contact [drameshr62@gmail.com]

---

**Note**: This is a demonstration project showcasing full-stack development skills with modern web technologies.


