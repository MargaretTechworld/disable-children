const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Events',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
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
    type: {
      type: DataTypes.ENUM('email', 'sms', 'push'),
      defaultValue: 'email',
      allowNull: false
    },
    isBatch: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    openedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    messageId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Email message ID from the email service'
    },
    unsubscribeToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique token for unsubscribing from notifications'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['senderId'] },
      { fields: ['eventId'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['messageId'] },
      {
        fields: ['unsubscribeToken'],
        unique: true
      },
      { fields: ['isBatch'] }
    ]
  });

  // Instance methods
  Notification.prototype.markAsSent = function(messageId) {
    return this.update({
      status: 'sent',
      sentAt: new Date(),
      messageId: messageId
    });
  };

  Notification.prototype.markAsDelivered = function() {
    return this.update({
      status: 'delivered',
      deliveredAt: new Date()
    });
  };

  Notification.prototype.markAsOpened = function() {
    return this.update({
      status: 'opened',
      openedAt: new Date()
    });
  };

  Notification.prototype.markAsFailed = function(error) {
    return this.update({
      status: 'failed',
      error: error?.message || String(error)
    });
  };

  // Set up associations
  Notification.associate = function(models) {
    // Notification belongs to a User (recipient)
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'recipient',
      onDelete: 'SET NULL'
    });

    // Notification belongs to a User (sender)
    Notification.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
      onDelete: 'SET NULL'
    });

    // Notification can belong to an Event (optional)
    Notification.belongsTo(models.Event, {
      foreignKey: 'eventId',
      as: 'event',
      onDelete: 'SET NULL'
    });
  };

  return Notification;
};
