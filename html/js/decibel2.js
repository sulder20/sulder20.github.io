/* ============================================================
   岁窦工具箱 · 分贝仪
   —— 用麦克风测量环境噪音的相对分贝
   —— 浏览器无法访问经过校准的 SPL，读数仅为相对值
   ============================================================ */
(function () {
  'use strict';

  var inited = false;

  var audioCtx = null;
  var analyser = null;
  var mediaStream = null;
  var sourceNode = null;
  var dataArray = null;
  var rafId = null;
  var running = false;

  var sampleCount = 0;
  var sumDb = 0;
  var maxDb = 0;
  var minDb = Infinity;
  var startTime = 0;
  var lastTickTime = 0;

  var currentDb = 0;
  var smoothDb = 0;

  /* 分贝映射偏移量，默认 94，可通过校准调整 */
  var dbOffset = 94;

  /* 校准状态 */
  var calibrating = false;
  var calibSamples = [];

  var stageEl, valueEl, levelEl, barEl, hintEl;
  var startBtn, pauseBtn, resetBtn, calibrateBtn;
  var statCur, statMax, statMin, statAvg, statCount, statDuration;
  var levelsEl;

  /* ---------- 噪音等级 ---------- */
  var LEVELS = [
    { name:'极度安静', min: 0,   max: 20,       color:'#7a9c5f', example:'安静的卧室、录音棚' },
    { name:'安静',     min: 20,  max: 40,       color:'#9db97a', example:'图书馆、夜晚的郊外' },
    { name:'正常',     min: 40,  max: 60,       color:'#c9a02b', example:'普通办公室、日常交谈' },
    { name:'嘈杂',     min: 60,  max: 80,       color:'#e09070', example:'餐厅、街道、吸尘器' },
    { name:'很吵',     min: 80,  max: 100,      color:'#c94a4a', example:'地铁、繁忙马路、电锯' },
    { name:'危险',     min: 100, max: Infinity, color:'#a82a2a', example:'演唱会前排、飞机起降' }
  ];

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[分贝仪]', msg);
  }

  function getLevel(db) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (db >= LEVELS[i].min && db < LEVELS[i].max) return LEVELS[i];
    }
    return LEVELS[LEVELS.length - 1];
  }

  /* 从时域波形计算 RMS → dB（相对值） */
  function computeDb() {
    if (!analyser) return 0;
    analyser.getByteTimeDomainData(dataArray);

    var sumSquares = 0;
    var len = dataArray.length;
    for (var i = 0; i < len; i++) {
      var v = (dataArray[i] - 128) / 128;  // -1 ~ 1
      sumSquares += v * v;
    }
    var rms = Math.sqrt(sumSquares / len);

    // 参考值映射（相对值，非校准 SPL）：
    // rms ≈ 0.0005 → 约 20 dB（极静）
    // rms ≈ 0.005  → 约 40 dB（安静室内）
    // rms ≈ 0.05   → 约 60 dB（正常交谈）
    // rms ≈ 0.15   → 约 74 dB（嘈杂）
    // rms ≈ 0.5    → 约 94 dB（很吵）
    if (rms < 1e-7) return 20;
    var db = 20 * Math.log10(rms) + dbOffset;
    if (db < 0) db = 0;
    if (db > 120) db = 120;
    return db;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-decibel');
    if (!page) return;

    stageEl      = document.getElementById('dbStage');
    valueEl      = document.getElementById('dbValue');
    levelEl      = document.getElementById('dbLevel');
    barEl        = document.getElementById('dbBar');
    hintEl       = document.getElementById('dbHint');

    startBtn     = document.getElementById('dbStart');
    pauseBtn     = document.getElementById('dbPause');
    resetBtn     = document.getElementById('dbReset');
    calibrateBtn = document.getElementById('dbCalibrate');

    statCur      = document.getElementById('dbStatCur');
    statMax      = document.getElementById('dbStatMax');
    statMin      = document.getElementById('dbStatMin');
    statAvg      = document.getElementById('dbStatAvg');
    statCount    = document.getElementById('dbStatCount');
    statDuration = document.getElementById('dbStatDuration');

    levelsEl = document.getElementById('dbLevels');

    if (!startBtn || !valueEl) return;

    inited = true;
    renderLevels();
    bindEvents();

    // 页面隐藏时自动暂停
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && running) pause();
    });

    console.log('[分贝仪] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);

    if (calibrateBtn) {
      calibrateBtn.addEventListener('click', function () {
        if (!running) {
          toast('请先开始测量，保持安静再点校准');
          return;
        }
        calibrating = true;
        calibSamples = [];
        hintEl.textContent = '正在校准，请保持安静约 2 秒…';
        toast('正在校准，请保持安静');
      });
    }
  }

  /* ---------- 渲染噪音等级 ---------- */
  function renderLevels() {
    if (!levelsEl) return;
    levelsEl.innerHTML = LEVELS.map(function (l, i) {
      return '<div class="db-level-item" data-db-level="' + i + '">' +
        '<span class="db-level-dot" style="background:' + l.color + '"></span>' +
        '<div class="db-level-body">' +
          '<div class="db-level-name">' + l.name + '</div>' +
          '<div class="db-level-range">' +
            (l.max === Infinity ? l.min + ' dB 以上' : l.min + ' - ' + l.max + ' dB') +
          '</div>' +
          '<div class="db-level-example">' + l.example + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function highlightLevel(db) {
    var lvl = getLevel(db);
    var idx = LEVELS.indexOf(lvl);
    levelsEl.querySelectorAll('.db-level-item').forEach(function (el, i) {
      el.classList.toggle('active', i === idx);
    });
    return lvl;
  }

  /* ---------- 开始 ---------- */
  function start() {
    if (running) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('当前浏览器不支持麦克风访问');
      hintEl.textContent = '当前浏览器不支持麦克风访问，请更换 Chrome / Edge / Safari。';
      return;
    }

    hintEl.textContent = '正在请求麦克风权限…';
    startBtn.disabled = true;

    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    }).then(function (stream) {
      mediaStream = stream;
      setupAudio();
      running = true;
      startBtn.disabled = true;
      pauseBtn.disabled = false;

      if (!startTime) {
        startTime = Date.now();
        sampleCount = 0;
        sumDb = 0;
        maxDb = 0;
        minDb = Infinity;
      }
      lastTickTime = Date.now();

      hintEl.textContent = '正在测量中。如需校准，请在安静环境下点击「校准」。';
      stageEl.classList.add('running');
      tick();
      toast('已开始测量');
    }).catch(function (err) {
      console.warn('[分贝仪] 麦克风权限失败：', err);
      startBtn.disabled = false;
      if (err && err.name === 'NotAllowedError') {
        hintEl.textContent = '麦克风权限被拒绝。请在浏览器地址栏左侧的权限设置中允许麦克风访问后重试。';
        toast('麦克风权限被拒绝');
      } else if (err && err.name === 'NotFoundError') {
        hintEl.textContent = '未检测到麦克风设备，请连接麦克风后重试。';
        toast('未检测到麦克风');
      } else {
        hintEl.textContent = '麦克风初始化失败：' + (err && err.message ? err.message : err);
        toast('麦克风初始化失败');
      }
    });
  }

  function setupAudio() {
    try {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();

      sourceNode = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.75;
      sourceNode.connect(analyser);

      dataArray = new Uint8Array(analyser.fftSize);
    } catch (e) {
      console.error('[分贝仪] 音频初始化失败：', e);
      toast('音频初始化失败');
    }
  }

  /* ---------- 暂停 ---------- */
  function pause() {
    if (!running) return;
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(function (t) { t.stop(); });
      mediaStream = null;
    }
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (e) {}
      sourceNode = null;
    }
    analyser = null;
    dataArray = null;

    // 停止校准状态
    calibrating = false;
    calibSamples = [];

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stageEl.classList.remove('running');
    hintEl.textContent = '已暂停。点击「开始测量」继续。';
    toast('已暂停');
  }

  /* ---------- 重置 ---------- */
  function reset() {
    pause();
    sampleCount = 0;
    sumDb = 0;
    maxDb = 0;
    minDb = Infinity;
    startTime = 0;
    currentDb = 0;
    smoothDb = 0;
    valueEl.textContent = '--';
    levelEl.textContent = '未开始';
    barEl.style.width = '0%';
    hintEl.textContent = '点击下方「开始测量」，浏览器会请求麦克风权限。';
    updateStats();
    levelsEl.querySelectorAll('.db-level-item').forEach(function (el) {
      el.classList.remove('active');
    });
    toast('已重置');
  }

  /* ---------- 主循环 ---------- */
  function tick() {
    if (!running) return;
    rafId = requestAnimationFrame(tick);

    var now = Date.now();
    if (now - lastTickTime < 80) return;   // 约 12 次/秒更新
    lastTickTime = now;

    var rawDb = computeDb();

    /* ---------- 校准采集 ---------- */
    if (calibrating) {
      calibSamples.push(rawDb);
      if (calibSamples.length >= 25) {   // 约 2 秒
        var sum = 0;
        for (var k = 0; k < calibSamples.length; k++) sum += calibSamples[k];
        var avgRaw = sum / calibSamples.length;
        // 让当前安静环境映射到 35 dB
        dbOffset = dbOffset + (35 - avgRaw);
        calibrating = false;
        calibSamples = [];
        // 重置平滑值，让新读数立刻生效
        smoothDb = 0;
        hintEl.textContent = '校准完成，当前环境基准约 35 dB。';
        toast('校准完成');
      }
      // 校准期间不更新读数显示
      return;
    }

    /* ---------- 平滑 ---------- */
    if (smoothDb === 0) smoothDb = rawDb;
    smoothDb = smoothDb * 0.82 + rawDb * 0.18;
    currentDb = smoothDb;

    /* ---------- 显示 ---------- */
    var shown = Math.round(currentDb);
    valueEl.textContent = shown;

    // 等级
    var lvl = highlightLevel(currentDb);
    levelEl.textContent = lvl.name;
    levelEl.style.background = 'rgba(255,255,255,.18)';
    valueEl.style.color = '#ffe9a8';

    // 进度条
    var pct = Math.max(0, Math.min(100, currentDb / 120 * 100));
    barEl.style.width = pct + '%';

    /* ---------- 统计 ---------- */
    sampleCount++;
    sumDb += currentDb;
    if (currentDb > maxDb) maxDb = currentDb;
    if (currentDb < minDb) minDb = currentDb;

    updateStats();
  }

  function updateStats() {
    statCur.textContent = sampleCount ? Math.round(currentDb) + ' dB' : '—';
    statMax.textContent = sampleCount ? Math.round(maxDb) + ' dB' : '—';
    statMin.textContent = (sampleCount && minDb !== Infinity) ? Math.round(minDb) + ' dB' : '—';
    statAvg.textContent = sampleCount ? (sumDb / sampleCount).toFixed(1) + ' dB' : '—';
    statCount.textContent = sampleCount;
    var dur = startTime ? (Date.now() - startTime) / 1000 : 0;
    statDuration.textContent = dur.toFixed(1) + ' s';
  }

  /* ---------- 导出初始化 ---------- */
  window.__decibelInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();