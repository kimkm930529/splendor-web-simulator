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
    selectedCard: null
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

// 화면 업데이트
function updateDisplay() {
    updateTokenDisplay();
    updateCardDisplay();
    updateNobleDisplay();
    updatePlayerDisplay();
    updateGameInfo();
    updateMainSelectedTokensDisplay();
    updateButtonStates();
}

// 토큰 표시 업데이트
function updateTokenDisplay() {
    document.getElementById('sapphire-count').textContent = gameState.availableTokens.sapphire;
    document.getElementById('emerald-count').textContent = gameState.availableTokens.emerald;
    document.getElementById('ruby-count').textContent = gameState.availableTokens.ruby;
    document.getElementById('diamond-count').textContent = gameState.availableTokens.diamond;
    document.getElementById('onyx-count').textContent = gameState.availableTokens.onyx;
    document.getElementById('gold-count').textContent = gameState.availableTokens.gold;
}

// 카드 표시 업데이트
function updateCardDisplay() {
    const level1Container = document.getElementById('level-1-cards');
    const level2Container = document.getElementById('level-2-cards');
    const level3Container = document.getElementById('level-3-cards');
    
    level1Container.innerHTML = '';
    level2Container.innerHTML = '';
    level3Container.innerHTML = '';
    
    gameState.developmentCards.forEach(card => {
        const cardElement = createCardElement(card);
        if (card.level === 1) level1Container.appendChild(cardElement);
        else if (card.level === 2) level2Container.appendChild(cardElement);
        else if (card.level === 3) level3Container.appendChild(cardElement);
    });
}

// 카드 요소 생성
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `development-card card-level-${card.level}`;
    cardDiv.dataset.cardIndex = gameState.developmentCards.indexOf(card);
    
    // 명성 점수
    if (card.prestige > 0) {
        const prestigeDiv = document.createElement('div');
        prestigeDiv.className = 'card-prestige';
        prestigeDiv.textContent = card.prestige;
        cardDiv.appendChild(prestigeDiv);
    }
    
    // 보너스 보석
    const bonusDiv = document.createElement('div');
    bonusDiv.className = `card-bonus ${card.bonus}`;
    cardDiv.appendChild(bonusDiv);
    
    // 비용
    const costDiv = document.createElement('div');
    costDiv.className = 'card-cost';
    
    Object.entries(card.cost).forEach(([gem, count]) => {
        if (count > 0) {
            const costItem = document.createElement('div');
            costItem.className = 'cost-item';
            costItem.innerHTML = `
                <div class="cost-gem ${gem}"></div>
                <span>${count}</span>
            `;
            costDiv.appendChild(costItem);
        }
    });
    
    cardDiv.appendChild(costDiv);
    
    // 클릭 이벤트
    cardDiv.addEventListener('click', () => selectCard(card));
    
    return cardDiv;
}

// 귀족 타일 표시 업데이트
function updateNobleDisplay() {
    const nobleContainer = document.getElementById('noble-display');
    nobleContainer.innerHTML = '';
    
    gameState.nobleTiles.forEach(noble => {
        const nobleDiv = document.createElement('div');
        nobleDiv.className = 'noble-tile';
        
        const prestigeDiv = document.createElement('div');
        prestigeDiv.className = 'noble-prestige';
        prestigeDiv.textContent = `⭐ ${noble.prestige}`;
        
        const requirementsDiv = document.createElement('div');
        requirementsDiv.className = 'noble-requirements';
        
        Object.entries(noble.requirements).forEach(([gem, count]) => {
            if (count > 0) {
                const gemDiv = document.createElement('div');
                gemDiv.className = `token ${gem}`;
                gemDiv.style.width = '30px';
                gemDiv.style.height = '30px';
                gemDiv.textContent = count;
                requirementsDiv.appendChild(gemDiv);
            }
        });
        
        nobleDiv.appendChild(prestigeDiv);
        nobleDiv.appendChild(requirementsDiv);
        nobleContainer.appendChild(nobleDiv);
    });
}

// 플레이어 표시 업데이트
function updatePlayerDisplay() {
    // 플레이어 1 표시
    updateSinglePlayerDisplay(1);
    // 플레이어 2 표시
    updateSinglePlayerDisplay(2);
    
    // 현재 플레이어 하이라이트
    document.getElementById('player1-area').classList.toggle('current-player', gameState.currentPlayer === 1);
    document.getElementById('player2-area').classList.toggle('current-player', gameState.currentPlayer === 2);
}

