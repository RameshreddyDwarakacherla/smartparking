import { jwtDecode } from 'jwt-decode';

// Store authentication token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Store user data
export const setUserData = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Get user data from localStorage
export const getUserData = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Get authentication token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Decode token and check if it's expired
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    // If there's an error decoding the token, consider user as not authenticated
    return false;
  }
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUserData();
  return user && user.role === 'admin';
};

// Log out user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Extract role-based permissions
export const userCan = (action) => {
  const user = getUserData();
  if (!user) return false;
  
  // Define permissions based on user role
  const permissions = {
    admin: [
      'create-location', 'update-location', 'delete-location',
      'create-slot', 'update-slot', 'delete-slot',
      'view-all-bookings', 'update-any-booking', 'view-all-users'
    ],
    user: [
      'view-locations', 'view-slots', 'view-own-bookings',
      'create-booking', 'update-own-booking', 'cancel-own-booking'
    ]
  };
  
  // Get permissions based on user role
  const userPermissions = permissions[user.role] || [];
  
  // Check if user has permission
  return userPermissions.includes(action);
}; 