/* ============================================================
   世界历史简表 · 岁窦工具箱 V4.0
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-worldhistory');
  if (!page) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function safeCall(fn, label) {
    try { if (typeof fn === 'function') fn(); }
    catch (e) { console.error('[世界历史简表] ' + label + '：', e); }
  }

  /* ---------- 数据 ---------- */
  var DATA = [
    {
      name: '古埃及文明', years: '约前 3100 — 前 30', start: -3100, end: -30,
      era: '上古文明', region: '尼罗河流域',
      people: ['美尼斯', '胡夫', '图特摩斯三世', '拉美西斯二世', '克利奥帕特拉七世'],
      events: ['美尼斯统一上下埃及（约前 3100）', '金字塔时期（前 2686—前 2181）', '新王国时期（前 1550—前 1069）', '被罗马吞并（前 30）'],
      achievements: ['象形文字', '金字塔', '木乃伊', '太阳历', '纸莎草']
    },
    {
      name: '两河流域文明', years: '约前 3500 — 前 539', start: -3500, end: -539,
      era: '上古文明', region: '幼发拉底河、底格里斯河',
      people: ['汉谟拉比', '萨尔贡', '尼布甲尼撒二世'],
      events: ['苏美尔人建立城邦', '萨尔贡统一两河（约前 2334）', '汉谟拉比法典（约前 1754）', '新巴比伦王国（前 626—前 539）', '被波斯灭亡（前 539）'],
      achievements: ['楔形文字', '《汉谟拉比法典》', '60 进制', '空中花园', '太阴历']
    },
    {
      name: '古印度文明', years: '约前 2600 — 前 500 后', start: -2600, end: -500,
      era: '上古文明', region: '印度河流域、恒河流域',
      people: ['释迦牟尼', '孔雀王朝阿育王'],
      events: ['印度河流域文明（哈拉帕文明）', '雅利安人入侵（约前 1500）', '种姓制度形成', '佛教创立（约前 6 世纪）', '孔雀王朝（前 322—前 185）'],
      achievements: ['种姓制度', '佛教', '印度教', '阿拉伯数字雏形', '因明学']
    },
    {
      name: '古希腊文明', years: '前 800 — 前 146', start: -800, end: -146,
      era: '古典时代', region: '巴尔干半岛、爱琴海',
      people: ['荷马', '苏格拉底', '柏拉图', '亚里士多德', '伯里克利', '亚历山大'],
      events: ['城邦兴起', '希波战争（前 499—前 449）', '伯里克利时代（前 461—前 429）', '伯罗奔尼撒战争（前 431—前 404）', '亚历山大大帝东征（前 334—前 323）'],
      achievements: ['民主政治', '哲学', '《荷马史诗》', '几何原本', '奥林匹克运动会']
    },
    {
      name: '古罗马', years: '前 753 — 公元 476', start: -753, end: 476,
      era: '古典时代', region: '意大利半岛、地中海',
      people: ['凯撒', '屋大维', '君士坦丁', '查士丁尼'],
      events: ['罗马建城（前 753）', '共和时代（前 509—前 27）', '帝国时代（前 27—公元 476）', '基督教成为国教（392）', '西罗马帝国灭亡（476）'],
      achievements: ['罗马法', '拉丁语', '罗马建筑', '共和制度', '大道与引水渠']
    },
    {
      name: '拜占庭帝国', years: '395 — 1453', start: 395, end: 1453,
      era: '中世纪', region: '东地中海、小亚细亚',
      people: ['查士丁尼一世', '贝利撒留'],
      events: ['东西罗马分裂（395）', '查士丁尼法典（529—534）', '阿拉伯人围攻君士坦丁堡', '十字军东征', '为奥斯曼所灭（1453）'],
      achievements: ['《查士丁尼法典》', '圣索菲亚大教堂', '希腊文化传承', '东正教']
    },
    {
      name: '阿拉伯帝国', years: '632 — 1258', start: 632, end: 1258,
      era: '中世纪', region: '阿拉伯半岛、西亚、北非、伊比利亚',
      people: ['穆罕默德', '哈伦·拉希德'],
      events: ['伊斯兰教创立（7 世纪初）', '阿拉伯半岛统一（632）', '倭马亚王朝（661—750）', '阿拔斯王朝（750—1258）', '蒙古攻陷巴格达（1258）'],
      achievements: ['伊斯兰教', '《一千零一夜》', '代数', '阿拉伯数字西传', '翻译运动']
    },
    {
      name: '中世纪欧洲', years: '476 — 1453', start: 476, end: 1453,
      era: '中世纪', region: '西欧、中欧',
      people: ['查理曼', '威廉一世', '托马斯·阿奎那'],
      events: ['西罗马灭亡（476）', '法兰克王国兴起', '查理曼加冕（800）', '十字军东征（1096—1291）', '黑死病（1347—1351）', '百年战争（1337—1453）'],
      achievements: ['封建制度', '骑士文化', '哥特式建筑', '大学兴起', '经院哲学']
    },
    {
      name: '文艺复兴', years: '14 世纪 — 17 世纪', start: 1300, end: 1600,
      era: '近代', region: '意大利 → 欧洲',
      people: ['但丁', '达·芬奇', '米开朗琪罗', '莎士比亚', '伽利略'],
      events: ['但丁《神曲》', '美第奇家族赞助艺术', '印刷术西传', '宗教改革（1517）', '科学革命兴起'],
      achievements: ['人文主义', '《蒙娜丽莎》', '《哈姆雷特》', '日心说', '解剖学']
    },
    {
      name: '大航海时代', years: '15 世纪 — 17 世纪', start: 1400, end: 1600,
      era: '近代', region: '全球',
      people: ['哥伦布', '达·伽马', '麦哲伦', '郑和'],
      events: ['郑和下西洋（1405—1433）', '哥伦布到达美洲（1492）', '达·伽马到达印度（1498）', '麦哲伦环球航行（1519—1522）', '殖民扩张'],
      achievements: ['地理大发现', '世界市场雏形', '殖民帝国', '玉米、马铃薯全球传播']
    },
    {
      name: '工业革命', years: '1760 — 1840', start: 1760, end: 1840,
      era: '近代', region: '英国 → 欧美',
      people: ['瓦特', '史蒂芬孙', '富尔顿'],
      events: ['珍妮纺纱机（1765）', '瓦特改良蒸汽机（1785）', '第一条铁路（1825）', '英国完成工业革命（19 世纪 40 年代）'],
      achievements: ['蒸汽机', '工厂制度', '铁路', '城市化', '资本主义世界市场']
    },
    {
      name: '第一次世界大战', years: '1914 — 1918', start: 1914, end: 1918,
      era: '现代', region: '欧洲、全球',
      people: ['威廉二世', '威尔逊', '列宁'],
      events: ['萨拉热窝事件（1914.6）', '一战爆发（1914.7）', '凡尔登战役（1916）', '俄国十月革命（1917）', '一战结束（1918.11）'],
      achievements: ['凡尔赛—华盛顿体系', '国际联盟', '民族自决', '坦克、飞机、毒气首次大规模使用']
    },
    {
      name: '第二次世界大战', years: '1939 — 1945', start: 1939, end: 1945,
      era: '现代', region: '全球',
      people: ['希特勒', '罗斯福', '丘吉尔', '斯大林', '毛泽东'],
      events: ['德国入侵波兰（1939.9）', '珍珠港事件（1941.12）', '斯大林格勒战役（1942—1943）', '诺曼底登陆（1944.6）', '日本投降（1945.9）'],
      achievements: ['联合国成立', '雅尔塔体系', '民族解放运动', '科技加速发展']
    },
    {
      name: '冷战', years: '1947 — 1991', start: 1947, end: 1991,
      era: '现代', region: '全球',
      people: ['杜鲁门', '肯尼迪', '戈尔巴乔夫', '里根'],
      events: ['杜鲁门主义（1947）', '马歇尔计划', '北约、华约成立', '古巴导弹危机（1962）', '柏林墙倒塌（1989）', '苏联解体（1991）'],
      achievements: ['两极格局', '太空竞赛', '联合国作用增强', '第三世界崛起']
    },
    {
      name: '当代世界', years: '1991 至今', start: 1991, end: 2025,
      era: '现代', region: '全球',
      people: [],
      events: ['苏联解体（1991）', '欧盟成立（1993）', '中国加入 WTO（2001）', '9·11 事件（2001）', '全球金融危机（2008）', '新冠疫情（2020）'],
      achievements: ['一超多强', '全球化', '互联网', '人工智能', '多极化趋势']
    }
  ];

  var expandedSet = new Set();

  var searchEl = document.getElementById('whSearch');
  var eraEl    = document.getElementById('whEra');
  var sortEl   = document.getElementById('whSort');
  var statsEl  = document.getElementById('whStatsBar');
  var timelineEl = document.getElementById('whTimeline');

  function durationOf(item) { return Math.max(0, item.end - item.start); }
  function fmtDuration(n) {
    if (n <= 0) return '—';
    if (n < 10000) return n + ' 年';
    return Math.round(n / 100) / 10 + ' 世纪';
  }
  function matches(item) {
    if (eraEl.value && item.era !== eraEl.value) return false;
    var q = String(searchEl.value || '').trim().toLowerCase();
    if (!q) return true;
    if (item.name.indexOf(q) >= 0) return true;
    if (item.region.indexOf(q) >= 0) return true;
    if (item.people.some(function (p) { return p.indexOf(q) >= 0; })) return true;
    if (item.events.some(function (e) { return e.indexOf(q) >= 0; })) return true;
    if (item.achievements.some(function (a) { return a.indexOf(q) >= 0; })) return true;
    return false;
  }
  function sortList(list) {
    if (sortEl.value === 'duration') {
      return list.slice().sort(function (a, b) { return durationOf(b) - durationOf(a); });
    }
    return list.slice().sort(function (a, b) {
      if (a.start !== b.start) return a.start - b.start;
      return a.end - b.end;
    });
  }

  function renderStats(list) {
    if (!list.length) { statsEl.innerHTML = ''; return; }
    var total = list.length, sum = 0;
    var longest = list[0], shortest = list[0];
    list.forEach(function (it) {
      var d = durationOf(it);
      sum += d;
      if (d > durationOf(longest)) longest = it;
      if (d < durationOf(shortest)) shortest = it;
    });
    var avg = Math.round(sum / total);
    statsEl.innerHTML =
      '<div class="wh-stat-card"><div class="wh-stat-label">当前展示</div><div class="wh-stat-value">' + total + ' 个时期</div><div class="wh-stat-sub">共收录 ' + DATA.length + ' 个</div></div>' +
      '<div class="wh-stat-card"><div class="wh-stat-label">平均存续</div><div class="wh-stat-value">' + fmtDuration(avg) + '</div><div class="wh-stat-sub">当前筛选范围内</div></div>' +
      '<div class="wh-stat-card"><div class="wh-stat-label">存续最长</div><div class="wh-stat-value">' + esc(longest.name) + '</div><div class="wh-stat-sub">' + fmtDuration(durationOf(longest)) + '</div></div>' +
      '<div class="wh-stat-card"><div class="wh-stat-label">存续最短</div><div class="wh-stat-value">' + esc(shortest.name) + '</div><div class="wh-stat-sub">' + fmtDuration(durationOf(shortest)) + '</div></div>';
  }

  function render() {
    var list = sortList(DATA.filter(matches));
    renderStats(list);

    if (!list.length) {
      timelineEl.innerHTML = '<p class="wh-empty">没有匹配的时期，换个关键词试试～</p>';
      return;
    }

    timelineEl.innerHTML = list.map(function (item) {
      var isExpanded = expandedSet.has(item.name);
      var chips = '';
      if (item.region && item.region !== '—') {
        chips += '<span class="wh-chip">' + esc(item.region) + '</span>';
      }
      if (item.people.length) {
        chips += '<span class="wh-chip">' + esc(item.people.slice(0, 2).join('、')) + ' 等</span>';
      }
      var yearsParts = item.years.split('—');

      return '<div class="wh-row' + (isExpanded ? ' expanded' : '') + '" data-name="' + esc(item.name) + '">' +
        '<div class="wh-row-year">' +
          esc(yearsParts[0].trim()) +
          '<span class="wh-row-end">↓</span>' +
          esc(yearsParts[1] ? yearsParts[1].trim() : '') +
        '</div>' +
        '<div class="wh-row-dot"></div>' +
        '<div class="wh-row-card">' +
          '<div class="wh-row-toggle"></div>' +
          '<div class="wh-row-card-head">' +
            '<h3 class="wh-row-name">' + esc(item.name) + '</h3>' +
            '<span class="wh-row-years">' + esc(item.years) + '</span>' +
            '<span class="wh-row-era">' + esc(item.era) + '</span>' +
            '<span class="wh-row-duration">' + fmtDuration(durationOf(item)) + '</span>' +
          '</div>' +
          '<div class="wh-row-summary">' + chips + '</div>' +
          '<div class="wh-row-detail">' +
            '<div class="wh-detail-block"><div class="wh-detail-block-title">代表人物</div><div class="wh-row-summary">' +
              item.people.map(function (p) { return '<span class="wh-chip">' + esc(p) + '</span>'; }).join('') +
            '</div></div>' +
            '<div class="wh-detail-block"><div class="wh-detail-block-title">大事记</div><ul class="wh-detail-list">' +
              item.events.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') +
            '</ul></div>' +
            '<div class="wh-detail-block"><div class="wh-detail-block-title">主要成就</div><ul class="wh-detail-list">' +
              item.achievements.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') +
            '</ul></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    timelineEl.querySelectorAll('.wh-row').forEach(function (row) {
      row.querySelector('.wh-row-card').addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        var name = row.dataset.name;
        if (expandedSet.has(name)) expandedSet.delete(name);
        else expandedSet.add(name);
        row.classList.toggle('expanded');
      });
    });
  }

  searchEl.addEventListener('input', render);
  eraEl.addEventListener('change', render);
  sortEl.addEventListener('change', render);

  document.getElementById('whExpandAll').addEventListener('click', function () {
    DATA.filter(matches).forEach(function (it) { expandedSet.add(it.name); });
    render();
  });
  document.getElementById('whCollapseAll').addEventListener('click', function () {
    expandedSet = new Set();
    render();
  });

  function init() {
    if (window.__worldhistoryInited) return;
    window.__worldhistoryInited = true;
    render();
  }
  window.__worldhistoryInit = function () { if (!window.__worldhistoryInited) init(); else render(); };
  if (page.classList.contains('active')) init();
  console.log('[世界历史简表] 已加载');
})();