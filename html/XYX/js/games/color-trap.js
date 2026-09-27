/* ===== 颜色陷阱 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'color-trap';
  const W = 320;
  const H = 320;

  const COLOR_GROUPS = [
    ['#0f380f', '#2a522a', '#4a7a4a', '#6a9a6a'],
    ['#8bac0f', '#a3c52a', '#b8d845', '#cded60'],
    ['#1a2a4a', '#2a4a7a', '#3a6aaa', '#4a8ada'],
    ['#5a1a1a', '#8a2a2a', '#ba3a3a', '#ea5a5a'],
    ['#3a2a1f', '#5a3a1f', '#7a4a2f', '#9a5a3f'],
    ['#3a1a4a', '#5a2a6a', '#7a3a8a', '#9a4aaa'],
    ['#5a4a1a', '#8a7a2a', '#ba9a3a', '#eaba4a'],
    ['#1a4a4a', '#2a6a6a', '#3a8a8a', '#4aaaaa']
  ];

  const TARGET_X = 110;
  const TARGET_Y = 30;
  const TARGET_W = 100;
  const TARGET_H = 80;

  const GRID_X = 20;
  const GRID_Y = 140;
  const GRID_W = 280;
  const GRID_H = 160;
  const CELL_GAP = 8;
  const CELL_W = (GRID_W - CELL_GAP) / 2;
  const CELL_H = (GRID_H - CELL_GAP) / 2;

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
  const restartBtn = document.getElementById('btn-restart');

  const HELP_HTML =
    '<ul>' +
      '<li>顶部大色块是<b>目标颜色</b></li>' +
      '<li>在下方 4 个色块中，点出与之<b>完全相同</b>的那一个</li>' +
      '<li>答对 <b>+10 分</b>，答错 <b>-1 条命</b></li>' +
      '<li>3 条命用完游戏结束</li>' +
      '<li>电脑鼠标 / 手机触摸直接点击色块</li>' +
      '<li><b>P / Esc</b> 暂停或继续</li>' +
    '</ul>';

  let state = 'idle';
  let targetColor = '#000';
  let options = [];
  let correctIndex = 0;
  let score = 0;
  let lives = 3;
  let best = PAStore.getHigh(GAME_KEY);
  let feedback = null;
  let feedbackTimer = 0;
  let lock = false;
  let lastTime = 0;

  bestEl.textContent = best;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function newRound() {
    const group = COLOR_GROUPS[Math.floor(Math.random() * COLOR_GROUPS.length)];
    const colors = group.slice();
    targetColor = colors[Math.floor(Math.random() * colors.length)];
    options = shuffle(colors);
    correctIndex = options.indexOf(targetColor);
  }

  function drawBlock(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#0f380f';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  }

  function draw() {
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#0f380f';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    ctx.fillStyle = '#0f380f';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TARGET', W / 2, 18);

    const tx = (W - TARGET_W) / 2;
    drawBlock(tx, TARGET_Y, TARGET_W, TARGET_H, targetColor);

    // 反馈描边
    if (feedbackTimer > 0 && feedback === 'right') {
      ctx.strokeStyle = '#0f380f';
      ctx.lineWidth = 5;
      ctx.strokeRect(tx - 4, TARGET_Y - 4, TARGET_W + 8, TARGET_H + 8);
    }

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = GRID_X + col * (CELL_W + CELL_GAP);
      const y = GRID_Y + row * (CELL_H + CELL_GAP);
      drawBlock(x, y, CELL_W, CELL_H, options[i]);
    }

    if (feedbackTimer > 0 && feedback === 'wrong') {
      ctx.fillStyle = 'rgba(138, 42, 42, 0.35)';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function flash(kind) {
    feedback = kind;
    feedbackTimer = 0.3;
  }

  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width * W,
      y: (e.clientY - rect.top) / rect.height * H
    };
  }

  function hitOption(x, y) {
    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = GRID_X + col * (CELL_W + CELL_GAP);
      const by = GRID_Y + row * (CELL_H + CELL_GAP);
      if (x >= bx && x < bx + CELL_W && y >= by && y < by + CELL_H) return i;
    }
    return -1;
  }

  function handleClick(x, y) {
    if (state !== 'playing' || lock) return;

    const i = hitOption(x, y);
    if (i === -1) return;

    if (i === correctIndex) {
      score += 10;
      scoreEl.textContent = score;
      PAAudio.match();
      flash('right');
      lock = true;
      setTimeout(function () {
        newRound();
        draw();
        lock = false;
      }, 280);
    } else {
      lives--;
      livesEl.textContent = lives;
      PAAudio.fail();
      flash('wrong');

      if (lives <= 0) {
        setTimeout(gameOver, 300);
      }
    }
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

  function start() {
    score = 0;
    lives = 3;
    lock = false;
    feedbackTimer = 0;
    feedback = null;
    scoreEl.textContent = '0';
    livesEl.textContent = '3';
    pauseBtn.textContent = '暂停';

    newRound();
    hideOverlay();
    draw();

    state = 'playing';
    lastTime = 0;
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
    lastTime = 0;
    hideOverlay();
    PAAudio.click();
    requestAnimationFrame(loop);
  }

  function loop(t) {
    if (state !== 'playing') return;

    if (!lastTime) lastTime = t;
    const dt = (t - lastTime) / 1000;
    lastTime = t;

    if (feedbackTimer > 0) {
      feedbackTimer -= dt;
      if (feedbackTimer <= 0) feedback = null;
      draw();
    }

    if (state === 'playing') requestAnimationFrame(loop);
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (state !== 'playing') return;
    e.preventDefault();
    const p = canvasPos(e);
    handleClick(p.x, p.y);
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

  PA.setupGamePage({
    key: GAME_KEY,
    helpTitle: '颜色陷阱 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '点出与顶部 <b>TARGET</b> 完全相同的色块'
  });
    // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  newRound();
  draw();

  PA.autoHelp(GAME_KEY, '颜色陷阱 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('颜色陷阱', '点出与顶部相同的颜色', '开始');
    }
  });
})();