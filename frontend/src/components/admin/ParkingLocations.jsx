import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Check,
  Close,
  LocationOn,
} from '@mui/icons-material';
import { parkingAPI } from '../../utils/api';

const ParkingLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    zone: '',
    type: 'outdoor',
    twoWheelerCapacity: 0,
    fourWheelerCapacity: 0,
    busCapacity: 0,
  });
  
  const zones = ['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
  
  useEffect(() => {
    fetchLocations();
  }, []);
  
  const fetchLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await parkingAPI.getLocations();
      setLocations(response.data.data);
    } catch (err) {
      setError('Failed to load parking locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Convert capacity inputs to numbers
    if (['twoWheelerCapacity', 'fourWheelerCapacity', 'busCapacity'].includes(name)) {
      processedValue = value === '' ? 0 : parseInt(value, 10);
      if (isNaN(processedValue) || processedValue < 0) {
        processedValue = 0;
      }
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      zone: '',
      type: 'outdoor',
      twoWheelerCapacity: 0,
      fourWheelerCapacity: 0,
      busCapacity: 0,
    });
  };
  
  const handleOpenAddDialog = () => {
    resetForm();
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  const handleOpenEditDialog = (location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      description: location.description,
      zone: location.location.zone,
      type: location.location.type,
      twoWheelerCapacity: location.capacity.twoWheelers,
      fourWheelerCapacity: location.capacity.fourWheelers,
      busCapacity: location.capacity.buses,
    });
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleOpenDeleteDialog = (location) => {
    setSelectedLocation(location);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Location name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!formData.zone) {
      setError('Zone is required');
      return false;
    }
    
    if (formData.twoWheelerCapacity === 0 && 
        formData.fourWheelerCapacity === 0 && 
        formData.busCapacity === 0) {
      setError('At least one vehicle type capacity must be greater than 0');
      return false;
    }
    
    return true;
  };
  
  const handleAddLocation = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const locationData = {
        name: formData.name,
        description: formData.description,
        capacity: {
          twoWheelers: formData.twoWheelerCapacity,
          fourWheelers: formData.fourWheelerCapacity,
          buses: formData.busCapacity,
        },
        location: {
          type: formData.type,
          zone: formData.zone,
        },
      };
      
      await parkingAPI.createLocation(locationData);
      setSuccess('Parking location created successfully');
      handleCloseAddDialog();
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create parking location');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateLocation = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const locationData = {
        name: formData.name,
        description: formData.description,
        capacity: {
          twoWheelers: formData.twoWheelerCapacity,
          fourWheelers: formData.fourWheelerCapacity,
          buses: formData.busCapacity,
        },
        location: {
          type: formData.type,
          zone: formData.zone,
        },
      };
      
      await parkingAPI.updateLocation(selectedLocation._id, locationData);
      setSuccess('Parking location updated successfully');
      handleCloseEditDialog();
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update parking location');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteLocation = async () => {
    setLoading(true);
    try {
      await parkingAPI.deleteLocation(selectedLocation._id);
      setSuccess('Parking location deleted successfully');
      handleCloseDeleteDialog();
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete parking location');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Parking Locations
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Add, edit, or remove parking locations in your system.
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
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
          >
            Add New Location
          </Button>
        </Box>
        
        <Paper elevation={3}>
          {loading && locations.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Zone</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Two Wheeler Slots</TableCell>
                    <TableCell>Four Wheeler Slots</TableCell>
                    <TableCell>Bus Slots</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No parking locations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    locations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>
                          {location.description.length > 30
                            ? `${location.description.substring(0, 30)}...`
                            : location.description}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={<LocationOn />} 
                            label={location.location.zone} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          {location.location.type === 'indoor' ? 'Indoor' : 'Outdoor'}
                        </TableCell>
                        <TableCell>
                          {location.capacity.twoWheelers}
                          {location.capacity.twoWheelers > 0 && (
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                              ({location.occupancy.twoWheelers} used)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {location.capacity.fourWheelers}
                          {location.capacity.fourWheelers > 0 && (
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                              ({location.occupancy.fourWheelers} used)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {location.capacity.buses}
                          {location.capacity.buses > 0 && (
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                              ({location.occupancy.buses} used)
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenEditDialog(location)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOpenDeleteDialog(location)}
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
      
      {/* Add Location Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Parking Location</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Zone"
                name="zone"
                value={formData.zone}
                onChange={handleInputChange}
                required
              >
                {zones.map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    {zone}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Location Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <MenuItem value="indoor">Indoor</MenuItem>
                <MenuItem value="outdoor">Outdoor</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Parking Capacity
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Two Wheeler Capacity"
                name="twoWheelerCapacity"
                type="number"
                value={formData.twoWheelerCapacity}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Four Wheeler Capacity"
                name="fourWheelerCapacity"
                type="number"
                value={formData.fourWheelerCapacity}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bus Capacity"
                name="busCapacity"
                type="number"
                value={formData.busCapacity}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddLocation} 
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
            disabled={loading}
          >
            Create Location
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Location Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Parking Location</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Zone"
                name="zone"
                value={formData.zone}
                onChange={handleInputChange}
                required
              >
                {zones.map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    {zone}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Location Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <MenuItem value="indoor">Indoor</MenuItem>
                <MenuItem value="outdoor">Outdoor</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Parking Capacity
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Two Wheeler Capacity"
                name="twoWheelerCapacity"
                type="number"
                value={formData.twoWheelerCapacity}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Four Wheeler Capacity"
                name="fourWheelerCapacity"
                type="number"
                value={formData.fourWheelerCapacity}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bus Capacity"
                name="busCapacity"
                type="number"
                value={formData.busCapacity}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateLocation} 
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
            disabled={loading}
          >
            Update Location
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Location Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Parking Location</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the parking location "{selectedLocation?.name}"? 
            This action cannot be undone, and all associated parking slots will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} startIcon={<Close />}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteLocation} 
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

export default ParkingLocations; 