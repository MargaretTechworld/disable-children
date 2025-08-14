const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const http = require('http');
const { Server } = require('socket.io');
const initializeSocket = require('./socket');

const userRoutes = require('./routes/users');
const childrenRoutes = require('./routes/children');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Adjust for your React app's URL
    methods: ['GET', 'POST'],
  },
});

const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// API Routes
app.use('/api/users', userRoutes); 
app.use('/api/children', childrenRoutes);
app.use('/api/notifications', notificationRoutes);

// Initialize Socket.IO
initializeSocket(io);

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Server Info:', {
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  error: (message, error, data = {}) => {
    console.error('Server Error:', {
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// Test DB Connection and Sync Models
sequelize.authenticate()
  .then(() => {
    logger.info('Database connection established successfully');
    // Sync all models
    return sequelize.sync(); 
  })
  .then(() => {
    server.listen(port, () => {
      logger.info(`Server started and listening on port ${port}`, { 
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      });
    });
  })
  .catch(err => {
    logger.error('Database connection error', err);
  });

  // Test email route
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendEmail } = require('./utils/emailService');
    await sendEmail({
      to: 'kidsdisable@gmail.com',
      subject: 'Test Email from Server',
      html: '<h1>This is a test email</h1><p>If you can read this, the email service is working!</p>'
    });
    res.json({ success: true, message: 'Test email sent' });
  } catch (error) {
    logger.error('Test email error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});