const express = require('express');
const router = express.Router();
const { 
  getUsers,
  getUser,
  updateUser,
  updatePassword,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All user routes require authentication

router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

router.route('/:id/password')
  .put(updatePassword);

module.exports = router; 