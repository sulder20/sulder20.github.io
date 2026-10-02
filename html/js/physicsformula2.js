/* ============================================================
   物理公式计算 · 岁窦工具箱 V4.0
   ============================================================ */
(function () {
  'use strict';

  var container = document.getElementById('pfContainer');
  if (!container) return;

  var tabsEl = document.getElementById('pfTabs');

  var GROUPS = [
    {
      id: 'motion',
      name: '运动学',
      formulas: [
        {
          id: 'speed',
          name: '速度',
          formula: 'v = s / t',
          vars: [
            { key: 'v', label: '速度 v', unit: 'm/s' },
            { key: 's', label: '路程 s', unit: 'm' },
            { key: 't', label: '时间 t', unit: 's' }
          ],
          calc: function (v) {
            if (v.v == null) return v.s / v.t;
            if (v.s == null) return v.v * v.t;
            if (v.t == null) return v.s / v.v;
          }
        },
        {
          id: 'accel',
          name: '加速度',
          formula: 'a = (v − v₀) / t',
          vars: [
            { key: 'a', label: '加速度 a', unit: 'm/s²' },
            { key: 'vt', label: '末速 v', unit: 'm/s' },
            { key: 'v0', label: '初速 v₀', unit: 'm/s' },
            { key: 't', label: '时间 t', unit: 's' }
          ],
          calc: function (v) {
            if (v.a == null) return (v.vt - v.v0) / v.t;
            if (v.vt == null) return v.v0 + v.a * v.t;
            if (v.v0 == null) return v.vt - v.a * v.t;
            if (v.t == null) return (v.vt - v.v0) / v.a;
          }
        },
        {
          id: 'uniform',
          name: '匀加速位移',
          formula: 's = v₀t + ½at²',
          vars: [
            { key: 's', label: '位移 s', unit: 'm' },
            { key: 'v0', label: '初速 v₀', unit: 'm/s' },
            { key: 't', label: '时间 t', unit: 's' },
            { key: 'a', label: '加速度 a', unit: 'm/s²' }
          ],
          calc: function (v) {
            if (v.s == null) return v.v0 * v.t + 0.5 * v.a * v.t * v.t;
            if (v.v0 == null) return (v.s - 0.5 * v.a * v.t * v.t) / v.t;
            if (v.a == null) return (v.s - v.v0 * v.t) * 2 / (v.t * v.t);
            if (v.t == null) {
              /* v0*t + 0.5a t^2 - s = 0 */
              var A = 0.5 * v.a, B = v.v0, C = -v.s;
              var disc = B * B - 4 * A * C;
              if (disc < 0) return NaN;
              return (-B + Math.sqrt(disc)) / (2 * A);
            }
          }
        }
      ]
    },
    {
      id: 'force',
      name: '力学',
      formulas: [
        {
          id: 'density',
          name: '密度',
          formula: 'ρ = m / V',
          vars: [
            { key: 'rho', label: '密度 ρ', unit: 'kg/m³' },
            { key: 'm', label: '质量 m', unit: 'kg' },
            { key: 'V', label: '体积 V', unit: 'm³' }
          ],
          calc: function (v) {
            if (v.rho == null) return v.m / v.V;
            if (v.m == null) return v.rho * v.V;
            if (v.V == null) return v.m / v.rho;
          }
        },
        {
          id: 'pressure',
          name: '压强',
          formula: 'p = F / S',
          vars: [
            { key: 'p', label: '压强 p', unit: 'Pa' },
            { key: 'F', label: '压力 F', unit: 'N' },
            { key: 'S', label: '受力面积 S', unit: 'm²' }
          ],
          calc: function (v) {
            if (v.p == null) return v.F / v.S;
            if (v.F == null) return v.p * v.S;
            if (v.S == null) return v.F / v.p;
          }
        },
        {
          id: 'newton2',
          name: '牛顿第二定律',
          formula: 'F = m · a',
          vars: [
            { key: 'F', label: '合力 F', unit: 'N' },
            { key: 'm', label: '质量 m', unit: 'kg' },
            { key: 'a', label: '加速度 a', unit: 'm/s²' }
          ],
          calc: function (v) {
            if (v.F == null) return v.m * v.a;
            if (v.m == null) return v.F / v.a;
            if (v.a == null) return v.F / v.m;
          }
        },
        {
          id: 'buoyancy',
          name: '浮力',
          formula: 'F浮 = ρgV',
          vars: [
            { key: 'F', label: '浮力 F', unit: 'N' },
            { key: 'rho', label: '液体密度 ρ', unit: 'kg/m³' },
            { key: 'V', label: '排开液体体积 V', unit: 'm³' }
          ],
          calc: function (v) {
            var g = 9.8;
            if (v.F == null) return v.rho * g * v.V;
            if (v.rho == null) return v.F / (g * v.V);
            if (v.V == null) return v.F / (v.rho * g);
          }
        },
        {
          id: 'lever',
          name: '杠杆原理',
          formula: 'F₁L₁ = F₂L₂',
          vars: [
            { key: 'F1', label: 'F₁', unit: 'N' },
            { key: 'L1', label: 'L₁', unit: 'm' },
            { key: 'F2', label: 'F₂', unit: 'N' },
            { key: 'L2', label: 'L₂', unit: 'm' }
          ],
          calc: function (v) {
            if (v.F1 == null) return v.F2 * v.L2 / v.L1;
            if (v.L1 == null) return v.F2 * v.L2 / v.F1;
            if (v.F2 == null) return v.F1 * v.L1 / v.L2;
            if (v.L2 == null) return v.F1 * v.L1 / v.F2;
          }
        }
      ]
    },
    {
      id: 'energy',
      name: '能量',
      formulas: [
        {
          id: 'work',
          name: '功',
          formula: 'W = F · s',
          vars: [
            { key: 'W', label: '功 W', unit: 'J' },
            { key: 'F', label: '力 F', unit: 'N' },
            { key: 's', label: '沿力方向位移 s', unit: 'm' }
          ],
          calc: function (v) {
            if (v.W == null) return v.F * v.s;
            if (v.F == null) return v.W / v.s;
            if (v.s == null) return v.W / v.F;
          }
        },
        {
          id: 'power',
          name: '功率',
          formula: 'P = W / t',
          vars: [
            { key: 'P', label: '功率 P', unit: 'W' },
            { key: 'W', label: '功 W', unit: 'J' },
            { key: 't', label: '时间 t', unit: 's' }
          ],
          calc: function (v) {
            if (v.P == null) return v.W / v.t;
            if (v.W == null) return v.P * v.t;
            if (v.t == null) return v.W / v.P;
          }
        },
        {
          id: 'kinetic',
          name: '动能',
          formula: 'Ek = ½mv²',
          vars: [
            { key: 'Ek', label: '动能 Ek', unit: 'J' },
            { key: 'm', label: '质量 m', unit: 'kg' },
            { key: 'v', label: '速度 v', unit: 'm/s' }
          ],
          calc: function (v) {
            if (v.Ek == null) return 0.5 * v.m * v.v * v.v;
            if (v.m == null) return 2 * v.Ek / (v.v * v.v);
            if (v.v == null) return Math.sqrt(2 * v.Ek / v.m);
          }
        },
        {
          id: 'gpe',
          name: '重力势能',
          formula: 'Ep = mgh',
          vars: [
            { key: 'Ep', label: '势能 Ep', unit: 'J' },
            { key: 'm', label: '质量 m', unit: 'kg' },
            { key: 'h', label: '高度 h', unit: 'm' }
          ],
          calc: function (v) {
            var g = 9.8;
            if (v.Ep == null) return v.m * g * v.h;
            if (v.m == null) return v.Ep / (g * v.h);
            if (v.h == null) return v.Ep / (v.m * g);
          }
        }
      ]
    },
    {
      id: 'electric',
      name: '电学',
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
          id: 'epower',
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
          id: 'series',
          name: '串联电阻',
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
          id: 'parallel',
          name: '并联电阻',
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
        }
      ]
    },
    {
      id: 'thermal',
      name: '热学',
      formulas: [
        {
          id: 'heat',
          name: '热量',
          formula: 'Q = c · m · Δt',
          vars: [
            { key: 'Q', label: '热量 Q', unit: 'J' },
            { key: 'c', label: '比热容 c', unit: 'J/(kg·℃)' },
            { key: 'm', label: '质量 m', unit: 'kg' },
            { key: 'dt', label: '温差 Δt', unit: '℃' }
          ],
          calc: function (v) {
            if (v.Q == null) return v.c * v.m * v.dt;
            if (v.c == null) return v.Q / (v.m * v.dt);
            if (v.m == null) return v.Q / (v.c * v.dt);
            if (v.dt == null) return v.Q / (v.c * v.m);
          }
        },
        {
          id: 'efficiency',
          name: '热效率',
          formula: 'η = Q有用 / Q总',
          vars: [
            { key: 'eta', label: '效率 η', unit: '%' },
            { key: 'qUse', label: 'Q有用', unit: 'J' },
            { key: 'qAll', label: 'Q总', unit: 'J' }
          ],
          calc: function (v) {
            if (v.eta == null) return v.qUse / v.qAll * 100;
            if (v.qUse == null) return v.eta / 100 * v.qAll;
            if (v.qAll == null) return v.qUse / (v.eta / 100);
          }
        }
      ]
    }
  ];

  var currentGroup = 'motion';
  var state = {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function fmtNum(v) {
    if (v == null || !isFinite(v)) return '—';
    if (v === 0) return '0';
    var abs = Math.abs(v);
    if (abs >= 1e8 || abs < 1e-4) return v.toExponential(4);
    return String(parseFloat(v.toPrecision(4)));
  }

  function renderGroup() {
    var group = GROUPS.find(function (g) { return g.id === currentGroup; });
    if (!group) return;

    container.innerHTML = '<div class="panel"><div class="pf-grid">' +
      group.formulas.map(function (f) {
        return renderCard(f);
      }).join('') +
    '</div></div>';

    group.formulas.forEach(function (f) {
      bindCard(f);
    });
  }

  function renderCard(f) {
    var stateKey = currentGroup + ':' + f.id;
    if (!state[stateKey]) state[stateKey] = {};
    var inputsHtml = f.vars.map(function (vr) {
      var val = state[stateKey][vr.key] || '';
      return '<label class="pf-var">' +
        '<span class="pf-var-label">' + esc(vr.label) + '</span>' +
        '<span class="pf-var-input-wrap">' +
          '<input type="text" class="pf-var-input' + (val ? ' filled' : '') + '" data-var="' + vr.key + '" value="' + esc(val) + '" placeholder="?">' +
          '<span class="pf-var-unit">' + esc(vr.unit) + '</span>' +
        '</span>' +
      '</label>';
    }).join('');

    return '<div class="pf-card" data-fid="' + f.id + '">' +
      '<div class="pf-card-head">' +
        '<h4 class="pf-name">' + esc(f.name) + '</h4>' +
        '<span class="pf-formula">' + esc(f.formula) + '</span>' +
      '</div>' +
      '<div class="pf-vars">' + inputsHtml + '</div>' +
      '<div class="pf-result muted" data-result>填 ' + (f.vars.length - 1) + ' 个量，求剩下的那个</div>' +
    '</div>';
  }

  function bindCard(f) {
    var card = container.querySelector('.pf-card[data-fid="' + f.id + '"]');
    if (!card) return;

    card.querySelectorAll('.pf-var-input').forEach(function (input) {
      input.addEventListener('input', function () {
        var key = input.dataset.var;
        var val = input.value.trim();
        var stateKey = currentGroup + ':' + f.id;
        state[stateKey][key] = val;
        input.classList.toggle('filled', !!val);
        compute(f, card);
      });
    });

    compute(f, card);
  }

  function compute(f, card) {
    var stateKey = currentGroup + ':' + f.id;
    var s = state[stateKey] || {};
    var vals = {};
    var filled = 0;
    var missing = null;

    f.vars.forEach(function (vr) {
      var raw = String(s[vr.key] || '').trim();
      if (raw === '') {
        missing = vr.key;
        vals[vr.key] = null;
      } else {
        var n = parseFloat(raw);
        vals[vr.key] = isFinite(n) ? n : NaN;
        if (isFinite(n)) filled++;
        else { vals[vr.key] = NaN; }
      }
    });

    var resultEl = card.querySelector('[data-result]');
    if (!resultEl) return;

    /* 未填任何值 */
    if (filled === 0) {
      resultEl.className = 'pf-result muted';
      resultEl.textContent = '填 ' + (f.vars.length - 1) + ' 个量，求剩下的那个';
      return;
    }
    /* 填多或填错 */
    if (filled !== f.vars.length - 1) {
      resultEl.className = 'pf-result muted';
      resultEl.textContent = '需要填 ' + (f.vars.length - 1) + ' 个已知量，已填 ' + filled + ' 个';
      return;
    }
    /* 检查数值有效性 */
    for (var k in vals) {
      if (vals[k] !== null && !isFinite(vals[k])) {
        resultEl.className = 'pf-result error';
        resultEl.textContent = '输入无效，请检查数值';
        return;
      }
    }
    /* 求值 */
    try {
      var result = f.calc(vals);
      if (!isFinite(result)) {
        resultEl.className = 'pf-result error';
        resultEl.textContent = '该条件下无解或无法计算（可能分母为 0）';
        return;
      }
      var targetVar = f.vars.find(function (vr) { return vr.key === missing; });
      resultEl.className = 'pf-result';
      resultEl.innerHTML = '<span>' + esc(targetVar ? targetVar.label : missing) + ' =</span>' +
        '<span class="pf-res-value">' + esc(fmtNum(result)) + ' ' + esc(targetVar ? targetVar.unit : '') + '</span>';
    } catch (err) {
      resultEl.className = 'pf-result error';
      resultEl.textContent = '计算错误：' + (err.message || err);
    }
  }

  tabsEl.querySelectorAll('.ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabsEl.querySelectorAll('.ta-subtab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentGroup = tab.dataset.pf;
      renderGroup();
    });
  });

  renderGroup();

  window.__physicsformulaInit = function () {
    renderGroup();
  };

  console.log('[物理公式计算] 已加载');
})();