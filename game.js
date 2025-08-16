// 게임 상태
let gameState = {
    currentPlayer: 1,
    players: {
        1: {
            tokens: { sapphire: 0, emerald: 0, ruby: 0, diamond: 0, onyx: 0, gold: 0 },
            cards: [],
            reservedCards: [],
            prestigePoints: 0
        },
        2: {
            tokens: { sapphire: 0, emerald: 0, ruby: 0, diamond: 0, onyx: 0, gold: 0 },
            cards: [],
            reservedCards: [],
            prestigePoints: 0
        }
    },
    availableTokens: { sapphire: 5, emerald: 5, ruby: 5, diamond: 5, onyx: 5, gold: 5 },
    developmentCards: [],
    nobleTiles: [],
    currentAction: null,
    selectedTokens: [],
    selectedCard: null,
    modalSelectedTokens: []
};

// 카드 데이터
let cardData = [];

// 게임 초기화
async function initGame() {
    await loadCardData();
    setupNobleTiles();
    setupDevelopmentCards();
    updateDisplay();
    addLogEntry("게임이 시작되었습니다!");
}

// CSV 파일에서 카드 데이터 로드
async function loadCardData() {
    try {
        const response = await fetch('splendor_card.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        // 헤더 제거
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const values = line.split(',');
                if (values.length >= 8) {
                    const card = {
                        level: parseInt(values[0].replace('레벨 ', '')),
                        prestige: parseInt(values[1]),
                        bonus: values[2],
                        cost: {
                            diamond: parseInt(values[3]),
                            emerald: parseInt(values[4]),
                            ruby: parseInt(values[5]),
                            onyx: parseInt(values[6]),
                            sapphire: parseInt(values[7])
                        }
                    };
                    cardData.push(card);
                }
            }
        }
        console.log('카드 데이터 로드 완료:', cardData.length, '장');
    } catch (error) {
        console.error('카드 데이터 로드 실패:', error);
        // 기본 카드 데이터로 대체
        cardData = getDefaultCardData();
    }
}

// 기본 카드 데이터 (CSV 로드 실패시 사용)
function getDefaultCardData() {
    return [
        { level: 1, prestige: 0, bonus: 'sapphire', cost: { diamond: 1, emerald: 1, ruby: 1, onyx: 1, sapphire: 0 } },
        { level: 1, prestige: 0, bonus: 'diamond', cost: { diamond: 0, emerald: 0, ruby: 2, onyx: 2, sapphire: 0 } },
        { level: 1, prestige: 0, bonus: 'sapphire', cost: { diamond: 0, emerald: 3, ruby: 0, onyx: 0, sapphire: 0 } },
        { level: 2, prestige: 1, bonus: 'emerald', cost: { diamond: 3, emerald: 0, ruby: 2, onyx: 0, sapphire: 0 } },
        { level: 2, prestige: 2, bonus: 'ruby', cost: { diamond: 0, emerald: 1, ruby: 0, onyx: 2, sapphire: 4 } },
        { level: 3, prestige: 3, bonus: 'onyx', cost: { diamond: 3, emerald: 3, ruby: 3, onyx: 0, sapphire: 3 } },
        { level: 3, prestige: 4, bonus: 'diamond', cost: { diamond: 0, emerald: 7, ruby: 0, onyx: 0, sapphire: 0 } }
    ];
}

// 귀족 타일 설정
function setupNobleTiles() {
    const allNobles = [
        { prestige: 3, requirements: { sapphire: 4, emerald: 4, ruby: 0, diamond: 0, onyx: 0 } },
        { prestige: 3, requirements: { sapphire: 0, emerald: 0, ruby: 4, diamond: 4, onyx: 0 } },
        { prestige: 3, requirements: { sapphire: 0, emerald: 4, ruby: 0, diamond: 0, onyx: 4 } },
        { prestige: 3, requirements: { sapphire: 4, emerald: 0, ruby: 0, diamond: 0, onyx: 4 } },
        { prestige: 3, requirements: { sapphire: 0, emerald: 0, ruby: 0, diamond: 4, onyx: 4 } },
        { prestige: 3, requirements: { sapphire: 3, emerald: 3, ruby: 3, diamond: 0, onyx: 0 } },
        { prestige: 3, requirements: { sapphire: 0, emerald: 0, ruby: 3, diamond: 3, onyx: 3 } },
        { prestige: 3, requirements: { sapphire: 3, emerald: 0, ruby: 0, diamond: 3, onyx: 3 } }
    ];
    
    // 귀족 타일 섞기
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    const shuffledNobles = shuffleArray([...allNobles]);
    gameState.nobleTiles = shuffledNobles.slice(0, 5); // 5개만 선택
}

