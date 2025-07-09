const SIZE = 18;
const WIN_LENGTH = 4;

const boardElement = document.getElementById('board');
const infoRow = document.getElementById('game-info-row');
const infoElement = document.getElementById('game-info');
const playerSetup = document.getElementById('player-setup');
const startBtn = document.getElementById('start-btn');
const player1Input = document.getElementById('player1-name');
const player2Input = document.getElementById('player2-name');
const restartBtn = document.getElementById('restart-btn');

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
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <line x1="6" y1="6" x2="26" y2="26" stroke="#1976d2" stroke-width="6" stroke-linecap="round"/>
                    <line x1="26" y1="6" x2="6" y2="26" stroke="#1976d2" stroke-width="6" stroke-linecap="round"/>
                  </svg>
                `;
            } else if (board[row][col] === 'o') {
                cell.classList.add('o');
                // SVG kolečko
                cell.innerHTML = `
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="10" stroke="#000" stroke-width="6" fill="none"/>
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
        infoElement.classList.add('winner-message');
        gameOver = true;
        enableRestartOnEnter();
        return;
    }

    // Kontrola remízy
    if (board.flat().every(cell => cell !== '')) {
        infoElement.textContent = 'Remíza!';
        infoElement.classList.remove('winner-message');
        gameOver = true;
        enableRestartOnEnter();
        return;
    }

    // Střídání hráčů
    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    infoElement.textContent = `Na tahu: ${playerNames[currentPlayer]}`;
    infoElement.classList.remove('winner-message');
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

function enableRestartOnEnter() {
    function onEnter(e) {
        if (e.key === "Enter") {
            restartBtn.click();
        }
    }
    document.addEventListener('keydown', onEnter);

    // Po restartu odeber posluchač, aby se nespouštěl vícekrát
    restartBtn.addEventListener('click', function removeListener() {
        document.removeEventListener('keydown', onEnter);
        restartBtn.removeEventListener('click', removeListener);
    });
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
    infoElement.classList.remove('winner-message');
    playerSetup.style.display = 'none';
    boardElement.style.display = '';
    infoRow.style.display = 'flex';
});

// Funkce pro restart hry s dotazem na jména
restartBtn.addEventListener('click', () => {
    const reallyRestart = confirm("Opravdu chcete začít hrát znovu?");
    if (!reallyRestart) return;

    const samePlayers = confirm("Chcete hrát se stejnými hráči?\nZvolte 'OK' pro stejná jména, 'Zrušit' pro nová jména.");
    if (samePlayers) {
        currentPlayer = 'x';
        gameOver = false;
        initBoard();
        renderBoard();
        infoElement.textContent = `Na tahu: ${playerNames[currentPlayer]}`;
        infoElement.classList.remove('winner-message');
    } else {
        // Zobrazit formulář pro nová jména
        player1Input.value = "";
        player2Input.value = "";
        playerSetup.style.display = '';
        boardElement.style.display = 'none';
        infoRow.style.display = 'none';
    }
});

// Inicializace – zobraz pouze formulář na jména
playerSetup.style.display = '';
boardElement.style.display = 'none';
infoRow.style.display = 'none';