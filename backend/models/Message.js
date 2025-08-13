const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['senderId'] },
      { fields: ['recipientId'] },
      { fields: ['isRead'] },
      { fields: ['createdAt'] }
    ]
  });

  // Instance method to mark as read
  Message.prototype.markAsRead = function() {
    return this.update({ isRead: true });
  };

  // Associations will be set up in models/index.js
  Message.associate = function(models) {
    // Associations are defined in models/index.js
  };

  return Message;
};
