/* ===== 记忆翻牌 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'memory';

  /* ---------- 布局 ---------- */
  const SIZE = 4;
  const CANVAS = 320;
  const PADDING = 8;
  const GAP = 8;
  const CELL = (CANVAS - PADDING * 2 - GAP * (SIZE - 1)) / SIZE;   // 70
  const PAIRS = (SIZE * SIZE) / 2;                                  // 8 对

  /* ---------- 8 种像素图案（7x7） ---------- */
  const PATTERNS = [
    // 心形
    ['.XX.XX.',
     'XXXXXXX',
     'XXXXXXX',
     '.XXXXX.',
     '..XXX..',
     '...X...',
     '.......'],
    // 星星
    ['...X...',
     '...X...',
     '.XXXXX.',
     '..XXX..',
     '.XX.XX.',
     '.X...X.',
     '.......'],
    // 方块
    ['.XXXXX.',
     '.XXXXX.',
     '.XXXXX.',
     '.XXXXX.',
     '.XXXXX.',
     '.......',
     '.......'],
    // 三角
    ['...X...',
     '..XXX..',
     '.XXXXX.',
     'XXXXXXX',
     '.......',
     '.......',
     '.......'],
    // 十字
    ['...X...',
     '...X...',
     '.XXXXX.',
     '...X...',
     '...X...',
     '.......',
     '.......'],
    // 圆圈
    ['.XXXXX.',
     'XX...XX',
     'X.....X',
     'X.....X',
     'XX...XX',
     '.XXXXX.',
     '.......'],
    // 闪电
    ['..XXX..',
     '.XXX...',
     'XXX....',
     '.XX....',
     '.XXX...',
     '..XXX..',
     '...XX..'],
    // 笑脸
    ['.XXXXX.',
     'X.....X',
     'X.X.X.X',
     'X.....X',
     'X.X.X.X',
     'X.XX..X',
     '.XXXXX.']
  ];

  /* 背面花纹（8x8） */
  const BACK_PATTERN = [
    'XX..XX..',
    'XX..XX..',
    '..XX..XX',
    '..XX..XX',
    'XX..XX..',
    'XX..XX..',
    '..XX..XX',
    '..XX..XX'
  ];

  /* ---------- DOM ---------- */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const movesEl = document.getElementById('moves');
  const timeEl = document.getElementById('time');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ov-title');
  const ovText = document.getElementById('ov-text');
  const ovBtn = document.getElementById('ov-btn');
  const pauseBtn = document.getElementById('btn-pause');
  const restartBtn = document.getElementById('btn-restart');

  const HELP_HTML =
    '<ul>' +
      '<li>点击（或触摸）一张牌，翻开它</li>' +
      '<li>再翻开另一张，两图案相同则配对成功</li>' +
      '<li>图案不同会短暂展示后自动翻回</li>' +
      '<li>配对成功 <b>+100</b> 分，配对失败 <b>-10</b> 分</li>' +
      '<li>全部配对完成额外 <b>+200</b> 分</li>' +
      '<li>找出全部 8 对即通关</li>' +
      '<li><b>P / Esc</b> 暂停计时</li>' +
    '</ul>';

  /* ---------- 状态 ---------- */
  let cards = [];
  let firstCard = -1;
  let secondCard = -1;
  let lock = false;
  let score = 0;
  let moves = 0;
  let best = PAStore.getHigh(GAME_KEY);
  let state = 'idle';             // idle | playing | paused | over

  let timerId = null;
  let timerStart = 0;
  let timerAccum = 0;

  /* ---------- 工具 ---------- */
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateTimer() {
    const elapsed = timerAccum + (performance.now() - timerStart);
    timeEl.textContent = formatTime(elapsed);
  }

  function startTimer() {
    timerAccum = 0;
    timerStart = performance.now();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(updateTimer, 100);
    updateTimer();
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    timerAccum += performance.now() - timerStart;
  }

  function resumeTimer() {
    timerStart = performance.now();
    timerId = setInterval(updateTimer, 100);
  }

  /* ---------- 卡牌构建 ---------- */
  function buildCards() {
    const pool = [];
    for (let i = 0; i < PAIRS; i++) pool.push(i, i);
    shuffle(pool);

    cards = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        cards.push({
          pairId: pool[r * SIZE + c],
          matched: false,
          faceUp: false,
          row: r,
          col: c
        });
      }
    }
  }

  /* ---------- 绘制 ---------- */
  function drawPattern(pattern, x, y, size, color) {
    const n = pattern.length;
    const px = size / n;
    ctx.fillStyle = color;
    for (let ry = 0; ry < n; ry++) {
      const row = pattern[ry];
      for (let rx = 0; rx < n; rx++) {
        if (row[rx] === 'X') {
          ctx.fillRect(
            Math.round(x + rx * px),
            Math.round(y + ry * px),
            Math.ceil(px),
            Math.ceil(px)
          );
        }
      }
    }
  }

  function draw() {
    // 背景
    ctx.fillStyle = '#306230';
    ctx.fillRect(0, 0, CANVAS, CANVAS);
    ctx.strokeStyle = '#0f380f';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS - 2, CANVAS - 2);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const px = PADDING + card.col * (CELL + GAP);
      const py = PADDING + card.row * (CELL + GAP);

      if (!card.faceUp && !card.matched) {
        /* 背面 */
        ctx.fillStyle = '#306230';
        ctx.fillRect(px, py, CELL, CELL);
        ctx.strokeStyle = '#0f380f';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);

        drawPattern(BACK_PATTERN, px + 11, py + 11, CELL - 22, '#0f380f');

        // 左上角小高光
        ctx.fillStyle = 'rgba(155, 188, 15, 0.35)';
        ctx.fillRect(px + 3, py + 3, CELL - 6, 2);
      } else {
        /* 正面 */
        ctx.fillStyle = card.matched ? '#8bac0f' : '#9bbc0f';
        ctx.fillRect(px, py, CELL, CELL);

        ctx.strokeStyle = '#0f380f';
        ctx.lineWidth = card.matched ? 3 : 2;
        ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);

        drawPattern(PATTERNS[card.pairId], px + 12, py + 12, CELL - 24, '#0f380f');

        if (card.matched) {
          // 完成后打个小对勾标记
          ctx.fillStyle = '#0f380f';
          ctx.fillRect(px + CELL - 14, py + CELL - 14, 4, 4);
          ctx.fillRect(px + CELL - 10, py + CELL - 18, 4, 4);
          ctx.fillRect(px + CELL - 6,  py + CELL - 22, 4, 4);
        }
      }
    }
  }

  /* ---------- 点击检测 ---------- */
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width * CANVAS,
      y: (e.clientY - rect.top) / rect.height * CANVAS
    };
  }

  function hitTest(x, y) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const px = PADDING + c * (CELL + GAP);
        const py = PADDING + r * (CELL + GAP);
        if (x >= px && x < px + CELL && y >= py && y < py + CELL) {
          return r * SIZE + c;
        }
      }
    }
    return -1;
  }

  /* ---------- HUD ---------- */
  function updateHUD() {
    scoreEl.textContent = score;
    movesEl.textContent = moves;
  }

  /* ---------- 核心 ---------- */
  function handleCardClick(idx) {
    if (state !== 'playing' || lock) return;

    const card = cards[idx];
    if (card.faceUp || card.matched) return;

    card.faceUp = true;
    PAAudio.click();
    draw();

    if (firstCard === -1) {
      firstCard = idx;
      return;
    }

    secondCard = idx;
    moves++;
    movesEl.textContent = moves;
    lock = true;

    if (cards[firstCard].pairId === cards[secondCard].pairId) {
      // 配对成功
      setTimeout(function () {
        cards[firstCard].matched = true;
        cards[secondCard].matched = true;
        score += 100;
        updateHUD();
        PAAudio.match();

        firstCard = -1;
        secondCard = -1;
        lock = false;
        draw();

        if (cards.every(function (c) { return c.matched; })) {
          win();
        }
      }, 380);
    } else {
      // 配对失败
      score = Math.max(0, score - 10);
      updateHUD();
      PAAudio.move();

      setTimeout(function () {
        cards[firstCard].faceUp = false;
        cards[secondCard].faceUp = false;
        firstCard = -1;
        secondCard = -1;
        lock = false;
        draw();
      }, 780);
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

  /* ---------- 流程 ---------- */
  function start() {
    buildCards();
    firstCard = -1;
    secondCard = -1;
    lock = false;
    score = 0;
    moves = 0;
    updateHUD();
    timeEl.textContent = '00:00';
    pauseBtn.textContent = '暂停';
    hideOverlay();
    draw();

    state = 'playing';
    startTimer();
    PAAudio.start();
  }

  function win() {
    state = 'over';
    stopTimer();

    const elapsed = timerAccum;
    const bonus = Math.max(0, 400 - Math.floor(elapsed / 1000) * 2);
    score += 200 + bonus;
    updateHUD();

    const isNew = PAStore.setHigh(GAME_KEY, score);
    best = PAStore.getHigh(GAME_KEY);

    setTimeout(function () { PAAudio.win(); }, 300);

    showOverlay(
      isNew && score > 0 ? '新纪录！' : '全部完成！',
      '得分 ' + score + '  ·  步数 ' + moves + '  ·  用时 ' + formatTime(elapsed),
      '再来一局'
    );
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      stopTimer();
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
    resumeTimer();
    hideOverlay();
    PAAudio.click();
  }

  /* ---------- 输入 ---------- */
  canvas.addEventListener('pointerdown', function (e) {
    if (state !== 'playing' || lock) return;
    e.preventDefault();
    const pos = canvasPos(e);
    const idx = hitTest(pos.x, pos.y);
    if (idx !== -1) handleCardClick(idx);
  });

  canvas.addEventListener('touchmove', function (e) {
    if (state === 'playing') e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

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
    }
  });

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
    helpTitle: '记忆翻牌 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '点击翻开牌 &nbsp;·&nbsp; 找出 8 对相同图案'
  });
  // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };
  // 空闲态：先展示一副背面牌
  buildCards();
  draw();

  PA.autoHelp(GAME_KEY, '记忆翻牌 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('记忆翻牌', '点击翻开两张相同图案的牌', '开始');
    }
  });
})();