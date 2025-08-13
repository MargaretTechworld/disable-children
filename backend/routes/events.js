const express = require('express');
const router = express.Router();
const { Event, Notification } = require('../models');
const NotificationService = require('../services/notificationService');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Create a new event
router.post('/', authenticateJWT, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { title, description, dateTime, location, targetDisabilities } = req.body;
    
    const event = await Event.create({
      title,
      description,
      dateTime: new Date(dateTime),
      location,
      targetDisabilities,
      createdBy: req.user.id,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
});

// Get all events
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['dateTime', 'DESC']],
      include: [
        {
          model: require('../models').User,
          as: 'Creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// Get a single event
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: require('../models').User,
          as: 'Creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Notification,
          include: [{
            model: require('../models').User,
            as: 'Recipient',
            attributes: ['id', 'name', 'email']
          }]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
});

// Update an event
router.put('/:id', authenticateJWT, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { title, description, dateTime, location, targetDisabilities, status } = req.body;
    
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Don't allow updating if notifications have already been sent
    if (event.status === 'sent' && status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update an event after notifications have been sent'
      });
    }

    const updatedEvent = await event.update({
      title: title || event.title,
      description: description || event.description,
      dateTime: dateTime ? new Date(dateTime) : event.dateTime,
      location: location !== undefined ? location : event.location,
      targetDisabilities: targetDisabilities || event.targetDisabilities,
      status: status || event.status
    });

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
});

// Send notifications for an event
router.post('/:id/notify', authenticateJWT, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if notifications have already been sent
    if (event.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Notifications have already been sent for this event'
      });
    }

    // Process notifications
    const result = await NotificationService.processEventNotifications(event.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        details: result.error
      });
    }

    res.json({
      success: true,
      message: result.message,
      stats: result.stats
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
});

// Get notification stats for an event
router.get('/:id/notifications/stats', authenticateJWT, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: Notification,
          attributes: ['status']
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Count notifications by status
    const stats = event.Notifications.reduce((acc, notification) => {
      acc[notification.status] = (acc[notification.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: event.Notifications.length,
        ...stats
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification stats',
      error: error.message
    });
  }
});

// Unsubscribe from event notifications
router.post('/unsubscribe/:token', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { unsubscribeToken: req.params.token }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Invalid unsubscribe token'
      });
    }

    // In a real app, you might want to update user preferences instead of deleting
    await notification.destroy();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from event notifications'
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process unsubscribe request',
      error: error.message
    });
  }
});

module.exports = router;
