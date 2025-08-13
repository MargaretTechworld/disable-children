const jwt = require('jsonwebtoken');
const { User } = require('./models'); // Import User model from models/index.js

const initializeSocket = (io) => {
  // Middleware for authenticating socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.error('Socket connection attempt without token');
        return next(new Error('Authentication error: No token provided.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.user?.id) {
        console.error('Invalid token payload:', decoded);
        return next(new Error('Authentication error: Invalid token structure.'));
      }

      // Use the correct model method based on how it's exported
      const user = await User.findByPk(decoded.user.id, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
      });

      if (!user) {
        console.error('User not found for socket connection:', decoded.user.id);
        return next(new Error('Authentication error: User not found.'));
      }

      // Attach user info to the socket
      socket.user = user.get({ plain: true });
      console.log(`Socket authenticated for user: ${user.email} (${user.role})`);
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user?.firstName || 'Unknown'} (${socket.user?.role || 'unknown'})`);

    // Join rooms based on role
    if (socket.user?.role) {
      const userRoom = socket.user.role === 'super_admin' ? 'super_admin_room' : 'admins_room';
      socket.join(userRoom);
      console.log(`${socket.user.firstName} joined room: ${userRoom}`);
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
        console.error('Error handling chat message:', error);
        if (typeof callback === 'function') {
          callback({ error: error.message });
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.email || 'Unknown'}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
