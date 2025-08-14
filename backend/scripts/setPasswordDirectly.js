const { User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function setPasswordDirectly(email, newPassword) {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Generate a new salt and hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('Generated hash:', hashedPassword);
    
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
    
    if (updated > 0) {
      console.log(`Password for ${email} has been updated successfully.`);
      console.log(`New password: ${newPassword}`);
      
      // Verify the update
      const user = await sequelize.query(
        `SELECT email, SUBSTRING(password, 1, 10) as hash_prefix, LENGTH(password) as hash_length FROM users WHERE email = :email`,
        {
          replacements: { email: email.toLowerCase() },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      console.log('Verification:', user[0]);
    } else {
      console.log('User not found or password not updated.');
    }
    
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await sequelize.close();
  }
}

// Get email and new password from command line arguments
const email = process.argv[2] || 'janede@example.com';
const newPassword = process.argv[3] || 'NewPassword123!';

if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

setPasswordDirectly(email, newPassword);
