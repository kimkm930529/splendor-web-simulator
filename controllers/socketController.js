const GameManager = require('../models/GameManager');

class SocketController {
  constructor(io) {
    this.io = io;
    this.gameManager = new GameManager();
    this.setupEventHandlers();
  }

  // 게임 상태 업데이트를 모든 플레이어에게 전송하는 헬퍼 함수
  broadcastGameStateUpdate(gameId) {
    const gameState = this.gameManager.getGameState(gameId);
    if (gameState) {
      this.io.to(gameId).emit('game_state_update', { gameState });
    }
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`플레이어 연결: ${socket.id}`);

      // 플레이어 입장
      socket.on('join_game', (data) => {
        this.handleJoinGame(socket, data);
      });

      // 게임 시작
      socket.on('start_game', (data) => {
        this.handleStartGame(socket, data);
      });

      // 토큰 선택
      socket.on('select_token', (data) => {
        this.handleSelectToken(socket, data);
      });

      // 토큰 선택 취소
      socket.on('cancel_token_selection', (data) => {
        this.handleCancelTokenSelection(socket, data);
      });

      // 토큰 획득 확인
      socket.on('confirm_take_tokens', (data) => {
        this.handleConfirmTakeTokens(socket, data);
      });

      // 카드 구매
      socket.on('buy_card', (data) => {
        this.handleBuyCard(socket, data);
      });

      // 카드 예약
      socket.on('reserve_card', (data) => {
        this.handleReserveCard(socket, data);
      });

      // 턴 종료
      socket.on('end_turn', (data) => {
        this.handleEndTurn(socket, data);
      });

      // 게임 상태 요청
      socket.on('get_game_state', (data) => {
        this.handleGetGameState(socket, data);
      });

      // 연결 해제
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  // 플레이어 게임 입장
  handleJoinGame(socket, data) {
    const { gameId, playerName } = data;
    
    if (!gameId || !playerName) {
      socket.emit('error', { message: '게임 ID와 플레이어 이름이 필요합니다.' });
      return;
    }

    // 플레이어 등록
    const player = this.gameManager.addPlayer(socket.id, playerName);
    player.gameId = gameId;

    // 게임에 참여
    socket.join(gameId);

    // 게임이 존재하지 않으면 생성
    let game = this.gameManager.getGame(gameId);
    if (!game) {
      game = this.gameManager.createGame(gameId, [socket.id]);
    } else {
      // 기존 게임에 플레이어 추가
      if (game.players.length < 4) {
        game.players.push({
          id: socket.id,
          name: playerName,
          tokens: { sapphire: 0, emerald: 0, ruby: 0, diamond: 0, onyx: 0, gold: 0 },
          cards: [],
          reservedCards: [],
          prestigePoints: 0
        });
      }
    }

    // 게임 상태 전송
    const gameState = this.gameManager.getGameState(gameId);
    socket.emit('game_joined', { gameState, playerId: socket.id });

    // 다른 플레이어들에게 새 플레이어 입장 알림
    socket.to(gameId).emit('player_joined', { 
      playerId: socket.id, 
      playerName: playerName,
      gameState 
    });

    // 모든 플레이어에게 게임 상태 업데이트 전송
    this.broadcastGameStateUpdate(gameId);

    console.log(`플레이어 ${playerName}이 게임 ${gameId}에 입장했습니다.`);
  }

  // 게임 시작
  handleStartGame(socket, data) {
    const { gameId } = data;
    const game = this.gameManager.getGame(gameId);
    
    if (!game) {
      socket.emit('error', { message: '게임을 찾을 수 없습니다.' });
      return;
    }

    if (game.players.length < 2) {
      socket.emit('error', { message: '게임을 시작하려면 최소 2명의 플레이어가 필요합니다.' });
      return;
    }

    // 게임 상태를 active로 변경
    game.status = 'active';
    game.currentPlayerIndex = 0;

    // 모든 플레이어에게 게임 시작 알림
    const gameState = this.gameManager.getGameState(gameId);
    this.io.to(gameId).emit('game_started', { gameState });
    
    // 모든 플레이어에게 게임 상태 업데이트 전송
    this.broadcastGameStateUpdate(gameId);

    console.log(`게임 ${gameId}가 시작되었습니다.`);
  }

  // 토큰 선택
  handleSelectToken(socket, data) {
    const { gameId, gem } = data;
    const success = this.gameManager.selectToken(gameId, socket.id, gem);
    
    if (success) {
      const gameState = this.gameManager.getGameState(gameId);
      this.io.to(gameId).emit('token_selected', { 
        playerId: socket.id, 
        gem, 
        gameState 
      });
      
      // 모든 플레이어에게 게임 상태 업데이트 전송
      this.broadcastGameStateUpdate(gameId);
    } else {
      socket.emit('error', { message: '토큰을 선택할 수 없습니다.' });
    }
  }

