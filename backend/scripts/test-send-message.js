const { sequelize } = require('../config/database');
const NotificationService = require('../services/notificationService');
const User = require('../models/User');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Test Script Info:', {
      script: 'test-send-message',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Test Script Debug:', {
        script: 'test-send-message',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Test Script Error:', {
      script: 'test-send-message',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  success: (message, data = {}) => {
    console.info('Test Script Success:', {
      script: 'test-send-message',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// Test configuration
const TEST_CONFIG = {
  // Use an existing admin user ID
  adminUserId: 1, // Replace with an actual admin user ID
  disabilityTypes: ['autism'], // Test with autism group
  subject: 'Test Message - ' + new Date().toISOString(),
  message: 'This is a test message sent to verify the notification system.'
};

async function testSendMessage() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Verify the test user exists and is an admin
    const adminUser = await User.findByPk(TEST_CONFIG.adminUserId);
    if (!adminUser) {
      throw new Error(`Admin user with ID ${TEST_CONFIG.adminUserId} not found`);
    }
    logger.info('Using admin user', {
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });

    // Send test message
    logger.info('Sending test message', {
      messageType: 'test',
      senderId: adminUser.id
    });
    const result = await NotificationService.sendMessageToAllParents({
      subject: TEST_CONFIG.subject,
      message: TEST_CONFIG.message,
      senderId: TEST_CONFIG.adminUserId,
      disabilityTypes: TEST_CONFIG.disabilityTypes
    });

    logger.info('Message send result', {
      success: result.success,
      messageId: result.messageId,
      recipientCount: result.recipients?.length || 0
    });

    if (result.success) {
      // Get the created notification
      const notification = await sequelize.models.Notification.findByPk(result.notificationId, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      logger.debug('Notification created', {
        notificationId: notification.id,
        subject: notification.subject,
        status: notification.status,
        senderId: notification.senderId,
        recipientCount: notification.recipientCount
      });

      // Check the sent messages endpoint
      logger.info('Verifying sent messages endpoint');
      const sentMessages = await sequelize.models.Notification.findAll({
        where: { 
          type: 'email',
          senderId: TEST_CONFIG.adminUserId,
          subject: TEST_CONFIG.subject
        },
        order: [['createdAt', 'DESC']],
        limit: 1
      });

      logger.debug('Found notifications in database', {
        count: sentMessages.length,
        notifications: sentMessages.map(n => ({
          id: n.id,
          subject: n.subject,
          status: n.status,
          senderId: n.senderId,
          recipientCount: n.recipientCount
        }))
      });
    }

  } catch (error) {
    logger.error('Test script failed', error, {
      step: 'send-test-message',
      userId: TEST_CONFIG.adminUserId
    });
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testSendMessage();
