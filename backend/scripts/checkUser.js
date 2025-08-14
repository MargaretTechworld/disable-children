const { User } = require('../models');
const { sequelize } = require('../models');

async function checkUser(email) {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Check if user exists
    const user = await sequelize.query(
      `SELECT * FROM users WHERE email = :email`,
      {
        replacements: { email: email.toLowerCase() },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (user.length > 0) {
      console.log('User found:', {
        email: user[0].email,
        id: user[0].id,
        hasPassword: !!user[0].password,
        passwordLength: user[0].password ? user[0].password.length : 0,
        passwordStartsWith: user[0].password ? user[0].password.substring(0, 10) + '...' : 'none',
        role: user[0].role,
        isActive: user[0].isActive
      });
    } else {
      console.log('User not found');
      
      // List all tables in the database
      const tables = await sequelize.query(
        "SHOW TABLES",
        { type: sequelize.QueryTypes.SHOWTABLES }
      );
      console.log('Available tables:', tables);
      
      // Check if users table exists
      const usersTable = tables.find(t => t.Tables_in_disabled_children === 'users');
      console.log('Users table exists:', !!usersTable);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'janede@example.com';
checkUser(email);
