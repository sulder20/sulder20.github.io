/* ============================================================
   岁窦工具箱 · 油耗计算
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var KEY = 'suidou-fuel-v1';
  var list = [];         // [{ id, date, odo, volume, price, total, oil, full, note, createdAt }]
  var searchQ = '';
  var filterOil = '';
  var editingId = null;

  var dateEl, odoEl, volumeEl, priceEl, totalEl, oilEl, fullEl, noteEl;
  var listEl, emptyEl, countEl;
  var statAvg, statLast, statKm, statCost;
  var searchEl, filterOilEl;
  var editPanel;
  var fceDate, fceOdo, fceVolume, fcePrice, fceTotal, fceOil, fceFull, fceNote;

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[油耗]', msg);
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

  function fmtNum(n, digits) {
    if (!isFinite(n)) return '—';
    digits = digits == null ? 2 : digits;
    return n.toFixed(digits);
  }

  function fmtMoney(n) {
    if (!isFinite(n)) return '—';
    return '¥ ' + n.toFixed(2);
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
    var page = document.getElementById('page-fuel');
    if (!page) return;

    dateEl   = document.getElementById('fcDate');
    odoEl    = document.getElementById('fcOdo');
    volumeEl = document.getElementById('fcVolume');
    priceEl  = document.getElementById('fcPrice');
    totalEl  = document.getElementById('fcTotal');
    oilEl    = document.getElementById('fcOil');
    fullEl   = document.getElementById('fcFull');
    noteEl   = document.getElementById('fcNote');

    listEl  = document.getElementById('fcList');
    emptyEl = document.getElementById('fcEmpty');
    countEl = document.getElementById('fcCount');

    statAvg  = document.getElementById('fcStatAvg');
    statLast = document.getElementById('fcStatLast');
    statKm   = document.getElementById('fcStatKm');
    statCost = document.getElementById('fcStatCost');

    searchEl    = document.getElementById('fcSearch');
    filterOilEl = document.getElementById('fcFilterOil');

    editPanel = document.getElementById('fcEditPanel');
    fceDate   = document.getElementById('fceDate');
    fceOdo    = document.getElementById('fceOdo');
    fceVolume = document.getElementById('fceVolume');
    fcePrice  = document.getElementById('fcePrice');
    fceTotal  = document.getElementById('fceTotal');
    fceOil    = document.getElementById('fceOil');
    fceFull   = document.getElementById('fceFull');
    fceNote   = document.getElementById('fceNote');

    if (!dateEl || !listEl) return;

    inited = true;
    if (!dateEl.value) dateEl.value = todayStr();

    load();
    bindEvents();
    render();
    console.log('[油耗] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    document.getElementById('fcAdd').addEventListener('click', addRecord);
    document.getElementById('fcReset').addEventListener('click', resetForm);
    document.getElementById('fcToday').addEventListener('click', function () {
      dateEl.value = todayStr();
    });

    searchEl.addEventListener('input', function () {
      searchQ = searchEl.value.trim().toLowerCase();
      render();
    });
    filterOilEl.addEventListener('change', function () {
      filterOil = filterOilEl.value;
      render();
    });

    document.getElementById('fcExportJson').addEventListener('click', exportJson);
    document.getElementById('fcExportCsv').addEventListener('click', exportCsv);
    document.getElementById('fcClearAll').addEventListener('click', function () {
      if (!list.length) return;
      if (!confirm('确定清空全部加油记录吗？此操作不可恢复。')) return;
      list = [];
      save();
      hideEditPanel();
      render();
      toast('已清空');
    });

    document.getElementById('fcEditClose').addEventListener('click', hideEditPanel);
    document.getElementById('fcEditSave').addEventListener('click', saveEdit);
    document.getElementById('fcEditDelete').addEventListener('click', deleteEditing);

    [odoEl, volumeEl, priceEl, totalEl].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addRecord(); }
      });
    });
  }

  /* ---------- 添加 ---------- */
  function addRecord() {
    var date = dateEl.value.trim() || todayStr();
    var odo = parseFloat(odoEl.value);
    var volume = parseFloat(volumeEl.value);
    var price = parseFloat(priceEl.value);
    var total = parseFloat(totalEl.value);

    if (!isFinite(odo) || odo <= 0) { toast('请填写有效里程'); odoEl.focus(); return; }
    if (!isFinite(volume) || volume <= 0) { toast('请填写有效加油量'); volumeEl.focus(); return; }

    // 单价 / 总价自动补齐
    if (!isFinite(price) && isFinite(total) && volume > 0) price = total / volume;
    if (!isFinite(total) && isFinite(price) && volume > 0) total = price * volume;

    var data = {
      id: Date.now() + '-' + Math.floor(Math.random() * 1000),
      date: date,
      odo: odo,
      volume: volume,
      price: isFinite(price) ? price : null,
      total: isFinite(total) ? total : null,
      oil: oilEl.value,
      full: !!fullEl.checked,
      note: noteEl.value.trim(),
      createdAt: new Date().toISOString()
    };

    list.push(data);
    save();
    render();
    resetForm();
    toast('已添加：' + fmtNum(volume) + ' L @ ' + esc(data.oil));
  }

  function resetForm() {
    dateEl.value = todayStr();
    odoEl.value = '';
    volumeEl.value = '';
    priceEl.value = '';
    totalEl.value = '';
    oilEl.value = '92#';
    fullEl.checked = true;
    noteEl.value = '';
    odoEl.focus();
  }

  /* ---------- 排序：按里程升序 ---------- */
  function sortedByOdo() {
    return list.slice().sort(function (a, b) {
      var oa = Number(a.odo) || 0;
      var ob = Number(b.odo) || 0;
      if (oa !== ob) return oa - ob;
      return String(a.date || '').localeCompare(String(b.date || ''));
    });
  }

  /* ---------- 计算每一段的油耗 ---------- */
  /* 返回 map: id -> { segKm, segCost, lp100, costPerKm } */
  function computeSegments() {
    var sorted = sortedByOdo();
    var map = {};
    var lastFull = null;   // 上一次加满的记录

    sorted.forEach(function (rec, idx) {
      var info = {
        segKm: null,
        segCost: null,
        segLiters: null,
        lp100: null,
        costPerKm: null
      };

      if (idx === 0) {
        // 第一条记录没有前一条
      } else {
        var prev = sorted[idx - 1];
        var km = (Number(rec.odo) || 0) - (Number(prev.odo) || 0);
        if (km > 0) info.segKm = km;

        // 只有上一次加满且本次加满时，本次加油量才是真实消耗
        if (lastFull && rec.full) {
          info.segLiters = Number(rec.volume) || 0;
          if (info.segKm && info.segLiters > 0) {
            info.lp100 = info.segLiters / info.segKm * 100;
          }
          // 本段花费：本条记录的总价
          info.segCost = Number(rec.total) || (Number(rec.price) * Number(rec.volume));
          if (info.segKm && info.segCost > 0) {
            info.costPerKm = info.segCost / info.segKm;
          }
        }
      }

      if (rec.full) lastFull = rec;
      map[rec.id] = info;
    });

    return map;
  }

  /* ---------- 汇总统计 ---------- */
  function computeSummary() {
    var sorted = sortedByOdo();
    if (sorted.length < 1) {
      return { avgLp100: null, lastLp100: null, totalKm: null, totalCost: 0 };
    }

    // 累计里程：第一条到最后一条
    var totalKm = null;
    if (sorted.length >= 2) {
      var first = sorted[0];
      var last = sorted[sorted.length - 1];
      totalKm = (Number(last.odo) || 0) - (Number(first.odo) || 0);
    }

    // 累计油费：所有记录的总价之和
    var totalCost = 0;
    sorted.forEach(function (r) {
      var t = Number(r.total) || (Number(r.price) * Number(r.volume));
      if (isFinite(t)) totalCost += t;
    });

    // 综合油耗：两次加满之间的所有油量总和 ÷ 总里程 × 100
    // 需要找到第一条加满和最后一条加满
    var seg = computeSegments();
    var validLp = [];
    Object.keys(seg).forEach(function (id) {
      if (seg[id].lp100 != null && isFinite(seg[id].lp100)) {
        validLp.push({ id: id, lp: seg[id].lp100 });
      }
    });

    var avgLp100 = null;
    if (validLp.length) {
      var sum = validLp.reduce(function (a, b) { return a + b.lp; }, 0);
      avgLp100 = sum / validLp.length;
    }

    // 最近一次油耗：按里程最新的有效段
    var lastLp100 = null;
    for (var i = sorted.length - 1; i >= 0; i--) {
      var s = seg[sorted[i].id];
      if (s && s.lp100 != null) {
        lastLp100 = s.lp100;
        break;
      }
    }

    return { avgLp100: avgLp100, lastLp100: lastLp100, totalKm: totalKm, totalCost: totalCost };
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var summary = computeSummary();
    if (statAvg) {
      statAvg.textContent = summary.avgLp100 != null
        ? fmtNum(summary.avgLp100, 2) + ' L'
        : '—';
    }
    if (statLast) {
      statLast.textContent = summary.lastLp100 != null
        ? fmtNum(summary.lastLp100, 2) + ' L'
        : '—';
    }
    if (statKm) {
      statKm.textContent = summary.totalKm != null
        ? summary.totalKm.toLocaleString() + ' km'
        : '—';
    }
    if (statCost) {
      statCost.textContent = summary.totalCost > 0
        ? '¥ ' + summary.totalCost.toFixed(0)
        : '—';
    }

    // 过滤
    var filtered = list.filter(function (x) {
      if (filterOil && x.oil !== filterOil) return false;
      if (searchQ) {
        var hay = (x.date + ' ' + x.oil + ' ' + (x.note || '') + ' ' +
                   (x.odo || '') + ' ' + (x.volume || '')).toLowerCase();
        if (hay.indexOf(searchQ) === -1) return false;
      }
      return true;
    });

    if (countEl) countEl.textContent = filtered.length;

    // 按里程降序显示（最新在前）
    filtered.sort(function (a, b) {
      var oa = Number(a.odo) || 0;
      var ob = Number(b.odo) || 0;
      if (oa !== ob) return ob - oa;
      return String(b.date || '').localeCompare(String(a.date || ''));
    });

    if (!filtered.length) {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.style.display = 'block';
        emptyEl.textContent = list.length === 0
          ? '还没有加油记录，先在上方添加一条吧～'
          : '没有匹配的记录，换个关键词或筛选条件试试～';
      }
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    var seg = computeSegments();

    listEl.innerHTML = filtered.map(function (x) {
      var s = seg[x.id] || {};
      var total = Number(x.total) || (Number(x.price) * Number(x.volume));
      var price = Number(x.price) || (total && x.volume ? total / x.volume : null);

      var fullTag = x.full
        ? '<span class="fc-badge full">加满</span>'
        : '<span class="fc-badge half">未加满</span>';

      return '<div class="fc-card' + (x.full ? '' : ' not-full') + '" data-id="' + esc(x.id) + '">' +
        '<div class="fc-card-head">' +
          '<div style="flex:1;min-width:0;">' +
            '<h3 class="fc-card-title">' + esc(x.date) + '　' + fmtNum(x.volume) + ' L</h3>' +
            '<div class="fc-card-tags">' +
              '<span class="fc-badge oil">' + esc(x.oil || '—') + '</span>' +
              fullTag +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fc-card-body">' +
          '<div class="fc-cell"><b>仪表里程</b><span>' + (isFinite(x.odo) ? Number(x.odo).toLocaleString() + ' km' : '—') + '</span></div>' +
          '<div class="fc-cell"><b>加油量</b><span>' + fmtNum(x.volume) + ' L</span></div>' +
          '<div class="fc-cell"><b>单价</b><span>' + (price ? '¥ ' + price.toFixed(2) : '—') + '</span></div>' +
          '<div class="fc-cell"><b>总价</b><span>' + (total ? fmtMoney(total) : '—') + '</span></div>' +
          (x.note ? '<div class="fc-cell full-row"><b>备注</b><span>' + esc(x.note) + '</span></div>' : '') +
          (s.lp100 != null
            ? '<div class="fc-segment">' +
                '<div class="fc-segment-item"><span class="fc-segment-label">本段里程</span><b>' + (s.segKm != null ? s.segKm + ' km' : '—') + '</b></div>' +
                '<div class="fc-segment-item"><span class="fc-segment-label">百公里油耗</span><b>' + fmtNum(s.lp100, 2) + ' L</b></div>' +
                '<div class="fc-segment-item"><span class="fc-segment-label">每公里</span><b>' + (s.costPerKm != null ? '¥ ' + s.costPerKm.toFixed(3) : '—') + '</b></div>' +
              '</div>'
            : (s.segKm != null
                ? '<div class="fc-segment"><div class="fc-segment-item"><span class="fc-segment-label">本段里程</span><b>' + s.segKm + ' km</b></div><div class="fc-segment-item"><span class="fc-segment-label">未加满</span><b>本次不计油耗</b></div></div>'
                : '')
          ) +
        '</div>' +
        '<div class="fc-card-foot">' +
          '<span class="fc-card-date">' + esc(x.date) + '</span>' +
          '<span class="fc-card-actions">' +
            '<button class="mini-btn" data-fcedit="' + esc(x.id) + '">编辑</button>' +
            '<button class="mini-btn danger" data-fcdel="' + esc(x.id) + '">删除</button>' +
          '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    listEl.querySelectorAll('[data-fcdel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.fcdel;
        var t = list.find(function (x) { return String(x.id) === String(id); });
        if (!t) return;
        if (!confirm('确定删除 ' + t.date + ' 的记录吗？')) return;
        list = list.filter(function (x) { return String(x.id) !== String(id); });
        if (editingId === id) hideEditPanel();
        save();
        render();
        toast('已删除');
      });
    });

    listEl.querySelectorAll('[data-fcedit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showEditPanel(btn.dataset.fcedit);
      });
    });
  }

  /* ---------- 编辑 ---------- */
  function showEditPanel(id) {
    var t = list.find(function (x) { return String(x.id) === String(id); });
    if (!t || !editPanel) return;
    editingId = id;
    fceDate.value   = t.date || todayStr();
    fceOdo.value    = t.odo != null ? String(t.odo) : '';
    fceVolume.value = t.volume != null ? String(t.volume) : '';
    fcePrice.value  = t.price != null ? String(t.price) : '';
    fceTotal.value  = t.total != null ? String(t.total) : '';
    fceOil.value    = t.oil || '92#';
    fceFull.checked = !!t.full;
    fceNote.value   = t.note || '';
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

    var odo = parseFloat(fceOdo.value);
    var volume = parseFloat(fceVolume.value);
    var price = parseFloat(fcePrice.value);
    var total = parseFloat(fceTotal.value);

    if (!isFinite(odo) || odo <= 0) { toast('请填写有效里程'); fceOdo.focus(); return; }
    if (!isFinite(volume) || volume <= 0) { toast('请填写有效加油量'); fceVolume.focus(); return; }

    if (!isFinite(price) && isFinite(total) && volume > 0) price = total / volume;
    if (!isFinite(total) && isFinite(price) && volume > 0) total = price * volume;

    t.date   = fceDate.value.trim() || todayStr();
    t.odo    = odo;
    t.volume = volume;
    t.price  = isFinite(price) ? price : null;
    t.total  = isFinite(total) ? total : null;
    t.oil    = fceOil.value;
    t.full   = !!fceFull.checked;
    t.note   = fceNote.value.trim();

    save();
    render();
    hideEditPanel();
    toast('已保存');
  }

  function deleteEditing() {
    var t = list.find(function (x) { return String(x.id) === String(editingId); });
    if (!t) return;
    if (!confirm('确定删除 ' + t.date + ' 的记录吗？')) return;
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
    var data = { app: '岁窦工具箱', tool: '油耗计算', version: 'V4.0', exportTime: new Date().toISOString(), list: list };
    download(JSON.stringify(data, null, 2), '油耗记录_' + stamp() + '.json', 'application/json');
  }

  function exportCsv() {
    if (!list.length) { toast('还没有记录'); return; }
    var sorted = sortedByOdo();
    var seg = computeSegments();
    var header = '日期,仪表里程(km),加油量(L),单价(元/L),总价(元),油品,是否加满,本段里程(km),百公里油耗(L),每公里花费(元),备注\n';
    var rows = sorted.map(function (x) {
      var s = seg[x.id] || {};
      function clean(v) {
        return '"' + String(v == null ? '' : v).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
      }
      return [
        clean(x.date),
        clean(x.odo),
        clean(x.volume),
        clean(x.price != null ? x.price.toFixed(3) : ''),
        clean(x.total != null ? x.total.toFixed(2) : ''),
        clean(x.oil),
        clean(x.full ? '是' : '否'),
        clean(s.segKm != null ? s.segKm : ''),
        clean(s.lp100 != null ? s.lp100.toFixed(2) : ''),
        clean(s.costPerKm != null ? s.costPerKm.toFixed(4) : ''),
        clean(x.note)
      ].join(',');
    }).join('\n');
    download('\ufeff' + header + rows, '油耗记录_' + stamp() + '.csv', 'text/csv;charset=utf-8');
  }

  window.__fuelInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();