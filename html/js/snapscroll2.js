/* ============================================================
   岁窦工具箱 · 整屏翻页（首页 / 帮助页）
   —— 基于 CSS scroll-snap，配合右侧指示器与键盘导航
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var instances = {};   // { home: {...}, help: {...} }

  function initOne(key) {
    var wrapId = 'snap' + key.charAt(0).toUpperCase() + key.slice(1);
    var wrap = document.getElementById(wrapId);
    if (!wrap) return null;
    var indicator = wrap.parentElement.querySelector('.snap-indicator');
    if (!indicator) return null;

    var sections = wrap.querySelectorAll('.snap-section');
    if (!sections.length) return null;

    // 若指示器已有静态按钮，直接绑定；否则生成
    if (!indicator.querySelector('.snap-dot')) {
      sections.forEach(function (sec, i) {
        var title = sec.dataset.snapTitle || ('第 ' + (i + 1) + ' 屏');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'snap-dot' + (i === 0 ? ' active' : '');
        btn.dataset.snapIndex = String(i);
        btn.innerHTML = '<span class="snap-dot-dot"></span>' +
                        '<span class="snap-dot-text">' + title + '</span>';
        indicator.appendChild(btn);
      });
    }
    // 统一绑定点击
    indicator.querySelectorAll('.snap-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.dataset.snapIndex, 10);
        if (isFinite(idx)) goTo(key, idx);
      });
    });
    indicator.classList.add('show');
    var inst = {
      wrap: wrap,
      indicator: indicator,
      sections: sections,
      current: 0
    };
    instances[key] = inst;

    // 监听滚动
    var scrollTimer = null;
    wrap.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () { updateCurrent(key); }, 60);
    }, { passive: true });

    // 帮助页的「快速导航」按钮：data-help -> 对应 #id
    if (key === 'help') {
      document.querySelectorAll('#page-help [data-help]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var targetId = btn.dataset.help;
          var targetSec = wrap.querySelector('#' + targetId);
          if (targetSec) {
            var idx = Array.prototype.indexOf.call(sections, targetSec);
            if (idx >= 0) goTo(key, idx);
          }
        });
      });
    }

    return inst;
  }

  function goTo(key, index) {
    var inst = instances[key];
    if (!inst) return;
    var total = inst.sections.length;
    if (index < 0) index = 0;
    if (index >= total) index = total - 1;
    var targetTop = index * inst.wrap.clientHeight;
    inst.wrap.scrollTo({ top: targetTop, behavior: 'smooth' });
    updateIndicator(key, index);
  }

  function updateCurrent(key) {
    var inst = instances[key];
    if (!inst) return;
    var h = inst.wrap.clientHeight;
    if (!h) return;
    var idx = Math.round(inst.wrap.scrollTop / h);
    if (idx < 0) idx = 0;
    if (idx >= inst.sections.length) idx = inst.sections.length - 1;
    updateIndicator(key, idx);
  }

  function updateIndicator(key, idx) {
    var inst = instances[key];
    if (!inst) return;
    if (inst.current === idx) return;
    inst.current = idx;
    inst.indicator.querySelectorAll('.snap-dot').forEach(function (dot, i) {
      dot.classList.toggle('active', i === idx);
    });
  }

  function refresh(key) {
    var inst = instances[key];
    if (!inst) return;
    // 重新对齐到当前屏
    var targetTop = inst.current * inst.wrap.clientHeight;
    inst.wrap.scrollTop = targetTop;
    updateCurrent(key);
    updateIndicator(key, inst.current);
  }

  function showIndicator(key, show) {
    var inst = instances[key];
    if (!inst) return;
    inst.indicator.classList.toggle('show', !!show);
  }

  function init() {
    if (inited) return;
    var homePage = document.getElementById('page-home');
    if (!homePage) return;

    inited = true;

    initOne('home');
    initOne('help');

    // 键盘
    document.addEventListener('keydown', function (e) {
      var activePage = document.querySelector('.page.active');
      if (!activePage) return;
      var key = activePage.id.replace(/^page-/, '');
      if (key !== 'home' && key !== 'help') return;

      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      var inst = instances[key];
      if (!inst) return;

      // 如果焦点在内层可滚动区域且该区域还能滚，就让内层先滚
      var scrollTarget = findScrollParent(e.target, inst.wrap);
      if (scrollTarget) {
        var atTop = scrollTarget.scrollTop <= 0;
        var atBottom = scrollTarget.scrollTop + scrollTarget.clientHeight >= scrollTarget.scrollHeight - 1;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          if (!atBottom) return;
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          if (!atTop) return;
        }
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goTo(key, inst.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(key, inst.current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(key, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(key, inst.sections.length - 1);
      }
    });

    // 页脚快捷跳转
    document.querySelectorAll('#page-home [data-snap-jump]').forEach(function (a) {
      a.addEventListener('click', function () {
        var target = a.dataset.snapJump;
        if (typeof window.go === 'function') window.go(target);
      });
    });
    // 首页快捷入口：跳到同页内某一屏（按元素 id 找）
document.querySelectorAll('#page-home [data-snap-goto]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var targetId = btn.dataset.snapGoto;
    var inst = instances['home'];
    if (!inst) return;
    var el = inst.wrap.querySelector('#' + targetId);
    if (!el) return;
    var sec = el.closest('.snap-section');
    if (!sec) return;
    var idx = Array.prototype.indexOf.call(inst.sections, sec);
    if (idx >= 0) goTo('home', idx);
  });
});

    // 页面切换时控制指示器显示 + 刷新布局
    var pages = document.querySelectorAll('.page');
    var obs = new MutationObserver(function () {
      pages.forEach(function (p) {
        var key = p.id.replace(/^page-/, '');
        if (key !== 'home' && key !== 'help') return;
        var isActive = p.classList.contains('active');
        showIndicator(key, isActive);
        if (isActive) {
          // 延迟一点点，等 display 切换完再计算
          setTimeout(function () { refresh(key); }, 30);
        }
      });
    });
    pages.forEach(function (p) { obs.observe(p, { attributes: true, attributeFilter: ['class'] }); });

    // 初始状态
    pages.forEach(function (p) {
      var key = p.id.replace(/^page-/, '');
      if (key !== 'home' && key !== 'help') return;
      showIndicator(key, p.classList.contains('active'));
    });

    // 窗口变化
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        refresh('home');
        refresh('help');
      }, 180);
    });

    // header 高度变化
    window.addEventListener('load', function () {
      setTimeout(function () { refresh('home'); refresh('help'); }, 100);
    });

    console.log('[整屏翻页] 已加载');
  }

  /* 找到事件目标在内层可滚动的祖先 */
  function findScrollParent(el, stopAt) {
    while (el && el !== stopAt && el !== document.body) {
      if (el.nodeType === 1) {
        var st = window.getComputedStyle(el);
        var oy = st.overflowY;
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
          return el;
        }
      }
      el = el.parentElement;
    }
    return null;
  }

  // 首页快捷入口：跳到同页内的目标元素
