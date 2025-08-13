const { User, Child } = require('../models');
const sequelize = require('../config/database');

async function checkParentUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // First, let's check the structure of the Children table
    const [childColumns] = await sequelize.query('DESCRIBE Children');
    console.log('\nChildren table columns:', childColumns.map(c => c.Field).join(', '));

    // Find all parent users with their children
    const parents = await User.findAll({
      where: { role: 'user' },
      include: [{
        model: Child,
        as: 'Children',
        attributes: ['id', 'childFirstName', 'childLastName', 'disabilityType']
      }],
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`\nFound ${parents.length} parent users in the database:`);
    console.log('-------------------------------------------');
    
    parents.forEach((parent, index) => {
      console.log(`\n${index + 1}. ${parent.firstName} ${parent.lastName}`);
      console.log(`   Email: ${parent.email}`);
      console.log(`   User ID: ${parent.id}`);
      console.log(`   Created: ${parent.createdAt}`);
      
      if (parent.Children && parent.Children.length > 0) {
        console.log('   Children:');
        parent.Children.forEach(child => {
          const fullName = [child.childFirstName, child.childMiddleName, child.childLastName]
            .filter(Boolean)
            .join(' ');
          console.log(`     - ${fullName} (${child.disabilityType || 'No disability type'})`);
        });
      } else {
        console.log('   No children registered');
      }
    });

    // Check notification settings
    console.log('\nChecking notification settings...');
    const [notifications] = await sequelize.query(
      'SELECT COUNT(*) as count FROM Notifications',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Total notifications in database: ${notifications.count}`);
    
    // Check recent notifications
    const recentNotifications = await sequelize.query(
      'SELECT id, userId, subject, status, createdAt FROM Notifications ORDER BY createdAt DESC LIMIT 5',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\nMost recent notifications:');
    recentNotifications.forEach(notif => {
      console.log(`- ${notif.subject} (${notif.status}) - User ID: ${notif.userId} - ${new Date(notif.createdAt).toLocaleString()}`);
    });

  } catch (error) {
    console.error('Error checking parent users:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkParentUsers();
