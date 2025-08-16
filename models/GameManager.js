const fs = require('fs').promises;
const path = require('path');

class GameManager {
  constructor() {
    this.games = new Map(); // 게임 인스턴스들을 저장
    this.players = new Map(); // 플레이어 정보를 저장 (socketId -> playerInfo)
    this.cardData = []; // 카드 데이터
    this.loadCardData();
  }

  // CSV 파일에서 카드 데이터 로드
  async loadCardData() {
    try {
      const csvPath = path.join(__dirname, '../../splendor_card.csv');
      const csvData = await fs.readFile(csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');
      
      // 헤더 제거
      const headers = lines[0].split(',');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const card = {
          id: i,
          level: parseInt(values[0]),
          prestigePoints: parseInt(values[1]),
          bonus: this.mapKoreanToEnglish(values[2]),
          cost: {
            sapphire: parseInt(values[3]) || 0,
            emerald: parseInt(values[4]) || 0,
            ruby: parseInt(values[5]) || 0,
            diamond: parseInt(values[6]) || 0,
            onyx: parseInt(values[7]) || 0
          }
        };
        this.cardData.push(card);
      }
    } catch (error) {
      console.error('카드 데이터 로드 실패:', error);
      // 기본 카드 데이터 생성
      this.createDefaultCardData();
    }
  }

  // 한국어 보석명을 영어로 매핑
  mapKoreanToEnglish(koreanName) {
    const mapping = {
      '사파이어': 'sapphire',
      '에메랄드': 'emerald',
      '루비': 'ruby',
      '다이아몬드': 'diamond',
      '오닉스': 'onyx'
    };
    return mapping[koreanName] || koreanName;
  }