// 개별 플레이어 표시 업데이트
function updateSinglePlayerDisplay(playerNum) {
    const player = gameState.players[playerNum];
    
    // 소유한 카드
    const ownedCardsContainer = document.getElementById(`player${playerNum}-owned-cards`);
    ownedCardsContainer.innerHTML = '';
    player.cards.forEach(card => {
        const cardElement = createCardElement(card);
        cardElement.style.transform = 'scale(0.6)';
        ownedCardsContainer.appendChild(cardElement);
    });
    
    // 플레이어 토큰
    const playerTokenContainer = document.getElementById(`player${playerNum}-token-display`);
    playerTokenContainer.innerHTML = '';
    
    Object.entries(player.tokens).forEach(([gem, count]) => {
        if (count > 0) {
            const tokenGroup = document.createElement('div');
            tokenGroup.className = 'token-group';
            tokenGroup.innerHTML = `
                <div class="token ${gem}" style="width: 30px; height: 30px; font-size: 0.8em;">
                    <span class="token-count">${count}</span>
                </div>
                <span style="font-size: 0.7em;">${getGemName(gem)}</span>
            `;
            playerTokenContainer.appendChild(tokenGroup);
        }
    });
    
    // 예약된 카드
    const reservedContainer = document.getElementById(`player${playerNum}-reserved-display`);
    reservedContainer.innerHTML = '';
    player.reservedCards.forEach(card => {
        const cardElement = createCardElement(card);
        cardElement.style.transform = 'scale(0.6)';
        cardElement.style.borderColor = '#ffd700';
        if (playerNum === gameState.currentPlayer) {
            cardElement.addEventListener('click', () => selectReservedCard(card));
        }
        reservedContainer.appendChild(cardElement);
    });
}

