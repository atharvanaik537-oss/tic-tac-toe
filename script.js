console.log("✅ script.js loaded");

// ===============================
// DOM Elements
// ===============================
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const newGameBtn = document.getElementById("newGameBtn");
const themeBtn = document.getElementById("themeBtn");
const soundBtn = document.getElementById("soundBtn");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const historyList = document.getElementById("historyList");
const modePvP = document.getElementById("modePvP");
const modePvC = document.getElementById("modePvC");
const playerTurnDiv = document.querySelector(".player-turn");

// Audio
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");

// ===============================
// Game Variables
// ===============================
let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0 };
let gameMode = "PvP";
let gameHistory = [];
let soundEnabled = true;

// ===============================
// Themes
// ===============================
const themes = [
    {
        name: "Dark",
        bg: "linear-gradient(135deg, #1a1a2e, #16213e)",
        text: "#fff",
        cellBg: "rgba(255,255,255,0.05)"
    },
    {
        name: "Nature",
        bg: "linear-gradient(135deg, #134E5E, #71B280)",
        text: "#fff",
        cellBg: "rgba(255,255,255,0.1)"
    },
    {
        name: "Sunset",
        bg: "linear-gradient(135deg, #0F2027, #2C5364)",
        text: "#fff",
        cellBg: "rgba(255,255,255,0.05)"
    }
];
let currentTheme = 0;

// ===============================
// Winning Conditions
// ===============================
const winningConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

// ===============================
// INIT GAME
// ===============================
function initGame() {
    applyTheme();
    updateStatus();

    cells.forEach(cell => cell.addEventListener("click", handleCellClick));
    resetBtn.addEventListener("click", resetRound);
    newGameBtn.addEventListener("click", newGame);
    themeBtn.addEventListener("click", changeTheme);
    soundBtn.addEventListener("click", toggleSound);
    modePvP.addEventListener("click", () => switchGameMode("PvP"));
    modePvC.addEventListener("click", () => switchGameMode("PvC"));
}

// ===============================
// Cell Click
// ===============================
function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (!gameActive || gameState[index] !== "") return;

    playSound(clickSound);
    makeMove(index, currentPlayer);

    if (gameMode === "PvC" && gameActive && currentPlayer === "O") {
        setTimeout(makeComputerMove, 500);
    }
}

// ===============================
// Make Move
// ===============================
function makeMove(index, player) {
    gameState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());

    addToHistory(`Player ${player} chose cell ${index + 1}`);
    checkResult();
}

// ===============================
// Computer AI
// ===============================
function makeComputerMove() {
    if (!gameActive) return;

    let move = findWinningMove("O");
    if (move === -1) move = findWinningMove("X");
    if (move === -1 && gameState[4] === "") move = 4;

    if (move === -1) {
        const freeCells = gameState
            .map((v, i) => v === "" ? i : null)
            .filter(v => v !== null);
        move = freeCells[Math.floor(Math.random() * freeCells.length)];
    }

    playSound(clickSound);
    makeMove(move, "O");
}

// ===============================
// Winning Move Finder
// ===============================
function findWinningMove(player) {
    for (let [a,b,c] of winningConditions) {
        const line = [gameState[a], gameState[b], gameState[c]];
        if (line.filter(v => v === player).length === 2 && line.includes("")) {
            return [a,b,c].find(i => gameState[i] === "");
        }
    }
    return -1;
}

// ===============================
// Check Result
// ===============================
function checkResult() {
    for (let [a,b,c] of winningConditions) {
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            gameActive = false;
            playSound(winSound);
            statusText.innerHTML = `Player <b>${currentPlayer}</b> Wins!`;
            scores[currentPlayer]++;
            updateScoreboard();
            return;
        }
    }

    if (!gameState.includes("")) {
        gameActive = false;
        playSound(drawSound);
        statusText.innerHTML = "Game Draw!";
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();
}

// ===============================
// Status & Score
// ===============================
function updateStatus() {
    statusText.innerHTML = `Player ${currentPlayer}'s Turn`;
    playerTurnDiv?.classList.add("active");
}

function updateScoreboard() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
}

// ===============================
// History
// ===============================
function addToHistory(msg) {
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    gameHistory.unshift(`${time} - ${msg}`);
    if (gameHistory.length > 10) gameHistory.pop();

    historyList.innerHTML = "";
    gameHistory.forEach(h => {
        const li = document.createElement("li");
        li.textContent = h;
        historyList.appendChild(li);
    });
}

// ===============================
// Reset / New Game
// ===============================
function resetRound() {
    gameActive = true;
    currentPlayer = "X";
    gameState.fill("");

    cells.forEach(c => {
        c.textContent = "";
        c.className = "cell";
        c.style.background = themes[currentTheme].cellBg;
    });

    updateStatus();
}

function newGame() {
    if (!confirm("Start a new game?")) return;
    scores = { X: 0, O: 0 };
    updateScoreboard();
    resetRound();
}

// ===============================
// Theme & Sound
// ===============================
function changeTheme() {
    currentTheme = (currentTheme + 1) % themes.length;
    applyTheme();
}

function applyTheme() {
    const theme = themes[currentTheme];
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;

    cells.forEach(c => c.style.background = theme.cellBg);
    themeBtn.innerHTML = `${theme.name} Theme`;
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundBtn.innerHTML = soundEnabled ? "Sound On" : "Sound Off";
}

function playSound(audio) {
    if (soundEnabled && audio) {
        audio.currentTime = 0;
        audio.play().catch(()=>{});
    }
}

// ===============================
// Mode
// ===============================
function switchGameMode(mode) {
    gameMode = mode;
    modePvP.classList.toggle("active", mode === "PvP");
    modePvC.classList.toggle("active", mode === "PvC");
    resetRound();
}

// ===============================
window.addEventListener("DOMContentLoaded", initGame);


// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        findWinningMove,
        makeMove,
        checkResult,
        makeComputerMove
    };
}