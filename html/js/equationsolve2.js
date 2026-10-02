/* ============================================================
   解方程组 · 岁窦工具箱 V4.0
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-equationsolve');
  if (!page) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function parseVal(s) {
    s = String(s || '').trim();
    if (!s) return NaN;
    s = s.replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/[−–—]/g, '-');
    var m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
    if (m) {
      var d = parseFloat(m[2]);
      if (d === 0) return NaN;
      return parseFloat(m[1]) / d;
    }
    return parseFloat(s);
  }
  function fmt(n) {
    if (!isFinite(n)) return '—';
    if (n === 0) return '0';
    var r = parseFloat(n.toPrecision(8));
    return String(r);
  }
  function fmtComplex(re, im) {
    if (im === 0) return fmt(re);
    var sign = im >= 0 ? '+' : '−';
    var absIm = Math.abs(im);
    return fmt(re) + ' ' + sign + ' ' + fmt(absIm) + 'i';
  }

  function showResult(el, main, steps, isError) {
    if (!el) return;
    if (isError) {
      el.className = 'es-result show error';
      el.innerHTML = '<div class="es-result-title">错误</div><p>' + esc(main) + '</p>';
      return;
    }
    var html = '<div class="es-result-title">求解结果</div>' +
      '<div class="es-result-main">' + main + '</div>';
    if (steps && steps.length) {
      html += steps.map(function (s) {
        return '<div class="es-result-step">' + s + '</div>';
      }).join('');
    }
    el.className = 'es-result show';
    el.innerHTML = html;
  }

  /* ---------- 一元一次：ax + b = 0 ---------- */
  document.getElementById('es1Run').addEventListener('click', function () {
    var a = parseVal(document.getElementById('es1a').value);
    var b = parseVal(document.getElementById('es1b').value);
    var el = document.getElementById('es1Result');

    if (!isFinite(a) || !isFinite(b)) {
      showResult(el, '系数请填写有效数字', null, true);
      return;
    }
    if (a === 0) {
      if (b === 0) showResult(el, 'a = 0 且 b = 0，方程有无穷多解（任意 x 都成立）', null, true);
      else showResult(el, 'a = 0 且 b ≠ 0，方程无解', null, true);
      return;
    }
    var x = -b / a;
    var steps = [
      '原方程：' + fmt(a) + 'x + ' + fmt(b) + ' = 0',
      '移项：' + fmt(a) + 'x = ' + fmt(-b),
      '两边同除以 ' + fmt(a) + '：x = ' + fmt(-b) + ' / ' + fmt(a),
      'x = ' + fmt(x)
    ];
    showResult(el, '<code>x = ' + fmt(x) + '</code>', steps);
  });

  /* ---------- 一元二次：ax² + bx + c = 0 ---------- */
  document.getElementById('es2Run').addEventListener('click', function () {
    var a = parseVal(document.getElementById('es2a').value);
    var b = parseVal(document.getElementById('es2b').value);
    var c = parseVal(document.getElementById('es2c').value);
    var el = document.getElementById('es2Result');

    if (!isFinite(a) || !isFinite(b) || !isFinite(c)) {
      showResult(el, '系数请填写有效数字', null, true);
      return;
    }
    if (a === 0) {
      if (b === 0) {
        if (c === 0) showResult(el, '所有系数为 0，任意 x 都成立', null, true);
        else showResult(el, 'a = b = 0 且 c ≠ 0，方程无解', null, true);
      } else {
        var x = -c / b;
        showResult(el, '<code>x = ' + fmt(x) + '</code>（退化为一次方程）',
          ['原方程：' + fmt(b) + 'x + ' + fmt(c) + ' = 0', 'x = ' + fmt(x)]);
      }
      return;
    }

    var disc = b * b - 4 * a * c;
    var steps = [
      'a = ' + fmt(a) + '，b = ' + fmt(b) + '，c = ' + fmt(c),
      '判别式 Δ = b² − 4ac = ' + fmt(b * b) + ' − ' + fmt(4 * a * c) + ' = ' + fmt(disc)
    ];

    var main;
    if (disc > 0) {
      var x1 = (-b + Math.sqrt(disc)) / (2 * a);
      var x2 = (-b - Math.sqrt(disc)) / (2 * a);
      steps.push('Δ > 0，方程有两个不相等的实数根');
      steps.push('x₁ = (−b + √Δ) / 2a = ' + fmt(x1));
      steps.push('x₂ = (−b − √Δ) / 2a = ' + fmt(x2));
      main = '<code>x₁ = ' + fmt(x1) + '</code>　<code>x₂ = ' + fmt(x2) + '</code>';
    } else if (disc === 0) {
      var xd = -b / (2 * a);
      steps.push('Δ = 0，方程有两个相等的实数根');
      steps.push('x₁ = x₂ = −b / 2a = ' + fmt(xd));
      main = '<code>x = ' + fmt(xd) + '</code>（二重根）';
    } else {
      var re = -b / (2 * a);
      var im = Math.sqrt(-disc) / (2 * a);
      steps.push('Δ < 0，方程无实数根，有两个共轭复数根');
      steps.push('实部 = −b / 2a = ' + fmt(re));
      steps.push('虚部 = √(−Δ) / 2a = ' + fmt(Math.abs(im)));
      main = '<code>x₁ = ' + fmtComplex(re, im) + '</code>　<code>x₂ = ' + fmtComplex(re, -im) + '</code>';
    }
    showResult(el, main, steps);
  });

  /* ---------- 二元一次方程组（克拉默法则） ---------- */
  document.getElementById('es3Run').addEventListener('click', function () {
    var a1 = parseVal(document.getElementById('es3a1').value);
    var b1 = parseVal(document.getElementById('es3b1').value);
    var c1 = parseVal(document.getElementById('es3c1').value);
    var a2 = parseVal(document.getElementById('es3a2').value);
    var b2 = parseVal(document.getElementById('es3b2').value);
    var c2 = parseVal(document.getElementById('es3c2').value);
    var el = document.getElementById('es3Result');

    if ([a1, b1, c1, a2, b2, c2].some(function (v) { return !isFinite(v); })) {
      showResult(el, '系数请填写有效数字', null, true);
      return;
    }

    var D  = a1 * b2 - a2 * b1;
    var Dx = c1 * b2 - c2 * b1;
    var Dy = a1 * c2 - a2 * c1;

    var steps = [
      '方程组：' + fmt(a1) + 'x + ' + fmt(b1) + 'y = ' + fmt(c1) + '　|　' + fmt(a2) + 'x + ' + fmt(b2) + 'y = ' + fmt(c2),
      '系数行列式 D = a₁b₂ − a₂b₁ = ' + fmt(D),
      'Dx = c₁b₂ − c₂b₁ = ' + fmt(Dx),
      'Dy = a₁c₂ − a₂c₁ = ' + fmt(Dy)
    ];

    if (D === 0) {
      if (Dx === 0 && Dy === 0) {
        showResult(el, 'D = Dx = Dy = 0，方程组有无穷多解或无数解（需进一步判断两方程是否等价）', steps, true);
      } else {
        showResult(el, 'D = 0 但 Dx 或 Dy 不为 0，方程组无解', steps, true);
      }
      return;
    }

    var x = Dx / D;
    var y = Dy / D;
    steps.push('x = Dx / D = ' + fmt(x));
    steps.push('y = Dy / D = ' + fmt(y));
    showResult(el, '<code>x = ' + fmt(x) + '</code>　<code>y = ' + fmt(y) + '</code>', steps);
  });

  /* ---------- 三元一次方程组（克拉默法则） ---------- */
  document.getElementById('es4Run').addEventListener('click', function () {
    var a1 = parseVal(document.getElementById('es4a1').value);
    var b1 = parseVal(document.getElementById('es4b1').value);
    var c1 = parseVal(document.getElementById('es4c1').value);
    var d1 = parseVal(document.getElementById('es4d1').value);

    var a2 = parseVal(document.getElementById('es4a2').value);
    var b2 = parseVal(document.getElementById('es4b2').value);
    var c2 = parseVal(document.getElementById('es4c2').value);
    var d2 = parseVal(document.getElementById('es4d2').value);

    var a3 = parseVal(document.getElementById('es4a3').value);
    var b3 = parseVal(document.getElementById('es4b3').value);
    var c3 = parseVal(document.getElementById('es4c3').value);
    var d3 = parseVal(document.getElementById('es4d3').value);

    var el = document.getElementById('es4Result');
    var all = [a1,b1,c1,d1,a2,b2,c2,d2,a3,b3,c3,d3];
    if (all.some(function (v) { return !isFinite(v); })) {
      showResult(el, '系数请填写有效数字', null, true);
      return;
    }

    function det3(m) {
      return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
           - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
           + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    }

    var M = [
      [a1, b1, c1],
      [a2, b2, c2],
      [a3, b3, c3]
    ];
    var D  = det3(M);
    var Mx = [[d1,b1,c1],[d2,b2,c2],[d3,b3,c3]];
    var My = [[a1,d1,c1],[a2,d2,c2],[a3,d3,c3]];
    var Mz = [[a1,b1,d1],[a2,b2,d2],[a3,b3,d3]];
    var Dx = det3(Mx), Dy = det3(My), Dz = det3(Mz);

    var steps = [
      '系数行列式 D = ' + fmt(D),
      'Dx = ' + fmt(Dx) + '　Dy = ' + fmt(Dy) + '　Dz = ' + fmt(Dz)
    ];

    if (D === 0) {
      if (Dx === 0 && Dy === 0 && Dz === 0) {
        showResult(el, 'D = Dx = Dy = Dz = 0，方程组有无穷多解或无解', steps, true);
      } else {
        showResult(el, 'D = 0 但 Dx、Dy、Dz 不全为 0，方程组无解', steps, true);
      }
      return;
    }

    var x = Dx / D, y = Dy / D, z = Dz / D;
    steps.push('x = Dx / D = ' + fmt(x));
    steps.push('y = Dy / D = ' + fmt(y));
    steps.push('z = Dz / D = ' + fmt(z));
    showResult(el, '<code>x = ' + fmt(x) + '</code>　<code>y = ' + fmt(y) + '</code>　<code>z = ' + fmt(z) + '</code>', steps);
  });

  /* 子标签切换 */
  document.querySelectorAll('#page-equationsolve .ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#page-equationsolve .ta-subtab').forEach(function (t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      var target = tab.dataset.es;
      document.querySelectorAll('#page-equationsolve .ta-subpage').forEach(function (p) {
        p.classList.toggle('active', p.dataset.esPage === target);
      });
    });
  });

  window.__equationsolveInit = function () {
    /* 页面切换时无需特殊处理 */
  };

  console.log('[解方程组] 已加载');
})();