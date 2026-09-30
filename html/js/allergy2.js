/* ============================================================
   岁窦工具箱 · 食物过敏清单
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var KEY = 'suidou-allergy-v1';
  var list = [];        // [{ id, name, category, level, symptoms, action, note, date, createdAt }]
  var searchQ = '';
  var filterLevel = '';
  var filterCat = '';

  var nameEl, catEl, levelEl, dateEl, symEl, actEl, noteEl;
  var listEl, emptyEl, countEl;
  var statTotal, statSevere, statCats;
  var searchEl, filterLevelEl, filterCatEl;

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[过敏清单]', msg);
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

  function levelClass(level) {
    if (level === '轻度') return 'mild';
    if (level === '中度') return 'mid';
    if (level === '重度') return 'severe';
    if (level === '致命') return 'fatal';
    return 'mid';
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
    var page = document.getElementById('page-allergy');
    if (!page) return;

    nameEl  = document.getElementById('alName');
    catEl   = document.getElementById('alCategory');
    levelEl = document.getElementById('alLevel');
    dateEl  = document.getElementById('alDate');
    symEl   = document.getElementById('alSymptoms');
    actEl   = document.getElementById('alAction');
    noteEl  = document.getElementById('alNote');

    listEl   = document.getElementById('alList');
    emptyEl  = document.getElementById('alEmpty');
    countEl  = document.getElementById('alCount');

    statTotal  = document.getElementById('alStatTotal');
    statSevere = document.getElementById('alStatSevere');
    statCats   = document.getElementById('alStatCats');

    searchEl      = document.getElementById('alSearch');
    filterLevelEl = document.getElementById('alFilterLevel');
    filterCatEl   = document.getElementById('alFilterCat');

    if (!nameEl || !listEl) return;

    inited = true;

    if (!dateEl.value) dateEl.value = todayStr();

    load();
    bindEvents();
    render();
    console.log('[过敏清单] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    document.getElementById('alAdd').addEventListener('click', addRecord);
    document.getElementById('alReset').addEventListener('click', resetForm);
    document.getElementById('alToday').addEventListener('click', function () {
      dateEl.value = todayStr();
    });

    searchEl.addEventListener('input', function () {
      searchQ = searchEl.value.trim().toLowerCase();
      render();
    });
    filterLevelEl.addEventListener('change', function () {
      filterLevel = filterLevelEl.value;
      render();
    });
    filterCatEl.addEventListener('change', function () {
      filterCat = filterCatEl.value;
      render();
    });

    document.getElementById('alExportJson').addEventListener('click', exportJson);
    document.getElementById('alExportCsv').addEventListener('click', exportCsv);

    document.getElementById('alClearAll').addEventListener('click', function () {
      if (!list.length) return;
      if (!confirm('确定清空全部过敏记录吗？此操作不可恢复。')) return;
      list = [];
      save();
      render();
      toast('过敏记录已清空');
    });

    // 回车快速添加
    [nameEl, symEl, actEl, noteEl].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey && el.tagName !== 'TEXTAREA') {
          e.preventDefault();
          addRecord();
        }
      });
    });
  }

  /* ---------- 添加 / 重置 ---------- */
  function addRecord() {
    var name = nameEl.value.trim();
    if (!name) { toast('请填写过敏原名称'); nameEl.focus(); return; }

    var data = {
      id: Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: name,
      category: catEl.value,
      level: levelEl.value,
      date: dateEl.value.trim() || todayStr(),
      symptoms: symEl.value.trim(),
      action: actEl.value.trim(),
      note: noteEl.value.trim(),
      createdAt: new Date().toISOString()
    };
    list.unshift(data);
    save();
    render();
    resetForm();
    toast('已记录：' + name);
  }

  function resetForm() {
    nameEl.value = '';
    symEl.value = '';
    actEl.value = '';
    noteEl.value = '';
    levelEl.value = '中度';
    dateEl.value = todayStr();
    nameEl.focus();
  }

  /* ---------- 渲染 ---------- */
  function render() {
    // 统计
    var total = list.length;
    var severe = list.filter(function (x) {
      return x.level === '重度' || x.level === '致命';
    }).length;
    var catSet = {};
    list.forEach(function (x) { catSet[x.category] = 1; });
    if (statTotal)  statTotal.textContent  = total;
    if (statSevere) statSevere.textContent = severe;
    if (statCats)   statCats.textContent   = Object.keys(catSet).length;

    // 过滤
    var filtered = list.filter(function (x) {
      if (filterLevel && x.level !== filterLevel) return false;
      if (filterCat && x.category !== filterCat) return false;
      if (searchQ) {
        var hay = (x.name + ' ' + x.category + ' ' + x.level + ' ' +
                   (x.symptoms || '') + ' ' + (x.action || '') + ' ' + (x.note || '')).toLowerCase();
        if (hay.indexOf(searchQ) === -1) return false;
      }
      return true;
    });

    if (countEl) countEl.textContent = filtered.length;

    if (!filtered.length) {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.style.display = 'block';
        emptyEl.textContent = list.length === 0
          ? '还没有过敏记录，先在上方添加一条吧～'
          : '没有匹配的记录，换个关键词或筛选条件试试～';
      }
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    // 严重程度排序：致命 > 重度 > 中度 > 轻度
    var order = { '致命': 0, '重度': 1, '中度': 2, '轻度': 3 };
    filtered.sort(function (a, b) {
      var oa = order[a.level] != null ? order[a.level] : 9;
      var ob = order[b.level] != null ? order[b.level] : 9;
      if (oa !== ob) return oa - ob;
      return String(b.date || '').localeCompare(String(a.date || ''));
    });

    listEl.innerHTML = filtered.map(function (x) {
      var cls = levelClass(x.level);
      return '<div class="al-card level-' + cls + '" data-id="' + esc(x.id) + '">' +
        '<div class="al-card-head">' +
          '<div style="flex:1;min-width:0;">' +
            '<h3 class="al-card-title">' + esc(x.name) + '</h3>' +
            '<div class="al-card-tags">' +
              '<span class="al-badge cat">' + esc(x.category) + '</span>' +
              '<span class="al-badge level-' + cls + '">' + esc(x.level) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="al-card-body">' +
          (x.symptoms ? '<p><b>症状：</b>' + esc(x.symptoms) + '</p>' : '') +
          (x.action   ? '<p><b>应对：</b>' + esc(x.action)   + '</p>' : '') +
          (x.note     ? '<p><b>备注：</b>' + esc(x.note)     + '</p>' : '') +
        '</div>' +
        '<div class="al-card-foot">' +
          '<span class="al-card-date">' + esc(x.date || '—') + '</span>' +
          '<span class="al-card-actions">' +
            '<button class="mini-btn" data-aledit="' + esc(x.id) + '">编辑</button>' +
            '<button class="mini-btn danger" data-aldel="' + esc(x.id) + '">删除</button>' +
          '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    // 绑定删除
    listEl.querySelectorAll('[data-aldel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.aldel;
        var t = list.find(function (x) { return String(x.id) === String(id); });
        if (!t) return;
        if (!confirm('确定删除「' + t.name + '」吗？')) return;
        list = list.filter(function (x) { return String(x.id) !== String(id); });
        save();
        render();
        toast('已删除');
      });
    });

    // 绑定编辑
    listEl.querySelectorAll('[data-aledit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.aledit;
        var t = list.find(function (x) { return String(x.id) === String(id); });
        if (!t) return;
        nameEl.value  = t.name;
        catEl.value   = t.category;
        levelEl.value = t.level;
        dateEl.value  = t.date || todayStr();
        symEl.value   = t.symptoms || '';
        actEl.value   = t.action || '';
        noteEl.value  = t.note || '';
        // 从列表中移除旧记录，改为"编辑后重新添加"
        list = list.filter(function (x) { return String(x.id) !== String(id); });
        save();
        render();
        nameEl.focus();
        toast('已载入表单，修改后点击「添加记录」保存');
      });
    });
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
    var data = { app: '岁窦工具箱', tool: '食物过敏清单', version: 'V4.0', exportTime: new Date().toISOString(), list: list };
    download(JSON.stringify(data, null, 2), '食物过敏清单_' + stamp() + '.json', 'application/json');
  }

  function exportCsv() {
    if (!list.length) { toast('还没有记录'); return; }
    var header = '过敏原,类别,严重程度,发生日期,症状,应对方法,备注\n';
    var rows = list.map(function (x) {
      function clean(s) {
        return '"' + String(s == null ? '' : s).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
      }
      return [
        clean(x.name), clean(x.category), clean(x.level), clean(x.date),
        clean(x.symptoms), clean(x.action), clean(x.note)
      ].join(',');
    }).join('\n');
    download('\ufeff' + header + rows, '食物过敏清单_' + stamp() + '.csv', 'text/csv;charset=utf-8');
  }

  window.__allergyInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();