  // 토큰 선택 취소
  handleCancelTokenSelection(socket, data) {
    const { gameId } = data;
    const success = this.gameManager.cancelTokenSelection(gameId, socket.id);
    
    if (success) {
      const gameState = this.gameManager.getGameState(gameId);
      this.io.to(gameId).emit('token_selection_cancelled', { 
        playerId: socket.id, 
        gameState 
      });
      
      // 모든 플레이어에게 게임 상태 업데이트 전송
      this.broadcastGameStateUpdate(gameId);
    } else {
      socket.emit('error', { message: '토큰 선택을 취소할 수 없습니다.' });
    }
  }

  // 토큰 획득 확인
  handleConfirmTakeTokens(socket, data) {
    const { gameId } = data;
    const success = this.gameManager.confirmTakeTokens(gameId, socket.id);
    
    if (success) {
      const gameState = this.gameManager.getGameState(gameId);
      this.io.to(gameId).emit('tokens_taken', { 
        playerId: socket.id, 
        gameState 
      });
      
      // 모든 플레이어에게 게임 상태 업데이트 전송
      this.broadcastGameStateUpdate(gameId);
    } else {
      socket.emit('error', { message: '토큰을 획득할 수 없습니다.' });
    }
  }

  // 카드 구매
  handleBuyCard(socket, data) {
    const { gameId, cardId, level } = data;
    const success = this.gameManager.buyCard(gameId, socket.id, cardId, level);
    
    if (success) {
      const gameState = this.gameManager.getGameState(gameId);
      this.io.to(gameId).emit('card_bought', { 
        playerId: socket.id, 
        cardId, 
        level, 
        gameState 
      });
      
      // 모든 플레이어에게 게임 상태 업데이트 전송
      this.broadcastGameStateUpdate(gameId);
    } else {
      socket.emit('error', { message: '카드를 구매할 수 없습니다.' });
    }
  }

  // 카드 예약
  handleReserveCard(socket, data) {
    const { gameId, cardId, level } = data;
    const success = this.gameManager.reserveCard(gameId, socket.id, cardId, level);
    
    if (success) {
      const gameState = this.gameManager.getGameState(gameId);
      this.io.to(gameId).emit('card_reserved', { 
        playerId: socket.id, 
        cardId, 
        level, 
        gameState 
      });
      
      // 모든 플레이어에게 게임 상태 업데이트 전송
      this.broadcastGameStateUpdate(gameId);
    } else {
      socket.emit('error', { message: '카드를 예약할 수 없습니다.' });
    }
  }

  // 턴 종료
  handleEndTurn(socket, data) {
    const { gameId } = data;
    const success = this.gameManager.endTurn(gameId, socket.id);
    
    if (success) {
      const gameState = this.gameManager.getGameState(gameId);
      this.io.to(gameId).emit('turn_ended', { 
        playerId: socket.id, 
        gameState 
      });

      // 게임 종료 확인
      if (gameState.status === 'finished') {
        this.io.to(gameId).emit('game_finished', { gameState });
      }
      
      // 모든 플레이어에게 게임 상태 업데이트 전송
      this.broadcastGameStateUpdate(gameId);
    } else {
      socket.emit('error', { message: '턴을 종료할 수 없습니다.' });
    }
  }

  // 게임 상태 요청
  handleGetGameState(socket, data) {
    const { gameId } = data;
    const gameState = this.gameManager.getGameState(gameId);
    
    if (gameState) {
      socket.emit('game_state', { gameState });
    } else {
      socket.emit('error', { message: '게임을 찾을 수 없습니다.' });
    }
  }

  // 연결 해제
  handleDisconnect(socket) {
    console.log(`플레이어 연결 해제: ${socket.id}`);
    
    // 플레이어 제거
    this.gameManager.removePlayer(socket.id);
    
    // 게임에서 플레이어가 나간 경우 다른 플레이어들에게 알림
    const player = this.gameManager.players.get(socket.id);
    if (player && player.gameId) {
      const gameState = this.gameManager.getGameState(player.gameId);
      if (gameState) {
        socket.to(player.gameId).emit('player_left', { 
          playerId: socket.id, 
          gameState 
        });
        
        // 모든 플레이어에게 게임 상태 업데이트 전송
        this.broadcastGameStateUpdate(player.gameId);
      }
    }
  }
}

module.exports = SocketController;
