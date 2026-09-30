/* ============================================================
   岁窦工具箱 · 小说收藏
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var KEY = 'suidou-novelcollect-v1';
  var list = [];
  var searchQ = '';
  var filterStatus = '';
  var sortMode = 'recent';
  var editingId = null;

  var titleEl, authorEl, genreEl, statusEl, progressEl, ratingEl, totalEl, dateEl, reviewEl;
  var listEl, emptyEl, countEl;
  var statTotal, statDone, statReading, statAvg;
  var searchEl, filterStatusEl, sortEl;

  var editPanel;
  var nceTitle, nceAuthor, nceGenre, nceStatus, nceProgress, nceRating, nceTotal, nceDate, nceReview;

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[小说收藏]', msg);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function statusClass(s) {
    if (s === '想读') return 'want';
    if (s === '在读') return 'reading';
    if (s === '已读完') return 'done';
    if (s === '弃了') return 'drop';
    return 'reading';
  }

  function clampProgress(v) {
    var n = parseInt(v, 10);
    if (!isFinite(n) || n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }

  function stars(r) {
    r = parseInt(r, 10) || 0;
    if (r <= 0) return '<span class="nc-stars"><span class="off">未评分</span></span>';
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += (i <= r ? '★' : '<span class="off">★</span>');
    }
    return '<span class="nc-stars">' + s + '</span>';
  }

  /* ---------- 存储 ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      list = raw ? JSON.parse(raw) || [] : [];
      if (!Array.isArray(list)) list = [];
    } catch (e) { list = []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-novelcollect');
    if (!page) return;

    titleEl    = document.getElementById('ncTitle');
    authorEl   = document.getElementById('ncAuthor');
    genreEl    = document.getElementById('ncGenre');
    statusEl   = document.getElementById('ncStatus');
    progressEl = document.getElementById('ncProgress');
    ratingEl   = document.getElementById('ncRating');
    totalEl    = document.getElementById('ncTotal');
    dateEl     = document.getElementById('ncDate');
    reviewEl   = document.getElementById('ncReview');

    listEl  = document.getElementById('ncList');
    emptyEl = document.getElementById('ncEmpty');
    countEl = document.getElementById('ncCount');

    statTotal   = document.getElementById('ncStatTotal');
    statDone    = document.getElementById('ncStatDone');
    statReading = document.getElementById('ncStatReading');
    statAvg     = document.getElementById('ncStatAvg');

    searchEl       = document.getElementById('ncSearch');
    filterStatusEl = document.getElementById('ncFilterStatus');
    sortEl         = document.getElementById('ncSort');

    editPanel = document.getElementById('ncEditPanel');
    nceTitle    = document.getElementById('nceTitle');
    nceAuthor   = document.getElementById('nceAuthor');
    nceGenre    = document.getElementById('nceGenre');
    nceStatus   = document.getElementById('nceStatus');
    nceProgress = document.getElementById('nceProgress');
    nceRating   = document.getElementById('nceRating');
    nceTotal    = document.getElementById('nceTotal');
    nceDate     = document.getElementById('nceDate');
    nceReview   = document.getElementById('nceReview');

    if (!titleEl || !listEl) return;

    inited = true;
    if (!dateEl.value) dateEl.value = todayStr();

    load();
    bindEvents();
    render();
    console.log('[小说收藏] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    document.getElementById('ncAdd').addEventListener('click', addRecord);
    document.getElementById('ncReset').addEventListener('click', resetForm);
    document.getElementById('ncToday').addEventListener('click', function () {
      dateEl.value = todayStr();
    });

    searchEl.addEventListener('input', function () {
      searchQ = searchEl.value.trim().toLowerCase();
      render();
    });
    filterStatusEl.addEventListener('change', function () {
      filterStatus = filterStatusEl.value;
      render();
    });
    sortEl.addEventListener('change', function () {
      sortMode = sortEl.value;
      render();
    });

    document.getElementById('ncExportJson').addEventListener('click', exportJson);
    document.getElementById('ncExportCsv').addEventListener('click', exportCsv);
    document.getElementById('ncClearAll').addEventListener('click', function () {
      if (!list.length) return;
      if (!confirm('确定清空全部小说收藏吗？此操作不可恢复。')) return;
      list = [];
      save();
      hideEditPanel();
      render();
      toast('已清空');
    });

    document.getElementById('ncEditClose').addEventListener('click', hideEditPanel);
    document.getElementById('ncEditSave').addEventListener('click', saveEdit);
    document.getElementById('ncEditDelete').addEventListener('click', deleteEditing);

    [titleEl, authorEl, genreEl, progressEl, totalEl].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addRecord(); }
      });
    });
  }

  /* ---------- 添加 ---------- */
  function addRecord() {
    var title = titleEl.value.trim();
    if (!title) { toast('请填写书名'); titleEl.focus(); return; }

    var data = {
      id: Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: title,
      author: authorEl.value.trim(),
      genre: genreEl.value.trim(),
      status: statusEl.value,
      progress: clampProgress(progressEl.value),
      rating: parseInt(ratingEl.value, 10) || 0,
      total: totalEl.value.trim(),
      date: dateEl.value.trim() || todayStr(),
      review: reviewEl.value.trim(),
      createdAt: new Date().toISOString()
    };
    list.unshift(data);
    save();
    render();
    resetForm();
    toast('已添加：' + title);
  }

  function resetForm() {
    titleEl.value = '';
    authorEl.value = '';
    genreEl.value = '';
    statusEl.value = '在读';
    progressEl.value = '';
    ratingEl.value = '0';
    totalEl.value = '';
    reviewEl.value = '';
    dateEl.value = todayStr();
    titleEl.focus();
  }

  /* ---------- 渲染 ---------- */
  function render() {
    // 统计
    var total = list.length;
    var done = list.filter(function (x) { return x.status === '已读完'; }).length;
    var reading = list.filter(function (x) { return x.status === '在读'; }).length;
    var rated = list.filter(function (x) { return (x.rating || 0) > 0; });
    var avg = rated.length
      ? (rated.reduce(function (a, b) { return a + b.rating; }, 0) / rated.length).toFixed(1)
      : '—';
    if (statTotal)   statTotal.textContent   = total;
    if (statDone)    statDone.textContent    = done;
    if (statReading) statReading.textContent = reading;
    if (statAvg)     statAvg.textContent     = avg;

    // 过滤
    var filtered = list.filter(function (x) {
      if (filterStatus && x.status !== filterStatus) return false;
      if (searchQ) {
        var hay = (x.title + ' ' + x.author + ' ' + x.genre + ' ' +
                   (x.review || '') + ' ' + (x.total || '')).toLowerCase();
        if (hay.indexOf(searchQ) === -1) return false;
      }
      return true;
    });

    // 排序
    if (sortMode === 'rating') {
      filtered.sort(function (a, b) {
        var ra = a.rating || 0, rb = b.rating || 0;
        if (ra !== rb) return rb - ra;
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      });
    } else if (sortMode === 'title') {
      try {
        filtered.sort(function (a, b) {
          return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN', { sensitivity: 'base' });
        });
      } catch (e) {
        filtered.sort(function (a, b) { return String(a.title).localeCompare(String(b.title)); });
      }
    } else {
      filtered.sort(function (a, b) {
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      });
    }

    if (countEl) countEl.textContent = filtered.length;

    if (!filtered.length) {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.style.display = 'block';
        emptyEl.textContent = list.length === 0
          ? '还没有小说收藏，先在上方添加一本吧～'
          : '没有匹配的记录，换个关键词或筛选条件试试～';
      }
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    listEl.innerHTML = filtered.map(function (x) {
      var cls = statusClass(x.status);
      var p = clampProgress(x.progress);
      var tags = [];
      if (x.genre) tags.push('<span class="nc-badge genre">' + esc(x.genre) + '</span>');
      tags.push('<span class="nc-badge status-' + cls + '">' + esc(x.status) + '</span>');

      var meta = [];
      if (x.author) meta.push('作者：' + esc(x.author));
      if (x.total)  meta.push(esc(x.total));

      return '<div class="nc-card status-' + cls + '" data-id="' + esc(x.id) + '">' +
        '<div class="nc-card-head">' +
          '<div style="flex:1;min-width:0;">' +
            '<h3 class="nc-card-title">' + esc(x.title) + '</h3>' +
            '<div class="nc-card-tags">' + tags.join('') + '</div>' +
          '</div>' +
          '<div style="flex:0 0 auto;">' + stars(x.rating) + '</div>' +
        '</div>' +
        '<div class="nc-card-body">' +
          (meta.length ? '<p><b>' + meta.join('　·　') + '</b></p>' : '') +
          '<div class="nc-progress">' +
            '<div class="nc-progress-track"><div class="nc-progress-fill" style="width:' + p + '%"></div></div>' +
            '<span class="nc-progress-value">' + p + '%</span>' +
          '</div>' +
          (x.review ? '<p style="margin-top:8px;"><b>短评：</b>' + esc(x.review) + '</p>' : '') +
        '</div>' +
        '<div class="nc-card-foot">' +
          '<span class="nc-card-date">' + esc(x.date || '—') + '</span>' +
          '<span class="nc-card-actions">' +
            '<button class="mini-btn" data-ncedit="' + esc(x.id) + '">编辑</button>' +
            '<button class="mini-btn danger" data-ncdel="' + esc(x.id) + '">删除</button>' +
          '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    // 绑定删除
    listEl.querySelectorAll('[data-ncdel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.ncdel;
        var t = list.find(function (x) { return String(x.id) === String(id); });
        if (!t) return;
        if (!confirm('确定删除《' + t.title + '》吗？')) return;
        list = list.filter(function (x) { return String(x.id) !== String(id); });
        if (editingId === id) hideEditPanel();
        save();
        render();
        toast('已删除');
      });
    });

    // 绑定编辑
    listEl.querySelectorAll('[data-ncedit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showEditPanel(btn.dataset.ncedit);
      });
    });
  }

  /* ---------- 编辑面板 ---------- */
  function showEditPanel(id) {
    var t = list.find(function (x) { return String(x.id) === String(id); });
    if (!t || !editPanel) return;
    editingId = id;
    nceTitle.value    = t.title || '';
    nceAuthor.value   = t.author || '';
    nceGenre.value    = t.genre || '';
    nceStatus.value   = t.status || '在读';
    nceProgress.value = t.progress != null ? String(t.progress) : '';
    nceRating.value   = String(t.rating || 0);
    nceTotal.value    = t.total || '';
    nceDate.value     = t.date || todayStr();
    nceReview.value   = t.review || '';
    editPanel.style.display = '';
    editPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideEditPanel() {
    editingId = null;
    if (editPanel) editPanel.style.display = 'none';
  }

  function saveEdit() {
    var t = list.find(function (x) { return String(x.id) === String(editingId); });
    if (!t) return;
    var title = nceTitle.value.trim();
    if (!title) { toast('请填写书名'); nceTitle.focus(); return; }
    t.title    = title;
    t.author   = nceAuthor.value.trim();
    t.genre    = nceGenre.value.trim();
    t.status   = nceStatus.value;
    t.progress = clampProgress(nceProgress.value);
    t.rating   = parseInt(nceRating.value, 10) || 0;
    t.total    = nceTotal.value.trim();
    t.date     = nceDate.value.trim() || todayStr();
    t.review   = nceReview.value.trim();
    save();
    render();
    hideEditPanel();
    toast('已保存');
  }

  function deleteEditing() {
    var t = list.find(function (x) { return String(x.id) === String(editingId); });
    if (!t) return;
    if (!confirm('确定删除《' + t.title + '》吗？')) return;
    list = list.filter(function (x) { return String(x.id) !== String(editingId); });
    save();
    render();
    hideEditPanel();
    toast('已删除');
  }

  /* ---------- 导出 ---------- */
  function download(content, filename, mime) {
    try {
      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      toast('已导出：' + filename);
    } catch (e) {
      alert('导出失败：' + (e && e.message ? e.message : e));
    }
  }

  function stamp() {
    var d = new Date();
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' +
           pad(d.getHours()) + pad(d.getMinutes());
  }

  function exportJson() {
    if (!list.length) { toast('还没有记录'); return; }
    var data = { app: '岁窦工具箱', tool: '小说收藏', version: 'V4.0', exportTime: new Date().toISOString(), list: list };
    download(JSON.stringify(data, null, 2), '小说收藏_' + stamp() + '.json', 'application/json');
  }

  function exportCsv() {
    if (!list.length) { toast('还没有记录'); return; }
    var header = '书名,作者,类型,阅读状态,进度%,评分,页数/章节,开始日期,短评\n';
    var rows = list.map(function (x) {
      function clean(s) {
        return '"' + String(s == null ? '' : s).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
      }
      return [
        clean(x.title), clean(x.author), clean(x.genre), clean(x.status),
        clean(x.progress), clean(x.rating), clean(x.total), clean(x.date), clean(x.review)
      ].join(',');
    }).join('\n');
    download('\ufeff' + header + rows, '小说收藏_' + stamp() + '.csv', 'text/csv;charset=utf-8');
  }

  window.__novelcollectInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();