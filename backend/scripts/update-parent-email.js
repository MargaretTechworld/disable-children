const { User, Child } = require('../models');
const sequelize = require('../config/database');

async function updateParentEmail(userId, newEmail) {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`Updating email for user ID ${userId} to ${newEmail}...`);
    
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
    
    console.log(`Successfully updated email to ${newEmail} for:`);
    console.log(`- User ID: ${userId}`);
    console.log(`- ${updatedChildren} child record(s)`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating email:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node update-parent-email.js <userId> <newEmail>');
  process.exit(1);
}

const userId = parseInt(args[0], 10);
const newEmail = args[1];

if (isNaN(userId)) {
  console.error('Error: userId must be a number');
  process.exit(1);
}

// Run the update
sequelize.authenticate()
  .then(() => updateParentEmail(userId, newEmail))
  .catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
