/* ============================================================
   岁窦工具箱 · 生肖星座
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var lastResult = null;

  var birthEl, calcBtn, clearBtn;
  var resultGrid, zodiacCard, constCard, infoPanel, moreEl;

  /* ---------- 生肖数据 ---------- */
  var ZODIAC = [
    {
      name: '鼠', emoji: '🐭',
      years: [2020, 2008, 1996, 1984, 1972, 1960, 1948, 1936],
      desc: '机敏灵活，观察力强，善于把握时机。做事谨慎，懂得未雨绸缪，对细节敏感，往往能在混乱中找到秩序。缺点是偶尔想得太多，容易犹豫。',
      tags: ['机智', '谨慎', '适应力强', '善于积累'],
      lucky: '2、3',
      color: '蓝色、金色'
    },
    {
      name: '牛', emoji: '🐮',
      years: [2021, 2009, 1997, 1985, 1973, 1961, 1949, 1937],
      desc: '踏实稳重，有耐心和毅力。认准的事情会一步一个脚印做到最好，不轻易被外界干扰。为人诚实可靠，值得信赖，但对变化适应得慢一些。',
      tags: ['踏实', '稳重', '有毅力', '值得信赖'],
      lucky: '1、9',
      color: '黄色、红色'
    },
    {
      name: '虎', emoji: '🐯',
      years: [2022, 2010, 1998, 1986, 1974, 1962, 1950, 1938],
      desc: '自信勇敢，行动力强，天生的领导者气质。做事果断，说一不二，敢于冒险。不喜欢被束缚，追求独立和自由，但有时会显得过于强势。',
      tags: ['勇敢', '自信', '有魄力', '热情'],
      lucky: '1、3、4',
      color: '蓝色、灰色、橙色'
    },
    {
      name: '兔', emoji: '🐰',
      years: [2023, 2011, 1999, 1987, 1975, 1963, 1951, 1939],
      desc: '温和文雅，善解人意，注重生活品质。心思细腻，待人真诚，善于营造和谐的氛围。不喜欢冲突，倾向于以柔克刚，但有时过于敏感。',
      tags: ['温和', '细腻', '有品味', '重感情'],
      lucky: '3、4、6',
      color: '绿色、蓝色、白色'
    },
    {
      name: '龙', emoji: '🐲',
      years: [2024, 2012, 2000, 1988, 1976, 1964, 1952, 1940],
      desc: '气度不凡，志向远大，富有理想与热情。做事有魄力，不甘平庸，天生带着一种吸引力。追求卓越，但有时容易急躁，需要耐心打磨。',
      tags: ['有志向', '有魅力', '热情', '不甘平庸'],
      lucky: '1、6、7',
      color: '金色、银色'
    },
    {
      name: '蛇', emoji: '🐍',
      years: [2025, 2013, 2001, 1989, 1977, 1965, 1953, 1941],
      desc: '聪明睿智，心思深沉，擅长思考和分析。看问题比别人更透彻，懂得隐忍和等待时机。审美独特，追求质感，但偶尔会显得高冷疏离。',
      tags: ['聪明', '洞察力强', '沉稳', '有品味'],
      lucky: '2、8、9',
      color: '黑色、红色、黄色'
    },
    {
      name: '马', emoji: '🐴',
      years: [2026, 2014, 2002, 1990, 1978, 1966, 1954, 1942],
      desc: '开朗热情，自由奔放，喜欢探索和尝试新鲜事物。行动力强，说走就走，不喜欢一成不变。人缘好，朋友多，但有时会缺乏持久性。',
      tags: ['热情', '自由', '善于社交', '行动派'],
      lucky: '2、3、7',
      color: '红色、黄色、绿色'
    },
    {
      name: '羊', emoji: '🐑',
      years: [2027, 2015, 2003, 1991, 1979, 1967, 1955, 1943],
      desc: '温柔善良，内心柔软，富有同情心。懂得照顾他人的感受，是很好的倾听者。有艺术天赋，喜欢美好事物，但有时缺乏决断力，需要有人推一把。',
      tags: ['善良', '有同理心', '有艺术感', '温柔'],
      lucky: '2、7',
      color: '绿色、红色、紫色'
    },
    {
      name: '猴', emoji: '🐵',
      years: [2028, 2016, 2004, 1992, 1980, 1968, 1956, 1944],
      desc: '机智灵活，反应快，善于随机应变。学习能力强，兴趣广泛，多才多艺。喜欢新鲜刺激，讨厌枯燥，但有时会显得三心二意、难以专注。',
      tags: ['聪明', '灵活', '多才多艺', '反应快'],
      lucky: '1、7、8',
      color: '白色、蓝色、金色'
    },
    {
      name: '鸡', emoji: '🐔',
      years: [2029, 2017, 2005, 1993, 1981, 1969, 1957, 1945],
      desc: '勤奋认真，注重细节，做事讲究条理。观察力强，喜欢把话说清楚，追求完美。有很强的责任心，但有时对自己和他人要求过高，容易钻牛角尖。',
      tags: ['勤奋', '有条理', '追求完美', '责任心强'],
      lucky: '5、7、8',
      color: '金色、黄色、棕色'
    },
    {
      name: '狗', emoji: '🐶',
      years: [2030, 2018, 2006, 1994, 1982, 1970, 1958, 1946],
      desc: '忠诚正直，重情重义，是最可靠的朋友。有强烈的责任感，说到做到。对不公平的事情很敏感，愿意为在乎的人付出，但有时过于直率。',
      tags: ['忠诚', '正直', '可靠', '重情义'],
      lucky: '3、4、9',
      color: '红色、绿色、紫色'
    },
    {
      name: '猪', emoji: '🐷',
      years: [2031, 2019, 2007, 1995, 1983, 1971, 1959, 1947],
      desc: '憨厚真诚，心地善良，与世无争。懂得享受生活，对朋友大方，不计较得失。乐观开朗，很容易让人感到放松，但有时会显得有些懒散。',
      tags: ['真诚', '善良', '乐观', '大方'],
      lucky: '2、5、8',
      color: '黄色、灰色、棕色'
    }
  ];

  /* ---------- 星座数据 ---------- */
  var CONSTELLATIONS = [
    {
      name: '摩羯座', emoji: '♑', from: [12, 22], to: [1, 19],
      desc: '踏实有野心，目标感强，做事有规划。愿意为目标长期投入，耐得住寂寞，是典型的长期主义者。表面冷静内敛，内心其实很重视感情，只是不轻易表达。',
      tags: ['务实', '有野心', '自律', '有耐心'],
      star: '土星',
      lucky: '3、7、8',
      color: '深棕色、墨绿色'
    },
    {
      name: '水瓶座', emoji: '♒', from: [1, 20], to: [2, 18],
      desc: '思维独特，富有创新精神，不喜欢被传统束缚。想法常常比别人超前一步，追求精神上的自由。对朋友非常忠诚，但很难被真正理解，喜欢保持一点距离感。',
      tags: ['独特', '有创意', '独立', '重精神'],
      star: '天王星 / 土星',
      lucky: '4、8',
      color: '天蓝色、银色'
    },
    {
      name: '双鱼座', emoji: '♓', from: [2, 19], to: [3, 20],
      desc: '浪漫感性，富有同情心，是天生的梦想家。对美和情绪特别敏感，懂得共情他人，有很强的艺术天赋。内心世界丰富，但有时容易迷失在情绪里。',
      tags: ['浪漫', '有同情心', '有想象力', '感性'],
      star: '海王星 / 木星',
      lucky: '5、7',
      color: '海蓝色、紫色'
    },
    {
      name: '白羊座', emoji: '♈', from: [3, 21], to: [4, 19],
      desc: '热情直接，行动力十足，不喜欢拖泥带水。想到就去做，敢于第一个吃螃蟹。充满活力，对新鲜事物永远保持好奇心，但耐心方面需要多磨练。',
      tags: ['热情', '直接', '有冲劲', '勇敢'],
      star: '火星',
      lucky: '1、6、9',
      color: '红色、橙色'
    },
    {
      name: '金牛座', emoji: '♉', from: [4, 20], to: [5, 20],
      desc: '踏实可靠，注重实际，对生活品质有要求。不喜欢突如其来的变化，宁愿慢慢来也要把事情做好。审美不错，懂得享受，对在乎的人非常大方。',
      tags: ['踏实', '可靠', '有品味', '有耐心'],
      star: '金星',
      lucky: '2、6',
      color: '绿色、粉色、米色'
    },
    {
      name: '双子座', emoji: '♊', from: [5, 21], to: [6, 21],
      desc: '思维活跃，反应敏捷，好奇心旺盛。喜欢学习新东西，兴趣广泛，沟通能力强，能和不同的人聊到一起。但有时想法变太快，容易显得不够专注。',
      tags: ['聪明', '灵活', '擅长沟通', '好奇心强'],
      star: '水星',
      lucky: '5、7',
      color: '黄色、浅蓝色'
    },
    {
      name: '巨蟹座', emoji: '♋', from: [6, 22], to: [7, 22],
      desc: '温柔顾家，重视安全感和亲情。对身边的人非常体贴，擅长照顾人，是朋友遇到困难第一个想到的人。内心敏感细腻，对外人有点慢热，但一旦认定就会很坚定。',
      tags: ['温柔', '顾家', '体贴', '重感情'],
      star: '月亮',
      lucky: '2、3、7',
      color: '银白色、淡蓝色'
    },
    {
      name: '狮子座', emoji: '♌', from: [7, 23], to: [8, 22],
      desc: '自信大方，天生带着主角光环。喜欢成为焦点，乐于表达自己，也愿意为朋友出头。做事有气派，讲究排场，但有时会在意面子，需要适度收敛。',
      tags: ['自信', '大方', '有气场', '热情'],
      star: '太阳',
      lucky: '1、5、9',
      color: '金色、橙色'
    },
    {
      name: '处女座', emoji: '♍', from: [8, 23], to: [9, 22],
      desc: '细致严谨，追求完美，做事有条理。观察力强，对细节非常敏感，能发现别人忽略的小问题。乐于助人，做事靠谱，但对自己和他人常常要求偏高。',
      tags: ['细致', '有条理', '追求完美', '可靠'],
      star: '水星',
      lucky: '5、6',
      color: '灰色、米色、深蓝色'
    },
    {
      name: '天秤座', emoji: '♎', from: [9, 23], to: [10, 23],
      desc: '优雅有品味，追求平衡与和谐。善于协调各方，在人群中八面玲珑，是很好的调解者。审美在线，讲究氛围感，但有时会因为顾及太多而难以做决定。',
      tags: ['优雅', '有品味', '善协调', '重和谐'],
      star: '金星',
      lucky: '6、9',
      color: '浅蓝色、淡粉色'
    },
    {
      name: '天蝎座', emoji: '♏', from: [10, 24], to: [11, 22],
      desc: '深沉有魅力，洞察力强，看人很准。对感兴趣的事会投入全部热情，追求极致，不喜欢半途而废。感情专一，但对信任有很高的门槛。',
      tags: ['深沉', '洞察力强', '专注', '有魅力'],
      star: '冥王星 / 火星',
      lucky: '4、7',
      color: '深红色、黑色'
    },
    {
      name: '射手座', emoji: '♐', from: [11, 23], to: [12, 21],
      desc: '乐观开朗，喜欢自由，向往远方。天生有探索精神，对世界充满好奇，喜欢旅行和新体验。说话直来直去，很容易相处，但有时不够细心。',
      tags: ['乐观', '自由', '爱冒险', '真诚'],
      star: '木星',
      lucky: '3、9',
      color: '紫色、宝蓝色'
    }
  ];

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[生肖星座]', msg);
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

  /* ---------- 生肖计算（公历年份近似） ---------- */
  function getZodiac(year) {
    // 常见算法：以 2020 年为鼠年做基准
    var baseYear = 2020;
    var baseIdx = 0; // 鼠在 ZODIAC 数组中的索引
    var offset = (year - baseYear) % 12;
    if (offset < 0) offset += 12;
    var idx = (baseIdx + offset) % 12;
    return ZODIAC[idx];
  }

  /* ---------- 星座计算 ---------- */
  function getConstellation(month, day) {
    for (var i = 0; i < CONSTELLATIONS.length; i++) {
      var c = CONSTELLATIONS[i];
      var fm = c.from[0], fd = c.from[1];
      var tm = c.to[0], td = c.to[1];

      if (fm <= tm) {
        // 同年跨越（一般不会用到）
        if ((month > fm || (month === fm && day >= fd)) &&
            (month < tm || (month === tm && day <= td))) {
          return c;
        }
      } else {
        // 跨年，例如摩羯座 12/22 - 1/19
        if ((month === fm && day >= fd) || (month === tm && day <= td) ||
            (month > fm) || (month < tm)) {
          return c;
        }
      }
    }
    return null;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    // 已初始化过：只做静默刷新
    if (inited) {
      if (birthEl && birthEl.value) calc(true);
      return;
    }

    var page = document.getElementById('page-zodiac');
    if (!page) return;

    birthEl     = document.getElementById('zcBirth');
    calcBtn     = document.getElementById('zcCalc');
    clearBtn    = document.getElementById('zcClear');
    resultGrid  = document.getElementById('zcResultGrid');
    zodiacCard  = document.getElementById('zcZodiacCard');
    constCard   = document.getElementById('zcConstCard');
    infoPanel   = document.getElementById('zcInfoPanel');
    moreEl      = document.getElementById('zcMore');

    if (!birthEl || !resultGrid) return;

    inited = true;

    // 默认今天
    if (!birthEl.value) birthEl.value = toDateStr(new Date());

    bindEvents();
    // 首次自动查询（静默，不弹提示）
    calc(true);

    console.log('[生肖星座] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    calcBtn.addEventListener('click', function () { calc(); });
    clearBtn.addEventListener('click', clear);

    birthEl.addEventListener('change', function () { calc(); });
    birthEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); calc(); }
    });

    document.querySelectorAll('#page-zodiac [data-zc-year]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var n = parseInt(btn.dataset.zcYear, 10) || 0;
        var d = new Date();
        d.setFullYear(d.getFullYear() + n);
        birthEl.value = toDateStr(d);
        calc();
      });
    });
  }

  /* ---------- 清空 ---------- */
  function clear() {
    birthEl.value = toDateStr(new Date());
    resultGrid.style.display = 'none';
    infoPanel.style.display = 'none';
    toast('已清空');
  }

  /* ---------- 计算与渲染 ---------- */
  function calc(silent) {
    var date = parseDate(birthEl.value);
    if (!date) {
      if (!silent) toast('请选择有效的出生日期');
      return;
    }

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var zodiac = getZodiac(year);
    var constell = getConstellation(month, day);

    if (!zodiac || !constell) {
      if (!silent) toast('未识别出生日期');
      return;
    }

    lastResult = {
      year: year, month: month, day: day,
      zodiac: zodiac,
      constell: constell
    };

    renderZodiac(zodiac, year);
    renderConstellation(constell);
    renderMore(year, month, day, zodiac, constell);

    resultGrid.style.display = '';
    infoPanel.style.display = '';

    if (!silent) {
      toast('查询完成：' + zodiac.name + ' · ' + constell.name);
    }
  }

  function renderZodiac(z, year) {
    document.getElementById('zcZodiacEmoji').textContent = z.emoji;
    document.getElementById('zcZodiacName').textContent = '属' + z.name;
    document.getElementById('zcZodiacSub').textContent =
      year + ' 年出生　·　公历生肖（如需精确请以农历春节为界）';
    document.getElementById('zcZodiacDesc').textContent = z.desc;
    document.getElementById('zcZodiacNumber').textContent = z.lucky;
    document.getElementById('zcZodiacColor').textContent = z.color;

    var tagsEl = document.getElementById('zcZodiacTags');
    tagsEl.innerHTML = (z.tags || []).map(function (t) {
      return '<span class="zc-tag">' + t + '</span>';
    }).join('');
  }

  function renderConstellation(c) {
    document.getElementById('zcConstEmoji').textContent = c.emoji;
    document.getElementById('zcConstName').textContent = c.name;
    document.getElementById('zcConstSub').textContent =
      c.from[0] + ' 月 ' + c.from[1] + ' 日 - ' + c.to[0] + ' 月 ' + c.to[1] + ' 日';
    document.getElementById('zcConstDesc').textContent = c.desc;
    document.getElementById('zcConstStar').textContent = c.star;
    document.getElementById('zcConstColor').textContent = c.color;
    document.getElementById('zcConstNumber').textContent = c.lucky;

    var tagsEl = document.getElementById('zcConstTags');
    tagsEl.innerHTML = (c.tags || []).map(function (t) {
      return '<span class="zc-tag">' + t + '</span>';
    }).join('');
  }

  function renderMore(year, month, day, zodiac, constell) {
    var born = new Date(year, month - 1, day);
    var now = new Date();
    var age = now.getFullYear() - born.getFullYear();
    var mDiff = now.getMonth() - born.getMonth();
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < born.getDate())) age--;
    if (age < 0) age = 0;

    // 距下一个生日的天数
    var thisYear = new Date(now.getFullYear(), month - 1, day);
    var nextBirthday;
    if (thisYear >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      nextBirthday = thisYear;
    } else {
      nextBirthday = new Date(now.getFullYear() + 1, month - 1, day);
    }
    var oneDay = 24 * 60 * 60 * 1000;
    var daysToBirthday = Math.round(
      (new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate()).getTime() -
       new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / oneDay
    );

    // 该年是否闰年
    var isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    // 星座同组（元素）
    var elementMap = {
      '白羊座': '火象星座', '狮子座': '火象星座', '射手座': '火象星座',
      '金牛座': '土象星座', '处女座': '土象星座', '摩羯座': '土象星座',
      '双子座': '风象星座', '天秤座': '风象星座', '水瓶座': '风象星座',
      '巨蟹座': '水象星座', '天蝎座': '水象星座', '双鱼座': '水象星座'
    };
    var element = elementMap[constell.name] || '—';

    var items = [
      { title: '出生日期', body: year + ' 年 ' + month + ' 月 ' + day + ' 日' + (isLeap ? '（闰年）' : '') },
      { title: '周岁年龄', body: age + ' 岁' },
      { title: '距下一个生日', body: daysToBirthday === 0 ? '🎉 就是今天' : (daysToBirthday + ' 天') },
      { title: '星座属性', body: element },
      { title: '生肖排序', body: '十二生肖第 ' + (ZODIAC.indexOf(zodiac) + 1) + ' 位' },
      { title: '星座排序', body: '黄道十二宫第 ' + (CONSTELLATIONS.indexOf(constell) + 1) + ' 宫' }
    ];

    moreEl.innerHTML = items.map(function (it) {
      return '<div class="zc-more-item">' +
        '<div class="zc-more-title">' + it.title + '</div>' +
        '<div class="zc-more-body">' + it.body + '</div>' +
      '</div>';
    }).join('');
  }

  /* ---------- 导出 ---------- */
  window.__zodiacInit = init;

  // 供 main.js 的 go() 在切页时静默刷新用
  window.__zodiacRefresh = function () {
    if (!inited) { init(); return; }
    if (birthEl && birthEl.value) calc(true);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();