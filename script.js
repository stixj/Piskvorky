const SIZE = 25;
const WIN_LENGTH = 4;

const boardElement = document.getElementById('board');
const infoElement = document.getElementById('game-info');
const playerSetup = document.getElementById('player-setup');
const startBtn = document.getElementById('start-btn');
const player1Input = document.getElementById('player1-name');
const player2Input = document.getElementById('player2-name');

let board = [];
let currentPlayer = 'x'; // 'x' = křížek, 'o' = kolečko
let gameOver = false;
let playerNames = { x: "Hráč 1", o: "Hráč 2" };

// Inicializace prázdného pole
function initBoard() {
    board = [];
    for (let i = 0; i < SIZE; i++) {
        board.push(new Array(SIZE).fill(''));
    }
}

// Vykreslení hracího pole
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            if (board[row][col] === 'x') {
                cell.classList.add('x');
                // SVG křížek
                cell.innerHTML = `
                  <svg width="22" height="22" viewBox="0 0 22 22">
                    <line x1="4" y1="4" x2="18" y2="18" stroke="#1976d2" stroke-width="4" stroke-linecap="round"/>
                    <line x1="18" y1="4" x2="4" y2="18" stroke="#1976d2" stroke-width="4" stroke-linecap="round"/>
                  </svg>
                `;
            } else if (board[row][col] === 'o') {
                cell.classList.add('o');
                // SVG kolečko
                cell.innerHTML = `
                  <svg width="22" height="22" viewBox="0 0 22 22">
                    <circle cx="11" cy="11" r="8" stroke="#000" stroke-width="4" fill="none"/>
                  </svg>
                `;
            }
            cell.addEventListener('click', onCellClick);
            boardElement.appendChild(cell);
        }
    }
}

// Zpracování kliknutí na políčko
function onCellClick(e) {
    if (gameOver) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (board[row][col] !== '') return;

    board[row][col] = currentPlayer;
    renderBoard();

    if (checkWin(row, col, currentPlayer)) {
        infoElement.textContent = `Vyhrál: ${playerNames[currentPlayer]}!`;
        gameOver = true;
        return;
    }

    // Kontrola remízy
    if (board.flat().every(cell => cell !== '')) {
        infoElement.textContent = 'Remíza!';
        gameOver = true;
        return;
    }

    // Střídání hráčů
    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    infoElement.textContent = `Na tahu: ${playerNames[currentPlayer]}`;
}

// Kontrola výhry
function checkWin(row, col, player) {
    return (
        countInDirection(row, col, player, 0, 1) + countInDirection(row, col, player, 0, -1) - 1 >= WIN_LENGTH ||
        countInDirection(row, col, player, 1, 0) + countInDirection(row, col, player, -1, 0) - 1 >= WIN_LENGTH ||
        countInDirection(row, col, player, 1, 1) + countInDirection(row, col, player, -1, -1) - 1 >= WIN_LENGTH ||
        countInDirection(row, col, player, 1, -1) + countInDirection(row, col, player, -1, 1) - 1 >= WIN_LENGTH
    );
}

// Pomocná funkce pro počítání v daném směru
function countInDirection(row, col, player, dRow, dCol) {
    let count = 0;
    let r = row, c = col;
    while (
        r >= 0 && r < SIZE &&
        c >= 0 && c < SIZE &&
        board[r][c] === player
    ) {
        count++;
        r += dRow;
        c += dCol;
    }
    return count;
}

// Spuštění hry po zadání jmen
startBtn.addEventListener('click', () => {
    const name1 = player1Input.value.trim() || "Hráč 1";
    const name2 = player2Input.value.trim() || "Hráč 2";
    playerNames = { x: name1, o: name2 };
    currentPlayer = 'x';
    gameOver = false;
    initBoard();
    renderBoard();
    infoElement.textContent = `Na tahu: ${playerNames[currentPlayer]}`;
    playerSetup.style.display = 'none';
    boardElement.style.display = '';
    infoElement.style.display = '';
});

// Volitelné: možnost restartu hry (ponechávám pro případné rozšíření)
function resetGame() {
    currentPlayer = 'x';
    gameOver = false;
    initBoard();
    renderBoard();
    infoElement.textContent = `Na tahu: ${playerNames[currentPlayer]}`;
}

// Inicializace – zobraz pouze formulář na jména
playerSetup.style.display = '';
boardElement.style.display = 'none';
infoElement.style.display = 'none';