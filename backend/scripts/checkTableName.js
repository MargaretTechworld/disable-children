const { sequelize } = require('../models');

async function checkTableName() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Get table names
    const [results] = await sequelize.query(
      `SHOW TABLES`
    );
    
    console.log('\n📋 Database tables:');
    console.table(results);
    
    // Check if users table exists
    const usersTable = results.find(row => 
      Object.values(row).some(value => 
        typeof value === 'string' && value.toLowerCase().includes('user')
      )
    );
    
    if (usersTable) {
      console.log('\n✅ Found users table:', usersTable);
      
      // Check columns in the users table
      const tableName = Object.values(usersTable)[0];
      const [columns] = await sequelize.query(
        `DESCRIBE ${tableName}`
      );
      
      console.log(`\n📋 Columns in ${tableName}:`);
      console.table(columns);
      
    } else {
      console.log('\n❌ No users table found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTableName();
