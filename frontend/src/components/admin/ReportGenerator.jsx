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

// Chart component using Tailwind CSS
const ChartComponent = ({ data, type }) => {
  return (
    <div className="h-72 border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-lg mt-4 font-medium text-gray-700">{type} Chart</p>
      <p className="text-sm text-gray-500">Chart data would be rendered here using a chart library</p>
    </div>
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Report Generator</h1>
        <p className="text-gray-600 mb-6">
          Generate and export reports for bookings, occupancy, users, and revenue.
        </p>
        
        {error && (
          <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 mb-6 text-sm text-green-700 bg-green-100 rounded-lg">
            {success}
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Report Options</h2>
          <div className="w-full h-px bg-gray-200 mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={handleReportTypeChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="bookings">Booking Report</option>
                <option value="occupancy">Occupancy Report</option>
                <option value="users">User Report</option>
                <option value="revenue">Revenue Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                disabled={reportType === 'occupancy' || reportType === 'users'}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                disabled={reportType === 'occupancy' || reportType === 'users'}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            
            <div className="md:col-span-4">
              <div className="flex justify-end">
                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                      </svg>
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {reportData && (
          <div ref={reportRef} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 md:mb-0">{reportData.title}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleExportPDF}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    Export PDF
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800">
                  {reportData.title} - {reportData.subtitle}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {reportType === 'bookings' && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.summary.totalBookings}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Active Bookings</p>
                      <p className="text-2xl font-bold text-green-600">{reportData.summary.activeBookings}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Completed Bookings</p>
                      <p className="text-2xl font-bold text-blue-600">{reportData.summary.completedBookings}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Cancelled Bookings</p>
                      <p className="text-2xl font-bold text-red-600">{reportData.summary.cancelledBookings}</p>
                    </div>
                  </>
                )}
                
                {reportType === 'occupancy' && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Locations</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.summary.totalLocations}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Two Wheeler Occupancy</p>
                      <p className="text-xl font-bold text-indigo-600">{reportData.summary.overallOccupancy.twoWheelers}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Four Wheeler Occupancy</p>
                      <p className="text-xl font-bold text-purple-600">{reportData.summary.overallOccupancy.fourWheelers}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Bus Occupancy</p>
                      <p className="text-xl font-bold text-yellow-600">{reportData.summary.overallOccupancy.buses}</p>
                    </div>
                  </>
                )}
                
                {reportType === 'users' && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.summary.totalUsers}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Admin Users</p>
                      <p className="text-2xl font-bold text-blue-600">{reportData.summary.adminUsers}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Regular Users</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.summary.regularUsers}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Users with Vehicles</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.summary.usersWithVehicles}</p>
                    </div>
                  </>
                )}
                
                {reportType === 'revenue' && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">{reportData.summary.totalRevenue}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Two Wheeler Revenue</p>
                      <p className="text-xl font-bold text-gray-800">{reportData.summary.twoWheelerRevenue}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Four Wheeler Revenue</p>
                      <p className="text-xl font-bold text-gray-800">{reportData.summary.fourWheelerRevenue}</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Bus Revenue</p>
                      <p className="text-xl font-bold text-gray-800">{reportData.summary.busRevenue}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {reportType === 'bookings' && 'Booking Trends'}
                  {reportType === 'occupancy' && 'Occupancy Distribution'}
                  {reportType === 'users' && 'User Distribution'}
                  {reportType === 'revenue' && 'Revenue Trends'}
                </h3>
                <ChartComponent 
                  data={reportData.chartData} 
                  type={
                    reportType === 'bookings' ? 'Booking' :
                    reportType === 'occupancy' ? 'Occupancy' :
                    reportType === 'users' ? 'User' : 'Revenue'
                  } 
                />
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Detailed Data</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportType === 'bookings' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </>
                        )}
                        
                        {reportType === 'occupancy' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Two Wheeler</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Four Wheeler</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Occupancy</th>
                          </>
                        )}
                        
                        {reportType === 'users' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                          </>
                        )}
                        
                        {reportType === 'revenue' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportType === 'bookings' && reportData.tableData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.user}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{formatVehicleType(item.vehicleType)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.startTime}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full 
                              ${item.status === 'active' ? 'bg-green-100 text-green-800' : 
                                item.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      
                      {reportType === 'occupancy' && reportData.tableData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.zone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.occupancy.twoWheelers}/{item.capacity.twoWheelers} ({item.percentages.twoWheelers}%)</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.occupancy.fourWheelers}/{item.capacity.fourWheelers} ({item.percentages.fourWheelers}%)</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.occupancy.buses}/{item.capacity.buses} ({item.percentages.buses}%)</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.occupancy.total}/{item.capacity.total} ({item.percentages.total}%)</td>
                        </tr>
                      ))}
                      
                      {reportType === 'users' && reportData.tableData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{formatVehicleType(item.vehicleType)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.vehicleNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.createdAt}</td>
                        </tr>
                      ))}
                      
                      {reportType === 'revenue' && reportData.tableData.map((item) => (
                        <tr key={item.date} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.formattedDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">₹{item.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Print Dialog */}
      {openPrintDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Print Report</h3>
            <p className="text-gray-600 mb-6">
              This would open the browser's print dialog to print the report.
              In a real application, we would prepare the report content for printing.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setOpenPrintDialog(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setOpenPrintDialog(false);
                  window.print(); // This will trigger the browser's print dialog
                }}
                className="px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator; 