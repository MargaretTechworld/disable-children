const { sequelize } = require('../models');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'checkUserEmails',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'checkUserEmails',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'checkUserEmails',
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
      script: 'checkUserEmails',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function checkUserEmails() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Get all users with their emails
    const users = await sequelize.query(
      `SELECT id, email, role, isActive, createdAt, updatedAt FROM users`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    logger.info(`Found ${users.length} users in the database`, {
      userCount: users.length
    });

    const userData = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive ? 'Active' : 'Inactive',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    logger.table(userData, ['id', 'email', 'role', 'isActive', 'createdAt', 'updatedAt']);
    
    // Check for any unexpected whitespace or formatting
    logger.debug('Raw email values');
    users.forEach(user => {
      logger.debug(`- ID: ${user.id}, Email: '${user.email}' (length: ${user.email.length})`);
    });
    
  } catch (error) {
    logger.error('Failed to check user emails', error, {
      step: 'check-user-emails'
    });
  } finally {
    await sequelize.close();
    logger.info('User email check completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }
}

checkUserEmails();
