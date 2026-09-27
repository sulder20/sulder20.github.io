/* ============================================================
   汇率换算
   —— 内置参考汇率，离线可用；可联网更新实时汇率
   —— 修复：兼容字段名 / 按 base_code 归一化 / 合理性校验 / 多接口兜底
   ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'suidou-exchange-rates-v1';

  /* 货币元数据：代码 → { name, symbol } */
  const CURRENCIES = {
    CNY: { name: '人民币',   symbol: '¥'   },
    USD: { name: '美元',     symbol: '$'   },
    EUR: { name: '欧元',     symbol: '€'   },
    GBP: { name: '英镑',     symbol: '£'   },
    JPY: { name: '日元',     symbol: '¥'   },
    HKD: { name: '港币',     symbol: 'HK$' },
    KRW: { name: '韩元',     symbol: '₩'   },
    RUB: { name: '卢布',     symbol: '₽'   },
    AUD: { name: '澳元',     symbol: 'A$'  },
    CAD: { name: '加元',     symbol: 'C$'  },
    CHF: { name: '瑞士法郎', symbol: 'Fr'  },
    SGD: { name: '新加坡元', symbol: 'S$'  },
    TWD: { name: '新台币',   symbol: 'NT$' }
  };

  /* 内置参考汇率：1 CNY = rates[X] 个 X 货币
     —— 仅作离线参考，实际以银行成交价为准 */
  const BUILTIN_RATES = {
    CNY: 1,
    USD: 0.1385,
    EUR: 0.1285,
    GBP: 0.1085,
    JPY: 21.00,
    HKD: 1.0820,
    KRW: 191.50,
    RUB: 12.50,
    AUD: 0.2105,
    CAD: 0.1935,
    CHF: 0.1215,
    SGD: 0.1855,
    TWD: 4.4900
  };

  /* 主接口 + 备用接口，任意一个成功即可 */
  const API_URLS = [
    'https://open.er-api.com/v6/latest/CNY',
    'https://api.exchangerate-api.com/v4/latest/CNY'
  ];

  /* 更新冷却时间（毫秒），防止频繁请求被限流 */
  const UPDATE_COOLDOWN = 30000;

  /* ---------- DOM ---------- */
  const amountEl  = document.getElementById('fxAmount');
  const fromEl    = document.getElementById('fxFrom');
  const toEl      = document.getElementById('fxTo');
  const swapBtn   = document.getElementById('fxSwap');
  const resetBtn  = document.getElementById('fxReset');
  const updateBtn = document.getElementById('fxUpdate');
  const restoreBtn= document.getElementById('fxRestore');
  const resultEl  = document.getElementById('fxResult');
  const metaEl    = document.getElementById('fxMeta');
  const tableBody = document.querySelector('#fxTable tbody');

  if (!amountEl || !fromEl || !toEl) return;

  /* ---------- 状态：当前生效的汇率表 ---------- */
  let state = {
    base: 'CNY',
    rates: { ...BUILTIN_RATES },
    source: 'builtin',           // builtin | online
    updatedAt: ''
  };

  /* ---------- 小工具 ---------- */
  function escLocal(s) {
    if (typeof esc === 'function') return esc(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(msg) {
    if (typeof showToast === 'function') showToast(msg);
    else console.log('[汇率]', msg);
  }

  /* ---------- 读取 / 写入本地缓存 ---------- */
  function loadRates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.rates && typeof parsed.rates === 'object') {
        state = {
          base: parsed.base || 'CNY',
          rates: { ...BUILTIN_RATES, ...parsed.rates },
          source: parsed.source || 'builtin',
          updatedAt: parsed.updatedAt || ''
        };
      }
    } catch (e) {
      console.warn('[汇率] 本地缓存读取失败：', e);
    }
  }

  function saveRates() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (typeof updateStorageUsage === 'function') updateStorageUsage();
    } catch (e) {
      console.warn('[汇率] 本地缓存写入失败：', e);
    }
  }

  /* ---------- 渲染货币下拉 ---------- */
  function fillSelects() {
    const codes = Object.keys(CURRENCIES);
    const options = codes.map(function (code) {
      const c = CURRENCIES[code];
      return '<option value="' + code + '">' + c.name + ' ' + code + ' ' + c.symbol + '</option>';
    }).join('');

    const prevFrom = fromEl.value;
    const prevTo   = toEl.value;

    fromEl.innerHTML = options;
    toEl.innerHTML   = options;

    fromEl.value = codes.indexOf(prevFrom) >= 0 ? prevFrom : 'CNY';
    toEl.value   = codes.indexOf(prevTo)   >= 0 ? prevTo   : 'USD';
  }

  /* ---------- 数字格式化 ---------- */
  function fmtNum(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs >= 1e15 || abs < 1e-6) return n.toExponential(6);
    if (abs >= 1) {
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return String(parseFloat(n.toPrecision(6)));
  }

  /* ---------- 核心换算：以 CNY 为中转 ---------- */
  function convert(amount, from, to) {
    if (!isFinite(amount)) return NaN;
    const rates = state.rates;
    const fromRate = rates[from] || 1;
    const toRate   = rates[to]   || 1;
    const inBase   = amount / fromRate;   // 先换回 CNY
    return inBase * toRate;               // 再换成目标货币
  }

  /* ---------- 渲染结果 ---------- */
  function renderResult() {
    if (!resultEl) return;
    const raw = amountEl.value.trim();
    const v = parseFloat(raw);
    const from = fromEl.value;
    const to   = toEl.value;

    if (raw === '' || !isFinite(v)) {
      resultEl.innerHTML =
        '<div class="mc-res-label">换算结果</div>' +
        '<div class="mc-res-value">—</div>' +
        '<div class="mc-res-sub">请输入要换算的金额</div>';
      return;
    }

    const out = convert(v, from, to);
    const fromSym = CURRENCIES[from] ? CURRENCIES[from].symbol : '';
    const toSym   = CURRENCIES[to]   ? CURRENCIES[to].symbol   : '';

    resultEl.innerHTML =
      '<div class="mc-res-label">' + escLocal(from) + ' → ' + escLocal(to) + '</div>' +
      '<div class="mc-res-value">' + escLocal(fmtNum(out)) +
        ' <span style="font-size:17px;font-weight:600;opacity:.9;">' + escLocal(to) + '</span></div>' +
      '<div class="mc-res-sub">' +
        escLocal(fromSym) + ' ' + escLocal(fmtNum(v)) + ' ' + escLocal(from) +
        ' = ' +
        escLocal(toSym) + ' ' + escLocal(fmtNum(out)) + ' ' + escLocal(to) +
      '</div>';
  }

  /* ---------- 渲染汇率元信息 ---------- */
  function renderMeta() {
    if (!metaEl) return;
    if (state.source === 'online' && state.updatedAt) {
      const d = new Date(state.updatedAt);
      const pad = function (n) { return String(n).padStart(2, '0'); };
      const timeStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
        ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      const usd = state.rates['USD'];
      const usdHint = (typeof usd === 'number')
        ? '（当前 1 CNY ≈ ' + usd.toFixed(4) + ' USD）'
        : '';
      metaEl.textContent =
  '当前使用：联网更新的实时汇率 ' + usdHint +
  '　更新于 ' + timeStr +
  '　·　数据来源：open.er-api.com(每日更新）';
      metaEl.style.color = 'var(--primary-dark)';
    } else {
      metaEl.textContent = '当前使用：内置参考汇率（离线可用，数值为参考值）';
      metaEl.style.color = 'var(--muted)';
    }
  }

  /* ---------- 渲染对照表 ---------- */
  function renderTable() {
    if (!tableBody) return;
    const codes = Object.keys(CURRENCIES).filter(function (c) { return c !== 'CNY'; });
    tableBody.innerHTML = codes.map(function (code) {
      const rate   = state.rates[code];
      const symbol = CURRENCIES[code].symbol;
      return '<tr>' +
        '<td>' + escLocal(CURRENCIES[code].name) + '</td>' +
        '<td>' + escLocal(code) + '</td>' +
        '<td>' + escLocal(symbol) + ' ' + escLocal(fmtNum(rate)) + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ---------- 整页刷新 ---------- */
  function refreshAll() {
    renderResult();
    renderMeta();
    renderTable();
  }

  /* ---------- 从多个接口中取第一个成功的响应 ---------- */
  async function fetchFirstOk() {
    let lastErr = null;
    for (let i = 0; i < API_URLS.length; i++) {
      const url = API_URLS[i];
      try {
        const r = await fetch(url, { cache: 'no-store' });
        if (r.ok) return r;
        lastErr = new Error('接口 ' + url + ' 返回 ' + r.status);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('所有汇率接口均不可用');
  }

  /* ---------- 从原始返回中提取 rates 对象 ---------- */
  function pickRates(data) {
    if (!data || typeof data !== 'object') return null;
    const r = data.rates || data.conversion_rates || data.quotes;
    if (!r || typeof r !== 'object') return null;
    return r;
  }

  /* ---------- 从原始返回中提取基准货币代码 ---------- */
  function pickBase(data) {
    if (!data || typeof data !== 'object') return 'CNY';
    const b = data.base_code || data.base || data.source || 'CNY';
    return String(b).toUpperCase();
  }

  /* ---------- 归一化为「1 CNY = X 某货币」 ---------- */
  function normalizeToCnyBase(rawRates, apiBase) {
    const out = {};
    if (apiBase === 'CNY') {
      Object.keys(CURRENCIES).forEach(function (code) {
        const v = rawRates[code];
        if (typeof v === 'number' && v > 0) out[code] = v;
      });
    } else {
      // 接口基准不是 CNY，用 CNY 做交叉汇率换算
      // rawRates 语义：1 apiBase = rawRates[X] 个 X
      const cnyPerBase = rawRates['CNY'];
      if (typeof cnyPerBase !== 'number' || cnyPerBase <= 0) {
        throw new Error('接口基准为 ' + apiBase + '，且未返回 CNY 汇率，无法归一化');
      }
      // 1 CNY = rawRates[X] / cnyPerBase 个 X
      Object.keys(CURRENCIES).forEach(function (code) {
        const v = rawRates[code];
        if (typeof v === 'number' && v > 0) out[code] = v / cnyPerBase;
      });
    }
    out.CNY = 1;
    return out;
  }

  /* ---------- 合理性校验：避免方向反 / 单位错 ---------- */
  function sanityCheck(rates) {
    const usd = rates['USD'];
    if (typeof usd !== 'number' || usd < 0.03 || usd > 0.5) {
      throw new Error('USD 汇率 ' + usd + ' 超出合理范围（预期 0.03 ~ 0.5）');
    }
    const jpy = rates['JPY'];
    if (typeof jpy === 'number' && (jpy < 5 || jpy > 60)) {
      throw new Error('JPY 汇率 ' + jpy + ' 超出合理范围（预期 5 ~ 60）');
    }
    const eur = rates['EUR'];
    if (typeof eur === 'number' && (eur < 0.03 || eur > 0.5)) {
      throw new Error('EUR 汇率 ' + eur + ' 超出合理范围（预期 0.03 ~ 0.5）');
    }
    const validCount = Object.keys(rates).filter(function (c) {
      return typeof rates[c] === 'number' && rates[c] > 0;
    }).length;
    if (validCount < 3) {
      throw new Error('可用货币过少（' + validCount + ' 种），接口可能异常');
    }
  }

  /* ---------- 联网更新汇率 ---------- */
  async function updateOnline() {
    if (!updateBtn) return;

    // 冷却：避免频繁请求被限流
    if (updateOnline._last && Date.now() - updateOnline._last < UPDATE_COOLDOWN) {
      const wait = Math.ceil((UPDATE_COOLDOWN - (Date.now() - updateOnline._last)) / 1000);
      toast('操作过于频繁，请 ' + wait + ' 秒后再试');
      return;
    }
    updateOnline._last = Date.now();

    const oldText = updateBtn.textContent;
    updateBtn.disabled = true;
    updateBtn.textContent = '更新中…';

    try {
      const res  = await fetchFirstOk();
      const data = await res.json();
      console.log('[汇率] 接口原始返回：', data);

      const rawRates = pickRates(data);
      if (!rawRates) throw new Error('返回数据缺少 rates / conversion_rates 字段');

      const apiBase = pickBase(data);
      const normalized = normalizeToCnyBase(rawRates, apiBase);

      sanityCheck(normalized);

      state = {
        base: 'CNY',
        rates: { ...BUILTIN_RATES, ...normalized },
        source: 'online',
        updatedAt: new Date().toISOString()
      };
      saveRates();
      refreshAll();
      toast('实时汇率已更新');
    } catch (err) {
      console.warn('[汇率] 更新失败：', err);
      toast('更新失败：' + (err && err.message ? err.message : err));
    } finally {
      updateBtn.disabled = false;
      updateBtn.textContent = oldText;
    }
  }

  /* ---------- 恢复内置汇率 ---------- */
  function restoreBuiltin() {
    if (!confirm('确定要恢复内置参考汇率吗？当前联网更新的汇率会被覆盖。')) return;
    state = {
      base: 'CNY',
      rates: { ...BUILTIN_RATES },
      source: 'builtin',
      updatedAt: ''
    };
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    refreshAll();
    toast('已恢复内置参考汇率');
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    amountEl.addEventListener('input', renderResult);
    fromEl.addEventListener('change', renderResult);
    toEl.addEventListener('change', renderResult);

    if (swapBtn) {
      swapBtn.addEventListener('click', function () {
        const a = fromEl.value;
        fromEl.value = toEl.value;
        toEl.value = a;
        renderResult();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        amountEl.value = '100';
        fromEl.value = 'CNY';
        toEl.value = 'USD';
        renderResult();
      });
    }

    if (updateBtn)  updateBtn.addEventListener('click', updateOnline);
    if (restoreBtn) restoreBtn.addEventListener('click', restoreBuiltin);

    amountEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        renderResult();
      }
    });
  }

  /* ---------- 初始化 ---------- */
  function initExchange() {
    loadRates();
    fillSelects();
    bindEvents();
    refreshAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExchange);
  } else {
    initExchange();
  }

  // 暴露给 main.js 的 go('exchange') 调用
  window.__fxInit = initExchange;

  console.log('[汇率换算] 模块已加载');
})();