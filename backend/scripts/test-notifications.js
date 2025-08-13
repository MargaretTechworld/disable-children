require('dotenv').config();
const db = require('../models');
const { sequelize, User, Child, Event, Notification } = db;
const NotificationService = require('../services/notificationService');

// Set NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

async function testNotificationFlow() {
  console.log('Starting notification system test...');
  
  try {
    // Initialize database connection
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync all models
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    
    // Create a test event
    console.log('\nCreating test event...');
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminUser) {
      throw new Error('No admin user found. Please create an admin user first.');
    }
    
    console.log('Using admin user:', adminUser.email);
    
    const testEvent = await Event.create({
      title: 'Test Event - Parent Support Group',
      description: 'This is a test event for the notification system. Please ignore.',
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
      location: 'Online',
      targetDisabilities: ['autism', 'intellectual'], // Updated to use valid disability types
      status: 'draft',
      createdBy: adminUser.id
    });
    
    console.log(`Created test event with ID: ${testEvent.id}`);
    
    // Find or create a test parent
    let parent = await User.findOne({ 
      where: { email: 'testparent@example.com' },
      include: [{ model: Child, as: 'Children' }]
    });
    
    if (!parent) {
      console.log('Creating test parent user...');
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
      
      console.log(`Created test parent with ID: ${testParent.id}`);
    } else {
      console.log(`Using existing test parent with ID: ${parent.id}`);
    }
    
    // Process notifications for the test event
    console.log('\nProcessing notifications...');
    const result = await NotificationService.processEventNotifications(testEvent.id, {
      batchSize: 10,
      concurrency: 2
    });
    
    console.log('\nNotification processing result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`\n✅ Successfully sent ${result.stats.success} notifications`);
      if (result.stats.failed > 0) {
        console.warn(`⚠️  ${result.stats.failed} notifications failed to send`);
      }
    } else {
      console.error('❌ Notification processing failed:', result.message);
      if (result.error) {
        console.error(result.error);
      }
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\nTest completed');
  }
}

// Run the test
testNotificationFlow();
