/* ===== 数字合成 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'merge';

  const SIZE = 4;
  const CANVAS = 320;
  const PADDING = 8;
  const GAP = 8;
  const CELL = (CANVAS - PADDING * 2 - GAP * (SIZE - 1)) / SIZE;

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
      '<li>点一个数字<b>选中</b>它（再点一次取消）</li>' +
      '<li>点<b>相邻的空格</b> → 数字<b>移过去</b>，并生成一个新数字</li>' +
      '<li>点<b>相邻的相同数字</b> → <b>合并翻倍</b>，并生成一个新数字</li>' +
      '<li>得分 = 合并后的数字</li>' +
      '<li><b>每次操作都会让棋盘更满</b>，在填满前尽量多合并</li>' +
      '<li><b>棋盘填满、且没有相邻相同数字时结束</b></li>' +
      '<li><b>P / Esc</b> 暂停或继续</li>' +
    '</ul>';

  /* ---------- 状态 ---------- */
  let grid;
  let selected = null;
  let score = 0;
  let best = PAStore.getHigh(GAME_KEY);
  let state = 'idle';
  let flashTimer = 0;
  let flashAt = null;
  let moveAnim = null;
  let shakeTimer = 0;

  bestEl.textContent = best;

  /* ---------- 工具 ---------- */
  function emptyGrid() {
    const g = [];
    for (let y = 0; y < SIZE; y++) g.push(new Array(SIZE).fill(0));
    return g;
  }

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function emptyCells() {
    const out = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (!grid[y][x]) out.push({ x: x, y: y });
      }
    }
    return out;
  }

  function isFull() {
    return emptyCells().length === 0;
  }

  function hasAdjacentSame() {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const v = grid[y][x];
        if (!v) continue;
        if (x + 1 < SIZE && grid[y][x + 1] === v) return true;
        if (y + 1 < SIZE && grid[y + 1][x] === v) return true;
      }
    }
    return false;
  }

  function adjacent(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  }

  /* ---------- 生成 ---------- */
  function spawnNumber() {
    const free = emptyCells();
    if (!free.length) return;
    const c = free[Math.floor(Math.random() * free.length)];
    grid[c.y][c.x] = Math.random() < 0.85 ? 2 : 4;
  }

  function spawnInitial() {
    for (let attempt = 0; attempt < 120; attempt++) {
      grid = emptyGrid();
      const cells = [];
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) cells.push({ x: x, y: y });
      }
      shuffleArray(cells);

      // 4 个 2 + 4 个 4，共 8 个数字
      for (let i = 0; i < 4; i++) grid[cells[i].y][cells[i].x] = 2;
      for (let i = 4; i < 8; i++) grid[cells[i].y][cells[i].x] = 4;

      if (hasAdjacentSame()) return;
    }
    // 极端兜底
    grid = emptyGrid();
    grid[0][0] = 2; grid[0][1] = 2;
    grid[1][0] = 4; grid[1][1] = 4;
    grid[2][2] = 2; grid[2][3] = 2;
    grid[3][2] = 4; grid[3][3] = 4;
  }

  /* ---------- 渲染 ---------- */
  function paletteFor(v) {
    switch (v) {
      case 0:    return { bg: '#8bac0f', fg: '#9bbc0f' };
      case 2:    return { bg: '#9bbc0f', fg: '#0f380f' };
      case 4:    return { bg: '#8bac0f', fg: '#0f380f' };
      case 8:    return { bg: '#306230', fg: '#9bbc0f' };
      case 16:   return { bg: '#0f380f', fg: '#9bbc0f' };
      case 32:   return { bg: '#0f380f', fg: '#8bac0f' };
      default:   return { bg: '#0f380f', fg: '#9bbc0f' };
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
    ctx.fillStyle = '#306230';
    ctx.fillRect(0, 0, CANVAS, CANVAS);

    ctx.strokeStyle = '#0f380f';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS - 2, CANVAS - 2);

    if (!grid) return;

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const v = grid[y][x];
        const p = cellXY(x, y);
        const pal = paletteFor(v);

        ctx.fillStyle = pal.bg;
        ctx.fillRect(p.px, p.py, CELL, CELL);

        if (v !== 0) {
          ctx.fillStyle = 'rgba(155, 188, 15, 0.22)';
          ctx.fillRect(p.px + 2, p.py + 2, CELL - 4, 2);
          ctx.fillStyle = 'rgba(15, 56, 15, 0.35)';
          ctx.fillRect(p.px + 2, p.py + CELL - 4, CELL - 4, 2);
        }

        if (v !== 0) {
          ctx.fillStyle = pal.fg;
          ctx.font = fontFor(v) + 'px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(v), p.px + CELL / 2, p.py + CELL / 2 + 1);
        }

        if (selected && selected.x === x && selected.y === y) {
          ctx.strokeStyle = '#9bbc0f';
          ctx.lineWidth = 4;
          ctx.strokeRect(p.px + 2, p.py + 2, CELL - 4, CELL - 4);
          ctx.fillStyle = '#9bbc0f';
          const s = 6;
          ctx.fillRect(p.px + 2, p.py + 2, s, s);
          ctx.fillRect(p.px + CELL - 2 - s, p.py + 2, s, s);
          ctx.fillRect(p.px + 2, p.py + CELL - 2 - s, s, s);
          ctx.fillRect(p.px + CELL - 2 - s, p.py + CELL - 2 - s, s, s);
        }

        if (flashTimer > 0 && flashAt && flashAt.x === x && flashAt.y === y) {
          ctx.fillStyle = 'rgba(155, 188, 15, 0.55)';
          ctx.fillRect(p.px, p.py, CELL, CELL);
        }

        if (moveAnim && moveAnim.to.x === x && moveAnim.to.y === y) {
          ctx.strokeStyle = '#0f380f';
          ctx.lineWidth = 3;
          ctx.strokeRect(p.px + 2, p.py + 2, CELL - 4, CELL - 4);
        }
      }
    }

    if (shakeTimer > 0) {
      ctx.fillStyle = 'rgba(138, 42, 42, 0.18)';
      ctx.fillRect(0, 0, CANVAS, CANVAS);
    }
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

  /* ---------- 点击 ---------- */
  function hitCell(x, y) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const p = cellXY(c, r);
        if (x >= p.px && x < p.px + CELL && y >= p.py && y < p.py + CELL) {
          return { x: c, y: r };
        }
      }
    }
    return null;
  }

  function checkGameOver() {
    if (isFull() && !hasAdjacentSame()) {
      gameOver();
      return true;
    }
    return false;
  }

  function handleClick(pos) {
    if (state !== 'playing') return;

    const cell = hitCell(pos.x, pos.y);
    if (!cell) return;

    const v = grid[cell.y][cell.x];

    // 点自己 → 取消选中
    if (selected && selected.x === cell.x && selected.y === cell.y) {
      selected = null;
      PAAudio.click();
      draw();
      return;
    }

    // 没有选中
    if (!selected) {
      if (v === 0) return;
      selected = cell;
      PAAudio.click();
      draw();
      return;
    }

    const from = selected;
    const fromVal = grid[from.y][from.x];

    // 相邻
    if (adjacent(from, cell)) {
      // 相邻空格 → 移动，并生成新数字
      if (v === 0) {
        grid[cell.y][cell.x] = fromVal;
        grid[from.y][from.x] = 0;
        selected = null;
        moveAnim = { from: from, to: cell };
        PAAudio.move();

        spawnNumber();     // ← 关键新增
        draw();

        if (checkGameOver()) return;
        return;
      }

      // 相邻相同 → 合并
      if (v === fromVal) {
        const newVal = v * 2;
        grid[cell.y][cell.x] = newVal;
        grid[from.y][from.x] = 0;
        score += newVal;
        scoreEl.textContent = score;

        flashAt = cell;
        flashTimer = 0.28;
        selected = null;

        PAAudio.score();

        spawnNumber();     // 合并后生成 1 个

        draw();

        if (checkGameOver()) return;
        return;
      }

      // 相邻但值不同 → 改选
      selected = cell;
      PAAudio.click();
      draw();
      return;
    }

    // 不相邻
    if (v === 0) {
      PAAudio.move();
      shakeTimer = 0.12;
      draw();
      return;
    }

    selected = cell;
    PAAudio.click();
    draw();
  }

  /* ---------- 流程 ---------- */
  function start() {
    score = 0;
    selected = null;
    flashTimer = 0;
    flashAt = null;
    moveAnim = null;
    shakeTimer = 0;
    scoreEl.textContent = '0';
    pauseBtn.textContent = '暂停';
    hideOverlay();

    spawnInitial();
    draw();

    state = 'playing';
    PAAudio.start();
  }

  function gameOver() {
    state = 'over';
    PAAudio.fail();
    shakeTimer = 0.4;

    const isNew = PAStore.setHigh(GAME_KEY, score);
    best = PAStore.getHigh(GAME_KEY);
    bestEl.textContent = best;

    if (isNew && score > 0) {
      setTimeout(function () { PAAudio.win(); }, 400);
    }

    pauseBtn.textContent = '暂停';
    draw();

    setTimeout(function () {
      showOverlay(
        isNew && score > 0 ? '新纪录！' : '游戏结束',
        '得分 ' + score + '  ·  最高 ' + best,
        '再来一局'
      );
    }, 360);
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

  /* ---------- 循环 ---------- */
  let lastTime = 0;
  function loop(t) {
    if (!lastTime) lastTime = t;
    const dt = (t - lastTime) / 1000;
    lastTime = t;

    let dirty = false;

    if (flashTimer > 0) {
      flashTimer -= dt;
      if (flashTimer <= 0) flashAt = null;
      dirty = true;
    }
    if (shakeTimer > 0) {
      shakeTimer -= dt;
      dirty = true;
    }
    if (moveAnim) {
      moveAnim.t = (moveAnim.t || 0) + dt;
      if (moveAnim.t > 0.18) moveAnim = null;
      dirty = true;
    }

    if (dirty) draw();

    requestAnimationFrame(loop);
  }

  /* ---------- 输入 ---------- */
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width * CANVAS,
      y: (e.clientY - rect.top) / rect.height * CANVAS
    };
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (state !== 'playing') return;
    e.preventDefault();
    handleClick(canvasPos(e));
  });
  canvas.addEventListener('touchmove', function (e) {
    if (state === 'playing') e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  document.addEventListener('keydown', function (e) {
    if (PA.isModalOpen()) return;
    const k = e.key;

    if (state === 'idle' || state === 'over') {
      if (k === ' ' || k === 'Spacebar' || k === 'Enter') {
        e.preventDefault(); start();
      }
      return;
    }
    if (k === 'p' || k === 'P' || k === 'Escape') {
      e.preventDefault(); togglePause();
    }
  });

  /* ---------- 按钮 ---------- */
  ovBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'paused') resume(); else start();
  });
  overlay.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    if (state === 'playing') return;
    if (state === 'paused') resume(); else start();
  });
  pauseBtn.addEventListener('click', function () {
    if (state === 'idle' || state === 'over') return;
    togglePause();
  });
  restartBtn.addEventListener('click', function () {
    PAAudio.click(); start();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') togglePause();
  });

  /* ---------- 启动 ---------- */
  PA.setupGamePage({
    key: GAME_KEY,
    helpTitle: '数字合成 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '选中数字 &nbsp;→&nbsp; 点相邻空格移动 / 点相邻相同合并'
  });
    // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  grid = emptyGrid();
  grid[0][0] = 2; grid[0][1] = 2;
  grid[1][0] = 4; grid[1][1] = 4;
  grid[2][2] = 8; grid[3][3] = 16;
  draw();

  requestAnimationFrame(loop);

  PA.autoHelp(GAME_KEY, '数字合成 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('数字合成', '选中数字 → 点相邻空格移动 / 点相邻相同合并', '开始');
    }
  });
})();