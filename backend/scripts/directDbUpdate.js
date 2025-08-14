const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePasswordDirectly() {
  // Database connection configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'childern_disability',
    port: process.env.DB_PORT || 3306
  };

  const email = 'margarettechwld@gmail.com';
  const newPassword = 'SecurePass123!';
  
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // 1. First, check if user exists
    console.log(`\n🔍 Looking up user: ${email}`);
    const [users] = await connection.execute(
      'SELECT id, email, password FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      console.error('❌ User not found');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`Current password hash: ${user.password ? user.password.substring(0, 30) + '...' : 'null'}`);
    
    // 2. Hash the new password
    console.log('\n🔑 Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log(`New hashed password: ${hashedPassword.substring(0, 30)}...`);
    
    // 3. Update the password directly in the database
    console.log('\n💾 Updating password in database...');
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    console.log(`✅ Update result:`, result);
    
    if (result.affectedRows === 0) {
      console.error('❌ No rows were updated');
      return;
    }
    
    // 4. Verify the update
    console.log('\n🔍 Verifying update...');
    const [updatedUsers] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [user.id]
    );
    
    const updatedUser = updatedUsers[0];
    console.log(`Stored hash: ${updatedUser.password.substring(0, 30)}...`);
    
    // 5. Verify the password can be verified
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`\n🔑 Password verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!isMatch) {
      console.error('\n❌ CRITICAL: The stored password hash cannot be verified with the provided password!');
      console.error('This suggests a serious issue with password hashing or storage.');
    } else {
      console.log('\n✅ Password updated and verified successfully!');
      console.log(`You can now log in with email: ${email}`);
      console.log(`Password: ${newPassword}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

console.log('🚀 Starting direct database password update...');
updatePasswordDirectly();
