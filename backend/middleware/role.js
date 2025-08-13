// Middleware to check if user has admin role
const isAdmin = (req, res, next) => {
    // Check if user is authenticated and has admin role
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'super_admin')) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  };
  
  // Middleware to check if user has superadmin role
  const isSuperAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'superadmin' || req.user.role === 'super_admin')) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
  };
  
  module.exports = {
    isAdmin,
    isSuperAdmin
  };