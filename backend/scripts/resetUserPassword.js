const { User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'resetUserPassword',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'resetUserPassword',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'resetUserPassword',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  table: (data, columns) => {
    if (process.env.NODE_ENV === 'development') {
      console.table(data, columns);
    } else {
      logger.info('Tabular data', { data, columns });
    }
  },
  warn: (message, data = {}) => {
    console.warn('Script Warning:', {
      script: 'resetUserPassword',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function resetPassword(email, newPassword) {
  try {
    logger.info('Starting password reset', {
      operation: 'reset-user-password',
      targetEmail: email
    });
    
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Generate salt and hash the new password
    logger.info('Hashing new password');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Find the user first
    logger.info(`Looking up user`, { email });
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      logger.warn('User not found', { email });
      return;
    }
    
    // Update the user's password directly
    logger.info('Updating password in database');
    user.password = hashedPassword;
    await user.save();
    
    if (user) {
      logger.info(`Successfully reset password`, {
        email,
        userId: user.id
      });
    } else {
      logger.warn('User not found or password not updated.');
    }
    
  } catch (error) {
    logger.error('Failed to reset password', error, {
      step: 'reset-user-password',
      email
    });
  } finally {
    await sequelize.close();
    logger.info('Password reset operation completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }
}

// Get email and new password from command line arguments
const email = process.argv[2] || 'janede@example.com';
const newPassword = process.argv[3] || 'Password123!'; // Default strong password

if (!email) {
  logger.error('Email address not provided', null, {
    step: 'argument-validation'
  });
  process.exit(1);
}

resetPassword(email, newPassword);
