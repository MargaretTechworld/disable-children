const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  resetUserPassword
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const superAdminMiddleware = require('../middleware/superAdminMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/forgot-password', resetUserPassword);

// Protected routes (require authentication)
router.use(authMiddleware);

// Get current user's data
router.get('/me', getMe);

// Super admin only routes
router.use(superAdminMiddleware);

// User management routes
router.post('/register', registerUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetUserPassword);

module.exports = router;
