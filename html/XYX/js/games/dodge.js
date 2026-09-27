/* ===== 闪避方块 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'dodge';
  const W = 320;
  const H = 320;

  const PLAYER_W = 20;
  const PLAYER_H = 20;
  const PLAYER_Y = H - 30;
  const PLAYER_SPEED = 280;

  const BLOCK_H = 20;
  const MIN_BLOCK_W = 24;
  const MAX_BLOCK_W = 64;

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
      '<li>电脑：<b>← →</b> 或 <b>A/D</b> 左右移动</li>' +
      '<li>手机：<b>手指左右拖动</b>控制你的方块</li>' +
      '<li>躲开所有从上方落下的方块</li>' +
      '<li>每躲过一个方块 <b>+10 分</b></li>' +
      '<li>被任意方块碰到即结束</li>' +
      '<li>越往后方块越大、下落越快、出现越频繁</li>' +
      '<li><b>P / Esc</b> 暂停或继续</li>' +
    '</ul>';

  let state = 'idle';
  let playerX = (W - PLAYER_W) / 2;
  let blocks = [];
  let score = 0;
  let best = PAStore.getHigh(GAME_KEY);
  let elapsed = 0;
  let spawnTimer = 0;
  let flashTimer = 0;
  let keys = { left: false, right: false };
  let pointerTargetX = null;
  let lastTime = 0;
  let shakeTime = 0;

  bestEl.textContent = best;

  /* ---------- 难度曲线 ---------- */
  function difficulty() {
    return Math.min(elapsed / 14, 3.2);
  }
  function spawnInterval() {
    return Math.max(0.36, 0.95 - difficulty() * 0.16);
  }
  function blockSpeed() {
    return 105 + difficulty() * 55;
  }

  /* ---------- 生成 ---------- */
  function spawnBlock() {
    const w = MIN_BLOCK_W + Math.random() * (MAX_BLOCK_W - MIN_BLOCK_W);
    const x = Math.random() * (W - w);
    blocks.push({
      x: x,
      y: -BLOCK_H,
      w: w,
      h: BLOCK_H,
      vy: blockSpeed() * (0.85 + Math.random() * 0.3),
      passed: false
    });
  }

  /* ---------- 逻辑 ---------- */
  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  function update(dt) {
    elapsed += dt;

    // 玩家移动
    if (pointerTargetX != null) {
      const dx = pointerTargetX - (playerX + PLAYER_W / 2);
      const step = PLAYER_SPEED * 1.6 * dt;
      if (Math.abs(dx) <= step) playerX = pointerTargetX - PLAYER_W / 2;
      else playerX += dx > 0 ? step : -step;
    } else {
      if (keys.left)  playerX -= PLAYER_SPEED * dt;
      if (keys.right) playerX += PLAYER_SPEED * dt;
    }
    playerX = clamp(playerX, 0, W - PLAYER_W);

    // 生成
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval()) {
      spawnTimer = 0;
      spawnBlock();
    }

    // 障碍物
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      b.y += b.vy * dt;

      // 碰玩家
      if (b.y + b.h > PLAYER_Y &&
          b.y < PLAYER_Y + PLAYER_H &&
          b.x + b.w > playerX &&
          b.x < playerX + PLAYER_W) {
        return die();
      }

      // 躲过
      if (!b.passed && b.y > PLAYER_Y + PLAYER_H) {
        b.passed = true;
        score += 10;
        scoreEl.textContent = score;
        PAAudio.move();
      }

      // 出屏
      if (b.y > H + 4) {
        blocks.splice(i, 1);
      }
    }
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

    // 地板线
    ctx.fillStyle = '#306230';
    ctx.fillRect(0, PLAYER_Y + PLAYER_H + 2, W, 2);

    // 障碍
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      ctx.fillStyle = '#0f380f';
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // 内层浅色
      ctx.fillStyle = '#306230';
      ctx.fillRect(b.x + 3, b.y + 3, b.w - 6, b.h - 6);

      ctx.fillStyle = '#0f380f';
      ctx.fillRect(b.x + 6, b.y + 6, b.w - 12, b.h - 12);
    }

    // 玩家（闪烁受击）
    if (flashTimer <= 0) {
      ctx.fillStyle = '#0f380f';
      ctx.fillRect(playerX, PLAYER_Y, PLAYER_W, PLAYER_H);

      ctx.fillStyle = '#9bbc0f';
      ctx.fillRect(playerX + 4, PLAYER_Y + 4, PLAYER_W - 8, PLAYER_H - 8);

      // 眼睛
      ctx.fillStyle = '#0f380f';
      ctx.fillRect(playerX + 5, PLAYER_Y + 7, 3, 4);
      ctx.fillRect(playerX + PLAYER_W - 8, PLAYER_Y + 7, 3, 4);
    }

    // 受击抖动
    if (shakeTime > 0) {
      ctx.fillStyle = 'rgba(15, 56, 15, 0.4)';
      ctx.fillRect(0, 0, W, H);
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
    playerX = (W - PLAYER_W) / 2;
    blocks = [];
    score = 0;
    elapsed = 0;
    spawnTimer = 0.6;
    flashTimer = 0;
    shakeTime = 0;
    keys.left = false;
    keys.right = false;
    pointerTargetX = null;
    scoreEl.textContent = '0';
    pauseBtn.textContent = '暂停';
    hideOverlay();

    state = 'playing';
    lastTime = 0;
    PAAudio.start();
    requestAnimationFrame(loop);
  }

  function die() {
    state = 'over';
    flashTimer = 0.3;
    shakeTime = 0.4;
    PAAudio.fail();
    draw();

    const isNew = PAStore.setHigh(GAME_KEY, score);
    best = PAStore.getHigh(GAME_KEY);
    bestEl.textContent = best;

    if (isNew && score > 0) {
      setTimeout(function () { PAAudio.win(); }, 400);
    }

    setTimeout(function () {
      pauseBtn.textContent = '暂停';
      showOverlay(
        isNew && score > 0 ? '新纪录！' : '游戏结束',
        '得分 ' + score + '  ·  最高 ' + best,
        '再来一局'
      );
    }, 420);
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

  /* ---------- 主循环 ---------- */
  function loop(t) {
    if (state !== 'playing') return;

    if (!lastTime) lastTime = t;
    let dt = (t - lastTime) / 1000;
    lastTime = t;
    if (dt > 0.05) dt = 0.05;

    if (flashTimer > 0) flashTimer -= dt;
    if (shakeTime > 0) shakeTime -= dt;

    update(dt);
    draw();

    if (state === 'playing') requestAnimationFrame(loop);
  }

  /* ---------- 键盘 ---------- */
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
      return;
    }

    if (state !== 'playing') return;

    if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
      e.preventDefault(); keys.left = true; pointerTargetX = null;
    } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
      e.preventDefault(); keys.right = true; pointerTargetX = null;
    }
  });

  document.addEventListener('keyup', function (e) {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = false;
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = false;
  });

  /* ---------- 触摸 / 鼠标 ---------- */
  function canvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) / rect.width * W;
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (state !== 'playing') return;
    e.preventDefault();
    pointerTargetX = canvasX(e.clientX);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (state !== 'playing') return;
    if (e.pointerType === 'mouse' && e.buttons === 0) return;
    pointerTargetX = canvasX(e.clientX);
  });
  canvas.addEventListener('pointerup', function () {
    pointerTargetX = null;
  });
  canvas.addEventListener('pointercancel', function () {
    pointerTargetX = null;
  });
  canvas.addEventListener('touchmove', function (e) {
    if (state === 'playing') e.preventDefault();
  }, { passive: false });

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
    helpTitle: '闪避方块 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '<b>← →</b> 移动 &nbsp;·&nbsp; 手机拖动 &nbsp;·&nbsp; <b>P</b> 暂停'  
  });
    // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  draw();

  PA.autoHelp(GAME_KEY, '闪避方块 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('闪避方块', '← → 移动 · 手机拖动', '开始');
    }
  });
})();