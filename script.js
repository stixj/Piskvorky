const SIZE = 18;
const WIN_LENGTH = 4;

const boardElement = document.getElementById('board');
const infoRow = document.getElementById('game-info-row');
const infoTextElement = document.getElementById('game-info-text');
const playerSetup = document.getElementById('player-setup');
const startBtn = document.getElementById('start-btn');
const player1Input = document.getElementById('player1-name');
const player2Input = document.getElementById('player2-name');
const restartBtn = document.getElementById('restart-btn');

let board = [];
let currentPlayer = 'x'; // 'x' = křížek, 'o' = kolečko
let gameOver = false;
let playerNames = { x: "Hráč 1", o: "Hráč 2" };
let restartEnterListener = null;

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
        showWinnerMessage(`Vyhrál: ${playerNames[currentPlayer]}!`);
        gameOver = true;
        enableRestartOnEnter();
        return;
    }

    // Kontrola remízy
    if (board.flat().every(cell => cell !== '')) {
        showWinnerMessage('Remíza!');
        gameOver = true;
        enableRestartOnEnter();
        return;
    }

    // Střídání hráčů
    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    updatePlayerTurnDisplay();
}

// Funkce pro aktualizaci zobrazení hráče na tahu
function updatePlayerTurnDisplay() {
    infoTextElement.textContent = `Na tahu: ${playerNames[currentPlayer]}`;
    infoTextElement.classList.remove('winner-message', 'player-x-turn', 'player-o-turn');
    
    if (currentPlayer === 'x') {
        infoTextElement.classList.add('player-x-turn');
    } else {
        infoTextElement.classList.add('player-o-turn');
    }
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
    // Zabráníme vícenásobnému přidání posluchače
    if (restartEnterListener) return;
    restartEnterListener = function(e) {
        if (e.key === "Enter") {
            restartBtn.click();
        }
    };
    document.addEventListener('keydown', restartEnterListener);
}

function disableRestartOnEnter() {
    if (restartEnterListener) {
        document.removeEventListener('keydown', restartEnterListener);
        restartEnterListener = null;
    }
}

function enableStartOnEnter() {
    function onEnter(e) {
        if (e.key === "Enter") {
            startBtn.click();
        }
    }
    document.addEventListener('keydown', onEnter);

    // Po spuštění hry odeber posluchač
    startBtn.addEventListener('click', function removeListener() {
        document.removeEventListener('keydown', onEnter);
        startBtn.removeEventListener('click', removeListener);
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
    updatePlayerTurnDisplay();
    hideWinnerMessage();
    playerSetup.style.display = 'none';
    boardElement.style.display = '';
    infoRow.style.display = 'flex';
    disableRestartOnEnter();
    enableStartOnEnter();
});

// Funkce pro restart hry s dotazem na jména
restartBtn.addEventListener('click', () => {
    // Pokud hra není ukončená (tedy je rozběhnutá)
    if (!gameOver) {
        const reallyRestart = confirm("Hra ještě není dohraná. Opravdu chcete začít hrát znovu?");
        if (!reallyRestart) return;
    }

    const samePlayers = confirm("Chcete hrát se stejnými hráči?\nZvolte 'OK' pro stejná jména, 'Zrušit' pro nová jména.");
    if (samePlayers) {
        currentPlayer = 'x';
        gameOver = false;
        initBoard();
        renderBoard();
        updatePlayerTurnDisplay();
        hideWinnerMessage();
    } else {
        // Zobrazit formulář pro nová jména
        player1Input.value = "";
        player2Input.value = "";
        playerSetup.style.display = '';
        boardElement.style.display = 'none';
        infoRow.style.display = 'none';
        infoTextElement.classList.remove('winner-message', 'player-x-turn', 'player-o-turn');
        hideWinnerMessage();
    }
});

// Při zobrazení formuláře pro jména
function showPlayerSetup() {
    playerSetup.style.display = '';
    boardElement.style.display = 'none';
    infoRow.style.display = 'none';
    enableStartOnEnter();
}

// Při inicializaci
showPlayerSetup();

player1Input.addEventListener('keydown', function(e) {
    if (e.key === "Enter") {
        startBtn.click();
    }
});

player2Input.addEventListener('keydown', function(e) {
    if (e.key === "Enter") {
        startBtn.click();
    }
});

// Funkce pro zobrazení vítězné hlášky
function showWinnerMessage(message) {
    // Odstraň předchozí vítěznou hlášku, pokud existuje
    const existingOverlay = document.querySelector('.winner-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Vytvoř novou vítěznou hlášku
    const overlay = document.createElement('div');
    overlay.className = 'winner-overlay';
    overlay.textContent = message;
    
    // Přidej na stránku
    document.body.appendChild(overlay);
    
    // Skryj běžnou informaci o tahu
    infoTextElement.style.display = 'none';
}

// Funkce pro skrytí vítězné hlášky při restartu
function hideWinnerMessage() {
    const overlay = document.querySelector('.winner-overlay');
    if (overlay) {
        overlay.remove();
    }
    infoTextElement.style.display = 'inline-block';
}