const { sequelize } = require('../config/database');
const NotificationService = require('../services/notificationService');
const User = require('../models/User');

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
    console.log('Database connection established successfully.');

    // Verify the test user exists and is an admin
    const adminUser = await User.findByPk(TEST_CONFIG.adminUserId);
    if (!adminUser) {
      throw new Error(`Admin user with ID ${TEST_CONFIG.adminUserId} not found`);
    }
    console.log(`Using admin user: ${adminUser.email} (ID: ${adminUser.id})`);

    // Send test message
    console.log('\nSending test message...');
    const result = await NotificationService.sendMessageToAllParents({
      subject: TEST_CONFIG.subject,
      message: TEST_CONFIG.message,
      senderId: TEST_CONFIG.adminUserId,
      disabilityTypes: TEST_CONFIG.disabilityTypes
    });

    console.log('\nMessage sent result:');
    console.log(JSON.stringify(result, null, 2));

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

      console.log('\nCreated notification:');
      console.log(JSON.stringify({
        id: notification.id,
        messageId: notification.messageId,
        subject: notification.subject,
        status: notification.status,
        type: notification.type,
        sender: notification.sender ? {
          id: notification.sender.id,
          name: [notification.sender.firstName, notification.sender.lastName].filter(Boolean).join(' '),
          email: notification.sender.email
        } : null,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt
      }, null, 2));

      // Check the sent messages endpoint
      console.log('\nVerifying sent messages endpoint...');
      const sentMessages = await sequelize.models.Notification.findAll({
        where: { 
          type: 'email',
          senderId: TEST_CONFIG.adminUserId,
          subject: TEST_CONFIG.subject
        },
        order: [['createdAt', 'DESC']],
        limit: 1
      });

      console.log('\nFound matching notifications in database:');
      console.log(JSON.stringify(sentMessages.map(n => ({
        id: n.id,
        subject: n.subject,
        recipientGroups: n.metadata?.recipientGroup || [],
        totalRecipients: n.metadata?.recipientCount || 0,
        isBatch: n.metadata?.isBatch || false,
        createdAt: n.createdAt
      })), null, 2));
    }

  } catch (error) {
    console.error('Error in test:', error);
    if (error.errors) {
      console.error('Validation errors:', error.errors.map(e => e.message));
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testSendMessage();
