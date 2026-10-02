/* ============================================================
   矩阵运算 · 岁窦工具箱 V4.0
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-matrixcalc');
  if (!page) return;

  var op = 'add';
  var A = [], B = [];

  var rowsAEl = document.getElementById('mxRowsA');
  var colsAEl = document.getElementById('mxColsA');
  var rowsBEl = document.getElementById('mxRowsB');
  var colsBEl = document.getElementById('mxColsB');
  var opEl    = document.getElementById('mxOp');
  var gridAEl = document.getElementById('mxMatrixA');
  var gridBEl = document.getElementById('mxMatrixB');
  var boxBEl  = document.getElementById('mxMatrixBBox');
  var rowsBField = document.getElementById('mxRowsBField');
  var colsBField = document.getElementById('mxColsBField');
  var opField    = document.getElementById('mxOpField');
  var msgEl      = document.getElementById('mxMsg');
  var resultPanel= document.getElementById('mxResultPanel');
  var resultEl   = document.getElementById('mxResult');
  var stepsEl    = document.getElementById('mxSteps');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function parseVal(s) {
    s = String(s == null ? '' : s).trim();
    if (s === '') return NaN;
    s = s.replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/[−–—]/g, '-');
    var m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
    if (m) {
      var d = parseFloat(m[2]);
      if (d === 0) return NaN;
      return parseFloat(m[1]) / d;
    }
    var n = parseFloat(s);
    return isFinite(n) ? n : NaN;
  }
  function fmt(n) {
    if (!isFinite(n)) return '—';
    if (n === 0) return '0';
    var r = parseFloat(n.toPrecision(8));
    if (Math.abs(r - Math.round(r)) < 1e-9) return String(Math.round(r));
    return String(r);
  }
  function showMsg(text, kind) {
    msgEl.textContent = text;
    msgEl.className = 'mx-msg' + (text ? ' show' : '') + (kind ? ' ' + kind : '');
  }

  function readGrid(gridEl, rows, cols) {
    var inputs = gridEl.querySelectorAll('input');
    var out = [];
    for (var r = 0; r < rows; r++) {
      var row = [];
      for (var c = 0; c < cols; c++) {
        var idx = r * cols + c;
        row.push(parseVal(inputs[idx] ? inputs[idx].value : ''));
      }
      out.push(row);
    }
    return out;
  }

  function buildGrid(gridEl, rows, cols, data) {
    gridEl.style.gridTemplateColumns = 'repeat(' + cols + ', auto)';
    gridEl.innerHTML = '';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var input = document.createElement('input');
        input.type = 'text';
        input.dataset.r = r;
        input.dataset.c = c;
        input.value = (data && data[r] && data[r][c] != null) ? String(data[r][c]) : '';
        input.placeholder = 'a' + (r + 1) + (c + 1);
        gridEl.appendChild(input);
      }
    }
  }

  function syncSizeFields() {
    var needB = (op === 'add' || op === 'mul');
    boxBEl.style.display = needB ? '' : 'none';
    rowsBField.style.display = needB ? '' : 'none';
    colsBField.style.display = needB ? '' : 'none';
    opField.style.display = (op === 'add') ? '' : 'none';
  }

  function rebuildGrids() {
    var rA = parseInt(rowsAEl.value, 10);
    var cA = parseInt(colsAEl.value, 10);
    var rB = parseInt(rowsBEl.value, 10);
    var cB = parseInt(colsBEl.value, 10);
    buildGrid(gridAEl, rA, cA, A);
    buildGrid(gridBEl, rB, cB, B);
  }

  function setOp(newOp) {
    op = newOp;
    var isBinary = (op === 'add' || op === 'mul');
    var isSquare = (op === 'determinant' || op === 'inverse');

    if (op === 'mul') {
      /* B 的行数 = A 的列数 */
      rowsBEl.value = colsAEl.value;
    }
    if (op === 'add') {
      rowsBEl.value = rowsAEl.value;
      colsBEl.value = colsAEl.value;
    }
    if (isSquare) {
      /* 行列式与逆矩阵需要方阵 */
      colsAEl.value = rowsAEl.value;
    }

    syncSizeFields();
    rebuildGrids();
    if (isBinary) {
      opEl.disabled = false;
    }
    if (op === 'mul') {
      rowsBEl.disabled = true;
      colsBEl.disabled = false;
    } else if (op === 'add') {
      rowsBEl.disabled = true;
      colsBEl.disabled = true;
    } else if (isSquare) {
      colsAEl.disabled = true;
    }
  }

  /* 四则运算 */
  function matAdd(A, B, sign) {
    return A.map(function (row, r) {
      return row.map(function (v, c) { return v + sign * B[r][c]; });
    });
  }
  function matMul(A, B) {
    var n = A.length, m = A[0].length, p = B[0].length;
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push([]);
      for (var k = 0; k < p; k++) {
        var sum = 0;
        for (var j = 0; j < m; j++) sum += A[i][j] * B[j][k];
        out[i].push(sum);
      }
    }
    return out;
  }
  function matTranspose(M) {
    var n = M.length, m = M[0].length;
    var out = [];
    for (var c = 0; c < m; c++) {
      out.push([]);
      for (var r = 0; r < n; r++) out[c].push(M[r][c]);
    }
    return out;
  }
  function matDet(M) {
    var n = M.length;
    if (n === 1) return M[0][0];
    if (n === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0];
    /* 高斯消元求行列式 */
    var a = M.map(function (r) { return r.slice(); });
    var det = 1;
    for (var i = 0; i < n; i++) {
      var pivot = i;
      for (var r2 = i; r2 < n; r2++) {
        if (Math.abs(a[r2][i]) > Math.abs(a[pivot][i])) pivot = r2;
      }
      if (Math.abs(a[pivot][i]) < 1e-12) return 0;
      if (pivot !== i) { var t = a[i]; a[i] = a[pivot]; a[pivot] = t; det = -det; }
      det *= a[i][i];
      for (var r3 = i + 1; r3 < n; r3++) {
        var f = a[r3][i] / a[i][i];
        for (var c2 = i; c2 < n; c2++) a[r3][c2] -= f * a[i][c2];
      }
    }
    return det;
  }
  function matInverse(M) {
    var n = M.length;
    var det = matDet(M);
    if (Math.abs(det) < 1e-12) return null;

    /* 先把伴随矩阵的 n 行都初始化好 */
    var adj = [];
    for (var r0 = 0; r0 < n; r0++) adj.push([]);

    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        /* 求 M[i][j] 的代数余子式 */
        var sub = [];
        for (var r = 0; r < n; r++) {
          if (r === i) continue;
          var row = [];
          for (var c = 0; c < n; c++) {
            if (c === j) continue;
            row.push(M[r][c]);
          }
          sub.push(row);
        }
        var sign = ((i + j) % 2 === 0) ? 1 : -1;
        /* 伴随矩阵 = 代数余子式矩阵的转置 */
        adj[j][i] = sign * matDet(sub);
      }
    }

    var inv = [];
    for (var r2 = 0; r2 < n; r2++) {
      inv.push([]);
      for (var c2 = 0; c2 < n; c2++) inv[r2].push(adj[r2][c2] / det);
    }
    return inv;
  }

  function matrixToHtml(M, label) {
    var cols = M[0].length;
    var html = '<div class="mx-res-row"><span class="mx-res-label">' + esc(label) + '</span></div>';
    html += '<div class="mx-result-matrix" style="grid-template-columns:repeat(' + cols + ',auto);">';
    M.forEach(function (row) {
      row.forEach(function (v) {
        html += '<span class="mx-res-cell">' + fmt(v) + '</span>';
      });
    });
    html += '</div>';
    return html;
  }

  function compute() {
    var rA = parseInt(rowsAEl.value, 10);
    var cA = parseInt(colsAEl.value, 10);
    var rB = parseInt(rowsBEl.value, 10);
    var cB = parseInt(colsBEl.value, 10);

    A = readGrid(gridAEl, rA, cA);
    B = readGrid(gridBEl, rB, cB);

    /* 检查 NaN */
    for (var i = 0; i < A.length; i++) {
      for (var j = 0; j < A[i].length; j++) {
        if (!isFinite(A[i][j])) {
          showMsg('矩阵 A 第 ' + (i + 1) + ' 行第 ' + (j + 1) + ' 列不是有效数字', 'err');
          resultPanel.style.display = 'none';
          return;
        }
      }
    }
    for (var i2 = 0; i2 < B.length; i2++) {
      for (var j2 = 0; j2 < B[i2].length; j2++) {
        if (!isFinite(B[i2][j2])) {
          showMsg('矩阵 B 第 ' + (i2 + 1) + ' 行第 ' + (j2 + 1) + ' 列不是有效数字', 'err');
          resultPanel.style.display = 'none';
          return;
        }
      }
    }

    var html = '';
    var steps = [];

    try {
      if (op === 'add' || op === 'sub') {
        if (rA !== rB || cA !== cB) throw new Error('加法 / 减法要求两个矩阵行列数完全相同');
        var sign = op === 'add' ? 1 : -1;
        var res = matAdd(A, B, sign);
        html = matrixToHtml(res, op === 'add' ? 'A + B' : 'A − B');
        steps.push('矩阵同型（' + rA + ' × ' + cA + '），逐元素' + (op === 'add' ? '相加' : '相减'));
        for (var r = 0; r < rA; r++) {
          for (var c = 0; c < cA; c++) {
            var va = A[r][c], vb = B[r][c];
            var sym = op === 'add' ? '+' : '−';
            steps.push('c' + (r + 1) + (c + 1) + ' = ' + fmt(va) + ' ' + sym + ' ' + fmt(vb) + ' = ' + fmt(res[r][c]));
          }
        }
      } else if (op === 'mul') {
        if (cA !== rB) throw new Error('乘法要求 A 的列数 = B 的行数');
        var res2 = matMul(A, B);
        html = matrixToHtml(res2, 'A × B');
        steps.push('A 是 ' + rA + ' × ' + cA + '，B 是 ' + rB + ' × ' + cB + '，乘积为 ' + rA + ' × ' + cB);
        for (var i3 = 0; i3 < rA; i3++) {
          for (var k3 = 0; k3 < cB; k3++) {
            var terms = [];
            var sum = 0;
            for (var j3 = 0; j3 < cA; j3++) {
              terms.push(fmt(A[i3][j3]) + '×' + fmt(B[j3][k3]));
              sum += A[i3][j3] * B[j3][k3];
            }
            steps.push('c' + (i3 + 1) + (k3 + 1) + ' = ' + terms.join(' + ') + ' = ' + fmt(sum));
          }
        }
      } else if (op === 'transpose') {
        var res3 = matTranspose(A);
        html = matrixToHtml(res3, 'Aᵀ');
        steps.push('A 是 ' + rA + ' × ' + cA + '，转置后为 ' + cA + ' × ' + rA);
      } else if (op === 'determinant') {
        if (rA !== cA) throw new Error('行列式只对方阵定义');
        var det = matDet(A);
        html = '<div class="mx-res-row"><span class="mx-res-label">|A| =</span><span class="mx-res-value">' + fmt(det) + '</span></div>';
        steps.push('矩阵为 ' + rA + ' × ' + cA + ' 方阵');
        if (rA === 2) {
          steps.push('|A| = ' + fmt(A[0][0]) + '×' + fmt(A[1][1]) + ' − ' + fmt(A[0][1]) + '×' + fmt(A[1][0]) + ' = ' + fmt(det));
        } else if (rA === 3) {
          steps.push('|A| = a11(a22a33 − a23a32) − a12(a21a33 − a23a31) + a13(a21a32 − a22a31)');
          steps.push('     = ' + fmt(det));
        } else {
          steps.push('采用高斯消元，结果 = ' + fmt(det));
        }
      } else if (op === 'inverse') {
        if (rA !== cA) throw new Error('逆矩阵只对方阵定义');
        var det2 = matDet(A);
        if (Math.abs(det2) < 1e-12) throw new Error('行列式为 0，矩阵不可逆');
        var inv = matInverse(A);
        html = matrixToHtml(inv, 'A⁻¹');
        steps.push('|A| = ' + fmt(det2) + '（不为 0，可逆）');
        steps.push('A⁻¹ = adj(A) / |A|');
        steps.push('由于元素较多，此处不展开每个余子式');
      }

      resultEl.innerHTML = html;
      stepsEl.innerHTML = steps.map(function (s) {
        return '<div class="mx-step">' + esc(s) + '</div>';
      }).join('');
      resultPanel.style.display = '';
      showMsg('计算完成', 'ok');
    } catch (err) {
      showMsg(err.message || '计算失败', 'err');
      resultPanel.style.display = 'none';
    }
  }

  /* 绑定 */
  document.querySelectorAll('#page-matrixcalc .ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#page-matrixcalc .ta-subtab').forEach(function (t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      setOp(tab.dataset.mx);
      resultPanel.style.display = 'none';
      showMsg('', '');
    });
  });

  [rowsAEl, colsAEl, rowsBEl, colsBEl].forEach(function (el) {
    el.addEventListener('change', function () {
      /* 乘法 / 加法联动 */
      if (op === 'mul') rowsBEl.value = colsAEl.value;
      if (op === 'add') { rowsBEl.value = rowsAEl.value; colsBEl.value = colsAEl.value; }
      if (op === 'determinant' || op === 'inverse') colsAEl.value = rowsAEl.value;
      rebuildGrids();
    });
  });

  opEl.addEventListener('change', function () { /* 保持简单，仅 add/sub */ });

  document.getElementById('mxCompute').addEventListener('click', compute);

  document.getElementById('mxRandom').addEventListener('click', function () {
    gridAEl.querySelectorAll('input').forEach(function (inp) {
      inp.value = String(Math.floor(Math.random() * 19) - 9);
    });
    gridBEl.querySelectorAll('input').forEach(function (inp) {
      inp.value = String(Math.floor(Math.random() * 19) - 9);
    });
    showMsg('已随机填充 -9 到 9 的整数', 'ok');
  });

  document.getElementById('mxClear').addEventListener('click', function () {
    gridAEl.querySelectorAll('input').forEach(function (inp) { inp.value = ''; });
    gridBEl.querySelectorAll('input').forEach(function (inp) { inp.value = ''; });
    resultPanel.style.display = 'none';
    showMsg('', '');
  });

  function init() {
    if (window.__matrixcalcInited) return;
    window.__matrixcalcInited = true;
    setOp('add');
  }

  window.__matrixcalcInit = function () {
    if (!window.__matrixcalcInited) init();
  };

  if (page.classList.contains('active')) init();
  console.log('[矩阵运算] 已加载');
})();