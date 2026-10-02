/* ============================================================
   函数图像绘制 · 岁窦工具箱 V4.0
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('fpCanvas');
  if (!canvas) return;

  var ctx  = canvas.getContext('2d');
  var wrap = canvas.parentElement;

  var STORE_KEY = 'suidou-funcplot-v1';
  var FONT = '"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  var PALETTE = ['#b47c00', '#4a7fb5', '#3f8f6b', '#c0524a', '#8a6bbf', '#c47a2b', '#5a6b7d', '#b04a8a'];

  /* ---------- 数学作用域 ---------- */
  var MATH_SCOPE = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp,
    ln: Math.log, log: Math.log10, log2: Math.log2, log10: Math.log10,
    floor: Math.floor, ceil: Math.ceil, round: Math.round,
    sign: Math.sign, min: Math.min, max: Math.max, pow: Math.pow,
    PI: Math.PI, pi: Math.PI, E: Math.E, e: Math.E
  };
  var SCOPE_NAMES  = Object.keys(MATH_SCOPE);
  var SCOPE_VALUES = SCOPE_NAMES.map(function (n) { return MATH_SCOPE[n]; });

  /* ---------- 状态 ---------- */
  var funcs = [];
  var titlePos = { x: 0.5, y: 0.075 };
  var hitBoxes = [];
  var drag = null;
  var hoverEl = null;
  var logicalW = 0, logicalH = 0;
  var inited = false;
  var rafId = null;
  var paletteIdx = 0;

  /* ---------- 小工具 ---------- */
  function $id(id) { return document.getElementById(id); }
  function val(id, dft) {
    var el = $id(id);
    return el ? el.value : (dft === undefined ? '' : dft);
  }
  function num(id, dft) {
    var el = $id(id);
    if (!el) return dft;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : dft;
  }
  function chk(id) {
    var el = $id(id);
    return el ? el.checked : false;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function fpEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fpPad2(n) { return n < 10 ? '0' + n : String(n); }

  /* ---------- 表达式编译 ---------- */
  function compileExpr(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return null;
    s = s.replace(/^\s*y\s*=\s*/i, '');
    s = s.replace(/^\s*f\s*\(\s*x\s*\)\s*=\s*/i, '');
    s = s.replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/[−–—]/g, '-');
    s = s.replace(/π/g, 'PI');
    s = s.replace(/\^/g, '**');
    if (!/^[0-9a-zA-Z_+\-*/().,%\s]*$/.test(s)) return null;

    var body;
    try {
      body = new Function('x', SCOPE_NAMES.join(','), '"use strict";return (' + s + ');');
    } catch (err) {
      return null;
    }
    return function (xv) {
      try {
        var v = body.apply(null, [xv].concat(SCOPE_VALUES));
        return typeof v === 'number' ? v : NaN;
      } catch (err) { return NaN; }
    };
  }

  /* ---------- 刻度计算 ---------- */
  function niceStep(range, target) {
    if (!isFinite(range) || range <= 0) return 1;
    var rough = range / Math.max(2, target);
    var mag = Math.pow(10, Math.floor(Math.log10(rough)));
    var norm = rough / mag;
    var mult;
    if (norm <= 1) mult = 1;
    else if (norm <= 2) mult = 2;
    else if (norm <= 2.5) mult = 2.5;
    else if (norm <= 5) mult = 5;
    else mult = 10;
    return mult * mag;
  }
  function fmtTick(v, step) {
    if (Math.abs(v) < step * 1e-6) return '0';
    var decimals = Math.max(0, -Math.floor(Math.log10(step)));
    decimals = Math.min(decimals, 8);
    var s = v.toFixed(decimals);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s;
  }

  /* ---------- 渲染调度 ---------- */
  function scheduleRender() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = null;
      render();
    });
  }

  /* ---------- 画布坐标 ---------- */
  function getPos(e) {
    var r = canvas.getBoundingClientRect();
    var sx = logicalW / (r.width  || 1);
    var sy = logicalH / (r.height || 1);
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  }

  /* ---------- 主渲染 ---------- */
  function render() {
    var dpr = window.devicePixelRatio || 1;
    var w = Math.max(300, Math.round(wrap.clientWidth));
    var h = Math.max(220, Math.round(w * 0.62));

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var W = w, H = h;
    logicalW = W; logicalH = H;
    hitBoxes = [];

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    /* ---- 读取视图范围 ---- */
    var xMin = num('fpXMin', -10), xMax = num('fpXMax', 10);
    var yMin = num('fpYMin', -6),  yMax = num('fpYMax', 6);

    if (!(xMax > xMin) || !(yMax > yMin)) {
      ctx.fillStyle = '#b0b6c4';
      ctx.font = '15px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('坐标范围设置不正确：最大值必须大于最小值', W / 2, H / 2);
      return;
    }

    var mapX = function (x) { return (x - xMin) / (xMax - xMin) * W; };
    var mapY = function (y) { return H - (y - yMin) / (yMax - yMin) * H; };

    /* ---- 坐标轴自身范围（数据坐标，留空 = 跟随视图范围） ---- */
    function readAxisRange(idStart, idEnd, defStart, defEnd) {
      var sRaw = String(val(idStart, '')).trim();
      var eRaw = String(val(idEnd,   '')).trim();
      var s = sRaw === '' ? defStart : parseFloat(sRaw);
      var e = eRaw === '' ? defEnd   : parseFloat(eRaw);
      if (!isFinite(s)) s = defStart;
      if (!isFinite(e)) e = defEnd;
      if (e < s) { var t = s; s = e; e = t; }
      return { s: s, e: e };
    }

    var xAx = readAxisRange('fpXAxisStart', 'fpXAxisEnd', xMin, xMax);
    var yAx = readAxisRange('fpYAxisStart', 'fpYAxisEnd', yMin, yMax);

    var xAxVisS = Math.max(xAx.s, xMin);
    var xAxVisE = Math.min(xAx.e, xMax);
    var yAxVisS = Math.max(yAx.s, yMin);
    var yAxVisE = Math.min(yAx.e, yMax);
    var xAxVisible = xAxVisS <= xAxVisE;
    var yAxVisible = yAxVisS <= yAxVisE;

    /* ---- 坐标轴设置 ---- */
    var axisColor  = '#5a4a20';
    var axisW      = Math.max(0.4, num('fpAxisWidth', 1.6));
    var showAxisX  = chk('fpAxisX');
    var showAxisY  = chk('fpAxisY');
    var showArrowX = chk('fpArrowX');
    var showArrowY = chk('fpArrowY');
    var arrowSize  = Math.max(4, num('fpArrowSize', 10));

    var axisYPos = clamp(mapY(0), 0, H);
    var axisXPos = clamp(mapX(0), 0, W);

    /* ---- 刻度设置 ---- */
    var tickShow = chk('fpTickShow');
    var tickNum  = chk('fpTickNum');
    var tickDir  = val('fpTickDir', 'out') === 'in' ? 'in' : 'out';
    var tickW    = Math.max(0.3, num('fpTickWidth', 1.2));
    var tickLen  = tickShow ? Math.max(0, num('fpTickLen', 7)) : 0;
    var tickFont = Math.max(8, num('fpTickFont', 12));

    var xStepRaw = num('fpXTickStep', 0);
    var yStepRaw = num('fpYTickStep', 0);
    var xStep = xStepRaw > 0 ? xStepRaw : niceStep(xMax - xMin, 10);
    var yStep = yStepRaw > 0 ? yStepRaw : niceStep(yMax - yMin, 8);

    /* ---- 画坐标轴 ---- */
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = axisW;

    if (showAxisX && xAxVisible) {
      var axX0 = mapX(xAxVisS);
      var axX1 = mapX(xAxVisE);
      ctx.beginPath();
      ctx.moveTo(axX0, axisYPos);
      ctx.lineTo(axX1, axisYPos);
      ctx.stroke();
      if (showArrowX) drawArrow(axX1, axisYPos, 0, arrowSize, axisColor);
    }
    if (showAxisY && yAxVisible) {
      var axY0 = mapY(yAxVisE);
      var axY1 = mapY(yAxVisS);
      ctx.beginPath();
      ctx.moveTo(axisXPos, axY0);
      ctx.lineTo(axisXPos, axY1);
      ctx.stroke();
      if (showArrowY) drawArrow(axisXPos, axY0, -Math.PI / 2, arrowSize, axisColor);
    }

    /* ---- 画刻度 ---- */
    if (tickShow || tickNum) {
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = tickW;
      ctx.font = tickFont + 'px ' + FONT;
      ctx.fillStyle = axisColor;

      /* X 轴刻度：只在 X 轴可见段内绘制，且 X 轴可见才绘制 */
      if (showAxisX && xAxVisible && (tickShow || tickNum)) {
        var xDown = tickDir === 'out';
        var xNumBelow = axisYPos >= H / 2;
        for (var tx = Math.ceil(xAxVisS / xStep) * xStep; tx <= xAxVisE + 1e-9; tx += xStep) {
          var px = mapX(tx);
          if (px < -1 || px > W + 1) continue;

          if (tickShow) {
            var y1 = axisYPos;
            var y2 = axisYPos + (xDown ? tickLen : -tickLen);
            ctx.beginPath();
            ctx.moveTo(px, y1);
            ctx.lineTo(px, y2);
            ctx.stroke();
          }
          if (tickNum && !(showAxisY && yAxVisible && Math.abs(tx) < xStep * 1e-6)) {
            var offX = (tickShow ? tickLen : 0) + 5;
            ctx.textAlign = 'center';
            ctx.textBaseline = xNumBelow ? 'top' : 'bottom';
            var ny = xNumBelow ? (axisYPos + offX) : (axisYPos - offX);
            ctx.fillText(fmtTick(tx, xStep), px, ny);
          }
        }
      }

      /* Y 轴刻度：只在 Y 轴可见段内绘制，且 Y 轴可见才绘制 */
      if (showAxisY && yAxVisible && (tickShow || tickNum)) {
        var yLeft = tickDir === 'out';
        var yNumRight = axisXPos < W / 2;
        for (var ty = Math.ceil(yAxVisS / yStep) * yStep; ty <= yAxVisE + 1e-9; ty += yStep) {
          var py = mapY(ty);
          if (py < -1 || py > H + 1) continue;

          if (tickShow) {
            var x1 = axisXPos;
            var x2 = axisXPos + (yLeft ? -tickLen : tickLen);
            ctx.beginPath();
            ctx.moveTo(x1, py);
            ctx.lineTo(x2, py);
            ctx.stroke();
          }
          if (tickNum && !(showAxisX && xAxVisible && Math.abs(ty) < yStep * 1e-6)) {
            var offY = (tickShow ? tickLen : 0) + 5;
            ctx.textAlign = yNumRight ? 'left' : 'right';
            ctx.textBaseline = 'middle';
            var nx = yNumRight ? (axisXPos + offY) : (axisXPos - offY);
            ctx.fillText(fmtTick(ty, yStep), nx, py);
          }
        }
      }
    }

    /* ---- 画函数曲线 ---- */
    var lineW  = Math.max(0.5, num('fpLineWidth', 2.4));
    var smooth = val('fpSmooth', 'normal');
    var steps  = smooth === 'high' ? 3200 : 1400;
    var jumpLimit = H * 1.5;

    funcs.forEach(function (f) {
      if (!f.visible) return;
      var fn = compileExpr(f.expr);
      if (!fn) return;

      ctx.strokeStyle = f.color;
      ctx.lineWidth = lineW;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();

      var started = false;
      var prevPy = 0;

      for (var i = 0; i <= steps; i++) {
        var xv = xMin + (xMax - xMin) * i / steps;
        var yv = fn(xv);

        if (!isFinite(yv)) { started = false; continue; }

        var pyv = mapY(yv);
        var pxv = mapX(xv);

        if (pyv < -H * 12 || pyv > H * 13) { started = false; continue; }

        if (!started) {
          ctx.moveTo(pxv, pyv);
          started = true;
        } else if (Math.abs(pyv - prevPy) > jumpLimit) {
          ctx.moveTo(pxv, pyv);
        } else {
          ctx.lineTo(pxv, pyv);
        }
        prevPy = pyv;
      }
      ctx.stroke();
    });

    /* ---- 坐标轴标签 x / y ---- */
    var xLab = String(val('fpXLabel', 'x')).trim();
    var yLab = String(val('fpYLabel', 'y')).trim();

    if (showAxisX && xAxVisible && xLab) {
      ctx.font = 'italic 700 15px ' + FONT;
      ctx.fillStyle = axisColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      var labY = (axisYPos + 20 > H) ? axisYPos - 22 : axisYPos + 6;
      var labX = mapX(xAxVisE);
      ctx.fillText(xLab, labX - 8, labY);
    }
    if (showAxisY && yAxVisible && yLab) {
      ctx.font = 'italic 700 15px ' + FONT;
      ctx.fillStyle = axisColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      var labYY = mapY(yAxVisE);
      ctx.fillText(yLab, axisXPos + 8, labYY + 8);
    }

    /* ---- 函数标签 ---- */
    funcs.forEach(function (f) {
      if (!f.visible) return;
      var text = (f.label && f.label.trim()) ? f.label.trim() : ('y = ' + (f.expr || '').trim());
      if (!text || text === 'y =') return;

      var size = f.lsize || 15;
      ctx.font = '700 ' + size + 'px ' + FONT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      var lx = (typeof f.lx === 'number' ? f.lx : 0.84) * W;
      var ly = (typeof f.ly === 'number' ? f.ly : 0.12) * H;
      var tw = ctx.measureText(text).width;

      hitBoxes.push({
        kind: 'label', id: f.id,
        x: lx - 6, y: ly - size * 0.75,
        w: tw + 12, h: size * 1.5,
        ax: lx, ay: ly
      });

      ctx.lineWidth = Math.max(3, size * 0.26);
      ctx.strokeStyle = 'rgba(255,255,255,.92)';
      ctx.lineJoin = 'round';
      ctx.strokeText(text, lx, ly);
      ctx.fillStyle = f.color;
      ctx.fillText(text, lx, ly);
    });

    /* ---- 图像标题 ---- */
    var titleText = String(val('fpTitle', '')).trim();
    if (titleText) {
      var tSize  = Math.max(8, num('fpTitleSize', 20));
      var tColor = val('fpTitleColor', '#3a2a00');
      ctx.font = '800 ' + tSize + 'px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      var tpx = titlePos.x * W;
      var tpy = titlePos.y * H;
      var ttw = ctx.measureText(titleText).width;

      hitBoxes.push({
        kind: 'title', id: 'title',
        x: tpx - ttw / 2 - 8, y: tpy - tSize * 0.75,
        w: ttw + 16, h: tSize * 1.5,
        ax: tpx, ay: tpy
      });

      ctx.lineWidth = Math.max(3, tSize * 0.24);
      ctx.strokeStyle = 'rgba(255,255,255,.92)';
      ctx.lineJoin = 'round';
      ctx.strokeText(titleText, tpx, tpy);
      ctx.fillStyle = tColor;
      ctx.fillText(titleText, tpx, tpy);
    }
  }

  /* ---------- 画箭头 ---------- */
  function drawArrow(x, y, angle, size, color) {
    var a = size;
    var b = size * 0.42;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-a, -b);
    ctx.lineTo(-a * 0.68, 0);
    ctx.lineTo(-a, b);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /* ---------- 命中检测 ---------- */
  function hitTest(x, y) {
    for (var i = hitBoxes.length - 1; i >= 0; i--) {
      var b = hitBoxes[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
    }
    return null;
  }

  /* ---------- 拖拽 ---------- */
  canvas.addEventListener('pointerdown', function (e) {
    var p = getPos(e);
    var hit = hitTest(p.x, p.y);
    if (!hit) return;

    e.preventDefault();
    drag = { box: hit, offX: p.x - hit.ax, offY: p.y - hit.ay };

    canvas.classList.add('fp-dragging');
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });

  canvas.addEventListener('pointermove', function (e) {
    var p = getPos(e);

    if (drag) {
      e.preventDefault();
      var nx = p.x - drag.offX;
      var ny = p.y - drag.offY;

      if (drag.box.kind === 'title') {
        titlePos.x = clamp(nx / logicalW, 0, 1);
        titlePos.y = clamp(ny / logicalH, 0, 1);
        syncTitleInputs();
      } else {
        var f = null;
        for (var i = 0; i < funcs.length; i++) {
          if (funcs[i].id === drag.box.id) { f = funcs[i]; break; }
        }
        if (f) {
          f.lx = clamp(nx / logicalW, 0, 1);
          f.ly = clamp(ny / logicalH, 0, 1);
        }
      }
      scheduleRender();
      return;
    }

    var hover = hitTest(p.x, p.y);
    var nowHover = hover ? 1 : 0;
    if (nowHover !== (hoverEl ? 1 : 0)) {
      hoverEl = hover;
      canvas.classList.toggle('fp-hover', !!hover);
    }
  });

  ['pointerup', 'pointercancel'].forEach(function (evt) {
    canvas.addEventListener(evt, function () {
      if (!drag) return;
      drag = null;
      canvas.classList.remove('fp-dragging');
      save();
    });
  });

  /* ---------- 滚轮缩放标题 / 标签 ---------- */
  canvas.addEventListener('wheel', function (e) {
    var p = getPos(e);
    var hit = hitTest(p.x, p.y);
    if (!hit) return;

    e.preventDefault();
    var delta = e.deltaY > 0 ? -2 : 2;

    if (hit.kind === 'title') {
      var cur = num('fpTitleSize', 20);
      var next = clamp(cur + delta, 10, 72);
      var el = $id('fpTitleSize');
      if (el) el.value = String(next);
    } else {
      for (var i = 0; i < funcs.length; i++) {
        if (funcs[i].id === hit.id) {
          funcs[i].lsize = clamp((funcs[i].lsize || 15) + delta, 10, 72);
          break;
        }
      }
    }
    scheduleRender();
    save();
  }, { passive: false });

  /* ---------- 标题位置同步到输入框 ---------- */
  function syncTitleInputs() {
    var ex = $id('fpTitleX'), ey = $id('fpTitleY');
    if (ex) ex.value = titlePos.x.toFixed(3);
    if (ey) ey.value = titlePos.y.toFixed(3);
  }

  /* ============================================================
     函数列表 UI
     ============================================================ */
  function newFunc(expr, color) {
    return {
      id: 'fp' + Date.now() + Math.random().toString(36).slice(2, 6),
      expr: expr || '',
      color: color || PALETTE[(paletteIdx++) % PALETTE.length],
      label: '',
      visible: true,
      lx: 0.84,
      ly: 0.12,
      lsize: 15
    };
  }

  function renderFuncList() {
    var list = $id('fpFuncList');
    if (!list) return;

    if (!funcs.length) {
      list.innerHTML = '<p class="empty" style="padding:20px 0;">还没有函数，点击下方「添加函数」开始吧～</p>';
      return;
    }

    list.innerHTML = funcs.map(function (f) {
      var bad = compileExpr(f.expr) ? '' : ' fp-invalid';
      return '' +
        '<div class="fp-func-row" data-fid="' + f.id + '">' +
          '<div class="fp-func-main">' +
            '<input type="color" class="fp-func-color" value="' + fpEsc(f.color) + '" title="曲线颜色">' +
            '<span class="fp-func-eq">y =</span>' +
            '<input type="text" class="fp-func-input' + bad + '" value="' + fpEsc(f.expr) + '" placeholder="如：sin(x)、x^2、1/x" spellcheck="false">' +
          '</div>' +
          '<div class="fp-func-sub">' +
            '<input type="text" class="fp-func-label" value="' + fpEsc(f.label) + '" placeholder="图像标签（留空显示 y = 表达式）">' +
            '<label class="fp-mini-check"><input type="checkbox" class="fp-func-vis"' + (f.visible ? ' checked' : '') + '><span>显示</span></label>' +
            '<button class="mini-btn danger fp-func-del" type="button">删除</button>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  function bindFuncList() {
    var list = $id('fpFuncList');
    if (!list) return;

    list.addEventListener('input', function (e) {
      var row = e.target.closest('.fp-func-row');
      if (!row) return;
      var f = null;
      for (var i = 0; i < funcs.length; i++) {
        if (funcs[i].id === row.dataset.fid) { f = funcs[i]; break; }
      }
      if (!f) return;

      var t = e.target;
      if (t.classList.contains('fp-func-input')) {
        f.expr = t.value;
        t.classList.toggle('fp-invalid', !compileExpr(t.value));
        scheduleRender();
      } else if (t.classList.contains('fp-func-label')) {
        f.label = t.value;
        scheduleRender();
      } else if (t.classList.contains('fp-func-color')) {
        f.color = t.value;
        scheduleRender();
      } else if (t.classList.contains('fp-func-vis')) {
        f.visible = t.checked;
        scheduleRender();
      }
      save();
    });

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.fp-func-del');
      if (!btn) return;
      var row = btn.closest('.fp-func-row');
      if (!row) return;
      if (funcs.length <= 1) { showToast('至少保留一个函数'); return; }
      funcs = funcs.filter(function (x) { return x.id !== row.dataset.fid; });
      renderFuncList();
      scheduleRender();
      save();
    });
  }

  /* ============================================================
     持久化
     ============================================================ */
  var SAVE_FIELDS = [
    'fpXMin','fpXMax','fpYMin','fpYMax','fpXLabel','fpYLabel','fpAxisWidth',
    'fpXAxisStart','fpXAxisEnd','fpYAxisStart','fpYAxisEnd',
    'fpArrowSize','fpTickWidth','fpTickLen','fpTickFont','fpXTickStep','fpYTickStep',
    'fpLineWidth','fpTitle','fpTitleSize','fpTitleColor','fpTitleX','fpTitleY'
  ];
  var SAVE_CHECKS  = ['fpAxisX','fpAxisY','fpArrowX','fpArrowY','fpTickShow','fpTickNum'];
  var SAVE_SELECTS = ['fpTickDir','fpSmooth'];

  function save() {
    if (!inited) return;
    try {
      var data = {
        funcs: funcs,
        fields: {}, checks: {}, selects: {}
      };
      SAVE_FIELDS.forEach(function (id) {
        var el = $id(id);
        if (el) data.fields[id] = el.value;
      });
      SAVE_CHECKS.forEach(function (id) {
        var el = $id(id);
        if (el) data.checks[id] = el.checked;
      });
      SAVE_SELECTS.forEach(function (id) {
        var el = $id(id);
        if (el) data.selects[id] = el.value;
      });
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function load() {
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (!raw) return false;

    var data;
    try { data = JSON.parse(raw); } catch (e) { return false; }
    if (!data || typeof data !== 'object') return false;

    if (Array.isArray(data.funcs) && data.funcs.length) {
      funcs = data.funcs.map(function (f) {
        return {
          id: f.id || ('fp' + Date.now() + Math.random().toString(36).slice(2, 6)),
          expr: typeof f.expr === 'string' ? f.expr : '',
          color: f.color || PALETTE[0],
          label: typeof f.label === 'string' ? f.label : '',
          visible: f.visible !== false,
          lx: typeof f.lx === 'number' ? f.lx : 0.84,
          ly: typeof f.ly === 'number' ? f.ly : 0.12,
          lsize: typeof f.lsize === 'number' ? f.lsize : 15
        };
      });
    }

    if (data.fields) {
      Object.keys(data.fields).forEach(function (id) {
        var el = $id(id);
        if (el) el.value = data.fields[id];
      });
    }
    if (data.checks) {
      Object.keys(data.checks).forEach(function (id) {
        var el = $id(id);
        if (el) el.checked = !!data.checks[id];
      });
    }
    if (data.selects) {
      Object.keys(data.selects).forEach(function (id) {
        var el = $id(id);
        if (el) el.value = data.selects[id];
      });
    }

    var tx = num('fpTitleX', 0.5), ty = num('fpTitleY', 0.075);
    titlePos.x = clamp(tx, 0, 1);
    titlePos.y = clamp(ty, 0, 1);
    return true;
  }

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    if (inited) return;
    inited = true;

    var restored = load();
    if (!restored || !funcs.length) {
      funcs = [
        newFunc('sin(x)', PALETTE[0]),
        newFunc('0.5*x', PALETTE[1])
      ];
      funcs[0].ly = 0.12;
      funcs[1].ly = 0.21;
      var t = $id('fpTitle');
      if (t && !t.value) t.value = '函数图像';
    }

    renderFuncList();
    bindFuncList();

    /* ---- 子标签切换 ---- */
    document.querySelectorAll('#page-funcplot .ta-subtab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#page-funcplot .ta-subtab').forEach(function (t) {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        var target = tab.dataset.fp;
        document.querySelectorAll('#page-funcplot .ta-subpage').forEach(function (p) {
          p.classList.toggle('active', p.dataset.fpPage === target);
        });
      });
    });

    /* ---- 所有配置项变化 → 重绘 ---- */
    var bindIds = SAVE_FIELDS.concat(SAVE_SELECTS);
    bindIds.forEach(function (id) {
      var el = $id(id);
      if (!el) return;
      el.addEventListener('input', function () {
        if (id === 'fpTitleX') titlePos.x = clamp(parseFloat(el.value) || 0, 0, 1);
        if (id === 'fpTitleY') titlePos.y = clamp(parseFloat(el.value) || 0, 0, 1);
        scheduleRender();
        save();
      });
      el.addEventListener('change', function () {
        scheduleRender();
        save();
      });
    });
    SAVE_CHECKS.forEach(function (id) {
      var el = $id(id);
      if (!el) return;
      el.addEventListener('change', function () {
        scheduleRender();
        save();
      });
    });

    /* ---- 添加 / 示例 / 清空 ---- */
    var addBtn = $id('fpAddFunc');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var f = newFunc('', PALETTE[(paletteIdx++) % PALETTE.length]);
        f.ly = clamp(0.12 + funcs.length * 0.075, 0.06, 0.86);
        funcs.push(f);
        renderFuncList();
        scheduleRender();
        save();
        var rows = document.querySelectorAll('#fpFuncList .fp-func-row');
        var last = rows[rows.length - 1];
        if (last) {
          var inp = last.querySelector('.fp-func-input');
          if (inp) inp.focus();
        }
      });
    }

    var sampleBtn = $id('fpSample');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', function () {
        funcs = [
          newFunc('sin(x)', PALETTE[0]),
          newFunc('cos(x)', PALETTE[1]),
          newFunc('0.3*x', PALETTE[2])
        ];
        funcs[0].ly = 0.12;
        funcs[1].ly = 0.21;
        funcs[2].ly = 0.30;
        setField('fpXMin', '-10'); setField('fpXMax', '10');
        setField('fpYMin', '-2');  setField('fpYMax', '2');
        setField('fpTitle', '三角函数对比');
        renderFuncList();
        scheduleRender();
        save();
        showToast('已载入示例');
      });
    }

    var clearBtn = $id('fpClearFuncs');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!confirm('确定清空全部函数吗？')) return;
        funcs = [newFunc('', PALETTE[0])];
        renderFuncList();
        scheduleRender();
        save();
      });
    }

    /* ---- 快速范围 ---- */
    document.querySelectorAll('#page-funcplot [data-fp-range]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parts = btn.dataset.fpRange.split(',');
        if (parts.length !== 4) return;
        setField('fpXMin', parts[0]);
        setField('fpXMax', parts[1]);
        setField('fpYMin', parts[2]);
        setField('fpYMax', parts[3]);
        scheduleRender();
        save();
      });
    });

    /* ---- 快速设置坐标轴范围 ---- */
    document.querySelectorAll('#page-funcplot [data-fp-axis-range]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var xMinV = num('fpXMin', -10), xMaxV = num('fpXMax', 10);
        var yMinV = num('fpYMin', -6),  yMaxV = num('fpYMax', 6);
        var mode = btn.dataset.fpAxisRange;
        var xs = '', xe = '', ys = '', ye = '';

        if (mode === 'full') {
          // 留空 = 跟随视图
        } else if (mode === 'half') {
          xs = String(xMinV); xe = String((xMinV + xMaxV) / 2);
          ys = String(yMinV); ye = String((yMinV + yMaxV) / 2);
        } else if (mode === 'positive') {
          xs = '0'; xe = String(xMaxV);
          ys = '0'; ye = String(yMaxV);
        } else if (mode === 'unit') {
          xs = '-1'; xe = '1';
          ys = '-1'; ye = '1';
        }

        setField('fpXAxisStart', xs);
        setField('fpXAxisEnd',   xe);
        setField('fpYAxisStart', ys);
        setField('fpYAxisEnd',   ye);

        scheduleRender();
        save();
        showToast('已应用坐标轴范围');
      });
    });

    /* ---- 重置标签位置 ---- */
    function resetLabels() {
      funcs.forEach(function (f, i) {
        f.lx = 0.84;
        f.ly = clamp(0.12 + i * 0.075, 0.06, 0.86);
      });
      titlePos.x = 0.5;
      titlePos.y = 0.075;
      syncTitleInputs();
      scheduleRender();
      save();
      showToast('标签位置已重置');
    }
    var rl1 = $id('fpResetLabels');
    var rl2 = $id('fpResetLabels2');
    if (rl1) rl1.addEventListener('click', resetLabels);
    if (rl2) rl2.addEventListener('click', resetLabels);

    /* ---- 导出 PNG ---- */
    var expBtn = $id('fpExportPng');
    if (expBtn) {
      expBtn.addEventListener('click', function () {
        var d = new Date();
        var name = '函数图像_' +
          d.getFullYear() + fpPad2(d.getMonth() + 1) + fpPad2(d.getDate()) + '_' +
          fpPad2(d.getHours()) + fpPad2(d.getMinutes()) + '.png';

        if (canvas.toBlob) {
          canvas.toBlob(function (blob) {
            if (!blob) { showToast('导出失败，请重试'); return; }
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
            showToast('已导出 PNG');
          }, 'image/png');
        } else {
          var a2 = document.createElement('a');
          a2.href = canvas.toDataURL('image/png');
          a2.download = name;
          document.body.appendChild(a2);
          a2.click();
          document.body.removeChild(a2);
          showToast('已导出 PNG');
        }
      });
    }

    /* ---- 窗口尺寸变化 ---- */
    window.addEventListener('resize', function () {
      if (!inited) return;
      var page = $id('page-funcplot');
      if (page && page.classList.contains('active')) scheduleRender();
    });

    render();
    save();
  }

  function setField(id, v) {
    var el = $id(id);
    if (el) el.value = v;
  }

  window.__funcplotInit = init;

  var pageEl = document.getElementById('page-funcplot');
  if (pageEl && pageEl.classList.contains('active')) init();

  console.log('[函数图像绘制] 已加载');
})();