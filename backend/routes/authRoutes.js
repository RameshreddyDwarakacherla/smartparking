const express = require('express');
const router = express.Router();
const { 
  register, 
  registerAdmin, 
  login, 
  getMe 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/register-admin', protect, authorize('admin'), registerAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router; 