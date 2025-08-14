const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'directDbUpdate',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'directDbUpdate',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'directDbUpdate',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  table: (data, columns) => {
    if (process.env.NODE_ENV === 'development') {
      console.table(data, columns);
    } else {
      logger.info('Tabular data', { data, columns });
    }
  },
  warn: (message, data = {}) => {
    console.warn('Script Warning:', {
      script: 'directDbUpdate',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

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
    logger.info('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // 1. First, check if user exists
    logger.info(`Looking up user: ${email}`);
    const [users] = await connection.execute(
      'SELECT id, email, password FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      logger.warn('User not found', { email });
      return;
    }
    
    const user = users[0];
    logger.info(`Found user: ${user.email} (ID: ${user.id})`);
    logger.debug(`Current password hash: ${user.password ? user.password.substring(0, 30) + '...' : 'null'}`);
    
    // 2. Hash the new password
    logger.info('Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    logger.debug(`New hashed password: ${hashedPassword.substring(0, 30)}...`);
    
    // 3. Update the password directly in the database
    logger.info('Updating password in database...');
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    logger.info(`Update result:`, { result });
    
    if (result.affectedRows === 0) {
      logger.warn('No rows were updated', { email });
      return;
    }
    
    // 4. Verify the update
    logger.info('Verifying update...');
    const [updatedUsers] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [user.id]
    );
    
    const updatedUser = updatedUsers[0];
    logger.debug(`Stored hash: ${updatedUser.password.substring(0, 30)}...`);
    
    // 5. Verify the password can be verified
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    logger.info(`Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`, { isMatch });
    
    if (!isMatch) {
      logger.error('The stored password hash cannot be verified with the provided password!', null, {
        step: 'password-verification',
        email,
        newPassword
      });
    } else {
      logger.info('Password updated and verified successfully!', {
        email,
        newPassword
      });
      logger.info(`You can now log in with email: ${email}`, {
        email,
        newPassword
      });
    }
    
  } catch (error) {
    logger.error('Error occurred', error, {
      step: 'direct-db-update',
      email,
      newPassword
    });
  } finally {
    if (connection) {
      await connection.end();
      logger.info('Database connection closed');
    }
  }
}

logger.info('Starting direct database password update...');
updatePasswordDirectly();
