const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Test Script Info:', {
      script: 'test-email',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Test Script Debug:', {
        script: 'test-email',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Test Script Error:', {
      script: 'test-email',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  success: (message, data = {}) => {
    console.info('Test Script Success:', {
      script: 'test-email',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  warn: (message, data = {}) => {
    console.warn('Test Script Warning:', {
      script: 'test-email',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// Debug: Log environment variables
logger.debug('Environment Variables:', {
  GMAIL_USER: process.env.GMAIL_USER ? '***' : 'NOT SET',
  GMAIL_PASS: process.env.GMAIL_PASS ? '***' : 'NOT SET'
});

async function testEmail() {
  logger.info('Starting email test');

  // Direct credentials (temporary for testing)
  const emailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'kidsdisable@gmail.com',  // Replace with your email if different
      pass: 'xczz tofh ewjp xtka'    // Replace with your app password
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  };

  logger.debug('Email configuration', {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    from: emailConfig.auth.user
  });

  const transporter = nodemailer.createTransport(emailConfig);

  try {
    // Send test email
    const info = await transporter.sendMail({
      from: `"Test Sender" <kidsdisable@gmail.com>`,
      to: 'margarettechworld@gmail.com',
      subject: 'Test Email from Disable Children App',
      text: 'This is a test email from the Disable Children App',
      html: '<b>This is a test email from the Disable Children App</b>'
    });

    logger.success('Email sent successfully', {
      messageId: info.messageId,
      response: info.response
    });
  } catch (error) {
    logger.error('Failed to send test email', error, {
      to: 'margarettechworld@gmail.com',
      step: 'send-email'
    });
  }
}

// Run the test
testEmail();
logger.info('Test completed', {
  status: 'completed',
  timestamp: new Date().toISOString()
});
