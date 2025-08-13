const { Op } = require('sequelize');
const { User, Child, Event, Notification } = require('../models');
const emailService = require('../utils/emailService');
const { v4: uuidv4 } = require('uuid');
const { RateLimiter } = require('limiter');

// Rate limiter: 100 emails per minute (adjust based on your email service limits)
const emailLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute'
});

// Cache for parent-disability mappings
const parentDisabilityCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class NotificationService {
  /**
   * Get or fetch parent's children disabilities
   */
  static async getParentDisabilities(parentId) {
    const cacheKey = `parent-${parentId}`;
    const cached = parentDisabilityCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.disabilities;
    }
    
    const children = await Child.findAll({
      where: { userId: parentId },
      attributes: ['disabilityType']
    });
    
    const disabilities = [...new Set(children.map(c => c.disabilityType).filter(Boolean))];
    
    parentDisabilityCache.set(cacheKey, {
      timestamp: Date.now(),
      disabilities
    });
    
    return disabilities;
  }

  /**
   * Find parents with children matching specific disabilities
   */
  static async findParentsByChildrenDisabilities(targetDisabilities) {
    try {
      console.log('Searching for parents with children having disabilities:', targetDisabilities);
      
      // Convert target disabilities to lowercase for case-insensitive comparison
      const targetDisabilitiesLower = targetDisabilities.map(d => d?.toLowerCase().trim());
      
      // Get all children with their parent's email from the Children table
      const children = await Child.findAll({
        where: {
          disabilityType: {
            [Op.in]: targetDisabilitiesLower
          },
          email: {
            [Op.ne]: null // Only include children with an email
          }
        },
        attributes: ['parentFirstName', 'parentLastName', 'email', 'disabilityType'],
        raw: true
      });

      console.log(`Found ${children.length} children matching target disabilities`);
      
      // Group by email to get unique parents
      const parentMap = new Map();
      
      children.forEach(child => {
        if (!parentMap.has(child.email)) {
          parentMap.set(child.email, {
            email: child.email,
            name: `${child.parentFirstName || ''} ${child.parentLastName || ''}`.trim() || 'Parent',
            disabilities: new Set()
          });
        }
        if (child.disabilityType) {
          parentMap.get(child.email).disabilities.add(child.disabilityType);
        }
      });

      // Convert to array of parent objects
      const parents = Array.from(parentMap.values()).map(parent => ({
        id: parent.email, // Using email as ID since we don't have user ID
        name: parent.name,
        email: parent.email,
        preferences: { email: true },
        disabilities: Array.from(parent.disabilities)
      }));

      console.log(`Found ${parents.length} unique parents to notify`);
      return parents;
    } catch (error) {
      console.error('Error finding parents by children disabilities:', error);
      throw error;
    }
  }

  /**
   * Create notification records for an event
   */
  static async createNotifications(event, parents) {
    const transaction = await Notification.sequelize.transaction();
    
    try {
      const notifications = await Promise.all(
        parents.map(parent => 
          Notification.create({
            eventId: event.id,
            recipientId: parent.id,
            status: 'pending',
            unsubscribeToken: uuidv4(),
            metadata: {
              email: parent.email,
              preferences: parent.preferences
            }
          }, { transaction })
        )
      );
      
      await transaction.commit();
      return notifications;
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating notifications:', error);
      throw error;
    }
  }

  /**
   * Send a single notification email with rate limiting
   */
  static async sendNotificationEmail(notification, event, parent) {
    try {
      // Check rate limits
      const remainingRequests = await emailLimiter.removeTokens(1);
      if (remainingRequests < 0) {
        // If we hit the rate limit, wait and retry
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
        return this.sendNotificationEmail(notification, event, parent);
      }

      // Get the child's disability type for personalization
      const childDisabilities = await this.getParentDisabilities(parent.id);
      const primaryDisability = childDisabilities[0] || 'disability';

      // Prepare email content
      const emailContent = this.prepareEmailContent(event, parent, notification, primaryDisability);
      
      // Send the email
      const messageId = await emailService.sendEmail({
        to: parent.email,
        subject: `New Event: ${event.title}`,
        html: emailContent,
        messageId: notification.id
      });

      // Update notification status
      await notification.update({
        status: 'sent',
        sentAt: new Date(),
        metadata: {
          ...notification.metadata,
          messageId,
          sentAt: new Date().toISOString()
        }
      });

      return { success: true, messageId };
    } catch (error) {
      console.error(`Failed to send notification to ${parent.email}:`, error);
      
      await notification.update({
        status: 'failed',
        metadata: {
          ...notification.metadata,
          error: error.message,
          retryCount: (notification.metadata?.retryCount || 0) + 1,
          lastRetryAt: new Date().toISOString()
        }
      });

      return { 
        success: false, 
        error: error.message,
        recipientId: parent.id,
        notificationId: notification.id
      };
    }
  }

  /**
   * Process notifications for an event
   */
  static async processEventNotifications(eventId, options = {}) {
    const { batchSize = 50, concurrency = 5 } = options;
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if notifications were already sent
    if (event.status === 'sent') {
      return {
        success: false,
        message: 'Notifications have already been sent for this event'
      };
    }

    try {
      // Find matching parents
      const parents = await this.findParentsByChildrenDisabilities(event.targetDisabilities);
      
      if (parents.length === 0) {
        return {
          success: false,
          message: 'No parents found matching the target disabilities',
          stats: { total: 0, success: 0, failed: 0 }
        };
      }

      // Create notification records
      const notifications = await this.createNotifications(event, parents);
      
      // Process notifications in batches with controlled concurrency
      const results = {
        total: notifications.length,
        success: 0,
        failed: 0,
        errors: []
      };

      // Process in batches
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        
        // Process batch with controlled concurrency
        const batchPromises = [];
        const activePromises = new Set();
        
        for (const notification of batch) {
          const parent = parents.find(p => p.id === notification.recipientId);
          if (!parent) continue;
          
          const promise = this.sendNotificationEmail(notification, event, parent)
            .then(result => {
              if (result.success) {
                results.success++;
              } else {
                results.failed++;
                results.errors.push({
                  notificationId: notification.id,
                  recipientId: parent.id,
                  error: result.error
                });
              }
              return result;
            })
            .finally(() => {
              activePromises.delete(promise);
            });
          
          activePromises.add(promise);
          batchPromises.push(promise);
          
          // Limit concurrency
          if (activePromises.size >= concurrency) {
            await Promise.race(activePromises);
          }
        }
        
        // Wait for remaining promises in batch
        await Promise.all(batchPromises);
      }

      // Update event status
      await event.update({
        status: 'sent',
        sentAt: new Date(),
        notificationStats: {
          total: results.total,
          success: results.success,
          failed: results.failed
        }
      });

      return {
        success: true,
        message: `Successfully sent ${results.success} of ${results.total} notifications`,
        stats: results
      };
    } catch (error) {
      console.error('Error processing event notifications:', error);
      
      // Update event with cancelled status due to error
      await event.update({
        status: 'cancelled',
        metadata: {
          ...event.metadata,
          error: error.message,
          errorStack: error.stack,
          cancelledReason: 'Notification processing failed'
        }
      });

      return {
        success: false,
        message: error.message,
        error: error.stack
      };
    }
  }

  /**
   * Prepare HTML email content with responsive design
   */
  static prepareEmailContent(event, parent, notification, disabilityType) {
    const eventDate = new Date(event.dateTime).toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?token=${notification.unsubscribeToken}`;
    const eventLink = `${process.env.FRONTEND_URL}/events/${event.id}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a6fa5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .event-card { background: white; border-radius: 5px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #4a6fa5; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 10px 0; 
          }
          .footer { 
            font-size: 12px; 
            color: #777; 
            text-align: center; 
            margin-top: 20px; 
            padding-top: 10px; 
            border-top: 1px solid #eee; 
          }
          @media only screen and (max-width: 600px) {
            .event-card { padding: 15px; }
            .button { display: block; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Event Announcement</h1>
        </div>
        
        <div class="content">
          <p>Hello ${parent.name || 'there'},</p>
          
          <p>We're excited to invite you to an upcoming event that may be of interest to you and your child.</p>
          
          <div class="event-card">
            <h2 style="margin-top: 0;">${event.title}</h2>
            
            <p><strong>When:</strong> ${eventDate}</p>
            ${event.location ? `<p><strong>Where:</strong> ${event.location}</p>` : ''}
            
            <div style="margin: 15px 0;">
              <p>${event.description}</p>
            </div>
            
            ${disabilityType ? `
              <p>This event is particularly relevant for children with: 
                <strong>${this.formatDisabilityType(disabilityType)}</strong>
              </p>
            ` : ''}
            
            <a href="${eventLink}" class="button">View Event Details</a>
          </div>
          
          <p>We hope to see you there!</p>
          
          <p>Best regards,<br>The ${process.env.APP_NAME || 'Disability Support'} Team</p>
        </div>
        
        <div class="footer">
          <p>You're receiving this email because you're registered as a parent in our system.</p>
          <p>
            <a href="${unsubscribeLink}" style="color: #4a6fa5; text-decoration: none;">
              Unsubscribe from similar notifications
            </a>
          </p>
          <p> ${new Date().getFullYear()} ${process.env.APP_NAME || 'Disability Support'}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format disability type for display
   */
  static formatDisabilityType(type) {
    const types = {
      'visual': 'Visual Impairment',
      'hearing': 'Hearing Impairment',
      'physical': 'Physical Disability',
      'intellectual': 'Intellectual Disability',
      'autism': 'Autism Spectrum Disorder',
      'down-syndrome': 'Down Syndrome',
      'other': 'Other Disabilities'
    };
    return types[type] || type;
  }

  /**
   * Get count of parents with children matching specific disabilities
   * @param {string[]} disabilityTypes - Array of disability types to filter by
   * @returns {Promise<number>} - Count of matching parents
   */
  static async getParentCountByDisabilities(disabilityTypes = []) {
    try {
      console.log('=== Starting getParentCountByDisabilities ===');
      console.log('Input disabilityTypes:', disabilityTypes);
      
      // If no disabilities provided, count all unique parent emails
      if (!disabilityTypes || disabilityTypes.length === 0) {
        console.log('No disability types provided, counting all unique parent emails');
        const count = await Child.count({
          distinct: true,
          col: 'email',
          where: {
            email: {
              [Op.ne]: null,
              [Op.ne]: ''
            }
          }
        });
        console.log('Total unique parent emails:', count);
        return count;
      }

      console.log('Getting parents with children matching disabilities:', disabilityTypes);
      
      // Find all unique parent emails for children with the specified disabilities
      const parents = await Child.findAll({
        attributes: ['email'],
        where: {
          disabilityType: {
            [Op.in]: disabilityTypes,
            [Op.ne]: null,
            [Op.ne]: ''
          },
          email: {
            [Op.ne]: null,
            [Op.ne]: ''
          }
        },
        raw: true
      });
      
      console.log('Parents found with matching children:', parents);
      
      // Get unique emails
      const uniqueEmails = [...new Set(parents.map(p => p.email))];
      console.log('Unique parent emails:', uniqueEmails);
      
      return uniqueEmails.length;
      
    } catch (error) {
      console.error('Error in getParentCountByDisabilities:', error);
      throw error;
    }
  }

  /**
   * Send a message to all parents, optionally filtered by children's disabilities
   * @param {Object} options - Message options
   * @param {string} options.subject - Email subject
   * @param {string} options.message - Email message content
   * @param {number} options.senderId - ID of the admin sending the message
   * @param {string[]} [options.disabilityTypes=[]] - Optional array of disability types to filter by
   * @returns {Promise<Object>} Result of the operation
   */
  static async sendMessageToAllParents({ subject, message, senderId, disabilityTypes = [] }) {
    try {
      console.log(`Sending message to parents with disabilities:`, disabilityTypes);
      
      let parents = [];
      let recipientGroup = 'All Parents';
      
      // If specific disabilities are provided, filter parents by those disabilities
      if (disabilityTypes && disabilityTypes.length > 0) {
        // Get unique parents with children matching the specified disabilities
        const children = await Child.findAll({
          where: {
            disabilityType: {
              [Op.in]: disabilityTypes
            },
            email: { [Op.ne]: null } // Use 'email' column for parent email
          },
          attributes: ['email', 'parentFirstName', 'parentLastName'],
          raw: true
        });
        
        // Create a map to deduplicate parents
        const parentMap = new Map();
        
        children.forEach(child => {
          if (child.email) {
            const email = child.email.toLowerCase();
            if (!parentMap.has(email)) {
              parentMap.set(email, {
                email: email,
                name: child.parentFirstName ? 
                  `${child.parentFirstName} ${child.parentLastName || ''}`.trim() : 
                  email.split('@')[0]
              });
            }
          }
        });
        
        parents = Array.from(parentMap.values());
        recipientGroup = `Parents of children with: ${disabilityTypes.join(', ')}`;
      } else {
        // Get all parents if no disability filter
        const childrenWithEmails = await Child.findAll({
          where: { 
            email: { [Op.ne]: null } // Only include children with email
          },
          attributes: ['email', 'parentFirstName', 'parentLastName'],
          raw: true
        });
        
        // Deduplicate by email
        const parentMap = new Map();
        childrenWithEmails.forEach(child => {
          if (child.email) {
            const email = child.email.toLowerCase();
            if (!parentMap.has(email)) {
              parentMap.set(email, {
                email: email,
                name: child.parentFirstName ? 
                  `${child.parentFirstName} ${child.parentLastName || ''}`.trim() : 
                  email.split('@')[0]
              });
            }
          }
        });
        
        parents = Array.from(parentMap.values());
      }
      
      if (parents.length === 0) {
        console.warn('No parents found matching the criteria');
        return {
          success: false,
          message: 'No parents found matching the specified criteria',
          error: 'NO_PARENTS_FOUND',
          stats: {
            total: 0,
            success: 0,
            failed: 0
          }
        };
      }
      
      console.log(`Sending message to ${parents.length} parents`);
      
      // Generate a unique message ID for this batch
      const batchMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a single notification record for this batch
      const notification = await Notification.create({
        userId: null, // No specific user ID since it's a broadcast
        senderId: senderId,
        subject: subject,
        message: message,
        status: 'sending',
        type: 'email',
        messageId: batchMessageId,
        unsubscribeToken: uuidv4(),
        metadata: {
          isBatch: true,
          recipientType: disabilityTypes.length > 0 ? 'disability' : 'all',
          disabilityTypes: disabilityTypes,
          recipientGroup: recipientGroup,
          recipientCount: parents.length,
          recipientEmails: parents.map(p => p.email),
        }
      });

      // Send emails in parallel with rate limiting
      const emailPromises = parents.map(parent => 
        emailService.sendEmail({
          to: parent.email,
          subject: subject,
          text: message,
          html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
          messageId: batchMessageId,
          unsubscribeToken: notification.unsubscribeToken,
          senderId: senderId
        })
      );

      // Wait for all emails to be sent
      const results = await Promise.allSettled(emailPromises);
      
      // Count successful and failed sends
      const stats = {
        total: results.length,
        success: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length
      };

      // Update notification status
      await notification.update({
        status: stats.failed === 0 ? 'sent' : 'partial',
        sentAt: new Date(),
        metadata: {
          ...notification.metadata,
          stats: stats,
          sentAt: new Date().toISOString()
        }
      });

      return {
        success: stats.failed === 0,
        message: stats.failed === 0 
          ? 'Message sent successfully to all recipients' 
          : `Message sent with ${stats.failed} failures`,
        stats: stats,
        notificationId: notification.id
      };
      
    } catch (error) {
      console.error('Error in sendMessageToAllParents:', error);
      return {
        success: false,
        message: 'Failed to send message',
        error: error.message,
        stats: {
          total: 0,
          success: 0,
          failed: 0
        }
      };
    }
  }
}

module.exports = NotificationService;
