/* ============================================================
   密码生成器 · V5.0
   随机密码 / 口令短语 / PIN 码
   纯本地运行，使用 crypto.getRandomValues 加密随机源
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 字符池 ---------- */
  var CHARS = {
    upper:  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:  'abcdefghijklmnopqrstuvwxyz',
    digit:  '0123456789',
    symbol: '!@#$%^&*',
    symExt: '()_+-=[]{}|;:,.<>?'
  };
  var CONFUSE = /[0Oo1lI|]/g;

  /* ---------- 口令短语词库（50 个常用短词） ---------- */
  var WORDS = [
    'apple','tiger','river','storm','lemon','cloud','stone','pilot','bread','cherry',
    'shadow','garden','silver','rocket','planet','forest','orange','dragon','melody','winter',
    'summer','purple','yellow','danger','silent','bright','frozen','gentle','magnet','puzzle',
    'tunnel','zigzag','cactus','donkey','falcon','hunter','island','jungle','kitten','lizard',
    'muffin','napkin','oyster','pepper','quiver','ribbon','socket','turtle','velvet','walnut'
  ];

  /* ---------- 随机工具 ---------- */
  function cryptoRandom(max) {
    // 使用浏览器加密随机源；不支持时退回 Math.random（并提示）
    if (window.crypto && window.crypto.getRandomValues) {
      var arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function pickChar(pool) {
    return pool.charAt(cryptoRandom(pool.length));
  }

  function getPool() {
    var pool = '';
    if (document.getElementById('pwdUpper').checked)     pool += CHARS.upper;
    if (document.getElementById('pwdLower').checked)     pool += CHARS.lower;
    if (document.getElementById('pwdDigit').checked)     pool += CHARS.digit;
    if (document.getElementById('pwdSymbol').checked)    pool += CHARS.symbol;
    if (document.getElementById('pwdSymbolExt').checked) pool += CHARS.symExt;
    if (document.getElementById('pwdNoConfuse').checked) pool = pool.replace(CONFUSE, '');
    return pool;
  }

  /* ---------- 强度估算 ---------- */
  function estimateEntropy(pwd, poolSize) {
    if (!pwd || !poolSize) return 0;
    return Math.round(pwd.length * Math.log2(poolSize));
  }

  function formatCrackTime(bits) {
    if (bits <= 0) return '—';
    // 假设离线暴力破解 100 亿次/秒，取一半时间作为平均耗时
    var guesses = Math.pow(2, bits);
    var perSec = 1e10;
    var sec = guesses / perSec / 2;

    if (sec < 1) return '瞬间';
    if (sec < 60) return Math.round(sec) + ' 秒';
    if (sec < 3600) return Math.round(sec / 60) + ' 分钟';
    if (sec < 86400) return Math.round(sec / 3600) + ' 小时';
    if (sec < 86400 * 365) return Math.round(sec / 86400) + ' 天';

    var years = sec / (86400 * 365);
    if (years < 1e4) return Math.round(years) + ' 年';
    if (years < 1e8) return (years / 1e4).toFixed(1) + ' 万年';
    if (years < 1e12) return (years / 1e8).toFixed(1) + ' 亿年';
    return (years / 1e12).toFixed(1) + ' 万亿年';
  }

  function setStrength(level, text) {
    var box = document.getElementById('pwdStrength');
    if (box) box.setAttribute('data-level', String(level));
    var t = document.getElementById('pwdStrengthText');
    if (t) t.textContent = text;
  }

  /* ---------- 复制到剪贴板 ---------- */
  function copyText(text, okMsg) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        if (typeof window.showToast === 'function') window.showToast(okMsg || '已复制');
      }).catch(function () {
        fallbackCopy(text, okMsg);
      });
    } else {
      fallbackCopy(text, okMsg);
    }
  }

  function fallbackCopy(text, okMsg) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (typeof window.showToast === 'function') window.showToast(okMsg || '已复制');
    } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 随机密码模式 ---------- */
  function refreshPassword() {
    var display = document.getElementById('pwdText');
    if (!display) return;

    var pool = getPool();
    if (!pool) {
      display.textContent = '请至少勾选一种字符类型';
      document.getElementById('pwdEntropy').textContent = '—';
      document.getElementById('pwdCrack').textContent = '—';
      setStrength(0, '请至少勾选一种字符类型');
      return;
    }

    var lenInput = document.getElementById('pwdLen');
    var len = parseInt(lenInput.value, 10) || 16;
    var pwd = '';
    for (var i = 0; i < len; i++) pwd += pickChar(pool);

    display.textContent = pwd;

    var bits = estimateEntropy(pwd, pool.length);
    document.getElementById('pwdEntropy').textContent = bits + ' bit';
    document.getElementById('pwdCrack').textContent = formatCrackTime(bits);

    if (bits < 40)      setStrength(1, '弱 · 建议加长或增加字符类型');
    else if (bits < 60) setStrength(2, '一般 · 日常够用');
    else if (bits < 80) setStrength(3, '强 · 推荐使用');
    else                setStrength(4, '极强 · 高价值账户可用');
  }

  /* ---------- 口令短语模式 ---------- */
  function refreshPassphrase() {
    var display = document.getElementById('ppText');
    if (!display) return;

    var countInput = document.getElementById('ppCount');
    var n = parseInt(countInput.value, 10) || 4;
    var sep = document.getElementById('ppSep').value;
    var mode = document.getElementById('ppCase').value;
    var addNum = document.getElementById('ppAddNum').checked;

    var parts = [];
    for (var i = 0; i < n; i++) {
      var w = WORDS[cryptoRandom(WORDS.length)];
      if (mode === 'capital') {
        w = w.charAt(0).toUpperCase() + w.slice(1);
      } else if (mode === 'upper') {
        w = w.toUpperCase();
      }
      parts.push(w);
    }

    var out = parts.join(sep);
    if (addNum) out += String(cryptoRandom(10));

    display.textContent = out;
  }

  /* ---------- PIN 码模式 ---------- */
  function refreshPin() {
    var display = document.getElementById('pinText');
    if (!display) return;

    var lenInput = document.getElementById('pinLen');
    var len = parseInt(lenInput.value, 10) || 6;
    var pin = '';
    for (var i = 0; i < len; i++) pin += String(cryptoRandom(10));
    display.textContent = pin;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    var tabs = document.getElementById('pwdTabs');
    if (!tabs) return;

    /* 子标签切换 */
    tabs.querySelectorAll('.ta-subtab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.querySelectorAll('.ta-subtab').forEach(function (t) {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        var target = tab.dataset.pwd;
        document.querySelectorAll('[data-pwd-page]').forEach(function (p) {
          p.classList.toggle('active', p.dataset.pwdPage === target);
        });
      });
    });

    /* ---- 随机密码 ---- */
    var pwdLen = document.getElementById('pwdLen');
    if (pwdLen) {
      pwdLen.addEventListener('input', function () {
        document.getElementById('pwdLenVal').textContent = pwdLen.value;
        refreshPassword();
      });

      ['pwdUpper','pwdLower','pwdDigit','pwdSymbol','pwdSymbolExt','pwdNoConfuse']
        .forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.addEventListener('change', refreshPassword);
        });

      var regenBtn = document.getElementById('pwdRegen');
      if (regenBtn) regenBtn.addEventListener('click', refreshPassword);

      var copyBtn = document.getElementById('pwdCopy');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          var t = document.getElementById('pwdText').textContent;
          if (!t || t.indexOf('请') === 0) return;
          copyText(t, '已复制密码');
        });
      }

      var copyBtn2 = document.getElementById('pwdCopy2');
      if (copyBtn2) {
        copyBtn2.addEventListener('click', function () {
          var t = document.getElementById('pwdText').textContent;
          if (!t || t.indexOf('请') === 0) return;
          copyText(t, '已复制密码');
        });
      }

      refreshPassword();
    }

    /* ---- 口令短语 ---- */
    var ppCount = document.getElementById('ppCount');
    if (ppCount) {
      ppCount.addEventListener('input', function () {
        document.getElementById('ppCountVal').textContent = ppCount.value;
        refreshPassphrase();
      });

      ['ppSep','ppCase','ppAddNum'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('change', refreshPassphrase);
      });

      var ppRegen = document.getElementById('ppRegen');
      if (ppRegen) ppRegen.addEventListener('click', refreshPassphrase);

      var ppCopy = document.getElementById('ppCopy');
      if (ppCopy) {
        ppCopy.addEventListener('click', function () {
          var t = document.getElementById('ppText').textContent;
          if (!t) return;
          copyText(t, '已复制');
        });
      }

      var ppCopy2 = document.getElementById('ppCopy2');
      if (ppCopy2) {
        ppCopy2.addEventListener('click', function () {
          var t = document.getElementById('ppText').textContent;
          if (!t) return;
          copyText(t, '已复制');
        });
      }

      refreshPassphrase();
    }

    /* ---- PIN 码 ---- */
    var pinLen = document.getElementById('pinLen');
    if (pinLen) {
      pinLen.addEventListener('input', function () {
        document.getElementById('pinLenVal').textContent = pinLen.value;
        refreshPin();
      });

      var pinRegen = document.getElementById('pinRegen');
      if (pinRegen) pinRegen.addEventListener('click', refreshPin);

      var pinCopy = document.getElementById('pinCopy');
      if (pinCopy) {
        pinCopy.addEventListener('click', function () {
          var t = document.getElementById('pinText').textContent;
          if (!t) return;
          copyText(t, '已复制');
        });
      }

      var pinCopy2 = document.getElementById('pinCopy2');
      if (pinCopy2) {
        pinCopy2.addEventListener('click', function () {
          var t = document.getElementById('pinText').textContent;
          if (!t) return;
          copyText(t, '已复制');
        });
      }

      refreshPin();
    }
  }

  /* 暴露给 main2.js 调用，与其他工具保持一致的写法 */
  window.__pwdgenInit = init;
})();