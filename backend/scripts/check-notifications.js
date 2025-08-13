const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

async function checkNotifications() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Check the schema of the Notifications table
    const [results] = await sequelize.query(
      "SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE, COLUMN_KEY, EXTRA " +
      "FROM INFORMATION_SCHEMA.COLUMNS " +
      "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'userId'"
    );
    
    console.log('\nNotifications table schema for userId column:');
    console.table(results);

    // Check total notifications
    const total = await sequelize.query('SELECT COUNT(*) as count FROM Notifications', {
      type: QueryTypes.SELECT
    });
    console.log('\nTotal notifications in database:', total[0].count);

    // Check notifications by type
    const byType = await sequelize.query(
      'SELECT type, COUNT(*) as count FROM Notifications GROUP BY type',
      { type: QueryTypes.SELECT }
    );
    console.log('\nNotifications by type:', byType);

    // Check notifications by batch status
    const byBatch = await sequelize.query(
      'SELECT isBatch, COUNT(*) as count FROM Notifications GROUP BY isBatch',
      { type: QueryTypes.SELECT }
    );
    console.log('\nNotifications by batch status:', byBatch);

    // Get a sample of recent notifications
    const recent = await sequelize.query(
      `SELECT id, type, isBatch, subject, "senderId", "createdAt" 
       FROM Notifications 
       ORDER BY "createdAt" DESC 
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    console.log('\nRecent notifications:', recent);

  } catch (error) {
    console.error('Error checking notifications:', error);
  } finally {
    // Removed sequelize.close() to keep the connection open for the next function
  }
}

async function checkDatabase() {
  try {
    console.log('Checking database structure...');
    
    // 1. Check the structure of the children table
    const childrenColumns = await sequelize.query(
      `SHOW COLUMNS FROM children`,
      { type: QueryTypes.SELECT }
    );
    
    console.log('\nChildren table columns:');
    console.table(childrenColumns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default
    })));
    
    // 2. Check if there are any parent emails in the children table
    const parentEmailColumn = childrenColumns.find(col => 
      col.Field.toLowerCase().includes('parent') && 
      col.Field.toLowerCase().includes('email')
    );
    
    if (!parentEmailColumn) {
      console.log('\nNo parent email column found in children table');
    } else {
      console.log(`\nFound parent email column: ${parentEmailColumn.Field}`);
      
      // 3. Check for parent data using the correct column name
      const parentData = await sequelize.query(
        `SELECT id, ${parentEmailColumn.Field} as parentEmail 
         FROM children 
         WHERE ${parentEmailColumn.Field} IS NOT NULL 
         LIMIT 10`,
        { type: QueryTypes.SELECT }
      );
      
      console.log('\nSample of children with parent emails:');
      console.table(parentData);
    }
    
    // 4. Check users with parent role
    const parentUsers = await sequelize.query(
      `SELECT id, email, first_name, last_name, role 
       FROM users 
       WHERE role = 'parent' 
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    );
    
    console.log('\nUsers with parent role:');
    console.table(parentUsers);
    
    // 5. Check for any data in the notifications table
    const notifications = await sequelize.query(
      `SELECT id, type, status, subject, 
              senderId, userId, 
              createdAt, updatedAt
       FROM notifications 
       ORDER BY createdAt DESC 
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    
    console.log('\nRecent notifications:');
    console.table(notifications);
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkNotifications();
checkDatabase();
