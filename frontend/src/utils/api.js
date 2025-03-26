import axios from 'axios';

// Create an axios instance with base URL and headers
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) errors by logging out the user
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerAdmin: (userData) => api.post('/auth/register-admin', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// User API calls
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  updatePassword: (id, passwordData) => api.put(`/users/${id}/password`, passwordData),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Parking API calls
export const parkingAPI = {
  getLocations: () => api.get('/parking/locations'),
  getLocation: (id) => api.get(`/parking/locations/${id}`),
  createLocation: (locationData) => api.post('/parking/locations', locationData),
  updateLocation: (id, locationData) => api.put(`/parking/locations/${id}`, locationData),
  deleteLocation: (id) => api.delete(`/parking/locations/${id}`),
  
  getSlots: (params) => api.get('/parking/slots', { params }),
  getSlot: (id) => api.get(`/parking/slots/${id}`),
  createSlot: (slotData) => api.post('/parking/slots', slotData),
  updateSlot: (id, slotData) => api.put(`/parking/slots/${id}`, slotData),
  deleteSlot: (id) => api.delete(`/parking/slots/${id}`)
};

// Booking API calls
export const bookingAPI = {
  getBookings: (params) => api.get('/booking', { params }),
  getBooking: (id) => api.get(`/booking/${id}`),
  createBooking: (bookingData) => api.post('/booking', bookingData),
  updateBooking: (id, bookingData) => api.put(`/booking/${id}`, bookingData),
  completeBooking: (id) => api.put(`/booking/${id}/complete`),
  cancelBooking: (id) => api.put(`/booking/${id}/cancel`)
};

export default api; 