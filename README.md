# 스플렌더 웹 게임 (Splendor Web Simulator)

스플렌더 보드 게임의 웹 버전입니다. 보석 토큰을 모아 개발 카드를 구입하고, 가장 먼저 명성 점수 15점을 획득하는 사람이 승리하는 전략 게임입니다.

## 게임 규칙

### 목표
- 가장 먼저 **명성 점수(Prestige Points)** 15점을 달성하는 플레이어가 승리합니다.

### 게임 구성 요소
- **보석 토큰**: 5가지 색상의 보석(사파이어, 에메랄드, 루비, 다이아몬드, 오닉스)과 금 토큰(조커)
- **개발 카드**: 세 단계(1, 2, 3레벨)로 나뉜 카드들로, 보석을 지불하고 구매할 수 있습니다
- **귀족 타일**: 특정 개발 카드를 모으면 방문하는 귀족들로, 각각 3~5점의 명성 점수를 줍니다

### 게임 진행 방식
플레이어는 자기 차례에 다음 네 가지 행동 중 하나를 선택하여 진행합니다:

1. **보석 토큰 획득**:
   - 다른 색상의 보석 토큰 3개를 가져옵니다
   - 같은 색상의 보석 토큰 2개를 가져옵니다 (단, 해당 색상 토큰이 4개 이상 있을 때만 가능)
   - 금 토큰(조커) 하나를 가져오며, 개발 카드 하나를 예약합니다

2. **개발 카드 구매**:
   - 자신이 가진 보석 토큰을 지불하고 열려 있는 개발 카드나 예약해둔 개발 카드를 가져옵니다
   - 구매한 개발 카드는 자신의 앞에 놓으며, 이는 영구적인 보너스 보석으로 작용합니다

3. **개발 카드 예약**:
   - 열려 있는 개발 카드 한 장 또는 덱 가장 위에 있는 카드를 가져와 손에 둡니다
   - 금 토큰(조커) 하나를 받습니다
   - 예약한 카드는 다른 플레이어가 구매할 수 없게 됩니다. 손에 들 수 있는 카드는 최대 3장입니다

### 승리 조건
- 어떤 플레이어가 **명성 점수 15점 이상**을 획득하면 그 라운드까지 게임을 진행합니다
- 마지막 플레이어까지 차례를 진행한 후, 명성 점수가 가장 높은 사람이 최종 승자가 됩니다

## 게임 실행 방법

1. 웹 브라우저에서 `index.html` 파일을 엽니다
2. 게임이 자동으로 시작됩니다
3. 버튼을 클릭하여 게임 액션을 수행합니다:
   - **보석 토큰 가져오기**: 토큰을 선택하여 가져옵니다
   - **카드 구매**: 개발 카드를 선택하여 구매합니다
   - **카드 예약**: 카드를 선택하여 예약합니다
   - **턴 종료**: 현재 턴을 종료합니다

## 파일 구조

### 핵심 파일
- `index.html`: 게임의 메인 HTML 파일
- `styles.css`: 게임의 스타일시트
- `splendor_card.csv`: 개발 카드 데이터
- `splendor_rules.md`: 게임 규칙 상세 설명

### JavaScript 모듈 (모듈화된 구조)
- `game.js`: 게임 상태 관리 및 핵심 로직
  - 게임 상태(`gameState`) 객체 정의 및 관리
  - 게임 초기화(`initGame`, `loadCardData`, `setupNobleTiles`, `setupDevelopmentCards`)
  - 핵심 게임 로직(`endTurn`, `checkNobleVisits`, `endGame`, `startNewGame`)
  - 유틸리티 함수(`getGemName`, `getPlayerBonus`)

- `actions.js`: 플레이어 행동 및 유효성 검사
  - 플레이어 행동 함수(`takeTokensAction`, `buyCardAction`, `reserveCardAction`)
  - 토큰/카드 선택 로직(`selectToken`, `selectCard`, `selectReservedCard`)
  - 유효성 검사 함수(`canConfirmTokenSelection`, `validateTokenSelection`)
  - 확인 액션 함수(`confirmTakeTokens`, `confirmBuyCard`, `reserveCard`)

- `ui.js`: UI 업데이트 및 DOM 요소 생성
  - 화면 업데이트 함수(`updateDisplay`, `updateTokenDisplay`, `updateCardDisplay`)
  - 플레이어 표시 함수(`updatePlayerDisplay`, `updateSinglePlayerDisplay`)
  - 모달 관리 함수(`showTakeTokensModal`, `showBuyCardModal`, `closeModal`)
  - DOM 요소 생성 함수(`createCardElement`)
  - 상태 표시 함수(`updateMainSelectedTokensDisplay`, `updateButtonStates`)

- `events.js`: 이벤트 리스너 관리
  - DOM 이벤트 처리(`DOMContentLoaded`)
  - 버튼 클릭 이벤트 리스너
  - 모달 이벤트 처리
  - 토큰 클릭 이벤트 처리

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **데이터 처리**: CSV 데이터 파싱
- **아키텍처**: 모듈화된 JavaScript 구조
- **상태 관리**: 중앙화된 게임 상태 객체
- **이벤트 처리**: 이벤트 기반 사용자 인터랙션

## 게임 특징

- 완전한 스플렌더 게임 규칙 구현
- CSV 파일에서 카드 데이터 로드
- 직관적인 사용자 인터페이스
- 실시간 게임 로그
- 반응형 디자인
- 모듈화된 코드 구조로 유지보수성 향상
- 2인 플레이 지원
- 토큰 선택 시 실시간 유효성 검사 및 피드백

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.
