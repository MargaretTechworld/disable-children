const { User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'setKnownPassword',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'setKnownPassword',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'setKnownPassword',
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
      script: 'setKnownPassword',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function setKnownPassword(email, newPassword) {
  try {
    logger.info('Starting to set known password', {
      operation: 'set-known-password',
      targetEmail: email
    });

    await sequelize.authenticate();
    logger.info('Database connection established');

    // Manually hash the password
    logger.info('Hashing known password');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    logger.info('Generated hash', { hash: hashedPassword });

    logger.info('Updating password in database');

    // Update the user's password directly in the database
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

    logger.info('Update result', { updated });

    if (updated > 0) {
      logger.info(`Successfully set known password`, {
        email,
        userId: updated
      });

      // Verify the update
      const user = await sequelize.query(
        `SELECT email, SUBSTRING(password, 1, 10) as hash_prefix, LENGTH(password) as hash_length FROM users WHERE email = :email`,
        {
          replacements: { email: email.toLowerCase() },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (user.length > 0) {
        logger.info('Verification successful', {
          email: user[0].email,
          hashPrefix: user[0].hash_prefix,
          hashLength: user[0].hash_length
        });
      }
    } else {
      logger.warn('User not found', { email });
    }

  } catch (error) {
    logger.error('Failed to set known password', error, {
      step: 'set-known-password',
      email
    });
  } finally {
    await sequelize.close();
    logger.info('Set known password operation completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'janede@example.com';
const newPassword = 'SecurePass123!'; // This is the password we'll set

if (!email) {
  logger.error('Email address not provided');
  process.exit(1);
}

logger.info(`Setting new password for: ${email}`);
setKnownPassword(email, newPassword);
