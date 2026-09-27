/* ===== 节奏点击 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'rhythm';
  const W = 320;
  const H = 320;

  const LANES = 3;
  const LANE_W = W / LANES;       // 106.67

  const NOTE_W = 60;
  const NOTE_H = 24;

  const TARGET_Y = 260;            // 判定线中心
  const HIT_PERFECT = 10;          // ±10px 完美
  const HIT_GOOD = 22;             // ±22px 良好
  const MISS_Y = TARGET_Y + 40;

  const FALL_SPEED = 200;          // px/s

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const comboEl = document.getElementById('combo');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ov-title');
  const ovText = document.getElementById('ov-text');
  const ovBtn = document.getElementById('ov-btn');
  const pauseBtn = document.getElementById('btn-pause');
  const restartBtn = document.getElementById('btn-restart');

  const HELP_HTML =
    '<ul>' +
      '<li>音符从上方落下，进入底部<b>判定区</b>时点击</li>' +
      '<li>电脑：<b>A / S / D</b> 对应左、中、右三轨</li>' +
      '<li>手机：直接<b>点击对应的轨道</b></li>' +
      '<li>判定：<b>PERFECT +30</b>，<b>GOOD +10</b>，漏接 -1 条命</li>' +
      '<li>连续命中会累积 <b>COMBO</b>，额外加分</li>' +
      '<li>3 条命用完游戏结束</li>' +
      '<li><b>P / Esc</b> 暂停或继续</li>' +
    '</ul>';

  let state = 'idle';
  let notes = [];
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let lives = 3;
  let best = PAStore.getHigh(GAME_KEY);
  let elapsed = 0;
  let spawnTimer = 0;
  let lastTime = 0;
  let flashTimer = 0;
  let flashLane = -1;
  let popups = [];                // { lane, text, color, life }

  bestEl.textContent = best;

  /* ---------- 难度：每 15 秒加快生成 ---------- */
  function spawnInterval() {
    return Math.max(0.32, 0.78 - elapsed / 60);
  }

  /* ---------- 生成音符 ---------- */
  function spawnNote() {
    const lane = Math.floor(Math.random() * LANES);
    notes.push({
      lane: lane,
      y: -NOTE_H,
      hit: false
    });
  }

  /* ---------- 判定区高亮 ---------- */
  function laneColor(i) {
    return i === 0 ? '#306230' : (i === 1 ? '#0f380f' : '#306230');
  }

  /* ---------- 更新 ---------- */
  function update(dt) {
    elapsed += dt;

    spawnTimer += dt;
    if (spawnTimer >= spawnInterval()) {
      spawnTimer = 0;
      spawnNote();
    }

    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i];

      if (n.hit) {
        n.y += FALL_SPEED * dt * 2.2;
        if (n.y > H + NOTE_H) notes.splice(i, 1);
        continue;
      }

      n.y += FALL_SPEED * dt;

      // 漏接
      if (n.y > MISS_Y) {
        notes.splice(i, 1);
        combo = 0;
        comboEl.textContent = '0';
        lives--;
        PAAudio.fail();
        popups.push({ lane: n.lane, text: 'MISS', color: '#8a2a2a', life: 0.6 });

        if (lives <= 0) {
          gameOver();
          return;
        }
      }
    }

    // 弹字生命
    for (let i = popups.length - 1; i >= 0; i--) {
      popups[i].life -= dt;
      if (popups[i].life <= 0) popups.splice(i, 1);
    }

    if (flashTimer > 0) flashTimer -= dt;
  }

  /* ---------- 点击判定 ---------- */
  function tryHit(lane) {
    if (state !== 'playing') return;

    // 找该轨道里最接近判定线的未命中音符
    let bestNote = null;
    let bestDist = Infinity;

    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      if (n.hit || n.lane !== lane) continue;
      const d = Math.abs(n.y + NOTE_H / 2 - TARGET_Y);
      if (d < bestDist) { bestDist = d; bestNote = n; }
    }

    if (!bestNote || bestDist > HIT_GOOD) {
      // 空击：轻微惩罚，仅断连
      if (combo > 0) {
        combo = 0;
        comboEl.textContent = '0';
        PAAudio.move();
      }
      flashLane = lane;
      flashTimer = 0.12;
      popups.push({ lane: lane, text: '...', color: '#306230', life: 0.35 });
      return;
    }

    bestNote.hit = true;

    let points, text, color;

    if (bestDist <= HIT_PERFECT) {
      points = 30;
      text = 'PERFECT';
      color = '#0f380f';
      PAAudio.score();
    } else {
      points = 10;
      text = 'GOOD';
      color = '#306230';
      PAAudio.eat();
    }

    combo++;
    if (combo > maxCombo) maxCombo = combo;
    const bonus = Math.min(Math.floor(combo / 5) * 5, 50);

    score += points + bonus;
    scoreEl.textContent = score;
    comboEl.textContent = combo;

    popups.push({ lane: lane, text: text, color: color, life: 0.6 });
    flashLane = lane;
    flashTimer = 0.12;
  }

  /* ---------- 绘制 ---------- */
  function draw() {
    // 背景
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, 0, W, H);

    // 外框
    ctx.strokeStyle = '#0f380f';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // 轨道分隔
    ctx.strokeStyle = '#306230';
    ctx.lineWidth = 2;
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_W, 0);
      ctx.lineTo(i * LANE_W, H);
      ctx.stroke();
    }

    // 判定区背景
    ctx.fillStyle = '#8bac0f';
    ctx.fillRect(0, TARGET_Y - HIT_GOOD, W, HIT_GOOD * 2);

    // 判定线
    ctx.strokeStyle = '#0f380f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, TARGET_Y);
    ctx.lineTo(W, TARGET_Y);
    ctx.stroke();

    // 命中闪白
    if (flashTimer > 0 && flashLane >= 0) {
      ctx.fillStyle = 'rgba(15, 56, 15, 0.22)';
      ctx.fillRect(flashLane * LANE_W, 0, LANE_W, H);
    }

    // 音符
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      const x = n.lane * LANE_W + (LANE_W - NOTE_W) / 2;

      // 落点阴影
      if (!n.hit && n.y + NOTE_H / 2 < TARGET_Y) {
        ctx.fillStyle = 'rgba(48, 98, 48, 0.35)';
        ctx.fillRect(x, TARGET_Y - 2, NOTE_W, 4);
      }

      ctx.fillStyle = n.hit ? '#8bac0f' : '#0f380f';
      ctx.fillRect(x, n.y, NOTE_W, NOTE_H);

      if (!n.hit) {
        ctx.fillStyle = '#9bbc0f';
        ctx.fillRect(x + 4, n.y + 4, NOTE_W - 8, 4);
        ctx.fillRect(x + 4, n.y + NOTE_H - 8, NOTE_W - 8, 4);
      }
    }

    // 判定文字
    for (let i = 0; i < popups.length; i++) {
      const p = popups[i];
      const alpha = Math.max(0, Math.min(1, p.life / 0.4));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, p.lane * LANE_W + LANE_W / 2, TARGET_Y - 46);
      ctx.globalAlpha = 1;
    }

    // 轨道底部按键提示
    ctx.fillStyle = '#306230';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labels = ['A', 'S', 'D'];
    for (let i = 0; i < LANES; i++) {
      ctx.fillText(labels[i], i * LANE_W + LANE_W / 2, H - 18);
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
    notes = [];
    popups = [];
    score = 0;
    combo = 0;
    maxCombo = 0;
    lives = 3;
    elapsed = 0;
    spawnTimer = 0.4;
    flashTimer = 0;
    flashLane = -1;
    scoreEl.textContent = '0';
    comboEl.textContent = '0';
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
      '得分 ' + score + '  ·  最高连击 ' + maxCombo,
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

  /* ---------- 主循环 ---------- */
  function loop(t) {
    if (state !== 'playing') return;

    if (!lastTime) lastTime = t;
    let dt = (t - lastTime) / 1000;
    lastTime = t;
    if (dt > 0.05) dt = 0.05;

    update(dt);
    draw();

    if (state === 'playing') requestAnimationFrame(loop);
  }

  /* ---------- 输入 ---------- */
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width * W,
      y: (e.clientY - rect.top) / rect.height * H
    };
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (state !== 'playing') return;
    e.preventDefault();
    const p = canvasPos(e);
    const lane = Math.floor(p.x / LANE_W);
    if (lane >= 0 && lane < LANES) tryHit(lane);
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
      return;
    }
    if (state !== 'playing') return;

    const lower = k.toLowerCase();
    if (lower === 'a') { e.preventDefault(); tryHit(0); }
    else if (lower === 's') { e.preventDefault(); tryHit(1); }
    else if (lower === 'd') { e.preventDefault(); tryHit(2); }
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
    helpTitle: '节奏点击 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '<b>A / S / D</b> 或点击对应轨道 &nbsp;·&nbsp; 音符落到底部时点击'
  });
    // 游戏进行中返回需要确认
  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  draw();

  PA.autoHelp(GAME_KEY, '节奏点击 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('节奏点击', '音符落到判定区时点击 / 按键', '开始');
    }
  });
})();