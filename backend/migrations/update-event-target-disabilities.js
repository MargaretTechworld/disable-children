'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // For MySQL, we'll change the column type to TEXT to store JSON string
    await queryInterface.changeColumn('Events', 'targetDisabilities', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('targetDisabilities');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('targetDisabilities', JSON.stringify(Array.isArray(value) ? value : []));
      }
    });
    
    // Update existing data to be valid JSON strings
    const [events] = await queryInterface.sequelize.query('SELECT id, targetDisabilities FROM Events');
    for (const event of events) {
      let disabilities = [];
      try {
        // If it's already a string that can be parsed as JSON, parse it
        if (event.targetDisabilities && typeof event.targetDisabilities === 'string') {
          disabilities = JSON.parse(event.targetDisabilities);
        } else if (Array.isArray(event.targetDisabilities)) {
          // If it's already an array, use it directly
          disabilities = event.targetDisabilities;
        }
      } catch (e) {
        console.error('Error parsing targetDisabilities for event', event.id, e);
      }
      
      await queryInterface.sequelize.query(
        'UPDATE Events SET targetDisabilities = ? WHERE id = ?',
        {
          replacements: [JSON.stringify(disabilities), event.id]
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to STRING type (can't revert to ARRAY as it's not supported in MySQL)
    await queryInterface.changeColumn('Events', 'targetDisabilities', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '[]'
    });
  }
};
