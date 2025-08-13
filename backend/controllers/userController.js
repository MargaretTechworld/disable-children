const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { sendPasswordResetEmail, sendNewPasswordEmail } = require('../utils/emailService');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Validate the role
  if (!role || !['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified. Can only be an admin or user.' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role, // Assign the validated role
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });

  } catch (error) {
    console.error('REGISTRATION ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);

  try {
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive']
    });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found. Password exists:', !!user.password);
    console.log('Password type:', typeof user.password);
    
    // Ensure both password and user.password are strings
    if (typeof password !== 'string' || typeof user.password !== 'string') {
      console.error('Invalid password format:', {
        providedPasswordType: typeof password,
        storedPasswordType: typeof user.password,
        providedPassword: password,
        storedPassword: user.password
      });
      return res.status(500).json({ message: 'Internal server error' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    console.log('JWT Payload:', payload);
    console.log('JWT Secret:', process.env.JWT_SECRET ? 'Exists' : 'Missing');

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT Error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }
        
        // Update last login time
        user.update({ lastLogin: new Date() });
        
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // The user's ID is attached to the request object by the authMiddleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] } // Don't send the password back
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data in a consistent format
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(userData);
  } catch (error) {
    console.error('GET ME ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (Super Admin only)
// @route   GET /api/users
// @access  Private/SuperAdmin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID (Super Admin only)
// @route   GET /api/users/:id
// @access  Private/SuperAdmin
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('GET USER BY ID ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user (Super Admin only)
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
const updateUser = async (req, res) => {
  const { firstName, lastName, email, role, password } = req.body;

  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying the last super admin
    if (user.role === 'super_admin') {
      const superAdminCount = await User.count({ where: { role: 'super_admin' } });
      if (superAdminCount <= 1 && role !== 'super_admin') {
        return res.status(400).json({ 
          message: 'Cannot remove the last super admin. Please assign another super admin first.' 
        });
      }
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;

    // Hash password if it's being updated
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return updated user without password
    const userData = user.get({ plain: true });
    delete userData.password;

    res.json(userData);
  } catch (error) {
    console.error('UPDATE USER ERROR:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user (Super Admin only)
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last super admin
    if (user.role === 'super_admin') {
      const superAdminCount = await User.count({ where: { role: 'super_admin' } });
      if (superAdminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot delete the last super admin. Please assign another super admin first.' 
        });
      }
    }

    await user.destroy();
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('DELETE USER ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset user password (Super Admin only or self-service)
// @route   POST /api/users/:id/reset-password
// @access  Private
const resetUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email } = req.body;
    const isSelfService = !req.params.id;
    
    // For self-service password reset (via email)
    if (isSelfService) {
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // For security, don't reveal if the email exists or not
        return res.status(200).json({ 
          message: 'If your email exists in our system, you will receive a password reset link' 
        });
      }
      
      // Generate a reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET + user.password,
        { expiresIn: '1h' }
      );
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(user.email, resetToken);
      
      if (!emailSent) {
        return res.status(500).json({ message: 'Failed to send password reset email' });
      }
      
      return res.status(200).json({ 
        message: 'Password reset link sent to your email',
        // In development, include the reset token for testing
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    }
    
    // For admin-initiated password reset
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a random password
    const newPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user's password
    await user.update({ password: hashedPassword });
    
    // Send email with new password
    if (process.env.NODE_ENV !== 'test') {
      await sendNewPasswordEmail(user.email, newPassword);
    }
    
    res.status(200).json({ 
      message: 'Password reset successful. The user will receive an email with their new password.',
      // In development, include the new password for testing
      newPassword: process.env.NODE_ENV === 'development' ? newPassword : undefined
    });
    
  } catch (error) {
    console.error('PASSWORD RESET ERROR:', error);
    res.status(500).json({ 
      message: 'Server error during password reset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getMe, 
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword 
};
