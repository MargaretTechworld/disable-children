const { Op } = require('sequelize');
const { User, Child } = require('../models');
const NotificationService = require('../services/notificationService');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Test Script Info:', {
      script: 'test-message-parents-by-disability',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Test Script Debug:', {
        script: 'test-message-parents-by-disability',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Test Script Error:', {
      script: 'test-message-parents-by-disability',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  success: (message, data = {}) => {
    console.info('Test Script Success:', {
      script: 'test-message-parents-by-disability',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  warn: (message, data = {}) => {
    console.warn('Test Script Warning:', {
      script: 'test-message-parents-by-disability',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// Test data
const TEST_DISABILITIES = ['autism', 'adhd', 'down_syndrome', 'cerebral_palsy', 'visual_impairment'];

async function testMessageParentsByDisability() {
  try {
    logger.info('Starting test: Send message to parents filtered by children\'s disabilities');
    
    // Get database connection
    const sequelize = require('../config/database');
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Sync models
    await sequelize.sync();
    logger.info('Database synced');
    
    // Test case 1: Send to parents with children having specific disabilities
    const targetDisabilities = ['autism', 'adhd'];
    logger.info(`Test Case 1: Filtering parents with children having ${targetDisabilities.join(' or ')}`);
    
    await sendTestMessage({
      subject: 'Important Update for Parents of Children with Autism or ADHD',
      message: `\
        <p>We're reaching out with important information about new resources and support groups 
        available for parents of children with autism or ADHD.</p>
        
        <h3>Upcoming Events</h3>
        <ul>
          <li><strong>Parent Support Group:</strong> August 10, 2023 at 6:00 PM</li>
          <li><strong>Behavioral Therapy Workshop:</strong> August 15, 2023 at 5:30 PM</li>
        </ul>
        
        <p>Please visit our website or contact our support team for more information.</p>
      `,
      disabilityTypes: targetDisabilities
    });
    
    // Test case 2: Send to all parents (no filter)
    logger.info('Test Case 2: Sending to all parents (no disability filter)');
    await sendTestMessage({
      subject: 'General Announcement for All Parents',
      message: `\
        <p>We hope this message finds you well. This is a general announcement for all parents 
        in our system about upcoming school year activities.</p>
        
        <p>Please mark your calendars for our annual parent-teacher conference on September 1st.</p>
      `
      // No disabilityTypes means send to all parents
    });
    
    logger.info('All test cases completed');
    process.exit(0);
  } catch (error) {
    logger.error('Test failed', error);
    process.exit(1);
  }
}

async function sendTestMessage({ subject, message, disabilityTypes }) {
  logger.info('Sending message with subject', {
    subject,
    disabilityTypes
  });
  if (disabilityTypes) {
    logger.info('Filtering parents with children having', {
      disabilityTypes
    });
  } else {
    logger.info('Sending to all parents (no disability filter)');
  }
  
  const result = await NotificationService.sendMessageToAllParents({
    subject,
    message,
    senderId: 1, // Assuming admin user with ID 1
    disabilityTypes
  });
  
  logger.info('Message sent result', {
    success: result.success,
    stats: {
      total: result.stats.total,
      success: result.stats.success,
      failed: result.stats.failed
    }
  });
  
  if (result.stats.failed > 0) {
    logger.warn('Some messages failed to send', {
      errors: result.stats.errors
    });
  }
  
  return result;
}

// Run the test
testMessageParentsByDisability();
