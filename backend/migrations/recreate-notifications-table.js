'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop existing table
    await queryInterface.dropTable('Notifications');
    
    // Recreate table with correct schema
    await queryInterface.createTable('Notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Events',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      recipientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
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
      unsubscribeToken: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      messageId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // This migration can't be rolled back automatically
    // as we've dropped the original table
    console.log('Warning: This migration cannot be automatically rolled back');
  }
};