// 게임 정보 업데이트
function updateGameInfo() {
    const player1 = gameState.players[1];
    const player2 = gameState.players[2];
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    document.getElementById('player-name').textContent = `플레이어 ${gameState.currentPlayer}`;
    document.getElementById('points').textContent = currentPlayer.prestigePoints;
    
    // 플레이어별 점수 표시 업데이트
    document.querySelector('#player1-area h3').textContent = `플레이어 1 (${player1.prestigePoints}점)`;
    document.querySelector('#player2-area h3').textContent = `플레이어 2 (${player2.prestigePoints}점)`;
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

// 카드 선택
function selectCard(card) {
    if (gameState.currentAction === 'buy') {
        gameState.selectedCard = card;
        updateDisplay();
        showBuyCardModal();
    } else if (gameState.currentAction === 'reserve') {
        reserveCard(card);
    }
}

// 예약된 카드 선택 (구매용)
function selectReservedCard(card) {
    if (gameState.currentAction === 'buy') {
        gameState.selectedCard = card;
        updateDisplay();
        showBuyCardModal();
    }
}

// 모달 내부에서 토큰 선택
function selectTokenInModal(gem) {
    // 황금 토큰은 선택할 수 없음
    if (gem === 'gold') return;
    
    const currentGemCount = gameState.modalSelectedTokens.filter(token => token === gem).length;
    const availableCount = gameState.availableTokens[gem];
    
    // 이미 최대 개수(2개)를 선택한 경우 제거
    if (currentGemCount >= 2) {
        // 해당 보석의 모든 토큰 제거
        gameState.modalSelectedTokens = gameState.modalSelectedTokens.filter(token => token !== gem);
    } else if (currentGemCount >= 1) {
        // 이미 1개 선택된 경우, 2개로 증가
        if (availableCount >= 2) {
            gameState.modalSelectedTokens.push(gem);
        }
    } else {
        // 새로운 보석 선택
        const uniqueTokens = [...new Set(gameState.modalSelectedTokens)];
        
        // 같은 종류의 토큰을 2개 선택한 경우, 다른 종류는 선택 불가
        const hasTwoOfSame = gameState.modalSelectedTokens.some(token => 
            gameState.modalSelectedTokens.filter(t => t === token).length >= 2
        );
        
        if (hasTwoOfSame) return;
        
        // 최대 3개까지만 선택 가능
        if (gameState.modalSelectedTokens.length < 3) {
            gameState.modalSelectedTokens.push(gem);
        }
    }
    updateModalTokenSelectionDisplay();
}

// 토큰 선택 (기본 화면에서 사용)
function selectToken(gem) {
    if (gameState.currentAction === 'take') {
        // 황금 토큰은 선택할 수 없음
        if (gem === 'gold') return;
        
        const currentGemCount = gameState.selectedTokens.filter(token => token === gem).length;
        const availableCount = gameState.availableTokens[gem];
        
        // 이미 최대 개수(2개)를 선택한 경우 제거
        if (currentGemCount >= 2) {
            // 해당 보석의 모든 토큰 제거
            gameState.selectedTokens = gameState.selectedTokens.filter(token => token !== gem);
        } else if (currentGemCount >= 1) {
            // 이미 1개 선택된 경우, 2개로 증가
            if (availableCount >= 2) {
                gameState.selectedTokens.push(gem);
            }
        } else {
            // 새로운 보석 선택
            const uniqueTokens = [...new Set(gameState.selectedTokens)];
            
            // 같은 종류의 토큰을 2개 선택한 경우, 다른 종류는 선택 불가
            const hasTwoOfSame = gameState.selectedTokens.some(token => 
                gameState.selectedTokens.filter(t => t === token).length >= 2
            );
            
            if (hasTwoOfSame) return;
            
            // 최대 3개까지만 선택 가능
            if (gameState.selectedTokens.length < 3) {
                gameState.selectedTokens.push(gem);
            }
        }
        updateTokenSelectionDisplay();
    }
}

// 토큰 선택 표시 업데이트 (모달 내부에서만)
function updateTokenSelectionDisplay() {
    // 모든 토큰의 선택 상태 초기화
    document.querySelectorAll('.token-selection .token').forEach(token => {
        token.classList.remove('selected');
    });
    
    // 선택된 토큰 표시
    gameState.selectedTokens.forEach(gem => {
        const tokenElement = document.querySelector(`.token-selection .token[data-gem="${gem}"]`);
        if (tokenElement) {
            tokenElement.classList.add('selected');
        }
    });
    
    // 선택된 토큰 정보 업데이트 (모달 내부)
    updateSelectedTokensInfo();
    
    // 확인 버튼 활성화/비활성화
    const confirmBtn = document.getElementById('confirm-tokens-btn');
    if (confirmBtn) {
        const canConfirm = canConfirmTokenSelection();
        confirmBtn.disabled = !canConfirm;
    }
    
    // 토큰 개수 표시 업데이트 (선택된 개수만큼 차감)
    updateTokenCountDisplay();
    
    // 유효성 검사 및 경고 메시지
    validateTokenSelection();
}

// 토큰 선택 확인 가능 여부
function canConfirmTokenSelection() {
    if (gameState.selectedTokens.length === 0) return false;
    
    // 같은 색상 2개
    if (gameState.selectedTokens.length === 2) {
        return gameState.selectedTokens[0] === gameState.selectedTokens[1];
    }
    
    // 서로 다른 색상 3개
    if (gameState.selectedTokens.length === 3) {
        const uniqueTokens = [...new Set(gameState.selectedTokens)];
        return uniqueTokens.length === 3;
    }
    
    // 1개만 선택한 경우는 허용하지 않음
    return false;
}

// 토큰 선택 유효성 검사 및 경고 메시지
function validateTokenSelection() {
    const messageDiv = document.getElementById('modal-message');
    if (!messageDiv) return;
    
    messageDiv.innerHTML = '';
    
    if (gameState.selectedTokens.length === 0) return;
    
    // 각 보석별 선택된 개수 계산
    const selectedCounts = {};
    gameState.selectedTokens.forEach(gem => {
        selectedCounts[gem] = (selectedCounts[gem] || 0) + 1;
    });
    
    // 같은 종류의 보석 2개 선택 시도
    Object.entries(selectedCounts).forEach(([gem, count]) => {
        if (count >= 2) {
            const availableCount = gameState.availableTokens[gem];
            if (availableCount < 3) {
                messageDiv.innerHTML = '<div class="modal-warning">같은 종류의 보석 2개를 선택하려면, 해당 보석이 3개 이상이어야합니다.</div>';
                return;
            }
        }
    });
    
    // 다른 종류의 보석을 2개 뽑은 상태에서 같은 종류 추가 선택 시도
    const uniqueTokens = [...new Set(gameState.selectedTokens)];
    if (uniqueTokens.length === 2 && gameState.selectedTokens.length === 2) {
        // 이미 다른 종류 2개를 선택한 상태에서 같은 종류를 추가로 선택하려는 경우
        const hasMoreThanOne = Object.values(selectedCounts).some(count => count > 1);
        if (hasMoreThanOne) {
            messageDiv.innerHTML = '<div class="modal-warning">동일한 종류의 보석을 2개 선택하거나, 모두 다른 종류의 보석 3개를 선택해야합니다.</div>';
            return;
        }
    }
    
    // 유효한 선택인 경우 성공 메시지
    if (canConfirmTokenSelection()) {
        messageDiv.innerHTML = '<div class="modal-success">유효한 토큰 선택입니다. 확인 버튼을 눌러주세요.</div>';
    }
}

// 토큰 개수 표시 업데이트 (선택된 개수만큼 차감)
function updateTokenCountDisplay() {
    // 각 보석별 선택된 개수 계산
    const selectedCounts = {};
    gameState.selectedTokens.forEach(gem => {
        selectedCounts[gem] = (selectedCounts[gem] || 0) + 1;
    });
    
    // 토큰 개수 표시 업데이트
    Object.entries(gameState.availableTokens).forEach(([gem, count]) => {
        const selectedCount = selectedCounts[gem] || 0;
        const displayCount = Math.max(0, count - selectedCount);
        
        const tokenElement = document.querySelector(`.token-selection .token[data-gem="${gem}"] .token-count`);
        if (tokenElement) {
            tokenElement.textContent = displayCount;
        }
    });
}

// 선택된 토큰 정보를 모달 내부에 표시
function updateSelectedTokensInfo() {
    const selectedTokensDisplay = document.getElementById('selected-tokens-display');
    
    if (!selectedTokensDisplay) return;
    
    if (gameState.selectedTokens.length === 0) {
        selectedTokensDisplay.textContent = '선택된 토큰이 없습니다.';
        return;
    }
    
    // 각 보석별 선택된 개수 계산
    const selectedCounts = {};
    gameState.selectedTokens.forEach(gem => {
        selectedCounts[gem] = (selectedCounts[gem] || 0) + 1;
    });
    
    // 선택된 토큰 정보 텍스트 생성
    const tokenInfo = Object.entries(selectedCounts).map(([gem, count]) => {
        return `${getGemName(gem)} ${count}개`;
    }).join(', ');
    
    selectedTokensDisplay.textContent = `선택된 토큰: ${tokenInfo}`;
}

// 기본 화면의 선택된 토큰 영역 업데이트
function updateMainSelectedTokensDisplay() {
    const mainSelectedTokensDisplay = document.getElementById('selected-tokens-display');
    const cancelSelectionBtn = document.getElementById('cancel-selection-btn');
    
    if (!mainSelectedTokensDisplay) return;
    
    if (gameState.selectedTokens.length === 0) {
        mainSelectedTokensDisplay.textContent = '선택된 토큰이 없습니다.';
        if (cancelSelectionBtn) {
            cancelSelectionBtn.style.display = 'none';
        }
        return;
    }
    
    // 각 보석별 선택된 개수 계산
    const selectedCounts = {};
    gameState.selectedTokens.forEach(gem => {
        selectedCounts[gem] = (selectedCounts[gem] || 0) + 1;
    });
    
    // 선택된 토큰 정보 텍스트 생성
    const tokenInfo = Object.entries(selectedCounts).map(([gem, count]) => {
        return `${getGemName(gem)} ${count}개`;
    }).join(', ');
    
    mainSelectedTokensDisplay.textContent = `선택된 토큰: ${tokenInfo}`;
    
    // 선택 취소 버튼 표시
    if (cancelSelectionBtn) {
        cancelSelectionBtn.style.display = 'inline-block';
    }
}

// 버튼 상태 업데이트
function updateButtonStates() {
    const hasSelectedTokens = gameState.selectedTokens.length > 0;
    
    // 토큰이 선택된 상태에서는 카드 구매, 카드 예약 버튼 비활성화
    document.getElementById('buy-card-btn').disabled = hasSelectedTokens;
    document.getElementById('reserve-card-btn').disabled = hasSelectedTokens;
    
    // 토큰이 선택된 상태에서는 턴 종료 버튼 활성화
    document.getElementById('end-turn-btn').disabled = !hasSelectedTokens;
    
    // 보석 토큰 가져오기 버튼은 항상 활성화 (새로운 선택을 위해)
    document.getElementById('take-tokens-btn').disabled = false;
}

// 선택 취소
function cancelSelection() {
    gameState.selectedTokens = [];
    updateMainSelectedTokensDisplay();
    updateButtonStates();
    addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) 토큰 선택을 취소했습니다.`);
}

// 보석 토큰 가져오기 액션
function takeTokensAction() {
    gameState.currentAction = 'take';
    gameState.selectedTokens = [];
    showTakeTokensModal();
}

// 카드 구매 액션
function buyCardAction() {
    gameState.currentAction = 'buy';
    gameState.selectedCard = null;
    addLogEntry("구매할 카드를 선택하세요. (개발 카드 또는 예약된 카드)");
}

// 카드 예약 액션
function reserveCardAction() {
    gameState.currentAction = 'reserve';
    addLogEntry("예약할 카드를 선택하세요.");
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
        selectedCard: null
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

// 토큰 가져오기 모달
function showTakeTokensModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    // 모달용 임시 토큰 선택 상태 초기화
    gameState.modalSelectedTokens = [];
    
    modalBody.innerHTML = `
        <h2>보석 토큰 가져오기 모달</h2>
        <p>다른 색상의 보석 토큰 3개 또는 같은 색상의 보석 토큰 2개를 선택하세요. (황금 토큰은 제외)</p>
        <p>보석을 클릭하면 1개씩 추가됩니다. 같은 보석을 2번 클릭하면 2개를 선택할 수 있습니다.</p>
        <div class="token-selection">
            ${Object.entries(gameState.availableTokens).map(([gem, count]) => 
                count > 0 && gem !== 'gold' ? `<div class="token ${gem}" onclick="selectTokenInModal('${gem}')" data-gem="${gem}">
                    <span class="token-count">${count}</span>
                </div>` : ''
            ).join('')}
        </div>
        <div id="selected-tokens-info">
            <h4>선택된 토큰 정보</h4>
            <div id="modal-selected-tokens-display">선택된 토큰이 없습니다.</div>
        </div>
        <div id="modal-message"></div>
        <button id="confirm-tokens-btn" onclick="confirmTakeTokens()" disabled>확인</button>
        <button onclick="closeModal()">취소</button>
    `;
    
    modal.style.display = 'block';
}

// 토큰 가져오기 확인
function confirmTakeTokens() {
    if (gameState.selectedTokens.length === 0) return;
    
    // 유효성 검사
    if (!canConfirmTokenSelection()) {
        alert('유효하지 않은 토큰 선택입니다.');
        return;
    }
    
    // 황금 토큰이 포함되어 있는지 확인
    if (gameState.selectedTokens.includes('gold')) {
        alert('황금 토큰은 가져올 수 없습니다.');
        return;
    }
    
    // 선택된 토큰을 게임 상태에 저장 (아직 플레이어에게 주지 않음)
    // 토큰은 턴 종료 시에 플레이어에게 추가됨
    
    addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) ${gameState.selectedTokens.map(gem => getGemName(gem)).join(', ')} 토큰을 선택했습니다.`);
    
    closeModal();
    gameState.currentAction = null;
    // gameState.selectedTokens는 그대로 유지 (턴 종료까지)
    
    // 모달이 닫힌 후에 메인 화면의 선택된 토큰 영역 업데이트
    updateMainSelectedTokensDisplay();
    updateButtonStates();
}

