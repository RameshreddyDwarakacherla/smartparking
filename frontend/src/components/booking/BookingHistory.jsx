import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import { 
  CancelOutlined, 
  CheckCircleOutline, 
  AccessTime, 
  DirectionsCar, 
  TwoWheeler, 
  DirectionsBus 
} from '@mui/icons-material';
import { format } from 'date-fns';
import { bookingAPI } from '../../utils/api';

const BookingHistory = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await bookingAPI.getBookings();
        setBookings(response.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings based on tab
  useEffect(() => {
    if (bookings.length === 0) return;

    let filtered;
    switch (tabValue) {
      case 0: // All
        filtered = bookings;
        break;
      case 1: // Active
        filtered = bookings.filter(booking => booking.status === 'active');
        break;
      case 2: // Completed
        filtered = bookings.filter(booking => booking.status === 'completed');
        break;
      case 3: // Cancelled
        filtered = bookings.filter(booking => booking.status === 'cancelled');
        break;
      default:
        filtered = bookings;
    }

    setFilteredBookings(filtered);
  }, [bookings, tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setLoading(true);
    try {
      await bookingAPI.cancelBooking(selectedBooking._id);
      
      // Update the local state
      const updatedBookings = bookings.map(booking => {
        if (booking._id === selectedBooking._id) {
          return { ...booking, status: 'cancelled' };
        }
        return booking;
      });
      
      setBookings(updatedBookings);
      setSuccess('Booking cancelled successfully');
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setCancelDialogOpen(false);
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
            icon={<AccessTime />} 
            label="Active" 
            color="success" 
            size="small" 
            variant="outlined" 
          />
        );
      case 'completed':
        return (
          <Chip 
            icon={<CheckCircleOutline />} 
            label="Completed" 
            color="info" 
            size="small" 
            variant="outlined" 
          />
        );
      case 'cancelled':
        return (
          <Chip 
            icon={<CancelOutlined />} 
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

  if (loading && bookings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Booking History
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View and manage your parking bookings.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking history tabs">
            <Tab label="All Bookings" />
            <Tab label="Active" />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={30} />
          </Box>
        )}

        {!loading && filteredBookings.length === 0 ? (
          <Alert severity="info">
            No bookings found in this category.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      {booking.location?.name || 'Unknown Location'}
                    </TableCell>
                    <TableCell>{booking.parkingSlot?.slotNumber || 'Unknown'}</TableCell>
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
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancelClick(booking)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your booking for slot{' '}
            {selectedBooking?.parkingSlot?.slotNumber} at{' '}
            {selectedBooking?.location?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No, Keep It</Button>
          <Button onClick={handleCancelBooking} color="error" variant="contained">
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingHistory; 