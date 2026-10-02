/* ============================================================
   地球模块 · 岁窦工具箱 V4.0
   公转与四季 / 自转 / 板块构造 / 经纬度距离
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-earthmodule');
  if (!page) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function safeCall(fn, label) {
    try { if (typeof fn === 'function') fn(); }
    catch (e) { console.error('[地球模块] ' + label + ' 出错：', e); }
  }

  /* ============================================================
     子标签切换
     ============================================================ */
  document.querySelectorAll('#page-earthmodule .ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#page-earthmodule .ta-subtab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.earth;
      document.querySelectorAll('#page-earthmodule .ta-subpage').forEach(function (p) {
        p.classList.toggle('active', p.dataset.earthPage === target);
      });
      if (target === 'seasons')  setTimeout(function () { safeCall(drawOrbit, '公转绘制'); }, 40);
      if (target === 'rotation') setTimeout(function () { safeCall(drawRotation, '自转绘制'); }, 40);
      if (target === 'plates')   setTimeout(function () { safeCall(drawPlates, '板块绘制'); }, 40);
    });
  });

  /* ============================================================
     一、公转与四季
     ============================================================ */
  var orbitSvg = document.getElementById('earthOrbitSvg');
  var daySlider = document.getElementById('earthDay');
  var dayValEl  = document.getElementById('earthDayVal');
  var infoGrid  = document.getElementById('earthInfoGrid');
  var seasonCardsEl = document.getElementById('earthSeasonCards');

  var SEASONS = [
    { day: 80,  name: '春分', date: '3 月 21 日前后', desc: '太阳直射赤道，全球昼夜等长。北半球进入春季，南半球进入秋季。' },
    { day: 172, name: '夏至', date: '6 月 22 日前后', desc: '太阳直射北回归线（23.5°N），北半球昼最长夜最短。北极圈内出现极昼。' },
    { day: 266, name: '秋分', date: '9 月 23 日前后', desc: '太阳直射赤道，全球昼夜等长。北半球进入秋季，南半球进入春季。' },
    { day: 356, name: '冬至', date: '12 月 22 日前后', desc: '太阳直射南回归线（23.5°S），北半球昼最短夜最长。北极圈内出现极夜。' }
  ];

  function declinationOf(day) {
    return 23.5 * Math.sin(2 * Math.PI * (day - 80) / 365.24);
  }
  function seasonOfNorth(day) {
    if (day >= 80 && day < 172) return '春季';
    if (day >= 172 && day < 266) return '夏季';
    if (day >= 266 && day < 356) return '秋季';
    return '冬季';
  }
  function daylightOfNorth(lat, day) {
    var decl = declinationOf(day);
    var latRad = lat * Math.PI / 180;
    var declRad = decl * Math.PI / 180;
    var cosH = -Math.tan(latRad) * Math.tan(declRad);
    if (cosH >= 1) return 0;
    if (cosH <= -1) return 24;
    var H = Math.acos(cosH) * 180 / Math.PI;
    return H / 15;
  }

  function drawOrbit() {
    if (!orbitSvg || !daySlider) return;
    var day = parseInt(daySlider.value, 10);
    var svgNS = 'http://www.w3.org/2000/svg';

    while (orbitSvg.firstChild) orbitSvg.removeChild(orbitSvg.firstChild);

    var cx = 260, cy = 180, rx = 190, ry = 120;

    var orbit = document.createElementNS(svgNS, 'ellipse');
    orbit.setAttribute('cx', cx);
    orbit.setAttribute('cy', cy);
    orbit.setAttribute('rx', rx);
    orbit.setAttribute('ry', ry);
    orbit.setAttribute('fill', 'none');
    orbit.setAttribute('stroke', 'rgba(245,179,1,.5)');
    orbit.setAttribute('stroke-width', '1.5');
    orbit.setAttribute('stroke-dasharray', '4 4');
    orbitSvg.appendChild(orbit);

    var sunGlow = document.createElementNS(svgNS, 'circle');
    sunGlow.setAttribute('cx', cx);
    sunGlow.setAttribute('cy', cy);
    sunGlow.setAttribute('r', '34');
    sunGlow.setAttribute('fill', 'rgba(255,179,1,.18)');
    orbitSvg.appendChild(sunGlow);

    var sun = document.createElementNS(svgNS, 'circle');
    sun.setAttribute('cx', cx);
    sun.setAttribute('cy', cy);
    sun.setAttribute('r', '20');
    sun.setAttribute('fill', '#f5b301');
    sun.setAttribute('stroke', '#b47c00');
    sun.setAttribute('stroke-width', '2');
    orbitSvg.appendChild(sun);

    var sunText = document.createElementNS(svgNS, 'text');
    sunText.setAttribute('x', cx);
    sunText.setAttribute('y', cy + 5);
    sunText.setAttribute('text-anchor', 'middle');
    sunText.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
    sunText.setAttribute('font-size', '13');
    sunText.setAttribute('font-weight', '900');
    sunText.setAttribute('fill', '#fff');
    sunText.textContent = '太阳';
    orbitSvg.appendChild(sunText);

    var theta = 2 * Math.PI * (day - 80) / 365.24;
    var earthX = cx + rx * Math.cos(theta);
    var earthY = cy - ry * Math.sin(theta);
    var earthR = 16;

    var marks = [
      { day: 80,  label: '春分' },
      { day: 172, label: '夏至' },
      { day: 266, label: '秋分' },
      { day: 356, label: '冬至' }
    ];
    marks.forEach(function (m) {
      var t = 2 * Math.PI * (m.day - 80) / 365.24;
      var mx = cx + rx * Math.cos(t);
      var my = cy - ry * Math.sin(t);
      var marker = document.createElementNS(svgNS, 'circle');
      marker.setAttribute('cx', mx);
      marker.setAttribute('cy', my);
      marker.setAttribute('r', '3');
      marker.setAttribute('fill', '#b47c00');
      marker.setAttribute('opacity', '0.5');
      orbitSvg.appendChild(marker);
    });

    var dx = earthX - cx, dy = earthY - cy;
    var len = Math.sqrt(dx * dx + dy * dy);
    var ux = dx / len, uy = dy / len;
    var startX = cx + ux * 36;
    var startY = cy + uy * 36;
    var endX = earthX - ux * (earthR + 4);
    var endY = earthY - uy * (earthR + 4);

    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    line.setAttribute('stroke', '#c0524a');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5 3');
    line.setAttribute('opacity', '0.85');
    orbitSvg.appendChild(line);

    var gEarth = document.createElementNS(svgNS, 'g');
    gEarth.setAttribute('transform', 'translate(' + earthX + ' ' + earthY + ')');

    var earth = document.createElementNS(svgNS, 'circle');
    earth.setAttribute('r', earthR);
    earth.setAttribute('fill', '#a8c8ef');
    earth.setAttribute('stroke', '#4a7fb5');
    earth.setAttribute('stroke-width', '1.5');
    gEarth.appendChild(earth);

    var tilt = -23.5 * Math.PI / 180;
    var eq = document.createElementNS(svgNS, 'line');
    eq.setAttribute('x1', -earthR * Math.cos(tilt));
    eq.setAttribute('y1', -earthR * Math.sin(tilt));
    eq.setAttribute('x2', earthR * Math.cos(tilt));
    eq.setAttribute('y2', earthR * Math.sin(tilt));
    eq.setAttribute('stroke', '#3f5a6b');
    eq.setAttribute('stroke-width', '1');
    eq.setAttribute('opacity', '0.7');
    gEarth.appendChild(eq);

    orbitSvg.appendChild(gEarth);

    var dateLabel = document.createElementNS(svgNS, 'text');
    var labelX = earthX + 24;
    var labelY = earthY + 4;
    if (earthX > cx) {
      dateLabel.setAttribute('text-anchor', 'start');
    } else {
      dateLabel.setAttribute('text-anchor', 'end');
      labelX = earthX - 24;
    }
    dateLabel.setAttribute('x', labelX);
    dateLabel.setAttribute('y', labelY);
    dateLabel.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
    dateLabel.setAttribute('font-size', '12');
    dateLabel.setAttribute('font-weight', '800');
    dateLabel.setAttribute('fill', '#3a2a00');
    dateLabel.textContent = '第 ' + day + ' 天';
    orbitSvg.appendChild(dateLabel);

    var north = document.createElementNS(svgNS, 'text');
    north.setAttribute('x', '14');
    north.setAttribute('y', '24');
    north.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
    north.setAttribute('font-size', '12');
    north.setAttribute('font-weight', '800');
    north.setAttribute('fill', '#9c8a5a');
    north.textContent = '北 ↑';
    orbitSvg.appendChild(north);

    updateSeasonInfo(day);
  }

  function updateSeasonInfo(day) {
    if (dayValEl) dayValEl.textContent = '第 ' + day + ' 天';
    var decl = declinationOf(day);
    var northSeason = seasonOfNorth(day);
    var northDaylight = daylightOfNorth(40, day);

    if (infoGrid) {
      infoGrid.innerHTML =
        '<div class="earth-info-card">' +
          '<div class="earth-info-label">太阳直射点</div>' +
          '<div class="earth-info-value">' + decl.toFixed(2) + '°</div>' +
          '<div class="earth-info-sub">' + (Math.abs(decl) < 0.5 ? '赤道' : (decl > 0 ? '北半球' : '南半球')) + '</div>' +
        '</div>' +
        '<div class="earth-info-card">' +
          '<div class="earth-info-label">北半球季节</div>' +
          '<div class="earth-info-value">' + northSeason + '</div>' +
          '<div class="earth-info-sub">南半球相反</div>' +
        '</div>' +
        '<div class="earth-info-card">' +
          '<div class="earth-info-label">40°N 昼长</div>' +
          '<div class="earth-info-value">' + northDaylight.toFixed(2) + ' 小时</div>' +
          '<div class="earth-info-sub">' + (northDaylight > 12 ? '昼长夜短' : (northDaylight < 12 ? '昼短夜长' : '昼夜等长')) + '</div>' +
        '</div>' +
        '<div class="earth-info-card">' +
          '<div class="earth-info-label">极昼范围</div>' +
          '<div class="earth-info-value">' + (decl > 0.5 ? (90 - decl).toFixed(1) + '°N 以北' : (decl < -0.5 ? (90 + decl).toFixed(1) + '°S 以南' : '无')) + '</div>' +
          '<div class="earth-info-sub">' + (decl > 0.5 ? '北极圈内极昼' : (decl < -0.5 ? '南极圈内极昼' : '全球昼夜平分')) + '</div>' +
        '</div>';
    }

    if (seasonCardsEl) {
      seasonCardsEl.innerHTML = SEASONS.map(function (s) {
        var isActive = Math.abs(s.day - day) <= 3;
        return '<div class="earth-season-card' + (isActive ? ' active' : '') + '" data-earth-day="' + s.day + '">' +
          '<h4 class="earth-season-name">' + esc(s.name) + '</h4>' +
          '<div class="earth-season-date">' + esc(s.date) + '</div>' +
          '<p class="earth-season-desc">' + esc(s.desc) + '</p>' +
        '</div>';
      }).join('');

      seasonCardsEl.querySelectorAll('.earth-season-card').forEach(function (card) {
        card.addEventListener('click', function () {
          var d = parseInt(card.dataset.earthDay, 10);
          if (daySlider) daySlider.value = d;
          drawOrbit();
        });
      });
    }
  }

  if (daySlider) {
    daySlider.addEventListener('input', function () { drawOrbit(); });
  }
  document.querySelectorAll('#page-earthmodule [data-earth-day]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = parseInt(btn.dataset.earthDay, 10);
      if (daySlider) daySlider.value = d;
      drawOrbit();
    });
  });

  /* ============================================================
     二、自转
     ============================================================ */
  var rotSvgEl    = document.getElementById('earthRotSvg');
  var rotPlayBtn  = document.getElementById('earthRotPlay');
  var rotResetBtn = document.getElementById('earthRotReset');
  var rotTimeEl   = document.getElementById('earthRotTime');
  var rotHintEl   = document.getElementById('earthRotHint');
  var rotInfoEl   = document.getElementById('earthRotInfo');
  var rotParamsEl = document.getElementById('earthRotParams');
  var speedBodyEl = document.getElementById('earthSpeedBody');

  var rotView   = 'north';
  var rotAngle  = 0;         /* 0 ~ 360 度，对应 0:00 ~ 24:00 */
  var rotRunning = false;
  var rotLastTs  = 0;
  var rotRafId   = null;
  var ROT_PERIOD_MS = 12000; /* 完整自转一圈耗时 12 秒 */

  function mkSVG(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function angleToTime(deg) {
    /* deg 0 ~ 360 对应 0:00 ~ 24:00 */
    var totalMin = Math.round((deg / 360) * 24 * 60) % (24 * 60);
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    return h + ':' + (m < 10 ? '0' + m : m);
  }

  function drawRotation() {
    if (!rotSvgEl) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    while (rotSvgEl.firstChild) rotSvgEl.removeChild(rotSvgEl.firstChild);

    var cx = 240, cy = 190, R = 118;
    var isNorth = rotView === 'north';

    /* defs：箭头 marker */
    var defs = mkSVG('defs', {});
    var marker = mkSVG('marker', {
      id: 'rotArrowHead',
      viewBox: '0 0 10 10',
      refX: 9, refY: 5,
      markerWidth: 6, markerHeight: 6,
      orient: 'auto'
    });
    marker.appendChild(mkSVG('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#b47c00' }));
    defs.appendChild(marker);
    rotSvgEl.appendChild(defs);

    /* 外层光晕 */
    rotSvgEl.appendChild(mkSVG('circle', {
      cx: cx, cy: cy, r: R + 26,
      fill: 'rgba(168,200,239,.16)'
    }));

    /* 昼夜半球（假设太阳在右侧） */
    /* 白天半球（右半圆） */
    var dayPath = document.createElementNS(svgNS, 'path');
    dayPath.setAttribute('d',
      'M ' + cx + ' ' + (cy - R) +
      ' A ' + R + ' ' + R + ' 0 0 1 ' + cx + ' ' + (cy + R) +
      ' Z'
    );
    dayPath.setAttribute('fill', '#a8c8ef');
    dayPath.setAttribute('fill-opacity', '0.92');
    rotSvgEl.appendChild(dayPath);

    /* 黑夜半球（左半圆） */
    var nightPath = document.createElementNS(svgNS, 'path');
    nightPath.setAttribute('d',
      'M ' + cx + ' ' + (cy - R) +
      ' A ' + R + ' ' + R + ' 0 0 0 ' + cx + ' ' + (cy + R) +
      ' Z'
    );
    nightPath.setAttribute('fill', '#3f5a6b');
    nightPath.setAttribute('fill-opacity', '0.92');
    rotSvgEl.appendChild(nightPath);

    /* 昼夜分界虚线 */
    rotSvgEl.appendChild(mkSVG('line', {
      x1: cx, y1: cy - R,
      x2: cx, y2: cy + R,
      stroke: '#f5b301',
      'stroke-width': 1.5,
      'stroke-dasharray': '5 4',
      opacity: 0.85
    }));

    /* 经线：12 条从中心到圆周，随 rotAngle 旋转 */
    /* 北极视角：地球自西向东，从北极上空看是逆时针，对应经线逆时针转动 */
    /* 我们直接用 rotAngle 作为基准，逆时针为正 */
    var lineCount = 12;
    for (var i = 0; i < lineCount; i++) {
      var baseAng = (i * (360 / lineCount));
      /* 数学角度，逆时针为正；north 逆时针 -> +rotAngle；south 顺时针 -> -rotAngle */
      var angDeg = baseAng + (isNorth ? rotAngle : -rotAngle);
      var angRad = angDeg * Math.PI / 180;
      /* 数学坐标转 SVG 坐标 */
      var x2 = cx + R * Math.cos(angRad);
      var y2 = cy - R * Math.sin(angRad);
      rotSvgEl.appendChild(mkSVG('line', {
        x1: cx, y1: cy,
        x2: x2, y2: y2,
        stroke: 'rgba(255,255,255,.55)',
        'stroke-width': 1.2
      }));
    }

    /* 地球外轮廓 */
    rotSvgEl.appendChild(mkSVG('circle', {
      cx: cx, cy: cy, r: R,
      fill: 'none',
      stroke: '#4a7fb5',
      'stroke-width': 2
    }));

    /* 极点 */
    rotSvgEl.appendChild(mkSVG('circle', {
      cx: cx, cy: cy, r: 5,
      fill: '#3a2a00',
      stroke: '#fff',
      'stroke-width': 2
    }));

    /* 极点标签 */
    var poleLabel = document.createElementNS(svgNS, 'text');
    poleLabel.setAttribute('x', cx + 10);
    poleLabel.setAttribute('y', cy + 4);
    poleLabel.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
    poleLabel.setAttribute('font-size', '12');
    poleLabel.setAttribute('font-weight', '900');
    poleLabel.setAttribute('fill', '#3a2a00');
    poleLabel.textContent = isNorth ? 'N' : 'S';
    rotSvgEl.appendChild(poleLabel);

    /* 自转方向弧线箭头（画在圆外） */
    var arcR = R + 32;
    /* 北极：逆时针 -> 起点在数学角度 30°，终点在 150°，扫过逆时针方向 */
    /* 南极：顺时针 */
    var a1 = (isNorth ? 30 : 30) * Math.PI / 180;
    var a2 = (isNorth ? 150 : 150) * Math.PI / 180;
    var p1x = cx + arcR * Math.cos(a1);
    var p1y = cy - arcR * Math.sin(a1);
    var p2x = cx + arcR * Math.cos(a2);
    var p2y = cy - arcR * Math.sin(a2);
    /* SVG 中 sweep=1 是顺时针，sweep=0 是逆时针 */
    var sweep = isNorth ? 0 : 1;
    var arcD = 'M ' + p1x + ' ' + p1y + ' A ' + arcR + ' ' + arcR + ' 0 0 ' + sweep + ' ' + p2x + ' ' + p2y;

    var arcPath = document.createElementNS(svgNS, 'path');
    arcPath.setAttribute('d', arcD);
    arcPath.setAttribute('fill', 'none');
    arcPath.setAttribute('stroke', '#b47c00');
    arcPath.setAttribute('stroke-width', 2.4);
    arcPath.setAttribute('stroke-linecap', 'round');
    arcPath.setAttribute('marker-end', 'url(#rotArrowHead)');
    rotSvgEl.appendChild(arcPath);

    /* 太阳位置标签（圆外右侧） */
    var sunLabel = document.createElementNS(svgNS, 'text');
    sunLabel.setAttribute('x', cx + R + 50);
    sunLabel.setAttribute('y', cy + 4);
    sunLabel.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
    sunLabel.setAttribute('font-size', '13');
    sunLabel.setAttribute('font-weight', '900');
    sunLabel.setAttribute('fill', '#c0524a');
    sunLabel.setAttribute('text-anchor', 'middle');
    sunLabel.textContent = '☀ 太阳光';
    rotSvgEl.appendChild(sunLabel);

    /* 太阳光线 */
    for (var k = 0; k < 5; k++) {
      var yOff = (k - 2) * 22;
      rotSvgEl.appendChild(mkSVG('line', {
        x1: cx + R + 36,
        y1: cy + yOff,
        x2: cx + R + 16,
        y2: cy + yOff,
        stroke: '#c0524a',
        'stroke-width': 1.6,
        'stroke-dasharray': '3 3',
        opacity: 0.7
      }));
    }

    /* 昼夜标注 */
    var dayLabel = document.createElementNS(svgNS, 'text');
    dayLabel.setAttribute('x', cx + R * 0.55);
    dayLabel.setAttribute('y', cy - R * 0.55);
    dayLabel.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
    dayLabel.setAttribute('font-size', '13');
    dayLabel.setAttribute('font-weight', '900');
    dayLabel.setAttribute('fill', '#3f5a6b');
    dayLabel.setAttribute('text-anchor', 'middle');
    dayLabel.textContent = '昼半球';
    rotSvgEl.appendChild(dayLabel);

    var nightLabel = document.createElementNS(svgNS, 'text');
    nightLabel.setAttribute('x', cx - R * 0.55);
    nightLabel.setAttribute('y', cy - R * 0.55);
    nightLabel.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
    nightLabel.setAttribute('font-size', '13');
    nightLabel.setAttribute('font-weight', '900');
    nightLabel.setAttribute('fill', '#e8eff5');
    nightLabel.setAttribute('text-anchor', 'middle');
    nightLabel.textContent = '夜半球';
    rotSvgEl.appendChild(nightLabel);

    /* 时间显示 */
    if (rotTimeEl) rotTimeEl.textContent = angleToTime(rotAngle);

    /* 提示 */
    if (rotHintEl) {
      rotHintEl.textContent = isNorth
        ? '从北极上空看，自转方向为逆时针（自西向东）'
        : '从南极上空看，自转方向为顺时针（自西向东）';
    }

    /* 更新信息卡与参数 */
    updateRotInfo();
  }

  function updateRotInfo() {
    if (rotInfoEl) {
      rotInfoEl.innerHTML =
        '<div class="earth-info-card">' +
          '<div class="earth-info-label">自转方向</div>' +
          '<div class="earth-info-value">自西向东</div>' +
          '<div class="earth-info-sub">北极看逆时针 · 南极看顺时针</div>' +
        '</div>' +
        '<div class="earth-info-card">' +
          '<div class="earth-info-label">自转周期（恒星日）</div>' +
          '<div class="earth-info-value">23h 56m 4s</div>' +
          '<div class="earth-info-sub">太阳日 = 24 小时</div>' +
        '</div>' +
        '<div class="earth-info-card">' +
          '<div class="earth-info-label">角速度</div>' +
          '<div class="earth-info-value">15° / 小时</div>' +
          '<div class="earth-info-sub">除两极外处处相同</div>' +
        '</div>' +
        '<div class="earth-info-card">' +
          '<div class="earth-info-label">赤道线速度</div>' +
          '<div class="earth-info-value">约 465 m/s</div>' +
          '<div class="earth-info-sub">随纬度降低，两极为 0</div>' +
        '</div>';
    }
  }

  function renderRotParams() {
    if (rotParamsEl) {
      rotParamsEl.innerHTML =
        '<div class="earth-rot-param">' +
          '<div class="earth-rot-param-label">自转方向</div>' +
          '<div class="earth-rot-param-value">自西向东</div>' +
          '<div class="earth-rot-param-sub">北极上空看为逆时针</div>' +
        '</div>' +
        '<div class="earth-rot-param">' +
          '<div class="earth-rot-param-label">自转周期</div>' +
          '<div class="earth-rot-param-value">恒星日 23h56m4s</div>' +
          '<div class="earth-rot-param-sub">太阳日 24 小时</div>' +
        '</div>' +
        '<div class="earth-rot-param">' +
          '<div class="earth-rot-param-label">角速度</div>' +
          '<div class="earth-rot-param-value">15°/小时</div>' +
          '<div class="earth-rot-param-sub">除两极外处处相同</div>' +
        '</div>' +
        '<div class="earth-rot-param">' +
          '<div class="earth-rot-param-label">线速度公式</div>' +
          '<div class="earth-rot-param-value">v = 465 × cos(φ)</div>' +
          '<div class="earth-rot-param-sub">φ 为当地纬度</div>' +
        '</div>';
    }

    if (speedBodyEl) {
      var lats = [0, 15, 30, 45, 60, 75, 90];
      speedBodyEl.innerHTML = lats.map(function (lat) {
        var c = Math.cos(lat * Math.PI / 180);
        var v = 465 * c;
        var note;
        if (lat === 0) note = '赤道，最大';
        else if (lat === 90) note = '极点，为 0';
        else if (lat === 30 || lat === 60) note = '低纬 / 中纬分界';
        else note = '';
        return '<tr>' +
          '<td>' + lat + '°</td>' +
          '<td>' + c.toFixed(3) + '</td>' +
          '<td>' + v.toFixed(0) + ' m/s</td>' +
          '<td>' + note + '</td>' +
        '</tr>';
      }).join('');
    }
  }

  function rotTick(ts) {
    if (!rotRunning) return;
    if (!rotLastTs) rotLastTs = ts;
    var dt = ts - rotLastTs;
    rotLastTs = ts;
    rotAngle = (rotAngle + (dt / ROT_PERIOD_MS) * 360) % 360;
    drawRotation();
    rotRafId = requestAnimationFrame(rotTick);
  }

  function startRotation() {
    if (rotRunning) return;
    rotRunning = true;
    rotLastTs = 0;
    if (rotPlayBtn) rotPlayBtn.textContent = '⏸ 暂停自转';
    rotRafId = requestAnimationFrame(rotTick);
  }
  function stopRotation() {
    rotRunning = false;
    if (rotRafId) { cancelAnimationFrame(rotRafId); rotRafId = null; }
    if (rotPlayBtn) rotPlayBtn.textContent = '▶ 播放自转';
  }

  if (rotPlayBtn) {
    rotPlayBtn.addEventListener('click', function () {
      if (rotRunning) stopRotation();
      else startRotation();
    });
  }
  if (rotResetBtn) {
    rotResetBtn.addEventListener('click', function () {
      stopRotation();
      rotAngle = 0;
      drawRotation();
    });
  }

  document.querySelectorAll('#page-earthmodule [data-earth-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#page-earthmodule [data-earth-view]').forEach(function (t) {
        t.classList.remove('active');
      });
      btn.classList.add('active');
      rotView = btn.dataset.earthView;
      drawRotation();
    });
  });

  /* ---------- 地方时计算 ---------- */
  var lngFromEl = document.getElementById('earthLngFrom');
  var timeFromEl = document.getElementById('earthTimeFrom');
  var lngToEl = document.getElementById('earthLngTo');
  var localMsgEl = document.getElementById('earthLocalMsg');
  var localResEl = document.getElementById('earthLocalResult');

  function parseHHMM(s) {
    var m = String(s || '').trim().match(/^(\d{1,2})[:：](\d{1,2})$/);
    if (!m) return null;
    var h = parseInt(m[1], 10);
    var mi = parseInt(m[2], 10);
    if (h < 0 || h > 23 || mi < 0 || mi > 59) return null;
    return h * 60 + mi;
  }
  function fmtHHMM(min) {
    min = ((min % (24 * 60)) + (24 * 60)) % (24 * 60);
    var h = Math.floor(min / 60);
    var m = min % 60;
    return h + ':' + (m < 10 ? '0' + m : m);
  }
  function lngLabel(v) {
    if (v === 0) return '0°（本初子午线）';
    return Math.abs(v).toFixed(2) + '°' + (v > 0 ? 'E' : 'W');
  }

  function computeLocalTime() {
    if (!localMsgEl || !localResEl) return;
    var lngA = parseFloat(lngFromEl.value);
    var lngB = parseFloat(lngToEl.value);
    var t = parseHHMM(timeFromEl.value);

    if (!isFinite(lngA) || !isFinite(lngB)) {
      localMsgEl.textContent = '请输入有效的经度数值';
      localMsgEl.className = 'earth-dist-msg show err';
      localResEl.innerHTML = '';
      return;
    }
    if (Math.abs(lngA) > 180 || Math.abs(lngB) > 180) {
      localMsgEl.textContent = '经度范围应在 −180° ~ 180° 之间';
      localMsgEl.className = 'earth-dist-msg show err';
      localResEl.innerHTML = '';
      return;
    }
    if (t === null) {
      localMsgEl.textContent = '时间格式应为 12:00 或 12：00';
      localMsgEl.className = 'earth-dist-msg show err';
      localResEl.innerHTML = '';
      return;
    }

    var dLng = lngB - lngA;
    var dMin = dLng / 15 * 60;
    var targetMin = t + dMin;

    var dHour = dLng / 15;
    var dir = dHour > 0 ? '东' : (dHour < 0 ? '西' : '相同');
    var diffText = Math.abs(dHour).toFixed(2) + ' 小时';

    var dayOffset = Math.floor(targetMin / (24 * 60));
    var dayStr = '';
    if (dayOffset === 1) dayStr = '（次日）';
    else if (dayOffset === -1) dayStr = '（前一日）';
    else if (dayOffset > 1) dayStr = '（+' + dayOffset + ' 日）';
    else if (dayOffset < -1) dayStr = '（' + dayOffset + ' 日）';

    localResEl.innerHTML =
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">目标地方时</div>' +
        '<div class="earth-dist-card-value">' + fmtHHMM(targetMin) + dayStr + '</div>' +
        '<div class="earth-dist-card-sub">' + lngLabel(lngB) + '</div>' +
      '</div>' +
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">经度差</div>' +
        '<div class="earth-dist-card-value">' + dLng.toFixed(2) + '°</div>' +
        '<div class="earth-dist-card-sub">' + (lngB > lngA ? 'B 在 A 以东' : lngB < lngA ? 'B 在 A 以西' : '同经度') + '</div>' +
      '</div>' +
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">地方时差</div>' +
        '<div class="earth-dist-card-value">' + diffText + '</div>' +
        '<div class="earth-dist-card-sub">' + dir + '加西减</div>' +
      '</div>' +
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">已知时间</div>' +
        '<div class="earth-dist-card-value">' + fmtHHMM(t) + '</div>' +
        '<div class="earth-dist-card-sub">' + lngLabel(lngA) + '</div>' +
      '</div>';

    localMsgEl.textContent = '计算完成：目标地方时约 ' + fmtHHMM(targetMin) + dayStr;
    localMsgEl.className = 'earth-dist-msg show ok';
  }

  if (document.getElementById('earthLocalRun')) {
    document.getElementById('earthLocalRun').addEventListener('click', computeLocalTime);
  }

  /* ============================================================
     三、板块构造
     ============================================================ */
  var plateSvgEl    = document.getElementById('earthPlateSvg');
  var plateSearchEl = document.getElementById('earthPlateSearch');
  var plateTabsEl   = document.getElementById('earthPlateTabs');
  var plateDetailEl = document.getElementById('earthPlateDetail');

  var PLATES = [
    {
      id: 'eurasian', name: '亚欧板块',
      color: '#ffd5b8',
      tag: '面积最大',
      desc: '包括欧洲和亚洲的大部分地区，是六大板块中面积最大的一个。南界与非洲板块、印度洋板块相邻，东界与太平洋板块相邻，西界与美洲板块相邻。',
      items: [
        { name: '喜马拉雅山脉', role: '与印度洋板块碰撞抬升形成，世界最高山脉' },
        { name: '青藏高原', role: '碰撞抬升形成，世界最高的高原' },
        { name: '阿尔卑斯山脉', role: '与非洲板块碰撞形成' },
        { name: '乌拉尔山脉', role: '亚欧板块内部的古老山脉' },
        { name: '日本海沟', role: '与太平洋板块的俯冲边界' }
      ]
    },
    {
      id: 'african', name: '非洲板块',
      color: '#ffe9a8',
      tag: '含东非大裂谷',
      desc: '包括非洲大陆及其周围海域。北界与亚欧板块碰撞，东界与印度洋板块张裂，是生长边界与消亡边界都有的板块。',
      items: [
        { name: '东非大裂谷', role: '生长边界（张裂），未来可能形成新的海洋' },
        { name: '红海', role: '正在扩张，未来可能变成新大洋' },
        { name: '阿特拉斯山脉', role: '与亚欧板块碰撞形成' },
        { name: '乞力马扎罗山', role: '东非大裂谷附近的火山' }
      ]
    },
    {
      id: 'indian', name: '印度洋板块',
      color: '#ffd76e',
      tag: '含印度与澳大利亚',
      desc: '包括印度半岛、澳大利亚大陆、新西兰及印度洋的大部分。北界与亚欧板块碰撞抬升，形成喜马拉雅山脉和青藏高原。',
      items: [
        { name: '喜马拉雅山脉', role: '与亚欧板块碰撞抬升，世界最高山脉' },
        { name: '青藏高原', role: '碰撞抬升形成，被称为「世界屋脊」' },
        { name: '苏门答腊岛', role: '与巽他海沟相关，多火山地震' },
        { name: '新西兰', role: '太平洋板块与印度洋板块交界处' }
      ]
    },
    {
      id: 'pacific', name: '太平洋板块',
      color: '#a8c8ef',
      tag: '几乎全是海洋',
      desc: '六大板块中唯一几乎全由海洋构成的板块。东界与美洲板块相邻，西界与亚欧板块、印度洋板块相邻，是环太平洋火山地震带的主体。',
      items: [
        { name: '马里亚纳海沟', role: '世界上最深的海沟，约 11034 米' },
        { name: '环太平洋火山地震带', role: '全球地震、火山最集中的地带' },
        { name: '日本群岛', role: '太平洋板块俯冲到亚欧板块之下形成' },
        { name: '安第斯山脉', role: '纳斯卡板块（属太平洋板块体系）俯冲形成' }
      ]
    },
    {
      id: 'american', name: '美洲板块',
      color: '#a8d4ab',
      tag: '含南北美洲',
      desc: '包括北美洲和南美洲及其周围海域。西界与太平洋板块相邻，多火山地震；东界与非洲板块、亚欧板块以生长边界相邻（大西洋中脊）。',
      items: [
        { name: '安第斯山脉', role: '南美西岸，世界最长山脉，由板块俯冲形成' },
        { name: '落基山脉', role: '北美西部的褶皱山脉' },
        { name: '大西洋中脊', role: '生长边界，大西洋正在扩张' },
        { name: '圣安地列斯断层', role: '北美西部的著名断层带' }
      ]
    },
    {
      id: 'antarctic', name: '南极洲板块',
      color: '#c9b3e8',
      tag: '几乎全是陆地',
      desc: '包括南极大陆及其周围海域，是六大板块中唯一几乎被陆地覆盖的板块。几乎全在南极圈内，覆盖厚达 2000 多米的冰层。',
      items: [
        { name: '南极大陆', role: '世界最冷的大陆，平均海拔最高' },
        { name: '罗斯海', role: '南极洲附近海域，与太平洋板块相接' },
        { name: '南极冰盖', role: '全球最大的淡水储存库' }
      ]
    }
  ];

  var currentPlateId = 'eurasian';

  function drawPlates() {
    if (!plateSvgEl) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    while (plateSvgEl.firstChild) plateSvgEl.removeChild(plateSvgEl.firstChild);

    var bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', '0'); bg.setAttribute('y', '0');
    bg.setAttribute('width', '520'); bg.setAttribute('height', '320');
    bg.setAttribute('fill', '#fffdf5');
    plateSvgEl.appendChild(bg);

    var SHAPES = {
      eurasian:  'M 250,70 L 340,55 L 420,80 L 460,120 L 450,170 L 380,185 L 320,180 L 260,165 L 220,140 L 240,110 Z',
      african:   'M 250,180 L 320,175 L 360,200 L 355,260 L 320,300 L 285,300 L 250,270 L 245,220 Z',
      indian:    'M 360,190 L 430,200 L 470,240 L 450,290 L 400,295 L 375,265 L 355,225 Z',
      pacific:   'M 30,90 L 100,60 L 160,80 L 180,140 L 165,200 L 120,240 L 60,230 L 25,180 Z M 470,180 L 500,200 L 505,260 L 470,285 L 460,240 Z',
      american:  'M 60,50 L 150,40 L 200,60 L 210,120 L 195,180 L 150,220 L 100,200 L 70,140 Z M 130,240 L 175,250 L 195,290 L 170,315 L 135,310 L 120,275 Z',
      antarctic: 'M 80,310 L 200,300 L 320,305 L 440,300 L 500,310 L 500,320 L 80,320 Z'
    };

    PLATES.forEach(function (p) {
      var shape = SHAPES[p.id];
      if (!shape) return;
      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', shape);
      path.setAttribute('fill', p.color);
      path.setAttribute('fill-opacity', currentPlateId === p.id ? '0.92' : '0.65');
      path.setAttribute('stroke', currentPlateId === p.id ? '#b47c00' : '#8a7340');
      path.setAttribute('stroke-width', currentPlateId === p.id ? '2.5' : '1');
      path.setAttribute('stroke-linejoin', 'round');
      plateSvgEl.appendChild(path);
    });

    var LABELS = {
      eurasian:  { x: 340, y: 115 },
      african:   { x: 300, y: 235 },
      indian:    { x: 415, y: 245 },
      pacific:   { x: 100, y: 145 },
      american:  { x: 135, y: 130 },
      antarctic: { x: 290, y: 313 }
    };
    PLATES.forEach(function (p) {
      var pos = LABELS[p.id];
      if (!pos) return;
      var t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', pos.x);
      t.setAttribute('y', pos.y);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
      t.setAttribute('font-size', currentPlateId === p.id ? '14' : '12');
      t.setAttribute('font-weight', '900');
      t.setAttribute('fill', '#3a2a00');
      t.setAttribute('pointer-events', 'none');
      t.textContent = p.name;
      plateSvgEl.appendChild(t);
    });

    var north = document.createElementNS(svgNS, 'text');
    north.setAttribute('x', '10');
    north.setAttribute('y', '18');
    north.setAttribute('font-family', '"PingFang SC","Microsoft YaHei",sans-serif');
    north.setAttribute('font-size', '11');
    north.setAttribute('font-weight', '800');
    north.setAttribute('fill', '#9c8a5a');
    north.textContent = 'N ↑';
    plateSvgEl.appendChild(north);
  }

  function renderPlateTabs(filter) {
    if (!plateTabsEl) return;
    var q = String(filter || '').trim().toLowerCase();
    plateTabsEl.innerHTML = PLATES.map(function (p) {
      var hit = !q || p.name.indexOf(q) >= 0 || p.desc.indexOf(q) >= 0 ||
                p.items.some(function (it) { return it.name.indexOf(q) >= 0 || it.role.indexOf(q) >= 0; });
      if (!hit && q) return '';
      return '<button type="button" class="earth-plate-tab' + (currentPlateId === p.id ? ' active' : '') + '" data-plate="' + p.id + '">' +
        '<span class="earth-plate-tab-name">' + esc(p.name) + '</span>' +
        '<span class="earth-plate-tab-count">' + p.items.length + ' 项</span>' +
      '</button>';
    }).join('');

    plateTabsEl.querySelectorAll('.earth-plate-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        currentPlateId = t.dataset.plate;
        renderPlateTabs(plateSearchEl.value);
        renderPlateDetail();
        drawPlates();
      });
    });
  }

  function renderPlateDetail() {
    if (!plateDetailEl) return;
    var p = PLATES.find(function (x) { return x.id === currentPlateId; });
    if (!p) { plateDetailEl.innerHTML = ''; return; }

    plateDetailEl.innerHTML = '<div class="earth-plate-card">' +
      '<div class="earth-plate-head">' +
        '<h3 class="earth-plate-name">' + esc(p.name) + '</h3>' +
        '<span class="earth-plate-tag">' + esc(p.tag) + '</span>' +
      '</div>' +
      '<p class="earth-plate-desc">' + esc(p.desc) + '</p>' +
      '<div class="earth-plate-section">' +
        '<div class="earth-plate-section-title">典型地貌与相关现象</div>' +
        '<div class="earth-plate-items">' +
          p.items.map(function (it) {
            return '<div class="earth-plate-item">' +
              '<div class="earth-plate-item-name">' + esc(it.name) + '</div>' +
              '<div class="earth-plate-item-role">' + esc(it.role) + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  if (plateSearchEl) {
    plateSearchEl.addEventListener('input', function () {
      renderPlateTabs(plateSearchEl.value);
    });
  }

  /* ============================================================
     四、经纬度距离
     ============================================================ */
  var distLatA = document.getElementById('earthLatA');
  var distLngA = document.getElementById('earthLngA');
  var distLatB = document.getElementById('earthLatB');
  var distLngB = document.getElementById('earthLngB');
  var distMsg  = document.getElementById('earthDistMsg');
  var distResultPanel = document.getElementById('earthDistResultPanel');
  var distResultEl    = document.getElementById('earthDistResult');

  function toRad(d) { return d * Math.PI / 180; }
  function toDeg(r) { return r * 180 / Math.PI; }

  function haversine(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  function bearing(lat1, lng1, lat2, lng2) {
    var φ1 = toRad(lat1), φ2 = toRad(lat2);
    var Δλ = toRad(lng2 - lng1);
    var y = Math.sin(Δλ) * Math.cos(φ2);
    var x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    var θ = Math.atan2(y, x);
    return (toDeg(θ) + 360) % 360;
  }
  function bearingLabel(deg) {
    var dirs = ['正北', '东北', '正东', '东南', '正南', '西南', '正西', '西北'];
    var idx = Math.round(deg / 45) % 8;
    return dirs[idx];
  }
  function midpoint(lat1, lng1, lat2, lng2) {
    var φ1 = toRad(lat1), λ1 = toRad(lng1);
    var φ2 = toRad(lat2), λ2 = toRad(lng2);
    var Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
    var By = Math.cos(φ2) * Math.sin(λ2 - λ1);
    var φ3 = Math.atan2(
      Math.sin(φ1) + Math.sin(φ2),
      Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By)
    );
    var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
    return { lat: toDeg(φ3), lng: ((toDeg(λ3) + 540) % 360) - 180 };
  }

  function showDistMsg(text, kind) {
    if (!distMsg) return;
    distMsg.textContent = text;
    distMsg.className = 'earth-dist-msg' + (text ? ' show' : '') + (kind ? ' ' + kind : '');
  }

  function computeDistance() {
    var latA = parseFloat(distLatA.value);
    var lngA = parseFloat(distLngA.value);
    var latB = parseFloat(distLatB.value);
    var lngB = parseFloat(distLngB.value);

    if (!isFinite(latA) || !isFinite(lngA) || !isFinite(latB) || !isFinite(lngB)) {
      showDistMsg('请填写有效的经纬度数值', 'err');
      distResultPanel.style.display = 'none';
      return;
    }
    if (Math.abs(latA) > 90 || Math.abs(latB) > 90) {
      showDistMsg('纬度范围应在 −90° ~ 90° 之间', 'err');
      distResultPanel.style.display = 'none';
      return;
    }
    if (Math.abs(lngA) > 180 || Math.abs(lngB) > 180) {
      showDistMsg('经度范围应在 −180° ~ 180° 之间', 'err');
      distResultPanel.style.display = 'none';
      return;
    }

    var d = haversine(latA, lngA, latB, lngB);
    var brg = bearing(latA, lngA, latB, lngB);
    var mid = midpoint(latA, lngA, latB, lngB);

    var dEquator = d * 6378 / 6371;
    var dPole = d * 6357 / 6371;

    distResultEl.innerHTML =
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">大圆距离</div>' +
        '<div class="earth-dist-card-value">' + d.toFixed(2) + ' km</div>' +
        '<div class="earth-dist-card-sub">约 ' + (d / 1000).toFixed(2) + ' 千公里</div>' +
      '</div>' +
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">初始方位角</div>' +
        '<div class="earth-dist-card-value">' + brg.toFixed(2) + '°</div>' +
        '<div class="earth-dist-card-sub">' + bearingLabel(brg) + '方向</div>' +
      '</div>' +
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">中点坐标</div>' +
        '<div class="earth-dist-card-value">' + mid.lat.toFixed(3) + '°, ' + mid.lng.toFixed(3) + '°</div>' +
        '<div class="earth-dist-card-sub">大圆路径上的中点</div>' +
      '</div>' +
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">地球半径差异</div>' +
        '<div class="earth-dist-card-value">' + dEquator.toFixed(0) + ' ~ ' + dPole.toFixed(0) + ' km</div>' +
        '<div class="earth-dist-card-sub">赤道半径 / 极半径</div>' +
      '</div>' +
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">起点</div>' +
        '<div class="earth-dist-card-value">' + latA.toFixed(4) + '°, ' + lngA.toFixed(4) + '°</div>' +
        '<div class="earth-dist-card-sub">' + latLabel(latA) + ' ' + lngLabel2(lngA) + '</div>' +
      '</div>' +
      '<div class="earth-dist-card">' +
        '<div class="earth-dist-card-label">终点</div>' +
        '<div class="earth-dist-card-value">' + latB.toFixed(4) + '°, ' + lngB.toFixed(4) + '°</div>' +
        '<div class="earth-dist-card-sub">' + latLabel(latB) + ' ' + lngLabel2(lngB) + '</div>' +
      '</div>';

    distResultPanel.style.display = '';
    showDistMsg('计算完成：' + d.toFixed(2) + ' km', 'ok');
  }

  function latLabel(v) {
    if (v === 0) return '赤道';
    return Math.abs(v).toFixed(2) + '°' + (v > 0 ? 'N' : 'S');
  }
  function lngLabel2(v) {
    if (v === 0) return '本初子午线';
    return Math.abs(v).toFixed(2) + '°' + (v > 0 ? 'E' : 'W');
  }

  if (document.getElementById('earthDistRun')) {
    document.getElementById('earthDistRun').addEventListener('click', computeDistance);
  }

  document.querySelectorAll('#page-earthmodule [data-earth-cities]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parts = btn.dataset.earthCities.split(',').map(function (x) { return parseFloat(x.trim()); });
      if (parts.length !== 4 || parts.some(function (v) { return !isFinite(v); })) return;
      distLatA.value = parts[0];
      distLngA.value = parts[1];
      distLatB.value = parts[2];
      distLngB.value = parts[3];
      var CITY_NAMES = {
        '39.9042,116.4074': '北京',
        '31.2304,121.4737': '上海',
        '22.3193,114.1694': '香港',
        '35.6762,139.6503': '东京',
        '51.5074,-0.1278': '伦敦',
        '40.7128,-74.0060': '纽约',
        '34.0522,-118.2437': '洛杉矶',
        '-33.8688,151.2093': '悉尼'
      };
      document.getElementById('earthNameA').textContent =
        CITY_NAMES[parts[0] + ',' + parts[1]] || (parts[0] + ', ' + parts[1]);
      document.getElementById('earthNameB').textContent =
        CITY_NAMES[parts[2] + ',' + parts[3]] || (parts[2] + ', ' + parts[3]);
      computeDistance();
    });
  });

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    if (window.__earthmoduleInited) return;
    window.__earthmoduleInited = true;

    safeCall(drawOrbit, '公转初始化');
    safeCall(function () { renderRotParams(); drawRotation(); }, '自转初始化');
    safeCall(function () { renderPlateTabs(''); renderPlateDetail(); }, '板块初始化');
    safeCall(function () {
      if (plateSvgEl && plateSvgEl.offsetParent) drawPlates();
    }, '板块绘制');
    safeCall(computeDistance, '距离初始化');
  }

  window.__earthmoduleInit = function () {
    if (!window.__earthmoduleInited) {
      init();
    } else {
      safeCall(drawOrbit, '公转刷新');
      safeCall(drawRotation, '自转刷新');
      safeCall(function () {
        if (plateSvgEl && plateSvgEl.offsetParent) drawPlates();
      }, '板块刷新');
    }
  };

  if (page.classList.contains('active')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function () {
      if (page.classList.contains('active')) {
        if (!window.__earthmoduleInited) init();
        else {
          if (plateSvgEl && plateSvgEl.offsetParent) {
            setTimeout(function () { safeCall(drawPlates, '板块尺寸刷新'); }, 60);
          }
        }
      }
    });
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  }

  console.log('[地球模块] 已加载');
})();