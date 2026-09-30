/* ============================================================
   岁窦工具箱 · Cron 表达式生成
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var currentTab = 'minute';   // minute | hour | day | month | week | second
  var format = 5;              // 5 | 6

  // 每段当前选择状态
  // { mode: 'any' | 'list' | 'range' | 'step', list: [], from, to, step }
  var seg = {
    second: { mode:'any', list:[], from:0,  to:59, step:1, min:0,  max:59 },
    minute: { mode:'any', list:[], from:0,  to:59, step:1, min:0,  max:59 },
    hour:   { mode:'any', list:[], from:0,  to:23, step:1, min:0,  max:23 },
    day:    { mode:'any', list:[], from:1,  to:31, step:1, min:1,  max:31 },
    month:  { mode:'any', list:[], from:1,  to:12, step:1, min:1,  max:12 },
    week:   { mode:'any', list:[], from:0,  to:6,  step:1, min:0,  max:6  }
  };

  var TABS = [
    { key:'minute', label:'分钟' },
    { key:'hour',   label:'小时' },
    { key:'day',    label:'日' },
    { key:'month',  label:'月' },
    { key:'week',   label:'星期' },
    { key:'second', label:'秒（6 段）', only6: true }
  ];

  var WEEK_NAMES = ['周日','周一','周二','周三','周四','周五','周六'];
  var MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  var PRESETS = [
    { name:'每分钟',          expr5:'* * * * *',           expr6:'* * * * * *' },
    { name:'每 5 分钟',       expr5:'*/5 * * * *',         expr6:'* */5 * * * *' },
    { name:'每 15 分钟',      expr5:'*/15 * * * *',        expr6:'* */15 * * * *' },
    { name:'每小时整点',      expr5:'0 * * * *',           expr6:'0 0 * * * *' },
    { name:'每天零点',        expr5:'0 0 * * *',           expr6:'0 0 0 * * *' },
    { name:'每天中午 12 点',  expr5:'0 12 * * *',          expr6:'0 0 12 * * *' },
    { name:'每周一早上 9 点', expr5:'0 9 * * 1',           expr6:'0 0 9 * * 1' },
    { name:'每月 1 号 0 点',  expr5:'0 0 1 * *',           expr6:'0 0 0 1 * *' },
    { name:'每季度第一天',    expr5:'0 0 1 1,4,7,10 *',    expr6:'0 0 0 1 1,4,7,10 *' },
    { name:'每年 1 月 1 日',  expr5:'0 0 1 1 *',           expr6:'0 0 0 1 1 *' },
    { name:'工作日 9 点',     expr5:'0 9 * * 1-5',         expr6:'0 0 9 * * 1-5' },
    { name:'每周日 23 点',    expr5:'0 23 * * 0',          expr6:'0 0 23 * * 0' }
  ];

  var exprEl, copyBtn, descEl, nextEl, formatRadios;
  var presetsEl, tabsEl, fieldsEl;
  var parseEl;
  var applyBtn, resetBtn;

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[Cron]', msg);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function zeroPad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-cron');
    if (!page) return;

    exprEl     = document.getElementById('crExpr');
    copyBtn    = document.getElementById('crCopy');
    descEl     = document.getElementById('crDesc');
    nextEl     = document.getElementById('crNext');
    presetsEl  = document.getElementById('crPresets');
    tabsEl     = document.getElementById('crTabs');
    fieldsEl   = document.getElementById('crFields');
    parseEl    = document.getElementById('crParse');
    applyBtn   = document.getElementById('crApply');
    resetBtn   = document.getElementById('crReset');

    if (!exprEl || !tabsEl) return;

    inited = true;

    bindEvents();
    renderPresets();
    renderTabs();
    renderFields();
    apply();

    console.log('[Cron] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    // 格式切换
    document.querySelectorAll('input[name="crFormat"]').forEach(function (r) {
      r.addEventListener('change', function () {
        format = parseInt(r.value, 10) === 6 ? 6 : 5;
        // 6 段时显示秒 tab；5 段时切到秒 tab 要自动切回分 tab
        if (format === 5 && currentTab === 'second') {
          currentTab = 'minute';
        }
        renderTabs();
        renderFields();
        apply();
      });
    });

    // 表达式手动输入
    exprEl.addEventListener('input', function () {
      var v = exprEl.value.trim();
      if (v) {
        parseAndExplain(v);
      }
    });

    // 复制
    copyBtn.addEventListener('click', function () {
      var v = exprEl.value.trim();
      if (!v) return;
      copyText(v);
    });

    // 应用 / 重置
    applyBtn.addEventListener('click', function () {
      apply();
      toast('已生成表达式');
    });
    resetBtn.addEventListener('click', function () {
      resetSegs();
      renderFields();
      apply();
      toast('已重置');
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast('已复制：' + text);
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('已复制：' + text); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 预设 ---------- */
  function renderPresets() {
    presetsEl.innerHTML = PRESETS.map(function (p, i) {
      var expr = format === 6 ? p.expr6 : p.expr5;
      return '<button type="button" class="cr-preset" data-cr-preset="' + i + '">' +
        '<span class="cr-preset-name">' + esc(p.name) + '</span>' +
        '<span class="cr-preset-expr">' + esc(expr) + '</span>' +
      '</button>';
    }).join('');

    presetsEl.querySelectorAll('[data-cr-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.dataset.crPreset, 10);
        var p = PRESETS[i];
        if (!p) return;
        var expr = format === 6 ? p.expr6 : p.expr5;
        exprEl.value = expr;
        parseAndExplain(expr);
        // 根据表达式同步可视化（简化处理：仅根据固定模式简单同步）
        syncFromExpr(expr);
        renderFields();
      });
    });
  }

  /* ---------- Tab ---------- */
  function renderTabs() {
    var tabs = TABS.filter(function (t) {
      return !t.only6 || format === 6;
    });
    tabsEl.innerHTML = tabs.map(function (t) {
      return '<button type="button" class="cr-tab' +
        (currentTab === t.key ? ' active' : '') +
        '" data-cr-tab="' + t.key + '">' + esc(t.label) + '</button>';
    }).join('');

    tabsEl.querySelectorAll('[data-cr-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentTab = btn.dataset.crTab;
        renderTabs();
        renderFields();
      });
    });
  }

  /* ---------- 字段渲染 ---------- */
  function renderFields() {
    var tabs = TABS.filter(function (t) {
      return !t.only6 || format === 6;
    });
    fieldsEl.innerHTML = tabs.map(function (t) {
      return renderField(t.key);
    }).join('');

    // 绑定字段交互
    tabs.forEach(function (t) {
      bindField(t.key);
    });
  }

  function renderField(key) {
    var s = seg[key];
    var isActive = currentTab === key ? ' active' : '';
    var label = labelOf(key);
    var values = enumValues(key);

    // 模式选择
    var modeChips = [
      { v:'any',   n:'任意（*）' },
      { v:'list',  n:'指定多个（,）' },
      { v:'range', n:'范围（-）' },
      { v:'step',  n:'步长（/）' }
    ].map(function (m) {
      return '<button type="button" class="cr-mode-chip' +
        (s.mode === m.v ? ' active' : '') +
        '" data-cr-mode="' + key + '" data-cr-mode-val="' + m.v + '">' + m.n + '</button>';
    }).join('');

    // 数值网格（仅 list 模式需要）
    var numGrid = '';
    if (s.mode === 'list') {
      numGrid = '<div class="cr-num-grid">' + values.map(function (v) {
        var active = s.list.indexOf(v) !== -1 ? ' active' : '';
        var text = displayValue(key, v);
        return '<button type="button" class="cr-num' + active +
          '" data-cr-num="' + key + '" data-cr-val="' + v + '">' + esc(text) + '</button>';
      }).join('') + '</div>';
    }

    // 范围输入
    var rangeRow = '';
    if (s.mode === 'range') {
      rangeRow = '<div class="cr-step-row">' +
        '从 <input type="text" data-cr-from="' + key + '" value="' + s.from + '"> ' +
        '到 <input type="text" data-cr-to="' + key + '" value="' + s.to + '">' +
      '</div>';
    }

    // 步长输入
    var stepRow = '';
    if (s.mode === 'step') {
      stepRow = '<div class="cr-step-row">' +
        '从 <input type="text" data-cr-stepfrom="' + key + '" value="' + s.from + '"> ' +
        '每 <input type="text" data-cr-step="' + key + '" value="' + s.step + '"> ' +
        unitOf(key) + '执行一次' +
      '</div>';
    }

    var hint = '<div class="cr-step-row" style="color:#a89260;font-size:12px;">' +
      '当前段：' + esc(label) + '（' + s.min + ' - ' + s.max + '）' +
    '</div>';

    return '<div class="cr-field' + isActive + '" data-cr-field="' + key + '">' +
      '<div class="cr-field-label">' + esc(label) + '</div>' +
      '<div class="cr-mode-group">' + modeChips + '</div>' +
      numGrid + rangeRow + stepRow + hint +
    '</div>';
  }

  function bindField(key) {
    // 模式切换
    fieldsEl.querySelectorAll('[data-cr-mode="' + key + '"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = btn.dataset.crModeVal;
        seg[key].mode = v;
        if (v === 'list' && !seg[key].list.length) {
          seg[key].list = [seg[key].min];
        }
        renderFields();
        apply();
      });
    });

    // 数值选择
    fieldsEl.querySelectorAll('[data-cr-num="' + key + '"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = parseInt(btn.dataset.crVal, 10);
        var arr = seg[key].list;
        var idx = arr.indexOf(v);
        if (idx === -1) arr.push(v);
        else arr.splice(idx, 1);
        arr.sort(function (a, b) { return a - b; });
        renderFields();
        apply();
      });
    });

    // 范围
    var fromEl = fieldsEl.querySelector('[data-cr-from="' + key + '"]');
    var toEl   = fieldsEl.querySelector('[data-cr-to="' + key + '"]');
    [fromEl, toEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        var v = parseInt(el.value, 10);
        if (!isFinite(v)) return;
        v = clamp(v, seg[key].min, seg[key].max);
        if (el === fromEl) seg[key].from = v;
        else seg[key].to = v;
        apply();
      });
    });

    // 步长
    var stepFrom = fieldsEl.querySelector('[data-cr-stepfrom="' + key + '"]');
    var stepEl   = fieldsEl.querySelector('[data-cr-step="' + key + '"]');
    [stepFrom, stepEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        var v = parseInt(el.value, 10);
        if (!isFinite(v) || v <= 0) return;
        if (el === stepFrom) seg[key].from = clamp(v, seg[key].min, seg[key].max);
        else seg[key].step = v;
        apply();
      });
    });
  }

  function labelOf(key) {
    return {
      second:'秒', minute:'分钟', hour:'小时', day:'日', month:'月', week:'星期'
    }[key] || key;
  }
  function unitOf(key) {
    return {
      second:'秒', minute:'分钟', hour:'小时', day:'天', month:'月', week:'周'
    }[key] || '';
  }
  function enumValues(key) {
    var s = seg[key];
    var out = [];
    for (var i = s.min; i <= s.max; i++) out.push(i);
    return out;
  }
  function displayValue(key, v) {
    if (key === 'week') return WEEK_NAMES[v];
    if (key === 'month') return MONTH_NAMES[v - 1];
    return String(v);
  }
  function clamp(v, lo, hi) {
    v = Number(v);
    if (!isFinite(v)) return lo;
    return Math.max(lo, Math.min(hi, v));
  }

  /* ---------- 重置 ---------- */
  function resetSegs() {
    Object.keys(seg).forEach(function (k) {
      seg[k].mode = 'any';
      seg[k].list = [];
    });
    format = 5;
    document.querySelectorAll('input[name="crFormat"]').forEach(function (r) {
      r.checked = r.value === '5';
    });
    currentTab = 'minute';
    renderTabs();
    renderPresets();
  }

  /* ---------- 生成表达式 ---------- */
  function segToExpr(key) {
    var s = seg[key];
    if (s.mode === 'any') return '*';
    if (s.mode === 'list') {
      if (!s.list.length) return '*';
      return s.list.join(',');
    }
    if (s.mode === 'range') {
      return s.from + '-' + s.to;
    }
    if (s.mode === 'step') {
      return s.from + '/' + s.step;
    }
    return '*';
  }

  function buildExpr() {
    var parts = [];
    if (format === 6) parts.push(segToExpr('second'));
    parts.push(segToExpr('minute'));
    parts.push(segToExpr('hour'));
    parts.push(segToExpr('day'));
    parts.push(segToExpr('month'));
    parts.push(segToExpr('week'));
    return parts.join(' ');
  }

  /* ---------- 应用 ---------- */
  function apply() {
    var expr = buildExpr();
    exprEl.value = expr;
    parseAndExplain(expr);
  }

  /* ---------- 从表达式反推可视化（简化） ---------- */
  function syncFromExpr(expr) {
    var parts = expr.trim().split(/\s+/);
    if (parts.length === 5) {
      format = 5;
      setSegFromExpr('minute', parts[0]);
      setSegFromExpr('hour',   parts[1]);
      setSegFromExpr('day',    parts[2]);
      setSegFromExpr('month',  parts[3]);
      setSegFromExpr('week',   parts[4]);
      // 秒段重置
      seg.second.mode = 'any';
      seg.second.list = [];
    } else if (parts.length === 6) {
      format = 6;
      setSegFromExpr('second', parts[0]);
      setSegFromExpr('minute', parts[1]);
      setSegFromExpr('hour',   parts[2]);
      setSegFromExpr('day',    parts[3]);
      setSegFromExpr('month',  parts[4]);
      setSegFromExpr('week',   parts[5]);
    }

    document.querySelectorAll('input[name="crFormat"]').forEach(function (r) {
      r.checked = String(format) === r.value;
    });
    renderTabs();
  }

  function setSegFromExpr(key, str) {
    var s = seg[key];
    if (str === '*' || str === '?') {
      s.mode = 'any'; s.list = [];
      return;
    }
    // 步长
    if (str.indexOf('/') !== -1) {
      var a = str.split('/');
      var from = a[0] === '*' ? s.min : parseInt(a[0], 10);
      var step = parseInt(a[1], 10) || 1;
      s.mode = 'step';
      s.from = isFinite(from) ? clamp(from, s.min, s.max) : s.min;
      s.step = step;
      return;
    }
    // 范围
    if (str.indexOf('-') !== -1 && str.indexOf(',') === -1) {
      var b = str.split('-');
      s.mode = 'range';
      s.from = clamp(parseInt(b[0], 10), s.min, s.max);
      s.to   = clamp(parseInt(b[1], 10), s.min, s.max);
      return;
    }
    // 枚举
    if (str.indexOf(',') !== -1) {
      s.mode = 'list';
      s.list = str.split(',').map(function (x) {
        return clamp(parseInt(x, 10), s.min, s.max);
      }).filter(function (x) { return isFinite(x); });
      return;
    }
    // 单个数字
    var n = parseInt(str, 10);
    if (isFinite(n)) {
      s.mode = 'list';
      s.list = [clamp(n, s.min, s.max)];
    } else {
      s.mode = 'any';
      s.list = [];
    }
  }

  /* ---------- 解释并显示 ---------- */
  function parseAndExplain(expr) {
    var parts = String(expr).trim().split(/\s+/);
    var order5 = ['minute','hour','day','month','week'];
    var order6 = ['second','minute','hour','day','month','week'];
    var names5 = ['分钟','小时','日','月','星期'];
    var names6 = ['秒','分钟','小时','日','月','星期'];

    if (parts.length !== 5 && parts.length !== 6) {
      descEl.textContent = '格式错误：需要 5 段或 6 段，用空格分隔。';
      nextEl.textContent = '';
      parseEl.innerHTML = '<p class="empty">请检查表达式格式。</p>';
      return;
    }

    var order = parts.length === 6 ? order6 : order5;
    var names = parts.length === 6 ? names6 : names5;

    // 自然语言总述
    var desc = describe(parts, parts.length);
    descEl.textContent = desc;

    // 解析每一段
    var items = parts.map(function (p, i) {
      return {
        tag: names[i],
        text: describeSegment(p, order[i])
      };
    });

    parseEl.innerHTML = items.map(function (it) {
      return '<div class="cr-parse-item">' +
        '<span class="cr-parse-tag">' + esc(it.tag) + '</span>' +
        '<div class="cr-parse-body">' + it.text + '</div>' +
      '</div>';
    }).join('');

    // 下次执行时间（简单推算）
    nextEl.innerHTML = '下次执行：<b>' + guessNext(parts) + '</b>';
  }

  function describe(parts, len) {
    // 简单中文总述
    var pMinute = parts[len - 5];
    var pHour   = parts[len - 4];
    var pDay    = parts[len - 3];
    var pMonth  = parts[len - 2];
    var pWeek   = parts[len - 1];

    var pieces = [];

    if (pMinute === '*' && pHour === '*') pieces.push('每分钟');
    else if (pMinute === '0' && pHour === '*') pieces.push('每小时整点');
    else if (pMinute === '0' && pHour === '0') pieces.push('每天零点');
    else if (pMinute === '0' && /^\d+$/.test(pHour)) pieces.push('每天 ' + pHour + ':00');
    else if (pMinute.indexOf('*/') === 0) pieces.push('每 ' + pMinute.slice(2) + ' 分钟');
    else if (/^\d+$/.test(pMinute) && /^\d+$/.test(pHour)) pieces.push('每天 ' + pHour + ':' + zeroPad(pMinute));
    else pieces.push('在 ' + describeSegment(pMinute, 'minute') + ' 执行');

    if (pWeek !== '*' && pWeek !== '?') {
      pieces.push('（' + describeSegment(pWeek, 'week') + '）');
    }
    if (pDay !== '*' && pDay !== '?') {
      pieces.push('（' + describeSegment(pDay, 'day') + '）');
    }
    if (pMonth !== '*') {
      pieces.push('（' + describeSegment(pMonth, 'month') + '）');
    }

    return pieces.join('　');
  }

  function describeSegment(p, key) {
    if (p === '*' || p === '?') return '任意值';

    // 步长
    if (p.indexOf('/') !== -1) {
      var a = p.split('/');
      var from = a[0];
      var step = a[1];
      if (from === '*') return '每 ' + step + ' ' + unitOf(key) + '一次';
      return '从 ' + from + ' 开始，每 ' + step + ' ' + unitOf(key) + '一次';
    }
    // 范围
    if (p.indexOf('-') !== -1 && p.indexOf(',') === -1) {
      var b = p.split('-');
      return '从 ' + disp(key, b[0]) + ' 到 ' + disp(key, b[1]);
    }
    // 枚举
    if (p.indexOf(',') !== -1) {
      return p.split(',').map(function (v) { return disp(key, v); }).join('、');
    }
    // 单个
    return disp(key, p);
  }

  function disp(key, v) {
    if (key === 'week') {
      var n = parseInt(v, 10);
      if (n === 0 || n === 7) return '周日';
      if (n >= 1 && n <= 6) return WEEK_NAMES[n];
      return v;
    }
    if (key === 'month') {
      var m = parseInt(v, 10);
      if (m >= 1 && m <= 12) return m + ' 月';
      return v;
    }
    return v;
  }

  /* ---------- 简单推算下次执行 ---------- */
  function guessNext(parts) {
    var len = parts.length;
    var order = len === 6
      ? ['second','minute','hour','day','month','week']
      : ['minute','hour','day','month','week'];
    var idxMinute = order.indexOf('minute');
    var idxHour   = order.indexOf('hour');
    var idxDay    = order.indexOf('day');
    var idxMonth  = order.indexOf('month');

    var now = new Date();
    var result = new Date(now.getTime());

    // 简易逐分钟推进查找（最多找 1 年）
    var maxMinutes = 366 * 24 * 60;
    for (var i = 0; i < maxMinutes; i++) {
      result.setMinutes(result.getMinutes() + 1);
      result.setSeconds(0);
      if (matches(result, parts, order)) {
        return fmtDateTime(result);
      }
    }
    return '未来一年内未匹配到执行时间';
  }

  function matches(d, parts, order) {
    for (var i = 0; i < order.length; i++) {
      var key = order[i];
      var p = parts[i];
      var val;
      if (key === 'second') val = d.getSeconds();
      else if (key === 'minute') val = d.getMinutes();
      else if (key === 'hour') val = d.getHours();
      else if (key === 'day') val = d.getDate();
      else if (key === 'month') val = d.getMonth() + 1;
      else if (key === 'week') val = d.getDay();

      // 周日 = 0，也接受 7
      if (key === 'week') {
        if (!matchValue(p, val, 0, 6) && !(val === 0 && matchValue(p, 7, 0, 7))) {
          return false;
        }
      } else {
        if (!matchValue(p, val, null, null)) return false;
      }
    }
    return true;
  }

  function matchValue(expr, val, min, max) {
    if (expr === '*' || expr === '?') return true;

    // 枚举
    if (expr.indexOf(',') !== -1) {
      var list = expr.split(',');
      for (var i = 0; i < list.length; i++) {
        if (matchValue(list[i], val, min, max)) return true;
      }
      return false;
    }

    // 步长
    if (expr.indexOf('/') !== -1) {
      var a = expr.split('/');
      var from = a[0] === '*' ? 0 : parseInt(a[0], 10);
      var step = parseInt(a[1], 10);
      if (!isFinite(step) || step <= 0) return false;
      if (!isFinite(from)) return false;
      return (val - from) % step === 0 && val >= from;
    }

    // 范围
    if (expr.indexOf('-') !== -1) {
      var b = expr.split('-');
      var lo = parseInt(b[0], 10);
      var hi = parseInt(b[1], 10);
      if (!isFinite(lo) || !isFinite(hi)) return false;
      return val >= lo && val <= hi;
    }

    // 单值
    var n = parseInt(expr, 10);
    return isFinite(n) && n === val;
  }

  function fmtDateTime(d) {
    return d.getFullYear() + '-' + zeroPad(d.getMonth() + 1) + '-' + zeroPad(d.getDate()) +
      ' ' + zeroPad(d.getHours()) + ':' + zeroPad(d.getMinutes()) +
      ' 周' + ['日','一','二','三','四','五','六'][d.getDay()];
  }

  /* ---------- 导出的初始化函数 ---------- */
  window.__cronInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();