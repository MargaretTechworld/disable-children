module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Event title is required' },
        len: [3, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Event description is required' }
      }
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Valid date and time is required' },
        isAfter: {
          args: new Date().toISOString(),
          msg: 'Event date must be in the future'
        }
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    targetDisabilities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidDisabilities(value) {
          if (!Array.isArray(value)) {
            throw new Error('Target disabilities must be an array');
          }
          const validDisabilities = ['visual', 'hearing', 'physical', 'intellectual', 'autism', 'down-syndrome', 'adhd', 'other'];
          value.forEach(disability => {
            if (!validDisabilities.includes(disability)) {
              throw new Error(`Invalid disability type: ${disability}`);
            }
          });
        }
      },
      get() {
        const value = this.getDataValue('targetDisabilities');
        return value || [];
      },
      set(value) {
        this.setDataValue('targetDisabilities', Array.isArray(value) ? value : []);
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'sent', 'cancelled'),
      defaultValue: 'draft'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'Events',
    hooks: {
      beforeValidate: (event) => {
        if (event.targetDisabilities && !Array.isArray(event.targetDisabilities)) {
          event.targetDisabilities = [];
        }
      }
    },
    indexes: [
      {
        fields: ['dateTime']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdBy']
      }
    ]
  });

  return Event;
};
