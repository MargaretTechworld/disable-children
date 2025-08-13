const { sequelize } = require('../models');

async function checkAllNotifications() {
  try {
    // Check total notifications
    const [count] = await sequelize.query('SELECT COUNT(*) as count FROM Notifications', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`Total notifications in database: ${count.count}`);

    if (count.count > 0) {
      // Get a sample of all notifications
      const [notifications] = await sequelize.query(
        `SELECT 
          id, 
          subject, 
          senderId, 
          userId as recipientId,
          status,
          type,
          isBatch,
          createdAt,
          updatedAt
        FROM Notifications 
        ORDER BY createdAt DESC 
        LIMIT 5`,
        { type: sequelize.QueryTypes.SELECT }
      );

      console.log('\nSample notifications:');
      console.table(notifications);

      // Check notifications by sender
      const [bySender] = await sequelize.query(
        `SELECT 
          senderId, 
          COUNT(*) as count 
        FROM Notifications 
        GROUP BY senderId`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('\nNotifications by sender:');
      console.table(bySender);
    }

  } catch (error) {
    console.error('Error checking notifications:', error);
  } finally {
    await sequelize.close();
  }
}

checkAllNotifications();
