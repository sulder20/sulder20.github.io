/* ===== 打砖块 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'breakout';

  /* ---------- 尺寸 ---------- */
  const W = 320;
  const H = 320;

  const PADDLE_W = 64;
  const PADDLE_H = 10;
  const PADDLE_Y = 292;
  const PADDLE_SPEED = 420;      // 键盘移动 px/s

  const BALL_R = 4;
  const BALL_BASE_SPEED = 220;   // px/s
  const BALL_MAX_SPEED = 420;

  const BRICK_COLS = 6;
  const BRICK_ROWS = 5;
  const BRICK_GAP = 4;
  const BRICK_W = 48;
  const BRICK_H = 20;
  const BRICK_TOP = 42;
  const BRICK_LEFT = (W - (BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_GAP)) / 2;

  const ROW_POINTS = [50, 40, 30, 20, 10];
  const ROW_COLORS = ['#0f380f', '#306230', '#0f380f', '#306230', '#0f380f'];

  /* ---------- DOM ---------- */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ov-title');
  const ovText = document.getElementById('ov-text');
  const ovBtn = document.getElementById('ov-btn');
  const pauseBtn = document.getElementById('btn-pause');
  const launchBtn = document.getElementById('btn-launch');
  const restartBtn = document.getElementById('btn-restart');

  const HELP_HTML =
    '<ul>' +
      '<li>电脑：<b>← →</b> 或 <b>A/D</b> 移动挡板，<b>鼠标</b>移动也行</li>' +
      '<li>手机：<b>手指左右拖动</b>控制挡板</li>' +
      '<li><b>空格</b> / 点击屏幕 / 发射按钮，把球打出去</li>' +
      '<li><b>P / Esc</b> 暂停或继续</li>' +
      '<li>砖块越靠上分数越高：<b>50 / 40 / 30 / 20 / 10</b></li>' +
      '<li>共 3 条命，球掉出底部扣一条</li>' +
      '<li>打光全部砖块自动刷新一轮，并额外加 100 分</li>' +
    '</ul>';

  /* ---------- 状态 ---------- */
  let state = 'idle';             // idle | playing | paused | over
  let paddle = { x: (W - PADDLE_W) / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H };
  let ball = { x: W / 2, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0, stuck: true };
  let bricks = [];
  let score = 0;
  let lives = 3;
  let best = PAStore.getHigh(GAME_KEY);
  let speedMul = 1.0;
  let keys = { left: false, right: false };
  let lastTime = 0;
  let flashTimer = 0;

  bestEl.textContent = best;

  /* ---------- 砖块 ---------- */
  function buildBricks() {
    bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: BRICK_LEFT + c * (BRICK_W + BRICK_GAP),
          y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
          w: BRICK_W,
          h: BRICK_H,
          points: ROW_POINTS[r],
          color: ROW_COLORS[r],
          alive: true
        });
      }
    }
  }

  /* ---------- 挡板 ---------- */
  function clampPaddle() {
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.w > W) paddle.x = W - paddle.w;
  }

  /* ---------- 球 ---------- */
  function resetBall() {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - BALL_R - 1;
    ball.vx = 0;
    ball.vy = 0;
    ball.stuck = true;
  }

  function launchBall() {
    if (!ball.stuck || state !== 'playing') return;
    ball.stuck = false;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    ball.vx = Math.cos(angle) * BALL_BASE_SPEED;
    ball.vy = Math.sin(angle) * BALL_BASE_SPEED;
    PAAudio.eat();
  }

  function normalizeSpeed() {
    const target = Math.min(BALL_BASE_SPEED * speedMul, BALL_MAX_SPEED);
    const cur = Math.hypot(ball.vx, ball.vy) || 1;
    ball.vx = ball.vx / cur * target;
    ball.vy = ball.vy / cur * target;
  }

  /* ---------- HUD ---------- */
  function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
  }

  /* ---------- 主逻辑 ---------- */
  function update(dt) {
    if (keys.left)  paddle.x -= PADDLE_SPEED * dt;
    if (keys.right) paddle.x += PADDLE_SPEED * dt;
    clampPaddle();

    if (ball.stuck) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - BALL_R - 1;
      return;
    }

    // 分步移动，防止高速穿透
    const dist = Math.max(Math.abs(ball.vx), Math.abs(ball.vy)) * dt;
    const steps = Math.max(1, Math.ceil(dist / 4));

    for (let i = 0; i < steps; i++) {
      moveBall(dt / steps);
      if (state !== 'playing') return;
      if (ball.stuck) return;
    }
  }

  function moveBall(dt) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // 左墙
    if (ball.x - BALL_R < 0) {
      ball.x = BALL_R;
      ball.vx = Math.abs(ball.vx);
      PAAudio.move();
    }
    // 右墙
    else if (ball.x + BALL_R > W) {
      ball.x = W - BALL_R;
      ball.vx = -Math.abs(ball.vx);
      PAAudio.move();
    }
    // 顶部
    if (ball.y - BALL_R < 0) {
      ball.y = BALL_R;
      ball.vy = Math.abs(ball.vy);
      PAAudio.move();
    }

    // 掉出底部
    if (ball.y - BALL_R > H) {
      loseLife();
      return;
    }

    // 挡板
    if (ball.vy > 0 &&
        ball.y + BALL_R >= paddle.y &&
        ball.y - BALL_R <= paddle.y + paddle.h &&
        ball.x >= paddle.x - BALL_R &&
        ball.x <= paddle.x + paddle.w + BALL_R) {

      ball.y = paddle.y - BALL_R;
      const rel = (ball.x - paddle.x) / paddle.w;            // 0 .. 1
      const angle = -Math.PI / 2 + (rel - 0.5) * (Math.PI * 0.7);
      const sp = Math.hypot(ball.vx, ball.vy);
      ball.vx = Math.cos(angle) * sp;
      ball.vy = Math.sin(angle) * sp;
      PAAudio.move();
    }

    // 砖块
    checkBricks();
  }

  function checkBricks() {
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!b.alive) continue;

      if (ball.x + BALL_R <= b.x) continue;
      if (ball.x - BALL_R >= b.x + b.w) continue;
      if (ball.y + BALL_R <= b.y) continue;
      if (ball.y - BALL_R >= b.y + b.h) continue;

      // 判断从哪一侧撞入
      const overlapL = (ball.x + BALL_R) - b.x;
      const overlapR = (b.x + b.w) - (ball.x - BALL_R);
      const overlapT = (ball.y + BALL_R) - b.y;
      const overlapB = (b.y + b.h) - (ball.y - BALL_R);

      const minX = Math.min(overlapL, overlapR);
      const minY = Math.min(overlapT, overlapB);

      if (minX < minY) {
        ball.vx = -ball.vx;
        ball.x += (overlapL < overlapR) ? -minX : minX;
      } else {
        ball.vy = -ball.vy;
        ball.y += (overlapT < overlapB) ? -minY : minY;
      }

      b.alive = false;
      score += b.points;
      speedMul = Math.min(speedMul + 0.012, 1.7);
      normalizeSpeed();
      updateHUD();
      PAAudio.eat();

      if (bricks.every(function (x) { return !x.alive; })) {
        clearRound();
      }
      break;
    }
  }

  function clearRound() {
    score += 100;
    speedMul = 1.0;
    updateHUD();
    PAAudio.win();
    buildBricks();
    resetBall();
  }

  function loseLife() {
    lives--;
    updateHUD();
    PAAudio.fail();
    speedMul = 1.0;

    if (lives <= 0) {
      gameOver();
      return;
    }
    resetBall();
  }

  /* ---------- 绘制 ---------- */
  function draw() {
    // 背景
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, 0, W, H);

    // 边框
    ctx.strokeStyle = '#0f380f';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // 砖块
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!b.alive) continue;

      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // 顶部高光
      ctx.fillStyle = 'rgba(155, 188, 15, 0.55)';
      ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 2);
      // 底部阴影
      ctx.fillStyle = 'rgba(15, 56, 15, 0.35)';
      ctx.fillRect(b.x + 2, b.y + b.h - 4, b.w - 4, 2);
    }

    // 挡板
    ctx.fillStyle = '#0f380f';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(paddle.x + 2, paddle.y + 2, paddle.w - 4, 2);

    // 球（像素方块）
    if (flashTimer <= 0) {
      ctx.fillStyle = '#0f380f';
      ctx.fillRect(ball.x - BALL_R, ball.y - BALL_R, BALL_R * 2, BALL_R * 2);
    }

    // 提示：球粘在挡板上
    if (ball.stuck && state === 'playing') {
      ctx.fillStyle = '#0f380f';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('按空格 / 点击发射', W / 2, H - 40);
    }
  }

  /* ---------- 主循环 ---------- */
  function loop(t) {
    if (state !== 'playing') return;

    if (!lastTime) lastTime = t;
    let dt = (t - lastTime) / 1000;
    lastTime = t;
    if (dt > 0.05) dt = 0.05;   // 切后台回来防止跳帧

    if (flashTimer > 0) flashTimer -= dt;

    update(dt);
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
    score = 0;
    lives = 3;
    speedMul = 1.0;
    flashTimer = 0;
    keys.left = false;
    keys.right = false;
    paddle.x = (W - PADDLE_W) / 2;
    buildBricks();
    resetBall();
    updateHUD();
    pauseBtn.textContent = '暂停';
    hideOverlay();

    state = 'playing';
    lastTime = 0;
    PAAudio.start();
    requestAnimationFrame(loop);
  }

  function gameOver() {
    state = 'over';
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
    hideOverlay();
    PAAudio.click();
    requestAnimationFrame(loop);
  }

  /* ---------- 输入：键盘 ---------- */
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

    if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
      e.preventDefault();
      keys.left = true;
    } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
      e.preventDefault();
      keys.right = true;
    } else if (k === ' ') {
      e.preventDefault();
      launchBall();
    }
  });

  document.addEventListener('keyup', function (e) {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = false;
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = false;
  });

  /* ---------- 输入：鼠标 / 触摸 ---------- */
  function pointerToCanvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) / rect.width * W;
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (state !== 'playing') return;
    e.preventDefault();
    const x = pointerToCanvasX(e.clientX);
    paddle.x = x - paddle.w / 2;
    clampPaddle();
    if (ball.stuck) launchBall();
  });

  canvas.addEventListener('pointermove', function (e) {
    if (state !== 'playing') return;
    if (e.pointerType === 'mouse' && e.buttons === 0 && !ball.stuck) {
      // 鼠标未按下时也跟随（更顺手）
    }
    const x = pointerToCanvasX(e.clientX);
    paddle.x = x - paddle.w / 2;
    clampPaddle();
  });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, { passive: false });

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

  launchBtn.addEventListener('click', function () {
    PAAudio.click();
    if (state === 'playing' && ball.stuck) launchBall();
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
    helpTitle: '打砖块 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '<b>← →</b> 移动挡板 &nbsp;·&nbsp; <b>空格</b> 发射 &nbsp;·&nbsp; 手机拖动'
  });
    // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  // 空闲时先画一版
  buildBricks();
  draw();

  PA.autoHelp(GAME_KEY, '打砖块 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('打砖块', '← → 或拖动 · 空格发射', '开始');
    }
  });
})();