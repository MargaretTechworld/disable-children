const { sequelize, Notification, User } = require('../models');
const { Op } = require('sequelize');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'check-notifications-details',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'check-notifications-details',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'check-notifications-details',
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
      script: 'check-notifications-details',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function checkNotificationDetails() {
  try {
    logger.info('Starting detailed notification check');

    // Get current user ID from the first admin user
    const adminUser = await User.findOne({
      where: { role: 'admin' },
      attributes: ['id', 'email'],
      raw: true
    });

    if (!adminUser) {
      logger.error('No admin user found', null, { step: 'get-admin-user' });
      return;
    }

    logger.info('Checking notifications for admin user:', { adminUser });

    // Get all notifications sent by this user
    const notifications = await Notification.findAll({
      where: {
        senderId: adminUser.id
      },
      order: [['createdAt', 'DESC']],
      raw: true
    });

    logger.info(`Found ${notifications.length} notifications sent by this user`, {
      notificationCount: notifications.length
    });

    if (notifications.length > 0) {
      logger.info('Sample notification data');

      const notificationData = notifications.slice(0, 5).map(n => ({
        id: n.id,
        subject: n.subject || 'No Subject',
        senderId: n.senderId,
        isBatch: n.isBatch ? 'Yes' : 'No',
        status: n.status,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      }));

      logger.table(notificationData, ['id', 'subject', 'senderId', 'isBatch', 'status', 'createdAt', 'updatedAt']);
    }

    // Check notifications table structure
    const [results] = await sequelize.query(
      "SHOW COLUMNS FROM Notifications"
    );

    logger.info('Notifications table structure');

    const tableData = results.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default,
      Extra: col.Extra
    }));

    logger.table(tableData, ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra']);

  } catch (error) {
    logger.error('Failed to check notification details', error, {
      step: 'check-notification-details'
    });
  } finally {
    logger.info('Notification details check completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    await sequelize.close();
  }
}

checkNotificationDetails();
