import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingAPI, bookingAPI, userAPI } from '../../utils/api';

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, Admin User!</h1>
        <p className="text-gray-600 mt-2">
          Manage your parking reservations and view available slots across all locations.
        </p>
      </div>

      <div className="w-full h-px bg-gray-200 my-6"></div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Current Availability</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Two Wheeler Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-primary-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h3a1 1 0 011 1v8a1 1 0 01-1 1h-1m-10 0h4" />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-gray-800">Two Wheelers</h3>
              </div>
              
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {stats.parkingSummary.twoWheelers.total - stats.parkingSummary.twoWheelers.occupied}
              </div>
              
              <p className="text-gray-500 mb-4">Slots Available</p>
              
              <button className="w-full py-2 px-4 bg-white border border-primary-500 rounded-md text-primary-600 font-medium hover:bg-primary-50 transition-colors duration-200">
                BOOK NOW
              </button>
            </div>
          </div>
          
          {/* Four Wheeler Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-primary-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-gray-800">Four Wheelers</h3>
              </div>
              
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {stats.parkingSummary.fourWheelers.total - stats.parkingSummary.fourWheelers.occupied}
              </div>
              
              <p className="text-gray-500 mb-4">Slots Available</p>
              
              <button className="w-full py-2 px-4 bg-white border border-primary-500 rounded-md text-primary-600 font-medium hover:bg-primary-50 transition-colors duration-200">
                BOOK NOW
              </button>
            </div>
          </div>
          
          {/* Bus Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-primary-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-gray-800">Buses</h3>
              </div>
              
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {stats.parkingSummary.buses.total - stats.parkingSummary.buses.occupied}
              </div>
              
              <p className="text-gray-500 mb-4">Slots Available</p>
              
              <button className="w-full py-2 px-4 bg-white border border-primary-500 rounded-md text-primary-600 font-medium hover:bg-primary-50 transition-colors duration-200">
                BOOK NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Bookings</h2>
          <Link to="/admin/bookings" className="text-primary-600 hover:text-primary-700 font-medium">
            VIEW ALL BOOKINGS
          </Link>
        </div>
        
        {stats.recentBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.bookingId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.vehicleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${booking.status === 'active' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/admin/bookings/${booking._id}`} 
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 