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

// 미들웨어 설정
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:8000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Splendor Backend Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 게임 라우트
const gameRoutes = require('./routes/game');
app.use('/api/game', gameRoutes);

// Socket.IO 컨트롤러
const SocketController = require('./controllers/socketController');
new SocketController(io);

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 Splendor Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:8000'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Socket.IO ready for multiplayer games`);
});

module.exports = app;
