const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'check-notifications',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'check-notifications',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'check-notifications',
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
      script: 'check-notifications',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function checkNotifications() {
  try {
    logger.info('Starting notification check');

    // Test the database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Check the schema of the Notifications table
    const [results] = await sequelize.query(
      "SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE, COLUMN_KEY, EXTRA " +
      "FROM INFORMATION_SCHEMA.COLUMNS " +
      "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'userId'"
    );
    
    logger.info('Notifications table schema for userId column');
    logger.table(results, ['COLUMN_NAME', 'IS_NULLABLE', 'COLUMN_DEFAULT', 'COLUMN_TYPE', 'COLUMN_KEY', 'EXTRA']);

    // Check total notifications
    const total = await sequelize.query('SELECT COUNT(*) as count FROM Notifications', {
      type: QueryTypes.SELECT
    });
    logger.info(`Found ${total[0].count} notifications in the database`, {
      notificationCount: total[0].count
    });

    // Check notifications by type
    const byType = await sequelize.query(
      'SELECT type, COUNT(*) as count FROM Notifications GROUP BY type',
      { type: QueryTypes.SELECT }
    );
    logger.info('Notifications by type');
    logger.table(byType, ['type', 'count']);

    // Check notifications by batch status
    const byBatch = await sequelize.query(
      'SELECT isBatch, COUNT(*) as count FROM Notifications GROUP BY isBatch',
      { type: QueryTypes.SELECT }
    );
    logger.info('Notifications by batch status');
    logger.table(byBatch, ['isBatch', 'count']);

    // Get a sample of recent notifications
    const recent = await sequelize.query(
      `SELECT id, type, isBatch, subject, "senderId", "createdAt" 
       FROM Notifications 
       ORDER BY "createdAt" DESC 
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    logger.info('Recent notifications');
    logger.table(recent, ['id', 'type', 'isBatch', 'subject', 'senderId', 'createdAt']);

  } catch (error) {
    logger.error('Failed to check notifications', error, {
      step: 'check-notifications'
    });
  } finally {
    // Removed sequelize.close() to keep the connection open for the next function
  }
}

async function checkDatabase() {
  try {
    logger.info('Checking database structure...');
    
    // 1. Check the structure of the children table
    const childrenColumns = await sequelize.query(
      `SHOW COLUMNS FROM children`,
      { type: QueryTypes.SELECT }
    );
    
    logger.info('Children table columns');
    logger.table(childrenColumns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default
    })), ['Field', 'Type', 'Null', 'Key', 'Default']);
    
    // 2. Check if there are any parent emails in the children table
    const parentEmailColumn = childrenColumns.find(col => 
      col.Field.toLowerCase().includes('parent') && 
      col.Field.toLowerCase().includes('email')
    );
    
    if (!parentEmailColumn) {
      logger.warn('No parent email column found in children table');
    } else {
      logger.info(`Found parent email column: ${parentEmailColumn.Field}`);
      
      // 3. Check for parent data using the correct column name
      const parentData = await sequelize.query(
        `SELECT id, ${parentEmailColumn.Field} as parentEmail 
         FROM children 
         WHERE ${parentEmailColumn.Field} IS NOT NULL 
         LIMIT 10`,
        { type: QueryTypes.SELECT }
      );
      
      logger.info('Sample of children with parent emails');
      logger.table(parentData, ['id', 'parentEmail']);
    }
    
    // 4. Check users with parent role
    const parentUsers = await sequelize.query(
      `SELECT id, email, first_name, last_name, role 
       FROM users 
       WHERE role = 'parent' 
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    );
    
    logger.info('Users with parent role');
    logger.table(parentUsers, ['id', 'email', 'first_name', 'last_name', 'role']);
    
    // 5. Check for any data in the notifications table
    const notifications = await sequelize.query(
      `SELECT id, type, status, subject, 
              senderId, userId, 
              createdAt, updatedAt
       FROM notifications 
       ORDER BY createdAt DESC 
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    
    logger.info('Recent notifications');
    logger.table(notifications, ['id', 'type', 'status', 'subject', 'senderId', 'userId', 'createdAt', 'updatedAt']);
    
  } catch (error) {
    logger.error('Failed to check database', error, {
      step: 'check-database'
    });
  } finally {
    await sequelize.close();
    logger.info('Database check completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    process.exit(0);
  }
}

checkNotifications();
checkDatabase();
