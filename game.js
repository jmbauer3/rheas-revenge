document.addEventListener('DOMContentLoaded', () => {
    const boardSize = 10;
    const players = [
        { name: 'Iris', color: 'red', score: 0 },
        { name: 'Miles', color: 'green', score: 0, isAI: true },
        { name: 'Seth', color: 'blue', score: 0, isAI: true }
    ];
    let currentPlayerIndex = 0;
    let turnStep = 0;
    let currentRound = [];
    const board = [];

    // Create the game board
    const gameBoard = document.getElementById('game-board');
    for (let row = 0; row < boardSize; row++) {
        const rowArray = [];
        for (let col = 0; col < boardSize; col++) {
            const square = document.createElement('div');
            square.classList.add('square', (row + col) % 2 === 0 ? 'black' : 'white');
            square.addEventListener('click', () => handleSquareClick(row, col));
            gameBoard.appendChild(square);
            rowArray.push({ element: square });
        }
        board.push(rowArray);
    }

    // Update current player display
    function updateCurrentPlayerDisplay() {
        document.getElementById('current-player').textContent = `Current Player: ${players[currentPlayerIndex].name}`;
    }

    // Update current task display
    function updateCurrentTaskDisplay() {
        let taskText = '';
        if (turnStep === 0) {
            taskText = `First guess: Guess where ${players[(currentPlayerIndex + 1) % 3].name} (${players[(currentPlayerIndex + 1) % 3].color}) will place a piece.`;
        } else if (turnStep === 1) {
            taskText = `Second guess: Guess where ${players[(currentPlayerIndex + 2) % 3].name} (${players[(currentPlayerIndex + 2) % 3].color}) will place a piece.`;
        } else {
            taskText = 'Place your own piece.';
        }
        document.getElementById('current-task').textContent = taskText;
    }

    // Update score display
    function updateScoreDisplay() {
        document.getElementById('red-score').textContent = `Iris: ${players[0].score}`;
        document.getElementById('green-score').textContent = `Miles: ${players[1].score}`;
        document.getElementById('blue-score').textContent = `Seth: ${players[2].score}`;
    }

    // Clear board highlights
    function clearBoardHighlights() {
        board.forEach(row => row.forEach(cell => {
            cell.element.classList.remove('outline-red', 'outline-green', 'outline-blue');
            cell.element.classList.remove('outline');
        }));
    }

    // Handle square click
    function handleSquareClick(row, col) {
        if (players[currentPlayerIndex].isAI) return; // Skip if AI's turn
        if (turnStep < 2) {
            currentRound.push({ type: 'guess', player: currentPlayerIndex, row, col, target: (currentPlayerIndex + turnStep + 1) % 3 });
            turnStep++;
            updateTurnIndicators();
            updateCurrentTaskDisplay();
        } else {
            currentRound.push({ type: 'move', player: currentPlayerIndex, row, col });
            turnStep = 0;
            currentPlayerIndex = (currentPlayerIndex + 1) % 3;
            updateTurnIndicators();
            updateCurrentPlayerDisplay();
            updateCurrentTaskDisplay();
            if (currentPlayerIndex === 0) {
                processRound();
            } else {
                setTimeout(aiTurn, 1000);
            }
        }
    }

    // Update turn indicators
    function updateTurnIndicators() {
        players.forEach((player, index) => {
            const indicator = document.getElementById(`indicator-${player.name.toLowerCase()}`);
            const outerCircle = indicator.querySelector('.outline-circle:nth-child(1)');
            const innerCircle = indicator.querySelector('.outline-circle:nth-child(2)');
            const solidCircle = indicator.querySelector('.solid-circle');

            outerCircle.style.borderColor = 'transparent';
            innerCircle.style.borderColor = 'transparent';
            solidCircle.style.backgroundColor = 'transparent';

            if (index === currentPlayerIndex) {
                if (turnStep === 1) {
                    outerCircle.style.borderColor = player.color;
                } else if (turnStep === 2) {
                    outerCircle.style.borderColor = player.color;
                    innerCircle.style.borderColor = player.color;
                } else if (turnStep === 0 && currentRound.length === 3) {
                    outerCircle.style.borderColor = player.color;
                    innerCircle.style.borderColor = player.color;
                    solidCircle.style.backgroundColor = player.color;
                }
            }
        });
    }

    // AI turn
    function aiTurn() {
        if (turnStep < 2) {
            const target = (currentPlayerIndex + turnStep + 1) % 3;
            const row = Math.floor(Math.random() * boardSize);
            const col = Math.floor(Math.random() * boardSize);
            currentRound.push({ type: 'guess', player: currentPlayerIndex, row, col, target });
            turnStep++;
            updateTurnIndicators();
            updateCurrentTaskDisplay();
            setTimeout(aiTurn, 1000);
        } else {
            const row = Math.floor(Math.random() * boardSize);
            const col = Math.floor(Math.random() * boardSize);
            currentRound.push({ type: 'move', player: currentPlayerIndex, row, col });
            turnStep = 0;
            currentPlayerIndex = (currentPlayerIndex + 1) % 3;
            updateTurnIndicators();
            updateCurrentPlayerDisplay();
            updateCurrentTaskDisplay();
            if (currentPlayerIndex === 0) {
                processRound();
            } else {
                setTimeout(aiTurn, 1000);
            }
        }
    }

    // Process round
    function processRound() {
        const moves = currentRound.filter(action => action.type === 'move');
        const guesses = currentRound.filter(action => action.type === 'guess');

        const moveCounts = {};
        moves.forEach(move => {
            const key = `${move.row}-${move.col}`;
            if (!moveCounts[key]) {
                moveCounts[key] = 0;
            }
            moveCounts[key]++;
        });

        moves.forEach(move => {
            const key = `${move.row}-${move.col}`;
            if (moveCounts[key] === 1) {
                board[move.row][move.col].element.classList.add(players[move.player].color);
            }
        });

        const predictionResults = document.getElementById('breakdown-box');
        predictionResults.innerHTML = '<p>Prediction Results</p>';
        
        guesses.forEach(guess => {
            const move = moves.find(move => move.player === guess.target && move.row === guess.row && move.col === guess.col);
            if (move) {
                players[guess.player].score++;
                predictionResults.innerHTML += `<p>| ${players[guess.player].name} ➡ ${players[guess.target].name} ✔️</p>`;
            } else {
                predictionResults.innerHTML += `<p>| ${players[guess.player].name} ➡ ${players[guess.target].name} ❌</p>`;
            }
            board[guess.row][guess.col].element.classList.add(`outline-${players[guess.player].color}`);
        });

        updateScoreDisplay();
        clearBoardHighlights();
        currentRound = [];
        setTimeout(() => {
            updateTurnIndicators();
        }, 1000);
    }

    // Start the game
    function startGame() {
        updateCurrentPlayerDisplay();
        updateCurrentTaskDisplay();
        updateTurnIndicators();
    }

    startGame();
});
