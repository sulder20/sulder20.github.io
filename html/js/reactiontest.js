/* ============================================================
   岁窦工具箱 · 反应速度测试
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var HISTORY_KEY = 'suidou-reactiontest-history-v1';
  var HISTORY_MAX = 20;
  var ROUNDS_PER_TEST = 6;      // 每轮完整测试的次数
  var MIN_DELAY = 1000;         // 最短等待 1s
  var MAX_DELAY = 4000;         // 最长等待 4s

  /* 评级：基于平均毫秒数 */
  var LEVELS = [
    { max: 180, name: '超人',   color: '#b71c1c', desc: '反应快得不像人类' },
    { max: 220, name: '顶尖',   color: '#c62828', desc: '专业电竞 / 运动员水平' },
    { max: 260, name: '优秀',   color: '#e8734a', desc: '反应很快，状态不错' },
    { max: 300, name: '良好',   color: '#f6c453', desc: '正常偏快，可以再练' },
    { max: 350, name: '普通',   color: '#8a6414', desc: '大众平均水平' },
    { max: 450, name: '偏慢',   color: '#7a6a5a', desc: '稍微慢一点，休息一下再试' },
    { max: Infinity, name: '需要练习', color: '#6b6b6b', desc: '多练习，反应会越来越快' }
  ];

  var state = 'idle';       // idle | waiting | ready | result
  var waitTimer = null;
  var readyAt = 0;
  var roundTimes = [];      // 当前测试已经记录的毫秒数数组
  var history = [];         // [{ time, avg, times, level }]

  var stage, stageTitle, stageHint, stageRound, resultEl, historyEl, startBtn;

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[反应测试]', msg);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function levelFor(avg) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (avg < LEVELS[i].max) return LEVELS[i];
    }
    return LEVELS[LEVELS.length - 1];
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-reactiontest');
    if (!page) return;

    stage       = document.getElementById('rtStage');
    stageTitle  = document.getElementById('rtStageTitle');
    stageHint   = document.getElementById('rtStageHint');
    stageRound  = document.getElementById('rtRound');
    resultEl    = document.getElementById('rtResult');
    historyEl   = document.getElementById('rtHistory');
    startBtn    = document.getElementById('rtStart');

    if (!stage) return;

    inited = true;
    loadHistory();
    bindEvents();
    renderHistory();
    resetAll();
    console.log('[反应测试] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    if (startBtn) {
      startBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (state === 'idle' || state === 'result') {
          startNewTest();
        }
      });
    }

    if (stage) {
      stage.addEventListener('click', function () {
        handleClick();
      });

      // 触摸设备
      stage.addEventListener('touchstart', function (e) {
        e.preventDefault();
        handleClick();
      }, { passive: false });
    }

    var clearBtn = document.getElementById('rtClearHistory');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!history.length) return;
        if (!confirm('确定清空全部历史记录吗？')) return;
        history = [];
        saveHistory();
        renderHistory();
        toast('历史已清空');
      });
    }
  }

  /* ---------- 状态渲染 ---------- */
  function setState(newState) {
    state = newState;
    if (!stage) return;
    stage.classList.remove('rt-idle', 'rt-waiting', 'rt-ready', 'rt-result');
    stage.classList.add('rt-' + newState);
  }

  function resetAll() {
    clearTimeout(waitTimer);
    waitTimer = null;
    roundTimes = [];
    setState('idle');
    if (stageTitle) stageTitle.textContent = '点击开始';
    if (stageHint)  stageHint.textContent  = '共 ' + ROUNDS_PER_TEST + ' 次，取平均';
    if (stageRound) stageRound.textContent = '0 / ' + ROUNDS_PER_TEST;
    if (resultEl)   resultEl.innerHTML     = '';
  }

  function startNewTest() {
    clearTimeout(waitTimer);
    roundTimes = [];
    if (resultEl) resultEl.innerHTML = '';
    if (stageRound) stageRound.textContent = '0 / ' + ROUNDS_PER_TEST;
    scheduleNext();
  }

  /* ---------- 安排下一轮 ---------- */
  function scheduleNext() {
    setState('waiting');
    if (stageTitle) stageTitle.textContent = '等待…';
    if (stageHint)  stageHint.textContent  = '变绿后立即点击';
    var delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    waitTimer = setTimeout(function () {
      setState('ready');
      if (stageTitle) stageTitle.textContent = '点击！';
      if (stageHint)  stageHint.textContent  = '越快越好';
      readyAt = performance.now();
    }, delay);
  }

  /* ---------- 点击处理 ---------- */
  function handleClick() {
    if (state === 'waiting') {
      // 提前点击
      clearTimeout(waitTimer);
      waitTimer = null;
      setState('idle');
      if (stageTitle) stageTitle.textContent = '太早了';
      if (stageHint)  stageHint.textContent  = '还没变绿就点了，点击重新开始';
      if (resultEl) {
        resultEl.innerHTML = '<p class="rt-msg rt-msg-warn">❌ 抢跑！请等颜色变绿后再点击。</p>';
      }
      return;
    }

    if (state === 'ready') {
      var ms = Math.round(performance.now() - readyAt);
      roundTimes.push(ms);
      if (stageRound) stageRound.textContent = roundTimes.length + ' / ' + ROUNDS_PER_TEST;

      // 显示本轮结果
      showRoundResult(ms);

      if (roundTimes.length >= ROUNDS_PER_TEST) {
        // 完成
        finishTest();
      } else {
        // 短暂延迟后进入下一轮
        setState('idle');
        if (stageTitle) stageTitle.textContent = '很好';
        if (stageHint)  stageHint.textContent  = ms + ' ms，准备下一轮…';
        waitTimer = setTimeout(function () {
          scheduleNext();
        }, 800);
      }
      return;
    }

    if (state === 'idle' && roundTimes.length > 0 && roundTimes.length < ROUNDS_PER_TEST) {
      // 允许中途点击继续（例如上一轮结束后）
      return;
    }
  }

  /* ---------- 本轮结果 ---------- */
  function showRoundResult(ms) {
    if (!resultEl) return;
    var lvl = levelFor(ms);
    resultEl.innerHTML =
      '<div class="rt-round-result">' +
        '<span class="rt-round-ms" style="color:' + lvl.color + '">' + ms + '<small> ms</small></span>' +
        '<span class="rt-round-tag" style="background:' + lvl.color + '1f;color:' + lvl.color + '">' + esc(lvl.name) + '</span>' +
      '</div>';
  }

  /* ---------- 完成整轮测试 ---------- */
  function finishTest() {
    setState('result');
    var sum = roundTimes.reduce(function (a, b) { return a + b; }, 0);
    var avg = Math.round(sum / roundTimes.length);
    var best = Math.min.apply(null, roundTimes);
    var worst = Math.max.apply(null, roundTimes);
    var lvl = levelFor(avg);

    if (stageTitle) stageTitle.textContent = lvl.name;
    if (stageHint)  stageHint.textContent  = '平均 ' + avg + ' ms';

    if (resultEl) {
      resultEl.innerHTML =
        '<div class="rt-final" style="border-color:' + lvl.color + '55;background:' + lvl.color + '10;">' +
          '<div class="rt-final-level" style="color:' + lvl.color + '">' + esc(lvl.name) + '</div>' +
          '<div class="rt-final-avg">' + avg + '<small> ms 平均</small></div>' +
          '<div class="rt-final-desc">' + esc(lvl.desc) + '</div>' +
          '<div class="rt-final-meta">' +
            '<span>最快 <b>' + best + '</b> ms</span>' +
            '<span>最慢 <b>' + worst + '</b> ms</span>' +
            '<span>共 <b>' + roundTimes.length + '</b> 次</span>' +
          '</div>' +
          '<div class="rt-final-times">' +
            roundTimes.map(function (t) { return '<span class="rt-chip">' + t + '</span>'; }).join('') +
          '</div>' +
        '</div>';
    }

    addHistory(avg, roundTimes.slice(), lvl.name);
    toast('测试完成：平均 ' + avg + ' ms · ' + lvl.name);
  }

  /* ---------- 历史 ---------- */
  function loadHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      history = raw ? JSON.parse(raw) || [] : [];
    } catch (e) { history = []; }
  }

  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (e) {}
  }

  function addHistory(avg, times, levelName) {
    var d = new Date();
    var timeStr = pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
                  pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    history.unshift({
      time: timeStr,
      avg: avg,
      times: times,
      level: levelName,
      best: Math.min.apply(null, times)
    });
    if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX);
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!historyEl) return;
    var cnt = document.getElementById('rtHistoryCount');
    if (cnt) cnt.textContent = history.length;

    if (!history.length) {
      historyEl.innerHTML = '<p class="empty" style="grid-column:1/-1;">还没有记录，点上面「点击开始」测一次～</p>';
      return;
    }
    historyEl.innerHTML = history.map(function (h) {
      var lvl = levelFor(h.avg);
      return '<div class="rt-history-item">' +
        '<div class="rt-history-top">' +
          '<span class="rt-history-avg" style="color:' + lvl.color + '">' + h.avg + '<small> ms</small></span>' +
          '<span class="rt-history-level" style="background:' + lvl.color + '1f;color:' + lvl.color + '">' + esc(h.level) + '</span>' +
        '</div>' +
        '<div class="rt-history-sub">最快 ' + h.best + ' ms · 共 ' + h.times.length + ' 次</div>' +
        '<div class="rt-history-time">' + esc(h.time) + '</div>' +
      '</div>';
    }).join('');
  }

  window.__reactiontestInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();