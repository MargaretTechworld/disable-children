const { User } = require('../models');
const { sequelize } = require('../models');

async function listUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // List all users
    const users = await sequelize.query(
      `SELECT id, email, role, isActive, createdAt FROM users`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\n📋 List of all users:');
    console.table(users);
    
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await sequelize.close();
  }
}

listUsers();
