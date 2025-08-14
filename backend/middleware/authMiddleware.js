const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  console.log('Auth middleware called for path:', req.path);
  
  // Get token from header
  const token = req.header('x-auth-token');
  console.log('Token from header:', token ? 'Token exists' : 'No token found');

  // Check if not token
  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied' 
    });
  }

  // Verify token
  try {
    console.log('Verifying token...');
    console.log('JWT Secret:', process.env.JWT_SECRET ? 'Exists' : 'Missing');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', {
      decoded,
      user: decoded.user,
      userType: typeof decoded.user,
      userId: decoded.user?.id,
      userIdType: typeof decoded.user?.id
    });

    if (!decoded.user || !decoded.user.id) {
      console.error('Invalid token payload - missing user or user.id');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload' 
      });
    }

    // Ensure user.id is a string for consistency
    const user = {
      ...decoded.user,
      id: String(decoded.user.id)
    };
    
    req.user = user; // Add user to request object
    console.log('User set on request:', user);
    
    next(); // Proceed to next middleware/route handler
  } catch (err) {
    console.error('Token verification failed:', {
      name: err.name,
      message: err.message,
      expiredAt: err.expiredAt,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
    
    let errorMessage = 'Token is not valid';
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    }
    
    res.status(401).json({ 
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

module.exports = authMiddleware;
