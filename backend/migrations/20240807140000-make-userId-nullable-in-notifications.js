'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the column to allow null
    await queryInterface.changeColumn('Notifications', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // First, drop any null values since we're making the column required
    await queryInterface.sequelize.query("UPDATE Notifications SET userId = 0 WHERE userId IS NULL");
    
    // Then modify the column back to not allow null
    await queryInterface.changeColumn('Notifications', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  }
};
