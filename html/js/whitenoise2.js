/* ============================================================
   岁窦工具箱 · 白噪音助眠
   —— 纯 Web Audio 合成，不使用任何音频文件
   ============================================================ */
(function () {
  'use strict';

  var inited = false;

  var ctx = null;          // AudioContext
  var masterGain = null;   // 总音量
  var nodes = [];          // 当前正在发声的所有节点
  var playing = false;
  var currentType = 'rain';
  var timerId = null;
  var timerEnd = 0;

  var gridEl, playBtn, stopBtn, volumeInput, volumeVal, timerSelect, timerCountdown, playerEl;

  /* ---------- 工具函数 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[白噪音]', msg);
  }

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error('当前浏览器不支持 Web Audio API');
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = parseFloat(volumeInput.value) / 100 * 0.6;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ---------- 噪音缓冲：白 / 粉 / 棕 ---------- */
  function makeNoiseBuffer(type, seconds) {
    var len = ctx.sampleRate * (seconds || 2);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);

    if (type === 'white') {
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } else if (type === 'pink') {
      // Paul Kellet 粉噪音近似
      var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (var j = 0; j < len; j++) {
        var w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[j] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else if (type === 'brown') {
      var last = 0;
      for (var k = 0; k < len; k++) {
        var wn = Math.random() * 2 - 1;
        last = (last + 0.02 * wn) / 1.02;
        d[k] = last * 3.5;
      }
    }
    return buf;
  }

  function noiseSource(type, seconds) {
    var src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(type, seconds);
    src.loop = true;
    return src;
  }

  /* 记录以便 stop 时断开 */
  function track(node) {
    nodes.push(node);
    return node;
  }

  function stopAll() {
    nodes.forEach(function (n) {
      try { if (n.stop) n.stop(); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    });
    nodes = [];
  }

  /* ---------- 各种声音的合成 ---------- */

  /* 雨声：白噪音 + 低通 + 高通，带一点轻微音量起伏 */
  function playRain() {
    var src = track(noiseSource('white', 3));
    var hp = track(ctx.createBiquadFilter());
    hp.type = 'highpass';
    hp.frequency.value = 400;

    var lp = track(ctx.createBiquadFilter());
    lp.type = 'lowpass';
    lp.frequency.value = 7000;

    var g = track(ctx.createGain());
    g.gain.value = 0.55;

    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(masterGain);
    src.start();

    // 轻微雨势起伏
    var lfo = track(ctx.createOscillator());
    lfo.frequency.value = 0.1;
    var lfoGain = track(ctx.createGain());
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    lfo.start();
  }

  /* 海浪：粉噪音 + 慢速 LFO 调制音量 + 低通 */
  function playOcean() {
    var src = track(noiseSource('pink', 4));
    var lp = track(ctx.createBiquadFilter());
    lp.type = 'lowpass';
    lp.frequency.value = 1500;

    var g = track(ctx.createGain());
    g.gain.value = 0.001;

    src.connect(lp); lp.connect(g); g.connect(masterGain);
    src.start();

    // 缓慢的潮汐：周期约 8 秒
    var lfo = track(ctx.createOscillator());
    lfo.type = 'sine';
    lfo.frequency.value = 0.125;
    var lfoGain = track(ctx.createGain());
    lfoGain.gain.value = 0.55;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    // 加一个基础音量，避免完全无声
    g.gain.value = 0.45;
    lfo.start();
  }

  /* 壁炉：棕噪音 + 低通，配合随机噼啪声 */
  function playFire() {
    var src = track(noiseSource('brown', 3));
    var lp = track(ctx.createBiquadFilter());
    lp.type = 'lowpass';
    lp.frequency.value = 900;

    var g = track(ctx.createGain());
    g.gain.value = 0.6;

    src.connect(lp); lp.connect(g); g.connect(masterGain);
    src.start();

    // 噼啪声：用极短的带通噪音脉冲
    function crackle() {
      if (!playing) return;
      var burst = ctx.createBufferSource();
      burst.buffer = makeNoiseBuffer('white', 0.05);
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1200 + Math.random() * 2000;
      bp.Q.value = 3;
      var bg = ctx.createGain();
      var now = ctx.currentTime;
      bg.gain.setValueAtTime(0.0001, now);
      bg.gain.exponentialRampToValueAtTime(0.25 + Math.random() * 0.25, now + 0.005);
      bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      burst.connect(bp); bp.connect(bg); bg.connect(masterGain);
      burst.start(now); burst.stop(now + 0.08);

      setTimeout(crackle, 180 + Math.random() * 900);
    }
    crackle();
  }

  /* 咖啡厅：粉噪音 + 带通，营造人声嘈杂感 */
  function playCafe() {
    var src = track(noiseSource('pink', 4));
    var bp = track(ctx.createBiquadFilter());
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 0.8;

    var g = track(ctx.createGain());
    g.gain.value = 0.55;

    src.connect(bp); bp.connect(g); g.connect(masterGain);
    src.start();

    // 更低的底噪铺一层
    var src2 = track(noiseSource('brown', 3));
    var g2 = track(ctx.createGain());
    g2.gain.value = 0.2;
    src2.connect(g2); g2.connect(masterGain);
    src2.start();

    // 偶发"杯碟碰撞"轻响
    function clink() {
      if (!playing) return;
      var o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = 1400 + Math.random() * 1200;
      var og = ctx.createGain();
      var now = ctx.currentTime;
      og.gain.setValueAtTime(0.0001, now);
      og.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      o.connect(og); og.connect(masterGain);
      o.start(now); o.stop(now + 0.5);

      setTimeout(clink, 2500 + Math.random() * 6000);
    }
    clink();
  }

  /* 森林：粉噪音 + 高通模拟树叶，配合偶发鸟鸣（用振荡器模拟） */
  function playForest() {
    var src = track(noiseSource('pink', 4));
    var hp = track(ctx.createBiquadFilter());
    hp.type = 'highpass';
    hp.frequency.value = 800;

    var g = track(ctx.createGain());
    g.gain.value = 0.35;

    src.connect(hp); hp.connect(g); g.connect(masterGain);
    src.start();

    // 偶发鸟鸣
    function bird() {
      if (!playing) return;
      var now = ctx.currentTime;
      var base = 1800 + Math.random() * 1400;
      var o = ctx.createOscillator();
      o.type = 'sine';
      var og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, now);
      // 一声里有两个音高变化
      o.frequency.setValueAtTime(base, now);
      o.frequency.linearRampToValueAtTime(base * 1.25, now + 0.08);
      o.frequency.linearRampToValueAtTime(base * 0.95, now + 0.18);
      og.gain.exponentialRampToValueAtTime(0.10, now + 0.02);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      o.connect(og); og.connect(masterGain);
      o.start(now); o.stop(now + 0.32);

      setTimeout(bird, 3000 + Math.random() * 8000);
    }
    bird();
  }

  /* 风扇：白噪音 + 低通 + 轻微机械感 */
  function playFan() {
    var src = track(noiseSource('white', 3));
    var lp = track(ctx.createBiquadFilter());
    lp.type = 'lowpass';
    lp.frequency.value = 1200;
    lp.Q.value = 0.6;

    var g = track(ctx.createGain());
    g.gain.value = 0.5;

    src.connect(lp); lp.connect(g); g.connect(masterGain);
    src.start();

    // 轻微转速变化
    var lfo = track(ctx.createOscillator());
    lfo.frequency.value = 0.4;
    var lfoGain = track(ctx.createGain());
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    lfo.start();
  }

  /* 火车：棕噪音 + 低通 + 周期性"哐当"节奏 */
  function playTrain() {
    var src = track(noiseSource('brown', 4));
    var lp = track(ctx.createBiquadFilter());
    lp.type = 'lowpass';
    lp.frequency.value = 700;

    var g = track(ctx.createGain());
    g.gain.value = 0.55;

    src.connect(lp); lp.connect(g); g.connect(masterGain);
    src.start();

    // 有节奏的机械声
    function clack() {
      if (!playing) return;
      var now = ctx.currentTime;
      var o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = 90 + Math.random() * 30;
      var og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, now);
      og.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
      og.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      o.connect(og); og.connect(masterGain);
      o.start(now); o.stop(now + 0.12);

      setTimeout(clack, 550 + Math.random() * 40);
    }
    clack();
  }

  /* 棕噪音：直接输出 */
  function playBrown() {
    var src = track(noiseSource('brown', 4));
    var g = track(ctx.createGain());
    g.gain.value = 0.7;
    src.connect(g); g.connect(masterGain);
    src.start();
  }

  var PRESETS = {
    rain:   playRain,
    ocean:  playOcean,
    fire:   playFire,
    cafe:   playCafe,
    forest: playForest,
    fan:    playFan,
    train:  playTrain,
    brown:  playBrown
  };

  /* ---------- 播放 / 停止 ---------- */
  function play() {
    if (playing) return;
    try { ensureCtx(); } catch (e) { toast(e.message); return; }
    stopAll();
    playing = true;
    playerEl.classList.add('playing');
    playBtn.disabled = true;
    stopBtn.disabled = false;

    var fn = PRESETS[currentType] || playRain;
    fn();

    restartTimer();
  }

  function stop() {
    if (!playing) return;
    playing = false;
    playerEl.classList.remove('playing');
    playBtn.disabled = false;
    stopBtn.disabled = true;
    stopAll();
    clearTimer();
  }

  /* ---------- 定时关闭 ---------- */
  function clearTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    timerEnd = 0;
    if (timerCountdown) timerCountdown.textContent = '—';
  }

  function restartTimer() {
    clearTimer();
    var min = parseInt(timerSelect.value, 10);
    if (!min) return;
    timerEnd = Date.now() + min * 60 * 1000;
    updateTimerCountdown();
    timerId = setInterval(updateTimerCountdown, 1000);
  }

  function updateTimerCountdown() {
    if (!timerEnd) return;
    var left = Math.max(0, timerEnd - Date.now());
    if (left <= 0) {
      clearTimer();
      stop();
      toast('定时到，已停止播放');
      return;
    }
    var s = Math.floor(left / 1000);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    timerCountdown.textContent = (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-whitenoise');
    if (!page) return;

    gridEl        = document.getElementById('wnGrid');
    playBtn       = document.getElementById('wnPlay');
    stopBtn       = document.getElementById('wnStop');
    volumeInput   = document.getElementById('wnVolume');
    volumeVal     = document.getElementById('wnVolumeVal');
    timerSelect   = document.getElementById('wnTimer');
    timerCountdown= document.getElementById('wnTimerCountdown');
    playerEl      = document.getElementById('wnPlayer');
    if (!playBtn) return;

    inited = true;

    // 声音切换
    gridEl.querySelectorAll('.wn-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        gridEl.querySelectorAll('.wn-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentType = chip.dataset.wn;
        if (playing) { stop(); play(); }
      });
    });

    // 播放 / 停止
    playBtn.addEventListener('click', play);
    stopBtn.addEventListener('click', stop);

    // 音量
    volumeInput.addEventListener('input', function () {
      var v = parseInt(volumeInput.value, 10) || 0;
      volumeVal.textContent = v + '%';
      if (masterGain) masterGain.gain.value = v / 100 * 0.6;
    });

    // 定时
    timerSelect.addEventListener('change', function () {
      if (playing) restartTimer();
    });

    // 页面隐藏时自动停止，避免长时间占用音频
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && playing) stop();
    });

    console.log('[白噪音助眠] 已加载');
  }

  window.__whitenoiseInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();