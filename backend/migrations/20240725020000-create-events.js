'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 100]
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      dateTime: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toISOString()
        }
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      targetDisabilities: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: Sequelize.ENUM('draft', 'scheduled', 'sent', 'cancelled'),
        defaultValue: 'draft',
        allowNull: false
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('Events', ['dateTime']);
    await queryInterface.addIndex('Events', ['status']);
    await queryInterface.addIndex('Events', ['createdBy']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events');
  }
};
