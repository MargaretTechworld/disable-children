const { User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function resetPassword(email, newPassword) {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Generate salt and hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Find the user first
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Update the user's password directly
    user.password = hashedPassword;
    await user.save();
    
    if (user) {
      console.log(`Password for ${email} has been reset successfully.`);
      console.log(`New password: ${newPassword}`);
    } else {
      console.log('User not found or password not updated.');
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await sequelize.close();
  }
}

// Get email and new password from command line arguments
const email = process.argv[2] || 'janede@example.com';
const newPassword = process.argv[3] || 'Password123!'; // Default strong password

if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

resetPassword(email, newPassword);
