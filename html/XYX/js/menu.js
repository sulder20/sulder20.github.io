/* ===== 主菜单 ===== */
(function () {
  'use strict';

  const RECENT_KEY = 'pa_recent';
  const MAX_RECENT = 4;

  const GAMES = [
    {
      key: 'snake', name: '贪吃蛇', href: 'games/snake.html', tag: '经典',
      icon: [
        '........','.XX.....','.XX.....','..X.....',
        '..X.....','..XXX...','....X...','....X...'
      ]
    },
    {
      key: 'tetris', name: '俄罗斯方块', href: 'games/tetris.html', tag: '经典',
      icon: [
        '........','...X....','..XXX...','........',
        '........','..XX....','..XX....','........'
      ]
    },
    {
      key: 'breakout', name: '打砖块', href: 'games/breakout.html', tag: '经典',
      icon: [
        '........','XXXXXXXX','........','.XXXXXX.',
        '...X....','........','..XXXX..','........'
      ]
    },
    {
      key: '2048', name: '2048', href: 'games/2048.html', tag: '经典',
      icon: [
        '........','.XXXXXX.','.X....X.','.X.XX.X.',
        '.X.XX.X.','.X....X.','.XXXXXX.','........'
      ]
    },
    {
      key: 'memory', name: '记忆翻牌', href: 'games/memory.html', tag: '经典',
      icon: [
        '........','.XX..XX.','.X....X.','.X....X.',
        '.XX..XX.','........','........','........'
      ]
    },
    {
      key: 'dodge', name: '闪避方块', href: 'games/dodge.html', tag: '原创',
      icon: [
        '........','........','.X....X.','........',
        '........','...XX...','...XX...','........'
      ]
    },
    {
      key: 'color-trap', name: '颜色陷阱', href: 'games/color-trap.html', tag: '原创',
      icon: [
        '........','.XXX....','.X.X....','.XXX....',
        '........','..XXX...','..X.X...','..XXX...'
      ]
    },
    {
      key: 'rhythm', name: '节奏点击', href: 'games/rhythm.html', tag: '原创',
      icon: [
        '....XX..','...XX...','..XX....','.XXXX...',
        '....X...','....X...','...XX...','........'
      ]
    },
    {
      key: 'merge', name: '数字合成', href: 'games/merge.html', tag: '原创',
      icon: [
        '........','.XX.....','.XX.....','....XX..',
        '....XX..','........','..XXXX..','........'
      ]
    }
  ];

  /* ---------- 最近游玩 ---------- */
  function getRecent() {
    try {
      const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function pushRecent(key) {
    if (!key) return;
    try {
      let list = getRecent().filter(function (k) { return k !== key; });
      list.unshift(key);
      list = list.slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) { /* 忽略 */ }
  }

  function renderRecent() {
    const box = document.getElementById('menu-recent');
    const list = document.getElementById('menu-recent-list');
    if (!box || !list) return;

    const recent = getRecent();
    const items = recent
      .map(function (k) {
        return GAMES.find(function (g) { return g.key === k; });
      })
      .filter(Boolean);

    if (items.length === 0) {
      box.classList.add('hidden');
      return;
    }

    box.classList.remove('hidden');
    list.innerHTML = '';

    items.forEach(function (g) {
      const a = document.createElement('a');
      a.className = 'recent-chip';
      a.href = g.href;
      a.innerHTML =
        '<span class="dot"></span>' +
        '<span>' + g.name + '</span>';
      a.addEventListener('click', function () {
        PAAudio.click();
        pushRecent(g.key);
        PAStore.incVisit(g.key);
      });
      list.appendChild(a);
    });
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    const visits = PAStore.getAllVisits();
    const played = Object.keys(visits).filter(function (k) {
      return visits[k] > 0;
    }).length;
    const totalVisits = Object.keys(visits).reduce(function (sum, k) {
      return sum + visits[k];
    }, 0);

    let totalBest = 0;
    GAMES.forEach(function (g) { totalBest += PAStore.getHigh(g.key); });

    const elPlayed = document.getElementById('stat-played');
    const elVisits = document.getElementById('stat-visits');
    const elBest = document.getElementById('stat-best');
    if (elPlayed) elPlayed.textContent = played + '/' + GAMES.length;
    if (elVisits) elVisits.textContent = totalVisits;
    if (elBest) elBest.textContent = totalBest;
  }

  /* ---------- 重置按钮 ---------- */
  function bindReset() {
    const btn = document.getElementById('btn-reset');
    if (!btn) return;

    btn.addEventListener('click', function () {
      PAAudio.click();
      PA.showModal({
        title: '重置全部数据？',
        body: '所有游戏的最高分、游玩记录都会被清除。<br><br>此操作<b>无法撤销</b>。',
        button: '确认重置',
        onClose: function () {
          PAStore.resetAll();
          PAAudio.fail();
          setTimeout(function () { window.location.reload(); }, 300);
        }
      });
    });
  }

  /* ---------- 绘制像素图标 ---------- */
  function renderIcon(canvas, pattern) {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssSize = 48;
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#9bbc0f';

    const n = pattern.length;
    const px = canvas.width / n;

    for (let y = 0; y < n; y++) {
      const row = pattern[y];
      for (let x = 0; x < n; x++) {
        if (row[x] === 'X') {
          ctx.fillRect(
            Math.round(x * px),
            Math.round(y * px),
            Math.ceil(px),
            Math.ceil(px)
          );
        }
      }
    }
  }

  /* ---------- 键盘导航状态 ---------- */
  let kbIndex = 0;

  function getCards() {
    return Array.prototype.slice.call(
      document.querySelectorAll('.game-card')
    );
  }

  function updateKbFocus() {
    const cards = getCards();
    cards.forEach(function (c, i) {
      c.classList.toggle('kb-focus', i === kbIndex);
    });
    if (cards[kbIndex]) {
      cards[kbIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function moveKbFocus(dx, dy) {
    const cards = getCards();
    if (!cards.length) return;

    const delta = dx + dy * 3;
    let next = (kbIndex + delta) % cards.length;
    if (next < 0) next += cards.length;
    kbIndex = next;

    updateKbFocus();
    PAAudio.move();
  }

  function openCard(card) {
    if (!card) return;
    const key = card.dataset.key || '';
    pushRecent(key);
    PAStore.incVisit(key);
    document.body.classList.add('page-leave');
    setTimeout(function () { window.location.href = card.href; }, 140);
  }

  /* ---------- 构建卡片 ---------- */
  const grid = document.getElementById('menu-grid');
  let filter = 'all';

  function renderGrid() {
    grid.innerHTML = '';

    const list = GAMES.filter(function (g) {
      return filter === 'all' || g.tag === filter;
    });

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'menu-empty';
      empty.textContent = '这个分类下暂时没有游戏';
      grid.appendChild(empty);
      return;
    }

    list.forEach(function (g, i) {
      const a = document.createElement('a');
      a.className = 'game-card';
      a.href = g.href;
      a.dataset.key = g.key;
      a.style.animationDelay = (i * 40) + 'ms';

      const tag = document.createElement('span');
      tag.className = 'card-tag';
      tag.textContent = g.tag;

      const iconBox = document.createElement('div');
      iconBox.className = 'card-icon';
      const cv = document.createElement('canvas');
      iconBox.appendChild(cv);

      const name = document.createElement('div');
      name.className = 'card-name';
      name.textContent = g.name;

      const best = document.createElement('div');
      best.className = 'card-best';
      const high = PAStore.getHigh(g.key);
      best.textContent = high > 0 ? 'BEST ' + high : '';

      a.appendChild(tag);
      a.appendChild(iconBox);
      a.appendChild(name);
      a.appendChild(best);

      a.addEventListener('click', function (e) {
        // 键盘 Enter 已经自己跳转，避免重复触发
        if (e.defaultPrevented) return;
        PAAudio.click();
        pushRecent(g.key);
        PAStore.incVisit(g.key);
      });

      grid.appendChild(a);
      renderIcon(cv, g.icon);
    });

    // 卡片数变化后校正选中索引
    const cards = getCards();
    if (kbIndex >= cards.length) kbIndex = 0;
    updateKbFocus();
  }

  /* ---------- 筛选按钮 ---------- */
  function bindFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        filter = b.dataset.filter || 'all';
        buttons.forEach(function (x) {
          x.classList.toggle('active', x === b);
        });
        PAAudio.click();
        renderGrid();
      });
    });
  }

  /* ---------- 键盘事件 ---------- */
  document.addEventListener('keydown', function (e) {
    if (PA.isModalOpen && PA.isModalOpen()) return;

    const k = e.key;

    if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
      e.preventDefault(); moveKbFocus(-1, 0); return;
    }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') {
      e.preventDefault(); moveKbFocus(1, 0); return;
    }
    if (k === 'ArrowUp' || k === 'w' || k === 'W') {
      e.preventDefault(); moveKbFocus(0, -1); return;
    }
    if (k === 'ArrowDown' || k === 's' || k === 'S') {
      e.preventDefault(); moveKbFocus(0, 1); return;
    }

    if (k === 'Enter' || k === ' ') {
      const cards = getCards();
      const target = cards[kbIndex];
      if (target) {
        e.preventDefault();
        PAAudio.click();
        openCard(target);
      }
    }
  });

  /* ---------- 鼠标 hover 同步焦点 ---------- */
  document.addEventListener('mouseover', function (e) {
    const card = e.target.closest('.game-card');
    if (!card) return;
    const cards = getCards();
    const i = cards.indexOf(card);
    if (i >= 0 && i !== kbIndex) {
      kbIndex = i;
      updateKbFocus();
    }
  });

  /* ---------- 页面进入动画 ---------- */
  document.body.classList.add('page-enter');

  /* ---------- 启动 ---------- */
  renderRecent();
  renderStats();
  bindReset();
  bindFilters();
  renderGrid();

  PA.bindMuteButton(document.getElementById('btn-mute'));
  if (PA.bindVolumeButton) {
    PA.bindVolumeButton(document.getElementById('btn-volume'));
  }

  document.addEventListener('pointerdown', function () {
    PAAudio.unlock();
  }, { once: true });

  /* ---------- 开场动画 ---------- */
  if (PA.showSplash) PA.showSplash();
})();