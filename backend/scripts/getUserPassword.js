const { User } = require('../models');
const { sequelize } = require('../models');

async function getUserPassword(email) {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const user = await User.scope('withPassword').findOne({
      where: { email },
      raw: true
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:');
    console.log({
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordHash: user.password ? '***' : 'none',
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'margarettechwld@gmail.com';
getUserPassword(email);
