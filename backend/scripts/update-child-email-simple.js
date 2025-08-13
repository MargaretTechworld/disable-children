// Simple script to update a child's email
const { Child } = require('../models');

async function updateChildEmail() {
  try {
    // Find a child with Down Syndrome (with space)
    const child = await Child.findOne({
      where: {
        disabilityType: 'Down Syndrome' // Exact match with space
      }
    });

    if (!child) {
      console.log('No child with Down Syndrome found in the database.');
      return;
    }

    console.log('Found child:', {
      id: child.id,
      name: `${child.childFirstName} ${child.childLastName}`,
      currentEmail: child.email,
      disabilityType: child.disabilityType
    });

    // Update the email
    const newEmail = 'margarettechworld@gmail.com';
    await child.update({ email: newEmail });
    
    console.log(`\nSuccessfully updated email to: ${newEmail}`);
    console.log('Child record updated successfully!');
    
  } catch (error) {
    console.error('Error updating child email:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
updateChildEmail();
