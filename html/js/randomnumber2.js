/* ============================================================
   随机数 · 岁窦工具箱 V4.1
   ============================================================ */
(function () {
  'use strict';

  var container = document.getElementById('rnContainer');
  if (!container) return;

  var tabsEl = document.getElementById('rnTabs');
  var mode = 'int';

  /* ---------- 工具函数 ---------- */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randFloat(min, max, decimals) {
    var v = Math.random() * (max - min) + min;
    var p = Math.pow(10, decimals);
    return Math.round(v * p) / p;
  }
  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        if (typeof showToast === 'function') showToast('已复制到剪贴板');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); if (typeof showToast === 'function') showToast('已复制'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 子页面渲染 ---------- */
  function render() {
    if (mode === 'int') return renderInt();
    if (mode === 'float') return renderFloat();
    if (mode === 'pick') return renderPick();
    if (mode === 'shuffle') return renderShuffle();
  }

  function renderInt() {
    container.innerHTML =
      '<div class="panel">' +
        '<div class="rn-form">' +
          '<label class="field"><span>最小值</span><input type="text" id="rnIntMin" value="1"></label>' +
          '<label class="field"><span>最大值</span><input type="text" id="rnIntMax" value="100"></label>' +
          '<label class="field"><span>生成个数</span><input type="text" id="rnIntCount" value="10"></label>' +
          '<label class="field"><span>是否去重</span>' +
            '<select id="rnIntUnique"><option value="0">允许重复</option><option value="1" selected>不重复</option></select>' +
          '</label>' +
        '</div>' +
        '<div class="rn-actions">' +
          '<button class="btn" id="rnIntGo" type="button">生成</button>' +
          '<button class="btn ghost small" id="rnIntCopy" type="button">复制结果</button>' +
        '</div>' +
        '<div class="rn-result" id="rnIntResult"></div>' +
      '</div>';

    var goBtn = document.getElementById('rnIntGo');
    var copyBtn = document.getElementById('rnIntCopy');
    var resultEl = document.getElementById('rnIntResult');

    goBtn.addEventListener('click', function () {
      var min = parseInt(document.getElementById('rnIntMin').value, 10);
      var max = parseInt(document.getElementById('rnIntMax').value, 10);
      var count = parseInt(document.getElementById('rnIntCount').value, 10);
      var unique = document.getElementById('rnIntUnique').value === '1';

      if (!isFinite(min) || !isFinite(max)) {
        resultEl.textContent = '请输入有效的最小值与最大值';
        return;
      }
      if (min > max) { var t = min; min = max; max = t; }
      if (!isFinite(count) || count < 1) count = 1;
      if (count > 10000) count = 10000;

      var total = max - min + 1;
      if (unique && count > total) {
        resultEl.textContent = '范围只有 ' + total + ' 个数，无法生成 ' + count + ' 个不重复的数';
        return;
      }

      var nums = [];
      if (unique) {
        if (total <= 100000) {
          var pool = [];
          for (var i = min; i <= max; i++) pool.push(i);
          nums = shuffleArray(pool).slice(0, count);
        } else {
          var seen = {};
          while (nums.length < count) {
            var n = randInt(min, max);
            if (!seen[n]) { seen[n] = 1; nums.push(n); }
          }
        }
      } else {
        for (var j = 0; j < count; j++) nums.push(randInt(min, max));
      }

      resultEl.innerHTML = nums.map(function (n) {
        return '<span class="rn-num">' + n + '</span>';
      }).join('');
    });

    copyBtn.addEventListener('click', function () {
      copyText(resultEl.textContent.trim());
    });
  }

  function renderFloat() {
    container.innerHTML =
      '<div class="panel">' +
        '<div class="rn-form">' +
          '<label class="field"><span>最小值</span><input type="text" id="rnFltMin" value="0"></label>' +
          '<label class="field"><span>最大值</span><input type="text" id="rnFltMax" value="1"></label>' +
          '<label class="field"><span>生成个数</span><input type="text" id="rnFltCount" value="10"></label>' +
          '<label class="field"><span>小数位数（0-10）</span><input type="text" id="rnFltDecimals" value="2"></label>' +
        '</div>' +
        '<div class="rn-actions">' +
          '<button class="btn" id="rnFltGo" type="button">生成</button>' +
          '<button class="btn ghost small" id="rnFltCopy" type="button">复制结果</button>' +
        '</div>' +
        '<div class="rn-result" id="rnFltResult"></div>' +
      '</div>';

    var goBtn = document.getElementById('rnFltGo');
    var copyBtn = document.getElementById('rnFltCopy');
    var resultEl = document.getElementById('rnFltResult');

    goBtn.addEventListener('click', function () {
      var min = parseFloat(document.getElementById('rnFltMin').value);
      var max = parseFloat(document.getElementById('rnFltMax').value);
      var count = parseInt(document.getElementById('rnFltCount').value, 10);
      var dec = parseInt(document.getElementById('rnFltDecimals').value, 10);

      if (!isFinite(min) || !isFinite(max)) {
        resultEl.textContent = '请输入有效的最小值与最大值';
        return;
      }
      if (min > max) { var t = min; min = max; max = t; }
      if (!isFinite(count) || count < 1) count = 1;
      if (count > 10000) count = 10000;
      if (!isFinite(dec) || dec < 0) dec = 0;
      if (dec > 10) dec = 10;

      var nums = [];
      for (var i = 0; i < count; i++) {
        nums.push(randFloat(min, max, dec));
      }
      resultEl.innerHTML = nums.map(function (n) {
        return '<span class="rn-num">' + n.toFixed(dec) + '</span>';
      }).join('');
    });

    copyBtn.addEventListener('click', function () {
      copyText(resultEl.textContent.trim());
    });
  }

  function renderPick() {
    container.innerHTML =
      '<div class="panel">' +
        '<div class="field">' +
          '<span>候选列表（每行一个）</span>' +
          '<textarea id="rnPickList" rows="8" style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#fffaf0;outline:none;font-size:13.5px;line-height:1.7;font-family:inherit;resize:vertical;box-sizing:border-box;"></textarea>' +
        '</div>' +
        '<div class="rn-form">' +
          '<label class="field"><span>抽取个数</span><input type="text" id="rnPickCount" value="1"></label>' +
          '<label class="field"><span>是否去重</span>' +
            '<select id="rnPickUnique"><option value="1" selected>不重复</option><option value="0">允许重复</option></select>' +
          '</label>' +
        '</div>' +
        '<div class="rn-actions">' +
          '<button class="btn" id="rnPickGo" type="button">抽取</button>' +
          '<button class="btn ghost small" id="rnPickCopy" type="button">复制结果</button>' +
        '</div>' +
        '<div class="rn-result" id="rnPickResult"></div>' +
      '</div>';

    var listEl = document.getElementById('rnPickList');
    var goBtn = document.getElementById('rnPickGo');
    var copyBtn = document.getElementById('rnPickCopy');
    var resultEl = document.getElementById('rnPickResult');

    goBtn.addEventListener('click', function () {
      var raw = listEl.value;
      var items = raw.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
      if (!items.length) {
        resultEl.textContent = '列表为空，请先粘贴内容';
        return;
      }
      var count = parseInt(document.getElementById('rnPickCount').value, 10);
      var unique = document.getElementById('rnPickUnique').value === '1';

      if (!isFinite(count) || count < 1) count = 1;
      if (unique && count > items.length) {
        resultEl.textContent = '列表只有 ' + items.length + ' 项，无法抽取 ' + count + ' 个不重复项';
        return;
      }
      if (count > 10000) count = 10000;

      var out = [];
      if (unique) {
        out = shuffleArray(items).slice(0, count);
      } else {
        for (var i = 0; i < count; i++) {
          out.push(items[randInt(0, items.length - 1)]);
        }
      }
      resultEl.innerHTML = out.map(function (n) {
        return '<span class="rn-num">' + esc(n) + '</span>';
      }).join('');
    });

    copyBtn.addEventListener('click', function () {
      copyText(resultEl.textContent.trim());
    });
  }

  function renderShuffle() {
    container.innerHTML =
      '<div class="panel">' +
        '<div class="field">' +
          '<span>待洗牌的内容（每行一个）</span>' +
          '<textarea id="rnShuffleList" rows="8" style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#fffaf0;outline:none;font-size:13.5px;line-height:1.7;font-family:inherit;resize:vertical;box-sizing:border-box;"></textarea>' +
        '</div>' +
        '<div class="rn-actions">' +
          '<button class="btn" id="rnShuffleGo" type="button">洗牌</button>' +
          '<button class="btn ghost small" id="rnShuffleCopy" type="button">复制结果</button>' +
        '</div>' +
        '<div class="rn-result" id="rnShuffleResult"></div>' +
      '</div>';

    var listEl = document.getElementById('rnShuffleList');
    var goBtn = document.getElementById('rnShuffleGo');
    var copyBtn = document.getElementById('rnShuffleCopy');
    var resultEl = document.getElementById('rnShuffleResult');

    goBtn.addEventListener('click', function () {
      var raw = listEl.value;
      var items = raw.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
      if (!items.length) {
        resultEl.textContent = '列表为空，请先粘贴内容';
        return;
      }
      var shuffled = shuffleArray(items);
      resultEl.innerHTML = shuffled.map(function (n) {
        return '<span class="rn-num">' + esc(n) + '</span>';
      }).join('');
    });

    copyBtn.addEventListener('click', function () {
      copyText(resultEl.textContent.trim());
    });
  }

  /* ---------- 子标签 ---------- */
  if (tabsEl) {
    tabsEl.querySelectorAll('.ta-subtab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabsEl.querySelectorAll('.ta-subtab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        mode = tab.dataset.rn;
        render();
      });
    });
  }

  render();

  window.__randomnumberInit = function () { render(); };

  console.log('[随机数] 已加载');
})();