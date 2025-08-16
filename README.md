# Splendor Backend

스플렌더 게임을 위한 Node.js Express.js 백엔드 API 서버입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 14.0.0 이상
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd splendor-backend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 환경 변수를 설정하세요
```

4. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

## 📁 프로젝트 구조

```
splendor-backend/
├── config/          # 설정 파일들
├── controllers/     # 컨트롤러 (비즈니스 로직)
├── middleware/      # 미들웨어
├── models/          # 데이터 모델
├── routes/          # 라우터
├── server.js        # 메인 서버 파일
├── package.json     # 프로젝트 설정
└── README.md        # 프로젝트 문서
```

## 🔧 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| PORT | 서버 포트 | 3000 |
| NODE_ENV | 실행 환경 | development |
| CORS_ORIGIN | CORS 허용 오리진 | http://localhost:8000 |

## 📡 API 엔드포인트

### 기본 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /health` - 헬스 체크

### 게임 관련 엔드포인트

- `GET /api/game/status` - 게임 상태 확인
- `GET /api/game/cards` - 카드 데이터 조회
- `POST /api/game/start` - 새 게임 시작
- `GET /api/game/:id` - 특정 게임 정보 조회

## 🎮 Socket.IO 멀티플레이어

### 실시간 게임 기능

- **실시간 멀티플레이어**: 최대 4명까지 동시 플레이
- **실시간 게임 상태 동기화**: 모든 플레이어에게 즉시 게임 상태 업데이트
- **턴 기반 게임플레이**: 순차적 턴 진행
- **실시간 채팅**: 게임 내 메시지 교환 (향후 구현 예정)

### 주요 Socket.IO 이벤트

#### 클라이언트 → 서버
- `join_game` - 게임 입장
- `start_game` - 게임 시작
- `select_token` - 토큰 선택
- `buy_card` - 카드 구매
- `reserve_card` - 카드 예약
- `end_turn` - 턴 종료

#### 서버 → 클라이언트
- `game_joined` - 게임 입장 성공
- `game_started` - 게임 시작
- `token_selected` - 토큰 선택
- `card_bought` - 카드 구매
- `turn_ended` - 턴 종료
- `game_finished` - 게임 종료

### 사용 예시

```javascript
// 클라이언트 연결
const socket = io('http://localhost:3000');

// 게임 입장
socket.emit('join_game', {
  gameId: 'game123',
  playerName: '플레이어1'
});

// 게임 상태 업데이트 수신
socket.on('game_started', (data) => {
  console.log('게임 시작:', data.gameState);
});
```

자세한 API 문서는 `docs/socket-api.md`를 참조하세요.

## 🛠️ 개발

### 스크립트

```bash
npm start      # 프로덕션 서버 시작
npm run dev    # 개발 서버 시작 (nodemon)
npm test       # 테스트 실행
```

### 로그

서버는 Morgan을 사용하여 HTTP 요청 로그를 출력합니다.

## 🔒 보안

- Helmet.js를 사용한 보안 헤더 설정
- CORS 설정으로 허용된 오리진만 접근 가능
- 환경 변수를 통한 민감한 정보 관리

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
