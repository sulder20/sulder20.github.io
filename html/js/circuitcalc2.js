/* ============================================================
   电路计算 · 岁窦工具箱 V4.0
   ============================================================ */
(function () {
  'use strict';

  var container = document.getElementById('ccContainer');
  if (!container) return;

  var tabsEl = document.getElementById('ccTabs');

  var GROUPS = [
    {
      id: 'series',
      name: '串联电阻',
      formulas: [
        {
          id: 'series2',
          name: '两电阻串联',
          formula: 'R = R₁ + R₂',
          vars: [
            { key: 'R', label: '总电阻 R', unit: 'Ω' },
            { key: 'R1', label: 'R₁', unit: 'Ω' },
            { key: 'R2', label: 'R₂', unit: 'Ω' }
          ],
          calc: function (v) {
            if (v.R == null) return v.R1 + v.R2;
            if (v.R1 == null) return v.R - v.R2;
            if (v.R2 == null) return v.R - v.R1;
          }
        },
        {
          id: 'series3',
          name: '三电阻串联',
          formula: 'R = R₁ + R₂ + R₃',
          vars: [
            { key: 'R', label: '总电阻 R', unit: 'Ω' },
            { key: 'R1', label: 'R₁', unit: 'Ω' },
            { key: 'R2', label: 'R₂', unit: 'Ω' },
            { key: 'R3', label: 'R₃', unit: 'Ω' }
          ],
          calc: function (v) {
            if (v.R == null) return v.R1 + v.R2 + v.R3;
            if (v.R1 == null) return v.R - v.R2 - v.R3;
            if (v.R2 == null) return v.R - v.R1 - v.R3;
            if (v.R3 == null) return v.R - v.R1 - v.R2;
          }
        }
      ]
    },
    {
      id: 'parallel',
      name: '并联电阻',
      formulas: [
        {
          id: 'parallel2',
          name: '两电阻并联',
          formula: 'R = (R₁ · R₂) / (R₁ + R₂)',
          vars: [
            { key: 'R', label: '总电阻 R', unit: 'Ω' },
            { key: 'R1', label: 'R₁', unit: 'Ω' },
            { key: 'R2', label: 'R₂', unit: 'Ω' }
          ],
          calc: function (v) {
            if (v.R == null) return (v.R1 * v.R2) / (v.R1 + v.R2);
            if (v.R1 == null) return (v.R * v.R2) / (v.R2 - v.R);
            if (v.R2 == null) return (v.R * v.R1) / (v.R1 - v.R);
          }
        },
        {
          id: 'parallel3',
          name: '三电阻并联',
          formula: '1/R = 1/R₁ + 1/R₂ + 1/R₃',
          vars: [
            { key: 'R', label: '总电阻 R', unit: 'Ω' },
            { key: 'R1', label: 'R₁', unit: 'Ω' },
            { key: 'R2', label: 'R₂', unit: 'Ω' },
            { key: 'R3', label: 'R₃', unit: 'Ω' }
          ],
          calc: function (v) {
            if (v.R == null) return 1 / (1 / v.R1 + 1 / v.R2 + 1 / v.R3);
            var inv = 1 / v.R;
            if (v.R1 == null) return 1 / (inv - 1 / v.R2 - 1 / v.R3);
            if (v.R2 == null) return 1 / (inv - 1 / v.R1 - 1 / v.R3);
            if (v.R3 == null) return 1 / (inv - 1 / v.R1 - 1 / v.R2);
          }
        }
      ]
    },
    {
      id: 'ohm',
      name: '欧姆定律',
      formulas: [
        {
          id: 'ohm',
          name: '欧姆定律',
          formula: 'I = U / R',
          vars: [
            { key: 'I', label: '电流 I', unit: 'A' },
            { key: 'U', label: '电压 U', unit: 'V' },
            { key: 'R', label: '电阻 R', unit: 'Ω' }
          ],
          calc: function (v) {
            if (v.I == null) return v.U / v.R;
            if (v.U == null) return v.I * v.R;
            if (v.R == null) return v.U / v.I;
          }
        },
        {
          id: 'resistance',
          name: '电阻定律',
          formula: 'R = ρL / S',
          vars: [
            { key: 'R', label: '电阻 R', unit: 'Ω' },
            { key: 'rho', label: '电阻率 ρ', unit: 'Ω·m' },
            { key: 'L', label: '长度 L', unit: 'm' },
            { key: 'S', label: '横截面积 S', unit: 'm²' }
          ],
          calc: function (v) {
            if (v.R == null) return v.rho * v.L / v.S;
            if (v.rho == null) return v.R * v.S / v.L;
            if (v.L == null) return v.R * v.S / v.rho;
            if (v.S == null) return v.rho * v.L / v.R;
          }
        }
      ]
    },
    {
      id: 'power',
      name: '电功率',
      formulas: [
        {
          id: 'power',
          name: '电功率',
          formula: 'P = U · I',
          vars: [
            { key: 'P', label: '功率 P', unit: 'W' },
            { key: 'U', label: '电压 U', unit: 'V' },
            { key: 'I', label: '电流 I', unit: 'A' }
          ],
          calc: function (v) {
            if (v.P == null) return v.U * v.I;
            if (v.U == null) return v.P / v.I;
            if (v.I == null) return v.P / v.U;
          }
        },
        {
          id: 'power2',
          name: '功率与电阻',
          formula: 'P = I² · R',
          vars: [
            { key: 'P', label: '功率 P', unit: 'W' },
            { key: 'I', label: '电流 I', unit: 'A' },
            { key: 'R', label: '电阻 R', unit: 'Ω' }
          ],
          calc: function (v) {
            if (v.P == null) return v.I * v.I * v.R;
            if (v.I == null) return Math.sqrt(v.P / v.R);
            if (v.R == null) return v.P / (v.I * v.I);
          }
        },
        {
          id: 'power3',
          name: '功率与电压电阻',
          formula: 'P = U² / R',
          vars: [
            { key: 'P', label: '功率 P', unit: 'W' },
            { key: 'U', label: '电压 U', unit: 'V' },
            { key: 'R', label: '电阻 R', unit: 'Ω' }
          ],
          calc: function (v) {
            if (v.P == null) return v.U * v.U / v.R;
            if (v.U == null) return Math.sqrt(v.P * v.R);
            if (v.R == null) return v.U * v.U / v.P;
          }
        },
        {
          id: 'energy',
          name: '电能',
          formula: 'W = P · t',
          vars: [
            { key: 'W', label: '电能 W', unit: 'J' },
            { key: 'P', label: '功率 P', unit: 'W' },
            { key: 't', label: '时间 t', unit: 's' }
          ],
          calc: function (v) {
            if (v.W == null) return v.P * v.t;
            if (v.P == null) return v.W / v.t;
            if (v.t == null) return v.W / v.P;
          }
        }
      ]
    },
    {
      id: 'divider',
      name: '分压分流',
      formulas: [
        {
          id: 'vdiv',
          name: '串联分压',
          formula: 'U₁ = U · R₁ / (R₁ + R₂)',
          vars: [
            { key: 'U', label: '总电压 U', unit: 'V' },
            { key: 'R1', label: 'R₁', unit: 'Ω' },
            { key: 'R2', label: 'R₂', unit: 'Ω' },
            { key: 'U1', label: 'R₁ 两端电压 U₁', unit: 'V' }
          ],
          calc: function (v) {
            if (v.U1 == null) return v.U * v.R1 / (v.R1 + v.R2);
            if (v.U == null) return v.U1 * (v.R1 + v.R2) / v.R1;
            if (v.R1 == null) return v.U1 * v.R2 / (v.U - v.U1);
            if (v.R2 == null) return v.R1 * (v.U - v.U1) / v.U1;
          }
        },
        {
          id: 'idiv',
          name: '并联分流',
          formula: 'I₁ = I · R₂ / (R₁ + R₂)',
          vars: [
            { key: 'I', label: '总电流 I', unit: 'A' },
            { key: 'R1', label: 'R₁', unit: 'Ω' },
            { key: 'R2', label: 'R₂', unit: 'Ω' },
            { key: 'I1', label: 'R₁ 支路电流 I₁', unit: 'A' }
          ],
          calc: function (v) {
            if (v.I1 == null) return v.I * v.R2 / (v.R1 + v.R2);
            if (v.I == null) return v.I1 * (v.R1 + v.R2) / v.R2;
            if (v.R1 == null) return v.R2 * (v.I - v.I1) / v.I1;
            if (v.R2 == null) return v.R1 * v.I1 / (v.I - v.I1);
          }
        }
      ]
    }
  ];

  var currentGroup = 'series';
  var state = {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function fmt(n) {
    if (!isFinite(n)) return '—';
    if (n === 0) return '0';
    var abs = Math.abs(n);
    if (abs >= 1e8 || abs < 1e-4) return n.toExponential(4);
    return String(parseFloat(n.toPrecision(4)));
  }

  function renderGroup() {
    var g = GROUPS.find(function (x) { return x.id === currentGroup; });
    if (!g) return;
    container.innerHTML = '<div class="panel"><div class="cc-grid">' +
      g.formulas.map(renderCard).join('') +
    '</div></div>';
    g.formulas.forEach(bindCard);
  }

  function renderCard(f) {
    var key = currentGroup + ':' + f.id;
    if (!state[key]) state[key] = {};
    var inputsHtml = f.vars.map(function (vr) {
      var val = state[key][vr.key] || '';
      return '<label class="cc-var">' +
        '<span class="cc-var-label">' + esc(vr.label) + '</span>' +
        '<span class="cc-var-input-wrap">' +
          '<input type="text" class="cc-var-input' + (val ? ' filled' : '') + '" data-var="' + vr.key + '" value="' + esc(val) + '" placeholder="?">' +
          '<span class="cc-var-unit">' + esc(vr.unit) + '</span>' +
        '</span>' +
      '</label>';
    }).join('');
    return '<div class="cc-card" data-fid="' + f.id + '">' +
      '<div class="cc-card-head">' +
        '<h4 class="cc-name">' + esc(f.name) + '</h4>' +
        '<span class="cc-formula">' + esc(f.formula) + '</span>' +
      '</div>' +
      '<div class="cc-vars">' + inputsHtml + '</div>' +
      '<div class="cc-result muted" data-result>填 ' + (f.vars.length - 1) + ' 个量，求剩下的那个</div>' +
    '</div>';
  }

  function bindCard(f) {
    var card = container.querySelector('.cc-card[data-fid="' + f.id + '"]');
    if (!card) return;
    card.querySelectorAll('.cc-var-input').forEach(function (input) {
      input.addEventListener('input', function () {
        var k = input.dataset.var;
        var v = input.value.trim();
        var key = currentGroup + ':' + f.id;
        state[key][k] = v;
        input.classList.toggle('filled', !!v);
        compute(f, card);
      });
    });
    compute(f, card);
  }

  function compute(f, card) {
    var key = currentGroup + ':' + f.id;
    var s = state[key] || {};
    var vals = {};
    var filled = 0;
    var missing = null;

    f.vars.forEach(function (vr) {
      var raw = String(s[vr.key] || '').trim();
      if (raw === '') { missing = vr.key; vals[vr.key] = null; }
      else {
        var n = parseFloat(raw);
        if (isFinite(n)) { vals[vr.key] = n; filled++; }
        else vals[vr.key] = NaN;
      }
    });

    var resEl = card.querySelector('[data-result]');
    if (!resEl) return;

    if (filled === 0) {
      resEl.className = 'cc-result muted';
      resEl.textContent = '填 ' + (f.vars.length - 1) + ' 个量，求剩下的那个';
      return;
    }
    if (filled !== f.vars.length - 1) {
      resEl.className = 'cc-result muted';
      resEl.textContent = '需要填 ' + (f.vars.length - 1) + ' 个已知量，已填 ' + filled + ' 个';
      return;
    }
    for (var k in vals) {
      if (vals[k] !== null && !isFinite(vals[k])) {
        resEl.className = 'cc-result error';
        resEl.textContent = '输入无效，请检查数值';
        return;
      }
    }
    try {
      var r = f.calc(vals);
      if (!isFinite(r)) {
        resEl.className = 'cc-result error';
        resEl.textContent = '该条件下无解或无法计算（可能分母为 0）';
        return;
      }
      var tv = f.vars.find(function (vr) { return vr.key === missing; });
      resEl.className = 'cc-result';
      resEl.innerHTML = '<span>' + esc(tv ? tv.label : missing) + ' =</span>' +
        '<span class="cc-res-value">' + esc(fmt(r)) + ' ' + esc(tv ? tv.unit : '') + '</span>';
    } catch (err) {
      resEl.className = 'cc-result error';
      resEl.textContent = '计算错误：' + (err.message || err);
    }
  }

  tabsEl.querySelectorAll('.ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabsEl.querySelectorAll('.ta-subtab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentGroup = tab.dataset.cc;
      renderGroup();
    });
  });

  function init() {
    if (window.__circuitcalcInited) return;
    window.__circuitcalcInited = true;
    renderGroup();
  }
  window.__circuitcalcInit = function () { if (!window.__circuitcalcInited) init(); else renderGroup(); };

  if (document.getElementById('page-circuitcalc').classList.contains('active')) init();
  console.log('[电路计算] 已加载');
})();