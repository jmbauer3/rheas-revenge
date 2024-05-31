document.addEventListener('DOMContentLoaded', () => {
    const boardSize = 10;
    const players = [
        { name: 'Iris', color: 'red', score: 0, isAI: false, pieces: [], guesses: [] },
        { name: 'Miles', color: 'green', score: 0, isAI: true, pieces: [], guesses: [] },
        { name: 'Seth', color: 'blue', score: 0, isAI: true, pieces: [], guesses: [] }
    ];
    let currentPlayerIndex = 0;
    let turnStep = 0; // 0: Guess for Player 1, 1: Guess for Player 2, 2: Place Piece
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
            rowArray.push({ element: square, row, col, occupiedBy: null });
        }
        board.push(rowArray);
    }
    
    // Update display function
    function updateDisplay() {
        const player = players[currentPlayerIndex];
        document.getElementById('current-player').textContent = `Current Player: ${player.name}`;
        document.getElementById('current-task').textContent = getCurrentTaskDescription();
        document.getElementById('red-score').textContent = `Iris: ${players[0].score}`;
        document.getElementById('green-score').textContent = `Miles: ${players[1].score}`;
        document.getElementById('blue-score').textContent = `Seth: ${players[2].score}`;
    }


    // Get current task description function
    function getCurrentTaskDescription() {
        const player = players[currentPlayerIndex];
        if (turnStep === 0 || turnStep === 1) {
            const targetPlayer = players[(currentPlayerIndex + turnStep + 1) % players.length];
            return `${player.name}, guess where ${targetPlayer.name} (${targetPlayer.color}) will place a piece.`;
        } else if (turnStep === 2) {
            return `${player.name}, place your piece on the board.`;
        }
    }

    // Handle square click function
    function handleSquareClick(row, col) {
        const player = players[currentPlayerIndex];
        if (player.isAI) return;

        if (turnStep === 0 || turnStep === 1) {
            if (isValidGuess(player, row, col)) {
                makeGuess(player, row, col);
            } else {
                alert("Invalid guess! Must guess adjacent to your own pieces or on an opponent's piece.");
            }
        } else if (turnStep === 2) {
            if (isValidMove(player, row, col)) {
                placePiece(player, row, col);
            } else {
                alert("Invalid move! Must place adjacent to an existing piece or on an opponent's piece.");
            }
        }
    }

    // Make a guess function
    function makeGuess(player, row, col) {
        player.guesses.push({ row, col });
        board[row][col].element.classList.add(`outline-${player.color}`);
        turnStep++;
        if (turnStep === 3) {
            finalizeTurn();
        } else {
            updateDisplay();
        }
    }

    // Place a piece function
    function placePiece(player, row, col) {
        capturePiece(player, row, col);
        //board[row][col].occupiedBy = player;
        player.pieces.push({ row, col });
        board[row][col].element.className = `square ${player.color} transparent`;
        finalizeTurn();
    }

    // Validate move function
    function isValidMove(player, row, col, isGuess = false) {
        if (board[row][col].occupiedBy && board[row][col].occupiedBy !== player) {
            return player.pieces.some(p => Math.abs(p.row - row) + Math.abs(p.col - col) === 1);
        }
        if (player.pieces.length === 0) return true;
        if (isGuess) {
            const targetPlayer = players[(currentPlayerIndex + turnStep + 1) % players.length];
            
            const boardPieces = [];
            board.forEach(row => row.forEach(square => {
                if (square.occupiedBy && square.occupiedBy.name === targetPlayer.name){
                    boardPieces.push(square);
                }
            }));

            if (boardPieces.length === 0) return true;
            return boardPieces.some(p => Math.abs(p.row - row) + Math.abs(p.col - col) === 1);

            //if (targetPlayer.pieces.length === 0) return true;
            //return targetPlayer.pieces.some(p => Math.abs(p.row - row) + Math.abs(p.col - col) === 1);
        }
        return player.pieces.some(p => Math.abs(p.row - row) + Math.abs(p.col - col) === 1);
    }

    // Capture opponent's piece function
    function capturePiece(player, row, col) {
        if (board[row][col].occupiedBy && board[row][col].occupiedBy !== player) {
            board[row][col].occupiedBy.pieces = board[row][col].occupiedBy.pieces.filter(p => p.row !== row || p.col !== col);
        }
    }

    // Finalize turn function
    function finalizeTurn() {
        // Delete one random square from the board
        //deleteRandomSquare();

        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        if (currentPlayerIndex === 0) {
            players.forEach(player => 
                player.pieces.forEach(piece => {
                board[piece.row][piece.col].occupiedBy = player;
            }));

            processRoundResults();
            clearGuesses();
            deleteRandomSquare();
        }
        turnStep = 0;
        updateDisplay();
        if (players[currentPlayerIndex].isAI) {
            setTimeout(() => aiMakeMove(players[currentPlayerIndex]), 2000);
            //aiMakeMove(players[currentPlayerIndex]);
        }
    }

    // Process round results function
    function processRoundResults() {
        const results = document.getElementById('prediction-results');
        results.innerHTML = '';
        players.forEach(player => {
            player.guesses.forEach((guess, index) => {
                const targetPlayer = players[(players.indexOf(player) + index + 1) % players.length];
                const move = board[guess.row][guess.col].occupiedBy;
                const result = move && move !== player ? '✔️' : '❌';
                const resultText = `${player.name} ➡ ${targetPlayer.name} ${result}`;
                const resultElement = document.createElement('div');
                resultElement.textContent = resultText;
                results.appendChild(resultElement);
                if (result === '✔️') player.score++;
            });
            if (!player.guesses.some(guess => board[guess.row][guess.col].occupiedBy === player)) {
                player.score++;
            }
        });
        board.forEach(row => row.forEach(square => {
            if (square.occupiedBy) {
                square.element.classList.remove('transparent');
            }
        }));
    }

    // Clear guesses function
    function clearGuesses() {
        players.forEach(player => {
            player.guesses.forEach(guess => {
                board[guess.row][guess.col].element.classList.remove(`outline-${player.color}`);
            });
            player.guesses = [];
        });
    }

    // AI make move function
    function aiMakeMove(player) {
        //while (player.guesses.length < 2) {
            const targetPlayer = players[(currentPlayerIndex + player.guesses.length + 1) % players.length];
            const guess = getValidRandomMove(player, true);
            player.guesses.push(guess);
            board[guess.row][guess.col].element.classList.add(`outline-${player.color}`);
        //}
        turnStep++;
        updateDisplay();

        const targetPlayer2 = players[(currentPlayerIndex + player.guesses.length + 1) % players.length];
        const guess2 = getValidRandomMove(player, true);
        player.guesses.push(guess2);
        board[guess2.row][guess2.col].element.classList.add(`outline-${player.color}`);

        turnStep++;
        updateDisplay();

        const move = getValidRandomMove(player);
        capturePiece(player, move.row, move.col);
        board[move.row][move.col].occupiedBy = player;
        player.pieces.push(move);
        board[move.row][move.col].element.className = `square ${player.color} transparent`;
        //finalizeTurn();
        setTimeout(() => finalizeTurn(), 2000);

    }

    // Get valid random move function
    function getValidRandomMove(player, isGuess = false) {
        let row, col;
        do {
            row = Math.floor(Math.random() * boardSize);
            col = Math.floor(Math.random() * boardSize);
        } while (!isValidMove(player, row, col, isGuess));
        return { row, col };
    }

    // Delete one random square from the board
    function deleteRandomSquare() {
        let emptySquares = [];
        board.forEach(row => {
            row.forEach(square => {
                if (square.occupiedBy !== 'deleted') {
                    emptySquares.push(square);
                }
            });
        });

        if (emptySquares.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptySquares.length);
            const square = emptySquares[randomIndex];
            square.element.className = `square deleted`;
           // square.element.classList.add('deleted');
            square.occupiedBy = 'deleted';
        }
    }

    // Check if a guess is valid
    function isValidGuess(player, row, col) {
        return isValidMove(player, row, col, true);
    }

    updateDisplay(); // Initial display update
});
