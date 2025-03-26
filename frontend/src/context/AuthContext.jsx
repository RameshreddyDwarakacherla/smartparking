import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { 
  setAuthToken, 
  setUserData, 
  getUserData, 
  isAuthenticated, 
  isAdmin 
} from '../utils/auth';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        // If user is authenticated, get current user data
        if (isAuthenticated()) {
          const storedUser = getUserData();
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Authentication failed. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      // Store token and user data
      setAuthToken(token);
      setUserData(user);
      setUser(user);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      // Store token and user data
      setAuthToken(token);
      setUserData(user);
      setUser(user);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setAuthToken(null);
    setUserData(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Admin registration function
  const registerAdmin = async (adminData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.registerAdmin(adminData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Admin registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const checkIsAdmin = () => {
    return isAdmin();
  };

  // Auth context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    registerAdmin,
    isAdmin: checkIsAdmin,
    isAuthenticated: () => isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 