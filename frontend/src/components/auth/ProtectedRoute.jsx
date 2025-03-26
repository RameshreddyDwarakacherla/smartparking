import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

// Protected route component that redirects unauthenticated users to login
const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Check if user is authenticated
  const authenticated = isAuthenticated();
  
  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin route, check if user is admin
  if (requireAdmin && !isAdmin()) {
    // Non-admin users trying to access admin routes get redirected to user dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // If authenticated and passes admin check, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 