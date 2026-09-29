/* ============================================================
   岁窦工具箱 · 倒数日
   —— 内置常见节日，支持 2024 - 2036 年日期查询
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var YEAR_MIN = 2024;
  var YEAR_MAX = 2036;

  /* ---------- SVG 图标 ---------- */
  var ICONS = {
    newyear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 15l2 2 4-4"/></svg>',
    spring:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8"/><path d="M12 3v2"/><ellipse cx="12" cy="12" rx="6" ry="7"/><path d="M9 5v14M15 5v14"/><path d="M8 19h8"/><path d="M12 19v2"/></svg>',
    qingming:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V8"/><path d="M12 8c-3 0-5-2-5-5 3 0 5 2 5 5z"/><path d="M12 12c3 0 5-2 5-5-3 0-5 2-5 5z"/><path d="M12 16c-3 0-5-2-5-5"/></svg>',
    labor:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    dragon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L3 19h18z"/><path d="M12 3v16"/><path d="M6.5 11h11"/></svg>',
    mother:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="2"/><circle cx="8" cy="11" r="2"/><circle cx="16" cy="11" r="2"/><circle cx="12" cy="14" r="2"/><path d="M12 16v5"/><path d="M9 19h6"/></svg>',
    father:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6l-1.5 3L12 7l-1.5-1z"/><path d="M12 7l-3 4 3 10 3-10z"/></svg>',
    teacher: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h5"/></svg>',
    midautumn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 12.8A7 7 0 1 1 10.2 5a5.5 5.5 0 0 0 7.8 7.8z"/><path d="M19 4l.6 1.5L21 6l-1.4.5L19 8l-.6-1.5L17 6l1.4-.5z" fill="currentColor" stroke="none"/></svg>',
    national:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 6.5L21 10l-5 4.5L17.5 21 12 17.5 6.5 21 8 14.5 3 10l6.5-.5z"/></svg>'
  };

  var FESTIVALS = [
    { id: 'newyear', name: '元旦', icon: ICONS.newyear,
      type: 'fixed', month: 1, day: 1 },

    { id: 'spring', name: '春节', icon: ICONS.spring,
      type: 'table',
      dates: {
        2024: [2, 10], 2025: [1, 29], 2026: [2, 17], 2027: [2, 6],
        2028: [1, 26], 2029: [2, 13], 2030: [2, 3],  2031: [1, 23],
        2032: [2, 11], 2033: [1, 31], 2034: [2, 19], 2035: [2, 8],
        2036: [1, 28]
      } },

    { id: 'qingming', name: '清明节', icon: ICONS.qingming,
      type: 'table',
      dates: {
        2024: [4, 4], 2025: [4, 4], 2026: [4, 5], 2027: [4, 5],
        2028: [4, 4], 2029: [4, 4], 2030: [4, 5], 2031: [4, 5],
        2032: [4, 4], 2033: [4, 4], 2034: [4, 5], 2035: [4, 5],
        2036: [4, 4]
      } },

    { id: 'labor', name: '劳动节', icon: ICONS.labor,
      type: 'fixed', month: 5, day: 1 },

    { id: 'dragon', name: '端午节', icon: ICONS.dragon,
      type: 'table',
      dates: {
        2024: [6, 10], 2025: [5, 31], 2026: [6, 19], 2027: [6, 9],
        2028: [5, 28], 2029: [6, 16], 2030: [6, 5],  2031: [6, 24],
        2032: [6, 12], 2033: [6, 1],  2034: [6, 20], 2035: [6, 10],
        2036: [5, 30]
      } },

    { id: 'mother', name: '母亲节', icon: ICONS.mother,
      type: 'nth-weekday', month: 5, weekday: 0, nth: 2 },

    { id: 'father', name: '父亲节', icon: ICONS.father,
      type: 'nth-weekday', month: 6, weekday: 0, nth: 3 },

    { id: 'teacher', name: '教师节', icon: ICONS.teacher,
      type: 'fixed', month: 9, day: 10 },

    { id: 'midautumn', name: '中秋节', icon: ICONS.midautumn,
      type: 'table',
      dates: {
        2024: [9, 17], 2025: [10, 6], 2026: [9, 25], 2027: [9, 15],
        2028: [10, 3], 2029: [9, 22], 2030: [9, 12], 2031: [10, 1],
        2032: [9, 19], 2033: [9, 8],  2034: [9, 27], 2035: [9, 16],
        2036: [10, 4]
      } },

    { id: 'national', name: '国庆节', icon: ICONS.national,
      type: 'fixed', month: 10, day: 1 }
  ];

  var nextCard, listEl, refreshTimer = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  /* ---------- 日期工具 ---------- */
  function nthWeekdayOfMonth(year, monthIdx, weekday, nth) {
    var d = new Date(year, monthIdx, 1);
    var firstDay = d.getDay();
    var offset = (weekday - firstDay + 7) % 7;
    var day = 1 + offset + (nth - 1) * 7;
    return new Date(year, monthIdx, day);
  }

  function getFestivalDate(festival, year) {
    if (year < YEAR_MIN || year > YEAR_MAX) return null;

    if (festival.type === 'fixed') {
      return new Date(year, festival.month - 1, festival.day);
    }
    if (festival.type === 'table') {
      var d = festival.dates[year];
      if (!d) return null;
      return new Date(year, d[0] - 1, d[1]);
    }
    if (festival.type === 'nth-weekday') {
      return nthWeekdayOfMonth(year, festival.month - 1, festival.weekday, festival.nth);
    }
    return null;
  }

  function getNextFestivalDate(festival, todayStart) {
    var y0 = todayStart.getFullYear();
    for (var y = y0; y <= YEAR_MAX; y++) {
      var d = getFestivalDate(festival, y);
      if (!d) continue;
      var dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (dStart >= todayStart) return dStart;
    }
    return null;
  }

  function daysBetween(a, b) {
    var ONE = 24 * 60 * 60 * 1000;
    var aS = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    var bS = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((bS - aS) / ONE);
  }

  function formatDate(d) {
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }

  function formatDateShort(d) {
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function weekdayCN(d) {
    return ['日','一','二','三','四','五','六'][d.getDay()];
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-countdown');
    if (!page) return;

    nextCard = document.getElementById('cdNextCard');
    listEl   = document.getElementById('cdList');
    if (!nextCard || !listEl) return;

    inited = true;
    render();

    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(render, 60 * 1000);

    console.log('[倒数日] 已加载');
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var today = new Date();
    var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    var items = FESTIVALS.map(function (f) {
      var next = getNextFestivalDate(f, todayStart);
      return {
        festival: f,
        next: next,
        days: next ? daysBetween(todayStart, next) : null
      };
    }).filter(function (x) { return x.next; });

    if (!items.length) {
      nextCard.innerHTML = '<p class="empty">暂无节日数据</p>';
      listEl.innerHTML = '';
      return;
    }

    items.sort(function (a, b) { return a.days - b.days; });

    renderNextCard(items[0]);
    renderList(items);
  }

  function renderNextCard(item) {
    var f = item.festival;
    var days = item.days;

    var subText, dayText, unitText;
    if (days === 0) {
      subText = '🎉 节日快乐！';
      dayText = '今天';
      unitText = '';
    } else if (days === 1) {
      subText = '明天是' + f.name;
      dayText = '1';
      unitText = '天';
    } else {
      subText = '距离' + f.name;
      dayText = String(days);
      unitText = '天';
    }

    nextCard.innerHTML =
      '<div class="cd-next-icon">' + f.icon + '</div>' +
      '<div class="cd-next-info">' +
        '<div class="cd-next-label">最近节日</div>' +
        '<div class="cd-next-name">' + esc(f.name) + '</div>' +
        '<div class="cd-next-date">' + formatDate(item.next) + ' · 星期' + weekdayCN(item.next) + '</div>' +
      '</div>' +
      '<div class="cd-next-countdown">' +
        '<div class="cd-next-days">' + dayText + '</div>' +
        (unitText ? '<div class="cd-next-unit">' + unitText + '</div>' : '') +
        '<div class="cd-next-sub">' + esc(subText) + '</div>' +
      '</div>';
  }

  function renderList(items) {
    var html = items.map(function (item) {
      var f = item.festival;
      var days = item.days;

      var dayText, dayCls = '';
      if (days === 0) { dayText = '今天'; dayCls = 'today'; }
      else if (days === 1) { dayText = '明天'; dayCls = 'soon'; }
      else { dayText = days + ' 天'; if (days <= 7) dayCls = 'soon'; }

      return '<div class="cd-item" data-id="' + f.id + '">' +
        '<div class="cd-item-main">' +
          '<span class="cd-item-icon">' + f.icon + '</span>' +
          '<div class="cd-item-info">' +
            '<div class="cd-item-name">' + esc(f.name) + '</div>' +
            '<div class="cd-item-date">' + formatDate(item.next) + ' · 星期' + weekdayCN(item.next) + '</div>' +
          '</div>' +
          '<div class="cd-item-days ' + dayCls + '">' + esc(dayText) + '</div>' +
          '<span class="cd-item-arrow">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
          '</span>' +
        '</div>' +
        '<div class="cd-item-years" hidden>' +
          renderYearStrip(f, item.next.getFullYear()) +
        '</div>' +
      '</div>';
    }).join('');

    listEl.innerHTML = html;

    listEl.querySelectorAll('.cd-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var years = el.querySelector('.cd-item-years');
        if (!years) return;
        years.hidden = !years.hidden;
        el.classList.toggle('expanded', !years.hidden);
      });
    });
  }

  /* 横向铺开的年份条 */
  function renderYearStrip(festival, currentYear) {
    var items = [];
    for (var y = YEAR_MIN; y <= YEAR_MAX; y++) {
      var d = getFestivalDate(festival, y);
      if (!d) continue;
      var isCurrent = (y === currentYear);
      items.push(
        '<div class="cd-year-item' + (isCurrent ? ' current' : '') + '">' +
          '<span class="cd-year-num">' + y + '</span>' +
          '<span class="cd-year-date">' + formatDateShort(d) + '</span>' +
          '<span class="cd-year-week">周' + weekdayCN(d) + '</span>' +
        '</div>'
      );
    }
    return '<div class="cd-years-title">' + YEAR_MIN + ' - ' + YEAR_MAX + ' 年日期</div>' +
           '<div class="cd-years-strip">' + items.join('') + '</div>';
  }

  window.__countdownInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();