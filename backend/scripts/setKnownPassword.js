const { User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function setKnownPassword(email, newPassword) {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Manually hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('Generated hash:', hashedPassword);
    
    console.log('Updating password in database...');
    
    // Update the user's password directly in the database
    const [updated] = await sequelize.query(
      `UPDATE users SET password = :password WHERE email = :email`,
      {
        replacements: { 
          password: hashedPassword,
          email: email.toLowerCase()
        },
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    console.log('Update result:', updated);
    
    if (updated > 0) {
      console.log(`\n✅ Password for ${email} has been reset successfully.`);
      console.log(`🔑 New password: ${newPassword}\n`);
      
      // Verify the update
      const user = await sequelize.query(
        `SELECT email, SUBSTRING(password, 1, 10) as hash_prefix, LENGTH(password) as hash_length FROM users WHERE email = :email`,
        {
          replacements: { email: email.toLowerCase() },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (user.length > 0) {
        console.log('Verification successful:');
        console.log('Email:', user[0].email);
        console.log('Hash prefix:', user[0].hash_prefix + '...');
        console.log('Hash length:', user[0].hash_length);
      }
    } else {
      console.log('❌ User not found or password not updated.');
    }
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await sequelize.close();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'janede@example.com';
const newPassword = 'SecurePass123!'; // This is the password we'll set

if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

console.log(`\n🔄 Setting new password for: ${email}`);
setKnownPassword(email, newPassword);
