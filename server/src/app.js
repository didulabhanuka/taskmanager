const express = require('express');
const cors = require('cors');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit/rateLimit.middleware');
const app = express();

// Allow requests from the React client only
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Parse incoming JSON, cap at 10kb to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));

// Health check — used by Render and for local debugging
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api', require('./routes/index'));

// 404 — route not found
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Global error handler — all next(err) calls land here
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Only log errors in development — keeps test output clean
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;