/* ============================================================
   岁窦工具箱 · 幸运转盘（带权重概率）
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var HISTORY_KEY = 'suidou-luckywheel-history-v1';
  var HISTORY_MAX = 20;
  var MAX_OPTIONS = 12;
  var MIN_OPTIONS = 2;
  var WEIGHT_MIN = 1;
  var WEIGHT_MAX = 100;

  var THEMES = {
    rainbow: { name: '彩虹',   colors: ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f43f5e','#a855f7','#10b981','#f59e0b'] },
    macaron: { name: '马卡龙', colors: ['#ff8fab','#ffb3c6','#ffc8dd','#ffd6a5','#fdffb6','#caffbf','#9bf6ff','#a0c4ff','#bdb2ff','#ffc6ff'] },
    neon:    { name: '霓虹',   colors: ['#ff006e','#fb5607','#ffbe0b','#8338ec','#3a86ff','#06ffa5','#e63946','#f77f00','#fcbf49','#a663cc'] },
    forest:  { name: '森林',   colors: ['#1b4332','#2d6a4f','#40916c','#52b788','#74c69d','#95d5b2','#b7e4c7','#d8f3dc'] },
    ocean:   { name: '海洋',   colors: ['#03045e','#023e8a','#0077b6','#0096c7','#00b4d8','#48cae4','#90e0ef','#ade8f4','#caf0f8'] },
    gold:    { name: '红金',   colors: ['#c62828','#f6c453','#8e0000','#ffd766','#b71c1c','#e8b23c','#9e1414','#a91f1f'] }
  };

  var options = [
    { name: '一等奖',   weight: 1 },
    { name: '二等奖',   weight: 1 },
    { name: '三等奖',   weight: 1 },
    { name: '谢谢参与', weight: 1 },
    { name: '再来一次', weight: 1 }
  ];
  var currentTheme = 'rainbow';
  var history = [];
  var rotating = false;
  var currentDeg = 0;

  var canvas, ctx, wheelWrap, goBtn, resultValue, historyEl, optionsBox, themesBox;

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[幸运转盘]', msg);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function totalWeight() {
    return options.reduce(function (s, o) { return s + (o.weight || 1); }, 0);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-luckywheel');
    if (!page) return;

    canvas = document.getElementById('lwCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    wheelWrap = document.getElementById('lwWheelWrap');
    goBtn = document.getElementById('lwGo');
    resultValue = document.getElementById('lwResultValue');
    historyEl = document.getElementById('lwHistory');
    optionsBox = document.getElementById('lwOptions');
    themesBox = document.getElementById('lwThemes');

    inited = true;
    loadHistory();
    renderOptions();
    renderThemes();
    bindEvents();
    drawWheel();
    renderHistory();
    console.log('[幸运转盘] 已加载');
  }

  /* ---------- 选项 ---------- */
  function renderOptions() {
    if (!optionsBox) return;
    optionsBox.innerHTML = '';
    var total = totalWeight();

    options.forEach(function (opt, i) {
      var row = document.createElement('div');
      row.className = 'lw-option-row';

      var idx = document.createElement('span');
      idx.className = 'lw-option-idx';
      idx.textContent = i + 1;

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'lw-option-input';
      input.value = opt.name;
      input.maxLength = 20;
      input.placeholder = '选项名称';
      input.addEventListener('input', function () {
        options[i].name = input.value.trim() || ('选项' + (i + 1));
        drawWheel();
      });

      var wWrap = document.createElement('div');
      wWrap.className = 'lw-weight-wrap';
      wWrap.title = '权重越大，扇区越宽，中奖概率越高';

      var wInput = document.createElement('input');
      wInput.type = 'number';
      wInput.className = 'lw-weight-input';
      wInput.min = WEIGHT_MIN;
      wInput.max = WEIGHT_MAX;
      wInput.step = 1;
      wInput.value = opt.weight;

      var wTag = document.createElement('span');
      wTag.className = 'lw-weight-pct';
      wTag.textContent = ((opt.weight / total) * 100).toFixed(1) + '%';

      wInput.addEventListener('input', function () {
        var v = parseInt(wInput.value, 10);
        if (!isFinite(v) || v < WEIGHT_MIN) v = WEIGHT_MIN;
        if (v > WEIGHT_MAX) v = WEIGHT_MAX;
        options[i].weight = v;
        refreshPercents();
        drawWheel();
      });
      wInput.addEventListener('blur', function () {
        var v = parseInt(wInput.value, 10);
        if (!isFinite(v) || v < WEIGHT_MIN) v = WEIGHT_MIN;
        if (v > WEIGHT_MAX) v = WEIGHT_MAX;
        wInput.value = v;
        options[i].weight = v;
        refreshPercents();
        drawWheel();
      });

      wWrap.append(wInput, wTag);

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'lw-option-del';
      del.textContent = '×';
      del.title = '删除';
      del.disabled = options.length <= MIN_OPTIONS;
      del.addEventListener('click', function () {
        if (options.length <= MIN_OPTIONS) { toast('至少保留 ' + MIN_OPTIONS + ' 个选项'); return; }
        options.splice(i, 1);
        renderOptions();
        drawWheel();
      });

      row.append(idx, input, wWrap, del);
      optionsBox.appendChild(row);
    });
  }

  function refreshPercents() {
    if (!optionsBox) return;
    var total = totalWeight();
    var rows = optionsBox.querySelectorAll('.lw-option-row');
    rows.forEach(function (row, i) {
      var pct = row.querySelector('.lw-weight-pct');
      if (pct && options[i]) {
        pct.textContent = ((options[i].weight / total) * 100).toFixed(1) + '%';
      }
    });
  }

  /* ---------- 主题 ---------- */
  function renderThemes() {
    if (!themesBox) return;
    themesBox.innerHTML = '';
    Object.keys(THEMES).forEach(function (key) {
      var t = THEMES[key];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lw-theme' + (key === currentTheme ? ' active' : '');
      btn.dataset.theme = key;

      var dots = document.createElement('div');
      dots.className = 'lw-theme-dots';
      t.colors.slice(0, 6).forEach(function (c) {
        var d = document.createElement('span');
        d.style.background = c;
        dots.appendChild(d);
      });

      var name = document.createElement('span');
      name.className = 'lw-theme-name';
      name.textContent = t.name;

      btn.append(dots, name);
      btn.addEventListener('click', function () {
        currentTheme = key;
        themesBox.querySelectorAll('.lw-theme').forEach(function (b) {
          b.classList.toggle('active', b.dataset.theme === key);
        });
        drawWheel();
      });

      themesBox.appendChild(btn);
    });
  }

  /* ---------- 绘制（按权重分配角度） ---------- */
  function drawWheel() {
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;
    var r = Math.min(W, H) / 2 - 6;

    ctx.clearRect(0, 0, W, H);

    var n = options.length;
    var total = totalWeight();
    var colors = THEMES[currentTheme].colors;

    var startRad = -Math.PI / 2;
    var acc = 0;

    for (var i = 0; i < n; i++) {
      var frac = options[i].weight / total;
      var a0 = startRad + (acc / total) * Math.PI * 2;
      var a1 = startRad + ((acc + options[i].weight) / total) * Math.PI * 2;
      acc += options[i].weight;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 扇区足够宽才画标签
      var span = (a1 - a0);
      if (span < 0.22) continue;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((a0 + a1) / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold ' + Math.max(13, Math.min(20, 400 / Math.max(n, 6))) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,.4)';
      ctx.shadowBlur = 4;
      var label = options[i].name || '';
      if (label.length > 9) label = label.slice(0, 9) + '…';
      ctx.fillText(label, r - 18, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,.22)';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.13, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.12)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /* ---------- 计算扇区中心角（度，顺时针从顶部开始） ---------- */
  function sectorCenterDeg(idx) {
    var total = totalWeight();
    var acc = 0;
    for (var i = 0; i < idx; i++) acc += options[i].weight;
    var center = acc + options[idx].weight / 2;
    return (center / total) * 360;
  }

  /* ---------- 按权重随机抽 ---------- */
  function pickByWeight() {
    var total = totalWeight();
    var r = Math.random() * total;
    var acc = 0;
    for (var i = 0; i < options.length; i++) {
      acc += options[i].weight;
      if (r < acc) return i;
    }
    return options.length - 1;
  }

  /* ---------- 旋转 ---------- */
  function spin() {
    if (rotating) return;
    if (options.length < MIN_OPTIONS) { toast('至少需要 ' + MIN_OPTIONS + ' 个选项'); return; }

    rotating = true;
    goBtn.disabled = true;
    goBtn.textContent = '旋转中';
    resultValue.textContent = '…';

    var idx = pickByWeight();
    var centerDeg = sectorCenterDeg(idx);

    // 目标绝对角度（让扇区中心对准指针）
    var targetAbs = (360 - centerDeg) % 360;
    var minTarget = currentDeg + 360 * 5;
    var k = Math.ceil((minTarget - targetAbs) / 360);
    var newDeg = 360 * k + targetAbs;

    wheelWrap.style.transition = 'transform 4.8s cubic-bezier(0.17, 0.67, 0.18, 1)';
    wheelWrap.style.transform = 'rotate(' + newDeg + 'deg)';
    currentDeg = newDeg;

    setTimeout(function () {
      rotating = false;
      goBtn.disabled = false;
      goBtn.textContent = '开始';
      var result = options[idx].name;
      resultValue.textContent = result;
      addHistory(result);
      toast('结果：' + result);
    }, 4900);
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

  function addHistory(result) {
    var d = new Date();
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    var timeStr = p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    history.unshift({ result: result, time: timeStr });
    if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX);
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!historyEl) return;
    var cnt = document.getElementById('lwHistoryCount');
    if (cnt) cnt.textContent = history.length;

    if (!history.length) {
      historyEl.innerHTML = '<p class="empty" style="grid-column:1/-1;">还没有记录，转一次试试～</p>';
      return;
    }
    historyEl.innerHTML = history.map(function (h) {
      return '<div class="lw-history-item">' +
        '<span class="lw-history-result">' + esc(h.result) + '</span>' +
        '<span class="lw-history-time">' + esc(h.time) + '</span>' +
      '</div>';
    }).join('');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    if (goBtn) goBtn.addEventListener('click', spin);

    var addBtn = document.getElementById('lwAddOption');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (options.length >= MAX_OPTIONS) { toast('最多 ' + MAX_OPTIONS + ' 个选项'); return; }
        options.push({ name: '选项' + (options.length + 1), weight: 1 });
        renderOptions();
        drawWheel();
      });
    }

    var avgBtn = document.getElementById('lwAvgWeight');
    if (avgBtn) {
      avgBtn.addEventListener('click', function () {
        options.forEach(function (o) { o.weight = 1; });
        renderOptions();
        drawWheel();
        toast('已恢复平均权重');
      });
    }

    var clearBtn = document.getElementById('lwClearHistory');
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

  window.__luckywheelInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();