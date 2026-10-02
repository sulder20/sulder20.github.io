/* ============================================================
   化学方程式 · 岁窦工具箱 V4.0
   功能：配平、电荷守恒、原子守恒、反应类型、气体/沉淀/水判定、摩尔质量
   ============================================================ */
(function () {
  'use strict';

  var inputEl = document.getElementById('chemInput');
  if (!inputEl) return;

  var outputEl    = document.getElementById('chemOutput');
  var resultEl    = document.getElementById('chemResult');
  var quickTagsEl = document.getElementById('chemQuickTags');
  var checkEl     = document.getElementById('chemCheck');
  var massEl      = document.getElementById('chemMass');
  var analysisEl  = document.getElementById('chemAnalysis');
  var msgEl       = document.getElementById('chemMsg');

  var lastText = '';
  var lastData = null;

  /* ============================================================
     常量表
     ============================================================ */
  var ATOMIC_MASS = {
    H:1.008, He:4.003, Li:6.941, Be:9.012, B:10.81,
    C:12.011, N:14.007, O:15.999, F:18.998, Ne:20.180,
    Na:22.990, Mg:24.305, Al:26.982, Si:28.085, P:30.974,
    S:32.06, Cl:35.45, Ar:39.948, K:39.098, Ca:40.078,
    Sc:44.956, Ti:47.867, V:50.942, Cr:51.996, Mn:54.938,
    Fe:55.845, Co:58.933, Ni:58.693, Cu:63.546, Zn:65.38,
    Ga:69.723, Ge:72.630, As:74.922, Se:78.971, Br:79.904,
    Kr:83.798, Rb:85.468, Sr:87.62, Y:88.906, Zr:91.224,
    Nb:92.906, Mo:95.95, Ru:101.07, Rh:102.906, Pd:106.42,
    Ag:107.868, Cd:112.414, In:114.818, Sn:118.710, Sb:121.760,
    Te:127.60, I:126.904, Xe:131.293, Cs:132.905, Ba:137.327,
    La:138.905, Ce:140.116, Nd:144.242, Sm:150.36, Eu:151.964,
    Gd:157.25, W:183.84, Pt:195.084, Au:196.967, Hg:200.592,
    Tl:204.38, Pb:207.2, Bi:208.980, U:238.029
  };

  var GAS_NAMES = {
    'H2': '氢气', 'O2': '氧气', 'N2': '氮气', 'F2': '氟气', 'Cl2': '氯气',
    'He1': '氦气', 'Ne1': '氖气', 'Ar1': '氩气',
    'C1O1': '一氧化碳', 'C1O2': '二氧化碳',
    'O2S1': '二氧化硫', 'O3S1': '三氧化硫',
    'H3N1': '氨气', 'H2S1': '硫化氢',
    'N1O1': '一氧化氮', 'N1O2': '二氧化氮',
    'C1H4': '甲烷', 'C2H2': '乙炔'
  };

  var PRECIPITATE_NAMES = {
    'Ag1Cl1':  '氯化银（白色）',
    'Ag1Br1':  '溴化银（淡黄色）',
    'Ag1I1':   '碘化银（黄色）',
    'Ba1O4S1': '硫酸钡（白色）',
    'O4Pb1S1': '硫酸铅（白色）',
    'Ba1C1O3': '碳酸钡（白色）',
    'C1Ca1O3': '碳酸钙（白色）',
    'Ag2C1O3': '碳酸银（白色）',
    'Ba1O3S1': '亚硫酸钡（白色）',
    'Ca1O3S1': '亚硫酸钙（白色）',
    'Cu1H2O2': '氢氧化铜（蓝色）',
    'Fe1H3O3': '氢氧化铁（红褐色）',
    'Fe1H2O2': '氢氧化亚铁（白色）',
    'Al1H3O3': '氢氧化铝（白色）',
    'H2Mg1O2': '氢氧化镁（白色）',
    'H2O2Zn1': '氢氧化锌（白色）',
    'H2O2Pb1': '氢氧化铅（白色）'
  };

  var ACID_FORMULAS = {
    'HCl': '盐酸', 'H2SO4': '硫酸', 'HNO3': '硝酸',
    'H2CO3': '碳酸', 'H3PO4': '磷酸', 'H2S': '氢硫酸',
    'HBr': '氢溴酸', 'HI': '氢碘酸', 'HClO': '次氯酸',
    'CH3COOH': '醋酸', 'H2SO3': '亚硫酸'
  };

  var BASE_FORMULAS = {
    'NaOH': '氢氧化钠', 'KOH': '氢氧化钾', 'Ca(OH)2': '氢氧化钙',
    'Ba(OH)2': '氢氧化钡', 'LiOH': '氢氧化锂', 'Mg(OH)2': '氢氧化镁',
    'Cu(OH)2': '氢氧化铜', 'Fe(OH)3': '氢氧化铁', 'Fe(OH)2': '氢氧化亚铁',
    'Al(OH)3': '氢氧化铝', 'Zn(OH)2': '氢氧化锌', 'NH3·H2O': '一水合氨'
  };

  /* ============================================================
     分数运算
     ============================================================ */
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = b; b = a % b; a = t; }
    return a || 1;
  }
  function lcm(a, b) {
    if (!a || !b) return 0;
    return Math.abs(a * b) / gcd(a, b);
  }
  function Frac(n, d) {
    if (d === undefined) d = 1;
    if (d < 0) { n = -n; d = -d; }
    if (n === 0) { this.n = 0; this.d = 1; return; }
    var g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
  }
  Frac.prototype.add = function (o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); };
  Frac.prototype.sub = function (o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); };
  Frac.prototype.mul = function (o) { return new Frac(this.n * o.n, this.d * o.d); };
  Frac.prototype.div = function (o) { return new Frac(this.n * o.d, this.d * o.n); };
  Frac.prototype.isZero = function () { return this.n === 0; };

  /* ============================================================
     化学式解析（含电荷）
     ============================================================ */
  function parseFormula(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return null;

    s = s.replace(/\((s|l|g|aq)\)\s*$/i, '');
    s = s.replace(/\s+/g, '');
    if (!s) return null;

    /* 提取末尾电荷 */
    var charge = 0;
    var cm = s.match(/\^?(\d*)([+-])$/);
    if (cm) {
      var cn = cm[1] ? parseInt(cm[1], 10) : 1;
      charge = cm[2] === '+' ? cn : -cn;
      s = s.slice(0, s.length - cm[0].length);
      s = s.replace(/\^$/, '');
    }

    /* 电子 */
    if (s === 'e' || s === 'e-') {
      return { elements: {}, charge: charge || -1, raw: raw, isElectron: true };
    }
    if (!s) return null;

    var pos = 0;
    var len = s.length;

    function parseGroup() {
      var els = {};
      while (pos < len) {
        var ch = s.charAt(pos);
        if (ch === '(') {
          pos++;
          var sub = parseGroup();
          if (sub === null) return null;
          if (pos >= len || s.charAt(pos) !== ')') return null;
          pos++;
          var numStr = '';
          while (pos < len && /\d/.test(s.charAt(pos))) { numStr += s.charAt(pos); pos++; }
          var mult = numStr ? parseInt(numStr, 10) : 1;
          for (var e in sub) els[e] = (els[e] || 0) + sub[e] * mult;
        } else if (ch === ')') {
          return els;
        } else if (/[A-Z]/.test(ch)) {
          var name = ch;
          pos++;
          while (pos < len && /[a-z]/.test(s.charAt(pos))) { name += s.charAt(pos); pos++; }
          var nStr = '';
          while (pos < len && /\d/.test(s.charAt(pos))) { nStr += s.charAt(pos); pos++; }
          var n = nStr ? parseInt(nStr, 10) : 1;
          els[name] = (els[name] || 0) + n;
        } else {
          return null;
        }
      }
      return els;
    }

    var result = parseGroup();
    if (result === null) return null;
    if (pos < len) return null;
    if (!Object.keys(result).length) return null;
    return { elements: result, charge: charge, raw: raw, isElectron: false };
  }

  /* ============================================================
     方程式解析
     ============================================================ */
  function parseEquation(text) {
    var eq = String(text == null ? '' : text).trim();
    if (!eq) return { error: '请输入化学方程式' };

    eq = eq.replace(/-->|==>|—+>|→|=>|=+/g, '->');

    var parts = eq.split('->');
    if (parts.length !== 2) {
      return { error: '未找到反应箭头，请用 → 或 -> 分隔反应物与生成物' };
    }

    var left  = parts[0].trim();
    var right = parts[1].trim();
    if (!left || !right) return { error: '箭头两侧不能为空' };

    function parseSide(side) {
      var items = side.split('+');
      var list = [];
      for (var i = 0; i < items.length; i++) {
        var t = items[i].trim();
        if (!t) return null;
        var coef = 1;
        var formula = t;
        var m = t.match(/^(\d+)\s*(.+)$/);
        if (m) {
          coef = parseInt(m[1], 10);
          formula = m[2].trim();
        }
        var parsed = parseFormula(formula);
        if (!parsed) return { bad: formula };
        list.push({
          formula: formula,
          coef: coef,
          elements: parsed.elements,
          charge: parsed.charge,
          isElectron: parsed.isElectron
        });
      }
      return list;
    }

    var reactants = parseSide(left);
    var products  = parseSide(right);

    if (reactants === null || products === null) return { error: '反应物或生成物格式不正确' };
    if (reactants.bad) return { error: '无法解析化学式：' + reactants.bad };
    if (products.bad)  return { error: '无法解析化学式：' + products.bad };
    if (!reactants.length || !products.length) return { error: '反应物或生成物不能为空' };

    return { reactants: reactants, products: products };
  }

  /* ============================================================
     配平（含电荷行）
     ============================================================ */
  function balance(reactants, products) {
    var elementSet = {};
    reactants.forEach(function (r) { for (var e in r.elements) elementSet[e] = true; });
    products.forEach(function (p)  { for (var e in p.elements) elementSet[e] = true; });

    var elements = Object.keys(elementSet).sort();
    var hasCharge = reactants.some(function (r) { return r.charge !== 0; }) ||
                    products.some(function (p)  { return p.charge !== 0; });

    var nCols = reactants.length + products.length;
    var rows = [];

    elements.forEach(function (el) {
      var row = [];
      reactants.forEach(function (r) { row.push(new Frac(r.elements[el] || 0)); });
      products.forEach(function (p)  { row.push(new Frac(-(p.elements[el] || 0))); });
      rows.push(row);
    });

    if (hasCharge) {
      var cRow = [];
      reactants.forEach(function (r) { cRow.push(new Frac(r.charge)); });
      products.forEach(function (p)  { cRow.push(new Frac(-p.charge)); });
      rows.push(cRow);
    }

    if (!rows.length) return { error: '没有识别到任何元素或电荷' };

    var nRows = rows.length;

    /* 高斯-约当消元 */
    var pivotCols = [];
    var rowIdx = 0;
    for (var col = 0; col < nCols && rowIdx < nRows; col++) {
      var pivot = -1;
      for (var r = rowIdx; r < nRows; r++) {
        if (!rows[r][col].isZero()) { pivot = r; break; }
      }
      if (pivot === -1) continue;

      var tmp = rows[rowIdx]; rows[rowIdx] = rows[pivot]; rows[pivot] = tmp;

      var pv = rows[rowIdx][col];
      for (var c = 0; c < nCols; c++) rows[rowIdx][c] = rows[rowIdx][c].div(pv);

      for (var r2 = 0; r2 < nRows; r2++) {
        if (r2 === rowIdx) continue;
        var factor = rows[r2][col];
        if (factor.isZero()) continue;
        for (var c2 = 0; c2 < nCols; c2++) {
          rows[r2][c2] = rows[r2][c2].sub(factor.mul(rows[rowIdx][c2]));
        }
      }

      pivotCols.push(col);
      rowIdx++;
    }

    var freeCols = [];
    for (var c3 = 0; c3 < nCols; c3++) {
      if (pivotCols.indexOf(c3) === -1) freeCols.push(c3);
    }
    if (!freeCols.length) {
      return { error: '无法配平：方程只有零解，请检查化学式是否正确' };
    }

    var sol = [];
    for (var c4 = 0; c4 < nCols; c4++) sol.push(new Frac(0));
    freeCols.forEach(function (fc) { sol[fc] = new Frac(1); });

    for (var i2 = 0; i2 < pivotCols.length; i2++) {
      var pc = pivotCols[i2];
      var val = new Frac(0);
      for (var k2 = 0; k2 < freeCols.length; k2++) {
        var fc2 = freeCols[k2];
        val = val.sub(rows[i2][fc2].mul(sol[fc2]));
      }
      sol[pc] = val;
    }

    var L = 1;
    for (var i3 = 0; i3 < sol.length; i3++) L = lcm(L, sol[i3].d);
    var ints = sol.map(function (f) { return f.n * (L / f.d); });

    var g = 0;
    ints.forEach(function (n) { g = gcd(g, Math.abs(n)); });
    if (g > 1) ints = ints.map(function (n) { return n / g; });

    var hasPos = ints.some(function (n) { return n > 0; });
    var hasNeg = ints.some(function (n) { return n < 0; });
    if (hasPos && hasNeg) {
      return { error: '无法配平：系数正负不一致，请检查化学式' };
    }
    if (hasNeg && !hasPos) ints = ints.map(function (n) { return -n; });

    return { coefs: ints, hasCharge: hasCharge };
  }

  /* ============================================================
     原子守恒验证
     ============================================================ */
  function checkAtoms(coefs, reactants, products) {
    var set = {};
    reactants.forEach(function (r) { for (var e in r.elements) set[e] = true; });
    products.forEach(function (p)  { for (var e in p.elements) set[e] = true; });
    var els = Object.keys(set).sort();

    return els.map(function (el) {
      var left = 0, right = 0;
      reactants.forEach(function (r, i) { left  += (r.elements[el] || 0) * coefs[i]; });
      products.forEach(function (p, i)  { right += (p.elements[el] || 0) * coefs[reactants.length + i]; });
      return { el: el, left: left, right: right, ok: left === right };
    });
  }

  /* ============================================================
     电荷守恒验证
     ============================================================ */
  function checkCharge(coefs, reactants, products) {
    var left = 0, right = 0;
    var hasAny = false;
    reactants.forEach(function (r, i) {
      if (r.charge) hasAny = true;
      left += r.charge * coefs[i];
    });
    products.forEach(function (p, i) {
      if (p.charge) hasAny = true;
      right += p.charge * coefs[reactants.length + i];
    });
    return { left: left, right: right, ok: left === right, hasAny: hasAny };
  }

  /* ============================================================
     反应类型判断
     ============================================================ */
  function isSingleElement(f) {
    var keys = Object.keys(f.elements);
    return keys.length === 1;
  }
  function isWaterFormula(f) {
    return f.formula === 'H2O';
  }
  function isAcidFormula(f) {
    if (isWaterFormula(f)) return false;
    var fStr = f.formula;
    if (ACID_FORMULAS[fStr]) return true;
    if (/^H\d?/.test(fStr) && Object.keys(f.elements).length >= 2) return true;
    return false;
  }
  function isBaseFormula(f) {
    var fStr = f.formula;
    if (BASE_FORMULAS[fStr]) return true;
    if (fStr.indexOf('OH') >= 0) return true;
    return false;
  }

  function detectReactionType(reactants, products) {
    var R = reactants.length;
    var P = products.length;

    var rSingles = reactants.filter(isSingleElement).length;
    var pSingles = products.filter(isSingleElement).length;

    if (R === 1 && P >= 2) {
      return { name: '分解反应', desc: '一种物质 → 多种物质（一变多）' };
    }
    if (R >= 2 && P === 1) {
      return { name: '化合反应', desc: '多种物质 → 一种物质（多变一）' };
    }
    if (R === 2 && P === 2 && rSingles === 1 && pSingles === 1) {
      return { name: '置换反应', desc: '单质 + 化合物 → 新单质 + 新化合物' };
    }
    if (R === 2 && P >= 2 && rSingles === 0) {
      var acids = reactants.filter(isAcidFormula);
      var bases = reactants.filter(isBaseFormula);
      var hasWater = products.some(isWaterFormula);
      if (acids.length >= 1 && bases.length >= 1 && hasWater) {
        return { name: '中和反应', desc: '酸 + 碱 → 盐 + 水（复分解反应的一种）' };
      }
      var rCompounds = reactants.every(function (f) { return !isSingleElement(f); });
      if (rCompounds) {
        return { name: '复分解反应', desc: '两种化合物互相交换成分，生成另外两种或多种化合物' };
      }
    }
    return { name: '其他反应', desc: '未归入常见的四种基本反应类型' };
  }

  /* ============================================================
     产物状态判定
     ============================================================ */
  function canonicalKey(elements) {
    var keys = Object.keys(elements).sort();
    if (!keys.length) return '';
    return keys.map(function (k) { return k + elements[k]; }).join('');
  }

  function analyzeProductState(f) {
    var key = canonicalKey(f.elements);
    if (!key) {
      if (f.isElectron) return { tag: '电子', cls: 'normal' };
      return { tag: '未知', cls: 'normal' };
    }
    if (key === 'H2O1') {
      return { tag: '水', cls: 'water' };
    }
    if (GAS_NAMES[key]) {
      return { tag: GAS_NAMES[key] + ' ↑', cls: 'gas' };
    }
    if (PRECIPITATE_NAMES[key]) {
      return { tag: PRECIPITATE_NAMES[key] + ' ↓', cls: 'precip' };
    }
    return { tag: '水溶液 / 可溶', cls: 'normal' };
  }

  /* ============================================================
     摩尔质量
     ============================================================ */
  function molarMassOf(elements) {
    var sum = 0;
    var missing = [];
    for (var el in elements) {
      var m = ATOMIC_MASS[el];
      if (m === undefined) { missing.push(el); continue; }
      sum += m * elements[el];
    }
    return { value: sum, missing: missing };
  }

  /* ============================================================
     格式化
     ============================================================ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* ---------- 化学式渲染：数字转下标，末尾电荷转上标 ---------- */
  function subscriptFormula(s) {
    var str = String(s || '');
    if (!str) return '';

    /* 提取末尾电荷：如 "+"、"2+"、"^2-"、"-" */
    var chargeMatch = str.match(/(\^?\d*[+-])$/);
    var chargePart = '';
    if (chargeMatch) {
      chargePart = chargeMatch[1].replace(/^\^/, '');
      str = str.slice(0, str.length - chargeMatch[0].length);
    }

    /* 化学式主体：数字转下标 */
    var body = esc(str).replace(/(\d+)/g, '<span class="chem-sub">$1</span>');

    /* 电荷部分：转上标 */
    var chargeHtml = chargePart
      ? '<span class="chem-sup">' + esc(chargePart) + '</span>'
      : '';

    return body + chargeHtml;
  }

  /* ---------- 预设卡片：整条方程式的渲染 ---------- */
  function formatPresetEq(eq) {
    var s = String(eq || '');
    /* 先把独立的 + 和箭头替换为占位符，避免误伤电荷里的 + 与 - */
    s = s.replace(/\s*→\s*/g, '\u0001');
    s = s.replace(/\s+\+\s+/g, '\u0002');

    var parts = s.split(/([\u0001\u0002])/);
    return parts.map(function (part) {
      if (!part) return '';
      if (part === '\u0001') return '<span class="chem-preset-op">→</span>';
      if (part === '\u0002') return '<span class="chem-preset-op">+</span>';

      var m = part.match(/^(\s*)(\d+)?\s*(.+?)\s*$/);
      if (!m) return esc(part);
      var lead    = m[1] || '';
      var coef    = m[2] || '';
      var formula = m[3] || '';
      var coefHtml = coef ? '<span class="chem-preset-coef">' + coef + '</span>' : '';
      return lead + coefHtml + subscriptFormula(formula);
    }).join('');
  }

  /* ---------- 提示区里 code 化学式渲染 ---------- */
  function decorateFormulaHints() {
    document.querySelectorAll('#page-chemistry code.chem-formula').forEach(function (el) {
      var original = el.textContent.trim();
      el.innerHTML = subscriptFormula(original);
    });
  }

  function renderEquationHTML(coefs, reactants, products) {
    var html = '';
    reactants.forEach(function (r, i) {
      if (i > 0) html += '<span class="chem-op">+</span>';
      var c = coefs[i];
      if (c !== 1) html += '<span class="chem-coef">' + c + '</span>';
      html += subscriptFormula(r.formula);
    });
    html += '<span class="chem-arrow">→</span>';
    products.forEach(function (p, i) {
      if (i > 0) html += '<span class="chem-op">+</span>';
      var c = coefs[reactants.length + i];
      if (c !== 1) html += '<span class="chem-coef">' + c + '</span>';
      html += subscriptFormula(p.formula);
    });
    return html;
  }

  /* 纯文本版本（复制 / PNG 用），不带 HTML */
  function renderEquationText(coefs, reactants, products) {
    function fmt(r) {
      var c = r.coef;
      return (c === 1 ? '' : c) + r.formula;
    }
    var left = reactants.map(function (r, i) {
      var c = coefs[i];
      return (c === 1 ? '' : c) + r.formula;
    }).join(' + ');
    var right = products.map(function (p, i) {
      var c = coefs[reactants.length + i];
      return (c === 1 ? '' : c) + p.formula;
    }).join(' + ');
    return left + ' → ' + right;
  }

  /* ============================================================
     主流程
     ============================================================ */
  function showMsg(text, kind) {
    msgEl.textContent = text;
    msgEl.className = 'chem-msg' + (text ? ' show' : '') + (kind ? ' ' + kind : '');
  }

  function runAnalysis(text) {
    var t = String(text == null ? inputEl.value : text).trim();
    if (!t) {
      showMsg('请先输入化学方程式', 'err');
      outputEl.style.display = 'none';
      return;
    }

    var parsed = parseEquation(t);
    if (parsed.error) {
      showMsg(parsed.error, 'err');
      outputEl.style.display = 'none';
      return;
    }

    var bal = balance(parsed.reactants, parsed.products);
    if (bal.error) {
      showMsg(bal.error, 'err');
      outputEl.style.display = 'none';
      return;
    }

    var coefs = bal.coefs;
    var eqHTML = renderEquationHTML(coefs, parsed.reactants, parsed.products);
    var eqText = renderEquationText(coefs, parsed.reactants, parsed.products);

    lastText = eqText;
    lastData = {
      coefs: coefs,
      reactants: parsed.reactants,
      products: parsed.products
    };

    resultEl.innerHTML = eqHTML;
    outputEl.style.display = '';

    /* ---- 快捷标签 ---- */
    var rType = detectReactionType(parsed.reactants, parsed.products);
    var cCharge = checkCharge(coefs, parsed.reactants, parsed.products);
    var productStates = parsed.products.map(analyzeProductState);

    var tagsHTML = '';
    tagsHTML += '<span class="chem-quick-tag type">' + esc(rType.name) + '</span>';
    if (cCharge.hasAny) {
      tagsHTML += '<span class="chem-quick-tag charge' + (cCharge.ok ? '' : ' bad') + '">' +
        (cCharge.ok ? '电荷守恒' : '电荷不平衡') + '</span>';
    } else {
      tagsHTML += '<span class="chem-quick-tag muted">所有物质均电中性</span>';
    }
    productStates.forEach(function (s) {
      if (s.cls === 'gas') tagsHTML += '<span class="chem-quick-tag gas">生成气体</span>';
      if (s.cls === 'precip') tagsHTML += '<span class="chem-quick-tag precip">生成沉淀</span>';
      if (s.cls === 'water') tagsHTML += '<span class="chem-quick-tag water">生成水</span>';
    });
    quickTagsEl.innerHTML = tagsHTML;

    /* ---- 原子守恒表 ---- */
    var rows = checkAtoms(coefs, parsed.reactants, parsed.products);
    var allOk = rows.every(function (r) { return r.ok; });

    var checkHtml = '' +
      '<div class="chem-check-row head">' +
        '<span>元素</span>' +
        '<span>反应物侧</span>' +
        '<span>生成物侧</span>' +
        '<span style="text-align:center;">状态</span>' +
      '</div>';
    rows.forEach(function (r) {
      checkHtml +=
        '<div class="chem-check-row">' +
          '<span class="chem-check-el">' + esc(r.el) + '</span>' +
          '<span class="chem-check-num">' + r.left + '</span>' +
          '<span class="chem-check-num">' + r.right + '</span>' +
          '<span class="chem-check-badge ' + (r.ok ? 'ok' : 'bad') + '">' +
            (r.ok ? '✓ 守恒' : '✗ 不平衡') +
          '</span>' +
        '</div>';
    });
    if (cCharge.hasAny) {
      checkHtml +=
        '<div class="chem-check-row" style="margin-top:8px;">' +
          '<span class="chem-check-el">电荷</span>' +
          '<span class="chem-check-num">' + (cCharge.left >= 0 ? '+' : '') + cCharge.left + '</span>' +
          '<span class="chem-check-num">' + (cCharge.right >= 0 ? '+' : '') + cCharge.right + '</span>' +
          '<span class="chem-check-badge ' + (cCharge.ok ? 'ok' : 'bad') + '">' +
            (cCharge.ok ? '✓ 守恒' : '✗ 不平衡') +
          '</span>' +
        '</div>';
    }
    checkEl.innerHTML = checkHtml;

    /* ---- 摩尔质量 ---- */
    renderMass(coefs, parsed.reactants, parsed.products);

    /* ---- 反应分析 ---- */
    renderAnalysis(rType, cCharge, parsed.reactants, parsed.products, coefs);

    /* ---- 消息 ---- */
    if (allOk && (!cCharge.hasAny || cCharge.ok)) {
      showMsg('配平完成：' + eqText, 'ok');
    } else {
      showMsg('配平完成，但存在未守恒的项目，请检查输入', 'err');
    }
  }

  /* ============================================================
     摩尔质量渲染
     ============================================================ */
  function renderMass(coefs, reactants, products) {
    var html = '';
    var anyMissing = [];

    function buildRows(list, offset, title) {
      var rows = '';
      var totalMass = 0;

      rows += '<div class="chem-mass-row head">' +
        '<span>化学式</span>' +
        '<span>系数</span>' +
        '<span>单个摩尔质量 (g/mol)</span>' +
        '<span>配平后总质量 (g/mol)</span>' +
      '</div>';

      list.forEach(function (f, i) {
        var mm = molarMassOf(f.elements);
        var coef = coefs[offset + i];
        var single = mm.value;
        var total  = single * coef;
        totalMass += total;

        if (mm.missing.length) {
          mm.missing.forEach(function (m) { if (anyMissing.indexOf(m) < 0) anyMissing.push(m); });
        }

        var displayFormula = f.isElectron ? subscriptFormula('e-') : subscriptFormula(f.formula);

        rows += '<div class="chem-mass-row">' +
          '<span class="chem-mass-formula">' + displayFormula + '</span>' +
          '<span class="chem-mass-num">' + coef + '</span>' +
          '<span class="chem-mass-num">' + single.toFixed(2) + '</span>' +
          '<span class="chem-mass-total">' + total.toFixed(2) + '</span>' +
        '</div>';
      });

      var block = '<div class="chem-mass-section">' +
        '<div class="chem-mass-title">' + title + '</div>' +
        rows +
        '<div class="chem-mass-sum">' +
          '<span>' + title + '总质量</span>' +
          '<span class="val">' + totalMass.toFixed(2) + ' g/mol</span>' +
        '</div>' +
      '</div>';

      return { html: block, totalMass: totalMass };
    }

    var rBlock = buildRows(reactants, 0, '反应物侧');
    var pBlock = buildRows(products, reactants.length, '生成物侧');

    html += rBlock.html;
    html += pBlock.html;

    var delta = Math.abs(rBlock.totalMass - pBlock.totalMass);
    var balanced = delta < 0.05;

    if (balanced) {
      html += '<p class="chem-mass-note">✓ 质量守恒验证通过：反应物总质量 = 生成物总质量（' +
        rBlock.totalMass.toFixed(2) + ' g/mol）</p>';
    } else {
      html += '<p class="chem-mass-note" style="color:#b91c1c;">✗ 质量未守恒，差值 ' + delta.toFixed(2) + ' g/mol，请检查化学式</p>';
    }

    if (anyMissing.length) {
      html += '<p class="chem-mass-note" style="color:#8a6414;">⚠️ 原子量表中未找到：' +
        anyMissing.map(esc).join('、') + '，已按 0 计入，仅供参考</p>';
    }

    massEl.innerHTML = html;
  }

  /* ============================================================
     反应分析渲染
     ============================================================ */
  function renderAnalysis(rType, cCharge, reactants, products, coefs) {
    var html = '';

    /* 反应类型 */
    html += '<div class="chem-analysis-block">' +
      '<div class="chem-analysis-title">反应类型</div>' +
      '<div class="chem-analysis-body">' +
        '<p><b>' + esc(rType.name) + '</b></p>' +
        '<p>' + esc(rType.desc) + '</p>' +
      '</div>' +
    '</div>';

    /* 生成物状态（化学式带上/下标） */
    var stateTags = products.map(function (p, i) {
      var s = analyzeProductState(p);
      var coef = coefs[reactants.length + i];
      var coefHtml = coef === 1 ? '' : '<span class="chem-coef-inline">' + coef + '</span>';
      var labelHtml = coefHtml + subscriptFormula(p.formula);
      return { labelHtml: labelHtml, tag: s.tag, cls: s.cls };
    });

    html += '<div class="chem-analysis-block">' +
      '<div class="chem-analysis-title">生成物状态</div>' +
      '<div class="chem-analysis-body">' +
        '<div class="chem-analysis-tags">' +
          stateTags.map(function (t) {
            return '<span class="chem-tag ' + t.cls + '">' + t.labelHtml + '：' + esc(t.tag) + '</span>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>';

    /* 电荷 */
    if (cCharge.hasAny) {
      html += '<div class="chem-analysis-block">' +
        '<div class="chem-analysis-title">电荷守恒</div>' +
        '<div class="chem-analysis-body">' +
          '<p>反应物侧总电荷：<code>' + (cCharge.left >= 0 ? '+' : '') + cCharge.left + '</code>　·　生成物侧总电荷：<code>' + (cCharge.right >= 0 ? '+' : '') + cCharge.right + '</code></p>' +
          '<p>' + (cCharge.ok ? '✓ 两侧电荷相等，电荷守恒' : '✗ 两侧电荷不相等，请检查离子电荷') + '</p>' +
        '</div>' +
      '</div>';
    } else {
      html += '<div class="chem-analysis-block">' +
        '<div class="chem-analysis-title">电荷</div>' +
        '<div class="chem-analysis-body">' +
          '<p>所有反应物与生成物均为电中性，无需进行电荷配平。</p>' +
        '</div>' +
      '</div>';
    }

    /* 反应物简况（化学式带上/下标） */
    var rInfo = reactants.map(function (r) {
      var kinds = Object.keys(r.elements);
      if (r.isElectron) return subscriptFormula('e-') + '（电子）';
      if (kinds.length === 1) return subscriptFormula(r.formula) + '（单质）';
      return subscriptFormula(r.formula) + '（化合物）';
    }).join('、');

    html += '<div class="chem-analysis-block">' +
      '<div class="chem-analysis-title">反应物简况</div>' +
      '<div class="chem-analysis-body">' +
        '<p>' + rInfo + '</p>' +
      '</div>' +
    '</div>';

    analysisEl.innerHTML = html;
  }

  /* ============================================================
     预设
     ============================================================ */
  var PRESETS = [
    { name: '铁在氧气中燃烧',     eq: 'Fe + O2 -> Fe3O4' },
    { name: '氢气在氧气中燃烧',   eq: 'H2 + O2 -> H2O' },
    { name: '碳在氧气中完全燃烧', eq: 'C + O2 -> CO2' },
    { name: '甲烷完全燃烧',       eq: 'CH4 + O2 -> CO2 + H2O' },
    { name: '电解水',             eq: 'H2O -> H2 + O2' },
    { name: '加热氯酸钾制氧气',   eq: 'KClO3 -> KCl + O2' },
    { name: '加热高锰酸钾',       eq: 'KMnO4 -> K2MnO4 + MnO2 + O2' },
    { name: '一氧化碳还原氧化铁', eq: 'Fe2O3 + CO -> Fe + CO2' },
    { name: '铁与硫酸铜反应',     eq: 'Fe + CuSO4 -> FeSO4 + Cu' },
    { name: '大理石与稀盐酸',     eq: 'CaCO3 + HCl -> CaCl2 + H2O + CO2' },
    { name: '氢氧化钠与盐酸中和', eq: 'NaOH + HCl -> NaCl + H2O' },
    { name: '光合作用',           eq: 'CO2 + H2O -> C6H12O6 + O2' },
    { name: '铝在氧气中燃烧',     eq: 'Al + O2 -> Al2O3' },
    { name: '铁与稀硫酸反应',     eq: 'Fe + H2SO4 -> FeSO4 + H2' },
    { name: '澄清石灰水变浑浊',   eq: 'Ca(OH)2 + CO2 -> CaCO3 + H2O' },
    { name: '铁生锈（简化）',     eq: 'Fe + O2 + H2O -> Fe(OH)3' },
    { name: '硫酸铜与氢氧化钠',   eq: 'CuSO4 + NaOH -> Cu(OH)2 + Na2SO4' },
    { name: '碳酸钠与盐酸',       eq: 'Na2CO3 + HCl -> NaCl + H2O + CO2' },
    { name: '锌与稀硫酸制氢气',   eq: 'Zn + H2SO4 -> ZnSO4 + H2' },
    { name: '铁与稀盐酸',         eq: 'Fe + HCl -> FeCl2 + H2' },
    { name: '铁离子被还原（离子）', eq: 'Fe3+ + e- -> Fe2+' },
    { name: '锌与铜离子置换（离子）', eq: 'Zn + Cu2+ -> Zn2+ + Cu' },
    { name: '铁与银离子置换（离子）', eq: 'Fe + Ag+ -> Fe2+ + Ag' },
    { name: '硫酸根与钡离子沉淀（离子）', eq: 'Ba2+ + SO4^2- -> BaSO4' },
    { name: '氯气与碘离子（离子）', eq: 'Cl2 + I- -> Cl- + I2' },
    { name: '过氧化氢分解',       eq: 'H2O2 -> H2O + O2' },
    { name: '氧化钙与水反应',     eq: 'CaO + H2O -> Ca(OH)2' },
    { name: '乙醇燃烧',           eq: 'C2H5OH + O2 -> CO2 + H2O' }
  ];

  function renderPresets(filter) {
    var box = document.getElementById('chemPresets');
    if (!box) return;

    var f = String(filter || '').toLowerCase().trim();
    var items = PRESETS.filter(function (p) {
      if (!f) return true;
      return p.name.toLowerCase().indexOf(f) >= 0 || p.eq.toLowerCase().indexOf(f) >= 0;
    });

    if (!items.length) {
      box.innerHTML = '<p class="chem-preset-empty">没有匹配的方程式，换个关键词试试～</p>';
      return;
    }

    box.innerHTML = items.map(function (p) {
      return '' +
        '<button type="button" class="chem-preset" data-eq="' + esc(p.eq) + '">' +
          '<span class="chem-preset-name">' + esc(p.name) + '</span>' +
          '<span class="chem-preset-eq">' + formatPresetEq(p.eq.replace('->', ' → ')) + '</span>' +
        '</button>';
    }).join('');

    box.querySelectorAll('.chem-preset').forEach(function (btn) {
      btn.addEventListener('click', function () {
        inputEl.value = btn.dataset.eq;
        runAnalysis(btn.dataset.eq);
      });
    });
  }

  /* ============================================================
     复制 / 导出 PNG
     ============================================================ */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('已复制到剪贴板');
      }).catch(function () { fallbackCopy(text); });
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
    try { document.execCommand('copy'); showToast('已复制'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function exportPng() {
    if (!lastData) { showToast('请先完成一次分析'); return; }

    var coefs     = lastData.coefs;
    var reactants = lastData.reactants;
    var products  = lastData.products;

    var rows = checkAtoms(coefs, reactants, products);
    var cCharge = checkCharge(coefs, reactants, products);
    var rType = detectReactionType(reactants, products);
    var eqText = lastText;

    var FONT = '"PingFang SC","Microsoft YaHei",sans-serif';
    var MONO = 'Consolas, Menlo, "Courier New", monospace';

    var W = 880;
    var PAD = 46;
    var HEAD_H = 92;
    var EQ_H = 96;
    var TYPE_H = 48;
    var TABLE_HEAD = 32;
    var ROW_H = 34;
    var FOOT_H = 50;

    var nRows = rows.length + (cCharge.hasAny ? 1 : 0);
    var H = PAD + HEAD_H + EQ_H + TYPE_H + TABLE_HEAD + nRows * ROW_H + FOOT_H + PAD;

    var dpr = 2;
    var canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f5b301';
    ctx.fillRect(0, 0, W, 5);

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    /* 标题 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = '800 24px ' + FONT;
    ctx.fillText('化学方程式分析', PAD, PAD + 22);

    ctx.fillStyle = '#9c8a5a';
    ctx.font = '13px ' + FONT;
    ctx.fillText('岁窦工具箱 · 化学方程式', PAD, PAD + 54);

    ctx.strokeStyle = '#f0e0b0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, PAD + HEAD_H - 8);
    ctx.lineTo(W - PAD, PAD + HEAD_H - 8);
    ctx.stroke();

    /* 方程式 */
    var eqTop = PAD + HEAD_H;
    ctx.fillStyle = '#fffaf0';
    ctx.strokeStyle = '#f0e0b0';
    roundRect(ctx, PAD, eqTop, W - PAD * 2, EQ_H - 14, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#b47c00';
    ctx.font = '800 24px ' + MONO;
    ctx.fillText(eqText, W / 2, eqTop + (EQ_H - 14) / 2);

    /* 反应类型 */
    var typeTop = eqTop + EQ_H;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#b47c00';
    ctx.font = '800 13px ' + FONT;
    ctx.fillText('反应类型：', PAD + 4, typeTop + 22);
    ctx.fillStyle = '#3a2a00';
    ctx.font = '700 14px ' + FONT;
    ctx.fillText(rType.name, PAD + 80, typeTop + 22);

    /* 表格 */
    var tableTop = typeTop + TYPE_H;
    var colX = [PAD + 24, PAD + 220, PAD + 420, W - PAD - 130];

    ctx.textAlign = 'left';
    ctx.fillStyle = '#9c8a5a';
    ctx.font = '800 12.5px ' + FONT;
    ctx.fillText('元素', colX[0], tableTop + TABLE_HEAD / 2);
    ctx.fillText('反应物侧', colX[1], tableTop + TABLE_HEAD / 2);
    ctx.fillText('生成物侧', colX[2], tableTop + TABLE_HEAD / 2);
    ctx.textAlign = 'center';
    ctx.fillText('状态', colX[3] + 60, tableTop + TABLE_HEAD / 2);

    var y = tableTop + TABLE_HEAD;

    function drawRow(label, left, right, ok) {
      ctx.fillStyle = '#fffaf0';
      ctx.strokeStyle = '#f0e0b0';
      roundRect(ctx, PAD, y + 3, W - PAD * 2, ROW_H - 6, 8);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#b47c00';
      ctx.font = '800 15px ' + MONO;
      ctx.fillText(label, colX[0], y + ROW_H / 2);

      ctx.fillStyle = '#3a2a00';
      ctx.font = '700 14px ' + MONO;
      ctx.fillText(String(left),  colX[1], y + ROW_H / 2);
      ctx.fillText(String(right), colX[2], y + ROW_H / 2);

      var bw = 88, bh = 22;
      var bx = colX[3] + 60 - bw / 2;
      var by = y + ROW_H / 2 - bh / 2;
      ctx.fillStyle = ok ? '#e8f2ec' : '#fbeaea';
      roundRect(ctx, bx, by, bw, bh, 999);
      ctx.fill();
      ctx.fillStyle = ok ? '#3f6b52' : '#8f3a3a';
      ctx.font = '800 12px ' + FONT;
      ctx.textAlign = 'center';
      ctx.fillText(ok ? '✓ 守恒' : '✗ 不平衡', bx + bw / 2, by + bh / 2);

      y += ROW_H;
    }

    rows.forEach(function (r) { drawRow(r.el, r.left, r.right, r.ok); });
    if (cCharge.hasAny) {
      drawRow('电荷',
        (cCharge.left >= 0 ? '+' : '') + cCharge.left,
        (cCharge.right >= 0 ? '+' : '') + cCharge.right,
        cCharge.ok);
    }

    /* 底部 */
    var d = new Date();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c0b48f';
    ctx.font = '12px ' + FONT;
    ctx.fillText(
      '导出时间：' + d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()),
      W / 2,
      H - PAD + 6
    );

    var fileName = '化学方程式_' +
      d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '_' +
      pad2(d.getHours()) + pad2(d.getMinutes()) + '.png';

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) { showToast('导出失败，请重试'); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        showToast('已导出 PNG');
      }, 'image/png');
    } else {
      var a2 = document.createElement('a');
      a2.href = canvas.toDataURL('image/png');
      a2.download = fileName;
      document.body.appendChild(a2);
      a2.click();
      document.body.removeChild(a2);
      showToast('已导出 PNG');
    }
  }

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    if (window.__chemistryInited) return;
    window.__chemistryInited = true;

    renderPresets('');
    decorateFormulaHints();

    document.querySelectorAll('#page-chemistry .ta-subtab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#page-chemistry .ta-subtab').forEach(function (t) {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        var target = tab.dataset.chem;
        document.querySelectorAll('#page-chemistry .ta-subpage').forEach(function (p) {
          p.classList.toggle('active', p.dataset.chemPage === target);
        });
      });
    });

    document.getElementById('chemBalance').addEventListener('click', function () {
      runAnalysis();
    });

    document.getElementById('chemSample').addEventListener('click', function () {
      var sample = 'Fe2O3 + CO -> Fe + CO2';
      inputEl.value = sample;
      runAnalysis(sample);
    });

    document.getElementById('chemClear').addEventListener('click', function () {
      inputEl.value = '';
      outputEl.style.display = 'none';
      showMsg('', '');
      inputEl.focus();
    });

    document.getElementById('chemCopy').addEventListener('click', function () {
      if (!lastText) return;
      copyText(lastText);
    });

    document.getElementById('chemExportPng').addEventListener('click', exportPng);

    var searchInput = document.getElementById('chemPresetSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderPresets(searchInput.value);
      });
    }

    inputEl.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runAnalysis();
      }
    });
  }

  window.__chemistryInit = init;

  var pageEl = document.getElementById('page-chemistry');
  if (pageEl && pageEl.classList.contains('active')) {
    init();
  }

  console.log('[化学方程式] 已加载');
})();