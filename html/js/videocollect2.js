/* ============================================================
   视频收藏 · V4.1 活力版
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-videocollect');
  if (!page) return;

  const VIDEOS_KEY = 'suidou-videos-v1';

  const PLATFORMS = {
    bilibili:    { name: 'B站',     base: 'https://search.bilibili.com/all?keyword=' },
    douyin:      { name: '抖音',    base: 'https://www.douyin.com/search/' },
    kuaishou:    { name: '快手',    base: 'https://www.kuaishou.com/search/video?searchKey=' },
    xiaohongshu: { name: '小红书',  base: 'https://www.xiaohongshu.com/search_result?keyword=' },
    weibo:       { name: '微博',    base: 'https://s.weibo.com/video?q=' },
    youtube:     { name: 'YouTube', base: 'https://www.youtube.com/results?search_query=' },
    qq:          { name: '腾讯视频',base: 'https://v.qq.com/x/search/?q=' },
    iqiyi:       { name: '爱奇艺',  base: 'https://so.iqiyi.com/so/q_' },
    youku:       { name: '优酷',    base: 'https://so.youku.com/search_video/q_' },
    ixigua:      { name: '西瓜视频',base: 'https://www.ixigua.com/search/' }
  };

  const LINK_FIELD_MAP = {
    bilibili:    'vcLinkBilibili',
    douyin:      'vcLinkDouyin',
    kuaishou:    'vcLinkKuaishou',
    xiaohongshu: 'vcLinkXiaohongshu',
    weibo:       'vcLinkWeibo',
    youtube:     'vcLinkYoutube',
    qq:          'vcLinkQq',
    iqiyi:       'vcLinkIqiyi',
    youku:       'vcLinkYouku',
    ixigua:      'vcLinkIxigua'
  };

  const $ = id => document.getElementById(id);

  let videos = [];
  let pendingCover = '';
  let coverProcessing = false;
  let editingId = null;

  let searchQ = '';
  let filterPlatform = '';
  let filterType = '';
  let filterStatus = '';
  let sortMode = 'recent';

  /* ---------- 存储 ---------- */
  function saveVideos(){
    try {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
      if (typeof updateStorageUsage === 'function') updateStorageUsage();
      return true;
    } catch(e){ return false; }
  }
  function loadVideos(){
    try {
      const raw = localStorage.getItem(VIDEOS_KEY);
      if (raw) videos = JSON.parse(raw) || [];
      else videos = [];
    } catch(e){ videos = []; }
  }

  /* ---------- 搜索 URL ---------- */
  function searchUrl(key, title, author){
    const p = PLATFORMS[key];
    if (!p) return '';
    const kw = encodeURIComponent(((author || '') + ' ' + (title || '')).trim());
    if (key === 'douyin')      return p.base + kw;
    if (key === 'ixigua')      return p.base + kw + '/';
    if (key === 'iqiyi' || key === 'youku') return p.base + kw;
    return p.base + kw;
  }

  /* ---------- 表单 ---------- */
  function resetForm(){
    editingId = null;
    ['vcTitle','vcAuthor','vcPublishDate','vcTypeCustom','vcDuration','vcSeries','vcTags','vcMainLink','vcDesc']
      .forEach(id => { const el = $(id); if (el) el.value = ''; });
    Object.values(LINK_FIELD_MAP).forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('vcPlatform').value = 'bilibili';
    $('vcType').value = '知识科普';
    $('vcStatus').value = '在看';
    $('vcRating').value = '0';
    $('vcWatchLater').checked = false;
    $('vcCover').value = '';
    $('vcCoverPreview').textContent = '未选择';
    pendingCover = '';
    $('vcFormHead').textContent = '添加视频';
    $('vcAdd').textContent = '＋ 添加视频';
    $('vcCancelEdit').style.display = 'none';
  }

  function fillForm(v){
    editingId = v.id;
    $('vcTitle').value        = v.title || '';
    $('vcAuthor').value       = v.author || '';
    $('vcPlatform').value     = v.platform || 'bilibili';
    $('vcPublishDate').value  = v.publish_date || '';
    $('vcType').value         = v.video_type || '知识科普';
    $('vcTypeCustom').value   = v.video_type_custom || '';
    $('vcDuration').value     = v.duration || '';
    $('vcStatus').value       = v.status || '在看';
    $('vcRating').value       = String(v.rating || 0);
    $('vcSeries').value       = v.series || '';
    $('vcTags').value         = v.tags || '';
    $('vcMainLink').value     = v.main_link || '';
    $('vcDesc').value         = v.desc || '';
    $('vcWatchLater').checked = !!v.watch_later;
    const links = v.links || {};
    Object.keys(LINK_FIELD_MAP).forEach(k => {
      const el = $(LINK_FIELD_MAP[k]);
      if (el) el.value = links[k] || '';
    });
    if (v.cover){
      pendingCover = v.cover;
      $('vcCoverPreview').innerHTML = '<img src="' + v.cover + '" alt="">';
    } else {
      pendingCover = '';
      $('vcCoverPreview').textContent = '未选择';
    }
    $('vcFormHead').textContent = '编辑视频';
    $('vcAdd').textContent = '保存修改';
    $('vcCancelEdit').style.display = '';
    page.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('vcCover').addEventListener('change', e => {
    const file = e.target.files[0];
    const preview = $('vcCoverPreview');
    if (!file){ pendingCover = ''; preview.textContent = '未选择'; return; }
    if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }
    coverProcessing = true;
    preview.textContent = '处理中…';
    compressImage(file, 800, 0.75, dataUrl => {
      pendingCover = dataUrl;
      preview.innerHTML = '<img src="' + dataUrl + '" alt="">';
      coverProcessing = false;
    });
  });

  $('vcReset').addEventListener('click', resetForm);
  $('vcCancelEdit').addEventListener('click', resetForm);

  /* ---------- 添加 / 保存 ---------- */
  $('vcAdd').addEventListener('click', async () => {
    if (coverProcessing){ alert('封面图片正在处理，请稍候…'); return; }
    const title = $('vcTitle').value.trim();
    const author = $('vcAuthor').value.trim();
    if (!title){ alert('请填写视频标题～'); $('vcTitle').focus(); return; }
    if (!author){ alert('请填写博主 / UP 主～'); $('vcAuthor').focus(); return; }

    const platform = $('vcPlatform').value;
    const customType = $('vcTypeCustom').value.trim();
    const links = {};
    Object.keys(LINK_FIELD_MAP).forEach(k => {
      const el = $(LINK_FIELD_MAP[k]);
      if (el) links[k] = el.value.trim();
    });

    const ratingVal = parseInt($('vcRating').value, 10) || 0;

    const data = {
      title,
      author,
      platform,
      publish_date: $('vcPublishDate').value.trim(),
      video_type: customType || $('vcType').value,
      video_type_custom: customType,
      duration: $('vcDuration').value.trim(),
      status: $('vcStatus').value,
      rating: ratingVal,
      series: $('vcSeries').value.trim(),
      tags: $('vcTags').value.trim(),
      main_link: $('vcMainLink').value.trim(),
      desc_text: $('vcDesc').value.trim(),
      cover: pendingCover || '',
      watch_later: $('vcWatchLater').checked,
      links
    };

    try {
      if (editingId){
        if (appMode === 'cloud' && currentUser){
          await cloudUpdate('videos', editingId, data);
          const i = videos.findIndex(x => String(x.id) === String(editingId));
          if (i >= 0){
            data.desc = data.desc_text;
            videos[i] = { ...videos[i], ...data };
          }
        } else {
          const i = videos.findIndex(x => String(x.id) === String(editingId));
          if (i < 0) throw new Error('记录不存在');
          data.desc = data.desc_text;
          videos[i] = { ...videos[i], ...data };
          if (!saveVideos()) throw new Error('本地保存失败');
        }
        resetForm();
        renderList();
        showToast('修改已保存');
      } else {
        if (appMode === 'cloud' && currentUser){
          const row = await cloudInsert('videos', data);
          row.desc = row.desc_text;
          videos.push(row);
        } else {
          const local = { id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() };
          local.desc = local.desc_text;
          videos.push(local);
          if (!saveVideos()){ videos.pop(); throw new Error('本地保存失败'); }
        }
        resetForm();
        renderList();
        showToast('已添加「' + title + '」');
      }
    } catch(err){ alert('保存失败：' + (err.message || err)); }
  });

  /* ---------- 清空 ---------- */
  $('vcClearAll').addEventListener('click', async () => {
    if (videos.length === 0) return;
    if (!confirm('确定清空全部视频收藏吗？此操作不可恢复。')) return;
    try {
      if (appMode === 'cloud' && currentUser){
        await sb.from('videos').delete().eq('user_id', currentUser.id);
      }
      videos = [];
      try { localStorage.removeItem(VIDEOS_KEY); } catch(e){}
      renderList();
      showToast('视频收藏已清空');
    } catch(err){ alert('清空失败：' + (err.message || err)); }
  });

  /* ---------- 列表渲染 ---------- */
  function getFiltered(){
    let arr = videos.slice();
    const q = searchQ.toLowerCase();
    if (q){
      arr = arr.filter(v =>
        (v.title || '').toLowerCase().includes(q) ||
        (v.author || '').toLowerCase().includes(q) ||
        (v.tags || '').toLowerCase().includes(q) ||
        (v.desc || v.desc_text || '').toLowerCase().includes(q)
      );
    }
    if (filterPlatform) arr = arr.filter(v => v.platform === filterPlatform);
    if (filterType)     arr = arr.filter(v => v.video_type === filterType);
    if (filterStatus)   arr = arr.filter(v => v.status === filterStatus);

    if (sortMode === 'recent'){
      arr.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    } else if (sortMode === 'publish'){
      arr.sort((a, b) => String(b.publish_date || '').localeCompare(String(a.publish_date || '')));
    } else if (sortMode === 'rating'){
      arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortMode === 'title'){
      try { arr.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans-CN')); }
      catch(e){ arr.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''))); }
    }
    return arr;
  }

  function starsHtml(r){
    r = parseInt(r, 10) || 0;
    if (!r) return '';
    let s = '';
    for (let i = 1; i <= 5; i++) s += (i <= r ? '<span>★</span>' : '<span class="off">★</span>');
    return '<span class="vc-stars">' + s + '</span>';
  }

  function statusClass(s){
    if (s === '想看')  return 'vc-status-want';
    if (s === '已看完') return 'vc-status-done';
    return 'vc-status-reading';
  }

  function platformName(key){
    return (PLATFORMS[key] && PLATFORMS[key].name) || '其他';
  }

  function renderList(){
    const list = $('vcList');
    const empty = $('vcEmpty');
    if (!list) return;

    /* 统计 */
    const total = videos.length;
    const done = videos.filter(v => v.status === '已看完').length;
    const reading = videos.filter(v => v.status === '在看').length;
    const rated = videos.filter(v => (v.rating || 0) > 0);
    const avg = rated.length ? (rated.reduce((a,v) => a + (v.rating || 0), 0) / rated.length) : 0;
    $('vcStatTotal').textContent = total;
    $('vcStatDone').textContent = done;
    $('vcStatReading').textContent = reading;
    $('vcStatAvg').textContent = rated.length ? avg.toFixed(1) : '—';

    const arr = getFiltered();
    $('vcCount').textContent = arr.length;

    if (arr.length === 0){
      list.innerHTML = '';
      empty.style.display = '';
      empty.textContent = (total === 0)
        ? '还没有视频收藏，先在上方添加一条吧～'
        : '没有匹配的视频，换个筛选条件试试～';
      return;
    }
    empty.style.display = 'none';

    list.innerHTML = arr.map(v => {
      const linkMap = v.links || {};
      const mainLink = v.main_link || '';
      let linksHtml = '';
      if (mainLink){
        linksHtml += '<a class="src-btn" data-p="main" href="' + esc(mainLink) + '" target="_blank" rel="noopener">主链接</a>';
      }
      Object.keys(PLATFORMS).forEach(k => {
        const custom = linkMap[k] || '';
        if (custom){
          linksHtml += '<a class="src-btn" href="' + esc(custom) + '" target="_blank" rel="noopener">' + PLATFORMS[k].name + '·直链</a>';
        } else if (!mainLink){
          const url = searchUrl(k, v.title, v.author);
          linksHtml += '<a class="src-btn" href="' + esc(url) + '" target="_blank" rel="noopener">' + PLATFORMS[k].name + '</a>';
        }
      });
      const tagsArr = (v.tags || '').split(/[,，\s]+/).filter(Boolean);
      const coverHtml = v.cover
        ? '<img src="' + v.cover + '" alt="">'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 8l6 4-6 4V8z"/></svg>';
      const watchLater = v.watch_later ? '<span class="vc-card-watchlater">稍后再看</span>' : '';
      const dur = v.duration ? '<span class="vc-card-duration">' + esc(v.duration) + '</span>' : '';
      const desc = v.desc || v.desc_text || '';

      return '<div class="vc-card" data-vcid="' + esc(String(v.id)) + '">' +
        '<div class="vc-card-cover">' + coverHtml +
          '<span class="vc-card-platform">' + esc(platformName(v.platform)) + '</span>' +
          dur + watchLater +
        '</div>' +
        '<div class="vc-card-body">' +
          '<button class="del-btn" data-vcdel="' + esc(String(v.id)) + '" title="删除">✕</button>' +
          '<h3 class="vc-card-title">' + esc(v.title || '') + '</h3>' +
          '<div class="vc-card-author">@' + esc(v.author || '未知博主') + '</div>' +
          '<div class="vc-card-meta">' +
            '<span class="tag ' + statusClass(v.status) + '" style="border:none;">' + esc(v.status || '') + '</span>' +
            (v.video_type ? '<span>' + esc(v.video_type) + '</span>' : '') +
            (v.publish_date ? '<span>' + esc(v.publish_date) + '</span>' : '') +
            (v.series ? '<span>' + esc(v.series) + '</span>' : '') +
          '</div>' +
          (starsHtml(v.rating) ? '<div>' + starsHtml(v.rating) + '</div>' : '') +
          (tagsArr.length ? '<div class="vc-card-tags">' + tagsArr.map(t => '<span class="tag gray">#' + esc(t) + '</span>').join('') + '</div>' : '') +
          (desc ? '<p class="vc-card-desc">' + esc(desc) + '</p>' : '') +
          '<div class="vc-card-foot">' +
            '<div class="vc-card-links">' + linksHtml + '</div>' +
            '<div class="vc-card-actions">' +
              '<button class="mini-btn" data-vcedit="' + esc(String(v.id)) + '">编辑</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    list.querySelectorAll('[data-vcdel]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const id = btn.dataset.vcdel;
        const t = videos.find(x => String(x.id) === String(id));
        if (!t || !confirm('确定删除「' + t.title + '」吗？')) return;
        try {
          if (appMode === 'cloud' && currentUser){
            await cloudDelete('videos', id);
          }
          videos = videos.filter(x => String(x.id) !== String(id));
          if (appMode === 'local') saveVideos();
          if (editingId && String(editingId) === String(id)) resetForm();
          renderList();
          showToast('已删除');
        } catch(err){ alert('删除失败：' + (err.message || err)); }
      });
    });

    list.querySelectorAll('[data-vcedit]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.vcedit;
        const v = videos.find(x => String(x.id) === String(id));
        if (v) fillForm(v);
      });
    });
  }

  /* ---------- 筛选 / 搜索 ---------- */
  $('vcSearch').addEventListener('input', e => { searchQ = e.target.value.trim(); renderList(); });
  $('vcFilterPlatform').addEventListener('change', e => { filterPlatform = e.target.value; renderList(); });
  $('vcFilterType').addEventListener('change', e => { filterType = e.target.value; renderList(); });
  $('vcFilterStatus').addEventListener('change', e => { filterStatus = e.target.value; renderList(); });
  $('vcSort').addEventListener('change', e => { sortMode = e.target.value; renderList(); });

  /* ---------- 导出 JSON ---------- */
  $('vcExportJson').addEventListener('click', () => {
    if (!videos.length){ showToast('还没有视频收藏'); return; }
    const blob = new Blob([JSON.stringify(videos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的视频收藏_' + timeStamp(new Date()) + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    showToast('已导出 JSON');
  });

  /* ---------- 导出 CSV ---------- */
  $('vcExportCsv').addEventListener('click', () => {
    if (!videos.length){ showToast('还没有视频收藏'); return; }
    const header = '标题,博主,平台,发布日期,类型,时长,状态,评分,标签,合集,稍后再看,主链接,简介\n';
    const rows = videos.map(v => {
      const f = s => String(s == null ? '' : s).replace(/,/g, '，').replace(/\n/g, ' ').replace(/\r/g, ' ');
      return [
        f(v.title), f(v.author), f(platformName(v.platform)),
        f(v.publish_date), f(v.video_type), f(v.duration),
        f(v.status), v.rating || 0, f(v.tags), f(v.series),
        v.watch_later ? '是' : '否',
        f(v.main_link), f(v.desc || v.desc_text)
      ].join(',');
    }).join('\n');
    const csv = '\ufeff' + header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的视频收藏_' + timeStamp(new Date()) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    showToast('已导出 CSV');
  });

  /* ---------- 导出 Word ---------- */
  $('vcExportDoc').addEventListener('click', async () => {
    if (!videos.length){ showToast('还没有视频收藏'); return; }
    if (typeof window.docx === 'undefined'){ showToast('docx 库未加载，请刷新页面重试'); return; }
    const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;
    const d = new Date();

    const children = [
      new Paragraph({
        children: [new TextRun({ text: '我的视频收藏', bold: true, size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({
          text: '共收录 ' + videos.length + ' 条 · 导出时间：' +
                d.getFullYear() + ' 年 ' + (d.getMonth()+1) + ' 月 ' + d.getDate() + ' 日',
          size: 20, color: '6f7680'
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    ];

    const sorted = videos.slice().sort((a, b) =>
      String(b.created_at || '').localeCompare(String(a.created_at || ''))
    );

    sorted.forEach((v, i) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: (i + 1) + '. ' + (v.title || ''), bold: true, size: 28 })],
        spacing: { before: 300, after: 100 }
      }));
      const meta = [];
      if (v.author)       meta.push('博主：' + v.author);
      if (v.platform)     meta.push('平台：' + platformName(v.platform));
      if (v.video_type)   meta.push('类型：' + v.video_type);
      if (v.publish_date) meta.push('发布：' + v.publish_date);
      if (v.duration)     meta.push('时长：' + v.duration);
      if (v.status)       meta.push('状态：' + v.status);
      if (v.rating)       meta.push('评分：' + '★'.repeat(v.rating));
      if (v.series)       meta.push('系列：' + v.series);
      if (v.tags)         meta.push('标签：' + v.tags);
      if (v.watch_later)  meta.push('稍后再看');
      if (meta.length){
        children.push(new Paragraph({
          children: [new TextRun({ text: meta.join('　|　'), size: 20, color: '565d65' })],
          spacing: { after: 120 }
        }));
      }
      const linkLine = v.main_link || '';
      if (linkLine){
        children.push(new Paragraph({
          children: [new TextRun({ text: '链接：' + linkLine, size: 20, color: '565d65' })],
          spacing: { after: 120 }
        }));
      }
      const desc = v.desc || v.desc_text || '';
      if (desc){
        children.push(new Paragraph({
          children: [new TextRun({ text: '简介：' + desc, size: 22 })],
          spacing: { after: 120 }
        }));
      }
    });

    try {
      const doc = new Document({ sections: [{ properties: {}, children }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '我的视频收藏_' + timeStamp(d) + '.docx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast('已导出 Word 文档');
    } catch(err){
      alert('导出失败：' + (err.message || err));
    }
  });

  /* ---------- 导出 PNG ---------- */
  $('vcExportImg').addEventListener('click', () => {
    if (!videos.length){ showToast('还没有视频收藏'); return; }
    const W = 920, PAD = 44, CARD_PAD = 20, GAP = 14;
    const innerW = W - PAD * 2, textW = innerW - CARD_PAD * 2;
    const dpr = 2;
    const FONT = '"PingFang SC","Microsoft YaHei",sans-serif';
    const mc = document.createElement('canvas').getContext('2d');

    const sorted = videos.slice().sort((a, b) =>
      String(b.created_at || '').localeCompare(String(a.created_at || ''))
    );

    const blocks = sorted.map(v => {
      const rows = [];
      rows.push({ kind:'title', text: v.title || '', h: 30 });
      const metaParts = [];
      if (v.author)   metaParts.push('@' + v.author);
      if (v.platform) metaParts.push(platformName(v.platform));
      if (v.video_type) metaParts.push(v.video_type);
      if (v.publish_date) metaParts.push(v.publish_date);
      if (v.duration) metaParts.push(v.duration);
      if (v.status)   metaParts.push(v.status);
      if (v.rating)   metaParts.push('★'.repeat(v.rating));
      if (metaParts.length) rows.push({ kind:'meta', text: metaParts.join(' · '), h: 24 });
      if (v.tags) rows.push({ kind:'meta', text: '标签：' + v.tags, h: 22 });
      const desc = v.desc || v.desc_text || '';
      if (desc){
        mc.font = '14px ' + FONT;
        wrapText(mc, '简介：' + desc, textW).forEach(l => rows.push({ kind:'body', text: l, h: 22 }));
      }
      if (v.main_link) rows.push({ kind:'body', text: '链接：' + v.main_link, h: 22 });
      return rows;
    });

    const HEADER = 118, FOOTER = 58;
    let contentH = 0;
    blocks.forEach(rows => { contentH += CARD_PAD * 2 + rows.reduce((a, r) => a + r.h, 0) + GAP; });
    const H = PAD + HEADER + contentH + FOOTER + PAD;

    const canvas = document.createElement('canvas');
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'top'; ctx.textAlign = 'left';

    ctx.fillStyle = '#1c1f23'; ctx.font = 'bold 30px ' + FONT;
    ctx.fillText('我的视频收藏', PAD, PAD + 4);
    ctx.fillStyle = '#9ca3af'; ctx.font = '14.5px ' + FONT;
    ctx.fillText('共 ' + videos.length + ' 条记录　·　岁窦工具箱 · 视频收藏', PAD, PAD + 52);
    ctx.strokeStyle = '#e3e6ea'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, PAD + 92); ctx.lineTo(W - PAD, PAD + 92); ctx.stroke();

    let y = PAD + HEADER;
    blocks.forEach(rows => {
      const cardH = CARD_PAD * 2 + rows.reduce((a, r) => a + r.h, 0);
      ctx.fillStyle = '#fafbfc'; ctx.strokeStyle = '#e3e6ea'; ctx.lineWidth = 1;
      roundRect(ctx, PAD + 0.5, y + 0.5, innerW - 1, cardH - 1, 12); ctx.fill(); ctx.stroke();
      let ry = y + CARD_PAD;
      rows.forEach(r => {
        if (r.kind === 'title'){
          ctx.font = 'bold 17px ' + FONT; ctx.fillStyle = '#1c1f23';
          ctx.fillText(fitText(ctx, r.text, textW), PAD + CARD_PAD, ry + 6);
        } else if (r.kind === 'meta'){
          ctx.font = '13px ' + FONT; ctx.fillStyle = '#565d65';
          ctx.fillText(fitText(ctx, r.text, textW), PAD + CARD_PAD, ry + 4);
        } else {
          ctx.font = '14px ' + FONT; ctx.fillStyle = '#4b5563';
          ctx.fillText(fitText(ctx, r.text, textW), PAD + CARD_PAD, ry + 2);
        }
        ry += r.h;
      });
      y += cardH + GAP;
    });

    const dd = new Date();
    ctx.textAlign = 'center'; ctx.fillStyle = '#9ca3af'; ctx.font = '12.5px ' + FONT;
    ctx.fillText('导出时间：' + dd.getFullYear() + '-' + pad2(dd.getMonth()+1) + '-' + pad2(dd.getDate()) +
      ' ' + pad2(dd.getHours()) + ':' + pad2(dd.getMinutes()) +
      '　|　岁窦工具箱 · 视频收藏', W / 2, y + 22);

    const fileName = '我的视频收藏_' + timeStamp(dd) + '.png';
    if (canvas.toBlob){
      canvas.toBlob(blob => {
        if (!blob){ showToast('导出失败，请重试'); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        showToast('已导出视频收藏图片');
      }, 'image/png');
    } else {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png'); a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showToast('已导出视频收藏图片');
    }
  });

  /* ---------- AI 生成简介 ---------- */
  $('vcAiBtn').addEventListener('click', () => {
    const title = $('vcTitle').value.trim();
    if (!title){ alert('请先填写视频标题'); return; }
    const author = $('vcAuthor').value.trim();
    const platform = platformName($('vcPlatform').value);
    const type = $('vcTypeCustom').value.trim() || $('vcType').value;
    const date = $('vcPublishDate').value.trim();
    const series = $('vcSeries').value.trim();

    const info = [
      '标题：' + title,
      author ? '博主：' + author : '',
      '平台：' + platform,
      '类型：' + type,
      date ? '发布日期：' + date : '',
      series ? '合集/系列：' + series : ''
    ].filter(Boolean).join('\n');

    openAiPop('AI 生成视频简介',
      '请根据以下视频信息，写一段 100 字左右的简介，突出内容亮点与看点，语言简洁：\n' + info,
      (text) => { $('vcDesc').value = text; });
  });

  /* ---------- 初始化（由 main2.js 的 go() 调用） ---------- */
  window.__videocollectInit = function(){
    loadVideos();
    renderList();
  };

  /* 首屏如果本来就是视频收藏页，也要初始化 */
  if (page.classList.contains('active')){
    window.__videocollectInit();
  }

  console.log('[视频收藏] 已加载');
})();