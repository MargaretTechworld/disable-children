'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recipientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM(
          'pending',    // Notification created but not sent
          'sending',    // Currently being sent
          'sent',       // Successfully sent to email service
          'delivered',  // Email service confirmed delivery
          'opened',     // Recipient opened the email
          'failed',     // Failed to send
          'bounced'     // Email bounced back
        ),
        defaultValue: 'pending',
        allowNull: false
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      openedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      messageId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      unsubscribeToken: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true
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
    await queryInterface.addIndex('Notifications', ['eventId']);
    await queryInterface.addIndex('Notifications', ['recipientId']);
    await queryInterface.addIndex('Notifications', ['status']);
    await queryInterface.addIndex('Notifications', ['messageId'], { unique: true });
    await queryInterface.addIndex('Notifications', ['unsubscribeToken'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};
