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
    // 토큰 수가 0 미만이 되지 않도록 보장
    const tokens = gameState.availableTokens;
    Object.keys(tokens).forEach(gem => {
        if (tokens[gem] < 0) {
            tokens[gem] = 0;
        }
    });
    
    document.getElementById('sapphire-count').textContent = tokens.sapphire;
    document.getElementById('emerald-count').textContent = tokens.emerald;
    document.getElementById('ruby-count').textContent = tokens.ruby;
    document.getElementById('diamond-count').textContent = tokens.diamond;
    document.getElementById('onyx-count').textContent = tokens.onyx;
    document.getElementById('gold-count').textContent = tokens.gold;
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
    
    // 소유한 카드 요약 표시 (레벨별 개수)
    const ownedCardsSummaryContainer = document.getElementById(`player${playerNum}-owned-cards-summary`);
    if (ownedCardsSummaryContainer) {
        const levelCounts = { 1: 0, 2: 0, 3: 0 };
        player.cards.forEach(card => {
            levelCounts[card.level]++;
        });
        
        ownedCardsSummaryContainer.innerHTML = `
            <div class="owned-cards-summary">
                <div class="level-count">레벨 1: ${levelCounts[1]}장</div>
                <div class="level-count">레벨 2: ${levelCounts[2]}장</div>
                <div class="level-count">레벨 3: ${levelCounts[3]}장</div>
            </div>
        `;
    }
    
    // 플레이어 토큰
    const playerTokenContainer = document.getElementById(`player${playerNum}-token-display`);
    playerTokenContainer.innerHTML = '';
    
    Object.entries(player.tokens).forEach(([gem, count]) => {
        // 토큰 수가 0 미만이 되지 않도록 보장
        const displayCount = Math.max(0, count);
        
        if (displayCount > 0) {
            const tokenGroup = document.createElement('div');
            tokenGroup.className = 'token-group';
            tokenGroup.innerHTML = `
                <div class="token ${gem}" style="width: 30px; height: 30px; font-size: 0.8em;">
                    <span class="token-count">${displayCount}</span>
                </div>
                <span style="font-size: 0.7em;">${getGemName(gem)}</span>
            `;
            playerTokenContainer.appendChild(tokenGroup);
        }
    });
    
    // 보너스 보석 효과 표시
    const playerBonus = getPlayerBonus(player);
    const bonusContainer = document.getElementById(`player${playerNum}-bonus-display`);
    
    if (bonusContainer) {
        bonusContainer.innerHTML = '';
        
        Object.entries(playerBonus).forEach(([gem, bonusCount]) => {
            if (bonusCount > 0) {
                const bonusGroup = document.createElement('div');
                bonusGroup.className = 'bonus-group';
                bonusGroup.innerHTML = `
                    <div class="token ${gem}" style="width: 25px; height: 25px; font-size: 0.7em; border: 2px solid #333;">
                        <span class="bonus-count">${bonusCount}</span>
                    </div>
                    <span style="font-size: 0.6em; color: #666;">보너스</span>
                `;
                bonusContainer.appendChild(bonusGroup);
            }
        });
    }
    
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
    
    // 플레이어별 점수 표시 업데이트 (현재 턴 표시 포함)
    const player1Turn = gameState.currentPlayer === 1 ? '[Turn] ' : '';
    const player2Turn = gameState.currentPlayer === 2 ? '[Turn] ' : '';
    document.querySelector('#player1-area h3').textContent = `${player1Turn}플레이어 1 (${player1.prestigePoints}점)`;
    document.querySelector('#player2-area h3').textContent = `${player2Turn}플레이어 2 (${player2.prestigePoints}점)`;
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

