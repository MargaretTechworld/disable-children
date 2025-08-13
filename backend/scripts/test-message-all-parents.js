const { sequelize } = require('../models');
const NotificationService = require('../services/notificationService');

async function testMessageAllParents() {
  try {
    console.log('Starting test: Send message to all parents');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync models if needed
    await sequelize.sync();
    console.log('Database synced');
    
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
    
    console.log('Sending message to all parents...');
    const result = await NotificationService.sendMessageToAllParents(messageDetails);
    
    console.log('\nTest Results:');
    console.log('=============');
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Message: ${result.message}`);
    console.log('\nStatistics:');
    console.log(`Total parents: ${result.stats.total}`);
    console.log(`Successfully sent: ${result.stats.success}`);
    console.log(`Failed: ${result.stats.failed}`);
    
    if (result.stats.errors.length > 0) {
      console.log('\nErrors:');
      result.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.email}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\nTest completed');
  }
}

// Run the test
testMessageAllParents();
