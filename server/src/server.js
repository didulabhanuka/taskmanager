require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const initSocket = require('./sockets/index');

const PORT = process.env.PORT || 4000;

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Attach Socket.io to the HTTP server
initSocket(httpServer);

// Connect to MongoDB, then start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); // Kill the process — no point running without a DB
  });

// Handle unexpected errors so the server doesn't silently break
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  process.exit(1);
});