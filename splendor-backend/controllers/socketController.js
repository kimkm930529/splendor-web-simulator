const GameManager = require('../models/GameManager');

class SocketController {
    constructor(io) {
        this.io = io;
        this.gameManager = new GameManager();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`클라이언트 연결됨: ${socket.id}`);

            // 게임 입장
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

            // 연결 해제
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    // 게임 입장 처리
    handleJoinGame(socket, data) {
        try {
            const { gameId, playerName } = data;
            
            if (!gameId || !playerName) {
                socket.emit('error', { message: '게임 ID와 플레이어 이름이 필요합니다.' });
                return;
            }

            // 게임이 없으면 생성
            if (!this.gameManager.games.has(gameId)) {
                this.gameManager.createGame(gameId);
            }

            // 플레이어 추가
            const player = this.gameManager.addPlayer(gameId, socket.id, playerName);
            
            // 게임룸에 참가
            socket.join(gameId);
            
            // 게임 상태 전송
            const gameState = this.gameManager.getGameState(gameId);
            socket.emit('game_joined', { gameState, playerId: socket.id });
            
            // 다른 플레이어들에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(gameId);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    // 게임 시작 처리
    handleStartGame(socket, data) {
        try {
            const { gameId } = data;
            
            if (!gameId) {
                socket.emit('error', { message: '게임 ID가 필요합니다.' });
                return;
            }

            const game = this.gameManager.startGame(gameId);
            
            // 게임 상태 전송
            const gameState = this.gameManager.getGameState(gameId);
            socket.emit('game_started', { gameState });
            
            // 모든 플레이어에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(gameId);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    // 토큰 선택 처리
    handleSelectToken(socket, data) {
        try {
            const { gameId, gem } = data;
            
            if (!gameId || !gem) {
                socket.emit('error', { message: '게임 ID와 보석 종류가 필요합니다.' });
                return;
            }

            const game = this.gameManager.selectToken(gameId, socket.id, gem);
            
            // 게임 상태 전송
            const gameState = this.gameManager.getGameState(gameId);
            socket.emit('token_selected', { gameState });
            
            // 다른 플레이어들에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(gameId);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    // 토큰 선택 취소 처리
    handleCancelTokenSelection(socket, data) {
        try {
            const { gameId } = data;
            
            if (!gameId) {
                socket.emit('error', { message: '게임 ID가 필요합니다.' });
                return;
            }

            const game = this.gameManager.cancelTokenSelection(gameId, socket.id);
            
            // 게임 상태 전송
            const gameState = this.gameManager.getGameState(gameId);
            socket.emit('token_selection_cancelled', { gameState });
            
            // 다른 플레이어들에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(gameId);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    // 토큰 획득 확인 처리
    handleConfirmTakeTokens(socket, data) {
        try {
            const { gameId } = data;
            
            if (!gameId) {
                socket.emit('error', { message: '게임 ID가 필요합니다.' });
                return;
            }

            const game = this.gameManager.confirmTakeTokens(gameId, socket.id);
            
            // 게임 상태 전송
            const gameState = this.gameManager.getGameState(gameId);
            socket.emit('tokens_taken', { gameState });
            
            // 다른 플레이어들에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(gameId);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    // 카드 구매 처리
    handleBuyCard(socket, data) {
        try {
            const { gameId, cardId, level } = data;
            
            if (!gameId || !cardId || !level) {
                socket.emit('error', { message: '게임 ID, 카드 ID, 레벨이 필요합니다.' });
                return;
            }

            const game = this.gameManager.buyCard(gameId, socket.id, cardId, level);
            
            // 게임 상태 전송
            const gameState = this.gameManager.getGameState(gameId);
            socket.emit('card_bought', { gameState });
            
            // 다른 플레이어들에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(gameId);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    // 카드 예약 처리
    handleReserveCard(socket, data) {
        try {
            const { gameId, cardId, level } = data;
            
            if (!gameId || !cardId || !level) {
                socket.emit('error', { message: '게임 ID, 카드 ID, 레벨이 필요합니다.' });
                return;
            }

            const game = this.gameManager.reserveCard(gameId, socket.id, cardId, level);
            
            // 게임 상태 전송
            const gameState = this.gameManager.getGameState(gameId);
            socket.emit('card_reserved', { gameState });
            
            // 다른 플레이어들에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(gameId);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    // 턴 종료 처리
    handleEndTurn(socket, data) {
        try {
            const { gameId } = data;
            
            if (!gameId) {
                socket.emit('error', { message: '게임 ID가 필요합니다.' });
                return;
            }

            const game = this.gameManager.endTurn(gameId, socket.id);
            
            // 게임 상태 전송
            const gameState = this.gameManager.getGameState(gameId);
            socket.emit('turn_ended', { gameState });
            
            // 다른 플레이어들에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(gameId);
            
            // 게임 종료 확인
            if (game.gameEnded) {
                this.io.to(gameId).emit('game_finished', { 
                    gameState, 
                    winner: game.winner 
                });
            }
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    }

    // 연결 해제 처리
    handleDisconnect(socket) {
        console.log(`클라이언트 연결 해제됨: ${socket.id}`);
        
        // 플레이어 정보 찾기
        const playerInfo = this.gameManager.players.get(socket.id);
        if (playerInfo) {
            // 게임에서 플레이어 제거
            this.gameManager.removePlayer(playerInfo.gameId, socket.id);
            
            // 다른 플레이어들에게 게임 상태 업데이트 알림
            this.broadcastGameStateUpdate(playerInfo.gameId);
        }
    }

    // 게임 상태 업데이트 브로드캐스트
    broadcastGameStateUpdate(gameId) {
        try {
            const gameState = this.gameManager.getGameState(gameId);
            this.io.to(gameId).emit('game_state_update', { gameState });
        } catch (error) {
            console.error('게임 상태 업데이트 브로드캐스트 실패:', error);
        }
    }
}

module.exports = SocketController;
