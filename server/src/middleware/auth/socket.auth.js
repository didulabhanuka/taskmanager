const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const socketAuth = async (socket, next) => {
  try {
    // Token is passed in the handshake from the client
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to socket
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket — available in all handlers
    socket.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    return next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = socketAuth;