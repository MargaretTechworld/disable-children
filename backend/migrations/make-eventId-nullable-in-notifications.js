'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Notifications', 'eventId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Events',
        key: 'id'
      },
      onDelete: 'CASCADE',
      allowNull: true // Changed from false to true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the change if needed
    await queryInterface.changeColumn('Notifications', 'eventId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Events',
        key: 'id'
      },
      onDelete: 'CASCADE',
      allowNull: false // Revert back to not nullable
    });
  }
};
