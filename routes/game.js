const express = require('express');
const router = express.Router();

// GET /api/game/status - 게임 상태 확인
router.get('/status', (req, res) => {
  res.json({
    message: 'Game status endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// GET /api/game/cards - 카드 데이터 조회
router.get('/cards', (req, res) => {
  // TODO: 실제 카드 데이터 로드 로직 구현
  res.json({
    message: 'Cards data endpoint',
    cards: []
  });
});

// POST /api/game/start - 새 게임 시작
router.post('/start', (req, res) => {
  // TODO: 새 게임 시작 로직 구현
  res.json({
    message: 'New game started',
    gameId: Date.now().toString(),
    status: 'active'
  });
});

// GET /api/game/:id - 특정 게임 정보 조회
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: 게임 ID로 게임 정보 조회 로직 구현
  res.json({
    message: 'Game info endpoint',
    gameId: id,
    status: 'active'
  });
});

module.exports = router;
