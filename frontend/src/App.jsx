import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// User Components
import UserDashboard from './components/dashboard/UserDashboard';
import Profile from './components/user/Profile';
import ParkingSlotsList from './components/parking/ParkingSlotsList';
import BookingHistory from './components/booking/BookingHistory';

// Admin Components
import AdminDashboard from './components/dashboard/AdminDashboard';
import ParkingLocations from './components/admin/ParkingLocations';
import UserManagement from './components/admin/UserManagement';
import BookingManagement from './components/admin/BookingManagement';
import BookingDetails from './components/admin/BookingDetails';
import ReportGenerator from './components/admin/ReportGenerator';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes for all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/parking-slots" element={<ParkingSlotsList />} />
              <Route path="/booking-history" element={<BookingHistory />} />
            </Route>
            
            {/* Protected routes for admin users */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/parking" element={<ParkingLocations />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/bookings" element={<BookingManagement />} />
              <Route path="/admin/bookings/:id" element={<BookingDetails />} />
              <Route path="/admin/reports" element={<ReportGenerator />} />
            </Route>
            
            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Handle 404 - Page not found */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
