/* ===== 贪吃蛇 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'snake';
  const COLS = 20;
  const ROWS = 20;
  const CELL = 320 / COLS;      // 16px
  const BASE_STEP = 140;        // 毫秒/步
  const MIN_STEP = 72;

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
      '<li>方向键 / <b>WASD</b> 控制方向</li>' +
      '<li>手机：<b>滑动屏幕</b>改变方向</li>' +
      '<li>吃到食物 <b>+10 分</b>，速度逐渐加快</li>' +
      '<li>撞墙或撞到自己则游戏结束</li>' +
      '<li><b>空格 / P</b> 暂停或继续</li>' +
    '</ul>';

  /* ---------- 状态 ---------- */
  let snake = [];
  let dir = { x: 1, y: 0 };
  let dirQueue = [];
  let food = { x: 0, y: 0 };
  let score = 0;
  let best = PAStore.getHigh(GAME_KEY);
  let state = 'idle';           // idle | playing | paused | over
  let stepMs = BASE_STEP;
  let acc = 0;
  let lastTime = 0;

  bestEl.textContent = best;

  /* ---------- 绘制 ---------- */
  function drawCell(x, y) {
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  }

  function draw() {
    // 背景（最亮的掌机绿）
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, 0, 320, 320);

    // 食物
    if (food) {
      ctx.fillStyle = '#0f380f';
      drawCell(food.x, food.y);
    }

    // 蛇：头最深，身体次深
    for (let i = snake.length - 1; i >= 0; i--) {
      ctx.fillStyle = i === 0 ? '#0f380f' : '#306230';
      drawCell(snake[i].x, snake[i].y);
    }
  }

  /* ---------- 逻辑 ---------- */
  function placeFood() {
    const free = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        let occupied = false;
        for (let i = 0; i < snake.length; i++) {
          if (snake[i].x === x && snake[i].y === y) { occupied = true; break; }
        }
        if (!occupied) free.push({ x: x, y: y });
      }
    }
    food = free.length ? free[Math.floor(Math.random() * free.length)] : null;
  }

  function updateScore() {
    scoreEl.textContent = score;
  }

  function queueDir(d) {
    const last = dirQueue.length ? dirQueue[dirQueue.length - 1] : dir;
    // 不能反向
    if (d.x === -last.x && d.y === -last.y) return;
    // 重复方向忽略
    if (d.x === last.x && d.y === last.y) return;
    if (dirQueue.length < 2) dirQueue.push(d);
  }

  function step() {
    if (dirQueue.length) {
      dir = dirQueue.shift();
    }

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // 撞墙
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      return gameOver();
    }

    // 撞自己（尾巴此刻会移开，所以排除最后一节）
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return gameOver();
      }
    }

    snake.unshift(head);

    if (food && head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      PAAudio.eat();
      placeFood();
      if (stepMs > MIN_STEP) stepMs -= 3;
    } else {
      snake.pop();
    }
  }

  /* ---------- 主循环 ---------- */
  function loop(t) {
    if (state !== 'playing') return;

    if (!lastTime) {
      lastTime = t;
      requestAnimationFrame(loop);
      return;
    }

    const dt = Math.min(t - lastTime, 120);
    lastTime = t;
    acc += dt;

    let guard = 0;
    while (acc >= stepMs && state === 'playing' && guard < 8) {
      acc -= stepMs;
      step();
      guard++;
    }

    draw();

    if (state === 'playing') requestAnimationFrame(loop);
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
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    dirQueue = [];
    score = 0;
    stepMs = BASE_STEP;
    acc = 0;
    lastTime = 0;

    placeFood();
    updateScore();
    pauseBtn.textContent = '暂停';
    hideOverlay();

    state = 'playing';
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
      setTimeout(function () { PAAudio.win(); }, 380);
    }

    pauseBtn.textContent = '暂停';
    showOverlay(
      isNew && score > 0 ? '新纪录！' : '游戏结束',
      '得分 ' + score + '  ·  最高 ' + best,
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
    acc = 0;
    hideOverlay();
    PAAudio.click();
    requestAnimationFrame(loop);
  }

  /* ---------- 输入 ---------- */
  const KEY_DIRS = {
    ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
    ArrowDown:  { x: 0, y: 1 },  s: { x: 0, y: 1 },  S: { x: 0, y: 1 },
    ArrowLeft:  { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },  d: { x: 1, y: 0 },  D: { x: 1, y: 0 }
  };

  document.addEventListener('keydown', function (e) {
    if (PA.isModalOpen()) return;

    const k = e.key;

    if (k === ' ' || k === 'Spacebar' || k === 'p' || k === 'P') {
      e.preventDefault();
      if (state === 'idle' || state === 'over') start();
      else togglePause();
      return;
    }

    if (k === 'Enter' && (state === 'idle' || state === 'over')) {
      e.preventDefault();
      start();
      return;
    }

    const d = KEY_DIRS[k];
    if (d) {
      e.preventDefault();
      if (state === 'idle' || state === 'over') { start(); }
      else if (state === 'playing') queueDir(d);
    }
  });

  PA.onSwipe(canvas, {
    onUp:    function () { if (state === 'playing') queueDir({ x: 0, y: -1 }); },
    onDown:  function () { if (state === 'playing') queueDir({ x: 0, y: 1 }); },
    onLeft:  function () { if (state === 'playing') queueDir({ x: -1, y: 0 }); },
    onRight: function () { if (state === 'playing') queueDir({ x: 1, y: 0 }); }
  });

  overlay.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    if (state === 'playing') return;
    if (state === 'paused') resume();
    else start();
  });

  ovBtn.addEventListener('click', function (e) {
    e.stopPropagation();
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

  // 切到后台自动暂停
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') togglePause();
  });

  /* ---------- 启动 ---------- */
  PA.setupGamePage({
    key: GAME_KEY,
    helpTitle: '贪吃蛇 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '<b>← → ↑ ↓ / WASD</b> 移动 &nbsp;·&nbsp; <b>空格</b> 暂停 &nbsp;·&nbsp; 手机滑动'
  });
    // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  PA.autoHelp(GAME_KEY, '贪吃蛇 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') showOverlay('贪吃蛇', '方向键 / WASD 移动 · 手机滑动', '开始');
  });

  // 首屏绘制
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  food = { x: 14, y: 10 };
  draw();
})();