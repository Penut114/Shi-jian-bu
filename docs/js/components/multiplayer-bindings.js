let simpleMultiplayer = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('SimpleMultiplayer 联机系统加载中...');

    const createRoomBtn = document.getElementById('create-room');
    const joinRoomBtn = document.getElementById('join-room');
    const leaveRoomBtn = document.getElementById('leave-room');
    const startMultiplayerBtn = document.getElementById('start-multiplayer-game');
    const sendChatBtn = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const backFromMultiplayerBtn = document.getElementById('back-from-multiplayer');

    if (!simpleMultiplayer) {
        simpleMultiplayer = new SimpleMultiplayer(null);
    }

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', async function() {
            const playerName = document.getElementById('player-name')?.value || '玩家';
            const success = await simpleMultiplayer.createRoom(playerName);
            if (success) {
                console.log('房间创建成功');
            }
        });
    }

    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', async function() {
            const roomCode = document.getElementById('room-id')?.value || '';
            const playerName = document.getElementById('join-player-name')?.value || '玩家';

            if (!roomCode.trim()) {
                alert('请输入房间码');
                return;
            }

            const success = await simpleMultiplayer.joinRoom(roomCode, playerName);
            if (success) {
                console.log('正在加入房间...');
            }
        });
    }

    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', function() {
            if (simpleMultiplayer) {
                simpleMultiplayer.leaveRoom();
            }
            switchScreen('main-menu');
        });
    }

    if (startMultiplayerBtn) {
        startMultiplayerBtn.addEventListener('click', function() {
            if (simpleMultiplayer) {
                simpleMultiplayer.startGame();
            }
        });
    }

    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', function() {
            const message = chatInput.value.trim();
            if (message && simpleMultiplayer) {
                simpleMultiplayer.sendChatMessage(message);
                chatInput.value = '';
            }
        });

        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatBtn.click();
            }
        });
    }

    if (backFromMultiplayerBtn) {
        backFromMultiplayerBtn.addEventListener('click', function() {
            switchScreen('main-menu');
        });
    }

    console.log('SimpleMultiplayer 联机系统绑定完成！');
});

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}
