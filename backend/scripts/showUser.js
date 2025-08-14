const { User } = require('../models');
const { sequelize } = require('../models');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'showUser',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'showUser',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'showUser',
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
      script: 'showUser',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function showUser(email) {
  try {
    logger.info('Starting to show user', {
      operation: 'show-user',
      targetEmail: email
    });

    await sequelize.authenticate();
    logger.info('Database connection established');

    const user = await User.scope('withPassword').findOne({
      where: { email },
      attributes: { exclude: ['password'] } // Don't log the actual password
    });

    if (!user) {
      logger.warn('User not found', { email });
      return;
    }

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin || 'Never',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    logger.info('User details retrieved', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    logger.table([userData], ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'lastLogin']);

  } catch (error) {
    logger.error('Failed to retrieve user', error, {
      step: 'show-user',
      email
    });
  } finally {
    await sequelize.close();
    logger.info('Show user operation completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  logger.error('Email address is required', {
    step: 'argument-validation'
  });
  process.exit(1);
}

showUser(email);
