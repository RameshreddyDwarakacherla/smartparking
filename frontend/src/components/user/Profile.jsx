import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Save } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    vehicleType: 'none',
    vehicleNumber: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        vehicleType: user.vehicleType || 'none',
        vehicleNumber: user.vehicleNumber || '',
      });
    }
  }, [user]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
    
    // Clear vehicle number if vehicle type is none
    if (name === 'vehicleType' && value === 'none') {
      setProfileData(prev => ({
        ...prev,
        vehicleNumber: '',
      }));
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  
  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await userAPI.updateUser(user._id, profileData);
      setSuccess('Profile updated successfully');
      
      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify({
        ...user,
        ...profileData,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const validatePasswordForm = () => {
    // Reset error
    setPasswordError('');
    
    // Validate current password
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    
    // Validate new password
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return false;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return false;
    }
    
    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleUpdatePassword = async () => {
    // Validate form
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await userAPI.updatePassword(user._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setSuccess('Password updated successfully');
      setPasswordDialogOpen(false);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
    setPasswordError('');
  };
  
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordError('');
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your personal information and account settings.
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={profileData.email}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleProfileChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Vehicle Type"
                name="vehicleType"
                value={profileData.vehicleType}
                onChange={handleProfileChange}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="two-wheeler">Two Wheeler</MenuItem>
                <MenuItem value="four-wheeler">Four Wheeler</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vehicle Number"
                name="vehicleNumber"
                value={profileData.vehicleNumber}
                onChange={handleProfileChange}
                disabled={profileData.vehicleType === 'none'}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Change your password to keep your account secure.
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            onClick={handleOpenPasswordDialog}
          >
            Change Password
          </Button>
        </Paper>
      </Box>
      
      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter your current password and a new password.
          </DialogContentText>
          
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            fullWidth
            label="Current Password"
            name="currentPassword"
            type={showPassword ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            fullWidth
            label="New Password"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdatePassword} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 