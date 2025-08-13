const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Debug: Log environment variables
console.log('Environment Variables:', {
  GMAIL_USER: process.env.GMAIL_USER ? '***' : 'NOT SET',
  GMAIL_PASS: process.env.GMAIL_PASS ? '***' : 'NOT SET'
});

async function testEmail() {
  console.log('Testing email sending...');
  
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

  console.log('Using email config:', {
    ...emailConfig,
    auth: { ...emailConfig.auth, pass: '***' }
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

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

// Run the test
testEmail();
