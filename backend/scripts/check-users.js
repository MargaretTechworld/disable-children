const { sequelize, User } = require('../models');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'check-users',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'check-users',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'check-users',
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
      script: 'check-users',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function checkUsers() {
  try {
    logger.info('Starting user check');

    // Test the database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
      raw: true
    });

    logger.info(`Found ${users.length} users in the database`, {
      userCount: users.length
    });

    if (users.length === 0) {
      logger.warn('No users found in the database');
    } else {
      const userData = users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.isActive ? 'Active' : 'Inactive',
        createdAt: u.createdAt
      }));

      logger.table(userData, ['id', 'email', 'role', 'status', 'createdAt']);
    }

  } catch (error) {
    logger.error('Failed to check users', error, {
      step: 'check-users'
    });
  } finally {
    await sequelize.close();
    logger.info('User check completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    process.exit(0);
  }
}

checkUsers();
