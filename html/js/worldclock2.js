/* ============================================================
   岁窦工具箱 · 世界时钟
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var KEY = 'suidou-worldclock-v1';
  var DEFAULT_ZONES = ['Asia/Tokyo', 'America/New_York', 'Europe/London', 'Europe/Paris'];

  // 常用城市库：包含全球主要城市
  var CITY_DB = [
    // 亚洲
    { name: '北京',   zone: 'Asia/Shanghai',      alias: 'Beijing' },
    { name: '上海',   zone: 'Asia/Shanghai',      alias: 'Shanghai' },
    { name: '香港',   zone: 'Asia/Hong_Kong',     alias: 'Hong Kong' },
    { name: '台北',   zone: 'Asia/Taipei',        alias: 'Taipei' },
    { name: '东京',   zone: 'Asia/Tokyo',         alias: 'Tokyo' },
    { name: '大阪',   zone: 'Asia/Tokyo',         alias: 'Osaka' },
    { name: '首尔',   zone: 'Asia/Seoul',         alias: 'Seoul' },
    { name: '新加坡', zone: 'Asia/Singapore',     alias: 'Singapore' },
    { name: '曼谷',   zone: 'Asia/Bangkok',       alias: 'Bangkok' },
    { name: '吉隆坡', zone: 'Asia/Kuala_Lumpur',  alias: 'Kuala Lumpur' },
    { name: '雅加达', zone: 'Asia/Jakarta',       alias: 'Jakarta' },
    { name: '马尼拉', zone: 'Asia/Manila',        alias: 'Manila' },
    { name: '新德里', zone: 'Asia/Kolkata',       alias: 'New Delhi' },
    { name: '孟买',   zone: 'Asia/Kolkata',       alias: 'Mumbai' },
    { name: '迪拜',   zone: 'Asia/Dubai',         alias: 'Dubai' },
    { name: '利雅得', zone: 'Asia/Riyadh',        alias: 'Riyadh' },
    { name: '伊斯坦布尔', zone: 'Europe/Istanbul', alias: 'Istanbul' },
    { name: '德黑兰', zone: 'Asia/Tehran',        alias: 'Tehran' },
    { name: '乌兰巴托', zone: 'Asia/Ulaanbaatar', alias: 'Ulaanbaatar' },

    // 欧洲
    { name: '伦敦',   zone: 'Europe/London',      alias: 'London' },
    { name: '巴黎',   zone: 'Europe/Paris',       alias: 'Paris' },
    { name: '柏林',   zone: 'Europe/Berlin',      alias: 'Berlin' },
    { name: '慕尼黑', zone: 'Europe/Berlin',      alias: 'Munich' },
    { name: '罗马',   zone: 'Europe/Rome',        alias: 'Rome' },
    { name: '马德里', zone: 'Europe/Madrid',      alias: 'Madrid' },
    { name: '巴塞罗那', zone: 'Europe/Madrid',    alias: 'Barcelona' },
    { name: '阿姆斯特丹', zone: 'Europe/Amsterdam', alias: 'Amsterdam' },
    { name: '布鲁塞尔', zone: 'Europe/Brussels',  alias: 'Brussels' },
    { name: '苏黎世', zone: 'Europe/Zurich',      alias: 'Zurich' },
    { name: '维也纳', zone: 'Europe/Vienna',      alias: 'Vienna' },
    { name: '布拉格', zone: 'Europe/Prague',      alias: 'Prague' },
    { name: '华沙',   zone: 'Europe/Warsaw',      alias: 'Warsaw' },
    { name: '莫斯科', zone: 'Europe/Moscow',      alias: 'Moscow' },
    { name: '斯德哥尔摩', zone: 'Europe/Stockholm', alias: 'Stockholm' },
    { name: '奥斯陆', zone: 'Europe/Oslo',        alias: 'Oslo' },
    { name: '哥本哈根', zone: 'Europe/Copenhagen', alias: 'Copenhagen' },
    { name: '赫尔辛基', zone: 'Europe/Helsinki',  alias: 'Helsinki' },
    { name: '雅典',   zone: 'Europe/Athens',      alias: 'Athens' },
    { name: '都柏林', zone: 'Europe/Dublin',      alias: 'Dublin' },
    { name: '里斯本', zone: 'Europe/Lisbon',      alias: 'Lisbon' },

    // 北美
    { name: '纽约',   zone: 'America/New_York',   alias: 'New York' },
    { name: '华盛顿', zone: 'America/New_York',   alias: 'Washington' },
    { name: '波士顿', zone: 'America/New_York',   alias: 'Boston' },
    { name: '多伦多', zone: 'America/Toronto',    alias: 'Toronto' },
    { name: '芝加哥', zone: 'America/Chicago',    alias: 'Chicago' },
    { name: '休斯顿', zone: 'America/Chicago',    alias: 'Houston' },
    { name: '丹佛',   zone: 'America/Denver',     alias: 'Denver' },
    { name: '洛杉矶', zone: 'America/Los_Angeles', alias: 'Los Angeles' },
    { name: '旧金山', zone: 'America/Los_Angeles', alias: 'San Francisco' },
    { name: '西雅图', zone: 'America/Los_Angeles', alias: 'Seattle' },
    { name: '温哥华', zone: 'America/Vancouver',  alias: 'Vancouver' },
    { name: '墨西哥城', zone: 'America/Mexico_City', alias: 'Mexico City' },
    { name: '夏威夷', zone: 'Pacific/Honolulu',   alias: 'Hawaii' },

    // 南美
    { name: '圣保罗', zone: 'America/Sao_Paulo',  alias: 'Sao Paulo' },
    { name: '里约热内卢', zone: 'America/Sao_Paulo', alias: 'Rio' },
    { name: '布宜诺斯艾利斯', zone: 'America/Argentina/Buenos_Aires', alias: 'Buenos Aires' },
    { name: '圣地亚哥', zone: 'America/Santiago', alias: 'Santiago' },
    { name: '利马',   zone: 'America/Lima',       alias: 'Lima' },

    // 大洋洲
    { name: '悉尼',   zone: 'Australia/Sydney',   alias: 'Sydney' },
    { name: '墨尔本', zone: 'Australia/Melbourne', alias: 'Melbourne' },
    { name: '布里斯班', zone: 'Australia/Brisbane', alias: 'Brisbane' },
    { name: '珀斯',   zone: 'Australia/Perth',    alias: 'Perth' },
    { name: '奥克兰', zone: 'Pacific/Auckland',   alias: 'Auckland' },

    // 非洲
    { name: '开罗',   zone: 'Africa/Cairo',       alias: 'Cairo' },
    { name: '约翰内斯堡', zone: 'Africa/Johannesburg', alias: 'Johannesburg' },
    { name: '开普敦', zone: 'Africa/Johannesburg', alias: 'Cape Town' },
    { name: '内罗毕', zone: 'Africa/Nairobi',     alias: 'Nairobi' },
    { name: '拉各斯', zone: 'Africa/Lagos',       alias: 'Lagos' }
  ];

  var zones = [];          // [{ zone, customName }]
  var selectedZone = null;
  var suggestList = [];
  var timer = null;

  var localCityEl, localZoneEl, localClockEl, localDateEl;
  var searchEl, suggestEl, addSelectedBtn;
  var gridEl, emptyEl, countEl;

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[世界时钟]', msg);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- 时区工具 ---------- */
  function isValidZone(zone) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: zone });
      return true;
    } catch (e) {
      return false;
    }
  }

  /* 获取某个时区当前的时间片段 */
  function getTimeParts(zone) {
    var fmt = new Intl.DateTimeFormat('zh-CN', {
      timeZone: zone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short'
    });
    var parts = fmt.formatToParts(new Date());
    var obj = {};
    parts.forEach(function (p) {
      if (p.type && p.type !== 'literal') obj[p.type] = p.value;
    });
    // 有些浏览器可能把 hour 写成 "24"，统一转成 0
    if (obj.hour === '24') obj.hour = '00';
    return {
      year: obj.year,
      month: obj.month,
      day: obj.day,
      hour: obj.hour,
      minute: obj.minute,
      second: obj.second,
      weekday: obj.weekday || ''
    };
  }

  /* 计算某个时区相对于本地的分钟偏移（正数表示比本地快） */
  function getOffsetMinutes(zone) {
    var now = new Date();
    // 该时区的本地"假 UTC 时间"
    var parts = getTimeParts(zone);
    var asUTC = Date.UTC(
      parseInt(parts.year, 10),
      parseInt(parts.month, 10) - 1,
      parseInt(parts.day, 10),
      parseInt(parts.hour, 10),
      parseInt(parts.minute, 10),
      parseInt(parts.second, 10)
    );
    // 该 UTC 时间与真实 UTC 时间的差（毫秒），转换为分钟
    return Math.round((asUTC - now.getTime()) / 60000 / 1) * 1; // 已四舍五入到分钟
  }

  function formatDiff(minutes) {
    if (minutes === 0) return { text: '与本地相同', cls: 'same' };
    var abs = Math.abs(minutes);
    var h = Math.floor(abs / 60);
    var m = abs % 60;
    var sign = minutes > 0 ? '快' : '慢';
    var text = '比本地' + sign;
    if (h > 0 && m > 0) text += ' ' + h + ' 小时 ' + m + ' 分钟';
    else if (h > 0) text += ' ' + h + ' 小时';
    else text += ' ' + m + ' 分钟';
    return { text: text, cls: minutes > 0 ? 'ahead' : 'behind' };
  }

  function weekdayCN(en) {
    var map = { 'Mon':'一','Tue':'二','Wed':'三','Thu':'四','Fri':'五','Sat':'六','Sun':'日' };
    return map[en] || en;
  }

  /* ---------- 存储 ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          zones = arr.filter(function (x) { return x && x.zone && isValidZone(x.zone); });
        }
      }
    } catch (e) {
      zones = [];
    }
    if (!zones.length) {
      zones = DEFAULT_ZONES.slice().map(function (z) {
        return { zone: z, customName: '' };
      });
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(zones));
    } catch (e) {}
  }

  /* ---------- 城市名称 ---------- */
  function findCityByZone(zone) {
    for (var i = 0; i < CITY_DB.length; i++) {
      if (CITY_DB[i].zone === zone) return CITY_DB[i];
    }
    return null;
  }

  function zoneDisplayName(item) {
    if (item.customName) return item.customName;
    var city = findCityByZone(item.zone);
    if (city) return city.name;
    // 从时区字符串里取最后一段
    var parts = item.zone.split('/');
    var last = parts[parts.length - 1] || item.zone;
    return last.replace(/_/g, ' ');
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-worldclock');
    if (!page) return;

    localCityEl  = document.getElementById('wcLocalCity');
    localZoneEl  = document.getElementById('wcLocalZone');
    localClockEl = document.getElementById('wcLocalClock');
    localDateEl  = document.getElementById('wcLocalDate');

    searchEl       = document.getElementById('wcSearch');
    suggestEl      = document.getElementById('wcSuggest');
    addSelectedBtn = document.getElementById('wcAddSelected');

    gridEl   = document.getElementById('wcGrid');
    emptyEl  = document.getElementById('wcEmpty');
    countEl  = document.getElementById('wcCount');

    if (!gridEl) return;

    inited = true;

    load();
    bindEvents();
    renderLocal();
    renderGrid();
    tick();

    if (timer) clearInterval(timer);
    timer = setInterval(tick, 1000);

    // 页面隐藏时停止刷新，节省资源
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (timer) { clearInterval(timer); timer = null; }
      } else {
        if (!timer) timer = setInterval(tick, 1000);
        tick();
      }
    });

    console.log('[世界时钟] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    searchEl.addEventListener('input', function () {
      doSearch(searchEl.value);
    });

    searchEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && selectedZone) {
        e.preventDefault();
        addZone(selectedZone);
        searchEl.value = '';
        suggestEl.innerHTML = '';
        selectedZone = null;
        updateAddBtn();
      }
    });

    addSelectedBtn.addEventListener('click', function () {
      if (!selectedZone) return;
      addZone(selectedZone);
      searchEl.value = '';
      suggestEl.innerHTML = '';
      selectedZone = null;
      updateAddBtn();
    });

    document.querySelectorAll('#page-worldclock [data-wc-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        addZone(btn.dataset.wcAdd);
      });
    });

    document.getElementById('wcResetDefault').addEventListener('click', function () {
      if (!confirm('恢复默认城市列表吗？当前列表会被替换。')) return;
      zones = DEFAULT_ZONES.slice().map(function (z) {
        return { zone: z, customName: '' };
      });
      save();
      renderGrid();
      toast('已恢复默认城市');
    });

    document.getElementById('wcClearAll').addEventListener('click', function () {
      if (!zones.length) return;
      if (!confirm('确定清空全部城市吗？')) return;
      zones = [];
      save();
      renderGrid();
      toast('已清空');
    });

    // 点击空白处关闭建议列表
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#page-worldclock')) return;
      if (e.target === searchEl) return;
      if (e.target.closest('.wc-sug-item')) return;
      if (suggestEl.children.length && !e.target.closest('.wc-add-row')) {
        suggestEl.innerHTML = '';
        selectedZone = null;
        updateAddBtn();
      }
    });
  }

  /* ---------- 搜索 ---------- */
  function doSearch(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) {
      suggestEl.innerHTML = '';
      selectedZone = null;
      updateAddBtn();
      return;
    }

    var results = CITY_DB.filter(function (c) {
      return c.name.toLowerCase().indexOf(q) !== -1 ||
             c.zone.toLowerCase().indexOf(q) !== -1 ||
             (c.alias && c.alias.toLowerCase().indexOf(q) !== -1);
    });

    // 去重（多个城市共享同一时区）
    var seen = {};
    results = results.filter(function (c) {
      if (seen[c.zone]) return false;
      seen[c.zone] = true;
      return true;
    }).slice(0, 10);

    suggestList = results;
    selectedZone = null;
    updateAddBtn();

    if (!results.length) {
      // 也允许直接输入合法时区
      if (isValidZone(q)) {
        suggestEl.innerHTML = '<div class="wc-sug-item selected" data-zone="' + esc(q) + '">' +
          '<span class="wc-sug-name">使用自定义时区：' + esc(q) + '</span>' +
          '<span class="wc-sug-zone">' + esc(q) + '</span>' +
        '</div>';
        selectedZone = q;
        updateAddBtn();
        bindSuggestClicks();
      } else {
        suggestEl.innerHTML = '<div class="wc-sug-item" style="cursor:default;opacity:.7;">' +
          '<span class="wc-sug-name">没有找到匹配的城市</span>' +
        '</div>';
      }
      return;
    }

    suggestEl.innerHTML = results.map(function (c) {
      return '<div class="wc-sug-item" data-zone="' + esc(c.zone) + '">' +
        '<span class="wc-sug-name">' + esc(c.name) + '</span>' +
        '<span class="wc-sug-zone">' + esc(c.zone) + '</span>' +
      '</div>';
    }).join('');

    bindSuggestClicks();
  }

  function bindSuggestClicks() {
    suggestEl.querySelectorAll('.wc-sug-item[data-zone]').forEach(function (el) {
      el.addEventListener('click', function () {
        var z = el.dataset.zone;
        if (!z) return;
        suggestEl.querySelectorAll('.wc-sug-item').forEach(function (x) {
          x.classList.remove('selected');
        });
        el.classList.add('selected');
        selectedZone = z;
        updateAddBtn();
      });

      el.addEventListener('dblclick', function () {
        var z = el.dataset.zone;
        if (!z) return;
        addZone(z);
        searchEl.value = '';
        suggestEl.innerHTML = '';
        selectedZone = null;
        updateAddBtn();
      });
    });
  }

  function updateAddBtn() {
    if (addSelectedBtn) {
      addSelectedBtn.disabled = !selectedZone;
    }
  }

  /* ---------- 添加 / 删除 ---------- */
  function addZone(zone) {
    if (!zone || !isValidZone(zone)) {
      toast('无效的时区');
      return;
    }
    if (zones.some(function (z) { return z.zone === zone; })) {
      toast('该城市已在列表中');
      return;
    }
    zones.push({ zone: zone, customName: '' });
    save();
    renderGrid();
    toast('已添加：' + zoneDisplayName({ zone: zone, customName: '' }));
  }

  function removeZone(zone) {
    var item = zones.find(function (z) { return z.zone === zone; });
    if (!item) return;
    var name = zoneDisplayName(item);
    if (!confirm('确定移除「' + name + '」吗？')) return;
    zones = zones.filter(function (z) { return z.zone !== zone; });
    save();
    renderGrid();
    toast('已移除：' + name);
  }

  /* ---------- 渲染本地时间 ---------- */
  function renderLocal() {
    var tz = '';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) {
      tz = '';
    }
    if (localZoneEl) {
      localZoneEl.textContent = tz ? tz : '本地时区';
    }
    if (localCityEl) {
      var localCity = tz ? findCityByZone(tz) : null;
      localCityEl.textContent = localCity ? localCity.name + '（本地）' : '本地时间';
    }
  }

  /* ---------- 渲染城市列表 ---------- */
  function renderGrid() {
    if (countEl) countEl.textContent = zones.length;

    if (!zones.length) {
      gridEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    gridEl.innerHTML = zones.map(function (item) {
      var name = zoneDisplayName(item);
      return '<div class="wc-card" data-zone="' + esc(item.zone) + '">' +
        '<div class="wc-card-head">' +
          '<div class="wc-card-info">' +
            '<div class="wc-card-city">' + esc(name) + '</div>' +
            '<div class="wc-card-zone">' + esc(item.zone) + '</div>' +
          '</div>' +
          '<button class="wc-card-del" data-wc-del="' + esc(item.zone) + '" title="移除">✕</button>' +
        '</div>' +
        '<div class="wc-card-time">' +
          '<div class="wc-card-clock" data-wc-clock>--:--:--</div>' +
          '<div class="wc-card-date" data-wc-date>---- 年 -- 月 -- 日 星期-</div>' +
          '<div class="wc-card-diff same" data-wc-diff>与本地相同</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // 删除事件
    gridEl.querySelectorAll('[data-wc-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeZone(btn.dataset.wcDel);
      });
    });

    // 立即刷新一次时间
    updateAllTimes();
  }

  /* ---------- 更新所有时间 ---------- */
  function updateAllTimes() {
    var localParts = getTimeParts(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');

    // 本地
    if (localClockEl) localClockEl.textContent =
      localParts.hour + ':' + localParts.minute + ':' + localParts.second;
    if (localDateEl) localDateEl.textContent =
      localParts.year + ' 年 ' +
      parseInt(localParts.month, 10) + ' 月 ' +
      parseInt(localParts.day, 10) + ' 日 星期' + weekdayCN(localParts.weekday);

    // 每个城市
    gridEl.querySelectorAll('.wc-card').forEach(function (card) {
      var zone = card.dataset.zone;
      if (!zone || !isValidZone(zone)) return;

      var p;
      try { p = getTimeParts(zone); } catch (e) { return; }

      var clockEl = card.querySelector('[data-wc-clock]');
      var dateEl  = card.querySelector('[data-wc-date]');
      var diffEl  = card.querySelector('[data-wc-diff]');

      if (clockEl) clockEl.textContent = p.hour + ':' + p.minute + ':' + p.second;
      if (dateEl) dateEl.textContent =
        p.year + ' 年 ' +
        parseInt(p.month, 10) + ' 月 ' +
        parseInt(p.day, 10) + ' 日 星期' + weekdayCN(p.weekday);

      if (diffEl) {
        var diffMin = getOffsetMinutes(zone);
        var info = formatDiff(diffMin);
        diffEl.textContent = info.text;
        diffEl.className = 'wc-card-diff ' + info.cls;
      }
    });
  }

  /* ---------- 每秒刷新 ---------- */
  function tick() {
    // 页面隐藏时不刷新
    if (document.hidden) return;
    var page = document.getElementById('page-worldclock');
    if (!page || !page.classList.contains('active')) return;
    updateAllTimes();
  }

  window.__worldclockInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();