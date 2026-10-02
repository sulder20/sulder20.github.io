/* ============================================================
   岁窦工具箱 · 颜色转换
   ============================================================ */
(function () {
  'use strict';

  var inited = false;

  var state = { r: 245, g: 179, b: 1 };

  var previewEl, previewTextEl, pickerEl;
  var hexInput, rgbInput, hslInput, cmykInput;
  var rRange, gRange, bRange, rVal, gVal, bVal;
  var hRange, sRange, lRange, hVal, sVal, lVal;
  var presetsEl;

  var PRESETS = [
    { name: '琥珀黄', hex: '#F5B301' },
    { name: '阳光橙', hex: '#FF8F00' },
    { name: '中国红', hex: '#C62828' },
    { name: '陶土红', hex: '#E09070' },
    { name: '薄荷绿', hex: '#22C55E' },
    { name: '青柠',   hex: '#84CC16' },
    { name: '天空蓝', hex: '#0EA5E9' },
    { name: '深海蓝', hex: '#1E40AF' },
    { name: '烟紫',   hex: '#A69BBF' },
    { name: '樱花粉', hex: '#F4A7B9' },
    { name: '纯白',   hex: '#FFFFFF' },
    { name: '墨黑',   hex: '#1C1F23' }
  ];

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[颜色]', msg);
  }

  function clamp(n, lo, hi) {
    n = Number(n);
    if (!isFinite(n)) return lo;
    return Math.max(lo, Math.min(hi, n));
  }

  function pad2(s) {
    s = String(s, 16);
    return s.length === 1 ? '0' + s : s;
  }

  /* ---------- 颜色转换核心 ---------- */
  function hexToRgb(hex) {
    if (typeof hex !== 'string') return null;
    hex = hex.trim().replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(function (c) { return c + c; }).join('');
    }
    if (hex.length !== 6) return null;
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    var n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    r = clamp(Math.round(r), 0, 255);
    g = clamp(Math.round(g), 0, 255);
    b = clamp(Math.round(b), 0, 255);
    return '#' + pad2(r.toString(16)) + pad2(g.toString(16)) + pad2(b.toString(16));
  }

  function rgbToHsl(r, g, b) {
    r = clamp(r, 0, 255) / 255;
    g = clamp(g, 0, 255) / 255;
    b = clamp(b, 0, 255) / 255;

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max === min) {
      h = 0;
      s = 0;
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: h, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h, s, l) {
    h = ((Number(h) % 360) + 360) % 360 / 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;

    var r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function rgbToCmyk(r, g, b) {
    r = clamp(r, 0, 255) / 255;
    g = clamp(g, 0, 255) / 255;
    b = clamp(b, 0, 255) / 255;

    var k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    var c = (1 - r - k) / (1 - k);
    var m = (1 - g - k) / (1 - k);
    var y = (1 - b - k) / (1 - k);
    return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 };
  }

  function cmykToRgb(c, m, y, k) {
    c = clamp(c, 0, 100) / 100;
    m = clamp(m, 0, 100) / 100;
    y = clamp(y, 0, 100) / 100;
    k = clamp(k, 0, 100) / 100;
    return {
      r: Math.round(255 * (1 - c) * (1 - k)),
      g: Math.round(255 * (1 - m) * (1 - k)),
      b: Math.round(255 * (1 - y) * (1 - k))
    };
  }

  function isLightColor(r, g, b) {
    var yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 160;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-color');
    if (!page) return;

    previewEl     = document.getElementById('ccPreview');
    previewTextEl = document.getElementById('ccPreviewText');
    pickerEl      = document.getElementById('ccPicker');

    hexInput  = document.getElementById('ccHex');
    rgbInput  = document.getElementById('ccRgb');
    hslInput  = document.getElementById('ccHsl');
    cmykInput = document.getElementById('ccCmyk');

    rRange = document.getElementById('ccR');
    gRange = document.getElementById('ccG');
    bRange = document.getElementById('ccB');
    rVal   = document.getElementById('ccRVal');
    gVal   = document.getElementById('ccGVal');
    bVal   = document.getElementById('ccBVal');

    hRange = document.getElementById('ccH');
    sRange = document.getElementById('ccS');
    lRange = document.getElementById('ccL');
    hVal   = document.getElementById('ccHVal');
    sVal   = document.getElementById('ccSVal');
    lVal   = document.getElementById('ccLVal');

    presetsEl = document.getElementById('ccPresets');

    if (!previewEl || !hexInput) return;

    inited = true;
    renderPresets();
    bindEvents();

    /* 从 HEX 输入框读取初始颜色 */
    var init0 = hexToRgb(hexInput.value);
    if (init0) {
      state = init0;
    }
    renderAll('init');

    console.log('[颜色转换] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    /* HEX 输入 */
    hexInput.addEventListener('input', function () {
      var hex = hexInput.value.trim();
      if (hex && hex[0] !== '#') {
        hexInput.value = '#' + hex;
      }
      var rgb = hexToRgb(hexInput.value);
      if (rgb) {
        state = rgb;
        renderAll('hex');
      }
    });

    hexInput.addEventListener('blur', function () {
      var rgb = hexToRgb(hexInput.value);
      if (rgb) {
        state = rgb;
        renderAll('all');
      } else {
        renderAll('hex');
      }
    });

    /* RGB 滑块 */
    rRange.addEventListener('input', function () {
      state.r = clamp(rRange.value, 0, 255);
      renderAll('rgb');
    });
    gRange.addEventListener('input', function () {
      state.g = clamp(gRange.value, 0, 255);
      renderAll('rgb');
    });
    bRange.addEventListener('input', function () {
      state.b = clamp(bRange.value, 0, 255);
      renderAll('rgb');
    });

    /* HSL 滑块 */
    hRange.addEventListener('input', function () {
      var hsl = rgbToHsl(state.r, state.g, state.b);
      state = hslToRgb(hRange.value, hsl.s, hsl.l);
      renderAll('hsl');
    });
    sRange.addEventListener('input', function () {
      var hsl = rgbToHsl(state.r, state.g, state.b);
      state = hslToRgb(hsl.h, sRange.value, hsl.l);
      renderAll('hsl');
    });
    lRange.addEventListener('input', function () {
      var hsl = rgbToHsl(state.r, state.g, state.b);
      state = hslToRgb(hsl.h, hsl.s, lRange.value);
      renderAll('hsl');
    });

    /* 取色器：<label> 已包着 <input type="color">，点击 label 会自动打开，
       只需要监听颜色变化，把新颜色同步到 state */
    if (pickerEl) {
      pickerEl.addEventListener('input', function () {
        var rgb = hexToRgb(pickerEl.value);
        if (rgb) {
          state = rgb;
          renderAll('all');
        }
      });
    }

    /* 随机 */
    var randomBtn = document.getElementById('ccRandom');
    if (randomBtn) {
      randomBtn.addEventListener('click', function () {
        state = {
          r: Math.floor(Math.random() * 256),
          g: Math.floor(Math.random() * 256),
          b: Math.floor(Math.random() * 256)
        };
        renderAll('all');
        toast('已随机颜色');
      });
    }

    /* 复制 */
    document.querySelectorAll('[data-cc-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.ccCopy;
        var text = '';
        if (key === 'hex')  text = hexInput.value.trim();
        if (key === 'rgb')  text = rgbInput.value.trim();
        if (key === 'hsl')  text = hslInput.value.trim();
        if (key === 'cmyk') text = cmykInput.value.trim();
        if (!text) return;
        copyText(text);
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

  /* ---------- 渲染 ---------- */
  function renderAll(source) {
    var r = Math.round(state.r);
    var g = Math.round(state.g);
    var b = Math.round(state.b);
    state = { r: r, g: g, b: b };

    var hex  = rgbToHex(r, g, b);
    var hsl  = rgbToHsl(r, g, b);
    var cmyk = rgbToCmyk(r, g, b);

    /* 预览 */
    if (previewEl) {
      previewEl.style.background = hex;
      previewEl.classList.toggle('light', isLightColor(r, g, b));
    }
    if (previewTextEl) {
      previewTextEl.textContent = hex.toUpperCase();
    }

    /* HEX */
    if (source !== 'hex') {
      hexInput.value = hex.toUpperCase();
    }

    /* RGB */
    rgbInput.value = 'rgb(' + r + ', ' + g + ', ' + b + ')';

    /* HSL */
    hslInput.value = 'hsl(' + Math.round(hsl.h) + ', ' + Math.round(hsl.s) + '%, ' + Math.round(hsl.l) + '%)';

    /* CMYK */
    cmykInput.value = 'cmyk(' + Math.round(cmyk.c) + '%, ' + Math.round(cmyk.m) + '%, ' + Math.round(cmyk.y) + '%, ' + Math.round(cmyk.k) + '%)';

    /* 滑块 */
    rRange.value = r;
    gRange.value = g;
    bRange.value = b;
    rVal.textContent = r;
    gVal.textContent = g;
    bVal.textContent = b;

    hRange.value = Math.round(hsl.h);
    sRange.value = Math.round(hsl.s);
    lRange.value = Math.round(hsl.l);
    hVal.textContent = Math.round(hsl.h) + '°';
    sVal.textContent = Math.round(hsl.s) + '%';
    lVal.textContent = Math.round(hsl.l) + '%';

    /* 预设色板高亮 */
    if (presetsEl) {
      presetsEl.querySelectorAll('.cc-preset').forEach(function (el) {
        el.classList.toggle('active',
          String(el.dataset.hex).toUpperCase() === hex.toUpperCase());
      });
    }
    /* 同步取色器 input 的值 */
    if (pickerEl) pickerEl.value = hex;
  }

  /* ---------- 预设色板 ---------- */
  function renderPresets() {
    if (!presetsEl) return;
    presetsEl.innerHTML = PRESETS.map(function (p) {
      return '<button type="button" class="cc-preset" ' +
        'style="background:' + p.hex + '" ' +
        'data-hex="' + p.hex + '" ' +
        'data-name="' + p.name + '" ' +
        'title="' + p.name + ' ' + p.hex + '"></button>';
    }).join('');

    presetsEl.querySelectorAll('.cc-preset').forEach(function (el) {
      el.addEventListener('click', function () {
        var rgb = hexToRgb(el.dataset.hex);
        if (rgb) {
          state = rgb;
          renderAll('all');
        }
      });
    });
  }

  window.__colorInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();