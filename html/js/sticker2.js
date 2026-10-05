/* ============================================================
   表情包收藏 · V4.1 活力版
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-sticker');
  if (!page) return;

  const STICKERS_KEY = 'suidou-stickers-v1';
  const MAX_STATIC_SIZE = 480;       // 静态图最长边压缩到多少
  const MAX_GIF_BYTES   = 2 * 1024 * 1024; // GIF 超过 2MB 拒绝
  const CLIPBOARD_SUPPORTED =
    typeof ClipboardItem !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.write === 'function';

  const CATEGORIES = ['搞笑','可爱','日常','怼人','赞同','无奈','惊讶','猫狗','工作','其他'];

  const $ = id => document.getElementById(id);

  let stickers = [];
  let pending = [];      // 待添加：{ dataUrl, mime, name }
  let pendingBusy = false;

  let searchQ = '';
  let filterCategory = '';
  let filterFav = '';
  let sortMode = 'recent';

  let previewId = null;

  /* ---------- 存储 ---------- */
  function saveStickers(){
    try {
      localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
      if (typeof updateStorageUsage === 'function') updateStorageUsage();
      return true;
    } catch(e){
      console.warn('[表情包] 本地保存失败：', e);
      return false;
    }
  }
  function loadStickers(){
    try {
      const raw = localStorage.getItem(STICKERS_KEY);
      stickers = raw ? (JSON.parse(raw) || []) : [];
    } catch(e){ stickers = []; }
  }

  /* ---------- 图片处理 ---------- */
  /**
   * 静态图：压缩到 maxSize 以内，保留透明通道（用 PNG 输出）
   * GIF：不压缩，直接读取成 dataURL
   */
  function processFile(file, cb){
    const isGif = file.type === 'image/gif';

    if (isGif){
      if (file.size > MAX_GIF_BYTES){
        cb({ error: 'GIF 超过 2MB，建议先压缩再上传' });
        return;
      }
      const r = new FileReader();
      r.onload = e => cb({ dataUrl: e.target.result, mime: 'image/gif', animated: true });
      r.onerror = () => cb({ error: '读取失败' });
      r.readAsDataURL(file);
      return;
    }

    if (!file.type.startsWith('image/')){
      cb({ error: '不是图片文件' });
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h && w > MAX_STATIC_SIZE){ h = Math.round(h * MAX_STATIC_SIZE / w); w = MAX_STATIC_SIZE; }
        else if (h > MAX_STATIC_SIZE){ w = Math.round(w * MAX_STATIC_SIZE / h); h = MAX_STATIC_SIZE; }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);   // 保持透明，不填白底
        ctx.drawImage(img, 0, 0, w, h);

        // 输出格式：优先保透明用 PNG；原图是 JPG 就用 JPG（体积小）
        const srcType = file.type;
        const outMime = (srcType === 'image/jpeg') ? 'image/jpeg' : 'image/png';
        const quality = (outMime === 'image/jpeg') ? 0.85 : 1;
        const dataUrl = canvas.toDataURL(outMime, quality);
        cb({ dataUrl, mime: outMime, width: w, height: h });
      };
      img.onerror = () => cb({ error: '图片解析失败' });
      img.src = e.target.result;
    };
    reader.onerror = () => cb({ error: '读取失败' });
    reader.readAsDataURL(file);
  }

  /* ---------- 待添加区渲染 ---------- */
  function renderPending(){
    const wrap = $('stickerPendingWrap');
    const grid = $('stickerPendingGrid');
    const countEl = $('stickerPendingCount');
    if (!grid) return;

    if (!pending.length){
      wrap.style.display = 'none';
      grid.innerHTML = '';
      countEl.textContent = '0';
      return;
    }
    wrap.style.display = '';
    countEl.textContent = pending.length;
    grid.innerHTML = pending.map((p, i) =>
      '<div class="sticker-pending-item">' +
        '<img src="' + p.dataUrl + '" alt="">' +
        '<button class="sticker-pending-del" data-stp-del="' + i + '" title="移除" type="button">✕</button>' +
      '</div>'
    ).join('');
    grid.querySelectorAll('[data-stp-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.stpDel, 10);
        pending.splice(i, 1);
        renderPending();
      });
    });
  }

  /* ---------- 处理选中的文件 ---------- */
  async function handleFiles(files){
    if (!files || !files.length) return;
    if (pendingBusy){ showToast('上一批还在处理中…'); return; }
    pendingBusy = true;

    const arr = Array.from(files);
    let added = 0;
    let failed = 0;

    for (const file of arr){
      await new Promise(resolve => {
        processFile(file, res => {
          if (res.error){
            failed++;
            console.warn('[表情包] 处理失败：', file.name, res.error);
          } else {
            pending.push({
              dataUrl: res.dataUrl,
              mime: res.mime,
              animated: !!res.animated,
              name: ''
            });
            added++;
          }
          resolve();
        });
      });
    }

    pendingBusy = false;
    renderPending();

    if (added && failed) showToast('已添加 ' + added + ' 张，' + failed + ' 张失败');
    else if (added)     showToast('已加入待添加区：' + added + ' 张');
    else if (failed)    showToast('全部处理失败，请检查文件格式');
  }

  /* ---------- 文件选择 & 拖拽 ---------- */
  $('stickerFileInput').addEventListener('change', e => {
    handleFiles(e.target.files);
    e.target.value = '';
  });

  (function initDropZone(){
    const drop = $('stickerDrop');
    if (!drop) return;
    ['dragenter','dragover'].forEach(evt => {
      drop.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        drop.classList.add('dragging');
      });
    });
    ['dragleave','drop'].forEach(evt => {
      drop.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        if (evt === 'dragleave' && drop.contains(e.relatedTarget)) return;
        drop.classList.remove('dragging');
      });
    });
    drop.addEventListener('drop', e => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) handleFiles(dt.files);
    });
    // 阻止在页面其他位置拖拽时浏览器直接打开图片
    ['dragover','drop'].forEach(evt => {
      document.addEventListener(evt, e => {
        if (drop.contains(e.target)) return;
        if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')){
          e.preventDefault();
        }
      });
    });
  })();

  $('stickerPendingClear').addEventListener('click', () => {
    if (!pending.length) return;
    if (!confirm('清空待添加的 ' + pending.length + ' 张图片？')) return;
    pending = [];
    renderPending();
  });

  /* ---------- 批量添加 ---------- */
  $('stickerBatchAdd').addEventListener('click', async () => {
    if (!pending.length){ showToast('待添加区还没有图片'); return; }

    const category = $('stickerBatchCategory').value;
    const tags = $('stickerBatchTags').value.trim();
    const source = $('stickerBatchSource').value.trim();

    const isCloud = (typeof appMode !== 'undefined' && appMode === 'cloud' && currentUser);
    const toInsert = [];
    const failed = [];
    let addedCount = 0;

    for (let i = 0; i < pending.length; i++){
      const p = pending[i];
      const data = {
        name: p.name || '',
        category,
        tags,
        desc_text: '',
        img: p.dataUrl,
        source,
        favorite: false,
        use_count: 0,
        last_used_at: null
      };
      try {
        if (isCloud){
          const row = await cloudInsert('stickers', data);
          stickers.push(row);
        } else {
          const local = { id: Date.now() + '-' + i + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() };
          stickers.push(local);
        }
        addedCount++;
      } catch(err){
        failed.push(p);
        console.warn('[表情包] 添加失败：', err);
      }
    }

    if (!isCloud){
      if (!saveStickers()){
        // 回滚
        stickers = stickers.slice(0, stickers.length - addedCount);
        alert('本地存储已满，建议删除一些旧表情包或导出备份后清理');
        return;
      }
    }

    pending = failed;
    renderPending();
    renderGrid();

    if (failed.length){
      showToast('已添加 ' + addedCount + ' 张，' + failed.length + ' 张失败');
    } else {
      showToast('已添加 ' + addedCount + ' 张表情包');
    }
  });

  /* ---------- 复制到剪贴板 ---------- */
  async function copyImageToClipboard(dataUrl){
    if (!CLIPBOARD_SUPPORTED) return { ok: false, reason: 'unsupported' };
    try {
      // dataURL → blob
      const res = await fetch(dataUrl);
      let blob = await res.blob();
      // ClipboardItem 目前主流只接受 PNG
      if (blob.type !== 'image/png'){
        const img = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      }
      if (!blob) return { ok: false, reason: 'convert' };
      await navigator.clipboard.write([ new ClipboardItem({ 'image/png': blob }) ]);
      return { ok: true };
    } catch(e){
      console.warn('[表情包] 复制失败：', e);
      return { ok: false, reason: e && e.name || 'error' };
    }
  }

  async function copySticker(s){
    const r = await copyImageToClipboard(s.img);
    if (r.ok){
      // 增加使用次数
      s.use_count = (s.use_count || 0) + 1;
      s.last_used_at = new Date().toISOString();
      try {
        if (typeof appMode !== 'undefined' && appMode === 'cloud' && currentUser){
          await cloudUpdate('stickers', s.id, {
            use_count: s.use_count,
            last_used_at: s.last_used_at
          });
        } else {
          saveStickers();
        }
      } catch(e){ console.warn('[表情包] 更新使用次数失败：', e); }
      showToast('已复制，去聊天窗口 Ctrl/⌘ + V 粘贴吧');
      // 局部更新卡片角标
      const card = document.querySelector('.sticker-card[data-stid="' + s.id + '"] .sticker-count-badge');
      if (card) card.textContent = '×' + s.use_count;
      renderStats();
      return true;
    }

    if (r.reason === 'unsupported'){
      showToast('当前浏览器不支持一键复制，请点开大图后右键复制');
    } else if (r.reason === 'NotAllowedError'){
      showToast('复制被拒绝，请点开大图后右键复制');
    } else {
      showToast('复制失败，请点开大图后右键复制');
    }
    // 自动打开大图让用户右键
    openPreview(s.id);
    return false;
  }

  /* ---------- 收藏切换 ---------- */
  async function toggleFav(s){
    s.favorite = !s.favorite;
    try {
      if (typeof appMode !== 'undefined' && appMode === 'cloud' && currentUser){
        await cloudUpdate('stickers', s.id, { favorite: s.favorite });
      } else {
        saveStickers();
      }
      renderGrid();
      renderStats();
    } catch(e){
      s.favorite = !s.favorite;
      alert('操作失败：' + (e.message || e));
    }
  }

  /* ---------- 筛选 / 排序 ---------- */
  function getFiltered(){
    let arr = stickers.slice();
    const q = searchQ.toLowerCase();
    if (q){
      arr = arr.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.tags || '').toLowerCase().includes(q) ||
        (s.source || '').toLowerCase().includes(q) ||
        (s.desc_text || s.desc || '').toLowerCase().includes(q)
      );
    }
    if (filterCategory) arr = arr.filter(s => (s.category || '其他') === filterCategory);
    if (filterFav === 'fav') arr = arr.filter(s => s.favorite);

    if (sortMode === 'recent'){
      arr.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    } else if (sortMode === 'used'){
      arr.sort((a, b) => {
        const la = a.last_used_at ? new Date(a.last_used_at).getTime() : 0;
        const lb = b.last_used_at ? new Date(b.last_used_at).getTime() : 0;
        if (lb !== la) return lb - la;
        return String(b.created_at || '').localeCompare(String(a.created_at || ''));
      });
    } else if (sortMode === 'count'){
      arr.sort((a, b) => (b.use_count || 0) - (a.use_count || 0));
    } else if (sortMode === 'name'){
      try { arr.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN')); }
      catch(e){ arr.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))); }
    }
    return arr;
  }

  /* ---------- 统计 ---------- */
  function renderStats(){
    const total = stickers.length;
    const fav = stickers.filter(s => s.favorite).length;
    const useSum = stickers.reduce((a, s) => a + (s.use_count || 0), 0);
    const today = new Date();
    const todayKey = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    const todayAdded = stickers.filter(s => {
      if (!s.created_at) return false;
      const d = new Date(s.created_at);
      const k = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      return k === todayKey;
    }).length;

    $('stStatTotal').textContent = total;
    $('stStatFav').textContent = fav;
    $('stStatToday').textContent = todayAdded;
    $('stStatUse').textContent = useSum;
  }

  /* ---------- 网格渲染 ---------- */
  function renderGrid(){
    const grid = $('stickerGrid');
    const empty = $('stickerEmpty');
    if (!grid) return;

    const arr = getFiltered();
    $('stickerCount').textContent = arr.length;

    if (!arr.length){
      grid.innerHTML = '';
      empty.style.display = '';
      empty.textContent = (stickers.length === 0)
        ? '还没有表情包，先在上方添加几张吧～'
        : '没有匹配的表情包，换个筛选条件试试～';
      renderStats();
      return;
    }
    empty.style.display = 'none';

    grid.innerHTML = arr.map(s => {
      const hasName = !!(s.name && s.name.trim());
      const favBadge = s.favorite ? '<span class="sticker-fav-badge">★</span>' : '';
      const countBadge = (s.use_count > 0) ? '<span class="sticker-count-badge">×' + s.use_count + '</span>' : '';
      const favBtnCls = s.favorite ? 'sticker-btn fav on' : 'sticker-btn fav';
      return '<div class="sticker-card' + (hasName ? ' has-name' : '') + '" data-stid="' + esc(String(s.id)) + '" title="点击查看大图">' +
        favBadge + countBadge +
        '<img src="' + s.img + '" alt="" loading="lazy">' +
        (hasName ? '<div class="sticker-name">' + esc(s.name) + '</div>' : '') +
        '<div class="sticker-actions">' +
          '<button class="sticker-btn copy" data-stcopy="' + esc(String(s.id)) + '" title="复制到剪贴板" type="button">复制</button>' +
          '<button class="' + favBtnCls + '" data-stfav="' + esc(String(s.id)) + '" title="常用" type="button">★</button>' +
          '<button class="sticker-btn del" data-stdel="' + esc(String(s.id)) + '" title="删除" type="button">✕</button>' +
        '</div>' +
      '</div>';
    }).join('');

    renderStats();
  }

  /* ---------- 网格事件委托 ---------- */
  $('stickerGrid').addEventListener('click', async e => {
    const card = e.target.closest('.sticker-card');
    if (!card) return;
    const id = card.dataset.stid;

    const copyBtn = e.target.closest('[data-stcopy]');
    if (copyBtn){
      e.stopPropagation();
      const s = stickers.find(x => String(x.id) === String(id));
      if (s) await copySticker(s);
      return;
    }
    const favBtn = e.target.closest('[data-stfav]');
    if (favBtn){
      e.stopPropagation();
      const s = stickers.find(x => String(x.id) === String(id));
      if (s) await toggleFav(s);
      return;
    }
    const delBtn = e.target.closest('[data-stdel]');
    if (delBtn){
      e.stopPropagation();
      const s = stickers.find(x => String(x.id) === String(id));
      if (!s) return;
      if (!confirm('确定删除这张表情包吗？')) return;
      try {
        if (typeof appMode !== 'undefined' && appMode === 'cloud' && currentUser){
          await cloudDelete('stickers', s.id);
        }
        stickers = stickers.filter(x => String(x.id) !== String(id));
        if (!(typeof appMode !== 'undefined' && appMode === 'cloud' && currentUser)) saveStickers();
        renderGrid();
        showToast('已删除');
      } catch(err){ alert('删除失败：' + (err.message || err)); }
      return;
    }
    // 点击卡片本体 → 打开预览
    openPreview(id);
  });

  /* ---------- 大图预览 ---------- */
  let previewEl = null;
  function ensurePreview(){
    if (previewEl) return previewEl;
    const el = document.createElement('div');
    el.className = 'sticker-preview';
    el.id = 'stickerPreview';
    el.innerHTML =
      '<div class="sticker-preview-card">' +
        '<div class="sticker-preview-head">' +
          '<div class="sticker-preview-title" id="stickerPreviewTitle">表情包预览</div>' +
          '<button class="sticker-preview-close" id="stickerPreviewClose" type="button" aria-label="关闭">✕</button>' +
        '</div>' +
        '<div class="sticker-preview-body"><img id="stickerPreviewImg" src="" alt=""></div>' +
        '<div class="sticker-preview-foot">' +
          '<div class="sticker-preview-meta" id="stickerPreviewMeta"></div>' +
          '<button class="btn" id="stickerPreviewCopy" type="button">复制图片</button>' +
          '<button class="btn ghost" id="stickerPreviewFav" type="button">设为常用</button>' +
          '<button class="btn ghost" id="stickerPreviewEdit" type="button">编辑信息</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    previewEl = el;

    el.addEventListener('click', e => {
      if (e.target === el) closePreview();
    });
    document.getElementById('stickerPreviewClose').addEventListener('click', closePreview);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && el.classList.contains('show')) closePreview();
    });
    return el;
  }

  function openPreview(id){
    const s = stickers.find(x => String(x.id) === String(id));
    if (!s) return;
    previewId = String(s.id);
    const el = ensurePreview();
    $('stickerPreviewTitle').textContent = s.name || '表情包预览';
    $('stickerPreviewImg').src = s.img;

    const parts = [];
    if (s.category) parts.push('<b>分类</b>' + esc(s.category));
    if (s.tags)     parts.push('<b>标签</b>' + esc(s.tags));
    if (s.source)   parts.push('<b>来源</b>' + esc(s.source));
    if (s.use_count) parts.push('<b>使用</b>' + s.use_count + ' 次');
    if (s.last_used_at){
      const d = new Date(s.last_used_at);
      parts.push('<b>最近</b>' + d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'));
    }
    const desc = s.desc_text || s.desc || '';
    if (desc) parts.push('<b>备注</b>' + esc(desc));
    $('stickerPreviewMeta').innerHTML = parts.length ? parts.join('　·　') : '（暂无更多信息）';

    const favBtn = $('stickerPreviewFav');
    favBtn.textContent = s.favorite ? '取消常用' : '设为常用';

    el.classList.add('show');
  }

  function closePreview(){
    if (previewEl) previewEl.classList.remove('show');
    previewId = null;
  }

  /* 预览弹窗按钮绑定（一次性） */
  ensurePreview();
  $('stickerPreviewCopy').addEventListener('click', async () => {
    if (!previewId) return;
    const s = stickers.find(x => String(x.id) === String(previewId));
    if (s) await copySticker(s);
  });
  $('stickerPreviewFav').addEventListener('click', async () => {
    if (!previewId) return;
    const s = stickers.find(x => String(x.id) === String(previewId));
    if (!s) return;
    await toggleFav(s);
    $('stickerPreviewFav').textContent = s.favorite ? '取消常用' : '设为常用';
  });
  $('stickerPreviewEdit').addEventListener('click', () => {
    if (!previewId) return;
    const s = stickers.find(x => String(x.id) === String(previewId));
    if (!s) return;
    const newName = prompt('表情包名称（留空表示不命名）：', s.name || '');
    if (newName === null) return;
    s.name = newName.trim();
    const newTags = prompt('标签（逗号分隔）：', s.tags || '');
    if (newTags === null) return;
    s.tags = newTags.trim();
    const newSource = prompt('来源：', s.source || '');
    if (newSource === null) return;
    s.source = newSource.trim();
    const newDesc = prompt('备注：', s.desc_text || s.desc || '');
    if (newDesc === null) return;
    s.desc_text = newDesc.trim();

    (async () => {
      try {
        if (typeof appMode !== 'undefined' && appMode === 'cloud' && currentUser){
          await cloudUpdate('stickers', s.id, {
            name: s.name, tags: s.tags, source: s.source, desc_text: s.desc_text
          });
        } else {
          saveStickers();
        }
        renderGrid();
        openPreview(s.id);
        showToast('已更新');
      } catch(e){ alert('保存失败：' + (e.message || e)); }
    })();
  });

  /* ---------- 筛选 / 搜索 ---------- */
  $('stickerSearch').addEventListener('input', e => { searchQ = e.target.value.trim(); renderGrid(); });
  $('stickerFilterCategory').addEventListener('change', e => { filterCategory = e.target.value; renderGrid(); });
  $('stickerFilterFav').addEventListener('change', e => { filterFav = e.target.value; renderGrid(); });
  $('stickerSort').addEventListener('change', e => { sortMode = e.target.value; renderGrid(); });

  /* ---------- 清空 ---------- */
  $('stickerClearAll').addEventListener('click', async () => {
    if (!stickers.length) return;
    if (!confirm('确定清空全部 ' + stickers.length + ' 张表情包吗？此操作不可恢复。')) return;
    try {
      if (typeof appMode !== 'undefined' && appMode === 'cloud' && currentUser){
        await sb.from('stickers').delete().eq('user_id', currentUser.id);
      }
      stickers = [];
      try { localStorage.removeItem(STICKERS_KEY); } catch(e){}
      renderGrid();
      showToast('表情包已清空');
    } catch(err){ alert('清空失败：' + (err.message || err)); }
  });

  /* ---------- 导出 JSON ---------- */
  $('stickerExportJson').addEventListener('click', () => {
    if (!stickers.length){ showToast('还没有表情包'); return; }
    // 导出时剥离 img，避免文件过大
    const out = stickers.map(s => {
      const { img, ...rest } = s;
      return { ...rest, img_size: (img || '').length };
    });
    const data = {
      app: '岁窦工具箱',
      type: 'sticker-metadata',
      note: '本文件仅含表情包元数据，不含图片本体。完整备份请在「设置 → 导出全部数据」操作。',
      exportTime: new Date().toISOString(),
      count: stickers.length,
      items: out
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const d = new Date();
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的表情包_元数据_' + timeStamp(d) + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    showToast('已导出元数据（不含图片）');
  });

  /* ---------- 对外初始化 ---------- */
  window.__stickerInit = function(){
    loadStickers();
    renderPending();
    renderGrid();
  };

  if (page.classList.contains('active')){
    window.__stickerInit();
  }

  console.log('[表情包收藏] 已加载');
})();