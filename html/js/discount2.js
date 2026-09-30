/* ============================================================
   岁窦工具箱 · 折扣计算器
   ============================================================ */
(function () {
  'use strict';

  var inited = false;

  var priceEl, qtyEl;
  var useDiscount, discountType, discountValue, discountHint;
  var useFullCut, fullThreshold, fullCutValue, fullCutRepeat, fullCutHint;
  var useCoupon, couponMin, couponValue, couponHint;
  var useExtra, extraValue, extraHint;
  var useShipping, shippingEl;

  var calcBtn, resetBtn;

  var finalPriceEl, finalPriceSubEl, totalSavedEl, totalSavedSubEl;
  var originTotalEl, discountSaveEl, fullCutSaveEl, couponSaveEl, extraSaveEl, shippingValueEl;
  var tipEl, stepsEl;

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[折扣]', msg);
  }

  function fmtMoney(n) {
    if (!isFinite(n)) return '—';
    return n.toFixed(2);
  }

  function fmtMoneySigned(n) {
    if (!isFinite(n)) return '—';
    if (Math.abs(n) < 0.005) return '0.00';
    return n.toFixed(2);
  }

  function fmtZhe(saved, origin) {
    if (!origin || origin <= 0) return '—';
    var zhe = (1 - saved / origin) * 10;
    if (!isFinite(zhe)) return '—';
    return zhe.toFixed(2);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-discount');
    if (!page) return;

    priceEl = document.getElementById('dsPrice');
    qtyEl   = document.getElementById('dsQty');

    useDiscount   = document.getElementById('dsUseDiscount');
    discountType  = document.getElementById('dsDiscountType');
    discountValue = document.getElementById('dsDiscountValue');
    discountHint  = document.getElementById('dsDiscountHint');

    useFullCut     = document.getElementById('dsUseFullCut');
    fullThreshold  = document.getElementById('dsFullThreshold');
    fullCutValue   = document.getElementById('dsFullCutValue');
    fullCutRepeat  = document.getElementById('dsFullCutRepeat');
    fullCutHint    = document.getElementById('dsFullCutHint');

    useCoupon   = document.getElementById('dsUseCoupon');
    couponMin   = document.getElementById('dsCouponMin');
    couponValue = document.getElementById('dsCouponValue');
    couponHint  = document.getElementById('dsCouponHint');

    useExtra   = document.getElementById('dsUseExtra');
    extraValue = document.getElementById('dsExtraValue');
    extraHint  = document.getElementById('dsExtraHint');

    useShipping = document.getElementById('dsUseShipping');
    shippingEl  = document.getElementById('dsShipping');

    calcBtn  = document.getElementById('dsCalc');
    resetBtn = document.getElementById('dsReset');

    finalPriceEl    = document.getElementById('dsFinalPrice');
    finalPriceSubEl = document.getElementById('dsFinalPriceSub');
    totalSavedEl    = document.getElementById('dsTotalSaved');
    totalSavedSubEl = document.getElementById('dsTotalSavedSub');

    originTotalEl    = document.getElementById('dsOriginTotal');
    discountSaveEl   = document.getElementById('dsDiscountSave');
    fullCutSaveEl    = document.getElementById('dsFullCutSave');
    couponSaveEl     = document.getElementById('dsCouponSave');
    extraSaveEl      = document.getElementById('dsExtraSave');
    shippingValueEl  = document.getElementById('dsShippingValue');

    tipEl   = document.getElementById('dsTip');
    stepsEl = document.getElementById('dsSteps');

    if (!priceEl || !stepsEl) return;

    inited = true;
    bindEvents();
    updateItemUI();
    calc();

    console.log('[折扣] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    // 各优惠项开关
    [
      [useDiscount, 'dsItemDiscount'],
      [useFullCut,  'dsItemFullCut'],
      [useCoupon,   'dsItemCoupon'],
      [useExtra,    'dsItemExtra'],
      [useShipping, 'dsItemShipping']
    ].forEach(function (pair) {
      var cb = pair[0];
      var itemEl = document.getElementById(pair[1]);
      cb.addEventListener('change', function () {
        if (itemEl) itemEl.classList.toggle('active', cb.checked);
        updateItemUI();
        calc();
      });
    });

    // 输入变化时同步提示与自动重算
    [priceEl, qtyEl, discountValue, fullThreshold, fullCutValue, fullCutRepeat,
     couponMin, couponValue, extraValue, shippingEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        updateItemUI();
        calc();
      });
    });

    discountType.addEventListener('change', function () {
      updateItemUI();
      calc();
    });

    calcBtn.addEventListener('click', calc);
    resetBtn.addEventListener('click', reset);

    [priceEl, qtyEl, discountValue, fullThreshold, fullCutValue, fullCutRepeat,
     couponMin, couponValue, extraValue, shippingEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); calc(); }
      });
    });
  }

  /* ---------- 更新提示与卡片激活态 ---------- */
  function updateItemUI() {
    // 打折
    if (discountType.value === 'zhe') {
      var v1 = parseFloat(discountValue.value);
      discountHint.textContent = isFinite(v1) && v1 > 0
        ? '当前：打 ' + v1 + ' 折，即按 ' + (v1 * 10).toFixed(0) + '% 计算'
        : '请填写折扣数值，如 8.8 表示 88%';
    } else {
      var v2 = parseFloat(discountValue.value);
      discountHint.textContent = isFinite(v2)
        ? '当前：优惠 ' + v2 + '%，即按 ' + (100 - v2).toFixed(2) + '% 计算'
        : '请填写优惠百分比，如 15 表示优惠 15%';
    }

    // 满减
    var t = parseFloat(fullThreshold.value);
    var c = parseFloat(fullCutValue.value);
    var r = parseInt(fullCutRepeat.value, 10) || 1;
    if (isFinite(t) && isFinite(c) && t > 0 && c > 0) {
      fullCutHint.textContent = '当前：满 ' + t + ' 减 ' + c + '，可叠加 ' + r + ' 次';
    } else {
      fullCutHint.textContent = '请填写满减门槛与减免金额';
    }

    // 优惠券
    var cm = parseFloat(couponMin.value) || 0;
    var cv = parseFloat(couponValue.value);
    if (isFinite(cv) && cv > 0) {
      couponHint.textContent = cm > 0
        ? '当前：满 ' + cm + ' 减 ' + cv
        : '当前：无门槛抵扣 ' + cv + ' 元';
    } else {
      couponHint.textContent = '请填写抵扣金额';
    }

    // 折上折
    var ev = parseFloat(extraValue.value);
    extraHint.textContent = isFinite(ev) && ev > 0
      ? '当前：在优惠基础上再打 ' + ev + ' 折'
      : '请填写折上折数值，如 9.5 表示再打 95%';

    // 卡片激活态
    document.getElementById('dsItemDiscount').classList.toggle('active', useDiscount.checked);
    document.getElementById('dsItemFullCut').classList.toggle('active', useFullCut.checked);
    document.getElementById('dsItemCoupon').classList.toggle('active', useCoupon.checked);
    document.getElementById('dsItemExtra').classList.toggle('active', useExtra.checked);
    document.getElementById('dsItemShipping').classList.toggle('active', useShipping.checked);
  }

  /* ---------- 重置 ---------- */
  function reset() {
    priceEl.value = '299';
    qtyEl.value = '1';

    useDiscount.checked = true;
    discountType.value = 'zhe';
    discountValue.value = '8.8';

    useFullCut.checked = false;
    fullThreshold.value = '200';
    fullCutValue.value = '30';
    fullCutRepeat.value = '1';

    useCoupon.checked = false;
    couponMin.value = '100';
    couponValue.value = '20';

    useExtra.checked = false;
    extraValue.value = '9.5';

    useShipping.checked = false;
    shippingEl.value = '0';

    updateItemUI();
    calc();
    toast('已重置为默认参数');
  }

  /* ---------- 计算 ---------- */
  function calc() {
    var price = parseFloat(priceEl.value);
    var qty = parseInt(qtyEl.value, 10) || 1;
    if (qty < 1) qty = 1;

    if (!isFinite(price) || price <= 0) {
      showEmpty('请填写有效的商品原价');
      return;
    }

    var origin = price * qty;
    var steps = [];
    var current = origin;

    steps.push({
      tag: '原价',
      text: '商品原价 <b>' + fmtMoney(price) + '</b> × ' + qty + ' 件 = <b>' + fmtMoney(origin) + '</b> 元'
    });

    var totalDiscountSave = 0;
    var totalFullCutSave = 0;
    var totalCouponSave = 0;
    var totalExtraSave = 0;
    var shippingValue = 0;

    /* ---- 1. 打折 ---- */
    if (useDiscount.checked) {
      var dv = parseFloat(discountValue.value);
      var rate = 1;
      var label = '';

      if (discountType.value === 'zhe') {
        if (isFinite(dv) && dv > 0 && dv <= 10) {
          rate = dv / 10;
          label = '打 ' + dv + ' 折';
        }
      } else {
        if (isFinite(dv) && dv >= 0 && dv <= 100) {
          rate = (100 - dv) / 100;
          label = '优惠 ' + dv + '%';
        }
      }

      if (label) {
        var afterDiscount = current * rate;
        var discountDed = current - afterDiscount;
        totalDiscountSave = discountDed;
        steps.push({
          tag: '打折',
          text: label + '：<b>' + fmtMoney(current) + '</b> × ' + (rate * 100).toFixed(2) + '% = <b>' + fmtMoney(afterDiscount) + '</b> 元　' +
                '<span class="ds-step-ded">省 ' + fmtMoney(discountDed) + '</span>'
        });
        current = afterDiscount;
      }
    }

    /* ---- 2. 满减 ---- */
    if (useFullCut.checked) {
      var th = parseFloat(fullThreshold.value);
      var cv = parseFloat(fullCutValue.value);
      var rep = parseInt(fullCutRepeat.value, 10) || 1;
      if (rep < 1) rep = 1;

      if (isFinite(th) && th > 0 && isFinite(cv) && cv > 0) {
        var times = Math.floor(current / th);
        if (times > rep) times = rep;
        var ded = times * cv;
        if (ded > current) ded = current;

        if (times > 0) {
          var afterCut = current - ded;
          totalFullCutSave = ded;
          steps.push({
            tag: '满减',
            text: '满 <b>' + th + '</b> 减 <b>' + cv + '</b>，可叠加 ' + rep + ' 次，实际达成 <b>' + times + '</b> 次：' +
                  '<b>' + fmtMoney(current) + '</b> − ' + fmtMoney(ded) + ' = <b>' + fmtMoney(afterCut) + '</b> 元　' +
                  '<span class="ds-step-ded">省 ' + fmtMoney(ded) + '</span>'
          });
          current = afterCut;
        } else {
          steps.push({
            tag: '满减',
            text: '当前金额 <b>' + fmtMoney(current) + '</b> 未达到 ' + th + ' 元门槛，本次不参与满减。'
          });
        }
      }
    }

    /* ---- 3. 优惠券 ---- */
    if (useCoupon.checked) {
      var cmin = parseFloat(couponMin.value) || 0;
      var cval = parseFloat(couponValue.value);

      if (isFinite(cval) && cval > 0) {
        if (current >= cmin) {
          var afterCoupon = current - cval;
          if (afterCoupon < 0) afterCoupon = 0;
          var couponDed = current - afterCoupon;
          totalCouponSave = couponDed;
          steps.push({
            tag: '优惠券',
            text: (cmin > 0 ? '满 <b>' + cmin + '</b> 减 <b>' + cval + '</b>' : '无门槛抵扣 <b>' + cval + '</b>') +
                  '：<b>' + fmtMoney(current) + '</b> − ' + fmtMoney(couponDed) + ' = <b>' + fmtMoney(afterCoupon) + '</b> 元　' +
                  '<span class="ds-step-ded">省 ' + fmtMoney(couponDed) + '</span>'
          });
          current = afterCoupon;
        } else {
          steps.push({
            tag: '优惠券',
            text: '当前金额 <b>' + fmtMoney(current) + '</b> 未达到 ' + cmin + ' 元门槛，本次不使用优惠券。'
          });
        }
      }
    }

    /* ---- 4. 折上折 ---- */
    if (useExtra.checked) {
      var ev = parseFloat(extraValue.value);
      if (isFinite(ev) && ev > 0 && ev <= 10) {
        var rate2 = ev / 10;
        var afterExtra = current * rate2;
        var extraDed = current - afterExtra;
        totalExtraSave = extraDed;
        steps.push({
          tag: '折上折',
          text: '在优惠后 <b>' + fmtMoney(current) + '</b> 的基础上再打 ' + ev + ' 折：' +
                '<b>' + fmtMoney(current) + '</b> × ' + (rate2 * 100).toFixed(2) + '% = <b>' + fmtMoney(afterExtra) + '</b> 元　' +
                '<span class="ds-step-ded">省 ' + fmtMoney(extraDed) + '</span>'
        });
        current = afterExtra;
      }
    }

    /* ---- 5. 运费 ---- */
    if (useShipping.checked) {
      var sv = parseFloat(shippingEl.value) || 0;
      if (sv > 0) {
        shippingValue = sv;
        var final1 = current + sv;
        steps.push({
          tag: '运费',
          text: '加上运费：<b>' + fmtMoney(current) + '</b> + ' + fmtMoney(sv) + ' = <b>' + fmtMoney(final1) + '</b> 元'
        });
        current = final1;
      }
    }

    /* ---- 汇总 ---- */
    var finalPrice = current;
    var totalSaved = totalDiscountSave + totalFullCutSave + totalCouponSave + totalExtraSave;
    var totalSavedWithShipping = totalSaved - 0; // 运费不减
    var zhe = origin > 0 ? (1 - totalSaved / origin) * 10 : 10;

    renderResult({
      origin: origin,
      finalPrice: finalPrice,
      totalSaved: totalSaved,
      zhe: zhe,
      discountSave: totalDiscountSave,
      fullCutSave: totalFullCutSave,
      couponSave: totalCouponSave,
      extraSave: totalExtraSave,
      shipping: shippingValue
    });

    renderSteps(steps);
    renderTip(totalSaved, origin, zhe, finalPrice, shippingValue);
  }

  /* ---------- 渲染结果 ---------- */
  function renderResult(r) {
    finalPriceEl.textContent = fmtMoney(r.finalPrice);
    finalPriceSubEl.textContent = r.shipping > 0
      ? '含运费 ' + fmtMoney(r.shipping) + ' 元'
      : '不含运费';

    totalSavedEl.textContent = fmtMoney(r.totalSaved);
    totalSavedSubEl.textContent = r.origin > 0
      ? '相当于 ' + r.zhe.toFixed(2) + ' 折'
      : '—';

    originTotalEl.textContent   = fmtMoney(r.origin) + ' 元';
    discountSaveEl.textContent  = r.discountSave > 0 ? '− ' + fmtMoney(r.discountSave) + ' 元' : '—';
    fullCutSaveEl.textContent   = r.fullCutSave > 0 ? '− ' + fmtMoney(r.fullCutSave) + ' 元' : '—';
    couponSaveEl.textContent    = r.couponSave > 0 ? '− ' + fmtMoney(r.couponSave) + ' 元' : '—';
    extraSaveEl.textContent     = r.extraSave > 0 ? '− ' + fmtMoney(r.extraSave) + ' 元' : '—';
    shippingValueEl.textContent = r.shipping > 0 ? '+ ' + fmtMoney(r.shipping) + ' 元' : '—';
  }

  function renderTip(totalSaved, origin, zhe, finalPrice, shipping) {
    if (origin <= 0) {
      tipEl.textContent = '—';
      return;
    }
    var pct = origin > 0 ? (totalSaved / origin * 100) : 0;
    var html = '原价 <b>' + fmtMoney(origin) + ' 元</b>，';
    if (totalSaved > 0) {
      html += '共优惠 <b>' + fmtMoney(totalSaved) + ' 元</b>（相当于 <b>' + zhe.toFixed(2) + ' 折</b>，省了 <b>' + pct.toFixed(1) + '%</b>），';
    } else {
      html += '当前没有优惠，';
    }
    html += '最终到手价 <b>' + fmtMoney(finalPrice) + ' 元</b>';
    if (shipping > 0) html += '（含运费 ' + fmtMoney(shipping) + ' 元）';
    html += '。';
    tipEl.innerHTML = html;
  }

  /* ---------- 步骤 ---------- */
  function renderSteps(steps) {
    if (!steps || !steps.length) {
      stepsEl.innerHTML = '<p class="empty">没有可展示的步骤。</p>';
      return;
    }
    stepsEl.innerHTML = steps.map(function (s, i) {
      var tag = s.tag ? '<span class="ds-step-tag">' + s.tag + '</span>' : '';
      return '<div class="ds-step">' +
        '<span class="ds-step-num">' + (i + 1) + '</span>' +
        '<div class="ds-step-body">' + tag + s.text + '</div>' +
      '</div>';
    }).join('');
  }

  function showEmpty(msg) {
    finalPriceEl.textContent = '—';
    finalPriceSubEl.textContent = '—';
    totalSavedEl.textContent = '—';
    totalSavedSubEl.textContent = '—';
    originTotalEl.textContent    = '—';
    discountSaveEl.textContent   = '—';
    fullCutSaveEl.textContent    = '—';
    couponSaveEl.textContent     = '—';
    extraSaveEl.textContent      = '—';
    shippingValueEl.textContent  = '—';
    tipEl.textContent = msg || '请输入有效的商品原价。';
    stepsEl.innerHTML = '<p class="empty">' + (msg || '点击「开始计算」后显示详细步骤。') + '</p>';
  }

  window.__discountInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();