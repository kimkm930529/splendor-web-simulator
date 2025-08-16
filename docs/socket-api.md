# Splendor Socket.IO API 문서

## 연결

클라이언트는 Socket.IO를 통해 서버에 연결할 수 있습니다:

```javascript
const socket = io('http://localhost:3000');
```

## 이벤트 목록

### 클라이언트 → 서버 이벤트

#### 1. 게임 입장
```javascript
socket.emit('join_game', {
  gameId: 'game123',
  playerName: '플레이어1'
});
```

#### 2. 게임 시작
```javascript
socket.emit('start_game', {
  gameId: 'game123'
});
```

#### 3. 토큰 선택
```javascript
socket.emit('select_token', {
  gameId: 'game123',
  gem: 'sapphire' // sapphire, emerald, ruby, diamond, onyx
});
```

#### 4. 토큰 선택 취소
```javascript
socket.emit('cancel_token_selection', {
  gameId: 'game123'
});
```

#### 5. 토큰 획득 확인
```javascript
socket.emit('confirm_take_tokens', {
  gameId: 'game123'
});
```

#### 6. 카드 구매
```javascript
socket.emit('buy_card', {
  gameId: 'game123',
  cardId: 1,
  level: 1 // 1, 2, 3
});
```

#### 7. 카드 예약
```javascript
socket.emit('reserve_card', {
  gameId: 'game123',
  cardId: 1,
  level: 1 // 1, 2, 3
});
```

#### 8. 턴 종료
```javascript
socket.emit('end_turn', {
  gameId: 'game123'
});
```

#### 9. 게임 상태 요청
```javascript
socket.emit('get_game_state', {
  gameId: 'game123'
});
```

### 서버 → 클라이언트 이벤트

#### 1. 게임 입장 성공
```javascript
socket.on('game_joined', (data) => {
  console.log('게임에 입장했습니다:', data.gameState);
  console.log('내 플레이어 ID:', data.playerId);
});
```

#### 2. 플레이어 입장 알림
```javascript
socket.on('player_joined', (data) => {
  console.log('새 플레이어가 입장했습니다:', data.playerName);
  console.log('업데이트된 게임 상태:', data.gameState);
});
```

#### 3. 게임 시작
```javascript
socket.on('game_started', (data) => {
  console.log('게임이 시작되었습니다:', data.gameState);
});
```

#### 4. 토큰 선택
```javascript
socket.on('token_selected', (data) => {
  console.log('토큰이 선택되었습니다:', data.gem);
  console.log('업데이트된 게임 상태:', data.gameState);
});
```

#### 5. 토큰 선택 취소
```javascript
socket.on('token_selection_cancelled', (data) => {
  console.log('토큰 선택이 취소되었습니다');
  console.log('업데이트된 게임 상태:', data.gameState);
});
```

#### 6. 토큰 획득
```javascript
socket.on('tokens_taken', (data) => {
  console.log('토큰을 획득했습니다');
  console.log('업데이트된 게임 상태:', data.gameState);
});
```

#### 7. 카드 구매
```javascript
socket.on('card_bought', (data) => {
  console.log('카드를 구매했습니다:', data.cardId);
  console.log('업데이트된 게임 상태:', data.gameState);
});
```

#### 8. 카드 예약
```javascript
socket.on('card_reserved', (data) => {
  console.log('카드를 예약했습니다:', data.cardId);
  console.log('업데이트된 게임 상태:', data.gameState);
});
```

#### 9. 턴 종료
```javascript
socket.on('turn_ended', (data) => {
  console.log('턴이 종료되었습니다');
  console.log('업데이트된 게임 상태:', data.gameState);
});
```

#### 10. 게임 종료
```javascript
socket.on('game_finished', (data) => {
  console.log('게임이 종료되었습니다');
  console.log('최종 게임 상태:', data.gameState);
});
```

#### 11. 플레이어 퇴장
```javascript
socket.on('player_left', (data) => {
  console.log('플레이어가 퇴장했습니다:', data.playerId);
  console.log('업데이트된 게임 상태:', data.gameState);
});
```

#### 12. 게임 상태 응답
```javascript
socket.on('game_state', (data) => {
  console.log('현재 게임 상태:', data.gameState);
});
```

#### 13. 에러
```javascript
socket.on('error', (data) => {
  console.error('에러 발생:', data.message);
});
```

## 게임 상태 구조

```javascript
{
  id: 'game123',
  status: 'waiting', // waiting, active, finished
  currentPlayerIndex: 0,
  players: [
    {
      id: 'socketId1',
      name: '플레이어1',
      tokens: {
        sapphire: 2,
        emerald: 1,
        ruby: 0,
        diamond: 3,
        onyx: 1,
        gold: 0
      },
      cards: [...], // 소유한 카드들
      reservedCards: [...], // 예약한 카드들
      prestigePoints: 5,
      bonus: {
        sapphire: 1,
        emerald: 0,
        ruby: 2,
        diamond: 0,
        onyx: 0
      }
    }
  ],
  availableTokens: {
    sapphire: 2,
    emerald: 3,
    ruby: 4,
    diamond: 1,
    onyx: 3,
    gold: 5
  },
  developmentCards: {
    1: [...], // 레벨 1 카드들
    2: [...], // 레벨 2 카드들
    3: [...]  // 레벨 3 카드들
  },
  nobleTiles: [...], // 귀족 타일들
  selectedTokens: ['sapphire', 'emerald'], // 현재 선택된 토큰들
  selectedCard: null, // 현재 선택된 카드
  actionCompleted: false // 액션 완료 여부
}
```

## 사용 예시

### 기본 클라이언트 코드

```javascript
const socket = io('http://localhost:3000');

// 게임 입장
socket.emit('join_game', {
  gameId: 'game123',
  playerName: '플레이어1'
});

// 게임 입장 성공
socket.on('game_joined', (data) => {
  console.log('게임에 입장했습니다');
  updateGameUI(data.gameState);
});

// 게임 상태 업데이트
socket.on('game_started', (data) => {
  updateGameUI(data.gameState);
});

// 토큰 선택
function selectToken(gem) {
  socket.emit('select_token', {
    gameId: 'game123',
    gem: gem
  });
}

// 카드 구매
function buyCard(cardId, level) {
  socket.emit('buy_card', {
    gameId: 'game123',
    cardId: cardId,
    level: level
  });
}

// 턴 종료
function endTurn() {
  socket.emit('end_turn', {
    gameId: 'game123'
  });
}

// UI 업데이트 함수
function updateGameUI(gameState) {
  // 게임 상태에 따라 UI 업데이트
  console.log('UI 업데이트:', gameState);
}
```

## 게임 규칙

1. **토큰 획득**: 같은 색상 2개 또는 다른 색상 3개
2. **카드 구매**: 보석 토큰으로 개발 카드 구매
3. **카드 예약**: 카드를 예약하고 금 토큰 1개 획득
4. **승리 조건**: 명성 점수 15점 이상 달성
5. **귀족 방문**: 특정 보석 조합으로 귀족 타일 획득
