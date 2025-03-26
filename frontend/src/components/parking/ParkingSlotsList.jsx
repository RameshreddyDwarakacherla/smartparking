import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import {
  DirectionsCar,
  TwoWheeler,
  DirectionsBus,
  LocalParking
} from '@mui/icons-material';
import { parkingAPI, bookingAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ParkingSlotsList = () => {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSlotType, setSelectedSlotType] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 3600000), // Default to 1 hour later
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeFromQuery = queryParams.get('type');

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await parkingAPI.getLocations();
        setLocations(response.data.data);

        // Set default vehicle type from user profile or query param
        let defaultType = '';
        if (typeFromQuery) {
          defaultType = typeFromQuery;
        } else if (user?.vehicleType && user.vehicleType !== 'none') {
          // Convert user vehicle type to API format
          if (user.vehicleType === 'two-wheeler') defaultType = 'two-wheeler';
          else if (user.vehicleType === 'four-wheeler') defaultType = 'four-wheeler';
          else if (user.vehicleType === 'bus') defaultType = 'bus';
        }

        if (defaultType) {
          setSelectedSlotType(defaultType);
          setBookingData(prev => ({
            ...prev,
            vehicleType: defaultType,
            vehicleNumber: user?.vehicleNumber || ''
          }));
        }

        if (response.data.data.length > 0) {
          setSelectedLocation(response.data.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to load parking locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [typeFromQuery, user]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedLocation || !selectedSlotType) return;

      setLoading(true);
      try {
        const response = await parkingAPI.getSlots({ 
          location: selectedLocation,
          type: selectedSlotType,
          status: 'available'
        });
        setAvailableSlots(response.data.data);
      } catch (error) {
        console.error('Error fetching slots:', error);
        setError('Failed to load available slots');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedLocation, selectedSlotType]);

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const handleSlotTypeChange = (event) => {
    const type = event.target.value;
    setSelectedSlotType(type);
    setBookingData(prev => ({
      ...prev,
      vehicleType: type
    }));
  };

  const handleBookingClick = (slot) => {
    setSelectedSlot(slot);
    setBookingDialogOpen(true);
  };

  const handleBookingInputChange = (event) => {
    const { name, value } = event.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });
  };

  const handleDateTimeChange = (name, value) => {
    setBookingData({
      ...bookingData,
      [name]: value
    });
  };

  const handleCloseDialog = () => {
    setBookingDialogOpen(false);
    setError('');
  };

  const handleSubmitBooking = async () => {
    if (!bookingData.vehicleNumber) {
      setError('Please enter your vehicle number');
      return;
    }

    if (!bookingData.startTime) {
      setError('Please select a start time');
      return;
    }

    try {
      const selectedLocationObj = locations.find(loc => loc._id === selectedLocation);
      
      const bookingDetails = {
        parkingSlot: selectedSlot._id,
        location: selectedLocation,
        vehicleNumber: bookingData.vehicleNumber,
        vehicleType: bookingData.vehicleType,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      };

      await bookingAPI.createBooking(bookingDetails);
      setSuccess('Booking successful!');
      setBookingDialogOpen(false);
      
      // Refresh available slots
      const response = await parkingAPI.getSlots({ 
        location: selectedLocation,
        type: selectedSlotType,
        status: 'available'
      });
      setAvailableSlots(response.data.data);

      // Redirect to bookings page after a short delay
      setTimeout(() => {
        navigate('/booking-history');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'two-wheeler':
        return <TwoWheeler />;
      case 'four-wheeler':
        return <DirectionsCar />;
      case 'bus':
        return <DirectionsBus />;
      default:
        return <LocalParking />;
    }
  };

  if (loading && !locations.length) {
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
          Parking Slots
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Find and book available parking slots at your preferred location.
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="location-select-label">Location</InputLabel>
              <Select
                labelId="location-select-label"
                id="location-select"
                value={selectedLocation}
                label="Location"
                onChange={handleLocationChange}
              >
                {locations.map((location) => (
                  <MenuItem key={location._id} value={location._id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="type-select-label">Vehicle Type</InputLabel>
              <Select
                labelId="type-select-label"
                id="type-select"
                value={selectedSlotType}
                label="Vehicle Type"
                onChange={handleSlotTypeChange}
              >
                <MenuItem value="two-wheeler">Two Wheeler</MenuItem>
                <MenuItem value="four-wheeler">Four Wheeler</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Available Slots
            {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
          </Typography>

          {!loading && availableSlots.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No available slots found for the selected criteria. Try a different location or vehicle type.
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {availableSlots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} key={slot._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Slot {slot.slotNumber}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getVehicleIcon(slot.type)}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {locations.find(loc => loc._id === slot.location)?.name || 'Unknown Location'}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Available
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      sx={{ mt: 2 }}
                      onClick={() => handleBookingClick(slot)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Book Parking Slot</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are booking slot {selectedSlot?.slotNumber} at{' '}
            {locations.find(loc => loc._id === selectedLocation)?.name}.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="dense"
            id="vehicleNumber"
            name="vehicleNumber"
            label="Vehicle Number"
            type="text"
            fullWidth
            variant="outlined"
            value={bookingData.vehicleNumber}
            onChange={handleBookingInputChange}
            sx={{ mt: 2 }}
          />
          
          <TextField
            margin="dense"
            id="startTime"
            name="startTime"
            label="Start Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={bookingData.startTime instanceof Date 
              ? bookingData.startTime.toISOString().slice(0, 16) 
              : bookingData.startTime}
            onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
            sx={{ mt: 2 }}
          />
          
          <TextField
            margin="dense"
            id="endTime"
            name="endTime"
            label="End Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={bookingData.endTime instanceof Date 
              ? bookingData.endTime.toISOString().slice(0, 16) 
              : bookingData.endTime}
            onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitBooking} variant="contained">Book</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParkingSlotsList; 