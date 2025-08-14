const jwt = require('jsonwebtoken');
const { User } = require('./models'); // Import User model from models/index.js

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Socket.IO Info:', {
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Socket.IO Debug:', {
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Socket.IO Error:', {
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

const initializeSocket = (io) => {
  // Middleware for authenticating socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        logger.error('Socket connection attempt without token', new Error('No token provided'), { socketId: socket.id });
        return next(new Error('Authentication error: No token provided.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.user?.id) {
        logger.error('Invalid token payload', new Error('Invalid token structure'), { decoded });
        return next(new Error('Authentication error: Invalid token structure.'));
      }

      // Use the correct model method based on how it's exported
      const user = await User.findByPk(decoded.user.id, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
      });

      if (!user) {
        logger.error('User not found for socket connection', new Error('User not found'), { userId: decoded.user.id });
        return next(new Error('Authentication error: User not found.'));
      }

      // Attach user info to the socket
      socket.user = user.get({ plain: true });
      logger.info('Socket authenticated', { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      });
      next();
    } catch (error) {
      logger.error('Socket authentication error', error, { socketId: socket.id });
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on('connection', (socket) => {
    logger.debug('User connected', { 
      userId: socket.user?.id,
      name: socket.user?.firstName || 'Unknown',
      role: socket.user?.role || 'unknown',
      socketId: socket.id
    });

    // Join rooms based on role
    if (socket.user?.role) {
      const userRoom = socket.user.role === 'super_admin' ? 'super_admin_room' : 'admins_room';
      socket.join(userRoom);
      logger.debug('User joined room', {
        userId: socket.user.id,
        name: socket.user.firstName,
        room: userRoom,
        socketId: socket.id
      });
    }

    // Handle incoming chat messages
    socket.on('chat message', (msg, callback) => {
      try {
        if (typeof msg !== 'string' || msg.trim() === '') {
          throw new Error('Message cannot be empty');
        }

        // Broadcast the message to all connected clients in the room
        const userRoom = socket.user.role === 'super_admin' ? 'super_admin_room' : 'admins_room';
        io.to(userRoom).emit('chat message', {
          user: {
            id: socket.user.id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            role: socket.user.role,
          },
          message: msg,
          timestamp: new Date(),
        });

        // Acknowledge the message was received
        if (typeof callback === 'function') {
          callback({ status: 'Message sent' });
        }
      } catch (error) {
        logger.error('Error handling chat message', error, { socketId: socket.id });
        if (typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.debug('User disconnected', {
        userId: socket.user?.id,
        email: socket.user?.email || 'Unknown',
        socketId: socket.id,
        reason: reason || 'client disconnected'
      });
    });
  });

  return io;
};

module.exports = initializeSocket;
