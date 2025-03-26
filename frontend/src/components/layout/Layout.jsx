import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Only show navbar if user is authenticated */}
      {authenticated && <Navbar />}
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Box>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Layout; 