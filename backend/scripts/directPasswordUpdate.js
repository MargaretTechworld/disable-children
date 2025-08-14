const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function updatePasswordDirectly(email, newPassword) {
  try {
    console.log(`\n🔑 Attempting to update password for: ${email}`);
    
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.role})`);
    
    // Update the password directly using the instance method
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save the user with the new password
    await user.save();
    
    console.log('✅ Password updated successfully!');
    console.log(`🔑 New password: ${newPassword}`);
    
    // Verify the update
    const updatedUser = await User.scope('withPassword').findOne({ where: { email } });
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    
    console.log('🔍 Verification:');
    console.log(`- Password matches: ${isMatch ? '✅' : '❌'}`);
    console.log(`- Hash: ${updatedUser.password.substring(0, 20)}...`);
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    // Close the connection
    process.exit();
  }
}

// Get email from command line or use default
const email = process.argv[2] || 'margarettechwld@gmail.com';
const newPassword = 'SecurePass123!';

console.log(`\n🔄 Starting password update for: ${email}`);
updatePasswordDirectly(email, newPassword);
