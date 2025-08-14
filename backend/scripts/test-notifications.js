require('dotenv').config();
const db = require('../models');
const { sequelize, User, Child, Event, Notification } = db;
const NotificationService = require('../services/notificationService');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Test Script Info:', {
      script: 'test-notifications',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Test Script Debug:', {
        script: 'test-notifications',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Test Script Error:', {
      script: 'test-notifications',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  success: (message, data = {}) => {
    console.info('Test Script Success:', {
      script: 'test-notifications',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  warn: (message, data = {}) => {
    console.warn('Test Script Warning:', {
      script: 'test-notifications',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// Set NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

async function testNotificationFlow() {
  logger.info('Starting notification system test...');
  
  try {
    // Initialize database connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Sync all models
    logger.info('Syncing database...');
    await sequelize.sync({ alter: true });
    
    // Create a test event
    logger.info('Creating test event');
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminUser) {
      throw new Error('No admin user found. Please create an admin user first.');
    }
    
    logger.info('Using admin user for testing', {
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });
    
    const testEvent = await Event.create({
      title: 'Test Event - Parent Support Group',
      description: 'This is a test event for the notification system. Please ignore.',
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
      location: 'Online',
      targetDisabilities: ['autism', 'intellectual'], // Updated to use valid disability types
      status: 'draft',
      createdBy: adminUser.id
    });
    
    logger.info('Test event created', {
      eventId: testEvent.id,
      title: testEvent.title,
      date: testEvent.dateTime
    });
    
    // Find or create a test parent
    let parent = await User.findOne({ 
      where: { email: 'testparent@example.com' },
      include: [{ model: Child, as: 'Children' }]
    });
    
    if (!parent) {
      logger.info('Creating test parent user');
      const testParent = await User.create({
        firstName: 'Test',
        lastName: 'Parent',
        email: 'testparent@example.com',
        password: 'testpassword123',
        role: 'parent', 
        notificationPreferences: {
          email: true,
          push: false,
          sms: false
        }
      });
      
      // Create a test child with matching disability
      const testChild = await Child.create({
        childFirstName: 'Test',
        childLastName: 'Child',
        dob: new Date('2015-01-01'),
        gender: 'male',
        address: '123 Test St',
        parentFirstName: 'Test',
        parentLastName: 'Parent',
        relationship: 'mother',
        contactNumber: '1234567890',
        email: 'test.parent@example.com',
        disabilityType: 'autism',
        disabilitySeverity: 'moderate',
        emergencyContactName: 'Emergency Contact',
        emergencyContactNumber: '0987654321',
        parentSignature: 'Test Parent',
        date: new Date(),
        userId: testParent.id
      });
      
      logger.info('Test parent user created', {
        userId: testParent.id,
        email: testParent.email,
        role: testParent.role
      });
    } else {
      logger.debug('Using existing test parent', {
        userId: parent.id,
        email: parent.email
      });
    }
    
    // Process notifications for the test event
    logger.info('Processing notifications for test event', {
      eventId: testEvent.id,
      parentCount: 1 // or actual count
    });
    const result = await NotificationService.processEventNotifications(testEvent.id, {
      batchSize: 10,
      concurrency: 2
    });
    
    logger.info('Notification processing completed', {
      success: result.success,
      notificationsSent: result.stats?.success || 0,
      notificationsFailed: result.stats?.failed || 0,
      totalRecipients: result.stats?.total || 0
    });
    
    if (result.stats?.success > 0) {
      logger.success(`Successfully sent ${result.stats.success} notifications`, {
        successCount: result.stats.success,
        failedCount: result.stats.failed || 0
      });
    }
    
    if (result.stats?.failed > 0) {
      logger.warn(`${result.stats.failed} notifications failed to send`, {
        successCount: result.stats.success || 0,
        failedCount: result.stats.failed
      });
    }
    
  } catch (error) {
    logger.error('Test failed', error, {
      step: 'notification-processing',
      eventId: testEvent?.id,
      parentId: parent?.id
    });
  } finally {
    // Close database connection
    await sequelize.close();
    logger.info('Test completed successfully', {
      testName: 'Notification System Test',
      duration: `${(Date.now() - Date.now()) / 1000} seconds`
    });
  }
}

// Run the test
testNotificationFlow();
