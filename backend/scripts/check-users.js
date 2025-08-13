const { sequelize, User } = require('../models');

async function checkUsers() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
      raw: true
    });

    console.log('\nFound users:', users.length);
    console.log('Sample user data (passwords hashed):');
    
    users.forEach((user, index) => {
      console.log(`\nUser #${index + 1}:`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.isActive}`);
      console.log(`Created: ${user.createdAt}`);
      console.log(`Password exists: ${!!user.password}`);
      console.log(`Password length: ${user.password ? user.password.length : 0}`);
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkUsers();