// 카드 구매 모달
function showBuyCardModal() {
    if (!gameState.selectedCard) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const player = gameState.players[gameState.currentPlayer];
    const playerBonus = getPlayerBonus(player);
    
    // 구매 가능 여부 확인
    let canAfford = true;
    let totalCost = {};
    
    Object.entries(gameState.selectedCard.cost).forEach(([gem, cost]) => {
        if (cost > 0) {
            const available = player.tokens[gem] + playerBonus[gem];
            const needed = cost - playerBonus[gem];
            if (needed > 0) {
                if (player.tokens[gem] < needed) {
                    canAfford = false;
                }
                totalCost[gem] = needed;
            }
        }
    });
    
    modalBody.innerHTML = `
        <h2>카드 구매</h2>
        <div class="card-selection">
            ${createCardElement(gameState.selectedCard).outerHTML}
        </div>
        <p>비용: ${Object.entries(totalCost).map(([gem, cost]) => `${getGemName(gem)} ${cost}개`).join(', ')}</p>
        <p>보너스: ${getGemName(gameState.selectedCard.bonus)}</p>
        <p>명성 점수: ${gameState.selectedCard.prestige}</p>
        <button onclick="confirmBuyCard()" ${!canAfford ? 'disabled' : ''}>구매</button>
        <button onclick="closeModal()">취소</button>
    `;
    
    modal.style.display = 'block';
}

