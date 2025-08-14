const { User } = require('../models');
const { sequelize } = require('../models');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'listUsers',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'listUsers',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'listUsers',
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
      script: 'listUsers',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function listUsers() {
  try {
    logger.info('Starting to list all users');
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // List all users
    const users = await sequelize.query(
      `SELECT id, email, role, isActive, createdAt FROM users`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (users.length === 0) {
      logger.warn('No users found in the database');
    } else {
      logger.info(`Found ${users.length} users in the database`, {
        userCount: users.length
      });
      
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
    logger.error('Failed to list users', error, {
      step: 'list-users'
    });
  } finally {
    await sequelize.close();
    logger.info('User listing completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }
}

listUsers();
