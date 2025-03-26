import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  DirectionsCar,
  TwoWheeler,
  DirectionsBus,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { bookingAPI } from '../../utils/api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [filters, setFilters] = useState({
    vehicleType: '',
    status: '',
    date: ''
  });
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  useEffect(() => {
    if (bookings.length === 0) return;
    
    // Filter bookings based on tab
    let filtered = [...bookings];
    
    switch (tabValue) {
      case 0: // All
        break;
      case 1: // Active
        filtered = filtered.filter(booking => booking.status === 'active');
        break;
      case 2: // Completed
        filtered = filtered.filter(booking => booking.status === 'completed');
        break;
      case 3: // Cancelled
        filtered = filtered.filter(booking => booking.status === 'cancelled');
        break;
      default:
        break;
    }
    
    // Apply additional filters
    if (filters.vehicleType) {
      filtered = filtered.filter(booking => booking.vehicleType === filters.vehicleType);
    }
    
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return (
          bookingDate.getDate() === filterDate.getDate() &&
          bookingDate.getMonth() === filterDate.getMonth() &&
          bookingDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }
    
    setFilteredBookings(filtered);
  }, [bookings, tabValue, filters]);
  
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingAPI.getBookings();
      setBookings(response.data.data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      vehicleType: '',
      status: '',
      date: ''
    });
  };
  
  const handleOpenCompleteDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenCompleteDialog(true);
  };
  
  const handleCloseCompleteDialog = () => {
    setOpenCompleteDialog(false);
  };
  
  const handleOpenCancelDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenCancelDialog(true);
  };
  
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };
  
  const handleCompleteBooking = async () => {
    setLoading(true);
    try {
      await bookingAPI.completeBooking(selectedBooking._id);
      setSuccess('Booking marked as completed');
      handleCloseCompleteDialog();
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelBooking = async () => {
    setLoading(true);
    try {
      await bookingAPI.cancelBooking(selectedBooking._id);
      setSuccess('Booking cancelled successfully');
      handleCloseCancelDialog();
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };
  
  const getVehicleIcon = (type) => {
    switch (type) {
      case 'two-wheeler':
        return <TwoWheeler fontSize="small" />;
      case 'four-wheeler':
        return <DirectionsCar fontSize="small" />;
      case 'bus':
        return <DirectionsBus fontSize="small" />;
      default:
        return null;
    }
  };
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            icon={<AccessTime fontSize="small" />}
            label="Active"
            color="success"
            size="small"
            variant="outlined"
          />
        );
      case 'completed':
        return (
          <Chip
            icon={<CheckCircle fontSize="small" />}
            label="Completed"
            color="info"
            size="small"
            variant="outlined"
          />
        );
      case 'cancelled':
        return (
          <Chip
            icon={<Cancel fontSize="small" />}
            label="Cancelled"
            color="error"
            size="small"
            variant="outlined"
          />
        );
      default:
        return null;
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Booking Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View and manage all parking bookings across the system.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking tabs">
            <Tab label="All Bookings" />
            <Tab label="Active" />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Bookings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                <Select
                  labelId="vehicle-type-label"
                  name="vehicleType"
                  value={filters.vehicleType}
                  label="Vehicle Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="two-wheeler">Two Wheeler</MenuItem>
                  <MenuItem value="four-wheeler">Four Wheeler</MenuItem>
                  <MenuItem value="bus">Bus</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Booking Date"
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={resetFilters} sx={{ mr: 1 }}>
                  Reset Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {loading && bookings.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Slot</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                        <TableCell>{booking.user?.name || 'N/A'}</TableCell>
                        <TableCell>{booking.location?.name || 'N/A'}</TableCell>
                        <TableCell>{booking.parkingSlot?.slotNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getVehicleIcon(booking.vehicleType)}
                            <span style={{ marginLeft: '8px' }}>{booking.vehicleNumber}</span>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(booking.startTime)}</TableCell>
                        <TableCell>{formatDate(booking.endTime)}</TableCell>
                        <TableCell>{getStatusChip(booking.status)}</TableCell>
                        <TableCell>
                          {booking.status === 'active' && (
                            <Box>
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => handleOpenCompleteDialog(booking)}
                                sx={{ mr: 1 }}
                              >
                                Complete
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleOpenCancelDialog(booking)}
                              >
                                Cancel
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
      
      {/* Complete Booking Dialog */}
      <Dialog open={openCompleteDialog} onClose={handleCloseCompleteDialog}>
        <DialogTitle>Complete Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this booking as completed?
            This will free up the parking slot for other users.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog}>Cancel</Button>
          <Button
            onClick={handleCompleteBooking}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Complete Booking'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking?
            This will free up the parking slot for other users.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>No, Keep It</Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Yes, Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingManagement; 