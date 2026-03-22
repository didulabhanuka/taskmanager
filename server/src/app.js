const express = require('express');
const cors = require('cors');

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

// Routes — uncomment as we build each one
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/boards', require('./routes/boards.routes'));
// app.use('/api/columns', require('./routes/columns.routes'));
// app.use('/api/cards', require('./routes/cards.routes'));
// app.use('/api/activities', require('./routes/activities.routes'));

// 404 — route not found
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Global error handler — all next(err) calls land here
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`);

  res.status(statusCode).json({
    status: 'error',
    message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;