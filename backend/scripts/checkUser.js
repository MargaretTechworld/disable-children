const { User } = require('../models');
const { sequelize } = require('../models');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'checkUser',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'checkUser',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'checkUser',
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
      script: 'checkUser',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function checkUser(email) {
  try {
    logger.info('Starting user check');
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Check if user exists
    const user = await sequelize.query(
      `SELECT * FROM users WHERE email = :email`,
      {
        replacements: { email: email.toLowerCase() },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (user.length > 0) {
      logger.info('Found user', {
        userId: user[0].id,
        email: user[0].email,
        role: user[0].role
      });
      
      const userData = {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        status: user[0].isActive ? 'Active' : 'Inactive',
        lastLogin: user[0].lastLogin || 'Never',
        createdAt: user[0].createdAt
      };
      
      logger.table([userData], ['id', 'email', 'role', 'status', 'lastLogin', 'createdAt']);
    } else {
      logger.warn('No user found with that email', {
        email: email
      });
      
      // List all tables in the database
      const tables = await sequelize.query(
        "SHOW TABLES",
        { type: sequelize.QueryTypes.SHOWTABLES }
      );
      logger.info('Available tables', { tables });
      
      // Check if users table exists
      const usersTable = tables.find(t => t.Tables_in_disabled_children === 'users');
      logger.info('Users table exists', { exists: !!usersTable });
    }
    
  } catch (error) {
    logger.error('Failed to check user', error, {
      step: 'check-user',
      email: email
    });
  } finally {
    await sequelize.close();
    logger.info('User check completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'janede@example.com';
checkUser(email);
