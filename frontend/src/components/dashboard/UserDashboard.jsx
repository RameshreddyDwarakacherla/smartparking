import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress,
  Box,
  Divider
} from '@mui/material';
import { 
  DirectionsCar, 
  TwoWheeler, 
  DirectionsBus, 
  History 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parkingAPI, bookingAPI } from '../../utils/api';

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLocations: 0,
    availableSlots: {
      twoWheelers: 0,
      fourWheelers: 0,
      buses: 0
    },
    activeBookings: 0
  });
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch parking locations
        const locationsResponse = await parkingAPI.getLocations();
        const locations = locationsResponse.data.data;
        
        // Calculate available slots by type
        const availableSlots = {
          twoWheelers: 0,
          fourWheelers: 0,
          buses: 0
        };
        
        locations.forEach(location => {
          const { capacity, occupancy } = location;
          availableSlots.twoWheelers += capacity.twoWheelers - occupancy.twoWheelers;
          availableSlots.fourWheelers += capacity.fourWheelers - occupancy.fourWheelers;
          availableSlots.buses += capacity.buses - occupancy.buses;
        });
        
        // Fetch active bookings
        const bookingsResponse = await bookingAPI.getBookings({ status: 'active' });
        const activeBookingsCount = bookingsResponse.data.count;
        
        setStats({
          totalLocations: locations.length,
          availableSlots,
          activeBookings: activeBookingsCount
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
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
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your parking reservations and view available slots across all locations.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Current Availability
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Two Wheeler Availability */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TwoWheeler sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Two Wheelers</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.availableSlots.twoWheelers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Slots Available
                </Typography>
                <Button 
                  component={Link} 
                  to="/parking-slots?type=two-wheeler" 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 2 }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Four Wheeler Availability */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Four Wheelers</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.availableSlots.fourWheelers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Slots Available
                </Typography>
                <Button 
                  component={Link} 
                  to="/parking-slots?type=four-wheeler" 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 2 }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Bus Availability */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DirectionsBus sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Buses</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.availableSlots.buses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Slots Available
                </Typography>
                <Button 
                  component={Link} 
                  to="/parking-slots?type=bus" 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 2 }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Typography variant="h5">Your Bookings</Typography>
          <Button 
            component={Link} 
            to="/booking-history" 
            startIcon={<History />} 
            color="primary"
          >
            View All Bookings
          </Button>
        </Box>
        
        {stats.activeBookings > 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            You have {stats.activeBookings} active booking{stats.activeBookings !== 1 ? 's' : ''}.
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>
            You don't have any active bookings. Book a parking slot now.
          </Typography>
        )}
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              component={Link} 
              to="/parking-slots" 
              variant="contained" 
              fullWidth 
              sx={{ py: 1.5 }}
            >
              Book Parking Slot
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserDashboard; 