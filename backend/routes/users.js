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
  resetUserPassword,
  updatePassword
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

// Password update route (available to all authenticated users for their own account)
router.put('/:id/password', async (req, res, next) => {
  try {
    // Debug log the entire request
    console.log('Password update request received:', {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      user: req.user,
      headers: {
        'x-auth-token': req.headers['x-auth-token'] ? 'Token exists' : 'No token',
        'content-type': req.headers['content-type']
      }
    });

    // Get user IDs from token and params
    const userIdFromToken = req.user?.id;
    const userIdFromParams = req.params.id;
    
    // Debug log with types
    console.log('User ID from token:', {
      value: userIdFromToken,
      type: typeof userIdFromToken
    });
    console.log('User ID from params:', {
      value: userIdFromParams,
      type: typeof userIdFromParams
    });
    
    // Only allow users to update their own password
    if (String(userIdFromToken) !== String(userIdFromParams)) {
      console.log('User ID mismatch - Not authorized');
      console.log('Token user ID:', userIdFromToken);
      console.log('Requested user ID:', userIdFromParams);
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this user\'s password',
        details: {
          userIdFromToken,
          userIdFromParams,
          types: {
            token: typeof userIdFromToken,
            params: typeof userIdFromParams
          }
        }
      });
    }
    
    // Proceed to the updatePassword controller
    next();
  } catch (error) {
    console.error('Error in password update auth check:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error during authorization',
      error: error.message 
    });
  }
}, updatePassword);

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
