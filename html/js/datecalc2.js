/* ============================================================
   岁窦工具箱 · 日期计算
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var today = new Date();

  var diffA, diffB, diffResult, diffSub;
  var dTotal, dWeek, dWork, dWeekend, dMonth, dYear;
  var baseDate, offsetDir, offsetY, offsetM, offsetW, offsetD;
  var offsetLabel, offsetResult, offsetWeekday;
  var wdA, wdB, wdTotal, wdWork, wdWeekend, wdHoliday, wdExtra;
  var weekendGroup, holidaysEl, workdaysEl;

  var weekDays = [0, 6]; // 默认周末：周日、周六

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[日期计算]', msg);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function toDateStr(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseDate(str) {
    if (!str) return null;
    var m = String(str).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return null;
    var y = parseInt(m[1], 10);
    var mo = parseInt(m[2], 10) - 1;
    var d = parseInt(m[3], 10);
    var date = new Date(y, mo, d);
    if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
    return date;
  }

  function todayAt0() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function daysBetween(a, b) {
    var ONE = 24 * 60 * 60 * 1000;
    var aS = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    var bS = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((bS - aS) / ONE);
  }

  function weekdayCN(d) {
    return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  }

  function formatDateCN(d) {
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }

  function isWeekend(d) {
    return weekDays.indexOf(d.getDay()) !== -1;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-datecalc');
    if (!page) return;

    diffA = document.getElementById('dcDiffA');
    diffB = document.getElementById('dcDiffB');
    diffResult = document.getElementById('dcDiffResult');
    diffSub = document.getElementById('dcDiffSub');
    dTotal   = document.getElementById('dcDTotal');
    dWeek    = document.getElementById('dcDWeek');
    dWork    = document.getElementById('dcDWork');
    dWeekend = document.getElementById('dcDWeekend');
    dMonth   = document.getElementById('dcDMonth');
    dYear    = document.getElementById('dcDYear');

    baseDate      = document.getElementById('dcBaseDate');
    offsetDir     = document.getElementById('dcOffsetDir');
    offsetY       = document.getElementById('dcOffsetY');
    offsetM       = document.getElementById('dcOffsetM');
    offsetW       = document.getElementById('dcOffsetW');
    offsetD       = document.getElementById('dcOffsetD');
    offsetLabel   = document.getElementById('dcOffsetLabel');
    offsetResult  = document.getElementById('dcOffsetResult');
    offsetWeekday = document.getElementById('dcOffsetWeekday');

    wdA = document.getElementById('dcWdA');
    wdB = document.getElementById('dcWdB');
    wdTotal   = document.getElementById('dcWdTotal');
    wdWork    = document.getElementById('dcWdWork');
    wdWeekend = document.getElementById('dcWdWeekend');
    wdHoliday = document.getElementById('dcWdHoliday');
    wdExtra   = document.getElementById('dcWdExtra');

    weekendGroup = document.getElementById('dcWeekendGroup');
    holidaysEl   = document.getElementById('dcHolidays');
    workdaysEl   = document.getElementById('dcWorkdays');

    if (!diffA || !diffB) return;

    inited = true;

    // 默认值
    if (!diffA.value) diffA.value = toDateStr(todayAt0());
    if (!diffB.value) {
      var t = todayAt0();
      t.setDate(t.getDate() + 30);
      diffB.value = toDateStr(t);
    }
    if (!baseDate.value) baseDate.value = toDateStr(todayAt0());
    if (!wdA.value) wdA.value = toDateStr(todayAt0());
    if (!wdB.value) {
      var t2 = todayAt0();
      t2.setDate(t2.getDate() + 30);
      wdB.value = toDateStr(t2);
    }

    bindEvents();
    renderDiff();
    renderOffset();
    renderWorkday();

    console.log('[日期计算] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    // 子标签
    document.querySelectorAll('#page-datecalc .ta-subtab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#page-datecalc .ta-subtab').forEach(function (t) {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        var target = tab.dataset.dc;
        document.querySelectorAll('#page-datecalc .ta-subpage').forEach(function (p) {
          p.classList.toggle('active', p.dataset.dcPage === target);
        });
        if (target === 'diff') renderDiff();
        if (target === 'offset') renderOffset();
        if (target === 'workday') renderWorkday();
      });
    });

    // 日期间隔
    diffA.addEventListener('change', renderDiff);
    diffB.addEventListener('change', renderDiff);
    document.getElementById('dcDiffSwap').addEventListener('click', function () {
      var a = diffA.value;
      diffA.value = diffB.value;
      diffB.value = a;
      renderDiff();
    });
    document.querySelectorAll('#page-datecalc [data-dc-quick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var which = btn.dataset.dcQuick;
        var d = todayAt0();
        if (which === 'today') { /* 今天 */ }
        else if (which === 'tomorrow') d.setDate(d.getDate() + 1);
        else if (which === 'weekend') {
          // 本周日（如果今天就是周日则为今天）
          var delta = (7 - d.getDay()) % 7;
          d.setDate(d.getDate() + delta);
        }
        else if (which === 'month-end') {
          d = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        }
        else if (which === 'year-end') {
          d = new Date(d.getFullYear(), 11, 31);
        }
        diffB.value = toDateStr(d);
        renderDiff();
      });
    });

    // 日期加减
    [baseDate, offsetDir, offsetY, offsetM, offsetW, offsetD].forEach(function (el) {
      el.addEventListener('input', renderOffset);
      el.addEventListener('change', renderOffset);
    });
    document.querySelectorAll('#page-datecalc [data-dc-offset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var n = parseInt(btn.dataset.dcOffset, 10) || 0;
        offsetY.value = '0';
        offsetM.value = '0';
        offsetW.value = '0';
        offsetD.value = String(Math.abs(n));
        offsetDir.value = n < 0 ? '-1' : '+1';
        renderOffset();
      });
    });
    document.getElementById('dcCopyOffset').addEventListener('click', function () {
      var text = offsetResult.textContent.trim();
      if (!text || text === '—') return;
      copyText(text);
    });

    // 工作日
    wdA.addEventListener('change', renderWorkday);
    wdB.addEventListener('change', renderWorkday);
    if (weekendGroup) {
      weekendGroup.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
        cb.addEventListener('change', function () {
          weekDays = [];
          weekendGroup.querySelectorAll('input[type=checkbox]').forEach(function (x) {
            if (x.checked) weekDays.push(parseInt(x.value, 10));
          });
          renderWorkday();
        });
      });
    }
    if (holidaysEl) holidaysEl.addEventListener('input', renderWorkday);
    if (workdaysEl) workdaysEl.addEventListener('input', renderWorkday);

    // 回车触发
    [offsetY, offsetM, offsetW, offsetD].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); renderOffset(); }
      });
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

  /* ---------- 渲染：日期间隔 ---------- */
  function renderDiff() {
    var a = parseDate(diffA.value);
    var b = parseDate(diffB.value);
    if (!a || !b) {
      diffResult.querySelector('.dc-res-num').textContent = '—';
      diffSub.textContent = '请选择两个日期';
      dTotal.textContent   = '—';
      dWeek.textContent    = '—';
      dWork.textContent    = '—';
      dWeekend.textContent = '—';
      dMonth.textContent   = '—';
      dYear.textContent    = '—';
      return;
    }

    var days = daysBetween(a, b);
    var absDays = Math.abs(days);
    var sign = days < 0 ? '（反向）' : '';

    // 主结果
    var numEl = diffResult.querySelector('.dc-res-num');
    var unitEl = diffResult.querySelector('.dc-res-unit');
    numEl.textContent = absDays;
    unitEl.textContent = '天';

    diffSub.textContent = days === 0
      ? '两个日期是同一天'
      : '从 ' + formatDateCN(a) + ' 到 ' + formatDateCN(b) + '　·　相差 ' + absDays + ' 天' + sign;

    // 自然周 / 工作日 / 周末
    var weeks = Math.floor(absDays / 7);
    var remainder = absDays % 7;

    var workdays = 0;
    var weekendDays = 0;
    var start = days >= 0 ? a : b;
    var end = days >= 0 ? b : a;
    var cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cursor < end) {
      if (isWeekend(cursor)) weekendDays++;
      else workdays++;
      cursor.setDate(cursor.getDate() + 1);
    }

    dTotal.textContent   = absDays + ' 天';
    dWeek.textContent    = weeks + ' 周 ' + (remainder ? remainder + ' 天' : '');
    dWork.textContent    = workdays + ' 天';
    dWeekend.textContent = weekendDays + ' 天';

    // 年月差
    var earlier = days >= 0 ? a : b;
    var later = days >= 0 ? b : a;
    var yDiff = later.getFullYear() - earlier.getFullYear();
    var mDiff = later.getMonth() - earlier.getMonth();
    var dDiff = later.getDate() - earlier.getDate();
    if (dDiff < 0) {
      mDiff--;
      var prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
      dDiff += prevMonth.getDate();
    }
    if (mDiff < 0) {
      yDiff--;
      mDiff += 12;
    }
    var monthStr = yDiff > 0 ? (yDiff * 12 + mDiff) + ' 个月' : mDiff + ' 个月';
    if (dDiff > 0) monthStr += ' ' + dDiff + ' 天';

    dMonth.textContent = mDiff + ' 个月';
    dYear.textContent  = yDiff + ' 年 ' + mDiff + ' 个月';
  }

  /* ---------- 渲染：日期加减 ---------- */
  function renderOffset() {
    var base = parseDate(baseDate.value);
    if (!base) {
      offsetResult.textContent = '—';
      offsetWeekday.textContent = '—';
      offsetLabel.textContent = '基准日期 + 0 天 =';
      return;
    }

    var dir = parseInt(offsetDir.value, 10) === -1 ? -1 : 1;
    var y = parseInt(offsetY.value, 10) || 0;
    var m = parseInt(offsetM.value, 10) || 0;
    var w = parseInt(offsetW.value, 10) || 0;
    var d = parseInt(offsetD.value, 10) || 0;

    var result = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    result.setFullYear(result.getFullYear() + dir * y);
    result.setMonth(result.getMonth() + dir * m);
    result.setDate(result.getDate() + dir * (w * 7 + d));

    var parts = [];
    if (y) parts.push((dir > 0 ? '+' : '-') + y + ' 年');
    if (m) parts.push((dir > 0 ? '+' : '-') + m + ' 月');
    if (w) parts.push((dir > 0 ? '+' : '-') + w + ' 周');
    if (d) parts.push((dir > 0 ? '+' : '-') + d + ' 天');
    if (!parts.length) parts.push('+0 天');

    offsetLabel.textContent = formatDateCN(base) + '　' + parts.join(' ') + ' =';
    offsetResult.textContent = toDateStr(result);
    offsetWeekday.textContent = '星期' + weekdayCN(result) + '　·　' + formatDateCN(result);
  }

  /* ---------- 渲染：工作日 ---------- */
  function parseHolidayList(text) {
    var set = {};
    String(text || '').split(/\r?\n/).forEach(function (line) {
      var m = line.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!m) return;
      var y = parseInt(m[1], 10);
      var mo = parseInt(m[2], 10) - 1;
      var d = parseInt(m[3], 10);
      var date = new Date(y, mo, d);
      if (date.getFullYear() === y && date.getMonth() === mo && date.getDate() === d) {
        set[toDateStr(date)] = true;
      }
    });
    return set;
  }

  function renderWorkday() {
    var a = parseDate(wdA.value);
    var b = parseDate(wdB.value);
    if (!a || !b) {
      wdTotal.textContent   = '—';
      wdWork.textContent    = '—';
      wdWeekend.textContent = '—';
      wdHoliday.textContent = '—';
      wdExtra.textContent   = '—';
      return;
    }

    var holidays = parseHolidayList(holidaysEl ? holidaysEl.value : '');
    var workdays = parseHolidayList(workdaysEl ? workdaysEl.value : '');

    var start = a <= b ? a : b;
    var end   = a <= b ? b : a;

    var total = 0;
    var workCount = 0;
    var weekendCount = 0;
    var holidayCount = 0;
    var extraCount = 0;

    var cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cursor <= end) {
      total++;
      var key = toDateStr(cursor);
      var isHol = !!holidays[key];
      var isExtra = !!workdays[key];
      var weekend = isWeekend(cursor);

      if (isHol) {
        holidayCount++;
        // 节假日通常不是工作日；但如果它同时是调休上班日，按调休算
        if (isExtra) { workCount++; extraCount++; }
      } else if (isExtra) {
        workCount++;
        extraCount++;
      } else if (!weekend) {
        workCount++;
      } else {
        weekendCount++;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    wdTotal.textContent   = total + ' 天';
    wdWork.textContent    = workCount + ' 天';
    wdWeekend.textContent = weekendCount + ' 天';
    wdHoliday.textContent = holidayCount + ' 天';
    wdExtra.textContent   = extraCount + ' 天';
  }

  window.__datecalcInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();