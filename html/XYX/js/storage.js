/* ===== 本地存储：最高分 & 说明已读 ===== */
(function (global) {
  'use strict';

  const HIGH_PREFIX = 'pa_high_';
  const HELP_PREFIX = 'pa_help_';

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* 忽略 */ }
  }

  const PAStore = {
    getHigh(key) {
      const v = parseInt(safeGet(HIGH_PREFIX + key), 10);
      return Number.isFinite(v) ? v : 0;
    },

    /** 返回 true 表示刷新了纪录 */
    setHigh(key, score) {
      const cur = this.getHigh(key);
      if (score > cur) {
        safeSet(HIGH_PREFIX + key, String(score));
        return true;
      }
      return false;
    },

    hasSeenHelp(key) {
      return safeGet(HELP_PREFIX + key) === '1';
    },

    markHelpSeen(key) {
      safeSet(HELP_PREFIX + key, '1');
    },
    /* ---------- 游玩次数 ---------- */
    incVisit(key) {
      const cur = parseInt(safeGet('pa_visits_' + key), 10) || 0;
      safeSet('pa_visits_' + key, String(cur + 1));
    },

    getVisits(key) {
      return parseInt(safeGet('pa_visits_' + key), 10) || 0;
    },

    getAllVisits() {
      const out = {};
      try {
        Object.keys(localStorage).forEach(function (k) {
          if (k.indexOf('pa_visits_') === 0) {
            out[k.replace('pa_visits_', '')] =
              parseInt(localStorage.getItem(k), 10) || 0;
          }
        });
      } catch (e) { /* 忽略 */ }
      return out;
    },

    resetVisits() {
      try {
        Object.keys(localStorage)
          .filter(function (k) { return k.indexOf('pa_visits_') === 0; })
          .forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) { /* 忽略 */ }
    },

    resetAll() {
      try {
        Object.keys(localStorage)
          .filter(function (k) {
            return k.indexOf('pa_high_') === 0 ||
                   k.indexOf('pa_visits_') === 0 ||
                   k.indexOf('pa_help_') === 0;
          })
          .forEach(function (k) { localStorage.removeItem(k); });
        localStorage.removeItem('pa_recent');
      } catch (e) { /* 忽略 */ }
    }
  };

  global.PAStore = PAStore;
})(window);