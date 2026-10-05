/* ============================================================
   小说助手（容器） · V4.1 活力版
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-novelassistant');
  if (!page) return;

  // 子工具 → 原 section id
  const SUB_MAP = {
    timeline:     'page-timeline',
    namer:        'page-namer',
    dialogue:     'page-dialogue',
    random:       'page-random',
    notes:        'page-notes',
    novelmanage:  'page-novel'      // 原"小说助手" section id 还是 page-novel，只是显示名改成"小说管理"
  };

  // 子工具切换后需要触发的初始化（和 main2.js 里 go() 的分支保持一致）
  const SUB_INIT = {
    timeline: 'loadTimeline',
    notes:    'loadNotes',
    novelmanage: 'renderNovelList'
  };

  const $ = id => document.getElementById(id);

  let migrated = false;
  let currentSub = 'timeline';

  /* ---------- 一次性搬迁 DOM ---------- */
  function migrate(){
    if (migrated) return;
    migrated = true;

    Object.keys(SUB_MAP).forEach(sub => {
      const slot = page.querySelector('[data-na-slot="' + sub + '"]');
      const src = document.getElementById(SUB_MAP[sub]);
      if (!slot || !src) return;

      // 把原 section 从 main 里摘下来，塞到 slot
      if (src.parentNode) src.parentNode.removeChild(src);
      slot.appendChild(src);
    });
  }

  /* ---------- 切子标签 ---------- */
  function switchSub(sub){
    if (!SUB_MAP[sub]) sub = 'timeline';
    currentSub = sub;

    // tabs
    page.querySelectorAll('#naTabs .ta-subtab').forEach(b => {
      b.classList.toggle('active', b.dataset.na === sub);
    });

    // slots
    Object.keys(SUB_MAP).forEach(k => {
      const slot = page.querySelector('[data-na-slot="' + k + '"]');
      if (slot) slot.style.display = (k === sub) ? '' : 'none';
    });

    // 触发子工具的重绘 / 初始化
    const initFn = SUB_INIT[sub];
    if (initFn && typeof window[initFn] === 'function'){
      setTimeout(() => {
        try { window[initFn](); } catch(e){ console.warn('[小说助手] 子工具初始化失败：', initFn, e); }
      }, 30);
    }
  }

  /* ---------- 对外：供 main2.js 的 go() 调用 ---------- */
  window.__naSwitchSub = function(sub){
    migrate();
    switchSub(sub);
  };

  window.__novelassistantInit = function(){
    migrate();
    switchSub(currentSub);
  };

  /* ---------- 绑定 tabs ---------- */
  $('naTabs').addEventListener('click', e => {
    const btn = e.target.closest('.ta-subtab[data-na]');
    if (!btn) return;
    switchSub(btn.dataset.na);
  });

  /* ---------- 初始化 ---------- */
  migrate();
  switchSub('timeline');

  console.log('[小说助手] 已加载');
})();