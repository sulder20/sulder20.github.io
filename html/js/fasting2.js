/* ============================================================
   轻断食时间表 · V4.1 活力版
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-fasting');
  if (!page) return;

  const FASTING_KEY = 'suidou-fasting-v1';
  const MODE_HOURS = { '16:8': 8, '18:6': 6, '20:4': 4, '14:10': 10 };
  const RING_CIRCUMFERENCE = 2 * Math.PI * 86; // 约 540.35

  const $ = id => document.getElementById(id);

  /* ---------- 状态 ---------- */
  let state = {
    mode: '16:8',
    customHours: 8,
    eatingStart: '12:00',
    records: {}          // 'YYYY-MM-DD': true
  };

  function save(){
    try { localStorage.setItem(FASTING_KEY, JSON.stringify(state)); }
    catch(e){ console.warn('[轻断食] 保存失败：', e); }
  }
  function load(){
    try {
      const raw = localStorage.getItem(FASTING_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d && typeof d === 'object'){
        state.mode = d.mode || '16:8';
        state.customHours = d.customHours || 8;
        state.eatingStart = d.eatingStart || '12:00';
        state.records = d.records || {};
      }
    } catch(e){}
  }

  /* ---------- 工具 ---------- */
  function pad2(n){ return String(n).padStart(2, '0'); }
  function fmtTime(min){
    min = ((min % 1440) + 1440) % 1440;
    const h = Math.floor(min / 60), m = Math.floor(min % 60);
    return pad2(h) + ':' + pad2(m);
  }
  function parseTime(s){
    const [h, m] = (s || '12:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }
  function dateKey(d){
    return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
  }

  function getEatingHours(){
    if (state.mode === 'custom'){
      const v = parseFloat(state.customHours);
      if (isFinite(v) && v > 0 && v < 24) return v;
      return 8;
    }
    return MODE_HOURS[state.mode] || 8;
  }

  function getEatingWindow(){
    const start = parseTime(state.eatingStart);
    const hours = getEatingHours();
    const end = start + hours * 60;
    return { start, end, hours };
  }

  /* 当前状态：返回 {phase, seconds, progress} */
  function getStatus(){
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const { start, hours } = getEatingWindow();
    const eatMin = hours * 60;
    const elapsed = ((nowMin - start) % 1440 + 1440) % 1440;
    const inEating = elapsed < eatMin;
    if (inEating){
      const remainMin = eatMin - elapsed;
      return {
        phase: 'eating',
        seconds: Math.floor(remainMin * 60),
        progress: elapsed / eatMin,
        label: '正在进食',
        sub: '距断食开始'
      };
    } else {
      const remainMin = 1440 - elapsed;
      return {
        phase: 'fasting',
        seconds: Math.floor(remainMin * 60),
        progress: (elapsed - eatMin) / (1440 - eatMin),
        label: '正在断食',
        sub: '距下次进食'
      };
    }
  }

  function fmtCountdown(sec){
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }

  /* ---------- 渲染：状态卡 ---------- */
  function renderStatus(){
    const st = getStatus();
    const { start, end, hours } = getEatingWindow();
    const fastingHours = 24 - hours;

    $('fsPhaseLabel').textContent = st.label;
    $('fsPhaseSub').textContent = st.sub;
    $('fsTimer').textContent = fmtCountdown(st.seconds);

    const ring = document.querySelector('.fs-status-ring');
    ring.classList.toggle('eating', st.phase === 'eating');
    ring.classList.toggle('fasting', st.phase === 'fasting');

    const offset = RING_CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, st.progress)));
    $('fsRingProgress').style.strokeDashoffset = offset;

    // 进食窗口
    $('fsEatingWindow').textContent = fmtTime(start) + ' - ' + fmtTime(end);
    // 断食窗口
    $('fsFastingWindow').textContent = fmtTime(end) + ' - 次日 ' + fmtTime(start);
    // 时长
    $('fsDurations').textContent = hours + 'h / ' + fastingHours + 'h';

    // 当前时间
    const now = new Date();
    $('fsNow').textContent = pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
  }

  /* ---------- 渲染：时间轴 ---------- */
  function renderTimeline(){
    const { start, end, hours } = getEatingWindow();
    const eatBar = $('fsTimelineEating');

    // 计算进食块的 left / width（%）
    let leftPct, widthPct;
    if (end <= 1440){
      leftPct = start / 1440 * 100;
      widthPct = (end - start) / 1440 * 100;
    } else {
      // 跨天，用两段
      // 先清空，用两个 span 拼
      const firstLeft = start / 1440 * 100;
      const firstWidth = (1440 - start) / 1440 * 100;
      const secondLeft = 0;
      const secondWidth = (end - 1440) / 1440 * 100;
      eatBar.innerHTML =
        '<span style="position:absolute;top:0;bottom:0;left:' + firstLeft + '%;width:' + firstWidth + '%;background:inherit;border-radius:12px 0 0 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;letter-spacing:1px;">' +
          (hours >= 3 ? hours + 'h 进食' : '')
        '</span>' +
        '<span style="position:absolute;top:0;bottom:0;left:' + secondLeft + '%;width:' + secondWidth + '%;background:inherit;border-radius:0 12px 12px 0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;letter-spacing:1px;">' +
          (hours >= 3 ? '续 ' + fmtTime(end) : '')
        '</span>';
      eatBar.style.background = 'transparent';
      eatBar.style.border = 'none';
      // 位置和宽度归零，改用子 span 显示
      eatBar.style.left = '0';
      eatBar.style.width = '100%';
      renderTimelineNow();
      return;
    }

    eatBar.innerHTML = hours >= 3 ? (hours + 'h 进食') : '';
    eatBar.style.background = 'linear-gradient(180deg,#a8d4ab,#8fb59a)';
    eatBar.style.border = 'none';
    eatBar.style.left = leftPct + '%';
    eatBar.style.width = widthPct + '%';

    renderTimelineNow();
  }

  function renderTimelineNow(){
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const pct = nowMin / 1440 * 100;
    $('fsTimelineNow').style.left = pct + '%';
  }

  /* ---------- 渲染：打卡 ---------- */
  function renderCheckin(){
    const today = new Date();
    const todayKey = dateKey(today);
    const isDoneToday = !!state.records[todayKey];

    const btn = $('fsCheckin');
    btn.classList.toggle('done', isDoneToday);
    btn.textContent = isDoneToday ? '✓ 今天已打卡（点击取消）' : '✓ 今天完成了';

    // 最近 7 天
    const days = [];
    for (let i = 6; i >= 0; i--){
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    const weekNames = ['日','一','二','三','四','五','六'];
    $('fsCheckinHistory').innerHTML = days.map(d => {
      const k = dateKey(d);
      const done = !!state.records[k];
      const isToday = k === todayKey;
      const cls = 'fs-day-cell' + (done ? ' done' : '') + (isToday ? ' today' : '');
      return '<button type="button" class="' + cls + '" data-fs-day="' + k + '">' +
        '<span class="fs-day-num">' + d.getDate() + '</span>' +
        '<span class="fs-day-week">' + weekNames[d.getDay()] + '</span>' +
      '</button>';
    }).join('');

    $('fsCheckinHistory').querySelectorAll('[data-fs-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.fsDay;
        if (state.records[k]) delete state.records[k];
        else state.records[k] = true;
        save();
        renderCheckin();
        renderStats();
      });
    });
  }

  /* ---------- 渲染：30 天统计 ---------- */
  function renderStats(){
    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--){
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    const todayKey = dateKey(today);
    let doneCount = 0;
    const bars = days.map(d => {
      const k = dateKey(d);
      const done = !!state.records[k];
      if (done) doneCount++;
      const isToday = k === todayKey;
      const cls = 'fs-bar' + (done ? ' done' : '') + (isToday ? ' today' : '');
      return '<div class="' + cls + '" title="' + k + (done ? ' 已完成' : ' 未完成') + '"></div>';
    }).join('');
    $('fsStatsBar').innerHTML = bars;

    const rate = Math.round(doneCount / 30 * 100);
    if (doneCount === 0){
      $('fsStatsText').textContent = '还没有打卡记录，从今天开始吧～';
    } else {
      $('fsStatsText').innerHTML =
        '近 30 天完成 <b>' + doneCount + '</b> / 30 天，完成率 <b>' + rate + '%</b>';
    }
  }

  /* ---------- 配置交互 ---------- */
  function bindConfig(){
    $('fsModes').querySelectorAll('.fs-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.dataset.mode;
        state.mode = m;
        $('fsModes').querySelectorAll('.fs-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
        $('fsCustomField').style.display = (m === 'custom') ? '' : 'none';
        save();
        renderAll();
      });
    });

    $('fsEatingStart').addEventListener('change', e => {
      state.eatingStart = e.target.value || '12:00';
      save();
      renderAll();
    });

    $('fsCustomHours').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (isFinite(v) && v > 0 && v < 24){
        state.customHours = v;
        save();
        renderAll();
      }
    });
  }

  function bindCheckin(){
    $('fsCheckin').addEventListener('click', () => {
      const k = dateKey(new Date());
      if (state.records[k]){
        delete state.records[k];
        if (typeof showToast === 'function') showToast('已取消今日打卡');
      } else {
        state.records[k] = true;
        if (typeof showToast === 'function') showToast('今日打卡完成 🎉');
      }
      save();
      renderCheckin();
      renderStats();
    });
  }

  /* ---------- 全量渲染 ---------- */
  function renderAll(){
    renderStatus();
    renderTimeline();
    renderCheckin();
    renderStats();
  }

  /* ---------- 首屏恢复配置 UI ---------- */
  function restoreUI(){
    $('fsModes').querySelectorAll('.fs-mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === state.mode);
    });
    $('fsCustomField').style.display = (state.mode === 'custom') ? '' : 'none';
    $('fsEatingStart').value = state.eatingStart;
    $('fsCustomHours').value = state.customHours;
  }

  /* ---------- 对外接口 ---------- */
  let tickTimer = null;

  window.__fastingInit = function(){
    load();
    restoreUI();
    renderAll();

    // 每秒刷新状态卡和时间轴指针
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      // 页面激活时才刷新
      if (page.classList.contains('active')){
        renderStatus();
        renderTimelineNow();
      }
    }, 1000);
  };

  /* ---------- 事件绑定（只做一次） ---------- */
  bindConfig();
  bindCheckin();

  /* 首屏如果本来就是轻断食页，也初始化 */
  if (page.classList.contains('active')) window.__fastingInit();

  console.log('[轻断食时间表] 已加载');
})();