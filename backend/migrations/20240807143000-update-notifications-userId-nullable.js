'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // First, check if the foreign key exists
      const [results] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME 
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_NAME = 'Notifications' 
           AND COLUMN_NAME = 'userId' 
           AND CONSTRAINT_NAME != 'PRIMARY' 
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      );

      // If foreign key exists, drop it
      if (results.length > 0) {
        const fkName = results[0].CONSTRAINT_NAME;
        await queryInterface.sequelize.query(
          `ALTER TABLE Notifications DROP FOREIGN KEY ${fkName}`,
          { transaction }
        );
      }
      
      // Then modify the column to allow null
      await queryInterface.sequelize.query(
        'ALTER TABLE Notifications MODIFY COLUMN userId INT NULL;',
        { transaction }
      );
      
      // Recreate the foreign key with ON DELETE SET NULL
      await queryInterface.sequelize.query(
        `ALTER TABLE Notifications 
         ADD CONSTRAINT notifications_userId_fk 
         FOREIGN KEY (userId) REFERENCES Users(id) 
         ON DELETE SET NULL
         ON UPDATE CASCADE;`,
        { transaction }
      );
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // First, update any null values to a default user ID
    await queryInterface.sequelize.query(
      "UPDATE Notifications SET userId = (SELECT id FROM Users LIMIT 1) WHERE userId IS NULL;"
    );
    
    // Drop the foreign key constraint
    await queryInterface.sequelize.query(
      'ALTER TABLE Notifications DROP FOREIGN KEY notifications_userId_fk;'
    );
    
    // Modify the column back to not allow null
    await queryInterface.sequelize.query(
      'ALTER TABLE Notifications MODIFY COLUMN userId INT NOT NULL;'
    );
    
    // Recreate the foreign key with CASCADE
    await queryInterface.sequelize.query(
      `ALTER TABLE Notifications 
       ADD CONSTRAINT notifications_userId_fk 
       FOREIGN KEY (userId) REFERENCES Users(id) 
       ON DELETE CASCADE;`
    );
  }
};
