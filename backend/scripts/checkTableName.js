const { sequelize } = require('../models');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'checkTableName',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'checkTableName',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'checkTableName',
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
      script: 'checkTableName',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function checkTableName() {
  try {
    logger.info('Starting table name check');
    
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Get table names
    const [results] = await sequelize.query(
      `SHOW TABLES`
    );
    
    logger.info('Found tables in database', {
      tableCount: results.length
    });
    
    logger.table(results, ['Tables_in_database']);
    
    // Check if users table exists
    const usersTable = results.find(row => 
      Object.values(row).some(value => 
        typeof value === 'string' && value.toLowerCase().includes('user')
      )
    );
    
    const tableCheck = { table: 'users', exists: Boolean(usersTable) };
    logger.info('Table existence check', tableCheck);
    
    if (usersTable) {
      logger.info('Found users table');
      
      // Check columns in the users table
      const tableName = Object.values(usersTable)[0];
      const [columns] = await sequelize.query(
        `DESCRIBE ${tableName}`
      );
      
      logger.info(`Found columns in ${tableName}`, {
        columnCount: columns.length
      });
      
      logger.table(columns, ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra']);
      
    } else {
      logger.warn('Users table does not exist in the database');
    }
    
  } catch (error) {
    logger.error('Failed to check table names', error, {
      step: 'check-table-names'
    });
  } finally {
    logger.info('Table name check completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    await sequelize.close();
  }
}

checkTableName();
