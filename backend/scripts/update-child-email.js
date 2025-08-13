const { sequelize, Op } = require('../config/database');
const { Child } = require('../models');
require('dotenv').config({ path: '../../.env' });

async function updateChildEmail() {
  try {
    // Initialize the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Find a child with Down Syndrome
    const child = await Child.findOne({
      where: {
        disabilityType: {
          [Op.iLike]: '%down%syndrome%' // Case-insensitive search
        }
      }
    });

    if (!child) {
      console.log('No child with Down Syndrome found in the database.');
      return;
    }

    console.log('Found child:', {
      id: child.id,
      name: `${child.childFirstName} ${child.childLastName}`,
      currentEmail: child.email,
      disabilityType: child.disabilityType
    });

    // Update the email
    const newEmail = 'margarettechworld@gmail.com';
    await child.update({ email: newEmail });
    
    console.log(`\nSuccessfully updated email to: ${newEmail}`);
    console.log('Child record updated successfully!');
    
  } catch (error) {
    console.error('Error updating child email:', error);
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
