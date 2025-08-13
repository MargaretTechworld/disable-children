const jwt = require('jsonwebtoken');
const db = require('../models'); // Import the database instance
require('dotenv').config();

const superAdminMiddleware = async (req, res, next) => {
  console.log('=== Super Admin Middleware ===');
  console.log('Request Headers:', req.headers);
  const token = req.header('x-auth-token');
  console.log('Token from headers:', token ? 'Token exists' : 'No token found');

  if (!token) {
    console.error('No token provided in request');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    console.log('Verifying token with JWT_SECRET:', process.env.JWT_SECRET ? 'Secret exists' : 'No JWT_SECRET found');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', JSON.stringify(decoded, null, 2));
    
    if (!decoded.user || !decoded.user.id) {
      console.error('Invalid token structure - missing user.id');
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    
    console.log('Looking up user with ID:', decoded.user.id);
    
    // Use the User model from the database instance
    const user = await db.User.findByPk(decoded.user.id);
    console.log('User found in database:', user ? 'Yes' : 'No');

    if (!user) {
      console.error('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User role:', user.role);
    if (user.role !== 'super_admin') {
      console.error('Access denied - user is not a super admin');
      return res.status(403).json({ 
        message: 'Access denied. Super admin role required.',
        userRole: user.role
      });
    }

    console.log('User authenticated as super admin:', user.email);
    req.user = user; // Attach full user object to the request
    next();
  } catch (err) {
    console.error('Token verification error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        expiredAt: err.expiredAt 
      });
    }
    
    console.error('Server error during authentication:', err);
    res.status(500).json({ 
      message: 'Server error during authentication',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

module.exports = superAdminMiddleware;