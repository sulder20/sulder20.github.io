/* ============================================================
   数理化实验 · 岁窦工具箱 V4.2
   框架：数据驱动 + Canvas 动画 + 参数面板
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-lab');
  if (!page) return;

  /* ============================================================
     状态
     ============================================================ */
  var experiments = [];
  var currentExperiment = null;
  var currentSubject = 'all';
  var searchKeyword = '';

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

  /* ============================================================
     工具函数
     ============================================================ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function subjectName(s) {
    return { math:'数学', physics:'物理', chemistry:'化学' }[s] || s;
  }
  function subjectIcon(s) {
    if (s === 'math') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16M4 16h16M8 4v16M16 4v16"/></svg>';
    }
    if (s === 'physics') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/><circle cx="12" cy="12" r="3"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 19L14 9V3"/><path d="M6.5 14h11"/></svg>';
  }

  /* ============================================================
     一、列表渲染
     ============================================================ */
  function filterExperiments() {
    var q = searchKeyword.toLowerCase().trim();
    return experiments.filter(function (e) {
      if (currentSubject !== 'all' && e.subject !== currentSubject) return false;
      if (!q) return true;
      var hay = (e.name + ' ' + (e.tags || []).join(' ') + ' ' + (e.desc || '') + ' ' + (e.principle || '')).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }

  function renderList() {
    var list = filterExperiments();
    var grid = document.getElementById('labGrid');
    var empty = document.getElementById('labEmpty');
    var stats = document.getElementById('labStats');

    if (stats) {
      stats.innerHTML = '共 <b>' + list.length + '</b> 个实验' +
        (currentSubject === 'all' ? '' : '（' + esc(subjectName(currentSubject)) + '）');
    }

    if (!list.length) {
      grid.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';

    grid.innerHTML = list.map(function (e) {
      return '<div class="lab-card subject-' + e.subject + '" data-lab-id="' + esc(e.id) + '">' +
        '<div class="lab-card-head">' +
          '<div class="lab-card-icon">' + subjectIcon(e.subject) + '</div>' +
          '<h4 class="lab-card-name">' + esc(e.name) + '</h4>' +
        '</div>' +
        '<p class="lab-card-desc">' + esc(e.desc || '') + '</p>' +
        '<div class="lab-card-tags">' +
          (e.tags || []).slice(0, 4).map(function (t) {
            return '<span class="lab-tag">' + esc(t) + '</span>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');

    grid.querySelectorAll('[data-lab-id]').forEach(function (card) {
      card.addEventListener('click', function () {
        openDetail(card.dataset.labId);
      });
    });
  }

  /* ============================================================
     二、详情页
     ============================================================ */
  function openDetail(id) {
    var e = experiments.find(function (x) { return x.id === id; });
    if (!e) return;
    currentExperiment = e;

    document.getElementById('labListView').style.display = 'none';
    document.getElementById('labDetailView').style.display = '';

    /* 信息栏 */
    document.getElementById('labDetailName').textContent = e.name;
    document.getElementById('labDetailTags').innerHTML =
      '<span class="lab-tag" style="background:var(--primary-soft);color:var(--primary-dark);border-color:transparent;">' +
      esc(subjectName(e.subject)) + '</span>' +
      (e.tags || []).map(function (t) { return '<span class="lab-tag">' + esc(t) + '</span>'; }).join('');

    document.getElementById('labDetailPurpose').textContent = e.purpose || '—';
    document.getElementById('labDetailPrinciple').textContent = e.principle || '—';
    document.getElementById('labDetailApparatus').textContent = e.apparatus || '—';
    document.getElementById('labDetailSteps').innerHTML =
      (e.steps || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') || '<li>—</li>';
    document.getElementById('labDetailPhenomenon').textContent = e.phenomenon || '—';
    document.getElementById('labDetailConclusion').textContent = e.conclusion || '—';
    document.getElementById('labDetailNotice').textContent = e.notice || '—';

    /* 参数面板 */
    renderParams(e);

    /* 初始化动画 */
    initAnimation(e);
  }

  function renderParams(e) {
    var paramsEl = document.getElementById('labParams');
    if (!e.params || !e.params.length) {
      paramsEl.innerHTML = '';
      return;
    }
    anim.params = {};
    e.params.forEach(function (p) {
      anim.params[p.key] = p.default;
    });
    paramsEl.innerHTML = e.params.map(function (p) {
      return '<div class="lab-param">' +
        '<span class="lab-param-label">' + esc(p.label) + '</span>' +
        '<input type="range" data-param="' + esc(p.key) + '" min="' + p.min + '" max="' + p.max + '" step="' + (p.step || 1) + '" value="' + p.default + '">' +
        '<span class="lab-param-val" data-param-val="' + esc(p.key) + '">' + p.default + '</span>' +
      '</div>';
    }).join('');
    paramsEl.querySelectorAll('input[data-param]').forEach(function (input) {
      input.addEventListener('input', function () {
        var k = input.dataset.param;
        var v = parseFloat(input.value);
        anim.params[k] = v;
        var valEl = paramsEl.querySelector('[data-param-val="' + k + '"]');
        if (valEl) valEl.textContent = v;
        /* 参数变化时重置动画 */
        resetAnim();
        initExperimentState();
        drawFrame(0);
      });
    });
  }

  /* ============================================================
     三、动画控制
     ============================================================ */
  function initAnimation(e) {
    canvas = document.getElementById('labCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resetAnim();
    initExperimentState();
    drawFrame(0);
    updateTimeUI();
  }

  function initExperimentState() {
    var e = currentExperiment;
    if (!e) return;
    anim.state = {};
    if (typeof e.init === 'function') {
      try {
        e.init(anim.state, anim.params);
      } catch (err) {
        console.error('[实验] init 失败：', err);
      }
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
    if (!currentExperiment || anim.playing) return;
    anim.playing = true;
    anim.lastTs = performance.now();
    anim.raf = requestAnimationFrame(tick);
    updatePlayBtn();
  }

  function stopAnim() {
    anim.playing = false;
    if (anim.raf) {
      cancelAnimationFrame(anim.raf);
      anim.raf = null;
    }
    updatePlayBtn();
  }

  function tick(ts) {
    if (!anim.playing || !currentExperiment) return;
    var dt = (ts - anim.lastTs) / 1000;
    anim.lastTs = ts;
    if (dt > 0.1) dt = 0.1; /* 防止切标签页后 dt 过大 */
    anim.elapsed += dt;

    var duration = currentExperiment.duration || 8;
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
    var e = currentExperiment;
    if (!e || !ctx) return;
    var duration = e.duration || 8;
    var progress = duration > 0 ? Math.min(1, anim.elapsed / duration) : 0;

    /* 清空画布 */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* 背景 */
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (typeof e.step === 'function') {
      try {
        e.step(ctx, canvas, anim.state, anim.params, dt, anim.elapsed, progress);
      } catch (err) {
        console.error('[实验] step 失败：', err);
        ctx.fillStyle = '#b91c1c';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('动画绘制出错：' + (err.message || err), canvas.width / 2, canvas.height / 2);
      }
    }
  }

  /* 进度条拖动 → 跳到指定时间 */
  function seekTo(progress) {
    if (!currentExperiment) return;
    var duration = currentExperiment.duration || 8;
    var targetElapsed = progress * duration;

    /* 从头重放到目标时间（保证状态正确） */
    resetAnim();
    initExperimentState();

    var dt = 1 / 60;
    var t = 0;
    while (t < targetElapsed) {
      var stepDt = Math.min(dt, targetElapsed - t);
      t += stepDt;
      if (typeof currentExperiment.step === 'function') {
        try {
          currentExperiment.step(ctx, canvas, anim.state, anim.params, stepDt, t, t / duration);
        } catch (err) {}
      }
    }
    anim.elapsed = targetElapsed;
    drawFrame(0);
    updateProgressUI(progress);
    updateTimeUI();
  }

  /* ============================================================
     四、UI 更新
     ============================================================ */
  function updatePlayBtn() {
    var btn = document.getElementById('labPlayBtn');
    if (!btn) return;
    if (anim.playing) {
      btn.textContent = '⏸ 暂停';
    } else {
      btn.textContent = anim.elapsed > 0 ? '▶ 继续' : '▶ 播放';
    }
  }
  function updateProgressUI(p) {
    var bar = document.getElementById('labProgress');
    if (bar) bar.value = Math.round(p * 1000);
  }
  function updateTimeUI() {
    var el = document.getElementById('labTime');
    if (!el || !currentExperiment) return;
    var duration = currentExperiment.duration || 8;
    el.textContent = anim.elapsed.toFixed(1) + ' / ' + duration.toFixed(1) + ' s';
  }

  /* ============================================================
     五、事件绑定
     ============================================================ */
  function bindEvents() {
    var searchEl = document.getElementById('labSearch');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        searchKeyword = searchEl.value.trim();
        renderList();
      });
    }

    document.querySelectorAll('#page-lab [data-lab-subject]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#page-lab [data-lab-subject]').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentSubject = tab.dataset.labSubject;
        renderList();
      });
    });

    var backBtn = document.getElementById('labBack');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        stopAnim();
        document.getElementById('labDetailView').style.display = 'none';
        document.getElementById('labListView').style.display = '';
        currentExperiment = null;
      });
    }

    var playBtn = document.getElementById('labPlayBtn');
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (!currentExperiment) return;
        if (anim.playing) {
          stopAnim();
        } else {
          /* 已播完则从头开始 */
          var duration = currentExperiment.duration || 8;
          if (anim.elapsed >= duration) {
            resetAnim();
            initExperimentState();
            drawFrame(0);
          }
          startAnim();
        }
      });
    }

    var resetBtn = document.getElementById('labResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!currentExperiment) return;
        resetAnim();
        initExperimentState();
        drawFrame(0);
      });
    }

    var progressBar = document.getElementById('labProgress');
    if (progressBar) {
      progressBar.addEventListener('input', function () {
        if (!currentExperiment) return;
        stopAnim();
        var p = parseFloat(progressBar.value) / 1000;
        seekTo(p);
      });
    }
  }

  /* ============================================================
     六、初始化
     ============================================================ */
  function init() {
    if (window.__labInited) return;
    window.__labInited = true;

    /* 从数据文件加载 */
    if (window.LAB_EXPERIMENTS && Array.isArray(window.LAB_EXPERIMENTS)) {
      experiments = window.LAB_EXPERIMENTS;
    } else {
      console.warn('[数理化实验] 未找到 LAB_EXPERIMENTS 数据');
      experiments = [];
    }

    bindEvents();
    renderList();

    console.log('[数理化实验] 已加载，共 ' + experiments.length + ' 个实验');
  }

  window.__labInit = function () {
    if (!window.__labInited) init();
    else {
      /* 重新渲染（页面切换回来时） */
      renderList();
      if (currentExperiment) {
        drawFrame(0);
      }
    }
  };

  if (page.classList.contains('active')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  console.log('[数理化实验] 框架已加载');
})();