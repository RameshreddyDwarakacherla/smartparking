import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show navbar if user is authenticated */}
      {authenticated && <Navbar />}
      
      {/* Main content */}
      <main className="flex-grow py-3">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout; 