const { User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'setPasswordDirectly',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'setPasswordDirectly',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'setPasswordDirectly',
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
      script: 'setPasswordDirectly',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function setPasswordDirectly(email, newPassword) {
  try {
    logger.info('Starting direct password update', {
      operation: 'direct-password-update',
      targetEmail: email,
      newPassword: newPassword
    });

    await sequelize.authenticate();
    logger.info('Database connection established');

    // Generate a new salt and hash
    logger.info('Hashing new password');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    logger.info('Generated hash', { hash: hashedPassword });

    // Update the user's password directly in the database
    logger.info('Updating password in database');
    const [updated] = await sequelize.query(
      `UPDATE users SET password = :password WHERE email = :email`,
      {
        replacements: { 
          password: hashedPassword,
          email: email.toLowerCase()
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    if (updated > 0) {
      logger.info(`Successfully updated password`, {
        email: email,
        userId: updated
      });

      // Verify the update
      logger.info('Verifying password update');
      const user = await sequelize.query(
        `SELECT email, SUBSTRING(password, 1, 10) as hash_prefix, LENGTH(password) as hash_length FROM users WHERE email = :email`,
        {
          replacements: { email: email.toLowerCase() },
          type: sequelize.QueryTypes.SELECT
        }
      );

      logger.table(user, ['email', 'hash_prefix', 'hash_length']);
    } else {
      logger.warn('User not found', { email });
    }

  } catch (error) {
    logger.error('Failed to update password', error, {
      step: 'direct-password-update',
      email
    });
  } finally {
    await sequelize.close();
    logger.info('Direct password update completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }
}

// Get email and new password from command line arguments
const email = process.argv[2] || 'janede@example.com';
const newPassword = process.argv[3] || 'NewPassword123!';

if (!email) {
  logger.error('Email address is required');
  process.exit(1);
}

setPasswordDirectly(email, newPassword);
