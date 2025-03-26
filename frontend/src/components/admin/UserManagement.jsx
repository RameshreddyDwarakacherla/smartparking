import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Edit,
  Delete,
  PersonAdd,
  Check,
  Close,
  AdminPanelSettings,
  Person,
} from '@mui/icons-material';
import { userAPI } from '../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'user',
    vehicleType: 'none',
    vehicleNumber: '',
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data.data);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear vehicle number if vehicle type is none
    if (name === 'vehicleType' && value === 'none') {
      setFormData(prev => ({
        ...prev,
        vehicleNumber: '',
      }));
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: 'user',
      vehicleType: 'none',
      vehicleNumber: '',
    });
  };
  
  const handleOpenAddDialog = () => {
    resetForm();
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phoneNumber: user.phoneNumber,
      role: user.role,
      vehicleType: user.vehicleType || 'none',
      vehicleNumber: user.vehicleNumber || '',
    });
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const validateForm = (isEdit = false) => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!isEdit && !formData.password.trim()) {
      setError('Password is required for new users');
      return false;
    }
    
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    if (formData.vehicleType !== 'none' && !formData.vehicleNumber.trim()) {
      setError('Vehicle number is required when a vehicle type is selected');
      return false;
    }
    
    return true;
  };
  
  const handleAddUser = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await userAPI.createUser(formData);
      setSuccess('User created successfully');
      handleCloseAddDialog();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateUser = async () => {
    setError('');
    
    if (!validateForm(true)) {
      return;
    }
    
    setLoading(true);
    try {
      const updateData = { ...formData };
      
      // Only send password if it's not empty
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await userAPI.updateUser(selectedUser._id, updateData);
      setSuccess('User updated successfully');
      handleCloseEditDialog();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      await userAPI.deleteUser(selectedUser._id);
      setSuccess('User deleted successfully');
      handleCloseDeleteDialog();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Users
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Add, edit, or remove users from the system.
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
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={handleOpenAddDialog}
          >
            Add New User
          </Button>
        </Box>
        
        <Paper elevation={3}>
          {loading && users.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Vehicle Type</TableCell>
                    <TableCell>Vehicle Number</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>
                          <Chip
                            icon={user.role === 'admin' ? <AdminPanelSettings fontSize="small" /> : <Person fontSize="small" />}
                            label={user.role === 'admin' ? 'Admin' : 'User'}
                            color={user.role === 'admin' ? 'primary' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {user.vehicleType === 'two-wheeler' && 'Two Wheeler'}
                          {user.vehicleType === 'four-wheeler' && 'Four Wheeler'}
                          {user.vehicleType === 'bus' && 'Bus'}
                          {(!user.vehicleType || user.vehicleType === 'none') && 'None'}
                        </TableCell>
                        <TableCell>{user.vehicleNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditDialog(user)}
                              disabled={user.email === 'admin@parking.com'} // Protect main admin
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(user)}
                              disabled={user.email === 'admin@parking.com'} // Protect main admin
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
      
      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">User Role</Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                select
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Vehicle Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                select
                fullWidth
                margin="normal"
                label="Vehicle Type"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="two-wheeler">Two Wheeler</MenuItem>
                <MenuItem value="four-wheeler">Four Wheeler</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
              </TextField>
              <TextField
                fullWidth
                margin="normal"
                label="Vehicle Number"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                disabled={formData.vehicleType === 'none'}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
            disabled={loading}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled // Email can't be changed
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password (leave blank to keep current)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">User Role</Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                select
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Vehicle Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                select
                fullWidth
                margin="normal"
                label="Vehicle Type"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="two-wheeler">Two Wheeler</MenuItem>
                <MenuItem value="four-wheeler">Four Wheeler</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
              </TextField>
              <TextField
                fullWidth
                margin="normal"
                label="Vehicle Number"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                disabled={formData.vehicleType === 'none'}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
            disabled={loading}
          >
            Update User
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{selectedUser?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} startIcon={<Close />}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 