require('dotenv').config();
const { sequelize, User, Child } = require('../models');
const bcrypt = require('bcrypt');

async function addTestData() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    // Create a test parent user
    console.log('Creating test parent user...');
    const passwordHash = await bcrypt.hash('testpassword123', 10);
    
    const [parent, created] = await User.findOrCreate({
      where: { email: 'testparent@example.com' },
      defaults: {
        firstName: 'Test',
        lastName: 'Parent',
        email: 'testparent@example.com',
        password: passwordHash,
        role: 'user'
      }
    });

    if (created) {
      console.log(`Created test parent with ID: ${parent.id}`);
    } else {
      console.log(`Using existing test parent with ID: ${parent.id}`);
    }

    // Create a test child for the parent
    console.log('Creating test child...');
    const child = await Child.create({
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
      userId: parent.id
    });

    console.log(`Created test child with ID: ${child.id} for parent ${parent.email}`);
    console.log('Test data added successfully!');

  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Run the script
addTestData();
