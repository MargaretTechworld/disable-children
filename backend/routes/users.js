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
    if (process.env.NODE_ENV === 'development') {
      console.debug('Users Route Debug:', {
        method: req.method,
        path: req.originalUrl,
        userId: req.user?.id,
        action: 'password_update',
        timestamp: new Date().toISOString()
      });
    }

    // Get user IDs from token and params
    const userIdFromToken = req.user?.id;
    const userIdFromParams = req.params.id;
    
    if (userIdFromToken !== userIdFromParams) {
      console.warn('Users Route Warning:', {
        message: 'User ID mismatch - Not authorized',
        tokenUserId: userIdFromToken,
        requestedUserId: userIdFromParams,
        timestamp: new Date().toISOString()
      });
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
