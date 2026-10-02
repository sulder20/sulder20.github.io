/* ============================================================
   遗传计算 · 岁窦工具箱 V4.0
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-geneticscalc');
  if (!page) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  /* ---------- 工具函数 ---------- */
  /* 校验基因型：一对用 Aa/AA/aa，两对用 AaBb 等 */
  function parseSingle(s) {
    s = String(s || '').trim();
    if (!/^[A-Za-z]{2}$/.test(s)) return null;
    if (s[0].toLowerCase() === s[1].toLowerCase()) {
      /* 同字母大小写组合 */
      return [s[0], s[1]];
    }
    return null;
  }
  function normalizePair(a, b) {
    /* 把 Aa 和 aA 统一成 Aa */
    var big = null, small = null;
    [a, b].forEach(function (ch) {
      if (/[A-Z]/.test(ch)) big = ch;
      else small = ch;
    });
    if (big && small) return big + small;
    return a + b;
  }
  function gametes(genotype) {
    /* 返回一对基因的配子（去重） */
    var g = normalizePair(genotype[0], genotype[1]);
    var set = {};
    set[g[0]] = true;
    set[g[1]] = true;
    return Object.keys(set);
  }
  function punnett(ga, gb) {
    var grid = [];
    ga.forEach(function (x) {
      var row = [];
      gb.forEach(function (y) {
        row.push(normalizePair(x, y));
      });
      grid.push(row);
    });
    return grid;
  }
  function countGenotypes(grid) {
    var map = {};
    grid.forEach(function (row) {
      row.forEach(function (g) {
        map[g] = (map[g] || 0) + 1;
      });
    });
    return map;
  }
  function isDominant(genotype) {
    /* 基因型中只要有至少一个大写字母即为显性表现型 */
    return /[A-Z]/.test(genotype);
  }

  /* ---------- 一对基因 ---------- */
  function calcSingle() {
    var father = document.getElementById('gnFather1').value.trim();
    var mother = document.getElementById('gnMother1').value.trim();
    var el = document.getElementById('gnResult1');
    var pf = parseSingle(father), pm = parseSingle(mother);
    if (!pf || !pm) {
      el.innerHTML = '<div class="gn-block" style="color:#b91c1c;">请输入合法的基因型，例如 Aa、AA、aa</div>';
      el.classList.add('show');
      return;
    }
    /* 统一亲本基因型 A 在前 */
    var pfN = normalizePair(pf[0], pf[1]);
    var pmN = normalizePair(pm[0], pm[1]);
    if (pfN[0].toUpperCase() !== pmN[0].toUpperCase()) {
      el.innerHTML = '<div class="gn-block" style="color:#b91c1c;">两个亲本的基因符号必须一致（如都是 A/a，或都是 B/b）</div>';
      el.classList.add('show');
      return;
    }

    var ga = gametes(pfN), gb = gametes(pmN);
    var grid = punnett(ga, gb);

    /* 庞纳特方格 HTML */
    var html = '<div class="gn-block">' +
      '<div class="gn-block-title">庞纳特方格</div>' +
      '<div class="gn-punnett" style="grid-template-columns:repeat(' + (gb.length + 1) + ',auto);">';
    /* 表头 */
    html += '<div class="gn-punnett-cell gn-punnett-head"> </div>';
    gb.forEach(function (g) {
      html += '<div class="gn-punnett-cell gn-punnett-head">' + esc(g) + '</div>';
    });
    /* 表体 */
    grid.forEach(function (row, i) {
      html += '<div class="gn-punnett-cell gn-punnett-head">' + esc(ga[i]) + '</div>';
      row.forEach(function (g) {
        var cls = 'gn-punnett-body';
        if (g[0] === g[1] || g[0].toLowerCase() === g[1].toLowerCase()) cls += ' homozygous';
        else cls += ' heterozygous';
        html += '<div class="gn-punnett-cell ' + cls + '">' + esc(g) + '</div>';
      });
    });
    html += '</div></div>';

    /* 基因型统计 */
    var counts = countGenotypes(grid);
    var total = grid.length * grid[0].length;
    var genotypeRows = Object.keys(counts).sort().map(function (g) {
      var pct = (counts[g] / total * 100).toFixed(1);
      return '<div class="gn-stat">' +
        '<span class="gn-stat-label">' + esc(g) + '</span>' +
        '<span class="gn-stat-value">' + counts[g] + '/' + total + ' <span class="gn-stat-pct">(' + pct + '%)</span></span>' +
      '</div>';
    }).join('');

    html += '<div class="gn-block">' +
      '<div class="gn-block-title">基因型比例</div>' +
      '<div class="gn-stat-row">' + genotypeRows + '</div>' +
    '</div>';

    /* 表现型统计 */
    var domCount = 0;
    Object.keys(counts).forEach(function (g) {
      if (isDominant(g)) domCount += counts[g];
    });
    var recCount = total - domCount;
    var domPct = (domCount / total * 100).toFixed(1);
    var recPct = (recCount / total * 100).toFixed(1);

    html += '<div class="gn-block">' +
      '<div class="gn-block-title">表现型比例</div>' +
      '<div class="gn-stat-row">' +
        '<div class="gn-stat"><span class="gn-stat-label">显性</span><span class="gn-stat-value">' +
          domCount + '/' + total + ' <span class="gn-stat-pct">(' + domPct + '%)</span></span></div>' +
        '<div class="gn-stat"><span class="gn-stat-label">隐性</span><span class="gn-stat-value">' +
          recCount + '/' + total + ' <span class="gn-stat-pct">(' + recPct + '%)</span></span></div>' +
      '</div>' +
    '</div>';

    /* 亲本配子 */
    html += '<div class="gn-block">' +
      '<div class="gn-block-title">亲本配子</div>' +
      '<div class="gn-stat-row">' +
        '<div class="gn-stat"><span class="gn-stat-label">父本 ' + esc(pfN) + '</span><span class="gn-stat-value">' + ga.map(esc).join('、') + '</span></div>' +
        '<div class="gn-stat"><span class="gn-stat-label">母本 ' + esc(pmN) + '</span><span class="gn-stat-value">' + gb.map(esc).join('、') + '</span></div>' +
      '</div>' +
    '</div>';

    el.innerHTML = html;
    el.classList.add('show');
  }

  /* ---------- 两对基因 ---------- */
  function parseDouble(s) {
    s = String(s || '').trim();
    if (!/^[A-Za-z]{4}$/.test(s)) return null;
    /* 形式 AaBb，取 A/a 为一对，B/b 为一对 */
    var letters = s.split('');
    var pair1 = [letters[0], letters[1]];
    var pair2 = [letters[2], letters[3]];
    if (pair1[0].toLowerCase() !== pair1[1].toLowerCase()) return null;
    if (pair2[0].toLowerCase() !== pair2[1].toLowerCase()) return null;
    return [normalizePair(pair1[0], pair1[1]), normalizePair(pair2[0], pair2[1])];
  }
  function gametesDouble(pair) {
    /* pair = ['Aa','Bb']，返回所有配子组合 */
    var g1 = gametes(pair[0]);
    var g2 = gametes(pair[1]);
    var out = [];
    g1.forEach(function (a) {
      g2.forEach(function (b) { out.push(a + b); });
    });
    return out;
  }

  function calcDouble() {
    var father = document.getElementById('gnFather2').value.trim();
    var mother = document.getElementById('gnMother2').value.trim();
    var el = document.getElementById('gnResult2');
    var pf = parseDouble(father), pm = parseDouble(mother);
    if (!pf || !pm) {
      el.innerHTML = '<div class="gn-block" style="color:#b91c1c;">请输入合法的两对基因型，例如 AaBb、AABB、aabb</div>';
      el.classList.add('show');
      return;
    }

    var ga = gametesDouble(pf);
    var gb = gametesDouble(pm);
    /* 组合：ga × gb */
    var combos = [];
    ga.forEach(function (a) {
      gb.forEach(function (b) {
        combos.push(a + b);
      });
    });

    /* 用两对基因合并的形式统计 */
    var counts = {};
    combos.forEach(function (g) {
      /* 重排：把第一对放在前两位 */
      var p1a = g[0], p1b = g[1];
      var p2a = g[2], p2b = g[3];
      var k = normalizePair(p1a, p1b) + normalizePair(p2a, p2b);
      counts[k] = (counts[k] || 0) + 1;
    });
    var total = combos.length;

    /* 表现型统计 */
    var domA = 0, domB = 0;
    var onlyA = 0, onlyB = 0, bothDom = 0, bothRec = 0;
    Object.keys(counts).forEach(function (k) {
      var a = k.slice(0, 2);
      var b = k.slice(2);
      var isA = isDominant(a);
      var isB = isDominant(b);
      if (isA && isB) bothDom += counts[k];
      else if (isA && !isB) onlyA += counts[k];
      else if (!isA && isB) onlyB += counts[k];
      else bothRec += counts[k];
    });

    var html = '<div class="gn-block">' +
      '<div class="gn-block-title">亲本与配子</div>' +
      '<div class="gn-stat-row">' +
        '<div class="gn-stat"><span class="gn-stat-label">父本</span><span class="gn-stat-value">' + esc(father) + '</span></div>' +
        '<div class="gn-stat"><span class="gn-stat-label">母本</span><span class="gn-stat-value">' + esc(mother) + '</span></div>' +
        '<div class="gn-stat"><span class="gn-stat-label">父本配子</span><span class="gn-stat-value">' + ga.map(esc).join('、') + '</span></div>' +
        '<div class="gn-stat"><span class="gn-stat-label">母本配子</span><span class="gn-stat-value">' + gb.map(esc).join('、') + '</span></div>' +
      '</div>' +
    '</div>';

    /* 基因型统计 */
    var genoKeys = Object.keys(counts).sort();
    var genoRows = genoKeys.map(function (k) {
      var pct = (counts[k] / total * 100).toFixed(1);
      return '<div class="gn-stat">' +
        '<span class="gn-stat-label">' + esc(k) + '</span>' +
        '<span class="gn-stat-value">' + counts[k] + '/' + total + ' <span class="gn-stat-pct">(' + pct + '%)</span></span>' +
      '</div>';
    }).join('');

    html += '<div class="gn-block">' +
      '<div class="gn-block-title">基因型组合（' + genoKeys.length + ' 种）</div>' +
      '<div class="gn-stat-row">' + genoRows + '</div>' +
    '</div>';

    /* 表现型 */
    html += '<div class="gn-block">' +
      '<div class="gn-block-title">表现型比例（按显隐性组合）</div>' +
      '<div class="gn-stat-row">' +
        '<div class="gn-stat"><span class="gn-stat-label">双显性</span><span class="gn-stat-value">' + bothDom + '/' + total + ' <span class="gn-stat-pct">(' + (bothDom / total * 100).toFixed(1) + '%)</span></span></div>' +
        '<div class="gn-stat"><span class="gn-stat-label">一显一隐</span><span class="gn-stat-value">' + onlyA + '/' + total + ' <span class="gn-stat-pct">(' + (onlyA / total * 100).toFixed(1) + '%)</span></span></div>' +
        '<div class="gn-stat"><span class="gn-stat-label">一隐一显</span><span class="gn-stat-value">' + onlyB + '/' + total + ' <span class="gn-stat-pct">(' + (onlyB / total * 100).toFixed(1) + '%)</span></span></div>' +
        '<div class="gn-stat"><span class="gn-stat-label">双隐性</span><span class="gn-stat-value">' + bothRec + '/' + total + ' <span class="gn-stat-pct">(' + (bothRec / total * 100).toFixed(1) + '%)</span></span></div>' +
      '</div>' +
    '</div>';

    el.innerHTML = html;
    el.classList.add('show');
  }

  /* ---------- ABO 血型 ---------- */
  var BLOOD_GENO = {
    'A': [['A', 'A'], ['A', 'i']],
    'B': [['B', 'B'], ['B', 'i']],
    'AB': [['A', 'B']],
    'O': [['i', 'i']]
  };
  function bloodPhenotype(g1, g2) {
    var s = [g1, g2].sort().join('');
    if (s === 'AA' || s === 'Ai') return 'A';
    if (s === 'BB' || s === 'Bi') return 'B';
    if (s === 'AB') return 'AB';
    if (s === 'ii') return 'O';
    return '?';
  }

  function calcBloodtype() {
    var f = document.getElementById('gnBloodF').value;
    var m = document.getElementById('gnBloodM').value;
    var el = document.getElementById('gnResult3');

    var fGeno = BLOOD_GENO[f] || [];
    var mGeno = BLOOD_GENO[m] || [];

    var combos = [];
    fGeno.forEach(function (a) {
      mGeno.forEach(function (b) {
        /* 父亲提供 a[0] 或 a[1]，母亲提供 b[0] 或 b[1] */
        [[a[0], b[0]], [a[0], b[1]], [a[1], b[0]], [a[1], b[1]]].forEach(function (pair) {
          combos.push(bloodPhenotype(pair[0], pair[1]));
        });
      });
    });

    var counts = {};
    combos.forEach(function (p) { counts[p] = (counts[p] || 0) + 1; });
    var total = combos.length;

    var order = ['A', 'B', 'AB', 'O'];
    var rows = order.filter(function (k) { return counts[k]; }).map(function (k) {
      var pct = (counts[k] / total * 100).toFixed(1);
      return '<div class="gn-stat">' +
        '<span class="gn-stat-label">' + k + ' 型</span>' +
        '<span class="gn-stat-value">' + pct + '%</span>' +
      '</div>';
    }).join('');

    var impossible = order.filter(function (k) { return !counts[k]; });

    var html = '<div class="gn-block">' +
      '<div class="gn-block-title">父母血型：' + esc(f) + ' × ' + esc(m) + '</div>' +
      '<div class="gn-stat-row">' + rows + '</div>' +
    '</div>';

    if (impossible.length) {
      html += '<div class="gn-block">' +
        '<div class="gn-block-title">不可能出现的血型</div>' +
        '<div class="gn-stat-row">' +
          impossible.map(function (k) {
            return '<div class="gn-stat"><span class="gn-stat-label" style="color:#b91c1c;">' + k + ' 型</span><span class="gn-stat-value">0%</span></div>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    el.innerHTML = html;
    el.classList.add('show');
  }

  /* ---------- 子标签切换 ---------- */
  document.querySelectorAll('#page-geneticscalc .ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#page-geneticscalc .ta-subtab').forEach(function (t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      var target = tab.dataset.gn;
      document.querySelectorAll('#page-geneticscalc .ta-subpage').forEach(function (p) {
        p.classList.toggle('active', p.dataset.gnPage === target);
      });
    });
  });

  /* ---------- 预设按钮 ---------- */
  document.querySelectorAll('#page-geneticscalc [data-gn1]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parts = btn.dataset.gn1.split(',');
      if (parts.length !== 2) return;
      document.getElementById('gnFather1').value = parts[0].trim();
      document.getElementById('gnMother1').value = parts[1].trim();
      calcSingle();
    });
  });
  document.querySelectorAll('#page-geneticscalc [data-gn2]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parts = btn.dataset.gn2.split(',');
      if (parts.length !== 2) return;
      document.getElementById('gnFather2').value = parts[0].trim();
      document.getElementById('gnMother2').value = parts[1].trim();
      calcDouble();
    });
  });

  /* ---------- 主按钮 ---------- */
  document.getElementById('gnRun1').addEventListener('click', calcSingle);
  document.getElementById('gnRun2').addEventListener('click', calcDouble);
  document.getElementById('gnRun3').addEventListener('click', calcBloodtype);

  function init() {
    if (window.__geneticscalcInited) return;
    window.__geneticscalcInited = true;
    calcSingle();
  }
  window.__geneticscalcInit = function () { if (!window.__geneticscalcInited) init(); };

  if (page.classList.contains('active')) init();
  console.log('[遗传计算] 已加载');
})();