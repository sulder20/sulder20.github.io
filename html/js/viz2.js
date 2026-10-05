/* ============================================================
   生活可视化 · 岁窦工具箱 V4.2
   数据驱动 + Canvas 动画 + 参数面板
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-visualization');
  if (!page) return;

  var visuals = [];
  var currentViz = null;
  var currentCat = 'all';
  var keyword = '';

  var anim = {
    playing: false,
    elapsed: 0,
    lastTs: 0,
    raf: null,
    state: {},
    params: {}
  };

  var canvas = null;
  var ctx = null;

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function catName(c) {
    return { biology: '生物', geography: '地理', others: '其它' }[c] || c;
  }
  function catIcon(c) {
    if (c === 'biology') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4c4 4 4 12 0 16M20 4c-4 4-4 12 0 16M4 12h16"/></svg>';
    }
    if (c === 'geography') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>';
  }

  /* ---------- 列表渲染 ---------- */
  function filtered() {
    var q = keyword.toLowerCase().trim();
    return visuals.filter(function (v) {
      if (currentCat !== 'all' && v.category !== currentCat) return false;
      if (!q) return true;
      var hay = (v.name + ' ' + (v.tags || []).join(' ') + ' ' + (v.desc || '') + ' ' + (v.detail || '')).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }

  function renderList() {
    var list = filtered();
    var grid = document.getElementById('vizGrid');
    var empty = document.getElementById('vizEmpty');
    var stats = document.getElementById('vizStats');

    if (stats) {
      stats.innerHTML = '共 <b>' + list.length + '</b> 个可视化' +
        (currentCat === 'all' ? '' : '（' + esc(catName(currentCat)) + '）');
    }

    if (!list.length) {
      grid.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    grid.innerHTML = list.map(function (v) {
      return '<div class="viz-card cat-' + v.category + '" data-viz-id="' + esc(v.id) + '">' +
        '<div class="viz-card-head">' +
          '<div class="viz-card-icon">' + catIcon(v.category) + '</div>' +
          '<h4 class="viz-card-name">' + esc(v.name) + '</h4>' +
        '</div>' +
        '<p class="viz-card-desc">' + esc(v.desc || '') + '</p>' +
        '<div class="viz-card-tags">' +
          '<span class="viz-tag">' + esc(catName(v.category)) + '</span>' +
          (v.tags || []).slice(0, 3).map(function (t) {
            return '<span class="viz-tag">' + esc(t) + '</span>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');

    grid.querySelectorAll('[data-viz-id]').forEach(function (card) {
      card.addEventListener('click', function () { openDetail(card.dataset.vizId); });
    });
  }

  /* ---------- 详情 ---------- */
  function openDetail(id) {
    var v = visuals.find(function (x) { return x.id === id; });
    if (!v) return;
    currentViz = v;

    document.getElementById('vizListView').style.display = 'none';
    document.getElementById('vizDetailView').style.display = '';

    document.getElementById('vizDetailName').textContent = v.name;
    document.getElementById('vizDetailTags').innerHTML =
      '<span class="viz-tag" style="background:var(--primary-soft);color:var(--primary-dark);border-color:transparent;">' +
      esc(catName(v.category)) + '</span>' +
      (v.tags || []).map(function (t) { return '<span class="viz-tag">' + esc(t) + '</span>'; }).join('');
    document.getElementById('vizDetailDesc').textContent = v.desc || '';
    document.getElementById('vizDetailMore').textContent = v.detail || '';

    renderParams(v);
    initAnimation(v);
  }

  function renderParams(v) {
    var el = document.getElementById('vizParams');
    if (!v.params || !v.params.length) {
      el.innerHTML = '';
      anim.params = {};
      return;
    }
    anim.params = {};
    v.params.forEach(function (p) { anim.params[p.key] = p.default; });
    el.innerHTML = v.params.map(function (p) {
      return '<div class="viz-param">' +
        '<span class="viz-param-label">' + esc(p.label) + '</span>' +
        '<input type="range" data-param="' + esc(p.key) + '" min="' + p.min + '" max="' + p.max + '" step="' + (p.step || 1) + '" value="' + p.default + '">' +
        '<span class="viz-param-val" data-param-val="' + esc(p.key) + '">' + p.default + '</span>' +
      '</div>';
    }).join('');
    el.querySelectorAll('input[data-param]').forEach(function (input) {
      input.addEventListener('input', function () {
        var k = input.dataset.param;
        var v2 = parseFloat(input.value);
        anim.params[k] = v2;
        var vv = el.querySelector('[data-param-val="' + k + '"]');
        if (vv) vv.textContent = v2;
        resetAnim();
        initState();
        drawFrame(0);
      });
    });
  }

  /* ---------- 动画控制 ---------- */
  function initAnimation(v) {
    canvas = document.getElementById('vizCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resetAnim();
    initState();
    drawFrame(0);
    updateTimeUI();
  }

  function initState() {
    var v = currentViz;
    if (!v) return;
    anim.state = {};
    if (typeof v.init === 'function') {
      try { v.init(anim.state, anim.params); }
      catch (e) { console.error('[可视化] init 失败：', e); }
    }
  }

  function resetAnim() {
    stopAnim();
    anim.elapsed = 0;
    updatePlayBtn();
    updateProgressUI(0);
    updateTimeUI();
  }

  function startAnim() {
    if (!currentViz || anim.playing) return;
    anim.playing = true;
    anim.lastTs = performance.now();
    anim.raf = requestAnimationFrame(tick);
    updatePlayBtn();
  }

  function stopAnim() {
    anim.playing = false;
    if (anim.raf) { cancelAnimationFrame(anim.raf); anim.raf = null; }
    updatePlayBtn();
  }

  function tick(ts) {
    if (!anim.playing || !currentViz) return;
    var dt = (ts - anim.lastTs) / 1000;
    anim.lastTs = ts;
    if (dt > 0.1) dt = 0.1;
    anim.elapsed += dt;

    var duration = currentViz.duration || 8;
    if (anim.elapsed >= duration) {
      anim.elapsed = duration;
      drawFrame(dt);
      stopAnim();
      updateProgressUI(1);
      updateTimeUI();
      return;
    }
    drawFrame(dt);
    updateProgressUI(anim.elapsed / duration);
    updateTimeUI();
    anim.raf = requestAnimationFrame(tick);
  }

  function drawFrame(dt) {
    var v = currentViz;
    if (!v || !ctx) return;
    var duration = v.duration || 8;
    var progress = duration > 0 ? Math.min(1, anim.elapsed / duration) : 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (typeof v.step === 'function') {
      try {
        v.step(ctx, canvas, anim.state, anim.params, dt, anim.elapsed, progress);
      } catch (e) {
        console.error('[可视化] step 失败：', e);
        ctx.fillStyle = '#b91c1c';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('绘制出错：' + (e.message || e), canvas.width / 2, canvas.height / 2);
      }
    }
  }

  function seekTo(progress) {
    if (!currentViz) return;
    var duration = currentViz.duration || 8;
    var target = progress * duration;
    resetAnim();
    initState();
    var dt = 1 / 60, t = 0;
    while (t < target) {
      var stepDt = Math.min(dt, target - t);
      t += stepDt;
      if (typeof currentViz.step === 'function') {
        try { currentViz.step(ctx, canvas, anim.state, anim.params, stepDt, t, t / duration); } catch (e) {}
      }
    }
    anim.elapsed = target;
    drawFrame(0);
    updateProgressUI(progress);
    updateTimeUI();
  }

  /* ---------- UI ---------- */
  function updatePlayBtn() {
    var btn = document.getElementById('vizPlayBtn');
    if (!btn) return;
    btn.textContent = anim.playing ? '⏸ 暂停' : (anim.elapsed > 0 ? '▶ 继续' : '▶ 播放');
  }
  function updateProgressUI(p) {
    var bar = document.getElementById('vizProgress');
    if (bar) bar.value = Math.round(p * 1000);
  }
  function updateTimeUI() {
    var el = document.getElementById('vizTime');
    if (!el || !currentViz) return;
    var d = currentViz.duration || 8;
    el.textContent = anim.elapsed.toFixed(1) + ' / ' + d.toFixed(1) + ' s';
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    var searchEl = document.getElementById('vizSearch');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        keyword = searchEl.value.trim();
        renderList();
      });
    }
    document.querySelectorAll('#page-visualization [data-viz-cat]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#page-visualization [data-viz-cat]').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentCat = tab.dataset.vizCat;
        renderList();
      });
    });
    var backBtn = document.getElementById('vizBack');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        stopAnim();
        document.getElementById('vizDetailView').style.display = 'none';
        document.getElementById('vizListView').style.display = '';
        currentViz = null;
      });
    }
    var playBtn = document.getElementById('vizPlayBtn');
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (!currentViz) return;
        if (anim.playing) { stopAnim(); return; }
        var d = currentViz.duration || 8;
        if (anim.elapsed >= d) {
          resetAnim(); initState(); drawFrame(0);
        }
        startAnim();
      });
    }
    var resetBtn = document.getElementById('vizResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!currentViz) return;
        resetAnim(); initState(); drawFrame(0);
      });
    }
    var progressBar = document.getElementById('vizProgress');
    if (progressBar) {
      progressBar.addEventListener('input', function () {
        if (!currentViz) return;
        stopAnim();
        seekTo(parseFloat(progressBar.value) / 1000);
      });
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (window.__vizInited) return;
    window.__vizInited = true;

    if (window.LIFE_VISUALS && Array.isArray(window.LIFE_VISUALS)) {
      visuals = window.LIFE_VISUALS;
    } else {
      console.warn('[生活可视化] 未找到 LIFE_VISUALS 数据');
      visuals = [];
    }

    bindEvents();
    renderList();
    console.log('[生活可视化] 已加载，共 ' + visuals.length + ' 个可视化');
  }

  window.__vizInit = function () {
    if (!window.__vizInited) init();
    else {
      renderList();
      if (currentViz) drawFrame(0);
    }
  };

  if (page.classList.contains('active')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else init();
  }

  console.log('[生活可视化] 框架已加载');
})();