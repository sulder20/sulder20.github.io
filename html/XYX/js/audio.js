/* ===== 8-bit 音效引擎（Web Audio 实时合成） ===== */
(function (global) {
  'use strict';

  const MUTE_KEY = 'pa_muted';
  const VOL_KEY = 'pa_volume';
  let ctx = null;
  let muted = (function () {
    try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { return false; }
  })();
  let volume = (function () {
    try {
      const v = parseFloat(localStorage.getItem(VOL_KEY));
      return isFinite(v) && v >= 0 && v <= 1 ? v : 0.7;
    } catch (e) { return 0.7; }
  })();

  function ac() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { ctx.resume(); }
    return ctx;
  }

  /**
   * 单个方波音
   * @param {number} freq   起始频率
   * @param {number} dur    时长（秒）
   * @param {object} opts   { type, vol, delay, slideTo }
   */
  function beep(freq, dur, opts) {
    if (muted) return;
    const c = ac();
    if (!c) return;

    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0);
    const baseVol = opts.vol == null ? 0.1 : opts.vol;
    const vol = baseVol * volume;

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = opts.type || 'square';
    osc.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (opts.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slideTo), t0 + dur);
    }

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function seq(notes) {
    notes.forEach(n => beep(n[0], n[1], n[2] || {}));
  }

  const PAAudio = {
    /** 通用点击 */
    click() { beep(760, 0.05, { vol: 0.08 }); },

    /** 方向移动（低音量） */
    move() { beep(300, 0.025, { vol: 0.035 }); },

    /** 吃到 / 得小分 */
    eat() { seq([[660, 0.06, {}], [990, 0.09, { delay: 0.06 }]]); },

    /** 得分 / 升级 */
    score() { seq([[880, 0.06, {}], [1320, 0.1, { delay: 0.07 }]]); },

    /** 开始游戏 */
    start() { seq([[523, 0.07, {}], [659, 0.07, { delay: 0.09 }], [784, 0.13, { delay: 0.18 }]]); },

    /** 失败 */
    fail() { seq([[320, 0.16, { slideTo: 90 }], [200, 0.24, { delay: 0.15, slideTo: 60 }]]); },

    /** 新纪录 */
    win() { seq([[784, 0.08, {}], [988, 0.08, { delay: 0.09 }], [1175, 0.08, { delay: 0.18 }], [1568, 0.18, { delay: 0.27 }]]); },

    /** 翻牌 */
    flip() { beep(520, 0.05, { vol: 0.07, type: 'triangle' }); },

    /** 配对成功 */
    match() { seq([[740, 0.07, {}], [1108, 0.1, { delay: 0.07 }]]); },

    isMuted() { return muted; },

    toggleMute() {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* 忽略 */ }
      return muted;
    },
    
    getVolume() { return volume; },

    setVolume(v) {
      volume = Math.max(0, Math.min(1, v));
      try { localStorage.setItem(VOL_KEY, String(volume)); } catch (e) {}
      if (volume > 0) {
        this.click();
      }
      return volume;
    },

    /** 用户首次交互时解锁音频上下文 */
    unlock() { ac(); }
  };

  global.PAAudio = PAAudio;
})(window);