// 개발 카드 설정
function setupDevelopmentCards() {
    gameState.developmentCards = [];
    
    // 각 레벨별로 카드 섞기
    const level1Cards = cardData.filter(card => card.level === 1);
    const level2Cards = cardData.filter(card => card.level === 2);
    const level3Cards = cardData.filter(card => card.level === 3);
    
    // 카드 섞기 함수
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 각 레벨에서 4장씩 랜덤 선택
    const shuffledLevel1 = shuffleArray([...level1Cards]);
    const shuffledLevel2 = shuffleArray([...level2Cards]);
    const shuffledLevel3 = shuffleArray([...level3Cards]);
    
    for (let i = 0; i < 4; i++) {
        if (shuffledLevel1.length > i) gameState.developmentCards.push(shuffledLevel1[i]);
        if (shuffledLevel2.length > i) gameState.developmentCards.push(shuffledLevel2[i]);
        if (shuffledLevel3.length > i) gameState.developmentCards.push(shuffledLevel3[i]);
    }
}

// 턴 종료
function endTurn() {
    // 선택된 토큰이 있으면 플레이어에게 추가
    if (gameState.selectedTokens.length > 0) {
        const player = gameState.players[gameState.currentPlayer];
        gameState.selectedTokens.forEach(gem => {
            player.tokens[gem]++;
        });
        
        addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) ${gameState.selectedTokens.map(gem => getGemName(gem)).join(', ')} 토큰을 획득했습니다.`);
    }
    
    gameState.currentAction = null;
    gameState.selectedTokens = [];
    gameState.selectedCard = null;
    
    // 귀족 방문 확인
    checkNobleVisits();
    
    // 승리 조건 확인
    if (gameState.players[gameState.currentPlayer].prestigePoints >= 15) {
        endGame();
        return;
    }
    
    // 다음 플레이어로 턴 변경
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    
    addLogEntry(`플레이어 ${gameState.currentPlayer === 1 ? 2 : 1}의 턴이 종료되었습니다.`);
    addLogEntry(`플레이어 ${gameState.currentPlayer}의 턴이 시작되었습니다.`);
    updateDisplay();
}

// 귀족 방문 확인
function checkNobleVisits() {
    const player = gameState.players[gameState.currentPlayer];
    const playerBonus = getPlayerBonus(player);
    
    gameState.nobleTiles = gameState.nobleTiles.filter(noble => {
        let canVisit = true;
        Object.entries(noble.requirements).forEach(([gem, required]) => {
            if (playerBonus[gem] < required) {
                canVisit = false;
            }
        });
        
        if (canVisit) {
            player.prestigePoints += noble.prestige;
            addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) 귀족을 방문하여 ${noble.prestige}점을 획득했습니다!`);
            return false; // 귀족 제거
        }
        return true;
    });
}

// 플레이어 보너스 계산
function getPlayerBonus(player) {
    const bonus = { sapphire: 0, emerald: 0, ruby: 0, diamond: 0, onyx: 0 };
    player.cards.forEach(card => {
        bonus[card.bonus]++;
    });
    return bonus;
}

// 게임 종료
function endGame() {
    addLogEntry(`🎉 플레이어 ${gameState.currentPlayer}이(가) 승리했습니다!`);
    document.getElementById('end-turn-btn').disabled = true;
    document.getElementById('take-tokens-btn').disabled = true;
    document.getElementById('buy-card-btn').disabled = true;
    document.getElementById('reserve-card-btn').disabled = true;
}

// 새 게임 시작
function startNewGame() {
    // 게임 상태 초기화
    gameState = {
        currentPlayer: 1,
        players: {
            1: {
                tokens: { sapphire: 0, emerald: 0, ruby: 0, diamond: 0, onyx: 0, gold: 0 },
                cards: [],
                reservedCards: [],
                prestigePoints: 0
            },
            2: {
                tokens: { sapphire: 0, emerald: 0, ruby: 0, diamond: 0, onyx: 0, gold: 0 },
                cards: [],
                reservedCards: [],
                prestigePoints: 0
            }
        },
        availableTokens: { sapphire: 5, emerald: 5, ruby: 5, diamond: 5, onyx: 5, gold: 5 },
        developmentCards: [],
        nobleTiles: [],
        currentAction: null,
        selectedTokens: [],
        selectedCard: null,
        modalSelectedTokens: []
    };
    
    // 게임 재설정
    setupNobleTiles();
    setupDevelopmentCards();
    
    // 버튼 활성화
    document.getElementById('end-turn-btn').disabled = false;
    document.getElementById('take-tokens-btn').disabled = false;
    document.getElementById('buy-card-btn').disabled = false;
    document.getElementById('reserve-card-btn').disabled = false;
    
    // 로그 초기화
    document.getElementById('log-content').innerHTML = '';
    
    updateDisplay();
    addLogEntry("새 게임이 시작되었습니다!");
}

// 보석 이름 가져오기
function getGemName(gem) {
    const names = {
        sapphire: '사파이어',
        emerald: '에메랄드',
        ruby: '루비',
        diamond: '다이아몬드',
        onyx: '오닉스',
        gold: '금'
    };
    return names[gem] || gem;
}
