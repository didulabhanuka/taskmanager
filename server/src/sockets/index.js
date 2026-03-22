const { Server } = require('socket.io');
const socketAuth = require('../middleware/auth/socket.auth');
const registerBoardHandlers = require('./board/board.handlers');
const registerPresenceHandlers = require('./presence/presence.handlers');

const initSocket = (httpServer) => {
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (local HTML files) in development only
      if (!origin && process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      if (origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

  // Apply JWT auth middleware to all socket connections
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.user.name})`);

    // Register all event handlers for this socket
    registerBoardHandlers(io, socket);
    registerPresenceHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} reason: ${reason}`);
    });
  });

  return io;
};

module.exports = initSocket;