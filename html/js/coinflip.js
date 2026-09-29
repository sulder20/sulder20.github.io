/* ============================================================
   岁窦工具箱 · 抛硬币模拟器
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var HISTORY_KEY = 'suidou-coinflip-history-v1';
  var HISTORY_MAX = 30;
  var MAX_FLIP = 10000;

  var currentRotation = 0;
  var flipping = false;
  var history = []; // [{ time, count, heads, tails, sequence }]

  var coin, stage, resultValue, resultSub, historyEl, statsEl;

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[抛硬币]', msg);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-coinflip');
    if (!page) return;

    coin      = document.getElementById('cfCoin');
    stage     = document.getElementById('cfStage');
    if (!coin) return;

    resultValue = document.getElementById('cfResultValue');
    resultSub   = document.getElementById('cfResultSub');
    historyEl   = document.getElementById('cfHistory');
    statsEl     = document.getElementById('cfStats');

    inited = true;
    loadHistory();
    bindEvents();
    renderStats();
    renderHistory();
    console.log('[抛硬币] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    document.querySelectorAll('[data-cf-flip]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var n = parseInt(btn.dataset.cfFlip, 10) || 1;
        doFlip(n);
      });
    });

    var customBtn = document.getElementById('cfCustomGo');
    if (customBtn) {
      customBtn.addEventListener('click', function () {
        var input = document.getElementById('cfCustomCount');
        var n = parseInt(input.value, 10);
        if (!isFinite(n) || n < 1) { toast('请输入 1 以上的整数'); return; }
        if (n > MAX_FLIP) { n = MAX_FLIP; input.value = MAX_FLIP; }
        doFlip(n);
      });
    }

    var input = document.getElementById('cfCustomCount');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          customBtn && customBtn.click();
        }
      });
    }

    var clearBtn = document.getElementById('cfClearHistory');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!history.length) return;
        if (!confirm('确定清空全部历史记录吗？')) return;
        history = [];
        saveHistory();
        renderStats();
        renderHistory();
        resetResult();
        toast('历史已清空');
      });
    }
  }

  /* ---------- 投掷 ---------- */
  function doFlip(n) {
    if (flipping) return;
    flipping = true;

    // 生成结果
    var heads = 0, tails = 0;
    var seq = new Array(n);
    for (var i = 0; i < n; i++) {
      if (Math.random() < 0.5) { seq[i] = 'H'; heads++; }
      else { seq[i] = 'T'; tails++; }
    }

    if (n === 1) {
      // 单次：3D 动画
      flipSingle(seq[0], function () {
        showResultSingle(seq[0]);
        addHistory(n, heads, tails, seq);
        flipping = false;
      });
    } else {
      // 多次：先快速旋转效果，再出结果
      playSpinEffect(function () {
        showResultMulti(n, heads, tails);
        addHistory(n, heads, tails, seq);
        flipping = false;
      });
    }
  }

  /* ---------- 单次翻转 ---------- */
  function flipSingle(result, done) {
    // 目标面：正面朝前 → 角度 % 360 === 0；反面朝前 → 180
    var targetBase = result === 'H' ? 0 : 180;
    var minAngle = currentRotation + 1440; // 至少 4 圈
    var offset = ((targetBase - (minAngle % 360)) + 360) % 360;
    var target = minAngle + offset;
    currentRotation = target;

    if (stage) stage.classList.add('cf-flipping');
    coin.style.transition = 'transform 2s cubic-bezier(.22,.9,.28,1)';
    coin.style.transform = 'rotateY(' + target + 'deg)';

    // 加一点抖动效果
    setTimeout(function () {
      if (stage) stage.classList.remove('cf-flipping');
      done && done();
    }, 2050);
  }

  /* ---------- 多次旋转效果 ---------- */
  function playSpinEffect(done) {
    if (stage) stage.classList.add('cf-spinning');
    if (resultValue) resultValue.textContent = '…';
    if (resultSub) resultSub.textContent = '投掷中';
    // 转 1 秒后出结果
    setTimeout(function () {
      if (stage) stage.classList.remove('cf-spinning');
      done && done();
    }, 900);
  }

  /* ---------- 结果展示 ---------- */
  function showResultSingle(r) {
    if (resultValue) {
      resultValue.textContent = r === 'H' ? '正面' : '反面';
      resultValue.className = 'cf-result-value ' + (r === 'H' ? 'heads' : 'tails');
    }
    if (resultSub) resultSub.textContent = '第 ' + (history.length + 1) + ' 次投掷';
    toast('结果：' + (r === 'H' ? '正面' : '反面'));
  }

  function showResultMulti(n, heads, tails) {
    var hp = ((heads / n) * 100).toFixed(1);
    var tp = ((tails / n) * 100).toFixed(1);
    if (resultValue) {
      resultValue.textContent = '正 ' + heads + ' · 反 ' + tails;
      resultValue.className = 'cf-result-value';
    }
    if (resultSub) resultSub.textContent = '共 ' + n + ' 次　·　正面 ' + hp + '%　·　反面 ' + tp + '%';
    toast('投掷 ' + n + ' 次完成');
  }

  function resetResult() {
    if (resultValue) {
      resultValue.textContent = '—';
      resultValue.className = 'cf-result-value';
    }
    if (resultSub) resultSub.textContent = '点击上方按钮开始';
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

  function addHistory(count, heads, tails, seq) {
    var d = new Date();
    var timeStr = pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
                  pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    history.unshift({
      time: timeStr,
      count: count,
      heads: heads,
      tails: tails,
      sequence: seq
    });
    if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX);
    saveHistory();
    renderStats();
    renderHistory();
  }

  function renderHistory() {
    if (!historyEl) return;
    var cnt = document.getElementById('cfHistoryCount');
    if (cnt) cnt.textContent = history.length;

    if (!history.length) {
      historyEl.innerHTML = '<p class="empty" style="grid-column:1/-1;">还没有记录，投掷一次试试～</p>';
      return;
    }

    historyEl.innerHTML = history.map(function (h) {
      var summary = h.count === 1
        ? (h.heads === 1 ? '正面' : '反面')
        : ('正 ' + h.heads + ' · 反 ' + h.tails);

      // 序列可视化：≤ 20 次显示小圆点；> 20 次只显示摘要
      var dotsHtml = '';
      if (h.sequence && h.sequence.length <= 20) {
        dotsHtml = '<div class="cf-history-dots">' +
          h.sequence.map(function (s) {
            return '<span class="cf-dot ' + (s === 'H' ? 'h' : 't') + '"></span>';
          }).join('') + '</div>';
      } else if (h.sequence) {
        var preview = h.sequence.slice(0, 20).map(function (s) {
          return '<span class="cf-dot ' + (s === 'H' ? 'h' : 't') + '"></span>';
        }).join('');
        dotsHtml = '<div class="cf-history-dots">' + preview + '<span class="cf-dot-more">…</span></div>';
      }

      return '<div class="cf-history-item">' +
        '<div class="cf-history-top">' +
          '<span class="cf-history-summary">' + esc(summary) + '</span>' +
          '<span class="cf-history-count">× ' + h.count + '</span>' +
        '</div>' +
        dotsHtml +
        '<span class="cf-history-time">' + esc(h.time) + '</span>' +
      '</div>';
    }).join('');
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    if (!statsEl) return;
    var total = 0, heads = 0, tails = 0;
    var allSeq = [];

    history.forEach(function (h) {
      total += h.count;
      heads += h.heads;
      tails += h.tails;
      if (h.sequence && h.sequence.length) {
        allSeq = allSeq.concat(h.sequence);
      }
    });

    // 最长连续（从最早到最新，即倒序 allSeq）
    allSeq.reverse();
    var maxH = 0, maxT = 0, curH = 0, curT = 0;
    allSeq.forEach(function (s) {
      if (s === 'H') { curH++; curT = 0; if (curH > maxH) maxH = curH; }
      else { curT++; curH = 0; if (curT > maxT) maxT = curT; }
    });

    var hp = total ? ((heads / total) * 100).toFixed(1) : '0.0';
    var tp = total ? ((tails / total) * 100).toFixed(1) : '0.0';

    statsEl.innerHTML =
      '<div class="cf-stat"><span class="cf-stat-label">总投掷</span><b class="cf-stat-value">' + total + '</b></div>' +
      '<div class="cf-stat heads"><span class="cf-stat-label">正面</span><b class="cf-stat-value">' + heads + '</b><span class="cf-stat-sub">' + hp + '%</span></div>' +
      '<div class="cf-stat tails"><span class="cf-stat-label">反面</span><b class="cf-stat-value">' + tails + '</b><span class="cf-stat-sub">' + tp + '%</span></div>' +
      '<div class="cf-stat"><span class="cf-stat-label">最长连续正面</span><b class="cf-stat-value">' + maxH + '</b></div>' +
      '<div class="cf-stat"><span class="cf-stat-label">最长连续反面</span><b class="cf-stat-value">' + maxT + '</b></div>';
  }

  window.__coinflipInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();