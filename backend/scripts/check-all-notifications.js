// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'check-all-notifications',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'check-all-notifications',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'check-all-notifications',
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
      script: 'check-all-notifications',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

const { sequelize } = require('../models');

async function checkAllNotifications() {
  try {
    // Check total notifications
    const [count] = await sequelize.query('SELECT COUNT(*) as count FROM Notifications', {
      type: sequelize.QueryTypes.SELECT
    });
    
    logger.info(`Total notifications in database: ${count.count}`);

    if (count.count > 0) {
      // Get a sample of all notifications
      const [notifications] = await sequelize.query(
        `SELECT 
          id, 
          subject, 
          senderId, 
          userId as recipientId,
          status,
          type,
          isBatch,
          createdAt,
          updatedAt
        FROM Notifications 
        ORDER BY createdAt DESC 
        LIMIT 5`,
        { type: sequelize.QueryTypes.SELECT }
      );

      logger.info('\nSample notifications:');
      logger.table(notifications);

      // Check notifications by sender
      const [bySender] = await sequelize.query(
        `SELECT 
          senderId, 
          COUNT(*) as count 
        FROM Notifications 
        GROUP BY senderId`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      logger.info('\nNotifications by sender:');
      logger.table(bySender);
    }

  } catch (error) {
    logger.error('Error checking notifications:', error);
  } finally {
    await sequelize.close();
  }
}

checkAllNotifications();
