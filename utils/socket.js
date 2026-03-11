const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

let io;

module.exports = (server) => {
  // Allowed origins – same as in server.js
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://electrostore.pxxl.click',
    'https://electrostore-admin.pxxl.click',
  ];

  if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
  if (process.env.ADMIN_URL) allowedOrigins.push(process.env.ADMIN_URL);

  const uniqueOrigins = [...new Set(allowedOrigins)];

  io = socketIo(server, {
    cors: {
      origin: uniqueOrigins,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Invalid token'));
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.userId);
    socket.join(`user:${socket.userId}`);
    if (socket.userRole === 'admin' || socket.userRole === 'manager') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.userId);
    });
  });

  return io;
};

module.exports.getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};