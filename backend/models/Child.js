module.exports = (sequelize, DataTypes) => {
  const Child = sequelize.define('Child', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // User relationship
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Make it optional for backward compatibility
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Child's Information
    childFirstName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    childMiddleName: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    childLastName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    dob: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    gender: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    address: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },

    // Parent/Guardian Information
    parentFirstName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    parentLastName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    relationship: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    contactNumber: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        isEmail: true
      }
    },

    // Disability Information
    disabilityType: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    disabilitySeverity: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    specialNeeds: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },

    // Medical Information
    primaryCareProvider: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    medicalConditions: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    medications: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    allergies: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },

    // Educational Information
    school: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    grade: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    iep: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },

    // Support Services
    therapies: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    otherSupport: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },

    // Emergency Information
    emergencyContactName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    emergencyContactNumber: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    alternateEmergencyContact: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },

    // Additional Information & Signature
    communicationMethod: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    additionalNotes: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    parentSignature: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    date: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
  }, {
    tableName: 'children',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
    ]
  });

  // Instance methods
  Child.prototype.getFullName = function() {
    return `${this.childFirstName} ${this.childLastName}`.trim();
  };

  // Class methods
  Child.associate = function(models) {
    // A child belongs to a user (parent)
    Child.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'parent',
      onDelete: 'SET NULL'
    });
  };

  return Child;
};
