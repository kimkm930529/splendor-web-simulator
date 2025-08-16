// Socket.IO 연결
const socket = io('http://localhost:3000');

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
