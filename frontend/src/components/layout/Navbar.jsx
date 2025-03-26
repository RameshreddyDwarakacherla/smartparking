import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  LocalParking,
  History,
  Person,
  Logout,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdminUser = isAdmin();
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };
  
  const handleMenuItemClick = (path) => {
    navigate(path);
    handleCloseUserMenu();
    setDrawerOpen(false);
  };
  
  // Navigation items for regular users
  const userNavItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Parking Slots', icon: <LocalParking />, path: '/parking-slots' },
    { text: 'Booking History', icon: <History />, path: '/booking-history' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];
  
  // Navigation items for admin users
  const adminNavItems = [
    { text: 'Admin Dashboard', icon: <AdminPanelSettings />, path: '/admin/dashboard' },
    { text: 'Manage Parking', icon: <LocalParking />, path: '/admin/parking' },
    { text: 'Bookings', icon: <History />, path: '/admin/bookings' },
    { text: 'Users', icon: <Person />, path: '/admin/users' },
  ];
  
  // Use appropriate navigation items based on user role
  const navItems = isAdminUser ? adminNavItems : userNavItems;
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for larger screens */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to={isAdminUser ? '/admin/dashboard' : '/dashboard'}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PARKING SYSTEM
          </Typography>
          
          {/* Mobile menu icon */}
          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleToggleDrawer}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
          
          {/* Logo for mobile screens */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to={isAdminUser ? '/admin/dashboard' : '/dashboard'}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PARKING
          </Typography>
          
          {/* Desktop navigation buttons */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  bgcolor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                  },
                  mx: 0.5,
                  px: 2
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          
          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.name || 'User'} src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => handleMenuItemClick('/profile')}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile navigation drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleToggleDrawer}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
        >
          <List>
            {navItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => handleMenuItemClick(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 