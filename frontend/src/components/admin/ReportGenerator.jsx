import { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Save,
  Print,
  BarChart,
  DateRange,
  LocalOffer,
  DirectionsCar,
  TwoWheeler,
  DirectionsBus,
  LocationOn,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { parkingAPI, bookingAPI, userAPI } from '../../utils/api';

// Mock chart component (in a real app, you might use a library like Chart.js or Recharts)
const ChartComponent = ({ data, type }) => {
  return (
    <Box 
      sx={{ 
        height: 300, 
        border: '1px dashed #ccc', 
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <BarChart sx={{ fontSize: 64, color: 'primary.main', opacity: 0.7 }} />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        {type} Chart
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Chart data would be rendered here using a chart library
      </Typography>
    </Box>
  );
};

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days ago
    endDate: format(new Date(), 'yyyy-MM-dd'), // today
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportData, setReportData] = useState(null);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  
  const reportRef = useRef(null);
  
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setReportData(null); // Clear previous report data
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value,
    });
  };
  
  const generateReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      let data;
      
      switch (reportType) {
        case 'bookings':
          const bookingsResponse = await bookingAPI.getBookings({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
          data = processBookingsData(bookingsResponse.data.data);
          break;
          
        case 'occupancy':
          const locationsResponse = await parkingAPI.getLocations();
          data = processOccupancyData(locationsResponse.data.data);
          break;
          
        case 'users':
          const usersResponse = await userAPI.getUsers();
          data = processUsersData(usersResponse.data.data);
          break;
          
        case 'revenue':
          // This would typically call a revenue API endpoint
          // For demo purposes, we'll use booking data to simulate revenue
          const revenueResponse = await bookingAPI.getBookings({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
          data = processRevenueData(revenueResponse.data.data);
          break;
          
        default:
          throw new Error('Invalid report type');
      }
      
      setReportData(data);
      setSuccess('Report generated successfully');
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const processBookingsData = (bookings) => {
    // Count bookings by status
    const bookingsByStatus = {
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    
    // Count bookings by vehicle type
    const bookingsByVehicleType = {
      'two-wheeler': 0,
      'four-wheeler': 0,
      'bus': 0,
    };
    
    // Record bookings for table data
    const bookingsTableData = bookings.map(booking => ({
      id: booking._id,
      user: booking.user?.name || 'N/A',
      vehicleType: booking.vehicleType,
      vehicleNumber: booking.vehicleNumber,
      location: booking.location?.name || 'N/A',
      slotNumber: booking.parkingSlot?.slotNumber || 'N/A',
      startTime: format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm'),
      endTime: booking.endTime ? format(new Date(booking.endTime), 'MMM dd, yyyy HH:mm') : 'N/A',
      status: booking.status,
    }));
    
    // Process bookings for statistical data
    bookings.forEach(booking => {
      // Count by status
      if (bookingsByStatus.hasOwnProperty(booking.status)) {
        bookingsByStatus[booking.status]++;
      }
      
      // Count by vehicle type
      if (bookingsByVehicleType.hasOwnProperty(booking.vehicleType)) {
        bookingsByVehicleType[booking.vehicleType]++;
      }
    });
    
    return {
      title: 'Booking Report',
      subtitle: `${format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`,
      summary: {
        totalBookings: bookings.length,
        activeBookings: bookingsByStatus.active,
        completedBookings: bookingsByStatus.completed,
        cancelledBookings: bookingsByStatus.cancelled,
      },
      chartData: {
        bookingsByStatus,
        bookingsByVehicleType,
      },
      tableData: bookingsTableData,
    };
  };
  
  const processOccupancyData = (locations) => {
    // Calculate occupancy statistics
    const totalCapacity = {
      twoWheelers: 0,
      fourWheelers: 0,
      buses: 0,
    };
    
    const totalOccupancy = {
      twoWheelers: 0,
      fourWheelers: 0,
      buses: 0,
    };
    
    const occupancyByLocation = locations.map(location => {
      // Update totals
      totalCapacity.twoWheelers += location.capacity.twoWheelers || 0;
      totalCapacity.fourWheelers += location.capacity.fourWheelers || 0;
      totalCapacity.buses += location.capacity.buses || 0;
      
      totalOccupancy.twoWheelers += location.occupancy.twoWheelers || 0;
      totalOccupancy.fourWheelers += location.occupancy.fourWheelers || 0;
      totalOccupancy.buses += location.occupancy.buses || 0;
      
      // Calculate occupancy percentages
      const twoWheelerPercentage = location.capacity.twoWheelers > 0
        ? (location.occupancy.twoWheelers / location.capacity.twoWheelers) * 100
        : 0;
        
      const fourWheelerPercentage = location.capacity.fourWheelers > 0
        ? (location.occupancy.fourWheelers / location.capacity.fourWheelers) * 100
        : 0;
        
      const busPercentage = location.capacity.buses > 0
        ? (location.occupancy.buses / location.capacity.buses) * 100
        : 0;
        
      const totalPercentage = 
        (location.capacity.twoWheelers + location.capacity.fourWheelers + location.capacity.buses) > 0
          ? ((location.occupancy.twoWheelers + location.occupancy.fourWheelers + location.occupancy.buses) /
             (location.capacity.twoWheelers + location.capacity.fourWheelers + location.capacity.buses)) * 100
          : 0;
      
      return {
        id: location._id,
        name: location.name,
        zone: location.location.zone,
        type: location.location.type,
        capacity: {
          twoWheelers: location.capacity.twoWheelers,
          fourWheelers: location.capacity.fourWheelers,
          buses: location.capacity.buses,
          total: location.capacity.twoWheelers + location.capacity.fourWheelers + location.capacity.buses,
        },
        occupancy: {
          twoWheelers: location.occupancy.twoWheelers,
          fourWheelers: location.occupancy.fourWheelers,
          buses: location.occupancy.buses,
          total: location.occupancy.twoWheelers + location.occupancy.fourWheelers + location.occupancy.buses,
        },
        percentages: {
          twoWheelers: twoWheelerPercentage.toFixed(1),
          fourWheelers: fourWheelerPercentage.toFixed(1),
          buses: busPercentage.toFixed(1),
          total: totalPercentage.toFixed(1),
        },
      };
    });
    
    // Calculate overall occupancy percentages
    const overallTwoWheelerPercentage = totalCapacity.twoWheelers > 0
      ? (totalOccupancy.twoWheelers / totalCapacity.twoWheelers) * 100
      : 0;
      
    const overallFourWheelerPercentage = totalCapacity.fourWheelers > 0
      ? (totalOccupancy.fourWheelers / totalCapacity.fourWheelers) * 100
      : 0;
      
    const overallBusPercentage = totalCapacity.buses > 0
      ? (totalOccupancy.buses / totalCapacity.buses) * 100
      : 0;
      
    const overallTotalPercentage = 
      (totalCapacity.twoWheelers + totalCapacity.fourWheelers + totalCapacity.buses) > 0
        ? ((totalOccupancy.twoWheelers + totalOccupancy.fourWheelers + totalOccupancy.buses) /
           (totalCapacity.twoWheelers + totalCapacity.fourWheelers + totalCapacity.buses)) * 100
        : 0;
    
    return {
      title: 'Occupancy Report',
      subtitle: `Current Parking Occupancy as of ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
      summary: {
        totalLocations: locations.length,
        overallOccupancy: {
          twoWheelers: `${totalOccupancy.twoWheelers}/${totalCapacity.twoWheelers} (${overallTwoWheelerPercentage.toFixed(1)}%)`,
          fourWheelers: `${totalOccupancy.fourWheelers}/${totalCapacity.fourWheelers} (${overallFourWheelerPercentage.toFixed(1)}%)`,
          buses: `${totalOccupancy.buses}/${totalCapacity.buses} (${overallBusPercentage.toFixed(1)}%)`,
          total: `${totalOccupancy.twoWheelers + totalOccupancy.fourWheelers + totalOccupancy.buses}/${totalCapacity.twoWheelers + totalCapacity.fourWheelers + totalCapacity.buses} (${overallTotalPercentage.toFixed(1)}%)`,
        },
      },
      chartData: {
        overallPercentages: {
          twoWheelers: overallTwoWheelerPercentage,
          fourWheelers: overallFourWheelerPercentage,
          buses: overallBusPercentage,
          total: overallTotalPercentage,
        },
      },
      tableData: occupancyByLocation,
    };
  };
  
  const processUsersData = (users) => {
    // Count users by role
    const usersByRole = {
      admin: 0,
      user: 0,
    };
    
    // Count users by vehicle type
    const usersByVehicleType = {
      'two-wheeler': 0,
      'four-wheeler': 0,
      'bus': 0,
      'none': 0,
    };
    
    // Process users for table data
    const usersTableData = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      vehicleType: user.vehicleType || 'none',
      vehicleNumber: user.vehicleNumber || 'N/A',
      createdAt: format(new Date(user.createdAt), 'MMM dd, yyyy'),
    }));
    
    // Process users for statistical data
    users.forEach(user => {
      // Count by role
      if (usersByRole.hasOwnProperty(user.role)) {
        usersByRole[user.role]++;
      }
      
      // Count by vehicle type
      const vehicleType = user.vehicleType || 'none';
      if (usersByVehicleType.hasOwnProperty(vehicleType)) {
        usersByVehicleType[vehicleType]++;
      }
    });
    
    return {
      title: 'User Report',
      subtitle: `Total Users: ${users.length}`,
      summary: {
        totalUsers: users.length,
        adminUsers: usersByRole.admin,
        regularUsers: usersByRole.user,
        usersWithVehicles: users.length - usersByVehicleType.none,
      },
      chartData: {
        usersByRole,
        usersByVehicleType,
      },
      tableData: usersTableData,
    };
  };
  
  const processRevenueData = (bookings) => {
    // For demo purposes, simulate revenue calculation
    // In a real app, this would come from actual payment data
    
    const ratePerHour = {
      'two-wheeler': 10,
      'four-wheeler': 20,
      'bus': 50,
    };
    
    let totalRevenue = 0;
    const revenueByVehicleType = {
      'two-wheeler': 0,
      'four-wheeler': 0,
      'bus': 0,
    };
    
    const revenueByDay = {};
    
    // Process revenue data
    bookings.forEach(booking => {
      // Only consider completed bookings for revenue
      if (booking.status !== 'completed') return;
      
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime || new Date());
      
      // Calculate duration in hours
      const durationHours = Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60)));
      
      // Calculate revenue for this booking
      const rate = ratePerHour[booking.vehicleType] || 0;
      const bookingRevenue = rate * durationHours;
      
      // Update total revenue
      totalRevenue += bookingRevenue;
      
      // Update revenue by vehicle type
      if (revenueByVehicleType.hasOwnProperty(booking.vehicleType)) {
        revenueByVehicleType[booking.vehicleType] += bookingRevenue;
      }
      
      // Update revenue by day
      const day = format(startTime, 'yyyy-MM-dd');
      revenueByDay[day] = (revenueByDay[day] || 0) + bookingRevenue;
    });
    
    // Convert revenue by day to an array for easier rendering
    const revenueByDayArray = Object.keys(revenueByDay).map(day => ({
      date: day,
      revenue: revenueByDay[day],
      formattedDate: format(new Date(day), 'MMM dd, yyyy'),
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      title: 'Revenue Report',
      subtitle: `${format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`,
      summary: {
        totalRevenue: `₹${totalRevenue.toFixed(2)}`,
        twoWheelerRevenue: `₹${revenueByVehicleType['two-wheeler'].toFixed(2)}`,
        fourWheelerRevenue: `₹${revenueByVehicleType['four-wheeler'].toFixed(2)}`,
        busRevenue: `₹${revenueByVehicleType['bus'].toFixed(2)}`,
      },
      chartData: {
        revenueByVehicleType,
        revenueByDay: revenueByDayArray,
      },
      tableData: revenueByDayArray,
    };
  };
  
  const handlePrint = () => {
    setOpenPrintDialog(true);
  };
  
  const handleExportPDF = () => {
    alert('Export to PDF functionality would be implemented here using a library like jsPDF');
  };
  
  const handleExportCSV = () => {
    alert('Export to CSV functionality would be implemented here');
  };
  
  const formatVehicleType = (type) => {
    switch (type) {
      case 'two-wheeler':
        return 'Two Wheeler';
      case 'four-wheeler':
        return 'Four Wheeler';
      case 'bus':
        return 'Bus';
      default:
        return 'None';
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Report Generator
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Generate and export reports for bookings, occupancy, users, and revenue.
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
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Report Options
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="report-type-label">Report Type</InputLabel>
                <Select
                  labelId="report-type-label"
                  value={reportType}
                  label="Report Type"
                  onChange={handleReportTypeChange}
                >
                  <MenuItem value="bookings">Booking Report</MenuItem>
                  <MenuItem value="occupancy">Occupancy Report</MenuItem>
                  <MenuItem value="users">User Report</MenuItem>
                  <MenuItem value="revenue">Revenue Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={reportType === 'occupancy' || reportType === 'users'}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={reportType === 'occupancy' || reportType === 'users'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={generateReport}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <TableChart />}
                >
                  Generate Report
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {reportData && (
          <Box ref={reportRef}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">{reportData.title}</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPDF}
                  sx={{ mr: 1 }}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleExportCSV}
                  sx={{ mr: 1 }}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
              </Box>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {reportData.title} - {reportData.subtitle}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {reportType === 'bookings' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Bookings
                          </Typography>
                          <Typography variant="h4">
                            {reportData.summary.totalBookings}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Active Bookings
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {reportData.summary.activeBookings}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Completed Bookings
                          </Typography>
                          <Typography variant="h4" color="info.main">
                            {reportData.summary.completedBookings}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Cancelled Bookings
                          </Typography>
                          <Typography variant="h4" color="error.main">
                            {reportData.summary.cancelledBookings}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
                
                {reportType === 'occupancy' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Locations
                          </Typography>
                          <Typography variant="h4">
                            {reportData.summary.totalLocations}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Two Wheeler Occupancy
                          </Typography>
                          <Typography variant="h5">
                            {reportData.summary.overallOccupancy.twoWheelers}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Four Wheeler Occupancy
                          </Typography>
                          <Typography variant="h5">
                            {reportData.summary.overallOccupancy.fourWheelers}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Bus Occupancy
                          </Typography>
                          <Typography variant="h5">
                            {reportData.summary.overallOccupancy.buses}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
                
                {reportType === 'users' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Users
                          </Typography>
                          <Typography variant="h4">
                            {reportData.summary.totalUsers}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Admin Users
                          </Typography>
                          <Typography variant="h4" color="primary.main">
                            {reportData.summary.adminUsers}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Regular Users
                          </Typography>
                          <Typography variant="h4">
                            {reportData.summary.regularUsers}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Users with Vehicles
                          </Typography>
                          <Typography variant="h4">
                            {reportData.summary.usersWithVehicles}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
                
                {reportType === 'revenue' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Revenue
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {reportData.summary.totalRevenue}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Two Wheeler Revenue
                          </Typography>
                          <Typography variant="h5">
                            {reportData.summary.twoWheelerRevenue}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Four Wheeler Revenue
                          </Typography>
                          <Typography variant="h5">
                            {reportData.summary.fourWheelerRevenue}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Bus Revenue
                          </Typography>
                          <Typography variant="h5">
                            {reportData.summary.busRevenue}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
              </Grid>
              
              <Box sx={{ my: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {reportType === 'bookings' && 'Booking Trends'}
                  {reportType === 'occupancy' && 'Occupancy Distribution'}
                  {reportType === 'users' && 'User Distribution'}
                  {reportType === 'revenue' && 'Revenue Trends'}
                </Typography>
                <ChartComponent 
                  data={reportData.chartData} 
                  type={
                    reportType === 'bookings' ? 'Booking' :
                    reportType === 'occupancy' ? 'Occupancy' :
                    reportType === 'users' ? 'User' : 'Revenue'
                  } 
                />
              </Box>
              
              <Box sx={{ my: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Detailed Data
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        {reportType === 'bookings' && (
                          <>
                            <TableCell>ID</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Vehicle Type</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Start Time</TableCell>
                            <TableCell>Status</TableCell>
                          </>
                        )}
                        
                        {reportType === 'occupancy' && (
                          <>
                            <TableCell>Location</TableCell>
                            <TableCell>Zone</TableCell>
                            <TableCell>Two Wheeler</TableCell>
                            <TableCell>Four Wheeler</TableCell>
                            <TableCell>Bus</TableCell>
                            <TableCell>Total Occupancy</TableCell>
                          </>
                        )}
                        
                        {reportType === 'users' && (
                          <>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Vehicle Type</TableCell>
                            <TableCell>Vehicle Number</TableCell>
                            <TableCell>Registration Date</TableCell>
                          </>
                        )}
                        
                        {reportType === 'revenue' && (
                          <>
                            <TableCell>Date</TableCell>
                            <TableCell>Revenue</TableCell>
                          </>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportType === 'bookings' && reportData.tableData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id.substring(0, 8)}...</TableCell>
                          <TableCell>{item.user}</TableCell>
                          <TableCell>{formatVehicleType(item.vehicleType)}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>{item.startTime}</TableCell>
                          <TableCell>{item.status}</TableCell>
                        </TableRow>
                      ))}
                      
                      {reportType === 'occupancy' && reportData.tableData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.zone}</TableCell>
                          <TableCell>{item.occupancy.twoWheelers}/{item.capacity.twoWheelers} ({item.percentages.twoWheelers}%)</TableCell>
                          <TableCell>{item.occupancy.fourWheelers}/{item.capacity.fourWheelers} ({item.percentages.fourWheelers}%)</TableCell>
                          <TableCell>{item.occupancy.buses}/{item.capacity.buses} ({item.percentages.buses}%)</TableCell>
                          <TableCell>{item.occupancy.total}/{item.capacity.total} ({item.percentages.total}%)</TableCell>
                        </TableRow>
                      ))}
                      
                      {reportType === 'users' && reportData.tableData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>{item.role}</TableCell>
                          <TableCell>{formatVehicleType(item.vehicleType)}</TableCell>
                          <TableCell>{item.vehicleNumber}</TableCell>
                          <TableCell>{item.createdAt}</TableCell>
                        </TableRow>
                      ))}
                      
                      {reportType === 'revenue' && reportData.tableData.map((item) => (
                        <TableRow key={item.date}>
                          <TableCell>{item.formattedDate}</TableCell>
                          <TableCell>₹{item.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
      
      {/* Print Dialog */}
      <Dialog
        open={openPrintDialog}
        onClose={() => setOpenPrintDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Print Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This would open the browser's print dialog to print the report.
            In a real application, we would prepare the report content for printing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOpenPrintDialog(false);
              window.print(); // This will trigger the browser's print dialog
            }}
            variant="contained"
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportGenerator; 