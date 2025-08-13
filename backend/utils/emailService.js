const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log('Email Service - Environment:', {
  GMAIL_USER: process.env.GMAIL_USER ? '***' : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV
});

// Gmail SMTP configuration
const getGmailConfig = () => {
  // Direct credentials (from our working test)
  return {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'kidsdisable@gmail.com',
      pass: 'xczz tofh ewjp xtka'  // App password
    },
    tls: {
      rejectUnauthorized: false
    },
    // Debug options
    debug: true,
    logger: true
  };
};

// Create reusable transporter object
let transporter;

const createTransporter = () => {
  try {
    const mailConfig = getGmailConfig();
    console.log('Creating Gmail SMTP transporter');
    return nodemailer.createTransport(mailConfig);
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Initialize transporter
transporter = createTransporter();

// Function to ensure transporter is ready
const getTransporter = async () => {
  if (!transporter) {
    console.log('Transporter not ready, initializing...');
    transporter = createTransporter();
  }
  return transporter;
};

// Function to send password reset email
exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = await getTransporter();
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const fromEmail = 'kidsdisable@gmail.com';
    
    console.log(`Sending password reset email to: ${email}`);
    console.log(`Reset link: ${resetLink}`);
    
    const mailOptions = {
      from: `"Disable Children App" <${fromEmail}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `Please use the following link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password. Please click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; 
                      color: white; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${resetLink}
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Generic function to send emails
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await getTransporter();
    const fromEmail = 'kidsdisable@gmail.com';
    
    const mailOptions = {
      from: `"Disable Children App" <${fromEmail}>`,
      to,
      subject: subject || 'Notification from Disable Children App',
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback to HTML without tags
      html
    };

    console.log(`Sending email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

exports.sendEmail = sendEmail;

// Function to send new password email
exports.sendNewPasswordEmail = async (email, newPassword) => {
  try {
    const subject = 'Your New Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your New Password</h2>
        <p>Your password has been reset. Here's your new temporary password:</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 4px; font-family: monospace;">
          ${newPassword}
        </div>
        <p>Please log in using this password and change it immediately after logging in.</p>
        <p>If you didn't request this change, please contact support immediately.</p>
      </div>
    `;

    return await sendEmail({ to: email, subject, html });
  } catch (error) {
    console.error('Error sending new password email:', error);
    throw error;
  }
};
