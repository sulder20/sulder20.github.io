/* ============================================================
   应用中心 · C 方案
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-apps');
  if (!page) return;

  /* ---------- localStorage keys ---------- */
  const FAV_KEY    = 'suidou-tools-fav-v1';
  const USAGE_KEY  = 'suidou-tools-usage-v1';
  const BANNER_KEY = 'suidou-tools-banner-v1';

  /* ============================================================
     图标库
     ============================================================ */
  const ICONS = {
    heart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z"/><path d="M9 10h2l1-2 1 4 1-2h2"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/></svg>',
    sun:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="5"/></svg>',
    wind:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="3"/></svg>',
    droplet:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5S5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-12.5-7-12.5z"/><path d="M9 15a3 3 0 0 0 3 3"/></svg>',
    speaker:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    alert:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    firstaid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z"/><path d="M12 9v6M9 12h6"/></svg>',
    acupoint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>',
    timer:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M18 4.5l1.5-1.5"/></svg>',
    bandage:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="4"/><circle cx="7" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="17" cy="12" r="1"/></svg>',
    book:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h5"/></svg>',
    file:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>',
    users:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
    brush:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
    network:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M8.6 7.6L11 15M15.4 7.6L13 15M9 6h6"/></svg>',
    music:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    mapPin:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    film:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16"/><path d="M2 9h5M2 15h5M17 9h5M17 15h5"/></svg>',
    chef:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    table:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    video:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 8l6 4-6 4V8z"/></svg>',
    smile:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4 4 0 0 0 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/></svg>',
    chart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M6.5 17c1.6-6.4 3.1-9.5 4.6-9.5s2.4 8.5 3.9 8.5 1.8-4.2 3.5-5.5"/></svg>',
    flask:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10"/><path d="M8 3v7l-4 8a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-4-8V3"/><circle cx="9.5" cy="15" r="1"/><circle cx="14" cy="16" r="1"/></svg>',
    grid:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    bolt:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>',
    atom:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>',
    dna:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4c4 4 4 12 0 16M20 4c-4 4-4 12 0 16M4 12h16"/></svg>',
    body:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v9M7 11h10M9 21l3-5 3 5"/></svg>',
    globe:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    map:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3l-6 3v12l6-3 6 3 6-3V3l-6 3z"/><path d="M9 3v12M15 6v12"/></svg>',
    feather:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/></svg>',
    cell:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>',
    eye:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="3"/></svg>',
    history:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    world:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>',
    calc:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/></svg>',
    barChart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>',
    exchange: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8l4 4-4 4"/></svg>',
    fuel:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h12V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v18z"/><path d="M3 8h12"/><path d="M15 10h2a2 2 0 0 1 2 2v7a2 2 0 0 0 4 0v-9l-3-3"/><path d="M6 12h6v6H6z"/></svg>',
    palette:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="14.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="16.5" r="2.5"/><path d="M12 22a10 10 0 1 1 0-20 8 8 0 0 0 0 16h1a2 2 0 0 1 0 4z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>',
    loan:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M7 14h4M7 18h10"/><circle cx="17" cy="15" r="2"/></svg>',
    tag:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>',
    hash:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>',
    clock:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    wallet:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M2 9h20"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/></svg>',
    worldClock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M3 12h18M4.5 6.5h15M4.5 17.5h15"/></svg>',
    star:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 6.9L21 11l-5.5 4.2L17.5 22 12 18.2 6.5 22l2-6.8L3 11l6.6-2.1z"/></svg>',
    bot:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    code:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/><path d="M14 4l-4 16"/></svg>',
    json:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2"/><path d="M16 3h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2"/><circle cx="12" cy="12" r="1"/></svg>',
    cron:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M3 3l3 3M21 3l-3 3"/></svg>',
    image:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M21 15l-5-5-4 4-3-3-4 4"/><circle cx="9" cy="9" r="2"/></svg>',
    qr:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3M21 14v7h-7M17 17h.01"/></svg>',
    wheel:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 3"/><circle cx="12" cy="12" r="1.5"/></svg>',
    coin:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9.5h6M9 12h6M9 14.5h3"/></svg>',
    zapTest:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    car:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h2M11 10h2M15 10h2M7 14h10"/></svg>',
    countdown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M12 14v4M10 16h4"/></svg>',
    volume:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M5 6v12M19 6v12M8 9v6M16 9v6"/></svg>',
    shuffle:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>',
    lock:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5"/></svg>'
  };

    /* ============================================================
     分类定义
     ============================================================ */
  const CATS = [
    { id: '健康与运动',  name: '健康与运动' },
    { id: '创作工坊',    name: '创作工坊' },
    { id: '收藏与记录',  name: '收藏与记录' },
    { id: '数理化',      name: '数理化' },
    { id: '人文与自然',  name: '人文与自然' },
    { id: '计算与数据',  name: '计算与数据' },
    { id: '时间与生活',  name: '时间与生活' },
    { id: 'AI 与开发',   name: 'AI 与开发' },
    { id: '实用工具',    name: '实用工具' }
  ];

  /* ============================================================
     全部工具数据
     ============================================================ */
  const NEW_DATE = '2026-10-05';
  const APPS_DATA = [
    /* ---------- 健康与运动 ---------- */
    { id: 'health',        name: '健康管理',        cat: '健康与运动', icon: 'heart',    desc: 'BMI + 鞋码 + 睡眠 + 生命体征，AI 辅助分析' },
    { id: 'exercise',      name: '运动记录',        cat: '健康与运动', icon: 'dumbbell', desc: '计划 / 记录运动，AI 估算热量，导出 Word / PNG' },
    { id: 'heatindex',     name: '体感温度',        cat: '健康与运动', icon: 'sun',      desc: '温湿度风速综合评估，户外运动风险提示' },
    { id: 'meditation',    name: '冥想练习',        cat: '健康与运动', icon: 'wind',     desc: '4-7-8 / 箱式呼吸等节奏，圆形随呼吸缩放' },
    { id: 'hydration',     name: '饮水量计算',      cat: '健康与运动', icon: 'droplet',  desc: '按体重活动量气温估算每日饮水量' },
    { id: 'whitenoise',    name: '白噪音助眠',      cat: '健康与运动', icon: 'speaker',  desc: '雨声 / 海浪 / 壁炉，纯 Web Audio 合成' },
    { id: 'allergy',       name: '食物过敏清单',    cat: '健康与运动', icon: 'alert',    desc: '记录过敏原与症状应对，支持导出' },
    { id: 'firstaid',      name: '急救知识速查',    cat: '健康与运动', icon: 'firstaid', desc: '12 个紧急场景 + CPR 节拍器 + AED 引导', newDate: NEW_DATE },
    { id: 'acupoint',      name: '常见穴位速查',    cat: '健康与运动', icon: 'acupoint', desc: '25 个穴位，按症状 / 部位 / 经络三视角查询', newDate: NEW_DATE },
    { id: 'fasting',       name: '轻断食时间表',    cat: '健康与运动', icon: 'timer',    desc: '16:8 / 18:6 等模式，状态倒计时 + 打卡统计', newDate: NEW_DATE },
    { id: 'sportsinjury',  name: '运动损伤应急处理', cat: '健康与运动', icon: 'bandage',  desc: '10 种常见运动损伤的识别与处理指南', newDate: NEW_DATE },

    /* ---------- 创作工坊 ---------- */
    { id: 'novelassistant', name: '小说助手',       cat: '创作工坊', icon: 'book',  desc: '时间线 + 起名器 + 对话生成器 + 灵感速记 + 小说管理', newDate: NEW_DATE },
    { id: 'textanalysis',  name: '文章分析',        cat: '创作工坊', icon: 'file',  desc: '字数统计 + 词频分析 + 词云概览' },
    { id: 'people',        name: '人物印象表',      cat: '创作工坊', icon: 'users', desc: '记录人物信息与印象，AI 生成小传' },
    { id: 'canvas',        name: '畅想画布',        cat: '创作工坊', icon: 'brush', desc: '自由白板涂鸦，支持撤销与导出 PNG' },
    { id: 'relgraph',      name: '角色关系图',      cat: '创作工坊', icon: 'network', desc: '拖拽式人物关系网，导出高清 PNG' },

    /* ---------- 收藏与记录 ---------- */
    { id: 'songs',         name: '歌曲收藏',        cat: '收藏与记录', icon: 'music',    desc: '收录歌曲歌词，一键跳转四大平台查找' },
    { id: 'places',        name: '地点收藏',        cat: '收藏与记录', icon: 'mapPin',   desc: '收藏地点，支持图片、价格与百科直达' },
    { id: 'media',         name: '影视收藏',        cat: '收藏与记录', icon: 'film',     desc: '收藏影视作品，导出文档与图片' },
    { id: 'recipe',        name: '菜谱收藏',        cat: '收藏与记录', icon: 'chef',     desc: '记录家常菜、甜点的食材与做法' },
    { id: 'tablefill',     name: '表格填入器',      cat: '收藏与记录', icon: 'table',    desc: '五档填图表格，多图拖拽跨格移动' },
    { id: 'novelcollect',  name: '小说收藏',        cat: '收藏与记录', icon: 'bookmark', desc: '记录读过的书，进度评分与短评' },
    { id: 'videocollect',  name: '视频收藏',        cat: '收藏与记录', icon: 'video',    desc: '多平台视频链接，AI 生成简介', newDate: NEW_DATE },
    { id: 'sticker',       name: '表情包收藏',      cat: '收藏与记录', icon: 'smile',    desc: '一键复制到聊天窗口，GIF 保动图', newDate: NEW_DATE },

    /* ---------- 数理化 ---------- */
    { id: 'funcplot',      name: '函数图像绘制',    cat: '数理化', icon: 'chart', desc: '多函数叠加，标题标签拖拽缩放，导出 PNG' },
    { id: 'chemistry',     name: '化学方程式',      cat: '数理化', icon: 'flask', desc: '自动配平 + 电荷守恒 + 摩尔质量计算' },
    { id: 'periodictable', name: '元素周期表',      cat: '数理化', icon: 'grid',  desc: '118 种元素完整数据，按类别上色' },
    { id: 'physicsformula',name: '物理公式计算',    cat: '数理化', icon: 'bolt',  desc: '五大类 25+ 个公式，输入已知量求未知量' },
    { id: 'equationsolve', name: '解方程组',        cat: '数理化', icon: 'calc',  desc: '一元到三元方程组，含判别式与步骤' },
    { id: 'matrixcalc',    name: '矩阵运算',        cat: '数理化', icon: 'grid',  desc: '加减乘、转置、行列式、逆矩阵，最多 5×5' },
    { id: 'circuitcalc',   name: '电路计算',        cat: '数理化', icon: 'bolt',  desc: '串并联电阻、欧姆定律、电功率、分压分流' },
    { id: 'geneticscalc',  name: '遗传计算',        cat: '数理化', icon: 'dna',   desc: '孟德尔遗传、庞纳特方格、ABO 血型' },
    { id: 'lab',           name: '数理化实验',      cat: '数理化', icon: 'flask', desc: '30 个经典实验：现象演示 + 手册速查' },

    /* ---------- 人文与自然 ---------- */
    { id: 'chinahistory',  name: '中国历史简表',    cat: '人文与自然', icon: 'history', desc: '38 个时期 + 朝代对比 + 历史地图 + 帝王世系' },
    { id: 'worldhistory',  name: '世界历史简表',    cat: '人文与自然', icon: 'world',   desc: '15 个主要文明时期的时间轴' },
    { id: 'earthmodule',   name: '地球模块',        cat: '人文与自然', icon: 'globe',   desc: '公转四季 + 自转 + 板块构造 + 经纬度距离' },
    { id: 'chinageo',      name: '中国地理',        cat: '人文与自然', icon: 'map',     desc: '地形 + 河流湖泊 + 34 个省级行政区' },
    { id: 'poetryrecite',  name: '古诗词默写',      cat: '人文与自然', icon: 'feather', desc: '160 首经典诗词，名句填空 + 朗读 + 赏析' },
    { id: 'bodysystems',   name: '人体系统速查',    cat: '人文与自然', icon: 'body',    desc: '运动消化呼吸循环等八大系统' },
    { id: 'cellstructure', name: '细胞结构速查',    cat: '人文与自然', icon: 'cell',    desc: '动物 / 植物 / 原核三类细胞，可点击图示' },
    { id: 'visualization', name: '生活可视化',      cat: '人文与自然', icon: 'eye',     desc: '18 个动画科普：血液循环、水循环、月相等' },

    /* ---------- 计算与数据 ---------- */
    { id: 'calc',          name: '数学计算',        cat: '计算与数据', icon: 'calc',       desc: '计算器（普通 / 专家）+ 单位换算' },
    { id: 'chart',         name: '统计图生成',      cat: '计算与数据', icon: 'barChart',   desc: '柱状图 / 折线图 / 饼图一键生成' },
    { id: 'exchange',      name: '汇率换算',        cat: '计算与数据', icon: 'exchange',   desc: '常用货币互转，支持联网更新实时汇率' },
    { id: 'fuel',          name: '油耗计算',        cat: '计算与数据', icon: 'fuel',       desc: '加油台账，算百公里油耗与每公里花费' },
    { id: 'color',         name: '颜色转换',        cat: '计算与数据', icon: 'palette',    desc: 'HEX / RGB / HSL / CMYK 实时互转' },
    { id: 'datecalc',      name: '日期计算',        cat: '计算与数据', icon: 'calendar',   desc: '日期间隔、日期加减、工作日计算' },
    { id: 'loan',          name: '贷款计算器',      cat: '计算与数据', icon: 'loan',       desc: '等额本息 / 等额本金，含逐月还款明细' },
    { id: 'discount',      name: '折扣计算器',      cat: '计算与数据', icon: 'tag',        desc: '打折满减券折上折，一键算到手价' },
    { id: 'timestamp',     name: '时间戳转换',      cat: '计算与数据', icon: 'hash',       desc: '秒 / 毫秒自动识别，多时区多格式' },

    /* ---------- 时间与生活 ---------- */
    { id: 'calendar',      name: '我的日历',        cat: '时间与生活', icon: 'calendar',   desc: '在日历里安排每日计划，可导出图片' },
    { id: 'clock',         name: '时钟工具',        cat: '时间与生活', icon: 'clock',      desc: '倒计时（最长 20 小时）+ 计时器' },
    { id: 'ledger',        name: '我的记账本',      cat: '时间与生活', icon: 'wallet',     desc: '多币种记账，自动汇总本月支出' },
    { id: 'worldclock',    name: '世界时钟',        cat: '时间与生活', icon: 'worldClock', desc: '多城市时间并排，自动处理夏令时' },
    { id: 'zodiac',        name: '生肖星座',        cat: '时间与生活', icon: 'star',       desc: '输入生日查生肖与星座，附性格幸运信息' },
    { id: 'passwordgen',   name: '密码生成器',      cat: '时间与生活', icon: 'lock',       desc: '随机密码 / 口令短语 / PIN 码，本地生成不上传', newDate: NEW_DATE },

    /* ---------- AI 与开发 ---------- */
    { id: 'ai',            name: 'AI 助手',         cat: 'AI 与开发', icon: 'bot',  desc: 'DeepSeek 驱动的通用 AI 聊天', ai: true },
    { id: 'code',          name: '代码编辑器',      cat: 'AI 与开发', icon: 'code', desc: 'JavaScript 实时运行，Markdown 实时渲染' },
    { id: 'json',          name: 'JSON 格式化',     cat: 'AI 与开发', icon: 'json', desc: '格式化 / 压缩 / 转义，语法错误定位到行列' },
    { id: 'cron',          name: 'Cron 表达式',     cat: 'AI 与开发', icon: 'cron', desc: '可视化生成表达式，含中文解释与预设' },

    /* ---------- 实用工具 ---------- */
    { id: 'imagecompress', name: '图片工具',        cat: '实用工具', icon: 'image',    desc: '压缩 / 拼图长图 / 去背景 / 加水印，四合一' },
    { id: 'qrcode',        name: '二维码生成',      cat: '实用工具', icon: 'qr',       desc: '文本 / 网址 / 电话 / WiFi，可嵌 Logo' },
    { id: 'luckywheel',    name: '幸运转盘',        cat: '实用工具', icon: 'wheel',    desc: '自定义选项，支持权重，六套主题配色' },
    { id: 'coinflip',      name: '抛硬币模拟器',    cat: '实用工具', icon: 'coin',     desc: '单次 3D 翻转，批量最多 10000 次' },
    { id: 'reactiontest',  name: '反应速度测试',    cat: '实用工具', icon: 'zapTest',  desc: '6 次取平均，7 档评级与历史记录' },
    { id: 'carlist',       name: '中国车牌一览表',  cat: '实用工具', icon: 'car',      desc: '按大区浏览车牌代码，支持实时搜索' },
    { id: 'countdown',     name: '倒数日',          cat: '实用工具', icon: 'countdown',desc: '常见节日倒计时，可查 2024-2036 年' },
    { id: 'decibel',       name: '分贝仪',          cat: '实用工具', icon: 'volume',   desc: '麦克风实时测噪，本地处理不上传' },
    { id: 'randomnumber',  name: '随机数',          cat: '实用工具', icon: 'shuffle',  desc: '整数 / 小数 / 列表抽取 / 洗牌，四种模式' },
    { id: 'devicetest',    name: '实用测试',        cat: '实用工具', icon: 'keyboard', desc: '键盘 / 鼠标 / 网络 / 麦克风四项硬件测试', newDate: NEW_DATE }
  ];

  /* ============================================================
     Banner 数据
     ============================================================ */
  const BANNERS = [
    {
      tag: '新工具',
      title: '急救知识速查上线',
      desc: '12 个常见紧急场景 + CPR 节拍器 + AED 使用引导 + 紧急信息卡，全部离线可用。',
      actionLabel: '去看看',
      actionTarget: 'firstaid',
      icon: 'firstaid'
    },
    {
      tag: '公告',
      title: '创作工坊改版：小说助手一站式',
      desc: '时间线、起名器、对话生成器、随机灵感、灵感速记、小说管理，六个工具统一入口。',
      actionLabel: '打开小说助手',
      actionTarget: 'novelassistant',
      icon: 'book'
    },
    {
      tag: '小贴士',
      title: '点 ☆ 收藏常用工具',
      desc: '点击任意工具卡右上角的星标，或使用 3 次后自动加入「我的常用」，下次直接找到。',
      actionLabel: '知道了',
      actionTarget: '',
      icon: 'star'
    }
  ];

  /* ============================================================
     状态
     ============================================================ */
  let currentCat = '';
  let searchQ = '';
  let bannerIndex = 0;
  let bannerTimer = null;
  let slideCount = 0;

  const $ = id => document.getElementById(id);

  /* ============================================================
     收藏 / 使用统计
     ============================================================ */
  function getFavs(){
    try { const raw = localStorage.getItem(FAV_KEY); return raw ? JSON.parse(raw) : []; }
    catch(e){ return []; }
  }
  function saveFavs(arr){
    try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch(e){}
  }
  function toggleFav(id){
    const favs = getFavs();
    const i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1);
    else favs.unshift(id);
    saveFavs(favs);
    return i < 0;
  }
  function getUsage(){
    try { const raw = localStorage.getItem(USAGE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch(e){ return {}; }
  }
  function bumpUsage(id){
    const u = getUsage();
    u[id] = (u[id] || 0) + 1;
    try { localStorage.setItem(USAGE_KEY, JSON.stringify(u)); } catch(e){}
  }

  /* 供 main2.js 的 go() 调用：记录使用次数 */
  window.__appsCenterTrack = function(toolId){
    if (!toolId) return;
    // 忽略非工具页
    const app = APPS_DATA.find(a => a.id === toolId);
    if (!app) return;
    bumpUsage(toolId);
  };

  /* ============================================================
     常用工具计算
     ============================================================ */
  function getFavorites(){
    const favs = getFavs();
    const usage = getUsage();
    const favSet = new Set(favs);

    // 手动收藏的按收藏顺序
    const manual = favs
      .map(id => APPS_DATA.find(a => a.id === id))
      .filter(Boolean);

    // 自动统计的（使用 ≥ 3 且未在手动里）
    const auto = APPS_DATA
      .filter(a => !favSet.has(a.id) && (usage[a.id] || 0) >= 3)
      .sort((a, b) => (usage[b.id] || 0) - (usage[a.id] || 0));

    // 合并，最多 8 个
    const merged = manual.concat(auto).slice(0, 8);
    return merged;
  }

  /* ============================================================
     渲染：常用区
     ============================================================ */
  function renderFavorites(){
    const wrap = $('appsFavsWrap');
    const box  = $('appsFavs');
    const empty = $('appsFavsEmpty');
    if (!box) return;

    const favs = getFavorites();
    if (!favs.length){
      box.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    const favSet = new Set(getFavs());
    box.innerHTML = favs.map(a => `
      <button type="button" class="apps-fav-card" data-app="${a.id}">
        <span class="apps-fav-icon">${ICONS[a.icon] || ICONS.heart}</span>
        <span class="apps-fav-name">${escapeHtml(a.name)}</span>
      </button>
    `).join('');
    box.querySelectorAll('[data-app]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.app;
        if (typeof go === 'function') go(id);
      });
    });
  }

  /* ============================================================
     渲染：分类胶囊
     ============================================================ */
  function renderCats(){
    const box = $('appsCats');
    if (!box) return;
    const counts = {};
    APPS_DATA.forEach(a => { counts[a.cat] = (counts[a.cat] || 0) + 1; });

    let html = `<button type="button" class="apps-cat ${currentCat === '' ? 'active' : ''}" data-cat="">
      <span>全部</span><span class="apps-cat-count">${APPS_DATA.length}</span>
    </button>`;
    html += CATS.map(c => `
      <button type="button" class="apps-cat ${currentCat === c.id ? 'active' : ''}" data-cat="${escapeHtml(c.id)}">
        <span>${escapeHtml(c.name)}</span><span class="apps-cat-count">${counts[c.id] || 0}</span>
      </button>
    `).join('');
    box.innerHTML = html;

    box.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCat = btn.dataset.cat;
        renderCats();
        renderAll();
      });
    });
  }

  /* ============================================================
     渲染：全部工具
     ============================================================ */
  function renderAll(){
    const wrap = $('appsAllWrap');
    if (!wrap) return;

    const q = searchQ.toLowerCase().trim();
    let list = APPS_DATA.slice();

    // 搜索
    if (q){
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.cat.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }

    // 分类筛选
    if (currentCat){
      list = list.filter(a => a.cat === currentCat);
    }

    // 空结果
    const noRes = $('appsNoResult');
    if (!list.length){
      wrap.innerHTML = '';
      if (noRes) noRes.style.display = '';
      return;
    }
    if (noRes) noRes.style.display = 'none';

    // 搜索模式：平铺，不分组
    if (q){
      wrap.innerHTML =
        `<p class="apps-result-hint">找到 <b>${list.length}</b> 个工具</p>` +
        `<div class="apps-group-grid">${list.map(renderCard).join('')}</div>`;
      bindCardEvents();
      return;
    }

    // 分类模式：按分类分组（或只显示单分类）
    if (currentCat){
      const cat = CATS.find(c => c.id === currentCat);
      wrap.innerHTML =
        `<div class="apps-group">
          <div class="apps-group-head">
            <div class="apps-group-head-left"><span>${escapeHtml(cat.name)}</span></div>
            <span class="apps-group-count">${list.length} 个工具</span>
          </div>
          <div class="apps-group-grid">${list.map(renderCard).join('')}</div>
        </div>`;
    } else {
      wrap.innerHTML = CATS.map(cat => {
        const items = list.filter(a => a.cat === cat.id);
        if (!items.length) return '';
        return `<div class="apps-group">
          <div class="apps-group-head">
            <div class="apps-group-head-left"><span>${escapeHtml(cat.name)}</span></div>
            <span class="apps-group-count">${items.length} 个工具</span>
          </div>
          <div class="apps-group-grid">${items.map(renderCard).join('')}</div>
        </div>`;
      }).join('');
    }
    bindCardEvents();
  }

  function renderCard(a){
    const favSet = new Set(getFavs());
    const isFav = favSet.has(a.id);
    const tags = [];
    if (isNewApp(a)) tags.push('<span class="apps-card-tag new">新</span>');
    if (a.ai) tags.push('<span class="apps-card-tag ai">AI</span>');

    return `<div class="apps-card" data-app="${a.id}">
      <button type="button" class="apps-card-fav ${isFav ? 'on' : ''}" data-fav="${a.id}" aria-label="收藏">
        ${isFav ? ICONS.star.replace("fill=\"none\"", "fill=\"currentColor\"") : ICONS.star}
      </button>
      <span class="apps-card-icon">${ICONS[a.icon] || ICONS.heart}</span>
      <h3 class="apps-card-name">${escapeHtml(a.name)}</h3>
      <p class="apps-card-desc">${escapeHtml(a.desc)}</p>
      ${tags.length ? `<div class="apps-card-tags">${tags.join('')}</div>` : ''}
    </div>`;
  }

  function isNewApp(a){
    return false; // V5.0：彻底移除所有“新”标签
  }
  function bindCardEvents(){
    const wrap = $('appsAllWrap');
    // 卡片点击 → 跳转
    wrap.querySelectorAll('.apps-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('[data-fav]')) return;
        const id = card.dataset.app;
        if (typeof go === 'function') go(id);
      });
    });
    // 收藏按钮
    wrap.querySelectorAll('[data-fav]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.fav;
        const nowFav = toggleFav(id);
        btn.classList.toggle('on', nowFav);
        btn.innerHTML = nowFav
          ? ICONS.star.replace("fill=\"none\"", "fill=\"currentColor\"")
          : ICONS.star;
        if (typeof showToast === 'function') showToast(nowFav ? '已加入常用' : '已取消常用');
        renderFavorites();
      });
    });
  }

  /* ============================================================
     渲染：Banner
     ============================================================ */
  function renderBanner(){
    const wrap = $('appsBannerWrap');
    const track = $('appsBannerTrack');
    const dots = $('appsBannerDots');
    if (!wrap || !track || !dots) return;

    // 是否被永久关闭
    let closed = false;
    try {
      const raw = localStorage.getItem(BANNER_KEY);
      if (raw){ const d = JSON.parse(raw); closed = !!d.closed; }
    } catch(e){}
    if (closed){
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';

    slideCount = BANNERS.length;
    track.innerHTML = BANNERS.map(b => `
      <div class="apps-banner-slide">
        <span class="apps-banner-icon">${ICONS[b.icon] || ICONS.star}</span>
        <div class="apps-banner-body">
          <span class="apps-banner-tag">${escapeHtml(b.tag)}</span>
          <h4 class="apps-banner-title">${escapeHtml(b.title)}</h4>
          <p class="apps-banner-desc">${escapeHtml(b.desc)}</p>
        </div>
        ${b.actionLabel ? `<button type="button" class="apps-banner-action" data-banner-action="${b.actionTarget || ''}">${escapeHtml(b.actionLabel)}</button>` : ''}
      </div>
    `).join('');

    dots.innerHTML = BANNERS.map((_, i) =>
      `<button type="button" class="apps-banner-dot ${i === 0 ? 'active' : ''}" data-banner-dot="${i}" aria-label="切换到第 ${i+1} 张"></button>`
    ).join('');

    // 点击跳转
    track.querySelectorAll('[data-banner-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.bannerAction;
        if (t && typeof go === 'function') go(t);
      });
    });
    // 点圆点切换
    dots.querySelectorAll('[data-banner-dot]').forEach(btn => {
      btn.addEventListener('click', () => {
        goBanner(parseInt(btn.dataset.bannerDot, 10));
        restartBannerTimer();
      });
    });

    bannerIndex = 0;
    updateBannerTransform();
    restartBannerTimer();
  }

  function goBanner(i){
    bannerIndex = ((i % slideCount) + slideCount) % slideCount;
    updateBannerTransform();
  }
  function updateBannerTransform(){
    const track = $('appsBannerTrack');
    const dots = $('appsBannerDots');
    if (!track) return;
    track.style.transform = 'translateX(-' + (bannerIndex * 100) + '%)';
    if (dots){
      dots.querySelectorAll('.apps-banner-dot').forEach((d, i) => d.classList.toggle('active', i === bannerIndex));
    }
  }
  function restartBannerTimer(){
    if (bannerTimer) clearInterval(bannerTimer);
    if (slideCount <= 1) return;
    bannerTimer = setInterval(() => goBanner(bannerIndex + 1), 6000);
  }

  /* ============================================================
     搜索
     ============================================================ */
  function initSearch(){
    const input = $('appsSearch');
    const clear = $('appsSearchClear');
    if (!input) return;

    function updateClear(){
      if (clear) clear.hidden = input.value.length === 0;
    }
    input.addEventListener('input', () => {
      searchQ = input.value;
      updateClear();
      toggleSearchMode();
      renderAll();
    });
    if (clear){
      clear.addEventListener('click', () => {
        input.value = '';
        searchQ = '';
        updateClear();
        toggleSearchMode();
        renderAll();
        input.focus();
      });
    }
    updateClear();
  }

  function toggleSearchMode(){
    const isSearching = !!searchQ.trim();
    const bannerWrap = $('appsBannerWrap');
    const catsWrap = $('appsCatsWrap');
    const favsWrap = $('appsFavsWrap');
    const hint = document.querySelector('.page-desc');
    [bannerWrap, catsWrap, favsWrap].forEach(el => {
      if (el) el.style.display = isSearching ? 'none' : '';
    });
    if (hint) hint.style.display = isSearching ? 'none' : '';
    // 恢复 Banner 时判断是否被关闭
    if (!isSearching && bannerWrap){
      // renderBanner 会自己判断是否隐藏
    }
  }

  /* ============================================================
     工具函数
     ============================================================ */
  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  /* ============================================================
     初始化
     ============================================================ */
  function initAll(){
    // 清空搜索态
    searchQ = '';
    currentCat = '';
    const input = $('appsSearch');
    if (input) input.value = '';
    const clear = $('appsSearchClear');
    if (clear) clear.hidden = true;
    toggleSearchMode();

    renderBanner();
    renderCats();
    renderFavorites();
    renderAll();
  }

  let inited = false;
  window.__appsCenterInit = function(){
    if (!inited){
      inited = true;
      initSearch();
      // Banner 关闭按钮
      const closeBtn = $('appsBannerClose');
      if (closeBtn){
        closeBtn.addEventListener('click', () => {
          const wrap = $('appsBannerWrap');
          if (wrap) wrap.style.display = 'none';
          try { localStorage.setItem(BANNER_KEY, JSON.stringify({ closed: true })); } catch(e){}
          if (bannerTimer) clearInterval(bannerTimer);
        });
      }
    }
    initAll();
  };

  if (page.classList.contains('active')) window.__appsCenterInit();
  /* 暴露给 main2.js 的侧边栏使用 */
  window.__appsIcons = ICONS;
  window.__appsData  = APPS_DATA;
  window.__appsCats  = CATS;

  if (page.classList.contains('active')) window.__appsCenterInit();

  console.log('[应用中心] 已加载');
})();