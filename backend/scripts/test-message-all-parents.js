const { sequelize } = require('../models');
const NotificationService = require('../services/notificationService');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Test Script Info:', {
      script: 'test-message-all-parents',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Test Script Debug:', {
        script: 'test-message-all-parents',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Test Script Error:', {
      script: 'test-message-all-parents',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  success: (message, data = {}) => {
    console.info('Test Script Success:', {
      script: 'test-message-all-parents',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  warn: (message, data = {}) => {
    console.warn('Test Script Warning:', {
      script: 'test-message-all-parents',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function testMessageAllParents() {
  try {
    logger.info('Starting test: Send message to all parents');
    
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Sync models if needed
    await sequelize.sync();
    logger.info('Database synced');
    
    // Test message details
    const messageDetails = {
      subject: 'Important Announcement for All Parents',
      message: `
        <p>We hope this message finds you well. We're writing to inform you about some important updates regarding our services and upcoming events.</p>
        
        <h3>Upcoming Events</h3>
        <ul>
          <li><strong>Parent Workshop:</strong> August 15, 2023 at 6:00 PM</li>
          <li><strong>Family Day:</strong> August 20, 2023 at 10:00 AM</li>
        </ul>
        
        <p>Please log in to your account for more details and to RSVP for these events.</p>
        
        <p>If you have any questions, feel free to contact our support team.</p>
      `,
      senderId: 1 // Assuming admin user ID is 1
    };
    
    logger.info('Sending message to all parents', {
      senderId: messageDetails.senderId,
      messageType: 'test-broadcast'
    });
    const result = await NotificationService.sendMessageToAllParents(messageDetails);
    
    logger.info('Message sent result', {
      success: result.success,
      messageId: result.messageId,
      recipientCount: result.recipients?.length || 0
    });
    
    logger.info('\nTest Results:');
    logger.info('=============');
    logger.info(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    logger.info(`Message: ${result.message}`);
    logger.info('\nStatistics:');
    logger.info(`Total parents: ${result.stats.total}`);
    logger.info(`Successfully sent: ${result.stats.success}`);
    logger.info(`Failed: ${result.stats.failed}`);
    
    if (result.stats.errors.length > 0) {
      logger.info('\nErrors:');
      result.stats.errors.forEach((error, index) => {
        logger.info(`${index + 1}. ${error.email}: ${error.error}`);
      });
    }
    
  } catch (error) {
    logger.error('Test failed', error, {
      step: 'send-message-to-all-parents',
      userId: 1
    });
  } finally {
    // Close the database connection
    await sequelize.close();
    logger.info('Test execution completed', {
      status: result?.success ? 'success' : 'failed',
      timestamp: new Date().toISOString()
    });
  }
}

// Run the test
testMessageAllParents();
