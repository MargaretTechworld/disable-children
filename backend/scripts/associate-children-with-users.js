const { sequelize, User, Child } = require('../models');

async function associateChildrenWithUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Get all children
    const children = await Child.findAll();
    console.log(`Found ${children.length} children in the database.`);

    let updatedCount = 0;

    for (const child of children) {
      if (!child.email) {
        console.log(`Skipping child ${child.id} - no email address`);
        continue;
      }

      // Find user with matching email
      const user = await User.findOne({ where: { email: child.email } });
      
      if (user) {
        console.log(`Associating child ${child.id} with user ${user.id} (${user.email})`);
        await child.update({ userId: user.id });
        updatedCount++;
      } else {
        console.log(`No user found with email: ${child.email}`);
      }
    }

    console.log(`\nAssociation complete. Updated ${updatedCount} children with user associations.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

associateChildrenWithUsers();
