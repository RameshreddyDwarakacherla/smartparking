import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  
  const getStatusClasses = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  if (loading && !booking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link 
              to="/admin/bookings" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Bookings
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Booking Details</h1>
            <p className="text-gray-500 mt-1">Booking ID: {id}</p>
          </div>
          
          {booking && booking.status === 'active' && (
            <div className="flex space-x-3">
              <button
                onClick={handleCompleteBooking}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Complete
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-red-600 hover:bg-red-50 text-red-600 font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
            </div>
          )}
        </div>
        
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
        
        {booking && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Booking Information</h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClasses(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* User Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">User Information</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-800">{booking.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-800">{booking.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-800">{booking.user?.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Booking Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">Booking Timeline</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Booking Date</p>
                    <p className="text-gray-800">{format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Start Time</p>
                    <p className="text-gray-800">{format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">End Time</p>
                    <p className="text-gray-800">{booking.endTime ? format(new Date(booking.endTime), 'MMM dd, yyyy HH:mm') : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-gray-800">
                      {booking.endTime ? 
                        `${Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60))} hours` : 
                        'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Parking Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">Parking Information</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-gray-800">{booking.location?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Zone</p>
                    <p className="text-gray-800">{booking.location?.location?.zone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Slot Number</p>
                    <p className="text-gray-800">{booking.parkingSlot?.slotNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Floor</p>
                    <p className="text-gray-800">{booking.parkingSlot?.floor || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Vehicle Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3a1 1 0 00-.7-.7l-3.5-1L8 5.4V4h5V3H3zm0 3a1 1 0 011-1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 011 1v1h3a1 1 0 001 1v3a1 1 0 01-1 1h-1.05a2.5 2.5 0 01-4.9 0H3a1 1 0 01-1-1V7z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">Vehicle Information</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle Type</p>
                    <p className="text-gray-800 capitalize">
                      {booking.vehicleType === 'two-wheeler' ? 'Two Wheeler' : 
                        booking.vehicleType === 'four-wheeler' ? 'Four Wheeler' : 
                        booking.vehicleType === 'bus' ? 'Bus' : booking.vehicleType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle Number</p>
                    <p className="text-gray-800">{booking.vehicleNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      {openConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction === 'complete' ? 'Complete Booking?' : 'Cancel Booking?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction === 'complete'
                ? 'Are you sure you want to mark this booking as completed? This will free up the parking slot.'
                : 'Are you sure you want to cancel this booking? This will free up the parking slot. This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setOpenConfirmDialog(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmActionHandler}
                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                  confirmAction === 'complete' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Yes, {confirmAction === 'complete' ? 'Complete' : 'Cancel'} Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails; 