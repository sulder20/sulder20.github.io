/* ============================================================
   亲戚计算器 · 岁窦工具箱 V4.1
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-calc');
  if (!page) return;

  var resultEl = document.getElementById('qqResult');
  var chainEl  = document.getElementById('qqChain');
  if (!resultEl || !chainEl) return;

  /* ---------- 关系名称（用于链条展示） ---------- */
  var REL_NAMES = {
    'f': '父', 'm': '母', 'h': '夫', 'w': '妻',
    's': '子', 'd': '女',
    'ob': '兄', 'lb': '弟', 'os': '姐', 'ls': '妹'
  };

  /* ---------- 称谓映射表 ----------
     key 为关系链（f/m/h/w/s/d/ob/lb/os/ls 拼接）
     覆盖直系 / 旁系 / 姻亲，最多 6 级
  ---------- */
  var KINSHIP = {
    /* ===== 直系 ===== */
    'f': '爸爸', 'm': '妈妈',
    'ff': '爷爷', 'fm': '奶奶', 'mf': '外公', 'mm': '外婆',
    'fff': '曾祖父', 'ffm': '曾祖母', 'mff': '外曾祖父', 'mfm': '外曾祖母',
    'ffff': '高祖父', 'fffm': '高祖母', 'mfff': '外高祖父', 'mffm': '外高祖母',

    /* ===== 自己兄弟姐妹 ===== */
    'ob': '哥哥', 'lb': '弟弟', 'os': '姐姐', 'ls': '妹妹',

    /* ===== 配偶 ===== */
    'w': '妻子', 'h': '丈夫',

    /* ===== 子女 ===== */
    's': '儿子', 'd': '女儿',
    'ss': '孙子', 'sd': '孙女', 'ds': '外孙', 'dd': '外孙女',
    'sss': '曾孙', 'ssd': '曾孙女',
    'sds': '外曾孙', 'sdd': '外曾孙女',
    'dss': '外曾孙', 'dsd': '外曾孙女',
    'dds': '外曾外孙', 'ddd': '外曾外孙女',

    /* ===== 父母的兄弟姐妹 ===== */
    'fob': '伯父', 'flb': '叔叔', 'fos': '姑妈', 'fls': '姑姑',
    'mob': '舅舅', 'mlb': '舅舅', 'mos': '姨妈', 'mls': '姨',
    'fb': '伯父 / 叔叔', 'fz': '姑姑',
    'mb': '舅舅', 'mz': '姨妈',

    /* ===== 祖父母的兄弟姐妹 ===== */
    'ffob': '伯祖父', 'fflb': '叔祖父', 'ffos': '姑奶奶', 'ffls': '姑奶奶',
    'mfob': '伯外祖父', 'mflb': '叔外祖父', 'mfos': '姑外祖母', 'mfls': '姑外祖母',
    'mmob': '舅公', 'mmlb': '舅公', 'mmos': '姨婆', 'mmls': '姨婆',
    'ffb': '伯祖父 / 叔祖父', 'ffz': '姑奶奶',
    'mfb': '伯外祖父 / 叔外祖父', 'mfz': '姑外祖母',
    'mmb': '舅公', 'mmz': '姨婆',

    /* ===== 兄弟姐妹的子女 ===== */
    'obs': '侄子', 'obd': '侄女', 'lbs': '侄子', 'lbd': '侄女',
    'oss': '外甥', 'osd': '外甥女', 'lss': '外甥', 'lsd': '外甥女',
    'bs': '侄子', 'bd': '侄女',
    'zs': '外甥', 'zd': '外甥女',

    /* ===== 兄弟姐妹的配偶 ===== */
    'obw': '嫂子', 'lbw': '弟媳',
    'osh': '姐夫', 'lsh': '妹夫',
    'bw': '嫂子 / 弟媳', 'zh': '姐夫 / 妹夫',

    /* ===== 父母的兄弟姐妹的子女（堂表） ===== */
    'fobs': '堂哥', 'fobd': '堂姐', 'flbs': '堂弟', 'flbd': '堂妹',
    'foss': '表哥', 'fosd': '表姐', 'flss': '表弟', 'flsd': '表妹',
    'mobs': '表哥', 'mobd': '表姐', 'mlbs': '表弟', 'mlbd': '表妹',
    'moss': '表哥', 'mosd': '表姐', 'mlss': '表弟', 'mlsd': '表妹',
    'fbs': '堂兄弟', 'fbd': '堂姐妹',
    'fzs': '表兄弟', 'fzd': '表姐妹',
    'mbs': '表兄弟', 'mbd': '表姐妹',
    'mzs': '表兄弟', 'mzd': '表姐妹',

    /* ===== 子女的配偶 ===== */
    'sw': '儿媳', 'dh': '女婿',
    'ssw': '孙媳', 'sdh': '孙女婿',
    'dsw': '外孙媳', 'ddh': '外孙女婿',

    /* ===== 配偶的亲戚 ===== */
    'wf': '岳父', 'wm': '岳母',
    'hf': '公公', 'hm': '婆婆',
    'wob': '大舅子', 'wlb': '小舅子',
    'wos': '大姨子', 'wls': '小姨子',
    'hob': '大伯子', 'hlb': '小叔子',
    'hos': '大姑子', 'hls': '小姑子',
    'wb': '舅子', 'wz': '姨子',
    'hb': '伯子 / 叔子', 'hz': '姑子',

    /* ===== 侄甥的子女 ===== */
    'obss': '侄孙', 'obsd': '侄孙女',
    'lbss': '侄孙', 'lbsd': '侄孙女',
    'osss': '外甥孙', 'ossd': '外甥孙女',
    'lsss': '外甥孙', 'lssd': '外甥孙女',

    /* ===== 兄弟姐妹配偶的兄弟姐妹 ===== */
    'obwob': '大舅子', 'obwlb': '小舅子',
    'lbwob': '大舅子', 'lbwlb': '小舅子',
    'oshob': '大伯子', 'oshlb': '小叔子',

    /* ===== 兄弟姐妹子女的配偶 ===== */
    'obsw': '侄媳', 'obdh': '侄女婿',
    'lbsw': '侄媳', 'lbdh': '侄女婿',
    'ossw': '外甥媳', 'osdh': '外甥女婿'
  };

  var chain = []; /* 关系链，如 ['f', 'ob', 's'] */

  /* ---------- 查询 ---------- */
  function lookup() {
    if (!chain.length) return { name: '我', ok: true };
    var key = chain.join('');
    if (KINSHIP[key]) return { name: KINSHIP[key], ok: true };

    /* 归一化：ob/lb → b，os/ls → z */
    var norm = chain.map(function (c) {
      if (c === 'ob' || c === 'lb') return 'b';
      if (c === 'os' || c === 'ls') return 'z';
      return c;
    }).join('');
    if (KINSHIP[norm]) return { name: KINSHIP[norm], ok: true };

    return { name: null, ok: false };
  }

  /* ---------- 关系链展示 ---------- */
  function chainToString() {
    if (!chain.length) return '从「我」开始';
    var parts = ['我'];
    chain.forEach(function (c) {
      parts.push(REL_NAMES[c] || c);
    });
    return parts.join(' → ');
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var r = lookup();
    if (r.ok) {
      resultEl.textContent = r.name;
      resultEl.style.color = 'var(--primary-dark)';
    } else {
      resultEl.textContent = '这个关系太远啦';
      resultEl.style.color = '#b91c1c';
    }
    chainEl.textContent = chainToString();
  }

  /* ---------- 事件绑定 ---------- */
  document.querySelectorAll('#page-calc [data-qq]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (chain.length >= 6) {
        if (typeof showToast === 'function') showToast('关系链最多 6 级');
        return;
      }
      chain.push(btn.dataset.qq);
      render();
    });
  });

  document.querySelectorAll('#page-calc [data-qq-quick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      chain = btn.dataset.qqQuick.split(',');
      render();
    });
  });

  var undoBtn = document.getElementById('qqUndo');
  var clearBtn = document.getElementById('qqClear');
  if (undoBtn) {
    undoBtn.addEventListener('click', function () {
      chain.pop();
      render();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      chain = [];
      render();
    });
  }

  render();

  window.__qinqiInit = function () { render(); };

  console.log('[亲戚计算器] 已加载');
})();