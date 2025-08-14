const { User } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPasswords() {
  try {
    console.log('🔍 Finding all admin users...');
    
    // Find all admin users except margarettechwld@gmail.com
    const admins = await User.findAll({
      where: {
        role: ['admin', 'super_admin'],
        email: {
          [require('sequelize').Op.ne]: 'margarettechwld@gmail.com'
        }
      },
      attributes: ['id', 'email', 'firstName', 'lastName', 'role']
    });

    if (admins.length === 0) {
      console.log('ℹ️ No admin users found to reset (excluding margarettechwld@gmail.com)');
      return;
    }

    console.log(`\n🔧 Resetting passwords for ${admins.length} admin users:`);
    console.table(admins.map(admin => ({
      id: admin.id,
      email: admin.email,
      name: `${admin.firstName} ${admin.lastName}`,
      role: admin.role
    })));

    const newPassword = 'AdminReset123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update all admin passwords in a single transaction
    const updated = await User.update(
      { 
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      {
        where: {
          id: admins.map(admin => admin.id)
        },
        individualHooks: false
      }
    );

    console.log(`\n✅ Successfully reset passwords for ${updated[0]} admin accounts`);
    console.log('\n📋 Login credentials for reset accounts:');
    admins.forEach(admin => {
      console.log(`- Email: ${admin.email}`);
      console.log(`  Password: ${newPassword}`);
      console.log('  --------------------');
    });

    console.log(`\n🔐 Please change these passwords immediately after logging in.`);
    console.log(`ℹ️ Note: margarettechwld@gmail.com was not modified.`);
    
  } catch (error) {
    console.error('❌ Error resetting admin passwords:', error);
  } finally {
    process.exit();
  }
}

console.log('🚀 Starting admin password reset process...');
resetAdminPasswords();
