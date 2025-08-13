'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if columns exist before adding them
      const tableDescription = await queryInterface.describeTable('users');
      
      if (!tableDescription.isActive) {
        await queryInterface.addColumn('users', 'isActive', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        }, { transaction });
      }
      
      if (!tableDescription.lastLogin) {
        await queryInterface.addColumn('users', 'lastLogin', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
      }
      
      if (!tableDescription.resetPasswordToken) {
        await queryInterface.addColumn('users', 'resetPasswordToken', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
      }
      
      if (!tableDescription.resetPasswordExpires) {
        await queryInterface.addColumn('users', 'resetPasswordExpires', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
      }
      
      if (!tableDescription.deletedAt) {
        await queryInterface.addColumn('users', 'deletedAt', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
      }
      
      // Fix notifications foreign key if it doesn't exist
      const [results] = await queryInterface.sequelize.query(
        "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
        "WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'userId' AND " +
        "CONSTRAINT_NAME != 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL"
      );
      
      if (results.length === 0) {
        // No foreign key exists, add it
        await queryInterface.addConstraint('notifications', {
          fields: ['userId'],
          type: 'foreign key',
          name: 'notifications_userId_fk',
          references: {
            table: 'users',
            field: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        }, { transaction });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No need to implement down for this migration
    // as it's safe to keep these columns
  }
};
