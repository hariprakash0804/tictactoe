(() => {
  'use strict';

  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const resetBtn = document.getElementById('reset');
  const muteBtn = document.getElementById('muteBtn');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const xScoreEl = document.getElementById('xScore');
  const oScoreEl = document.getElementById('oScore');
  const drawsEl = document.getElementById('draws');
  const winLinePath = document.getElementById('winLinePath');
  const confettiLayer = document.getElementById('confettiLayer');

  const WIN_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  // Approximate cell-center coordinates on a 0-300 viewBox, used to draw the win line.
  const LINE_COORDS = {
    '0,1,2': [20, 50, 280, 50],
    '3,4,5': [20, 150, 280, 150],
    '6,7,8': [20, 250, 280, 250],
    '0,3,6': [50, 20, 50, 280],
    '1,4,7': [150, 20, 150, 280],
    '2,5,8': [250, 20, 250, 280],
    '0,4,8': [20, 20, 280, 280],
    '2,4,6': [280, 20, 20, 280]
  };

  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let gameActive = true;
  let mode = 'pvp'; // 'pvp' | 'ai-easy' | 'ai-hard'
  let muted = false;
  let scores = { X: 0, O: 0, draws: 0 };

  const HUMAN = 'X';
  const CPU = 'O';

  // ---------- Sound (Web Audio, no external assets) ----------

  let audioCtx = null;
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function beep(freq, duration, type = 'square', vol = 0.05) {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  }

  const sound = {
    place: () => beep(420, 0.08, 'square', 0.04),
    win: () => { beep(523, 0.12); setTimeout(() => beep(659, 0.12), 110); setTimeout(() => beep(784, 0.18), 220); },
    draw: () => beep(160, 0.3, 'sawtooth', 0.04),
    click: () => beep(300, 0.05, 'square', 0.03)
  };

  // ---------- Board rendering ----------

  function createBoard() {
    boardEl.innerHTML = '';
    board.forEach((_, i) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = i;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', '0');
      cell.addEventListener('click', () => handleMove(i));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleMove(i);
        }
      });
      boardEl.appendChild(cell);
    });
    clearWinLine();
  }

  function paintCell(index, player) {
    const cell = boardEl.children[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'placed');
  }

  function clearWinLine() {
    winLinePath.classList.remove('draw');
    winLinePath.setAttribute('x1', 0);
    winLinePath.setAttribute('y1', 0);
    winLinePath.setAttribute('x2', 0);
    winLinePath.setAttribute('y2', 0);
  }

  function drawWinLine(combo) {
    const key = combo.join(',');
    const coords = LINE_COORDS[key];
    if (!coords) return;
    const [x1, y1, x2, y2] = coords;
    winLinePath.setAttribute('x1', x1);
    winLinePath.setAttribute('y1', y1);
    winLinePath.setAttribute('x2', x2);
    winLinePath.setAttribute('y2', y2);
    requestAnimationFrame(() => winLinePath.classList.add('draw'));
  }

  // ---------- Game logic ----------

  function handleMove(index) {
    if (!gameActive || board[index] !== '') return;
    if (mode !== 'pvp' && currentPlayer === CPU) return; // block clicks during CPU turn

    placeMark(index, currentPlayer);

    const result = evaluateBoard(board);
    if (result) return finishGame(result);

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();

    if (mode !== 'pvp' && currentPlayer === CPU && gameActive) {
      setTimeout(cpuMove, 380);
    }
  }

  function placeMark(index, player) {
    board[index] = player;
    paintCell(index, player);
    sound.place();
  }

  function evaluateBoard(b) {
    for (const combo of WIN_COMBOS) {
      const [a, c, d] = combo;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], combo };
      }
    }
    if (!b.includes('')) return { winner: null, combo: null }; // draw
    return null;
  }

  function finishGame(result) {
    gameActive = false;
    if (result.winner) {
      statusEl.textContent = mode !== 'pvp' && result.winner === CPU
        ? 'CPU WINS — TRY AGAIN'
        : `PLAYER ${result.winner} WINS!`;
      result.combo.forEach(i => boardEl.children[i].classList.add('win'));
      board.forEach((_, i) => {
        if (!result.combo.includes(i)) boardEl.children[i].classList.add('fade');
      });
      drawWinLine(result.combo);
      scores[result.winner]++;
      sound.win();
      launchConfetti(result.winner === 'X' ? '#00f6ff' : '#ff2fd6');
    } else {
      statusEl.textContent = "IT'S A DRAW";
      scores.draws++;
      sound.draw();
    }
    updateScoreboard();
  }

  function updateStatus() {
    if (mode !== 'pvp' && currentPlayer === CPU) {
      statusEl.textContent = 'CPU IS THINKING…';
    } else {
      const label = mode !== 'pvp' ? 'YOUR MOVE' : `PLAYER ${currentPlayer} — YOUR MOVE`;
      statusEl.textContent = label;
    }
  }

  function updateScoreboard() {
    xScoreEl.textContent = scores.X;
    oScoreEl.textContent = scores.O;
    drawsEl.textContent = scores.draws;
  }

  function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    createBoard();
    updateStatus();
  }

  // ---------- CPU opponent ----------

  function cpuMove() {
    if (!gameActive) return;
    const empties = board.reduce((acc, v, i) => (v === '' ? [...acc, i] : acc), []);
    if (empties.length === 0) return;

    let choice;
    if (mode === 'ai-easy') {
      // 65% random, 35% smart — beatable but not careless
      choice = Math.random() < 0.65
        ? empties[Math.floor(Math.random() * empties.length)]
        : bestMove(board, CPU);
    } else {
      choice = bestMove(board, CPU); // unbeatable minimax
    }

    placeMark(choice, CPU);
    const result = evaluateBoard(board);
    if (result) return finishGame(result);

    currentPlayer = HUMAN;
    updateStatus();
  }

  function bestMove(b, player) {
    let best = { score: -Infinity, index: -1 };
    for (let i = 0; i < 9; i++) {
      if (b[i] !== '') continue;
      b[i] = player;
      const score = minimax(b, 0, false, player);
      b[i] = '';
      if (score > best.score) best = { score, index: i };
    }
    return best.index;
  }

  function minimax(b, depth, isMaximizing, player) {
    const opponent = player === 'X' ? 'O' : 'X';
    const result = evaluateBoard(b);
    if (result) {
      if (result.winner === player) return 10 - depth;
      if (result.winner === opponent) return depth - 10;
      return 0;
    }

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] !== '') continue;
        b[i] = player;
        best = Math.max(best, minimax(b, depth + 1, false, player));
        b[i] = '';
      }
      return best;
    } else {
      let worst = Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] !== '') continue;
        b[i] = opponent;
        worst = Math.min(worst, minimax(b, depth + 1, true, player));
        b[i] = '';
      }
      return worst;
    }
  }

  // ---------- Confetti ----------

  function launchConfetti(color) {
    const colors = [color, '#ffd23f', '#ffffff'];
    for (let i = 0; i < 36; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetto');
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.4 + Math.random() * 1.2) + 's';
      piece.style.animationDelay = (Math.random() * 0.3) + 's';
      confettiLayer.appendChild(piece);
      setTimeout(() => piece.remove(), 3200);
    }
  }

  // ---------- Controls ----------

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sound.click();
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      resetGame();
    });
  });

  muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  resetBtn.addEventListener('click', () => {
    sound.click();
    resetGame();
  });

  // ---------- Init ----------

  createBoard();
  updateStatus();
  updateScoreboard();
})();
