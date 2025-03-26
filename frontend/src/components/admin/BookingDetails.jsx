import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Person,
  DirectionsCar,
  LocationOn,
  AccessTime,
  EventAvailable,
  Check,
  Cancel,
  ArrowBack,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { bookingAPI } from '../../utils/api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  useEffect(() => {
    fetchBookingDetails();
  }, [id]);
  
  const fetchBookingDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await bookingAPI.getBookingById(id);
      setBooking(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch booking details');
      console.error('Error fetching booking details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteBooking = () => {
    setConfirmAction('complete');
    setOpenConfirmDialog(true);
  };
  
  const handleCancelBooking = () => {
    setConfirmAction('cancel');
    setOpenConfirmDialog(true);
  };
  
  const confirmActionHandler = async () => {
    setOpenConfirmDialog(false);
    setLoading(true);
    
    try {
      if (confirmAction === 'complete') {
        await bookingAPI.completeBooking(id);
        setSuccess('Booking has been marked as completed');
      } else if (confirmAction === 'cancel') {
        await bookingAPI.cancelBooking(id);
        setSuccess('Booking has been cancelled');
      }
      
      // Refetch booking details to get updated status
      fetchBookingDetails();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${confirmAction} booking`);
      console.error(`Error ${confirmAction}ing booking:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !booking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Button 
              component={Link} 
              to="/admin/bookings" 
              startIcon={<ArrowBack />}
              sx={{ mb: 2 }}
            >
              Back to Bookings
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              Booking Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Booking ID: {id}
            </Typography>
          </Box>
          
          {booking && booking.status === 'active' && (
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCompleteBooking}
                startIcon={<Check />}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                Complete
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancelBooking}
                startIcon={<Cancel />}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ my: 2 }}>
            {success}
          </Alert>
        )}
        
        {booking && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status: 
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  ml: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor:
                    booking.status === 'active'
                      ? 'success.light'
                      : booking.status === 'completed'
                      ? 'info.light'
                      : 'error.light',
                  color: 'white',
                }}
              >
                {booking.status}
              </Box>
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={4}>
              {/* User Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6">User Information</Typography>
                    </Box>
                    <Typography variant="body1">
                      <strong>Name:</strong> {booking.user?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {booking.user?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Phone:</strong> {booking.user?.phoneNumber || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Booking Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventAvailable sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6">Booking Information</Typography>
                    </Box>
                    <Typography variant="body1">
                      <strong>Booking Date:</strong> {format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Start Time:</strong> {format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                    <Typography variant="body1">
                      <strong>End Time:</strong> {booking.endTime ? format(new Date(booking.endTime), 'MMM dd, yyyy HH:mm') : 'Not specified'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Duration:</strong> {booking.endTime ? 
                        `${Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60))} hours` : 
                        'Not specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Parking Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6">Parking Information</Typography>
                    </Box>
                    <Typography variant="body1">
                      <strong>Location:</strong> {booking.location?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Zone:</strong> {booking.location?.location?.zone || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Slot Number:</strong> {booking.parkingSlot?.slotNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Floor:</strong> {booking.parkingSlot?.floor || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Vehicle Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DirectionsCar sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6">Vehicle Information</Typography>
                    </Box>
                    <Typography variant="body1">
                      <strong>Vehicle Type:</strong> {booking.vehicleType === 'two-wheeler' ? 'Two Wheeler' : 
                        booking.vehicleType === 'four-wheeler' ? 'Four Wheeler' : 
                        booking.vehicleType === 'bus' ? 'Bus' : booking.vehicleType}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Vehicle Number:</strong> {booking.vehicleNumber}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>
          {confirmAction === 'complete' ? 'Complete Booking?' : 'Cancel Booking?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction === 'complete'
              ? 'Are you sure you want to mark this booking as completed? This will free up the parking slot.'
              : 'Are you sure you want to cancel this booking? This will free up the parking slot. This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>No</Button>
          <Button 
            onClick={confirmActionHandler} 
            color={confirmAction === 'complete' ? 'primary' : 'error'} 
            autoFocus
          >
            Yes, {confirmAction === 'complete' ? 'Complete' : 'Cancel'} Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingDetails; 