// 카드 구매 확인
function confirmBuyCard() {
    const player = gameState.players[gameState.currentPlayer];
    const playerBonus = getPlayerBonus(player);
    
    // 비용 지불
    Object.entries(gameState.selectedCard.cost).forEach(([gem, cost]) => {
        if (cost > 0) {
            const needed = cost - playerBonus[gem];
            if (needed > 0) {
                player.tokens[gem] -= needed;
                gameState.availableTokens[gem] += needed;
            }
        }
    });
    
    // 카드 획득
    player.cards.push(gameState.selectedCard);
    player.prestigePoints += gameState.selectedCard.prestige;
    
    // 카드 제거 (개발 카드에서 구매한 경우)
    const cardIndex = gameState.developmentCards.indexOf(gameState.selectedCard);
    if (cardIndex > -1) {
        gameState.developmentCards.splice(cardIndex, 1);
    } else {
        // 예약된 카드에서 구매한 경우
        const reservedIndex = player.reservedCards.indexOf(gameState.selectedCard);
        if (reservedIndex > -1) {
            player.reservedCards.splice(reservedIndex, 1);
        }
    }
    
    addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) ${getGemName(gameState.selectedCard.bonus)} 보너스 카드를 구매했습니다.`);
    
    closeModal();
    gameState.currentAction = null;
    gameState.selectedCard = null;
    updateDisplay();
}

// 카드 예약
function reserveCard(card) {
    const player = gameState.players[gameState.currentPlayer];
    
    if (player.reservedCards.length >= 3) {
        alert('예약할 수 있는 카드는 최대 3장입니다.');
        return;
    }
    
    // 금 토큰 받기
    if (gameState.availableTokens.gold > 0) {
        player.tokens.gold++;
        gameState.availableTokens.gold--;
    }
    
    // 카드 예약
    player.reservedCards.push(card);
    const cardIndex = gameState.developmentCards.indexOf(card);
    gameState.developmentCards.splice(cardIndex, 1);
    
    addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) 카드를 예약하고 금 토큰을 받았습니다.`);
    
    gameState.currentAction = null;
    updateDisplay();
}

// 모달 닫기
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    
    // 모달이 닫힐 때 선택된 토큰을 초기화하지 않음
    // (확인 버튼을 통해 선택이 완료된 경우에는 유지)
}

// 로그 추가
function addLogEntry(message) {
    const logContent = document.getElementById('log-content');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    // 버튼 이벤트
    document.getElementById('take-tokens-btn').addEventListener('click', takeTokensAction);
    document.getElementById('buy-card-btn').addEventListener('click', buyCardAction);
    document.getElementById('reserve-card-btn').addEventListener('click', reserveCardAction);
    document.getElementById('end-turn-btn').addEventListener('click', endTurn);
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
    document.getElementById('cancel-selection-btn').addEventListener('click', cancelSelection);
    
    // 모달 닫기
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // 토큰 클릭 이벤트
    document.querySelectorAll('.token').forEach(token => {
        token.addEventListener('click', () => {
            const gem = token.dataset.gem;
            if (gem) {
                selectToken(gem);
            }
        });
    });
    
    // 게임 초기화
    initGame();
});
