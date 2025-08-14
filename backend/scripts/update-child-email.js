const { sequelize, Op } = require('../config/database');
const { Child } = require('../models');
require('dotenv').config({ path: '../../.env' });

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'update-child-email',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'update-child-email',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  warn: (message, data = {}) => {
    console.warn('Script Warn:', {
      script: 'update-child-email',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function updateChildEmail() {
  try {
    // Initialize the database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Find a child with Down Syndrome
    const child = await Child.findOne({
      where: {
        disabilityType: {
          [Op.iLike]: '%down%syndrome%' // Case-insensitive search
        }
      }
    });

    if (!child) {
      logger.warn('No child with Down Syndrome found in the database');
      return;
    }

    logger.info('Found child record', { 
      id: child.id, 
      name: `${child.childFirstName} ${child.childLastName}`, 
      currentEmail: child.email, 
      disabilityType: child.disabilityType 
    });

    // Update the email
    const newEmail = 'margarettechworld@gmail.com';
    await child.update({ email: newEmail });
    
    logger.info('Child email updated successfully', {
      childId: child.id,
      oldEmail: child.email,
      newEmail,
      status: 'success'
    });
    
  } catch (error) {
    logger.error('Failed to update child email', error, { childId: child?.id, newEmail: 'margarettechworld@gmail.com' });
  } finally {
    // Close the database connection if it exists
    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
    process.exit(0);
  }
}

// Run the function
updateChildEmail();