// 모달 토큰 선택 표시 업데이트
function updateModalTokenSelectionDisplay() {
    // 모든 토큰의 선택 상태 초기화
    document.querySelectorAll('.token-selection .token').forEach(token => {
        token.classList.remove('selected');
    });
    
    // 선택된 토큰 표시
    gameState.modalSelectedTokens.forEach(gem => {
        const tokenElement = document.querySelector(`.token-selection .token[data-gem="${gem}"]`);
        if (tokenElement) {
            tokenElement.classList.add('selected');
        }
    });
    
    // 선택된 토큰 정보 업데이트 (모달 내부)
    updateModalSelectedTokensInfo();
    
    // 확인 버튼 활성화/비활성화
    const confirmBtn = document.getElementById('confirm-tokens-btn');
    if (confirmBtn) {
        const canConfirm = canConfirmModalTokenSelection();
        confirmBtn.disabled = !canConfirm;
    }
    
    // 토큰 개수 표시 업데이트 (선택된 개수만큼 차감)
    updateModalTokenCountDisplay();
    
    // 유효성 검사 및 경고 메시지
    validateModalTokenSelection();
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

// 모달 토큰 개수 표시 업데이트 (선택된 개수만큼 차감)
function updateModalTokenCountDisplay() {
    // 각 보석별 선택된 개수 계산
    const selectedCounts = {};
    gameState.modalSelectedTokens.forEach(gem => {
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

// 모달 선택된 토큰 정보를 모달 내부에 표시
function updateModalSelectedTokensInfo() {
    const selectedTokensDisplay = document.getElementById('modal-selected-tokens-display');
    
    if (!selectedTokensDisplay) return;
    
    if (gameState.modalSelectedTokens.length === 0) {
        selectedTokensDisplay.textContent = '선택된 토큰이 없습니다.';
        return;
    }
    
    // 각 보석별 선택된 개수 계산
    const selectedCounts = {};
    gameState.modalSelectedTokens.forEach(gem => {
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
    const hasCompletedAction = hasSelectedTokens || gameState.actionCompleted;
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const hasMaxReservedCards = currentPlayer.reservedCards.length >= 3;
    
    // 액션이 완료된 상태에서는 모든 액션 버튼 비활성화
    document.getElementById('take-tokens-btn').disabled = hasCompletedAction;
    document.getElementById('buy-card-btn').disabled = hasCompletedAction;
    document.getElementById('reserve-card-btn').disabled = hasCompletedAction || hasMaxReservedCards;
    
    // 액션이 완료된 상태에서만 턴 종료 버튼 활성화
    document.getElementById('end-turn-btn').disabled = !hasCompletedAction;
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

// 소유 카드 모달 표시
function showOwnedCardsModal(playerNum) {
    const player = gameState.players[playerNum];
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    // 레벨별로 카드 분류
    const levelCards = { 1: [], 2: [], 3: [] };
    player.cards.forEach(card => {
        levelCards[card.level].push(card);
    });
    
    modalBody.innerHTML = `
        <h2>플레이어 ${playerNum} 소유 카드</h2>
        <div class="owned-cards-modal">
            <div class="level-section">
                <h3>레벨 1 카드 (${levelCards[1].length}장)</h3>
                <div class="cards-grid">
                    ${levelCards[1].map(card => createCardElement(card).outerHTML).join('')}
                </div>
            </div>
            <div class="level-section">
                <h3>레벨 2 카드 (${levelCards[2].length}장)</h3>
                <div class="cards-grid">
                    ${levelCards[2].map(card => createCardElement(card).outerHTML).join('')}
                </div>
            </div>
            <div class="level-section">
                <h3>레벨 3 카드 (${levelCards[3].length}장)</h3>
                <div class="cards-grid">
                    ${levelCards[3].map(card => createCardElement(card).outerHTML).join('')}
                </div>
            </div>
        </div>
        <button onclick="closeModal()">닫기</button>
    `;
    
    modal.style.display = 'block';
}

// 모달 닫기
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    
    // 카드 구매 모달에서 취소한 경우 상태 초기화
    if (gameState.currentAction === 'buy' && gameState.selectedCard) {
        gameState.selectedCard = null;
        gameState.currentAction = null;
        updateButtonStates();
    }
    
    // 토큰 가져오기 모달에서는 선택된 토큰을 초기화하지 않음
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
