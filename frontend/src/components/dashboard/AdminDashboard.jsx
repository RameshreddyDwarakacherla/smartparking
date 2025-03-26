import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  PeopleAlt,
  DirectionsCar,
  TwoWheeler,
  DirectionsBus,
  EventAvailable,
  OpenInNew,
  Assessment,
  LocationOn,
  ViewList,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { parkingAPI, bookingAPI, userAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLocations: 0,
    parkingSummary: {
      twoWheelers: { total: 0, occupied: 0 },
      fourWheelers: { total: 0, occupied: 0 },
      buses: { total: 0, occupied: 0 },
    },
    recentBookings: [],
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersResponse = await userAPI.getUsers();
        const totalUsers = usersResponse.data.count;

        // Fetch parking locations
        const locationsResponse = await parkingAPI.getLocations();
        const locations = locationsResponse.data.data;

        // Calculate parking summary
        const parkingSummary = {
          twoWheelers: { total: 0, occupied: 0 },
          fourWheelers: { total: 0, occupied: 0 },
          buses: { total: 0, occupied: 0 },
        };

        locations.forEach(location => {
          parkingSummary.twoWheelers.total += location.capacity.twoWheelers;
          parkingSummary.twoWheelers.occupied += location.occupancy.twoWheelers;
          
          parkingSummary.fourWheelers.total += location.capacity.fourWheelers;
          parkingSummary.fourWheelers.occupied += location.occupancy.fourWheelers;
          
          parkingSummary.buses.total += location.capacity.buses;
          parkingSummary.buses.occupied += location.occupancy.buses;
        });

        // Fetch recent bookings
        const bookingsResponse = await bookingAPI.getBookings();
        const recentBookings = bookingsResponse.data.data.slice(0, 5);

        setStats({
          totalUsers,
          totalLocations: locations.length,
          parkingSummary,
          recentBookings,
        });
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
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
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Monitor and manage the parking system. View statistics, manage slots, and generate reports.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          {/* Users Summary */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleAlt sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total Users</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.totalUsers}
                </Typography>
                <Button
                  component={Link}
                  to="/admin/users"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Two Wheeler Stats */}
          <Grid item xs={12} sm={4} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TwoWheeler sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Two Wheelers</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.parkingSummary.twoWheelers.occupied}/{stats.parkingSummary.twoWheelers.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Slots Occupied
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Four Wheeler Stats */}
          <Grid item xs={12} sm={4} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Four Wheelers</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.parkingSummary.fourWheelers.occupied}/{stats.parkingSummary.fourWheelers.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Slots Occupied
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Bus Stats */}
          <Grid item xs={12} sm={4} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DirectionsBus sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Buses</Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.parkingSummary.buses.occupied}/{stats.parkingSummary.buses.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Slots Occupied
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions Section */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                component={Link}
                to="/admin/parking"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<LocationOn />}
                sx={{ py: 1.5 }}
              >
                Manage Parking
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                component={Link}
                to="/admin/users"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<PeopleAlt />}
                sx={{ py: 1.5 }}
              >
                Manage Users
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                component={Link}
                to="/admin/bookings"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<ViewList />}
                sx={{ py: 1.5 }}
              >
                Manage Bookings
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                component={Link}
                to="/admin/reports"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Assessment />}
                sx={{ py: 1.5 }}
              >
                Generate Reports
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Typography variant="h5">Recent Bookings</Typography>
          <Button
            component={Link}
            to="/admin/bookings"
            startIcon={<EventAvailable />}
            color="primary"
          >
            View All Bookings
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Slot</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                    <TableCell>{booking.user?.name || 'N/A'}</TableCell>
                    <TableCell>{booking.parkingSlot?.slotNumber || 'N/A'}</TableCell>
                    <TableCell>
                      {booking.vehicleNumber} ({booking.vehicleType})
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
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
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/admin/bookings/${booking._id}`}
                        size="small"
                        startIcon={<OpenInNew />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography align="center">No recent bookings found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 