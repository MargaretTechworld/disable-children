module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name is required'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Last name is required'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        },
        notEmpty: {
          msg: 'Email is required'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        },
        len: {
          args: [6],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'super_admin'),
      defaultValue: 'user',
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    },
    hooks: {
      beforeCreate: (user) => {
        if (user.email) {
          user.email = user.email.toLowerCase();
        }
      },
      beforeUpdate: (user) => {
        if (user.changed('email')) {
          user.email = user.email.toLowerCase();
        }
      }
    }
  });

  // Instance methods
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    return values;
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`.trim();
  };

  // Class methods
  User.associate = function(models) {
    // A user can have many sent notifications
    User.hasMany(models.Notification, {
      foreignKey: 'senderId',
      as: 'sentNotifications',
      onDelete: 'CASCADE'
    });

    // A user can have many received notifications
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'receivedNotifications',
      onDelete: 'CASCADE'
    });

    // A user can have many children
    if (models.Child) {
      User.hasMany(models.Child, {
        foreignKey: 'userId',
        as: 'children',
        onDelete: 'CASCADE'
      });
    }

    // A user can create many events
    if (models.Event) {
      User.hasMany(models.Event, {
        foreignKey: 'createdBy',
        as: 'createdEvents',
        onDelete: 'SET NULL'
      });
    }
  };

  return User;
};