document.querySelectorAll('#page-home [data-snap-goto]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var targetId = btn.dataset.snapGoto;
    var inst = instances['home'];
    if (!inst) return;
    var targetSec = inst.wrap.querySelector('#' + targetId);
    if (!targetSec) {
      targetSec = inst.wrap.querySelector('[data-snap-title]');
      // 兜底：如果 id 不在 section 上，就找最近包含该 id 的 section
      var el = inst.wrap.querySelector('#' + targetId);
      if (el) {
        targetSec = el.closest('.snap-section');
      }
    }
    if (!targetSec) return;
    var idx = Array.prototype.indexOf.call(inst.sections, targetSec);
    if (idx >= 0) goTo('home', idx);
  });
});
  /* ---------- 导出 ---------- */
  window.__snapscrollInit = init;
  window.__snapscrollGoTo = goTo;
  window.__snapscrollRefresh = refresh;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* 热门应用：分类快捷入口 → 跳到应用中心对应分类 */
document.addEventListener('click', function (e) {
  var btn = e.target.closest('#hotCats .hot-cat');
  if (!btn) return;
  var catName = btn.dataset.cat;
  if (typeof window.go === 'function') window.go('apps');
  setTimeout(function () {
    var cards = document.querySelectorAll('#page-apps .category-card');
    for (var i = 0; i < cards.length; i++) {
      var h = cards[i].querySelector('h3');
      if (h && h.textContent.trim() === catName) {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        cards[i].style.transition = 'box-shadow .3s';
        cards[i].style.boxShadow = '0 0 0 3px rgba(245,179,1,.45)';
        setTimeout(function () { cards[i].style.boxShadow = ''; }, 1400);
        break;
      }
    }
  }, 260);
});



/* 首页 · 每屏进入视口时触发内容淡入 */
(function () {
  var home = document.getElementById('page-home');
  if (!home) return;

  var sections = home.querySelectorAll('.snap-section');
  if (!sections.length) return;

  if (!('IntersectionObserver' in window)) {
    sections.forEach(function (s) { s.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('in');
    });
  }, {
    root: document.getElementById('snapHome') || null,
    threshold: 0.35
  });

  sections.forEach(function (s) { io.observe(s); });
})();