  // 기본 카드 데이터 생성 (CSV 파일이 없을 경우)
  createDefaultCardData() {
    const gems = ['sapphire', 'emerald', 'ruby', 'diamond', 'onyx'];
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 10; i++) {
        const card = {
          id: this.cardData.length + 1,
          level: level,
          prestigePoints: Math.floor(Math.random() * 5) + 1,
          bonus: gems[Math.floor(Math.random() * gems.length)],
          cost: {
            sapphire: Math.floor(Math.random() * 4),
            emerald: Math.floor(Math.random() * 4),
            ruby: Math.floor(Math.random() * 4),
            diamond: Math.floor(Math.random() * 4),
            onyx: Math.floor(Math.random() * 4)
          }
        };
        this.cardData.push(card);
      }
    }
  }

  // 새 게임 생성
  createGame(gameId, playerIds) {
    const game = {
      id: gameId,
      players: playerIds.map((id, index) => ({
        id: id,
        name: `플레이어 ${index + 1}`,
        tokens: {
          sapphire: 0,
          emerald: 0,
          ruby: 0,
          diamond: 0,
          onyx: 0,
          gold: 0
        },
        cards: [],
        reservedCards: [],
        prestigePoints: 0
      })),
      currentPlayerIndex: 0,
      availableTokens: {
        sapphire: 4,
        emerald: 4,
        ruby: 4,
        diamond: 4,
        onyx: 4,
        gold: 5
      },
      developmentCards: this.setupDevelopmentCards(),
      nobleTiles: this.setupNobleTiles(),
      status: 'waiting', // waiting, active, finished
      selectedTokens: [],
      selectedCard: null,
      actionCompleted: false,
      createdAt: new Date()
    };

    this.games.set(gameId, game);
    return game;
  }

  // 개발 카드 설정
  setupDevelopmentCards() {
    const cards = { 1: [], 2: [], 3: [] };
    
    // 레벨별로 카드 분류
    this.cardData.forEach(card => {
      cards[card.level].push(card);
    });

    // 각 레벨에서 4장씩 랜덤 선택
    const selectedCards = {};
    [1, 2, 3].forEach(level => {
      const shuffled = this.shuffleArray([...cards[level]]);
      selectedCards[level] = shuffled.slice(0, 4);
    });

    return selectedCards;
  }

  // 귀족 타일 설정
  setupNobleTiles() {
    const nobles = [
      { id: 1, prestigePoints: 3, requirements: { sapphire: 4, emerald: 4 } },
      { id: 2, prestigePoints: 3, requirements: { ruby: 4, diamond: 4 } },
      { id: 3, prestigePoints: 3, requirements: { onyx: 4, sapphire: 4 } },
      { id: 4, prestigePoints: 3, requirements: { emerald: 4, ruby: 4 } },
      { id: 5, prestigePoints: 3, requirements: { diamond: 4, onyx: 4 } }
    ];
    
    return this.shuffleArray(nobles).slice(0, 3);
  }

  // 배열 셔플
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 게임 가져오기
  getGame(gameId) {
    return this.games.get(gameId);
  }

  // 플레이어 추가
  addPlayer(socketId, playerName) {
    this.players.set(socketId, {
      id: socketId,
      name: playerName,
      gameId: null
    });
    return this.players.get(socketId);
  }

  // 플레이어 제거
  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player && player.gameId) {
      const game = this.games.get(player.gameId);
      if (game) {
        // 게임에서 플레이어 제거
        game.players = game.players.filter(p => p.id !== socketId);
        if (game.players.length === 0) {
          this.games.delete(player.gameId);
        }
      }
    }
    this.players.delete(socketId);
  }

  // 토큰 선택
  selectToken(gameId, playerId, gem) {
    const game = this.getGame(gameId);
    if (!game || game.status !== 'active') return false;

    const player = game.players.find(p => p.id === playerId);
    if (!player || game.players[game.currentPlayerIndex].id !== playerId) return false;

    // 토큰 선택 규칙 검증
    if (game.selectedTokens.length >= 3) return false;
    
    const availableCount = game.availableTokens[gem];
    if (availableCount <= 0) return false;

    // 같은 보석을 2개 선택하려는 경우
    const sameGemCount = game.selectedTokens.filter(token => token === gem).length;
    if (sameGemCount >= 1) {
      if (availableCount < 3) return false; // 3개 미만이면 2개 선택 불가
    }

    game.selectedTokens.push(gem);
    return true;
  }

  // 토큰 선택 취소
  cancelTokenSelection(gameId, playerId) {
    const game = this.getGame(gameId);
    if (!game) return false;

    const player = game.players.find(p => p.id === playerId);
    if (!player || game.players[game.currentPlayerIndex].id !== playerId) return false;

    game.selectedTokens = [];
    game.selectedCard = null;
    game.actionCompleted = false;
    return true;
  }

  // 토큰 획득 확인
  confirmTakeTokens(gameId, playerId) {
    const game = this.getGame(gameId);
    if (!game || game.status !== 'active') return false;

    const player = game.players.find(p => p.id === playerId);
    if (!player || game.players[game.currentPlayerIndex].id !== playerId) return false;

    // 토큰 선택 유효성 검사
    if (!this.validateTokenSelection(game.selectedTokens, game.availableTokens)) return false;

    // 토큰 전송
    game.selectedTokens.forEach(gem => {
      game.availableTokens[gem]--;
      player.tokens[gem]++;
    });

    game.selectedTokens = [];
    game.actionCompleted = true;
    return true;
  }

  // 토큰 선택 유효성 검사
  validateTokenSelection(selectedTokens, availableTokens) {
    if (selectedTokens.length === 0) return false;
    if (selectedTokens.length > 3) return false;

    const tokenCounts = {};
    selectedTokens.forEach(token => {
      tokenCounts[token] = (tokenCounts[token] || 0) + 1;
    });

    // 같은 보석 2개 선택 시 검증
    for (const [gem, count] of Object.entries(tokenCounts)) {
      if (count === 2 && availableTokens[gem] < 3) return false;
    }

    return true;
  }

  // 카드 구매
  buyCard(gameId, playerId, cardId, level) {
    const game = this.getGame(gameId);
    if (!game || game.status !== 'active') return false;

    const player = game.players.find(p => p.id === playerId);
    if (!player || game.players[game.currentPlayerIndex].id !== playerId) return false;

    const card = game.developmentCards[level].find(c => c.id === cardId);
    if (!card) return false;

    // 비용 계산 (보너스 보석 적용)
    const playerBonus = this.getPlayerBonus(player);
    const actualCost = {};
    for (const [gem, cost] of Object.entries(card.cost)) {
      const bonus = playerBonus[gem] || 0;
      actualCost[gem] = Math.max(0, cost - bonus);
    }

    // 플레이어가 충분한 토큰을 가지고 있는지 확인
    for (const [gem, cost] of Object.entries(actualCost)) {
      if (player.tokens[gem] < cost) return false;
    }

    // 토큰 지불
    for (const [gem, cost] of Object.entries(actualCost)) {
      player.tokens[gem] -= cost;
      game.availableTokens[gem] += cost;
    }

    // 카드 획득
    player.cards.push(card);
    player.prestigePoints += card.prestigePoints;

    // 카드 제거 및 새 카드 추가
    game.developmentCards[level] = game.developmentCards[level].filter(c => c.id !== cardId);
    this.addNewCard(game, level);

    game.selectedCard = null;
    game.actionCompleted = true;

    // 귀족 방문 확인
    this.checkNobleVisits(game, player);

    return true;
  }

  // 카드 예약
  reserveCard(gameId, playerId, cardId, level) {
    const game = this.getGame(gameId);
    if (!game || game.status !== 'active') return false;

    const player = game.players.find(p => p.id === playerId);
    if (!player || game.players[game.currentPlayerIndex].id !== playerId) return false;

    if (player.reservedCards.length >= 3) return false;

    const card = game.developmentCards[level].find(c => c.id === cardId);
    if (!card) return false;

    // 카드 예약
    player.reservedCards.push(card);
    
    // 금 토큰 획득 (가능한 경우)
    if (game.availableTokens.gold > 0) {
      player.tokens.gold++;
      game.availableTokens.gold--;
    }

    // 카드 제거 및 새 카드 추가
    game.developmentCards[level] = game.developmentCards[level].filter(c => c.id !== cardId);
    this.addNewCard(game, level);

    game.selectedCard = null;
    game.actionCompleted = true;

    return true;
  }

  // 새 카드 추가
  addNewCard(game, level) {
    const availableCards = this.cardData.filter(card => 
      card.level === level &&
      !game.players.some(player => 
        player.cards.some(ownedCard => ownedCard.id === card.id) ||
        player.reservedCards.some(reservedCard => reservedCard.id === card.id)
      ) &&
      !game.developmentCards[level].some(displayedCard => displayedCard.id === card.id)
    );

    if (availableCards.length > 0) {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      game.developmentCards[level].push(randomCard);
    }
  }

  // 플레이어 보너스 보석 계산
  getPlayerBonus(player) {
    const bonus = { sapphire: 0, emerald: 0, ruby: 0, diamond: 0, onyx: 0 };
    player.cards.forEach(card => {
      bonus[card.bonus]++;
    });
    return bonus;
  }

  // 귀족 방문 확인
  checkNobleVisits(game, player) {
    const playerBonus = this.getPlayerBonus(player);
    
    for (let i = game.nobleTiles.length - 1; i >= 0; i--) {
      const noble = game.nobleTiles[i];
      let canVisit = true;
      
      for (const [gem, required] of Object.entries(noble.requirements)) {
        if (playerBonus[gem] < required) {
          canVisit = false;
          break;
        }
      }
      
      if (canVisit) {
        player.prestigePoints += noble.prestigePoints;
        game.nobleTiles.splice(i, 1);
        break; // 한 번에 하나의 귀족만 방문 가능
      }
    }
  }

  // 턴 종료
  endTurn(gameId, playerId) {
    const game = this.getGame(gameId);
    if (!game || game.status !== 'active') return false;

    const player = game.players.find(p => p.id === playerId);
    if (!player || game.players[game.currentPlayerIndex].id !== playerId) return false;

    // 다음 플레이어로 턴 변경
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    
    // 상태 초기화
    game.selectedTokens = [];
    game.selectedCard = null;
    game.actionCompleted = false;

    // 승리 조건 확인
    if (player.prestigePoints >= 15) {
      game.status = 'finished';
    }

    return true;
  }

  // 게임 상태 가져오기
  getGameState(gameId) {
    const game = this.getGame(gameId);
    if (!game) return null;

    return {
      id: game.id,
      status: game.status,
      currentPlayerIndex: game.currentPlayerIndex,
      players: game.players.map(player => ({
        id: player.id,
        name: player.name,
        tokens: player.tokens,
        cards: player.cards,
        reservedCards: player.reservedCards,
        prestigePoints: player.prestigePoints,
        bonus: this.getPlayerBonus(player)
      })),
      availableTokens: game.availableTokens,
      developmentCards: game.developmentCards,
      nobleTiles: game.nobleTiles,
      selectedTokens: game.selectedTokens,
      selectedCard: game.selectedCard,
      actionCompleted: game.actionCompleted
    };
  }
}

module.exports = GameManager;
