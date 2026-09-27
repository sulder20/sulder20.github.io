/* ===== 俄罗斯方块 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'tetris';
  const COLS = 10;
  const ROWS = 20;
  const CELL = 20;
  const BOARD_W = COLS * CELL;   // 200
  const BOARD_H = ROWS * CELL;   // 400
  const PANEL_X = BOARD_W;       // 200
  const CANVAS_W = 300;
  const CANVAS_H = 400;
  const LOCK_DELAY = 480;        // 落地缓冲（毫秒）

  /* 每种方块用「主色 + 中心标记」区分 */
  const PIECES = {
    I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], fill: '#0f380f', mark: '#9bbc0f' },
    O: { shape: [[1,1],[1,1]],                              fill: '#306230', mark: '#9bbc0f' },
    T: { shape: [[0,1,0],[1,1,1],[0,0,0]],                  fill: '#8bac0f', mark: '#0f380f' },
    S: { shape: [[0,1,1],[1,1,0],[0,0,0]],                  fill: '#9bbc0f', mark: '#0f380f' },
    Z: { shape: [[1,1,0],[0,1,1],[0,0,0]],                  fill: '#0f380f', mark: '#8bac0f' },
    J: { shape: [[1,0,0],[1,1,1],[0,0,0]],                  fill: '#306230', mark: '#8bac0f' },
    L: { shape: [[0,0,1],[1,1,1],[0,0,0]],                  fill: '#8bac0f', mark: '#306230' }
  };
  const TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

  /* ---------- DOM ---------- */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ov-title');
  const ovText = document.getElementById('ov-text');
  const ovBtn = document.getElementById('ov-btn');
  const pauseBtn = document.getElementById('btn-pause');
  const restartBtn = document.getElementById('btn-restart');

  const HELP_HTML =
    '<ul>' +
      '<li><b>← →</b> 左右移动，<b>↓</b> 加速下落</li>' +
      '<li><b>↑ / X</b> 顺时针旋转，<b>Z</b> 逆时针旋转</li>' +
      '<li><b>空格</b> 直接落到底部</li>' +
      '<li><b>P / Esc</b> 暂停或继续</li>' +
      '<li>手机：使用下方虚拟按键</li>' +
      '<li>消一行 100 分，四行 800 分，随等级翻倍</li>' +
    '</ul>';

  /* ---------- 状态 ---------- */
  let board;                      // board[y][x] = null | 'I' | 'O' ...
  let cur = null;                 // { type, shape }
  let curX = 0;
  let curY = 0;
  let nextType = null;
  let bag = [];
  let score = 0;
  let level = 1;
  let lines = 0;
  let best = PAStore.getHigh(GAME_KEY);
  let state = 'idle';             // idle | playing | paused | over
  let dropTimer = 0;
  let lockTimer = 0;
  let lastTime = 0;

  bestEl.textContent = best;

  /* ---------- 矩阵工具 ---------- */
  function emptyBoard() {
    const b = [];
    for (let y = 0; y < ROWS; y++) b.push(new Array(COLS).fill(null));
    return b;
  }

  function cloneShape(shape) {
    return shape.map(function (row) { return row.slice(); });
  }

  function rotateCW(m) {
    const n = m.length;
    const out = [];
    for (let y = 0; y < n; y++) out.push(new Array(n).fill(0));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) out[x][n - 1 - y] = m[y][x];
    }
    return out;
  }

  function rotateCCW(m) {
    const n = m.length;
    const out = [];
    for (let y = 0; y < n; y++) out.push(new Array(n).fill(0));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) out[n - 1 - x][y] = m[y][x];
    }
    return out;
  }

  /* ---------- 7-bag 随机 ---------- */
  function refillBag() {
    bag = TYPES.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = bag[i]; bag[i] = bag[j]; bag[j] = t;
    }
  }

  function pullFromBag() {
    if (bag.length === 0) refillBag();
    return bag.pop();
  }

  /* ---------- 碰撞 ---------- */
  function collides(shape, ox, oy) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const bx = ox + x;
        const by = oy + y;
        if (bx < 0 || bx >= COLS) return true;
        if (by >= ROWS) return true;
        if (by < 0) continue;
        if (board[by][bx]) return true;
      }
    }
    return false;
  }

  /* ---------- 绘制 ---------- */
  function drawBlock(px, py, size, def) {
    ctx.fillStyle = def.fill;
    ctx.fillRect(px, py, size, size);
    const inset = Math.max(2, Math.round(size * 0.28));
    ctx.fillStyle = def.mark;
    ctx.fillRect(px + inset, py + inset, size - inset * 2, size - inset * 2);
  }

  function drawGhost(px, py, size) {
    ctx.strokeStyle = '#306230';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
  }

  function drawPanel() {
    const px = PANEL_X + 2;
    const pw = CANVAS_W - px;

    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(px, 0, pw, CANVAS_H);

    ctx.fillStyle = '#0f380f';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEXT', px + pw / 2, 22);

    const boxX = px + 8;
    const boxY = 44;
    const boxW = pw - 16;
    const boxH = 72;

    ctx.fillStyle = '#306230';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);

    if (!nextType) return;

    const shape = PIECES[nextType].shape;
    const size = 12;
    let minX = 99, maxX = -1, minY = 99, maxY = -1;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return;

    const w = (maxX - minX + 1) * size;
    const h = (maxY - minY + 1) * size;
    const startX = boxX + (boxW - w) / 2 - minX * size;
    const startY = boxY + (boxH - h) / 2 - minY * size;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        drawBlock(startX + x * size, startY + y * size, size, PIECES[nextType]);
      }
    }
  }

  function draw() {
    // 背景
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 淡淡网格
    ctx.strokeStyle = 'rgba(48, 98, 48, 0.18)';
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, BOARD_H);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(BOARD_W, y * CELL + 0.5);
      ctx.stroke();
    }

    // 已落下的方块
    if (board) {
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const t = board[y][x];
          if (t) drawBlock(x * CELL, y * CELL, CELL, PIECES[t]);
        }
      }
    }

    // 幽灵 + 当前方块
    if (cur) {
      let gy = curY;
      while (!collides(cur.shape, curX, gy + 1)) gy++;

      for (let y = 0; y < cur.shape.length; y++) {
        for (let x = 0; x < cur.shape[y].length; x++) {
          if (!cur.shape[y][x]) continue;
          if (gy + y >= 0) drawGhost((curX + x) * CELL, (gy + y) * CELL, CELL);
        }
      }

      for (let y = 0; y < cur.shape.length; y++) {
        for (let x = 0; x < cur.shape[y].length; x++) {
          if (!cur.shape[y][x]) continue;
          if (curY + y >= 0) {
            drawBlock((curX + x) * CELL, (curY + y) * CELL, CELL, PIECES[cur.type]);
          }
        }
      }
    }

    drawPanel();
  }

  /* ---------- HUD ---------- */
  function updateHUD() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
  }

  /* ---------- 核心动作 ---------- */
  function tryMove(dx, dy) {
    if (!cur) return false;
    if (collides(cur.shape, curX + dx, curY + dy)) return false;
    curX += dx;
    curY += dy;
    return true;
  }

  function moveH(dx) {
    if (state !== 'playing') return;
    if (tryMove(dx, 0)) {
      lockTimer = 0;
      PAAudio.move();
    }
  }

  function softDrop() {
    if (state !== 'playing') return;
    if (tryMove(0, 1)) {
      score += 1;
      updateHUD();
      lockTimer = 0;
      dropTimer = 0;
    }
  }

  function hardDrop() {
    if (state !== 'playing' || !cur) return;
    let d = 0;
    while (tryMove(0, 1)) d++;
    if (d > 0) {
      score += d * 2;
      updateHUD();
    }
    PAAudio.eat();
    lockPiece();
  }

  function rotate(dir) {
    if (state !== 'playing' || !cur) return;

    const rotated = dir > 0 ? rotateCW(cur.shape) : rotateCCW(cur.shape);
    const kicks = [0, -1, 1, -2, 2];

    for (let i = 0; i < kicks.length; i++) {
      const dx = kicks[i];
      if (!collides(rotated, curX + dx, curY)) {
        cur.shape = rotated;
        curX += dx;
        lockTimer = 0;
        PAAudio.move();
        return;
      }
    }
    // 向上踢一次
    if (!collides(rotated, curX, curY - 1)) {
      cur.shape = rotated;
      curY -= 1;
      lockTimer = 0;
      PAAudio.move();
    }
  }

  function spawn() {
    cur = { type: nextType, shape: cloneShape(PIECES[nextType].shape) };
    nextType = pullFromBag();
    curX = Math.floor((COLS - cur.shape[0].length) / 2);
    curY = 0;
    lockTimer = 0;
    dropTimer = 0;

    if (collides(cur.shape, curX, curY)) {
      cur = null;
      gameOver();
    }
  }

  function lockPiece() {
    if (!cur) return;

    for (let y = 0; y < cur.shape.length; y++) {
      for (let x = 0; x < cur.shape[y].length; x++) {
        if (!cur.shape[y][x]) continue;
        const bx = curX + x;
        const by = curY + y;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
          board[by][bx] = cur.type;
        }
      }
    }

    cur = null;
    clearLines();
    updateHUD();

    if (state !== 'playing') return;
    spawn();
  }

  function clearLines() {
    // 1. 找出所有满行
    const fullRows = [];
    for (let y = 0; y < ROWS; y++) {
      let isFull = true;
      for (let x = 0; x < COLS; x++) {
        if (!board[y][x]) { isFull = false; break; }
      }
      if (isFull) fullRows.push(y);
    }

    if (fullRows.length === 0) return;

    // 2. 从底部往上删除满行
    for (let i = fullRows.length - 1; i >= 0; i--) {
      board.splice(fullRows[i], 1);
    }

    // 3. 在顶部补齐相同数量的空行
    for (let i = 0; i < fullRows.length; i++) {
      board.unshift(new Array(COLS).fill(null));
    }

    // 4. 计分
    const cleared = fullRows.length;
    const base = [0, 100, 300, 500, 800];
    score += base[cleared] * level;
    lines += cleared;

    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel > level) {
      level = newLevel;
      PAAudio.win();
    } else {
      PAAudio.score();
    }
    updateHUD();
  }

  function dropInterval() {
    return Math.max(80, 800 - (level - 1) * 65);
  }

  /* ---------- 主循环 ---------- */
  function loop(t) {
    if (state !== 'playing') return;

    if (!lastTime) lastTime = t;
    const dt = Math.min(t - lastTime, 120);
    lastTime = t;

    if (cur) {
      dropTimer += dt;

      if (dropTimer >= dropInterval()) {
        dropTimer = 0;
        if (tryMove(0, 1)) lockTimer = 0;
      }

      if (collides(cur.shape, curX, curY + 1)) {
        lockTimer += dt;
        if (lockTimer >= LOCK_DELAY) lockPiece();
      } else {
        lockTimer = 0;
      }
    }

    draw();

    if (state === 'playing') requestAnimationFrame(loop);
  }

  /* ---------- 流程 ---------- */
  function start() {
    board = emptyBoard();
    bag = [];
    nextType = pullFromBag();
    cur = null;
    score = 0;
    level = 1;
    lines = 0;
    dropTimer = 0;
    lockTimer = 0;
    lastTime = 0;

    updateHUD();
    pauseBtn.textContent = '暂停';
    hideOverlay();

    state = 'playing';
    spawn();
    PAAudio.start();
    requestAnimationFrame(loop);
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
      '得分 ' + score + '  ·  等级 ' + level,
      '再来一局'
    );
    draw();
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
    lastTime = 0;
    dropTimer = 0;
    lockTimer = 0;
    hideOverlay();
    PAAudio.click();
    requestAnimationFrame(loop);
  }

  function showOverlay(title, text, btn) {
    ovTitle.textContent = title;
    ovText.textContent = text;
    ovBtn.textContent = btn;
    overlay.classList.remove('hidden');
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  /* ---------- 键盘 ---------- */
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

    if (k === 'p' || k === 'P' || k === 'Escape') {
      e.preventDefault();
      togglePause();
      return;
    }

    if (state !== 'playing') return;

    switch (k) {
      case 'ArrowLeft':  case 'a': case 'A': e.preventDefault(); moveH(-1);  break;
      case 'ArrowRight': case 'd': case 'D': e.preventDefault(); moveH(1);   break;
      case 'ArrowDown':  case 's': case 'S': e.preventDefault(); softDrop(); break;
      case 'ArrowUp':    case 'w': case 'W':
      case 'x': case 'X':                    e.preventDefault(); rotate(1);  break;
      case 'z': case 'Z':                    e.preventDefault(); rotate(-1); break;
      case ' ':                              e.preventDefault(); hardDrop(); break;
    }
  });

  /* ---------- 虚拟按键（带长按连发） ---------- */
  function bindHold(btn, fn, initialDelay, repeatDelay) {
    let t1 = null, t2 = null;

    function stop() {
      if (t1) { clearTimeout(t1); t1 = null; }
      if (t2) { clearInterval(t2); t2 = null; }
    }

    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (state !== 'playing') return;
      fn();
      t1 = setTimeout(function () {
        t2 = setInterval(function () {
          if (state === 'playing') fn();
        }, repeatDelay);
      }, initialDelay);
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      btn.addEventListener(evt, stop);
    });

    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  const actLeft   = document.querySelector('[data-act="left"]');
  const actRight  = document.querySelector('[data-act="right"]');
  const actDown   = document.querySelector('[data-act="down"]');
  const actRotate = document.querySelector('[data-act="rotate"]');
  const actDrop   = document.querySelector('[data-act="drop"]');

  bindHold(actLeft,  function () { moveH(-1);  }, 180, 70);
  bindHold(actRight, function () { moveH(1);   }, 180, 70);
  bindHold(actDown,  function () { softDrop(); }, 160, 55);

  actRotate.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    rotate(1);
  });
  actRotate.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  actDrop.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    hardDrop();
  });
  actDrop.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ---------- 按钮 ---------- */
  ovBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'paused') resume();
    else start();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    if (state === 'playing') return;
    if (state === 'paused') resume();
    else start();
  });

  pauseBtn.addEventListener('click', function () {
    if (state === 'idle' || state === 'over') return;
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
    helpTitle: '俄罗斯方块 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '<b>← →</b> 移动 &nbsp;·&nbsp; <b>↑</b> 旋转 &nbsp;·&nbsp; <b>空格</b> 落下 &nbsp;·&nbsp; <b>P</b> 暂停'
  });
    // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  // 空闲时先画一版，让画面不空白
  board = emptyBoard();
  nextType = 'T';
  draw();

  PA.autoHelp(GAME_KEY, '俄罗斯方块 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('俄罗斯方块', '方向键移动 · ↑ 旋转 · 空格落下', '开始');
    }
  });
})();