import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdminUser = isAdmin();
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };
  
  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };
  
  // Navigation items for regular users
  const userNavItems = [
    { text: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/dashboard' },
    { text: 'Parking Slots', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', path: '/parking-slots' },
    { text: 'Booking History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', path: '/booking-history' },
    { text: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', path: '/profile' },
  ];
  
  // Navigation items for admin users
  const adminNavItems = [
    { text: 'Admin Dashboard', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', path: '/admin/dashboard' },
    { text: 'Manage Parking', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', path: '/admin/parking' },
    { text: 'Bookings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', path: '/admin/bookings' },
    { text: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', path: '/admin/users' },
  ];
  
  // Use appropriate navigation items based on user role
  const navItems = isAdminUser ? adminNavItems : userNavItems;
  
  return (
    <nav className="bg-primary-600/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-primary-700/80 focus:outline-none transition-all duration-200 hover:scale-105"
                onClick={toggleMobileMenu}
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to={isAdminUser ? '/admin/dashboard' : '/dashboard'}
                className="text-white font-bold text-xl tracking-wide hover:opacity-80 transition-opacity duration-200"
              >
                PARKING SYSTEM
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.text}
                  to={item.path}
                  className={`${
                    location.pathname === item.path 
                      ? 'bg-primary-700 text-white' 
                      : 'text-white hover:bg-primary-700'
                  } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                >
                  {item.text}
                </Link>
              ))}
            </div>
          </div>
          
          {/* User dropdown */}
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={toggleUserMenu}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-white/25 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </button>
              </div>
              
              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 bg-white/90 backdrop-blur-sm ring-1 ring-black/5 z-50 border border-white/20 transform transition-all duration-200"
                >
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-primary-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.text}
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? 'bg-primary-800 text-white'
                    : 'text-white hover:bg-primary-800'
                } block px-3 py-2 rounded-md text-base font-medium flex items-center`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                {item.text}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left text-white hover:bg-primary-800 block px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;