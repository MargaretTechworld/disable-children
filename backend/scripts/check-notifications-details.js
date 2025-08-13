const { sequelize, Notification, User } = require('../models');
const { Op } = require('sequelize');

async function checkNotificationDetails() {
  try {
    // Get current user ID from the first admin user
    const adminUser = await User.findOne({
      where: { role: 'admin' },
      attributes: ['id', 'email'],
      raw: true
    });

    if (!adminUser) {
      console.error('No admin user found');
      return;
    }

    console.log('Checking notifications for admin user:', adminUser);

    // Get all notifications sent by this user
    const notifications = await Notification.findAll({
      where: {
        senderId: adminUser.id
      },
      order: [['createdAt', 'DESC']],
      raw: true
    });

    console.log(`\nFound ${notifications.length} notifications sent by this user`);
    
    if (notifications.length > 0) {
      console.log('\nSample notification data:');
      console.table(notifications.slice(0, 5).map(n => ({
        id: n.id,
        subject: n.subject || 'No Subject',
        senderId: n.senderId,
        isBatch: n.isBatch ? 'Yes' : 'No',
        status: n.status,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      })));
    }

    // Check notifications table structure
    const [results] = await sequelize.query(
      "SHOW COLUMNS FROM Notifications"
    );
    
    console.log('\nNotifications table structure:');
    console.table(results.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Null: col.Null,
      Key: col.Key,
      Default: col.Default,
      Extra: col.Extra
    })));

  } catch (error) {
    console.error('Error checking notification details:', error);
  } finally {
    await sequelize.close();
  }
}

checkNotificationDetails();
