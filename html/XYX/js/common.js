/* ===== 游戏页通用逻辑 ===== */
(function (global) {
  'use strict';

  const PA = {};

  PA.el = function (id) { return document.getElementById(id); };

  /* ================= 弹窗 ================= */
  let modalEl = null;
  let modalOnClose = null;

  function ensureModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.className = 'modal-backdrop hidden';
    modalEl.innerHTML =
      '<div class="modal">' +
        '<div class="modal-title"></div>' +
        '<div class="modal-body"></div>' +
        '<button class="btn btn-primary modal-btn">知道了</button>' +
      '</div>';
    document.body.appendChild(modalEl);

    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) PA.hideModal();
    });
    modalEl.querySelector('.modal-btn').addEventListener('click', function () {
      PAAudio.click();
      PA.hideModal();
    });

    return modalEl;
  }

  PA.showModal = function (opts) {
    opts = opts || {};
    const m = ensureModal();
    m.querySelector('.modal-title').textContent = opts.title || '';
    m.querySelector('.modal-body').innerHTML = opts.body || '';
    m.querySelector('.modal-btn').textContent = opts.button || '知道了';
    modalOnClose = opts.onClose || null;
    m.classList.remove('hidden');
  };

  PA.hideModal = function () {
    if (!modalEl || modalEl.classList.contains('hidden')) return;
    modalEl.classList.add('hidden');
    const cb = modalOnClose;
    modalOnClose = null;
    if (cb) cb();
  };

  PA.isModalOpen = function () {
    return !!modalEl && !modalEl.classList.contains('hidden');
  };

  /* ================= 玩法说明 ================= */
  PA.showHelp = function (key, title, html) {
    PA.showModal({ title: title || '玩法说明', body: html, button: '开始游戏' });
    PAStore.markHelpSeen(key);
  };

  PA.autoHelp = function (key, title, html, onClose) {
    if (PAStore.hasSeenHelp(key)) return false;
    PA.showModal({ title: title, body: html, button: '我知道了', onClose: onClose });
    PAStore.markHelpSeen(key);
    return true;
  };

  /* ================= HUD 数值 ================= */
  PA.bump = function (el) {
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(function () { el.classList.remove('bump'); }, 260);
  };

  PA.setValue = function (el, value) {
    if (!el) return;
    if (el.textContent === String(value)) return;
    el.textContent = value;
    PA.bump(el);
  };

  /* ================= 音效按钮 ================= */
  PA.bindMuteButton = function (btn) {
    if (!btn) return null;

    function sync() {
      const m = PAAudio.isMuted();
      btn.textContent = m ? '×' : '♪';
      btn.classList.toggle('muted', m);
      btn.title = m ? '音效已关' : '音效已开';
    }

    btn.addEventListener('click', function () {
      PAAudio.toggleMute();
      if (!PAAudio.isMuted()) PAAudio.click();
      sync();
    });

    sync();
    return sync;
  };

  /* ================= 音量按钮（单例面板） ================= */
  PA.bindVolumeButton = function (btn) {
    if (!btn) return;

    let panel = null;

    function syncIcon() {
      const v = PAAudio.getVolume();
      if (PAAudio.isMuted() || v === 0) {
        btn.textContent = '🔇';
      } else if (v < 0.4) {
        btn.textContent = '🔈';
      } else if (v < 0.75) {
        btn.textContent = '🔉';
      } else {
        btn.textContent = '🔊';
      }
    }

    function buildPanel() {
      if (panel) return panel;

      panel = document.createElement('div');
      panel.className = 'modal-backdrop volume-backdrop hidden';
      panel.innerHTML =
        '<div class="modal volume-modal">' +
          '<div class="modal-title">音量</div>' +
          '<div class="volume-row">' +
            '<span class="volume-icon">🔈</span>' +
            '<input type="range" min="0" max="100" id="vol-slider">' +
            '<span class="volume-icon">🔊</span>' +
          '</div>' +
          '<div class="volume-value" id="vol-value">0%</div>' +
          '<button class="btn btn-primary modal-btn" id="vol-done">完成</button>' +
        '</div>';
      document.body.appendChild(panel);

      const slider = panel.querySelector('#vol-slider');
      const valEl = panel.querySelector('#vol-value');
      let lastPlay = 0;

      slider.addEventListener('input', function () {
        const v = parseInt(slider.value, 10) / 100;
        PAAudio.setVolume(v);
        valEl.textContent = Math.round(v * 100) + '%';

        const now = Date.now();
        if (now - lastPlay > 120) {
          lastPlay = now;
          PAAudio.click();
        }
      });

      panel.querySelector('#vol-done').addEventListener('click', close);
      panel.addEventListener('click', function (e) {
        if (e.target === panel) close();
      });

      return panel;
    }

    function open() {
      PAAudio.unlock();
      const el = buildPanel();
      const slider = el.querySelector('#vol-slider');
      const valEl = el.querySelector('#vol-value');
      const v = Math.round(PAAudio.getVolume() * 100);
      slider.value = v;
      valEl.textContent = v + '%';
      el.classList.remove('hidden');
    }

    function close() {
      if (!panel) return;
      PAAudio.click();
      panel.classList.add('hidden');
      syncIcon();
    }

    btn.addEventListener('click', open);
    syncIcon();
    return syncIcon;
  };

  /* ================= 按钮按压反馈 ================= */
  PA.installPressFeedback = function () {
    document.addEventListener('pointerdown', function (e) {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      btn.classList.add('pressed');
      if (navigator.vibrate) {
        try { navigator.vibrate(12); } catch (err) { /* 忽略 */ }
      }
    }, { passive: true });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      document.addEventListener(evt, function (e) {
        const btn = e.target.closest && e.target.closest('.btn');
        if (btn) btn.classList.remove('pressed');
      }, { passive: true });
    });
  };

  /* ================= 触摸滑动 ================= */
  PA.onSwipe = function (el, handlers) {
    let sx = 0, sy = 0, active = false;
    const THRESHOLD = 22;

    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      active = true;
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      if (active && e.cancelable) e.preventDefault();
    }, { passive: false });

    el.addEventListener('touchend', function (e) {
      if (!active) return;
      active = false;

      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;

      if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) {
        if (handlers.onTap) handlers.onTap();
        return;
      }

      if (Math.abs(dx) > Math.abs(dy)) {
        const fn = dx > 0 ? handlers.onRight : handlers.onLeft;
        if (fn) fn();
      } else {
        const fn = dy > 0 ? handlers.onDown : handlers.onUp;
        if (fn) fn();
      }
    }, { passive: true });
  };

  /* ================= HUD 数字滚动 ================= */
  function installHudAnimation() {
    const els = document.querySelectorAll('.hud-value');

    els.forEach(function (el) {
      if (!/^\d+$/.test((el.textContent || '').trim())) return;

      let current = parseInt(el.textContent, 10) || 0;
      let raf = null;

      const obs = new MutationObserver(function () {
        const raw = (el.textContent || '').trim();
        if (!/^\d+$/.test(raw)) return;

        const target = parseInt(raw, 10);
        if (!isFinite(target) || target === current) return;

        if (raf) cancelAnimationFrame(raf);

        const from = current;
        const dur = 320;
        const t0 = performance.now();
        current = target;

        obs.disconnect();

        const step = function (t) {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const v = Math.round(from + (target - from) * eased);
          el.textContent = String(v);

          if (p < 1) {
            raf = requestAnimationFrame(step);
          } else {
            el.textContent = String(target);
            obs.observe(el, { childList: true, characterData: true, subtree: true });
          }
        };

        raf = requestAnimationFrame(step);
      });

      obs.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* ================= 横屏提示 ================= */
  function ensureLandscapeTip() {
    if (document.querySelector('.landscape-tip')) return;
    const tip = document.createElement('div');
    tip.className = 'landscape-tip';
    tip.innerHTML =
      '<div class="icon">↻</div>' +
      '<div>请竖屏游戏</div>';
    document.body.appendChild(tip);
  }

  /* ================= 全屏按钮 ================= */
  function toggleFullscreen() {
    const doc = document;
    const el = doc.documentElement;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    }
    PAAudio.click();
  }

  function injectFullscreenButton() {
    const bar = document.querySelector('.game-bar-right');
    if (!bar || document.getElementById('btn-full')) return;

    const btn = document.createElement('button');
    btn.className = 'btn btn-icon';
    btn.id = 'btn-full';
    btn.setAttribute('aria-label', '全屏');
    btn.innerHTML =
      '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">' +
        '<path d="M2 2h5v2H4v3H2V2zm12 0v5h-2V4h-3V2h5z' +
              'M2 14V9h2v3h3v2H2zm12 0H9v-2h3V9h2v5z"/>' +
      '</svg>';
    btn.addEventListener('click', toggleFullscreen);
    bar.appendChild(btn);
  }

  /* ================= 返回菜单：过渡 + 确认 ================= */
  PA.shouldConfirmExit = null;

  function installExitTransition() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;
      if (link.target === '_blank') return;

      if (typeof PA.shouldConfirmExit === 'function' &&
          PA.shouldConfirmExit() === true) {
        e.preventDefault();
        PA.showModal({
          title: '退出游戏？',
          body: '当前进度不会保存。<br><br>确定要返回主菜单吗？',
          button: '退出',
          onClose: function () {
            document.body.classList.add('page-leave');
            setTimeout(function () { window.location.href = href; }, 140);
          }
        });
        return;
      }

      e.preventDefault();
      document.body.classList.add('page-leave');
      setTimeout(function () { window.location.href = href; }, 140);
    });
  }

  /* ================= 帧率监测 ================= */
  PA.fps = {
    frames: 0,
    last: 0,
    low: false,
    listeners: [],

    start() {
      if (this.started) return;
      this.started = true;

      const self = this;
      self.last = performance.now();
      self.frames = 0;

      function tick(t) {
        self.frames++;
        if (t - self.last >= 1000) {
          const fps = self.frames;
          self.frames = 0;
          self.last = t;
          const low = fps < 45;
          if (low !== self.low) {
            self.low = low;
            self.listeners.forEach(function (fn) { fn(low, fps); });
          }
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    },

    onLow(fn) { this.listeners.push(fn); }
  };

  /* ================= 开场动画 ================= */
  PA.showSplash = function (onDone) {
    try {
      if (sessionStorage.getItem('pa_splash_seen') === '1') {
        if (onDone) onDone();
        return;
      }
      sessionStorage.setItem('pa_splash_seen', '1');
    } catch (e) { /* 忽略 */ }

    const el = document.createElement('div');
    el.id = 'splash';
    el.innerHTML =
      '<div class="splash-logo">PIXEL ARCADE</div>' +
      '<div class="splash-sub">9 IN 1</div>' +
      '<div class="splash-start">PRESS START</div>';
    document.body.appendChild(el);

    let done = false;
    const finish = function () {
      if (done) return;
      done = true;
      el.classList.add('fade-out');
      PAAudio.unlock();
      PAAudio.start();
      setTimeout(function () {
        el.remove();
        if (onDone) onDone();
      }, 340);
    };

    el.addEventListener('click', finish);
    el.addEventListener('touchstart', finish, { passive: true });
    document.addEventListener('keydown', function handler() {
      document.removeEventListener('keydown', handler);
      finish();
    });

    setTimeout(finish, 3000);
  };

  /* ================= 游戏页初始化 ================= */
  PA.setupGamePage = function (opts) {
    opts = opts || {};

    const muteBtn = PA.el('btn-mute');
    if (muteBtn) PA.bindMuteButton(muteBtn);

    const volBtn = PA.el('btn-volume');
    if (volBtn) PA.bindVolumeButton(volBtn);

    const helpBtn = PA.el('btn-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', function () {
        PAAudio.click();
        PA.showHelp(opts.key, opts.helpTitle || '玩法说明', opts.helpHtml);
      });
    }

    // 底部操作提示
    const hintEl = PA.el('game-hint');
    if (hintEl && opts.hint) {
      hintEl.innerHTML = opts.hint;
    }

    // 首次交互解锁音频
    const unlock = function () {
      PAAudio.unlock();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });

    PA.installPressFeedback();
    installHudAnimation();
    ensureLandscapeTip();
    injectFullscreenButton();
    installExitTransition();

    // 游玩次数记录
    if (opts.key) PAStore.incVisit(opts.key);

    // 帧率监测
    PA.fps.start();
    PA.fps.onLow(function (isLow) {
      document.body.classList.toggle('low-fps', isLow);
    });
  };

  global.PA = PA;
})(window);