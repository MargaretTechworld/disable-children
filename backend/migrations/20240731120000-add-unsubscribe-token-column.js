'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists
    const [results] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM Notifications LIKE 'unsubscribeToken'`
    );

    if (results.length === 0) {
      // Add the column as nullable first
      await queryInterface.addColumn('Notifications', 'unsubscribeToken', {
        type: Sequelize.STRING,
        allowNull: true, // Start with nullable to add values
        unique: true
      });

      // Generate tokens for existing notifications
      const { v4: uuidv4 } = require('uuid');
      const [notifications] = await queryInterface.sequelize.query(
        'SELECT id FROM Notifications WHERE unsubscribeToken IS NULL',
        { type: Sequelize.QueryTypes.SELECT }
      );

      for (const notification of notifications) {
        await queryInterface.sequelize.query(
          'UPDATE Notifications SET unsubscribeToken = ? WHERE id = ?',
          {
            replacements: [uuidv4(), notification.id],
            type: Sequelize.QueryTypes.UPDATE
          }
        );
      }

      // Now make the column NOT NULL
      await queryInterface.changeColumn('Notifications', 'unsubscribeToken', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      });

      console.log('Added unsubscribeToken column to Notifications table');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Notifications', 'unsubscribeToken');
  }
};
