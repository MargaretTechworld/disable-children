const { User, Child } = require('../models');
const sequelize = require('../config/database');

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'update-parent-email',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'update-parent-email',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function updateParentEmail(userId, newEmail) {
  const transaction = await sequelize.transaction();
  
  try {
    logger.info('Starting email update', { userId, newEmail });
    
    // 1. Update the User record
    const [updatedUsers] = await User.update(
      { email: newEmail },
      { 
        where: { id: userId },
        transaction
      }
    );
    
    if (updatedUsers === 0) {
      throw new Error(`No user found with ID ${userId}`);
    }
    
    // 2. Update all related Children records
    const [updatedChildren] = await Child.update(
      { email: newEmail },
      { 
        where: { userId },
        transaction
      }
    );
    
    await transaction.commit();
    
    logger.info('Email update completed', {
      userId,
      newEmail,
      updatedChildrenCount: updatedChildren,
      status: 'success'
    });
    
  } catch (error) {
    await transaction.rollback();
    logger.error('Failed to update email', error, { userId, newEmail });
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  const showUsage = () => {
    logger.info('Usage:', { 
      script: 'update-parent-email',
      command: 'node update-parent-email.js <userId> <newEmail>'
    });
    process.exit(1);
  };
  showUsage();
}

const userId = parseInt(args[0], 10);
const newEmail = args[1];

if (isNaN(userId)) {
  logger.error('Invalid user ID', new Error('User ID must be a number'), { userId });
  process.exit(1);
}

// Run the update
sequelize.authenticate()
  .then(() => updateParentEmail(userId, newEmail))
  .catch(error => {
    logger.error('Database connection error', error);
    process.exit(1);
  });
