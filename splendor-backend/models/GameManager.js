const fs = require('fs');
const path = require('path');

class GameManager {
    constructor() {
        this.games = new Map(); // 게임 인스턴스들
        this.players = new Map(); // 플레이어 정보
        this.cardData = []; // 카드 데이터
        this.loadCardData();
    }

    // CSV 파일에서 카드 데이터 로드
    loadCardData() {
        try {
            const csvPath = path.join(__dirname, '..', 'splendor_card.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');
            const lines = csvContent.split('\n');
            
            // 보너스 보석 한글-영어 매핑
            const bonusMapping = {
                '사파이어': 'sapphire',
                '에메랄드': 'emerald',
                '루비': 'ruby',
                '다이아몬드': 'diamond',
                '오닉스': 'onyx'
            };
            
            // 헤더 제거하고 데이터 파싱
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const values = line.split(',');
                    if (values.length >= 8) {
                        const card = {
                            id: `card_${i}`,
                            level: parseInt(values[0].replace('레벨 ', '')),
                            prestige: parseInt(values[1]),
                            bonus: bonusMapping[values[2]] || values[2],
                            cost: {
                                diamond: parseInt(values[3]),
                                emerald: parseInt(values[4]),
                                ruby: parseInt(values[5]),
                                onyx: parseInt(values[6]),
                                sapphire: parseInt(values[7])
                            }
                        };
                        this.cardData.push(card);
                    }
                }
            }
            console.log(`카드 데이터 로드 완료: ${this.cardData.length}장`);
        } catch (error) {
            console.error('CSV 파일 로드 실패:', error);
            this.createDefaultCardData();
        }
    }

    // 기본 카드 데이터 생성
    createDefaultCardData() {
        this.cardData = [
            { id: 'card_1', level: 1, prestige: 0, bonus: 'sapphire', cost: { diamond: 1, emerald: 1, ruby: 1, onyx: 1, sapphire: 0 } },
            { id: 'card_2', level: 1, prestige: 0, bonus: 'diamond', cost: { diamond: 0, emerald: 0, ruby: 2, onyx: 2, sapphire: 0 } },
            { id: 'card_3', level: 2, prestige: 1, bonus: 'emerald', cost: { diamond: 3, emerald: 0, ruby: 2, onyx: 0, sapphire: 0 } },
            { id: 'card_4', level: 3, prestige: 3, bonus: 'onyx', cost: { diamond: 3, emerald: 3, ruby: 3, onyx: 0, sapphire: 3 } }
        ];
    }

    // 게임 생성
    createGame(gameId) {
        const game = {
            id: gameId,
            players: [],
            currentPlayer: 0,
            availableTokens: {
                diamond: 7, emerald: 7, ruby: 7, onyx: 7, sapphire: 7, gold: 5
            },
            developmentCards: [],
            nobleTiles: [],
            gameStarted: false,
            gameEnded: false,
            winner: null
        };

        this.setupDevelopmentCards(game);
        this.setupNobleTiles(game);
        this.games.set(gameId, game);
        
        console.log(`게임 생성됨: ${gameId}`);
        return game;
    }

    // 개발 카드 설정
    setupDevelopmentCards(game) {
        const level1Cards = this.cardData.filter(card => card.level === 1);
        const level2Cards = this.cardData.filter(card => card.level === 2);
        const level3Cards = this.cardData.filter(card => card.level === 3);

        game.developmentCards = {
            level1: this.shuffleArray([...level1Cards]).slice(0, 4),
            level2: this.shuffleArray([...level2Cards]).slice(0, 4),
            level3: this.shuffleArray([...level3Cards]).slice(0, 4)
        };
    }

    // 귀족 타일 설정
    setupNobleTiles(game) {
        const allNobles = [
            { prestige: 3, requirements: { sapphire: 4, emerald: 4, ruby: 0, diamond: 0, onyx: 0 } },
            { prestige: 3, requirements: { sapphire: 0, emerald: 0, ruby: 4, diamond: 4, onyx: 0 } },
            { prestige: 3, requirements: { sapphire: 0, emerald: 4, ruby: 0, diamond: 0, onyx: 4 } },
            { prestige: 3, requirements: { sapphire: 4, emerald: 0, ruby: 0, diamond: 0, onyx: 4 } },
            { prestige: 3, requirements: { sapphire: 0, emerald: 0, ruby: 0, diamond: 4, onyx: 4 } }
        ];

        game.nobleTiles = this.shuffleArray([...allNobles]).slice(0, 5);
    }

    // 배열 섞기
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 플레이어 추가
    addPlayer(gameId, playerId, playerName) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        if (game.players.length >= 4) {
            throw new Error('게임이 가득 찼습니다.');
        }

        const player = {
            id: playerId,
            name: playerName,
            tokens: { diamond: 0, emerald: 0, ruby: 0, onyx: 0, sapphire: 0, gold: 0 },
            ownedCards: [],
            reservedCards: [],
            prestige: 0
        };

        game.players.push(player);
        this.players.set(playerId, { gameId, playerName });

        console.log(`플레이어 추가됨: ${playerName} (${playerId})`);
        return player;
    }

    // 플레이어 제거
    removePlayer(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game) return;

        game.players = game.players.filter(p => p.id !== playerId);
        this.players.delete(playerId);

        if (game.players.length === 0) {
            this.games.delete(gameId);
            console.log(`게임 삭제됨: ${gameId}`);
        }
    }

    // 게임 시작
    startGame(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        if (game.players.length < 2) {
            throw new Error('게임을 시작하려면 최소 2명의 플레이어가 필요합니다.');
        }

        game.gameStarted = true;
        game.currentPlayer = 0;
        console.log(`게임 시작됨: ${gameId}`);
        return game;
    }

    // 토큰 선택
    selectToken(gameId, playerId, gem) {
        const game = this.games.get(gameId);
        if (!game || !game.gameStarted) {
            throw new Error('게임이 시작되지 않았습니다.');
        }

        const currentPlayer = game.players[game.currentPlayer];
        if (currentPlayer.id !== playerId) {
            throw new Error('당신의 턴이 아닙니다.');
        }

        if (game.availableTokens[gem] <= 0) {
            throw new Error('해당 토큰이 부족합니다.');
        }

        // 선택된 토큰 관리
        if (!currentPlayer.selectedTokens) {
            currentPlayer.selectedTokens = [];
        }

        currentPlayer.selectedTokens.push(gem);
        game.availableTokens[gem]--;

        return game;
    }

    // 토큰 선택 취소
    cancelTokenSelection(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game || !game.gameStarted) {
            throw new Error('게임이 시작되지 않았습니다.');
        }

        const currentPlayer = game.players[game.currentPlayer];
        if (currentPlayer.id !== playerId) {
            throw new Error('당신의 턴이 아닙니다.');
        }

        // 선택된 토큰들을 다시 풀로 반환
        if (currentPlayer.selectedTokens) {
            currentPlayer.selectedTokens.forEach(gem => {
                game.availableTokens[gem]++;
            });
            currentPlayer.selectedTokens = [];
        }

        return game;
    }

    // 토큰 획득 확인
    confirmTakeTokens(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game || !game.gameStarted) {
            throw new Error('게임이 시작되지 않았습니다.');
        }

        const currentPlayer = game.players[game.currentPlayer];
        if (currentPlayer.id !== playerId) {
            throw new Error('당신의 턴이 아닙니다.');
        }

        if (!currentPlayer.selectedTokens || currentPlayer.selectedTokens.length === 0) {
            throw new Error('선택된 토큰이 없습니다.');
        }

        // 토큰 획득
        currentPlayer.selectedTokens.forEach(gem => {
            currentPlayer.tokens[gem]++;
        });

        currentPlayer.selectedTokens = [];
        return game;
    }

    // 카드 구매
    buyCard(gameId, playerId, cardId, level) {
        const game = this.games.get(gameId);
        if (!game || !game.gameStarted) {
            throw new Error('게임이 시작되지 않았습니다.');
        }

        const currentPlayer = game.players[game.currentPlayer];
        if (currentPlayer.id !== playerId) {
            throw new Error('당신의 턴이 아닙니다.');
        }

        // 카드 찾기
        const card = game.developmentCards[`level${level}`].find(c => c.id === cardId);
        if (!card) {
            throw new Error('카드를 찾을 수 없습니다.');
        }

        // 비용 계산 (보너스 보석 적용)
        const playerBonus = this.getPlayerBonus(currentPlayer);
        const totalCost = { ...card.cost };
        
        Object.keys(totalCost).forEach(gem => {
            const bonus = playerBonus[gem] || 0;
            totalCost[gem] = Math.max(0, totalCost[gem] - bonus);
        });

        // 토큰으로 지불 가능한지 확인
        const canAfford = Object.keys(totalCost).every(gem => 
            currentPlayer.tokens[gem] >= totalCost[gem]
        );

        if (!canAfford) {
            throw new Error('카드를 구매할 수 있는 토큰이 부족합니다.');
        }

        // 토큰 지불
        Object.keys(totalCost).forEach(gem => {
            currentPlayer.tokens[gem] -= totalCost[gem];
            game.availableTokens[gem] += totalCost[gem];
        });

        // 카드 획득
        currentPlayer.ownedCards.push(card);
        currentPlayer.prestige += card.prestige;

        // 카드 제거 및 새 카드 추가
        this.removeCardAndAddNew(game, level, cardId);

        return game;
    }

    // 카드 예약
    reserveCard(gameId, playerId, cardId, level) {
        const game = this.games.get(gameId);
        if (!game || !game.gameStarted) {
            throw new Error('게임이 시작되지 않았습니다.');
        }

        const currentPlayer = game.players[game.currentPlayer];
        if (currentPlayer.id !== playerId) {
            throw new Error('당신의 턴이 아닙니다.');
        }

        if (currentPlayer.reservedCards.length >= 3) {
            throw new Error('예약할 수 있는 카드는 최대 3장입니다.');
        }

        // 카드 찾기
        const card = game.developmentCards[`level${level}`].find(c => c.id === cardId);
        if (!card) {
            throw new Error('카드를 찾을 수 없습니다.');
        }

        // 카드 예약
        currentPlayer.reservedCards.push(card);

        // 황금 토큰 1개 획득 (가능한 경우)
        if (game.availableTokens.gold > 0) {
            currentPlayer.tokens.gold++;
            game.availableTokens.gold--;
        }

        // 카드 제거 및 새 카드 추가
        this.removeCardAndAddNew(game, level, cardId);

        return game;
    }

    // 카드 제거 및 새 카드 추가
    removeCardAndAddNew(game, level, cardId) {
        const levelKey = `level${level}`;
        const cardIndex = game.developmentCards[levelKey].findIndex(c => c.id === cardId);
        
        if (cardIndex !== -1) {
            game.developmentCards[levelKey].splice(cardIndex, 1);
            
            // 새 카드 추가
            const availableCards = this.cardData.filter(card => 
                card.level === level && 
                !game.players.some(player => 
                    player.ownedCards.some(owned => owned.id === card.id) ||
                    player.reservedCards.some(reserved => reserved.id === card.id)
                )
            );

            if (availableCards.length > 0) {
                const newCard = this.shuffleArray([...availableCards])[0];
                game.developmentCards[levelKey].push(newCard);
            }
        }
    }

    // 플레이어 보너스 계산
    getPlayerBonus(player) {
        const bonus = { diamond: 0, emerald: 0, ruby: 0, onyx: 0, sapphire: 0 };
        
        player.ownedCards.forEach(card => {
            bonus[card.bonus]++;
        });
        
        return bonus;
    }

    // 턴 종료
    endTurn(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game || !game.gameStarted) {
            throw new Error('게임이 시작되지 않았습니다.');
        }

        const currentPlayer = game.players[game.currentPlayer];
        if (currentPlayer.id !== playerId) {
            throw new Error('당신의 턴이 아닙니다.');
        }

        // 선택된 토큰 초기화
        if (currentPlayer.selectedTokens) {
            currentPlayer.selectedTokens = [];
        }

        // 다음 플레이어로 턴 변경
        game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

        // 귀족 방문 확인
        this.checkNobleVisits(game);

        // 승리 조건 확인
        this.checkWinCondition(game);

        return game;
    }

    // 귀족 방문 확인
    checkNobleVisits(game) {
        game.players.forEach(player => {
            const playerBonus = this.getPlayerBonus(player);
            
            game.nobleTiles.forEach((noble, index) => {
                const canVisit = Object.keys(noble.requirements).every(gem => 
                    playerBonus[gem] >= noble.requirements[gem]
                );
                
                if (canVisit) {
                    player.prestige += noble.prestige;
                    game.nobleTiles.splice(index, 1);
                    console.log(`${player.name}이(가) 귀족을 방문했습니다!`);
                }
            });
        });
    }

    // 승리 조건 확인
    checkWinCondition(game) {
        game.players.forEach(player => {
            if (player.prestige >= 15) {
                game.gameEnded = true;
                game.winner = player.id;
                console.log(`게임 종료! 승자: ${player.name}`);
            }
        });
    }

    // 게임 상태 가져오기
    getGameState(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('게임을 찾을 수 없습니다.');
        }

        return {
            id: game.id,
            players: game.players.map(player => ({
                ...player,
                selectedTokens: player.selectedTokens || []
            })),
            currentPlayer: game.currentPlayer,
            availableTokens: game.availableTokens,
            developmentCards: game.developmentCards,
            nobleTiles: game.nobleTiles,
            gameStarted: game.gameStarted,
            gameEnded: game.gameEnded,
            winner: game.winner
        };
    }
}

module.exports = GameManager;
