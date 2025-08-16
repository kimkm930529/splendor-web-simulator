const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Splendor Backend API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import routes and controllers
const gameRoutes = require('./routes/game');
const SocketController = require('./controllers/socketController');

// Game routes
app.use('/api/game', gameRoutes);

// Socket.IO controller
new SocketController(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Splendor Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:8000'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Socket.IO ready for multiplayer games`);
});

module.exports = app;
