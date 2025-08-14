const { User } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'resetAllAdminPasswords',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'resetAllAdminPasswords',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'resetAllAdminPasswords',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  table: (data, columns) => {
    if (process.env.NODE_ENV === 'development') {
      console.table(data, columns);
    } else {
      logger.info('Tabular data', { data, columns });
    }
  },
  warn: (message, data = {}) => {
    console.warn('Script Warning:', {
      script: 'resetAllAdminPasswords',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

async function resetAdminPasswords() {
  try {
    logger.info('Starting admin password reset process', {
      operation: 'reset-all-admin-passwords'
    });
    
    logger.info('Finding all admin users...');
    
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
      logger.warn('No admin users found to reset (excluding margarettechwld@gmail.com)');
      return;
    }

    logger.info(`Found ${admins.length} admin users`, {
      adminCount: admins.length
    });

    logger.info('Resetting passwords for admin users');
    logger.table(admins.map(admin => ({
      id: admin.id,
      email: admin.email,
      name: `${admin.firstName} ${admin.lastName}`,
      role: admin.role
    })), ['id', 'email', 'name', 'role']);

    const newPassword = 'AdminReset123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update all admin passwords in a single transaction
    logger.info('Starting database transaction');
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

    logger.info('Transaction committed successfully');
    logger.info(`Updated passwords for ${updated[0]} admin users`, {
      adminsUpdated: updated[0]
    });

    logger.info('Login credentials for reset accounts:');
    admins.forEach(admin => {
      logger.info(`Updated password for admin user`, {
        userId: admin.id,
        email: admin.email
      });
      logger.info(`- Email: ${admin.email}`);
      logger.info(`  Password: ${newPassword}`);
      logger.info('  --------------------');
    });

    logger.info('Please change these passwords immediately after logging in.');
    logger.info('Note: margarettechwld@gmail.com was not modified.');
    
  } catch (error) {
    logger.error('Failed to reset admin passwords', error, {
      step: 'reset-all-admin-passwords'
    });
  } finally {
    logger.info('Reset all admin passwords operation completed', {
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    process.exit();
  }
}

resetAdminPasswords();
