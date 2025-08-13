'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if recipientId column exists before trying to rename it
      const [results] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM Notifications LIKE 'recipientId'`
      );
      
      if (results.length > 0) {
        // Rename recipientId to userId if it exists
        await queryInterface.renameColumn('Notifications', 'recipientId', 'userId');
      } else {
        // If recipientId doesn't exist, check if userId exists
        const [userIdCheck] = await queryInterface.sequelize.query(
          `SHOW COLUMNS FROM Notifications LIKE 'userId'`
        );
        
        if (userIdCheck.length === 0) {
          // If neither exists, we have a problem
          throw new Error('Neither recipientId nor userId column exists in Notifications table');
        }
        // If userId exists, we can continue
      }
      
      // Add new columns if they don't exist
      const columnsToAdd = [
        { name: 'senderId', definition: 'INTEGER NULL' },
        { name: 'subject', definition: 'VARCHAR(255) NOT NULL DEFAULT "No Subject"' },
        // Message is TEXT and cannot have a default value in MySQL
        { name: 'message', definition: 'TEXT NULL' },
        { name: 'type', definition: "ENUM('email', 'sms', 'push') NOT NULL DEFAULT 'email'" },
        { name: 'metadata', definition: 'JSON NULL' }
      ];

      for (const column of columnsToAdd) {
        const [columnExists] = await queryInterface.sequelize.query(
          `SHOW COLUMNS FROM Notifications LIKE '${column.name}'`
        );
        
        if (columnExists.length === 0) {
          await queryInterface.sequelize.query(
            `ALTER TABLE Notifications ADD COLUMN ${column.name} ${column.definition}`
          );
        }
      }

      // Make eventId nullable if it's not already
      await queryInterface.sequelize.query(
        'ALTER TABLE Notifications MODIFY COLUMN eventId INT NULL'
      );

      // Add foreign key for senderId if it doesn't exist
      const [fkCheck] = await queryInterface.sequelize.query(
        `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_NAME = 'Notifications' 
         AND COLUMN_NAME = 'senderId' 
         AND REFERENCED_TABLE_NAME IS NOT NULL`
      );

      if (fkCheck.length === 0) {
        await queryInterface.addConstraint('Notifications', {
          fields: ['senderId'],
          type: 'foreign key',
          name: 'notifications_sender_id_fk',
          references: {
            table: 'Users',
            field: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
      }

      // Add indexes if they don't exist
      const indexes = [
        { name: 'notifications_user_id', columns: ['userId'] },
        { name: 'notifications_status', columns: ['status'] },
        { name: 'notifications_created_at', columns: ['createdAt'] }
      ];

      for (const index of indexes) {
        const [indexExists] = await queryInterface.sequelize.query(
          `SHOW INDEX FROM Notifications WHERE Key_name = '${index.name}'`
        );
        
        if (indexExists.length === 0) {
          await queryInterface.addIndex('Notifications', index.columns, {
            name: index.name
          });
        }
      }
      
      console.log('Migration completed successfully');
      
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // This is a complex migration, rolling back might be tricky
    // In a real production scenario, you might want to implement a proper rollback
    console.warn('Rollback not fully implemented due to complex schema changes');
    
    // Remove indexes if they exist
    try {
      await queryInterface.removeIndex('Notifications', 'notifications_user_id');
    } catch (e) { /* ignore */ }
    
    try {
      await queryInterface.removeIndex('Notifications', 'notifications_status');
    } catch (e) { /* ignore */ }
    
    try {
      await queryInterface.removeIndex('Notifications', 'notifications_created_at');
    } catch (e) { /* ignore */ }
    
    // Remove foreign key constraint for senderId if it exists
    try {
      await queryInterface.removeConstraint('Notifications', 'notifications_sender_id_fk');
    } catch (e) { /* ignore */ }
    
    // Note: We're not rolling back the column renames and additions
    // as that could be risky without knowing the exact previous state
  }
};
