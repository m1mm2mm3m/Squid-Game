// Squid Game JavaScript
class SquidGame {
    constructor() {
        this.playerName = '';
        this.gamesCompleted = [];
        this.currentGame = null;
        this.gameData = {
            redlight: { timer: 60, progress: 0, lightState: 'green', isMoving: false },
            honeycomb: { timer: 120, lives: 3, selectedShape: null, canvas: null, ctx: null },
            tugofwar: { playerStrength: 50, opponentStrength: 50, ropePosition: 50 },
            marbles: { playerMarbles: 10, round: 1, maxRounds: 5 },
            bridge: { position: 1, totalSteps: 18, playersRemaining: 16, bridgePath: [] },
            squidgame: { playerHealth: 100, opponentHealth: 100, playerPos: {x: 50, y: 350}, opponentPos: {x: 550, y: 350} }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.showScreen('welcomeScreen');
    }

    bindEvents() {
        // Welcome screen
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });

        // Game selection
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectGame(e.target.closest('.game-card').dataset.game));
        });

        // Back buttons
        document.querySelectorAll('[id$="-back"]').forEach(btn => {
            btn.addEventListener('click', () => this.showGameSelection());
        });

        // Game Over & Victory screens
        document.getElementById('restartBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showScreen('welcomeScreen'));
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());

        // Game-specific events
        this.bindGameEvents();
    }

    bindGameEvents() {
        // Red Light Green Light
        document.addEventListener('keydown', (e) => {
            if (this.currentGame === 'redlight' && e.code === 'Space') {
                e.preventDefault();
                this.gameData.redlight.isMoving = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.currentGame === 'redlight' && e.code === 'Space') {
                e.preventDefault();
                this.gameData.redlight.isMoving = false;
            }
        });

        // Honeycomb
        document.querySelectorAll('.shape-option').forEach(shape => {
            shape.addEventListener('click', (e) => this.selectHoneycombShape(e.target.dataset.shape));
        });

        document.getElementById('honeycomb-restart').addEventListener('click', () => this.resetHoneycombShape());

        // Tug of War
        document.getElementById('tug-pull').addEventListener('click', () => this.tugOfWarPull());

        // Marbles
        document.getElementById('marble-submit').addEventListener('click', () => this.submitMarbleGuess());

        // Glass Bridge
        document.getElementById('bridge-left').addEventListener('click', () => this.chooseBridgePanel('left'));
        document.getElementById('bridge-right').addEventListener('click', () => this.chooseBridgePanel('right'));

        // Squid Game
        document.addEventListener('keydown', (e) => this.handleSquidGameInput(e));
    }

    startGame() {
        const nameInput = document.getElementById('playerName');
        this.playerName = nameInput.value.trim() || 'Player';
        document.getElementById('playerDisplayName').textContent = this.playerName;
        this.showGameSelection();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    showGameSelection() {
        this.currentGame = null;
        this.updateGameSelection();
        this.showScreen('gameSelectionScreen');
    }

    updateGameSelection() {
        document.getElementById('gamesCompleted').textContent = `Games: ${this.gamesCompleted.length}/6`;
        
        const games = ['redlight', 'honeycomb', 'tugofwar', 'marbles', 'bridge', 'squidgame'];
        games.forEach((game, index) => {
            const card = document.querySelector(`[data-game="${game}"]`);
            const status = document.getElementById(`${game}-status`);
            
            if (this.gamesCompleted.includes(game)) {
                card.classList.add('completed');
                card.classList.remove('locked');
                status.textContent = 'Completed';
                status.className = 'status completed';
            } else if (index === 0 || this.gamesCompleted.includes(games[index - 1])) {
                card.classList.remove('locked', 'completed');
                status.textContent = 'Available';
                status.className = 'status';
            } else {
                card.classList.add('locked');
                card.classList.remove('completed');
                status.textContent = 'Locked';
                status.className = 'status locked';
            }
        });
    }

    selectGame(gameType) {
        const card = document.querySelector(`[data-game="${gameType}"]`);
        if (card.classList.contains('locked') || card.classList.contains('completed')) return;

        this.currentGame = gameType;
        this.showScreen(`${gameType}Game`);
        this.startSpecificGame(gameType);
    }

    startSpecificGame(gameType) {
        switch(gameType) {
            case 'redlight':
                this.startRedLightGreenLight();
                break;
            case 'honeycomb':
                this.startHoneycomb();
                break;
            case 'tugofwar':
                this.startTugOfWar();
                break;
            case 'marbles':
                this.startMarbles();
                break;
            case 'bridge':
                this.startGlassBridge();
                break;
            case 'squidgame':
                this.startSquidGame();
                break;
        }
    }

    // Red Light Green Light Game
    startRedLightGreenLight() {
        const data = this.gameData.redlight;
        data.timer = 60;
        data.progress = 0;
        data.lightState = 'green';
        data.isMoving = false;

        this.updateRedLightUI();
        this.redLightTimer = setInterval(() => this.updateRedLight(), 100);
        this.lightChangeTimer = setInterval(() => this.changeLight(), Math.random() * 3000 + 2000);
    }

    updateRedLight() {
        const data = this.gameData.redlight;
        data.timer -= 0.1;

        if (data.lightState === 'green' && data.isMoving) {
            data.progress += 0.5;
        } else if (data.lightState === 'red' && data.isMoving) {
            this.endGame(false, 'You moved during red light! Eliminated!');
            return;
        }

        if (data.progress >= 100) {
            this.completeGame('redlight');
            return;
        }

        if (data.timer <= 0) {
            this.endGame(false, 'Time ran out! Eliminated!');
            return;
        }

        this.updateRedLightUI();
    }

    updateRedLightUI() {
        const data = this.gameData.redlight;
        document.getElementById('redlight-timer').textContent = Math.max(0, Math.floor(data.timer));
        document.getElementById('redlight-progress').textContent = Math.floor(data.progress);
        
        const player = document.getElementById('player');
        const gameArea = player.parentElement;
        const maxLeft = gameArea.offsetWidth - 150; // Account for finish line and player width
        player.style.left = `${50 + (data.progress / 100) * (maxLeft - 50)}px`;
    }

    changeLight() {
        const data = this.gameData.redlight;
        data.lightState = data.lightState === 'green' ? 'red' : 'green';
        
        const lightStatus = document.getElementById('light-status');
        const doll = document.getElementById('doll');
        
        if (data.lightState === 'red') {
            lightStatus.textContent = 'RED LIGHT';
            lightStatus.className = 'red';
            doll.classList.add('turned');
        } else {
            lightStatus.textContent = 'GREEN LIGHT';
            lightStatus.className = 'green';
            doll.classList.remove('turned');
        }
    }

    // Honeycomb Game
    startHoneycomb() {
        const data = this.gameData.honeycomb;
        data.timer = 120;
        data.lives = 3;
        data.selectedShape = null;

        document.getElementById('honeycomb-timer').textContent = data.timer;
        document.getElementById('honeycomb-lives').textContent = data.lives;
        document.getElementById('honeycomb-board').classList.add('honeycomb-hidden');
        
        document.querySelectorAll('.shape-option').forEach(shape => {
            shape.classList.remove('selected');
        });
    }

    selectHoneycombShape(shape) {
        const data = this.gameData.honeycomb;
        data.selectedShape = shape;

        document.querySelectorAll('.shape-option').forEach(s => s.classList.remove('selected'));
        document.querySelector(`[data-shape="${shape}"]`).classList.add('selected');

        this.setupHoneycombCanvas();
    }

    setupHoneycombCanvas() {
        const board = document.getElementById('honeycomb-board');
        board.classList.remove('honeycomb-hidden');

        const canvas = document.getElementById('honeycombCanvas');
        const ctx = canvas.getContext('2d');
        this.gameData.honeycomb.canvas = canvas;
        this.gameData.honeycomb.ctx = ctx;

        this.drawHoneycomb();
        this.startHoneycombTimer();

        canvas.addEventListener('click', (e) => this.honeycombClick(e));
    }

    drawHoneycomb() {
        const { ctx, selectedShape } = this.gameData.honeycomb;
        const canvas = ctx.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw honeycomb background
        ctx.fillStyle = '#ffcc02';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw shape outline
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        switch(selectedShape) {
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - 70);
                ctx.lineTo(centerX - 60, centerY + 40);
                ctx.lineTo(centerX + 60, centerY + 40);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(centerX, centerY, 70, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case 'star':
                this.drawStar(ctx, centerX, centerY, 5, 70, 35);
                ctx.stroke();
                break;
            case 'umbrella':
                this.drawUmbrella(ctx, centerX, centerY);
                ctx.stroke();
                break;
        }
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerRadius;
            let y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    drawUmbrella(ctx, cx, cy) {
        ctx.beginPath();
        
        // Umbrella dome (semicircle with scalloped edge)
        ctx.arc(cx, cy - 10, 50, Math.PI, 0);
        
        // Add scalloped edge detail
        const segments = 6;
        for (let i = 0; i <= segments; i++) {
            const angle = Math.PI + (i * Math.PI / segments);
            const x = cx + Math.cos(angle) * 50;
            const y = cy - 10 + Math.sin(angle) * 50;
            
            if (i > 0) {
                // Create small scallop
                const prevAngle = Math.PI + ((i-1) * Math.PI / segments);
                const prevX = cx + Math.cos(prevAngle) * 50;
                const prevY = cy - 10 + Math.sin(prevAngle) * 50;
                
                const midAngle = prevAngle + (Math.PI / segments) / 2;
                const scallopX = cx + Math.cos(midAngle) * 45;
                const scallopY = cy - 10 + Math.sin(midAngle) * 45;
                
                ctx.quadraticCurveTo(scallopX, scallopY, x, y);
            }
        }
        
        // Umbrella handle (straight vertical line)
        ctx.moveTo(cx, cy + 40);
        ctx.lineTo(cx, cy + 80);
        
        // Handle hook (J-shaped curve at bottom)
        ctx.moveTo(cx, cy + 80);
        ctx.quadraticCurveTo(cx + 15, cy + 85, cx + 15, cy + 95);
        ctx.quadraticCurveTo(cx + 15, cy + 100, cx + 10, cy + 100);
        
        ctx.closePath();
    }

    honeycombClick(e) {
        const data = this.gameData.honeycomb;
        if (data.lives <= 0) return;

        const rect = data.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Improved hit detection for different shapes
        const centerX = data.canvas.width / 2;
        const centerY = data.canvas.height / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        let isSuccess = false;
        let isSafe = true;

        switch(data.selectedShape) {
            case 'circle':
                isSuccess = distance < 55;
                isSafe = distance < 80;
                break;
            case 'triangle':
                // Check if inside triangle bounds
                const triangleHeight = 110;
                const triangleBase = 120;
                isSuccess = y > centerY - 60 && y < centerY + 40 && 
                           Math.abs(x - centerX) < (triangleBase / 2) * (1 - (y - (centerY - 60)) / triangleHeight);
                isSafe = distance < 90;
                break;
            case 'star':
                isSuccess = distance < 60;
                isSafe = distance < 85;
                break;
            case 'umbrella':
                // Check umbrella shape (dome + handle)
                const isDome = y < centerY + 20 && distance < 60;
                const isHandle = Math.abs(x - centerX) < 15 && y > centerY + 20 && y < centerY + 90;
                isSuccess = isDome || isHandle;
                isSafe = distance < 85 || (Math.abs(x - centerX) < 25 && y > centerY + 10);
                break;
        }

        if (!isSafe) {
            // Clicked too far from safe zone
            data.lives--;
            document.getElementById('honeycomb-lives').textContent = data.lives;
            
            // Visual feedback for mistake
            const canvas = data.canvas;
            const ctx = data.ctx;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            setTimeout(() => {
                this.drawHoneycomb();
            }, 200);
            
            if (data.lives <= 0) {
                this.endGame(false, 'You broke the honeycomb! Eliminated!');
                return;
            }
        } else if (isSuccess) {
            // Successfully extracted the shape
            // Visual feedback for success
            const canvas = data.canvas;
            const ctx = data.ctx;
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            setTimeout(() => {
                this.completeGame('honeycomb');
            }, 500);
        }
    }

    startHoneycombTimer() {
        this.honeycombTimer = setInterval(() => {
            const data = this.gameData.honeycomb;
            data.timer--;
            document.getElementById('honeycomb-timer').textContent = data.timer;

            if (data.timer <= 0) {
                this.endGame(false, 'Time ran out! Eliminated!');
            }
        }, 1000);
    }

    resetHoneycombShape() {
        if (this.gameData.honeycomb.selectedShape) {
            this.drawHoneycomb();
        }
    }

    // Tug of War Game
    startTugOfWar() {
        const data = this.gameData.tugofwar;
        data.playerStrength = 50;
        data.opponentStrength = 50;
        data.ropePosition = 50;

        this.updateTugOfWarUI();
        this.startTimingIndicator();
    }

    startTimingIndicator() {
        const indicator = document.getElementById('timing-indicator');
        const pullBtn = document.getElementById('tug-pull');
        
        pullBtn.disabled = false;
        
        this.tugTimer = setInterval(() => {
            const data = this.gameData.tugofwar;
            data.opponentStrength += Math.random() * 2 - 1; // Random opponent moves
            data.opponentStrength = Math.max(0, Math.min(100, data.opponentStrength));
            
            // Check for game end
            if (data.playerStrength >= 80) {
                this.completeGame('tugofwar');
            } else if (data.playerStrength <= 20) {
                this.endGame(false, 'You lost the tug of war! Eliminated!');
            }
            
            this.updateTugOfWarUI();
        }, 200);
    }

    tugOfWarPull() {
        const indicator = document.getElementById('timing-indicator');
        const indicatorPos = parseFloat(indicator.style.left || '0');
        const greenZoneStart = 40;
        const greenZoneEnd = 60;

        if (indicatorPos >= greenZoneStart && indicatorPos <= greenZoneEnd) {
            this.gameData.tugofwar.playerStrength += 5;
        } else {
            this.gameData.tugofwar.playerStrength -= 3;
        }

        this.gameData.tugofwar.playerStrength = Math.max(0, Math.min(100, this.gameData.tugofwar.playerStrength));
    }

    updateTugOfWarUI() {
        const data = this.gameData.tugofwar;
        document.getElementById('tug-strength').textContent = Math.floor(data.playerStrength);
        document.getElementById('opponent-strength').textContent = Math.floor(data.opponentStrength);

        const ropeMarker = document.getElementById('rope-marker');
        const ropePosition = (data.playerStrength - data.opponentStrength) + 50;
        ropeMarker.style.left = `${Math.max(0, Math.min(100, ropePosition))}%`;
    }

    // Marbles Game
    startMarbles() {
        const data = this.gameData.marbles;
        data.playerMarbles = 10;
        data.round = 1;

        this.updateMarblesUI();
    }

    submitMarbleGuess() {
        const data = this.gameData.marbles;
        const bet = parseInt(document.getElementById('marble-bet').value);
        const guess = parseInt(document.getElementById('marble-guess').value);
        
        if (bet > data.playerMarbles || bet < 1) {
            alert('Invalid bet amount!');
            return;
        }

        const actualNumber = Math.floor(Math.random() * 10) + 1;
        const resultArea = document.getElementById('marble-result');
        
        if (guess === actualNumber) {
            data.playerMarbles += bet;
            resultArea.textContent = `Correct! The number was ${actualNumber}. You won ${bet} marbles!`;
            resultArea.className = 'result-area win';
        } else {
            data.playerMarbles -= bet;
            resultArea.textContent = `Wrong! The number was ${actualNumber}. You lost ${bet} marbles.`;
            resultArea.className = 'result-area lose';
        }

        data.round++;

        if (data.playerMarbles <= 0) {
            this.endGame(false, 'You lost all your marbles! Eliminated!');
            return;
        }

        if (data.round > data.maxRounds) {
            if (data.playerMarbles >= 10) {
                this.completeGame('marbles');
            } else {
                this.endGame(false, 'Not enough marbles to survive! Eliminated!');
            }
            return;
        }

        this.updateMarblesUI();
    }

    updateMarblesUI() {
        const data = this.gameData.marbles;
        document.getElementById('player-marbles').textContent = data.playerMarbles;
        document.getElementById('marble-round').textContent = data.round;
        document.getElementById('marble-bet').max = data.playerMarbles;
    }

    // Glass Bridge Game
    startGlassBridge() {
        const data = this.gameData.bridge;
        data.position = 1;
        data.playersRemaining = 16;
        data.bridgePath = [];

        // Generate random bridge path (true = safe, false = deadly)
        for (let i = 0; i < data.totalSteps; i++) {
            data.bridgePath.push(Math.random() < 0.5 ? 'left' : 'right');
        }

        this.generateBridgeUI();
        this.updateBridgeUI();
    }

    generateBridgeUI() {
        const bridgePath = document.getElementById('bridge-path');
        bridgePath.innerHTML = '';

        for (let i = 0; i < this.gameData.bridge.totalSteps; i++) {
            const leftStep = document.createElement('div');
            const rightStep = document.createElement('div');
            
            leftStep.className = 'bridge-step';
            rightStep.className = 'bridge-step';
            
            leftStep.dataset.step = i;
            leftStep.dataset.side = 'left';
            rightStep.dataset.step = i;
            rightStep.dataset.side = 'right';

            if (i === 0) {
                leftStep.classList.add('current');
                rightStep.classList.add('current');
            }

            bridgePath.appendChild(leftStep);
            bridgePath.appendChild(rightStep);
        }
    }

    chooseBridgePanel(side) {
        const data = this.gameData.bridge;
        const currentStep = data.position - 1;
        const safeSide = data.bridgePath[currentStep];

        const steps = document.querySelectorAll(`[data-step="${currentStep}"]`);
        steps.forEach(step => step.classList.remove('current'));

        if (side === safeSide) {
            document.querySelector(`[data-step="${currentStep}"][data-side="${side}"]`).classList.add('safe');
            data.position++;
            
            if (data.position > data.totalSteps) {
                this.completeGame('bridge');
                return;
            }

            // Highlight next step
            const nextSteps = document.querySelectorAll(`[data-step="${data.position - 1}"]`);
            nextSteps.forEach(step => step.classList.add('current'));
        } else {
            document.querySelector(`[data-step="${currentStep}"][data-side="${side}"]`).classList.add('broken');
            this.endGame(false, 'You chose the wrong glass! Eliminated!');
            return;
        }

        this.updateBridgeUI();
    }

    updateBridgeUI() {
        const data = this.gameData.bridge;
        document.getElementById('bridge-position').textContent = data.position;
        document.getElementById('players-remaining').textContent = Math.max(1, data.playersRemaining - (data.position - 1));
    }

    // Squid Game (Final Game)
    startSquidGame() {
        const data = this.gameData.squidgame;
        data.playerHealth = 100;
        data.opponentHealth = 100;
        data.playerPos = {x: 50, y: 350};
        data.opponentPos = {x: 550, y: 350};

        this.updateSquidGameUI();
        this.squidGameLoop = setInterval(() => this.updateSquidGame(), 100);
    }

    handleSquidGameInput(e) {
        if (this.currentGame !== 'squidgame') return;

        const data = this.gameData.squidgame;
        const speed = 5;

        switch(e.key.toLowerCase()) {
            case 'w':
                data.playerPos.y = Math.max(20, data.playerPos.y - speed);
                break;
            case 's':
                data.playerPos.y = Math.min(370, data.playerPos.y + speed);
                break;
            case 'a':
                data.playerPos.x = Math.max(20, data.playerPos.x - speed);
                break;
            case 'd':
                data.playerPos.x = Math.min(570, data.playerPos.x + speed);
                break;
            case ' ':
                this.squidGameAttack();
                break;
        }

        this.updateSquidGameUI();
    }

    updateSquidGame() {
        const data = this.gameData.squidgame;
        
        // Simple AI for opponent
        const dx = data.playerPos.x - data.opponentPos.x;
        const dy = data.playerPos.y - data.opponentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 50) {
            data.opponentPos.x += (dx / distance) * 2;
            data.opponentPos.y += (dy / distance) * 2;
        }

        // Check if player reached the squid head (win condition)
        const headX = 300; // Center of squid head
        const headY = 60;  // Top of squid
        const playerDistance = Math.sqrt((data.playerPos.x - headX) ** 2 + (data.playerPos.y - headY) ** 2);

        if (playerDistance < 40) {
            this.completeGame('squidgame');
            return;
        }

        this.updateSquidGameUI();
    }

    squidGameAttack() {
        const data = this.gameData.squidgame;
        const dx = data.playerPos.x - data.opponentPos.x;
        const dy = data.playerPos.y - data.opponentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 60) {
            data.opponentHealth -= 25;
            if (data.opponentHealth <= 0) {
                this.completeGame('squidgame');
            }
        }
    }

    updateSquidGameUI() {
        const data = this.gameData.squidgame;
        
        document.getElementById('squid-health').textContent = data.playerHealth;
        document.getElementById('squid-opponent-health').textContent = Math.max(0, data.opponentHealth);

        const player = document.getElementById('squid-player');
        const opponent = document.getElementById('squid-opponent');

        player.style.left = `${data.playerPos.x}px`;
        player.style.bottom = `${400 - data.playerPos.y}px`;
        
        opponent.style.right = `${600 - data.opponentPos.x}px`;
        opponent.style.bottom = `${400 - data.opponentPos.y}px`;
    }

    // Game Management
    completeGame(gameType) {
        this.clearTimers();
        
        if (!this.gamesCompleted.includes(gameType)) {
            this.gamesCompleted.push(gameType);
        }

        if (this.gamesCompleted.length === 6) {
            this.showVictory();
        } else {
            setTimeout(() => {
                alert(`Congratulations! You completed ${gameType}!`);
                this.showGameSelection();
            }, 500);
        }
    }

    endGame(won, message) {
        this.clearTimers();
        
        if (won) {
            this.showVictory();
        } else {
            this.showGameOver(message);
        }
    }

    showGameOver(message) {
        document.getElementById('gameOverTitle').textContent = 'ELIMINATED';
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('finalGamesCompleted').textContent = this.gamesCompleted.length;
        document.getElementById('finalPlayerName').textContent = this.playerName;
        this.showScreen('gameOverScreen');
    }

    showVictory() {
        document.getElementById('victoryPlayerName').textContent = this.playerName;
        this.showScreen('victoryScreen');
    }

    resetGame() {
        this.clearTimers();
        this.gamesCompleted = [];
        this.currentGame = null;
        
        // Reset all game data
        this.gameData = {
            redlight: { timer: 60, progress: 0, lightState: 'green', isMoving: false },
            honeycomb: { timer: 120, lives: 3, selectedShape: null, canvas: null, ctx: null },
            tugofwar: { playerStrength: 50, opponentStrength: 50, ropePosition: 50 },
            marbles: { playerMarbles: 10, round: 1, maxRounds: 5 },
            bridge: { position: 1, totalSteps: 18, playersRemaining: 16, bridgePath: [] },
            squidgame: { playerHealth: 100, opponentHealth: 100, playerPos: {x: 50, y: 350}, opponentPos: {x: 550, y: 350} }
        };

        this.showGameSelection();
    }

    clearTimers() {
        if (this.redLightTimer) clearInterval(this.redLightTimer);
        if (this.lightChangeTimer) clearInterval(this.lightChangeTimer);
        if (this.honeycombTimer) clearInterval(this.honeycombTimer);
        if (this.tugTimer) clearInterval(this.tugTimer);
        if (this.squidGameLoop) clearInterval(this.squidGameLoop);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SquidGame();
});
