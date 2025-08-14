const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'directPasswordUpdate',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'directPasswordUpdate',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'directPasswordUpdate',
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
      script: 'directPasswordUpdate',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function updatePasswordDirectly(email, newPassword) {
  try {
    logger.info('Starting direct password update', {
      operation: 'direct-password-update',
      targetEmail: email
    });
    
    // Find the user by email
    logger.info(`Looking up user`, { email });
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      logger.warn('User not found', { email });
      return;
    }
    
    logger.info(`Found user: ${user.firstName} ${user.lastName} (${user.role})`);
    
    // Update the password directly using the instance method
    logger.info('Hashing new password');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save the user with the new password
    logger.info('Updating password in database');
    await user.save();
    
    logger.info('Successfully updated password', {
      email,
      rowsAffected: 1
    });
    
    // Verify the update
    logger.info('Verifying password update');
    const updatedUser = await User.scope('withPassword').findOne({ where: { email } });
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    
    if (isMatch) {
      logger.info('Password verification successful');
    } else {
      logger.error('Password verification failed', null, {
        step: 'password-verification',
        email
      });
    }
    
  } catch (error) {
    logger.error('Failed to update password', error, {
      step: 'direct-password-update',
      email
    });
  } finally {
    // Close the connection
    logger.info('Direct password update completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    process.exit();
  }
}

// Get email from command line or use default
const email = process.argv[2] || 'margarettechwld@gmail.com';
const newPassword = 'SecurePass123!';

updatePasswordDirectly(email, newPassword);
