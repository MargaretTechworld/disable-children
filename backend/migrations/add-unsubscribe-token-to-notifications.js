'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add unsubscribeToken column if it doesn't exist
      const [columnExists] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM Notifications LIKE 'unsubscribeToken'`
      );
      
      if (columnExists.length === 0) {
        await queryInterface.sequelize.query(
          'ALTER TABLE Notifications ADD COLUMN unsubscribeToken VARCHAR(255) NULL AFTER messageId'
        );
        
        // Generate tokens for existing notifications
        const { v4: uuidv4 } = require('uuid');
        const [notifications] = await queryInterface.sequelize.query(
          'SELECT id FROM Notifications WHERE unsubscribeToken IS NULL'
        );
        
        for (const notification of notifications) {
          await queryInterface.sequelize.query(
            'UPDATE Notifications SET unsubscribeToken = ? WHERE id = ?',
            {
              replacements: [uuidv4(), notification.id]
            }
          );
        }
        
        // Make the column NOT NULL after populating all rows
        await queryInterface.sequelize.query(
          'ALTER TABLE Notifications MODIFY COLUMN unsubscribeToken VARCHAR(255) NOT NULL UNIQUE'
        );
        
        console.log('Added unsubscribeToken column to Notifications table');
      }
      
    } catch (error) {
      console.error('Error adding unsubscribeToken column:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove the column if it exists
      const [columnExists] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM Notifications LIKE 'unsubscribeToken'`
      );
      
      if (columnExists.length > 0) {
        await queryInterface.removeColumn('Notifications', 'unsubscribeToken');
        console.log('Removed unsubscribeToken column from Notifications table');
      }
    } catch (error) {
      console.error('Error removing unsubscribeToken column:', error);
      throw error;
    }
  }
};
