/* ============================================================
   岁窦工具箱 · 饮水量计算
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var HISTORY_KEY = 'suidou-hydration-history-v1';
  var HISTORY_MAX = 30;

  /* 活动量系数 */
  var ACTIVITY = {
    sit:   { name: '久坐少动', factor: 1.00, desc: '办公室、居家为主' },
    light: { name: '轻度活动', factor: 1.10, desc: '日常走动、轻度家务' },
    mid:   { name: '中等活动', factor: 1.20, desc: '经常运动、体力工作' },
    high:  { name: '高强度',   factor: 1.35, desc: '剧烈训练、高温作业' }
  };

  /* 气温系数 */
  var CLIMATE = {
    cold:  { name: '凉爽',   factor: 0.90, desc: '气温 < 15℃' },
    norm:  { name: '常温',   factor: 1.00, desc: '15℃ ~ 25℃' },
    warm:  { name: '偏热',   factor: 1.10, desc: '25℃ ~ 30℃' },
    hot:   { name: '炎热',   factor: 1.25, desc: '> 30℃，或大量出汗' }
  };

  var currentGender = 'male';
  var currentActivity = 'sit';
  var currentClimate = 'norm';
  var isSpecial = false;   // 孕期 / 哺乳期
  var history = [];

  var heightEl, weightEl, ageEl, resultBox, historyEl;

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[饮水量]', msg);
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
    var page = document.getElementById('page-hydration');
    if (!page) return;

    heightEl = document.getElementById('hydHeight');
    weightEl = document.getElementById('hydWeight');
    ageEl    = document.getElementById('hydAge');
    resultBox = document.getElementById('hydResult');
    historyEl = document.getElementById('hydHistory');
    if (!weightEl || !resultBox) return;

    inited = true;
    loadHistory();
    bindEvents();
    renderHistory();
    console.log('[饮水量] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    /* 性别 / 活动量 / 气温 按钮组 */
    bindChipGroup('hydGender',   function (v) { currentGender = v; });
    bindChipGroup('hydActivity', function (v) { currentActivity = v; });
    bindChipGroup('hydClimate',  function (v) { currentClimate = v; });

    /* 特殊时期 */
    var specialChk = document.getElementById('hydSpecial');
    if (specialChk) {
      specialChk.addEventListener('change', function () {
        isSpecial = specialChk.checked;
      });
    }

    /* 计算按钮 */
    var calcBtn = document.getElementById('hydCalc');
    if (calcBtn) calcBtn.addEventListener('click', calculate);

    /* 回车 */
    [heightEl, weightEl, ageEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); calculate(); }
      });
    });

    /* 重置 */
    var resetBtn = document.getElementById('hydReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (heightEl) heightEl.value = '';
        if (weightEl) weightEl.value = '';
        if (ageEl)    ageEl.value = '';
        if (specialChk) specialChk.checked = false;
        isSpecial = false;
        currentGender = 'male';
        currentActivity = 'sit';
        currentClimate = 'norm';
        setChipActive('hydGender', 'male');
        setChipActive('hydActivity', 'sit');
        setChipActive('hydClimate', 'norm');
        renderEmptyResult();
      });
    }

    /* 清空历史 */
    var clearBtn = document.getElementById('hydClearHistory');
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

  function bindChipGroup(groupId, cb) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.hyd-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        group.querySelectorAll('.hyd-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        cb(chip.dataset.value);
      });
    });
  }

  function setChipActive(groupId, value) {
    var group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.hyd-chip').forEach(function (c) {
      c.classList.toggle('active', c.dataset.value === value);
    });
  }

  /* ---------- 计算 ---------- */
  function calculate() {
    var weight = parseFloat(weightEl.value);
    var height = parseFloat(heightEl.value);
    var age    = parseFloat(ageEl.value);

    if (!isFinite(weight) || weight <= 0) {
      toast('请填写有效的体重');
      weightEl.focus();
      return;
    }
    if (weight > 300) { toast('体重请填写 300kg 以内'); return; }

    /* 基础量：每公斤 35ml */
    var base = weight * 35;

    /* 性别系数 */
    var genderFactor = currentGender === 'female' ? 0.95 : 1.05;

    /* 年龄修正：> 60 岁略减，< 18 岁按体重系数偏高 */
    var ageFactor = 1.0;
    if (isFinite(age)) {
      if (age < 14) ageFactor = 1.05;
      else if (age >= 60) ageFactor = 0.95;
    }

    /* 活动量系数 */
    var actFactor = ACTIVITY[currentActivity].factor;

    /* 气温系数 */
    var cliFactor = CLIMATE[currentClimate].factor;

    /* 特殊时期 */
    var specialFactor = isSpecial ? 1.20 : 1.0;

    var total = base * genderFactor * ageFactor * actFactor * cliFactor * specialFactor;
    total = Math.round(total / 50) * 50;   // 取整到 50ml

    /* 上限与下限保护 */
    var minMl = 1000, maxMl = 5000;
    if (total < minMl) total = minMl;
    if (total > maxMl) total = maxMl;

    renderResult(total, {
      base: base,
      genderFactor: genderFactor,
      ageFactor: ageFactor,
      actFactor: actFactor,
      cliFactor: cliFactor,
      specialFactor: specialFactor
    });

    addHistory(total);
  }

  function renderEmptyResult() {
    if (!resultBox) return;
    resultBox.innerHTML =
      '<div class="hyd-empty">' +
        '<div class="hyd-empty-icon">💧</div>' +
        '<p>填写体重并选择活动量、气温后<br>点击下方按钮计算每日建议饮水量</p>' +
      '</div>';
  }

  function renderResult(ml, detail) {
    var liters = (ml / 1000).toFixed(2);
    var cups250 = Math.round(ml / 250);
    var cups500 = (ml / 500).toFixed(1);

    /* 时段建议：醒来 / 上午 / 下午 / 晚上，按 20% - 30% - 30% - 20% 分配 */
    var schedule = [
      { label: '早晨（醒来后）', pct: 0.15, hint: '温水 150-300ml' },
      { label: '上午',           pct: 0.30, hint: '工作 / 学习间歇补水' },
      { label: '下午',           pct: 0.30, hint: '下午茶时间补水' },
      { label: '傍晚 / 晚上',    pct: 0.25, hint: '睡前 1 小时少喝' }
    ];

    var items = Object.keys(ACTIVITY).map(function (k) {
      return (k === currentActivity ? '✓ ' : '') + ACTIVITY[k].name;
    }).join('　·　');

    var itemsClim = Object.keys(CLIMATE).map(function (k) {
      return (k === currentClimate ? '✓ ' : '') + CLIMATE[k].name;
    }).join('　·　');

    resultBox.innerHTML =
      '<div class="hyd-result-head">' +
        '<span class="hyd-result-label">每日建议饮水量</span>' +
        '<span class="hyd-result-tip">仅供参考</span>' +
      '</div>' +
      '<div class="hyd-result-main">' +
        '<span class="hyd-result-value">' + ml + '</span>' +
        '<span class="hyd-result-unit">ml</span>' +
        '<span class="hyd-result-liters">≈ ' + liters + ' L</span>' +
      '</div>' +
      '<div class="hyd-result-chips">' +
        '<span class="hyd-chip-result">' + cups250 + ' 杯 × 250ml</span>' +
        '<span class="hyd-chip-result">' + cups500 + ' 瓶 × 500ml</span>' +
      '</div>' +
      '<div class="hyd-schedule">' +
        '<h4>参考分配</h4>' +
        schedule.map(function (s) {
          var amount = Math.round(ml * s.pct / 50) * 50;
          return '<div class="hyd-schedule-row">' +
            '<span class="hyd-schedule-time">' + s.label + '</span>' +
            '<span class="hyd-schedule-amount">' + amount + ' ml</span>' +
            '<span class="hyd-schedule-hint">' + s.hint + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="hyd-formula">' +
        '<div class="hyd-formula-title">计算依据</div>' +
        '<div class="hyd-formula-row"><span>基础量</span><b>体重 × 35 ml</b></div>' +
        '<div class="hyd-formula-row"><span>性别</span><b>' + (currentGender === 'male' ? '男' : '女') + ' ×' + detail.genderFactor.toFixed(2) + '</b></div>' +
        '<div class="hyd-formula-row"><span>年龄修正</span><b>×' + detail.ageFactor.toFixed(2) + '</b></div>' +
        '<div class="hyd-formula-row"><span>活动量</span><b>' + ACTIVITY[currentActivity].name + ' ×' + detail.actFactor.toFixed(2) + '</b></div>' +
        '<div class="hyd-formula-row"><span>气温</span><b>' + CLIMATE[currentClimate].name + ' ×' + detail.cliFactor.toFixed(2) + '</b></div>' +
        (isSpecial ? '<div class="hyd-formula-row"><span>特殊时期</span><b>孕期 / 哺乳期 ×1.20</b></div>' : '') +
      '</div>' +
      '<p class="hyd-note">中国居民膳食指南建议成人每日饮水 1500-1700ml（不含食物水分）。以上结果仅供参考，实际需求因个体差异而不同；心衰、肾病等人群请遵医嘱。</p>';
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

  function addHistory(ml) {
    var d = new Date();
    var timeStr = pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
                  pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    history.unshift({
      time: timeStr,
      ml: ml,
      weight: parseFloat(weightEl.value) || 0,
      activity: ACTIVITY[currentActivity].name,
      climate: CLIMATE[currentClimate].name
    });
    if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX);
    saveHistory();
    renderHistory();
    toast('已计算：' + ml + ' ml / 天');
  }

  function renderHistory() {
    if (!historyEl) return;
    var cnt = document.getElementById('hydHistoryCount');
    if (cnt) cnt.textContent = history.length;

    if (!history.length) {
      historyEl.innerHTML = '<p class="empty" style="grid-column:1/-1;">还没有记录，算一次试试～</p>';
      return;
    }
    historyEl.innerHTML = history.map(function (h) {
      return '<div class="hyd-history-item">' +
        '<div class="hyd-history-top">' +
          '<span class="hyd-history-value">' + h.ml + '<small> ml</small></span>' +
          '<span class="hyd-history-weight">' + h.weight + ' kg</span>' +
        '</div>' +
        '<div class="hyd-history-meta">' + esc(h.activity) + ' · ' + esc(h.climate) + '</div>' +
        '<div class="hyd-history-time">' + esc(h.time) + '</div>' +
      '</div>';
    }).join('');
  }

  window.__hydrationInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();