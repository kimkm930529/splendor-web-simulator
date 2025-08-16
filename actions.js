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
        // 특정 보석이 2개만 남은 경우 2개 선택 불가
        else if (availableCount === 2) {
            return; // 2개만 남았으면 2개 선택 불가
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
        // 서버에 토큰 선택 요청
        socket.emit('select_token', { 
            gameId: 'game1',
            gem: gem
        });
    }
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

// 모달 토큰 선택 확인 가능 여부
function canConfirmModalTokenSelection() {
    if (gameState.modalSelectedTokens.length === 0) return false;
    
    // 같은 색상 2개
    if (gameState.modalSelectedTokens.length === 2) {
        return gameState.modalSelectedTokens[0] === gameState.modalSelectedTokens[1];
    }
    
    // 서로 다른 색상 3개
    if (gameState.modalSelectedTokens.length === 3) {
        const uniqueTokens = [...new Set(gameState.modalSelectedTokens)];
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
                messageDiv.innerHTML = '<div class="modal-warning">잘못된 토큰 선택입니다. 특정 보석이 2개만 남은 경우, 동일한 보석을 2개 선택할 수 없습니다.</div>';
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

// 모달 토큰 선택 유효성 검사 및 경고 메시지
function validateModalTokenSelection() {
    const messageDiv = document.getElementById('modal-message');
    if (!messageDiv) return;
    
    messageDiv.innerHTML = '';
    
    if (gameState.modalSelectedTokens.length === 0) return;
    
    // 각 보석별 선택된 개수 계산
    const selectedCounts = {};
    gameState.modalSelectedTokens.forEach(gem => {
        selectedCounts[gem] = (selectedCounts[gem] || 0) + 1;
    });
    
    // 같은 종류의 보석 2개 선택 시도
    Object.entries(selectedCounts).forEach(([gem, count]) => {
        if (count >= 2) {
            const availableCount = gameState.availableTokens[gem];
            if (availableCount < 3) {
                messageDiv.innerHTML = '<div class="modal-warning">잘못된 토큰 선택입니다. 특정 보석이 2개만 남은 경우, 동일한 보석을 2개 선택할 수 없습니다.</div>';
                return;
            }
        }
    });
    
    // 다른 종류의 보석을 2개 뽑은 상태에서 같은 종류 추가 선택 시도
    const uniqueTokens = [...new Set(gameState.modalSelectedTokens)];
    if (uniqueTokens.length === 2 && gameState.modalSelectedTokens.length === 2) {
        // 이미 다른 종류 2개를 선택한 상태에서 같은 종류를 추가로 선택하려는 경우
        const hasMoreThanOne = Object.values(selectedCounts).some(count => count > 1);
        if (hasMoreThanOne) {
            messageDiv.innerHTML = '<div class="modal-warning">동일한 종류의 보석을 2개 선택하거나, 모두 다른 종류의 보석 3개를 선택해야합니다.</div>';
            return;
        }
    }
    
    // 유효한 선택인 경우 성공 메시지
    if (canConfirmModalTokenSelection()) {
        messageDiv.innerHTML = '<div class="modal-success">유효한 토큰 선택입니다. 확인 버튼을 눌러주세요.</div>';
    }
}

// 토큰 가져오기 확인
function confirmTakeTokens() {
    if (gameState.modalSelectedTokens.length === 0) return;
    
    // 유효성 검사
    if (!canConfirmModalTokenSelection()) {
        alert('유효하지 않은 토큰 선택입니다.');
        return;
    }
    
    // 황금 토큰이 포함되어 있는지 확인
    if (gameState.modalSelectedTokens.includes('gold')) {
        alert('황금 토큰은 가져올 수 없습니다.');
        return;
    }
    
    // 서버에 토큰 획득 요청
    socket.emit('confirm_take_tokens', { 
        gameId: 'game1' 
    });
    
    closeModal();
}

// 카드 구매 확인
function confirmBuyCard() {
    // 서버에 카드 구매 요청
    socket.emit('buy_card', { 
        gameId: 'game1',
        cardId: gameState.selectedCard.id,
        level: gameState.selectedCard.level
    });
    
    closeModal();
}

// 카드 예약
function reserveCard(card) {
    const player = gameState.players[gameState.currentPlayer];
    
    if (player.reservedCards.length >= 3) {
        alert('예약할 수 있는 카드는 최대 3장입니다.');
        return;
    }
    
    // 서버에 카드 예약 요청
    socket.emit('reserve_card', { 
        gameId: 'game1',
        cardId: card.id,
        level: card.level
    });
}

// 선택 취소 (사용자 액션)
function cancelSelection() {
    // 서버에 토큰 선택 취소 요청
    socket.emit('cancel_token_selection', { 
        gameId: 'game1' 
    });
    
    addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) 선택을 취소했습니다.`);
}

// 선택된 토큰 초기화 (턴 종료 시 자동 호출)
function clearSelectedTokens() {
    gameState.selectedTokens = [];
    gameState.selectedCard = null;
    gameState.currentAction = null;
    gameState.actionCompleted = false;
    updateMainSelectedTokensDisplay();
    updateButtonStates();
}
