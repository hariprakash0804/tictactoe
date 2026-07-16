# 🕹️ NEON TAC TOE — Retro Arcade Tic-Tac-Toe Game

An interactive, retro-futuristic, browser-based Tic-Tac-Toe arcade game styled like a classic 80s CRT cabinet machine. Designed using **Vanilla HTML5**, **CSS3 (Custom Properties & Keyframe Animations)**, and **Vanilla JavaScript ES6** with **Web Audio API** synthesized audio.

---

## ✨ Features

- **📺 Arcade CRT Screen Overlay** — Animated raster scanlines, screen flicker filters, and neon-glowing title pulses simulate an authentic vintage cabinet.
- **🎮 Three Game Modes**:
  1. **👥 2 PLAYER (PvP)** — Local hotseat mode for two players on the same screen.
  2. **🤖 VS CPU (EASY)** — A balanced AI opponent utilizing a hybrid algorithm (65% random selections, 35% smart block/win logic).
  3. **🧠 VS CPU (HARD)** — An unbeatable AI opponent powered by the **Minimax** recursive decision-tree search algorithm.
- **🔊 Synthesized Audio Effects** — Pure hardware audio sounds (beeps, click alerts, draw alarms, and multi-note winner melodies) generated programmatically using the **Web Audio API** (requires no external `.mp3` or `.wav` files).
- **📊 Retro Scoreboard** — Tracks X wins, Draws, and O wins in-memory with real-time UI counters.
- **🎉 Particle Win Showers** — Colorful neon confetti bursts corresponding to the winning player's color signature.
- **⚡ Winner Connection Highlight** — An SVG-rendered animated stroke connects winning cells, with unused cells fading out smoothly.
- **⌨️ Keyboard Accessibility** — Fully playable with a keyboard. Cells support grid roles, tab index, and `Enter`/`Space` activation.

---

## 🛠️ Technology Stack

- **Structure** — Semantic HTML5 with custom accessibility ARIA labels (`role="grid"`, `role="gridcell"`).
- **Styling** — Modern CSS variables, keyframe animations (`flicker`, `title-pulse`, `pop-in`, `draw-line`, `blink`), CRT screen overlays, and responsive mobile flexboxes.
- **Behavior** — Vanilla ES6 JavaScript featuring state machine handling, Minimax search algorithm, and Web Audio context oscillators.

---

## 📁 Directory Structure

```
tictactoe/
├── tictactoe/                  # Main source directory
│   ├── index.html              # HTML markup structure & font loaders
│   ├── style.css               # Arcade styling, neon colors & CRT effects
│   └── script.js               # Sound generator, Minimax CPU & game logic
└── README.md
```

---

## 🚀 How to Run Locally

Since this is a lightweight static web application, it does not require any build tools, compilers, or server setups.

### 1. Clone the Repository

```bash
git clone https://github.com/hariprakash0804/tictactoe.git
cd tictactoe/tictactoe
```

### 2. Launch in Browser

You can run the game by opening `index.html` directly in any web browser:

- **Windows (PowerShell):**
  ```powershell
  Start-Process "index.html"
  ```
- **macOS:**
  ```bash
  open index.html
  ```
- **Linux:**
  ```bash
  xdg-open index.html
  ```

Alternatively, you can run it using standard VS Code extensions like **Live Server** or via lightweight npm packages like `serve`:

```bash
npx serve .
```

---

## 🧠 Minimax Algorithm Implementation Details

The unbeatable CPU mode employs a minimax backtracking algorithm to evaluate all possible moves recursively. 

- **Maximizing Player:** CPU (`O`) searches for moves yielding the maximum possible value.
- **Minimizing Player:** Human (`X`) is assumed to play optimally to minimize the CPU's score.
- **Scoring Heuristics:**
  - CPU Win = `10 - depth` (promotes faster winning paths)
  - Human Win = `depth - 10` (delays the human's win)
  - Draw = `0`

---

## 📄 License

MIT
