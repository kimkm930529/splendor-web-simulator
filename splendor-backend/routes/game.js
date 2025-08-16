const express = require('express');
const router = express.Router();

// 게임 상태 조회
router.get('/status', (req, res) => {
    res.json({
        status: 'running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 카드 데이터 조회
router.get('/cards', (req, res) => {
    // CSV 파일에서 카드 데이터를 읽어서 반환
    const fs = require('fs');
    const path = require('path');
    
    try {
        const csvPath = path.join(__dirname, '..', 'splendor_card.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        res.setHeader('Content-Type', 'text/csv');
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({
            error: '카드 데이터를 불러올 수 없습니다.',
            message: error.message
        });
    }
});

// 게임 시작
router.post('/start', (req, res) => {
    res.json({
        message: '게임 시작 요청이 처리되었습니다.',
        timestamp: new Date().toISOString()
    });
});

// 특정 게임 정보 조회
router.get('/:id', (req, res) => {
    const gameId = req.params.id;
    res.json({
        gameId: gameId,
        status: 'active',
        players: [],
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
