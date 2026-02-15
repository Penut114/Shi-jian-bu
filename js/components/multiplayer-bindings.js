let peerJSMultiplayer = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log("联机系统加载中...");

    const createRoomBtn = document.getElementById('create-room');
    const joinRoomBtn = document.getElementById('join-room');
    const leaveRoomBtn = document.getElementById('leave-room');
    const startMultiplayerBtn = document.getElementById('start-multiplayer-game');
    const sendChatBtn = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const refreshRoomsBtn = document.getElementById('refresh-rooms');

    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', async function() {
            const roomName = document.getElementById('room-name')?.value || '我的房间';
            const password = document.getElementById('room-password')?.value || '';
            const maxPlayers = parseInt(document.getElementById('max-players')?.value || '4');
            const aiCount = parseInt(document.getElementById('ai-count')?.value || '0');
            const playerName = document.getElementById('player-name')?.value || '玩家';

            if (!peerJSMultiplayer) {
                peerJSMultiplayer = new PeerJSMultiplayerManager(null);
            }

            const success = await peerJSMultiplayer.createRoom(roomName, password, maxPlayers, aiCount, playerName);
            if (success) {
                switchScreen('multiplayer-room-screen');
            }
        });
    }

    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', async function() {
            const roomId = document.getElementById('room-id')?.value || '';
            const password = document.getElementById('join-room-password')?.value || '';
            const playerName = document.getElementById('join-player-name')?.value || '玩家';

            if (!roomId.trim()) {
                alert('请输入房间ID');
                return;
            }

            if (!peerJSMultiplayer) {
                peerJSMultiplayer = new PeerJSMultiplayerManager(null);
            }

            const success = await peerJSMultiplayer.joinRoom(roomId, password, playerName);
            if (success) {
                switchScreen('multiplayer-room-screen');
            }
        });
    }

    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', function() {
            if (peerJSMultiplayer) {
                peerJSMultiplayer.leaveRoom();
            }
            switchScreen('main-menu');
        });
    }

    if (startMultiplayerBtn) {
        startMultiplayerBtn.addEventListener('click', function() {
            if (peerJSMultiplayer) {
                peerJSMultiplayer.startGame();
            }
        });
    }

    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', function() {
            const message = chatInput.value.trim();
            if (message && peerJSMultiplayer) {
                peerJSMultiplayer.sendChatMessage(message);
                chatInput.value = '';
            }
        });

        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatBtn.click();
            }
        });
    }

    if (refreshRoomsBtn) {
        refreshRoomsBtn.addEventListener('click', function() {
            const roomsContainer = document.getElementById('public-rooms');
            if (roomsContainer) {
                roomsContainer.innerHTML = `
                    <div class="room-empty">
                        <p style="text-align: center; color: #a5b1c2; padding: 20px;">PeerJS 不支持公共房间列表</p>
                        <p style="text-align: center; color: #778ca3; font-size: 14px;">请直接输入房间ID加入</p>
                    </div>
                `;
            }
        });
    }

    console.log("联机系统绑定完成！");
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
