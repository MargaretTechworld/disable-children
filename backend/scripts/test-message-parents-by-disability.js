const { Op } = require('sequelize');
const { User, Child } = require('../models');
const NotificationService = require('../services/notificationService');

// Test data
const TEST_DISABILITIES = ['autism', 'adhd', 'down_syndrome', 'cerebral_palsy', 'visual_impairment'];

async function testMessageParentsByDisability() {
  try {
    console.log('Starting test: Send message to parents filtered by children\'s disabilities');
    
    // Get database connection
    const sequelize = require('../config/database');
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync models
    await sequelize.sync();
    console.log('Database synced');
    
    // Test case 1: Send to parents with children having specific disabilities
    const targetDisabilities = ['autism', 'adhd'];
    console.log(`\n=== Test Case 1: Filtering parents with children having ${targetDisabilities.join(' or ')} ===`);
    
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
    console.log('\n=== Test Case 2: Sending to all parents (no disability filter) ===');
    await sendTestMessage({
      subject: 'General Announcement for All Parents',
      message: `\
        <p>We hope this message finds you well. This is a general announcement for all parents 
        in our system about upcoming school year activities.</p>
        
        <p>Please mark your calendars for our annual parent-teacher conference on September 1st.</p>
      `
      // No disabilityTypes means send to all parents
    });
    
    console.log('\nAll test cases completed');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

async function sendTestMessage({ subject, message, disabilityTypes }) {
  console.log(`\nSending message with subject: "${subject}"`);
  if (disabilityTypes) {
    console.log(`Filtering parents with children having: ${disabilityTypes.join(', ')}`);
  } else {
    console.log('Sending to all parents (no disability filter)');
  }
  
  const result = await NotificationService.sendMessageToAllParents({
    subject,
    message,
    senderId: 1, // Assuming admin user with ID 1
    disabilityTypes
  });
  
  console.log('Result:', {
    success: result.success,
    message: result.message,
    stats: {
      total: result.stats.total,
      success: result.stats.success,
      failed: result.stats.failed
    }
  });
  
  if (result.stats.failed > 0) {
    console.warn('Some messages failed to send:', result.stats.errors);
  }
  
  return result;
}

// Run the test
testMessageParentsByDisability();
