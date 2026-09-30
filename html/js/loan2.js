/* ============================================================
   岁窦工具箱 · 贷款计算器
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var mode = 'equal-payment';  // equal-payment | equal-principal

  var amountEl, rateEl, termEl, termUnitEl, modeGroup;
  var calcBtn, resetBtn;

  var firstLabelEl, firstValueEl, firstSubEl;
  var totalInterestEl, totalInterestSubEl;
  var principalTotalEl, grandTotalEl, monthsEl;
  var firstMonthEl, lastMonthEl, decreaseEl;
  var tipEl;

  var showAllEl, exportCsvEl;
  var tbodyEl, emptyEl;

  var lastResult = null;  // { mode, rows: [...] }

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[贷款]', msg);
  }

  function fmtMoney(n) {
    if (!isFinite(n)) return '—';
    return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtMoneyShort(n) {
    if (!isFinite(n)) return '—';
    if (n >= 1e8) return (n / 1e8).toFixed(2) + ' 亿';
    if (n >= 1e4) return (n / 1e4).toFixed(2) + ' 万';
    return n.toFixed(2);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-loan');
    if (!page) return;

    amountEl   = document.getElementById('lnAmount');
    rateEl     = document.getElementById('lnRate');
    termEl     = document.getElementById('lnTerm');
    termUnitEl = document.getElementById('lnTermUnit');
    modeGroup  = document.getElementById('lnModeGroup');

    calcBtn  = document.getElementById('lnCalc');
    resetBtn = document.getElementById('lnReset');

    firstLabelEl       = document.getElementById('lnFirstLabel');
    firstValueEl       = document.getElementById('lnFirstValue');
    firstSubEl         = document.getElementById('lnFirstSub');
    totalInterestEl    = document.getElementById('lnTotalInterest');
    totalInterestSubEl = document.getElementById('lnTotalInterestSub');
    principalTotalEl   = document.getElementById('lnPrincipalTotal');
    grandTotalEl       = document.getElementById('lnGrandTotal');
    monthsEl           = document.getElementById('lnMonths');
    firstMonthEl       = document.getElementById('lnFirstMonth');
    lastMonthEl        = document.getElementById('lnLastMonth');
    decreaseEl         = document.getElementById('lnDecrease');
    tipEl              = document.getElementById('lnTip');

    showAllEl   = document.getElementById('lnShowAll');
    exportCsvEl = document.getElementById('lnExportCsv');
    tbodyEl     = document.getElementById('lnTbody');
    emptyEl     = document.getElementById('lnEmpty');

    if (!amountEl || !tbodyEl) return;

    inited = true;
    bindEvents();
    calc();

    console.log('[贷款] 已加载');
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    calcBtn.addEventListener('click', calc);
    resetBtn.addEventListener('click', reset);

    // 模式切换
    modeGroup.querySelectorAll('.ln-mode').forEach(function (btn) {
      btn.addEventListener('click', function () {
        modeGroup.querySelectorAll('.ln-mode').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        mode = btn.dataset.lnMode;
        calc();
      });
    });

    // 回车计算
    [amountEl, rateEl, termEl].forEach(function (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); calc(); }
      });
    });

    termUnitEl.addEventListener('change', calc);

    // 显示全部
    showAllEl.addEventListener('change', renderTable);

    // 导出
    exportCsvEl.addEventListener('click', exportCsv);
  }

  /* ---------- 重置 ---------- */
  function reset() {
    amountEl.value = '1000000';
    rateEl.value = '4.2';
    termEl.value = '30';
    termUnitEl.value = 'year';
    modeGroup.querySelectorAll('.ln-mode').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lnMode === 'equal-payment');
    });
    mode = 'equal-payment';
    calc();
    toast('已重置为默认参数');
  }

  /* ---------- 计算 ---------- */
  function calc() {
    var amount = parseFloat(amountEl.value);
    var annualRate = parseFloat(rateEl.value);
    var termValue = parseFloat(termEl.value);
    var unit = termUnitEl.value;

    if (!isFinite(amount) || amount <= 0) {
      toast('请填写有效的贷款金额');
      amountEl.focus();
      return;
    }
    if (!isFinite(annualRate) || annualRate < 0) {
      toast('请填写有效的年利率');
      rateEl.focus();
      return;
    }
    if (!isFinite(termValue) || termValue <= 0) {
      toast('请填写有效的贷款期限');
      termEl.focus();
      return;
    }

    var months = unit === 'year' ? Math.round(termValue * 12) : Math.round(termValue);
    if (months < 1) { toast('贷款期限至少 1 个月'); return; }
    if (months > 600) { toast('贷款期限最长支持 600 个月（50 年）'); return; }

    var monthlyRate = annualRate / 100 / 12;

    var result = mode === 'equal-payment'
      ? calcEqualPayment(amount, monthlyRate, months)
      : calcEqualPrincipal(amount, monthlyRate, months);

    lastResult = result;
    renderResult(result);
    renderTable();
    renderTip();
  }

  /* 等额本息 */
  function calcEqualPayment(principal, monthlyRate, months) {
    var monthly;
    if (monthlyRate === 0) {
      monthly = principal / months;
    } else {
      var f = Math.pow(1 + monthlyRate, months);
      monthly = principal * monthlyRate * f / (f - 1);
    }

    var rows = [];
    var remain = principal;
    var totalInterest = 0;

    for (var i = 1; i <= months; i++) {
      var interest = remain * monthlyRate;
      var capital = monthly - interest;
      // 最后一期做尾差修正
      if (i === months) {
        capital = remain;
        monthly = capital + interest;
      }
      remain = remain - capital;
      if (remain < 0) remain = 0;
      totalInterest += interest;

      rows.push({
        period: i,
        monthly: monthly,
        capital: capital,
        interest: interest,
        remain: remain
      });
    }

    var totalPayment = principal + totalInterest;
    var firstMonth = rows[0].monthly;
    var lastMonth = rows[rows.length - 1].monthly;

    return {
      mode: 'equal-payment',
      principal: principal,
      months: months,
      rows: rows,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
      firstMonth: firstMonth,
      lastMonth: lastMonth,
      decrease: 0
    };
  }

  /* 等额本金 */
  function calcEqualPrincipal(principal, monthlyRate, months) {
    var capitalPerMonth = principal / months;
    var rows = [];
    var remain = principal;
    var totalInterest = 0;

    for (var i = 1; i <= months; i++) {
      var interest = remain * monthlyRate;
      var monthly = capitalPerMonth + interest;
      remain = remain - capitalPerMonth;
      if (remain < 0) remain = 0;
      totalInterest += interest;

      rows.push({
        period: i,
        monthly: monthly,
        capital: capitalPerMonth,
        interest: interest,
        remain: remain
      });
    }

    var totalPayment = principal + totalInterest;
    var firstMonth = rows[0].monthly;
    var lastMonth = rows[rows.length - 1].monthly;
    var decrease = firstMonth - lastMonth;

    return {
      mode: 'equal-principal',
      principal: principal,
      months: months,
      rows: rows,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
      firstMonth: firstMonth,
      lastMonth: lastMonth,
      decrease: decrease
    };
  }

  /* ---------- 渲染结果 ---------- */
  function renderResult(r) {
    if (!r) return;

    if (r.mode === 'equal-payment') {
      firstLabelEl.textContent = '每月月供';
      firstValueEl.textContent = fmtMoney(r.firstMonth);
      firstSubEl.textContent   = '等额本息　共 ' + r.months + ' 期';
    } else {
      firstLabelEl.textContent = '首月月供';
      firstValueEl.textContent = fmtMoney(r.firstMonth);
      firstSubEl.textContent   = '等额本金　末月 ' + fmtMoney(r.lastMonth);
    }

    totalInterestEl.textContent = fmtMoney(r.totalInterest);
    var pct = r.totalPayment > 0 ? (r.totalInterest / r.totalPayment * 100) : 0;
    totalInterestSubEl.textContent = '占总还款额 ' + pct.toFixed(1) + '%';

    principalTotalEl.textContent = fmtMoneyShort(r.principal) + ' 元';
    grandTotalEl.textContent     = fmtMoneyShort(r.totalPayment) + ' 元';
    monthsEl.textContent         = r.months + ' 期';
    firstMonthEl.textContent     = fmtMoney(r.firstMonth);
    lastMonthEl.textContent      = fmtMoney(r.lastMonth);
    decreaseEl.textContent       = r.mode === 'equal-principal'
      ? fmtMoney(r.decrease)
      : '—';
  }

  /* ---------- 渲染明细 ---------- */
  function renderTable() {
    if (!lastResult) {
      tbodyEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    var rows = lastResult.rows;
    var showAll = !!showAllEl.checked;

    var list = rows;
    var hiddenCount = 0;
    if (!showAll && rows.length > 24) {
      // 只显示前 12 期与后 12 期
      var head = rows.slice(0, 12);
      var tail = rows.slice(-12);
      hiddenCount = rows.length - head.length - tail.length;
      list = head.concat([{ _divider: true }], tail);
    }

    tbodyEl.innerHTML = list.map(function (row) {
      if (row._divider) {
        return '<tr><td colspan="5" class="ln-more">…… 中间省略 ' + hiddenCount + ' 期，勾选「显示全部月份」查看完整明细 ……</td></tr>';
      }
      return '<tr>' +
        '<td>' + row.period + '</td>' +
        '<td class="ln-hl">' + fmtMoney(row.monthly) + '</td>' +
        '<td>' + fmtMoney(row.capital) + '</td>' +
        '<td>' + fmtMoney(row.interest) + '</td>' +
        '<td>' + fmtMoney(row.remain) + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ---------- 提示 ---------- */
  function renderTip() {
    if (!lastResult) return;
    var r = lastResult;
    if (r.mode === 'equal-payment') {
      tipEl.innerHTML =
        '等额本息：每月固定还款 <b>' + fmtMoney(r.firstMonth) + ' 元</b>，共 <b>' + r.months + '</b> 期，' +
        '累计支付利息 <b>' + fmtMoney(r.totalInterest) + ' 元</b>，' +
        '还款总额 <b>' + fmtMoney(r.totalPayment) + ' 元</b>。';
    } else {
      tipEl.innerHTML =
        '等额本金：首月还款 <b>' + fmtMoney(r.firstMonth) + ' 元</b>，之后每月递减 <b>' + fmtMoney(r.decrease) + ' 元</b>，' +
        '末月 <b>' + fmtMoney(r.lastMonth) + ' 元</b>，共 <b>' + r.months + '</b> 期，' +
        '累计支付利息 <b>' + fmtMoney(r.totalInterest) + ' 元</b>，' +
        '还款总额 <b>' + fmtMoney(r.totalPayment) + ' 元</b>。';
    }
  }

  /* ---------- 导出 CSV ---------- */
  function exportCsv() {
    if (!lastResult) { toast('请先计算'); return; }
    var r = lastResult;
    var header = '期数,月供(元),本金(元),利息(元),剩余本金(元)\n';
    var rows = r.rows.map(function (row) {
      return [
        row.period,
        row.monthly.toFixed(2),
        row.capital.toFixed(2),
        row.interest.toFixed(2),
        row.remain.toFixed(2)
      ].join(',');
    }).join('\n');

    var summary =
      '\n\n还款方式,' + (r.mode === 'equal-payment' ? '等额本息' : '等额本金') + '\n' +
      '贷款本金(元),' + r.principal.toFixed(2) + '\n' +
      '还款月数,' + r.months + '\n' +
      '支付总利息(元),' + r.totalInterest.toFixed(2) + '\n' +
      '还款总额(元),' + r.totalPayment.toFixed(2) + '\n';

    var content = '\ufeff' + header + rows + summary;
    var d = new Date();
    var name = '贷款还款计划_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
               '_' + pad(d.getHours()) + pad(d.getMinutes()) + '.csv';

    try {
      var blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      toast('已导出：' + name);
    } catch (e) {
      alert('导出失败：' + (e && e.message ? e.message : e));
    }
  }

  window.__loanInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();