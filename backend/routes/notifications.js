const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const NotificationService = require('../services/notificationService');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const db = require('../models');
const Notification = db.Notification;
const User = db.User;
const Sequelize = require('sequelize');
const { Op } = require('sequelize'); // Add this line

const DISABILITY_DISPLAY_NAMES = {
  'autism': 'Autism',
  'adhd': 'ADHD',
  'down': 'Down Syndrome',
  'cerebral': 'Cerebral Palsy',
  'deaf': 'Deaf/Hard of Hearing',
  'blind': 'Blind/Visually Impaired',
  'learning': 'Learning Disabilities',
  'physical': 'Physical Disabilities',
  'other': 'Other Disabilities'
};

// Log all requests to the notifications routes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
});

/**
 * @route   GET /api/notifications/recipient-count
 * @desc    Get count of parents who would receive a message based on disability filters
 * @access  Private/Admin
 */
router.get('/recipient-count', 
  auth, 
  isAdmin,
  [
    check('disabilityTypes', 'Disability types must be a comma-separated list')
      .optional()
      .isString()
  ],
  async (req, res) => {
    console.log('Received request to /api/notifications/recipient-count');
    console.log('Request query:', req.query);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let disabilityTypes = [];
      if (req.query.disabilityTypes) {
        // Split by comma, trim whitespace, and filter out empty strings
        disabilityTypes = req.query.disabilityTypes
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }

      console.log('Processed disability types:', disabilityTypes);
      
      if (disabilityTypes.length === 0) {
        console.log('No disability types provided, will count all parents with children');
      }
      
      // Get count using the notification service
      const count = await NotificationService.getParentCountByDisabilities(disabilityTypes);
      
      console.log('Recipient count:', count);
      res.json({ count });
    } catch (error) {
      console.error('Error getting recipient count:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/notifications/send-to-parents
 * @desc    Send a message to all parents, optionally filtered by children's disabilities
 * @access  Private/Admin
 */
router.post(
  '/send-to-parents',
  [
    auth,
    isAdmin,
    check('subject', 'Subject is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty(),
    check('disabilityTypes', 'Disability types must be an array')
      .optional()
      .isArray()
  ],
  async (req, res) => {
    console.log('Received request to /api/notifications/send-to-parents');
    console.log('Request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { subject, message, disabilityTypes = [] } = req.body;
      const senderId = req.user.id;

      console.log('Sending message with data:', {
        subject,
        message: message.substring(0, 50) + '...', // Log first 50 chars of message
        disabilityTypes,
        senderId
      });

      // Send message using the notification service
      const result = await NotificationService.sendMessageToAllParents({
        subject,
        message,
        senderId,
        disabilityTypes
      });

      console.log('Message send result:', result);

      if (!result.success) {
        if (result.error === 'NO_PARENTS_FOUND') {
          return res.status(404).json({ 
            success: false,
            message: result.message,
            error: result.error,
            stats: result.stats
          });
        }
        
        return res.status(400).json({ 
          success: false,
          message: result.message || 'Failed to send message',
          error: result.error,
          stats: result.stats || { total: 0, success: 0, failed: 0 }
        });
      }

      res.status(201).json({
        success: true,
        message: result.message,
        stats: result.stats,
        notificationId: result.notificationId
      });
    } catch (error) {
      console.error('Error sending message to parents:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to send message',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

/**
 * @route   POST /api/notifications/send
 * @desc    Send a notification
 * @access  Private/Admin
 */
router.post(
  '/send',
  [
    auth,
    isAdmin,
    [
      check('subject', 'Subject is required').not().isEmpty(),
      check('message', 'Message is required').not().isEmpty(),
      check('recipients', 'Recipients are required').isArray().not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, message, recipients, metadata = {} } = req.body;

    try {
      // Add sender information to metadata
      const notificationMetadata = {
        ...metadata,
        senderId: req.user.id,
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        sentAt: new Date().toISOString()
      };

      // Create a batch notification
      const notification = await Notification.create({
        subject,
        message,
        type: 'email',
        status: 'pending',
        senderId: req.user.id,
        metadata: notificationMetadata,
        isBatch: true,
        recipientCount: recipients.length
      });

      // Send notifications to all recipients
      await NotificationService.sendBatchNotification(notification, recipients);

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: notification
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/notifications/sent
 * @desc    Get all sent notifications
 * @access  Private/Admin
 */
router.get('/sent', auth, isAdmin, async (req, res) => {
  console.log(`[/api/notifications/sent] Request received for user: ${req.user.id}`);
  
  try {
    const sequelize = require('../config/database');
    await sequelize.authenticate();
    console.log('[/api/notifications/sent] Database connection established successfully');
    
    // Get all sent notifications for all admins
    const notifications = await Notification.findAll({
      where: { 
        type: 'email' // Only show email notifications
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
          required: false
        }
      ],
      logging: (sql) => {
        console.log('[/api/notifications/sent] Executing SQL:', sql);
      }
    });

    console.log(`[/api/notifications/sent] Found ${notifications.length} notifications`);
    
    // Process the notifications to include recipient groups and counts
    const processedNotifications = notifications.map(notification => {
      const metadata = notification.metadata || {};
      let recipientGroups = ['Specific Recipients'];
      let totalRecipients = 1; // Default to 1 for non-batch notifications

      // Handle batch notifications
      if (notification.isBatch) {
        recipientGroups = metadata.recipientGroups || ['All Parents'];
        totalRecipients = notification.recipientCount || recipientGroups.length;
      }

      // If it's a batch notification with specific recipients in metadata, use that
      if (metadata.recipientEmails && metadata.recipientEmails.length > 0) {
        recipientGroups = ['Selected Parents'];
        totalRecipients = metadata.recipientEmails.length;
      }

      return {
        id: notification.id,
        subject: notification.subject || 'No Subject',
        message: notification.message,
        status: notification.status,
        isBatch: Boolean(notification.isBatch),
        createdAt: notification.createdAt,
        sentAt: notification.sentAt,
        sender: notification.sender || { 
          id: null, 
          firstName: 'System', 
          lastName: '', 
          email: 'system@example.com',
          role: 'system'
        },
        recipientGroups,
        totalRecipients,
        metadata: notification.metadata
      };
    });
    
    res.json({
      success: true,
      count: processedNotifications.length,
      data: processedNotifications
    });
  } catch (error) {
    console.error('[/api/notifications/sent] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sent notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/notifications/sent/:id
 * @desc    Get a single sent notification by ID
 * @access  Private/Admin
 */
router.get('/sent/:id', auth, isAdmin, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
          required: false
        }
      ]
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const metadata = notification.metadata || {};
    let recipientGroups = ['Specific Recipients'];
    let totalRecipients = 1;

    if (notification.isBatch) {
      recipientGroups = metadata.recipientGroups || ['All Parents'];
      totalRecipients = notification.recipientCount || recipientGroups.length;
    }

    res.json({
      success: true,
      data: {
        id: notification.id,
        subject: notification.subject || 'No Subject',
        message: notification.message,
        status: notification.status,
        isBatch: Boolean(notification.isBatch),
        createdAt: notification.createdAt,
        sentAt: notification.sentAt,
        sender: notification.sender || { id: null, firstName: 'System', lastName: '', email: 'system@example.com' },
        recipientGroups,
        totalRecipients,
        metadata: notification.metadata
      }
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/notifications/sent/:id
 * @desc    Delete a sent notification
 * @access  Private/Admin
 */
router.delete('/sent/:id', auth, isAdmin, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        senderId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Log all responses from notifications routes
router.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.originalUrl}:`);
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', typeof body === 'string' ? body.substring(0, 200) + '...' : body);
    originalSend.call(this, body);
  };
  next();
});

module.exports = router;
