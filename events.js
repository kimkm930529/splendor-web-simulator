// Socket.IO 연결 (백엔드 서버가 실행될 때만 사용)
let socket = null;
try {
    socket = io('http://localhost:3000', {
        timeout: 5000,
        forceNew: true
    });
    
    socket.on('connect', () => {
        console.log('Socket.IO 서버에 연결되었습니다.');
    });
    
    socket.on('connect_error', (error) => {
        console.log('Socket.IO 서버 연결 실패. 로컬 모드로 실행됩니다.');
        socket = null;
    });
    
} catch (error) {
    console.log('Socket.IO 서버에 연결할 수 없습니다. 로컬 모드로 실행됩니다.');
    socket = null;
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
    
    // 플레이어 이름 입력 모달 버튼 이벤트
    document.getElementById('start-multiplayer-btn').addEventListener('click', startMultiplayerGame);
    document.getElementById('start-singleplayer-btn').addEventListener('click', startLocalGame);
    
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
