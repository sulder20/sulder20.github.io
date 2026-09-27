/* ===== 2048 ===== */
(function () {
  'use strict';

  const GAME_KEY = '2048';

  /* ---------- 布局 ---------- */
  const SIZE = 4;
  const CANVAS = 320;
  const PADDING = 8;
  const GAP = 8;
  const CELL = (CANVAS - PADDING * 2 - GAP * (SIZE - 1)) / SIZE;   // 70

  const WIN_VALUE = 2048;

  /* ---------- DOM ---------- */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ov-title');
  const ovText = document.getElementById('ov-text');
  const ovBtn = document.getElementById('ov-btn');
  const pauseBtn = document.getElementById('btn-pause');
  const restartBtn = document.getElementById('btn-restart');

  const HELP_HTML =
    '<ul>' +
      '<li>电脑：<b>方向键</b> 或 <b>WASD</b> 移动</li>' +
      '<li>手机：在棋盘上<b>滑动</b></li>' +
      '<li>相同数字撞在一起会<b>合并翻倍</b></li>' +
      '<li>每次有效移动后，随机出现 <b>2</b> 或 <b>4</b></li>' +
      '<li>合成 <b>2048</b> 即获胜，可继续挑战更大数字</li>' +
      '<li>棋盘填满且无法移动时游戏结束</li>' +
      '<li><b>P / Esc</b> 暂停或继续</li>' +
    '</ul>';

  /* ---------- 状态 ---------- */
  let grid;                       // 4x4 数字，0 表示空
  let score = 0;
  let best = PAStore.getHigh(GAME_KEY);
  let state = 'idle';             // idle | playing | paused | over | won
  let reached2048 = false;

  bestEl.textContent = best;

  /* ---------- 工具 ---------- */
  function emptyGrid() {
    const g = [];
    for (let y = 0; y < SIZE; y++) g.push(new Array(SIZE).fill(0));
    return g;
  }

  function cloneGrid(g) {
    return g.map(function (row) { return row.slice(); });
  }

  function emptyCells(g) {
    const out = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (!g[y][x]) out.push({ x: x, y: y });
      }
    }
    return out;
  }

  function addRandomTile() {
    const free = emptyCells(grid);
    if (!free.length) return;
    const cell = free[Math.floor(Math.random() * free.length)];
    grid[cell.y][cell.x] = Math.random() < 0.9 ? 2 : 4;
  }

  /* ---------- 移动 ---------- */
  /** 把一行向左合并 */
  function mergeLeft(line) {
    const nums = line.filter(function (v) { return v !== 0; });
    const out = [];
    let gained = 0;

    for (let i = 0; i < nums.length; i++) {
      if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
        const merged = nums[i] * 2;
        out.push(merged);
        gained += merged;
        i++;
      } else {
        out.push(nums[i]);
      }
    }
    while (out.length < SIZE) out.push(0);
    return { line: out, gained: gained };
  }

  /** 从 grid 中按方向取第 i 条线（以「向左」为基准） */
  function getLine(g, dir, i) {
    const line = [];
    for (let j = 0; j < SIZE; j++) {
      if (dir === 'left')       line.push(g[i][j]);
      else if (dir === 'right') line.push(g[i][SIZE - 1 - j]);
      else if (dir === 'up')    line.push(g[j][i]);
      else                      line.push(g[SIZE - 1 - j][i]);
    }
    return line;
  }

  function setLine(g, dir, i, line) {
    for (let j = 0; j < SIZE; j++) {
      if (dir === 'left')       g[i][j] = line[j];
      else if (dir === 'right') g[i][SIZE - 1 - j] = line[j];
      else if (dir === 'up')    g[j][i] = line[j];
      else                      g[SIZE - 1 - j][i] = line[j];
    }
  }

  function move(dir) {
    if (state !== 'playing') return;

    const before = JSON.stringify(grid);
    let gained = 0;

    for (let i = 0; i < SIZE; i++) {
      const line = getLine(grid, dir, i);
      const res = mergeLeft(line);
      setLine(grid, dir, i, res.line);
      gained += res.gained;
    }

    if (JSON.stringify(grid) === before) {
      // 无效移动
      return;
    }

    if (gained > 0) {
      score += gained;
      updateScore();
      PAAudio.score();
    } else {
      PAAudio.move();
    }

    addRandomTile();
    draw();

    if (!reached2048 && hasValue(WIN_VALUE)) {
      reached2048 = true;
      state = 'won';
      PAAudio.win();
      showOverlay('你赢了！', '已合成 2048 · 可继续挑战更高分', '继续玩');
      return;
    }

    if (isGameOver()) {
      gameOver();
    }
  }

  function hasValue(v) {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (grid[y][x] === v) return true;
      }
    }
    return false;
  }

  function canMove() {
    if (emptyCells(grid).length > 0) return true;
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const v = grid[y][x];
        if (x + 1 < SIZE && grid[y][x + 1] === v) return true;
        if (y + 1 < SIZE && grid[y + 1][x] === v) return true;
      }
    }
    return false;
  }

  function isGameOver() {
    return !canMove();
  }

  /* ---------- 渲染 ---------- */
  function paletteFor(v) {
    switch (v) {
      case 0:    return { bg: '#8bac0f', fg: '#9bbc0f', border: false };
      case 2:    return { bg: '#9bbc0f', fg: '#0f380f', border: false };
      case 4:    return { bg: '#8bac0f', fg: '#0f380f', border: false };
      case 8:    return { bg: '#306230', fg: '#9bbc0f', border: false };
      case 16:   return { bg: '#0f380f', fg: '#9bbc0f', border: false };
      case 32:   return { bg: '#0f380f', fg: '#8bac0f', border: false };
      case 64:   return { bg: '#0f380f', fg: '#9bbc0f', border: true  };
      case 128:  return { bg: '#0f380f', fg: '#9bbc0f', border: true  };
      case 256:  return { bg: '#0f380f', fg: '#9bbc0f', border: true  };
      case 512:  return { bg: '#0f380f', fg: '#9bbc0f', border: true  };
      case 1024: return { bg: '#0f380f', fg: '#9bbc0f', border: true  };
      case 2048: return { bg: '#0f380f', fg: '#9bbc0f', border: true  };
      default:   return { bg: '#0f380f', fg: '#9bbc0f', border: true  };
    }
  }

  function fontFor(v) {
    const len = String(v).length;
    if (len <= 2) return 18;
    if (len === 3) return 15;
    if (len === 4) return 12;
    if (len === 5) return 10;
    return 8;
  }

  function cellXY(x, y) {
    return {
      px: PADDING + x * (CELL + GAP),
      py: PADDING + y * (CELL + GAP)
    };
  }

  function draw() {
    // 背景（深色棋盘底）
    ctx.fillStyle = '#306230';
    ctx.fillRect(0, 0, CANVAS, CANVAS);

    // 外框
    ctx.strokeStyle = '#0f380f';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS - 2, CANVAS - 2);

    if (!grid) return;

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const v = grid[y][x];
        const p = cellXY(x, y);
        const pal = paletteFor(v);

        // 格子底
        ctx.fillStyle = pal.bg;
        ctx.fillRect(p.px, p.py, CELL, CELL);

        // 高光边（只给有数字的格）
        if (v !== 0) {
          ctx.fillStyle = 'rgba(155, 188, 15, 0.22)';
          ctx.fillRect(p.px + 2, p.py + 2, CELL - 4, 2);
          ctx.fillStyle = 'rgba(15, 56, 15, 0.35)';
          ctx.fillRect(p.px + 2, p.py + CELL - 4, CELL - 4, 2);
        }

        if (pal.border) {
          ctx.strokeStyle = '#8bac0f';
          ctx.lineWidth = 2;
          ctx.strokeRect(p.px + 1, p.py + 1, CELL - 2, CELL - 2);
        }

        // 数字
        if (v !== 0) {
          ctx.fillStyle = pal.fg;
          ctx.font = fontFor(v) + 'px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(v), p.px + CELL / 2, p.py + CELL / 2 + 1);
        }
      }
    }
  }

  /* ---------- HUD ---------- */
  function updateScore() {
    scoreEl.textContent = score;
  }

  /* ---------- 覆盖层 ---------- */
  function showOverlay(title, text, btn) {
    ovTitle.textContent = title;
    ovText.textContent = text;
    ovBtn.textContent = btn;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  /* ---------- 流程 ---------- */
  function start() {
    grid = emptyGrid();
    score = 0;
    reached2048 = false;
    updateScore();
    pauseBtn.textContent = '暂停';
    hideOverlay();

    addRandomTile();
    addRandomTile();
    draw();

    state = 'playing';
    PAAudio.start();
  }

  function gameOver() {
    state = 'over';
    PAAudio.fail();

    const isNew = PAStore.setHigh(GAME_KEY, score);
    best = PAStore.getHigh(GAME_KEY);
    bestEl.textContent = best;

    if (isNew && score > 0) {
      setTimeout(function () { PAAudio.win(); }, 400);
    }

    pauseBtn.textContent = '暂停';
    showOverlay(
      isNew && score > 0 ? '新纪录！' : '游戏结束',
      '得分 ' + score + '  ·  最高 ' + best,
      '再来一局'
    );
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pauseBtn.textContent = '继续';
      PAAudio.click();
      showOverlay('已暂停', '点击继续按钮恢复游戏', '继续');
    } else if (state === 'paused') {
      resume();
    }
  }

  function resume() {
    state = 'playing';
    pauseBtn.textContent = '暂停';
    hideOverlay();
    PAAudio.click();
  }

  /** 从「赢了」界面继续（把最高分先记一次） */
  function continueAfterWin() {
    state = 'playing';
    hideOverlay();
    PAAudio.click();
    if (isGameOver()) gameOver();
  }

  /* ---------- 键盘 ---------- */
  const KEY_DIRS = {
    ArrowUp: 'up',    w: 'up',    W: 'up',
    ArrowDown: 'down', s: 'down',  S: 'down',
    ArrowLeft: 'left', a: 'left',  A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right'
  };

  document.addEventListener('keydown', function (e) {
    if (PA.isModalOpen()) return;

    const k = e.key;

    if (state === 'idle' || state === 'over') {
      if (k === ' ' || k === 'Spacebar' || k === 'Enter') {
        e.preventDefault();
        start();
      }
      return;
    }

    if (state === 'won') {
      if (k === ' ' || k === 'Spacebar' || k === 'Enter') {
        e.preventDefault();
        continueAfterWin();
      }
      return;
    }

    if (k === 'p' || k === 'P' || k === 'Escape') {
      e.preventDefault();
      togglePause();
      return;
    }

    if (state !== 'playing') return;

    const dir = KEY_DIRS[k];
    if (dir) {
      e.preventDefault();
      move(dir);
    }
  });

  /* ---------- 触摸滑动 ---------- */
  PA.onSwipe(canvas, {
    onUp:    function () { move('up'); },
    onDown:  function () { move('down'); },
    onLeft:  function () { move('left'); },
    onRight: function () { move('right'); }
  });

  /* ---------- 按钮 ---------- */
  ovBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'paused') resume();
    else if (state === 'won') continueAfterWin();
    else start();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    if (state === 'playing') return;
    if (state === 'paused') resume();
    else if (state === 'won') continueAfterWin();
    else start();
  });

  pauseBtn.addEventListener('click', function () {
    if (state === 'idle' || state === 'over' || state === 'won') return;
    togglePause();
  });

  restartBtn.addEventListener('click', function () {
    PAAudio.click();
    start();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') togglePause();
  });

  /* ---------- 启动 ---------- */
  PA.setupGamePage({
    key: GAME_KEY,
    helpTitle: '2048 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '<b>方向键 / WASD</b> 移动 &nbsp;·&nbsp; 手机滑动 &nbsp;·&nbsp; <b>P</b> 暂停'
  });
    // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  // 空闲时先画一版棋盘，让画面不空
  grid = emptyGrid();
  grid[0][0] = 2;
  grid[1][1] = 4;
  grid[2][2] = 8;
  draw();

  PA.autoHelp(GAME_KEY, '2048 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('2048', '方向键 / WASD 移动 · 手机滑动', '开始');
    }
  });
})();