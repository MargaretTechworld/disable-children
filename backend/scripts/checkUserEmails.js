const { sequelize } = require('../models');

async function checkUserEmails() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Get all users with their emails
    const users = await sequelize.query(
      `SELECT id, email, role, isActive, createdAt, updatedAt FROM users`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\n📋 User emails in database:');
    console.table(users);
    
    // Check for any unexpected whitespace or formatting
    console.log('\n🔍 Raw email values:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: '${user.email}' (length: ${user.email.length})`);
    });
    
  } catch (error) {
    console.error('Error checking user emails:', error);
  } finally {
    await sequelize.close();
  }
}

checkUserEmails();
