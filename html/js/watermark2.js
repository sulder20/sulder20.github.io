/* ============================================================
   图片加水印 · V4.1 活力版
   （并入「图片工具」的第四个标签页）
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-imagecompress');
  if (!page) return;

  // 只处理自己的 tab 和子页；其他 tab 交给原有的 imagecompress2.js
  // 但如果它没接管，我们兜底处理一遍，保证切换一定生效
  const tabsWrap = document.getElementById('itTabs');
  if (tabsWrap){
    tabsWrap.addEventListener('click', e => {
      const btn = e.target.closest('.ta-subtab[data-it]');
      if (!btn) return;
      const v = btn.dataset.it;
      tabsWrap.querySelectorAll('.ta-subtab').forEach(b => b.classList.toggle('active', b === btn));
      page.querySelectorAll('.ta-subpage').forEach(p => p.classList.toggle('active', p.dataset.itPage === v));
      if (v === 'watermark') setTimeout(ensureCanvasReady, 30);
    });
  }

  const MAX_DIM = 4000;   // 超长边超过 4000 先缩小，避免 canvas 内存爆炸
  const $ = id => document.getElementById(id);

  let srcImage = null;        // Image 对象（原图或缩放后的图）
  let srcDataURL = '';
  let srcMime = 'image/jpeg';
  let srcFileName = 'image';
  let srcCanvasW = 0;
  let srcCanvasH = 0;

  let wmImage = null;          // 图片水印的 Image 对象
  let wmImageDataURL = '';

  let drawPending = false;

  /* ---------- 工具 ---------- */
  function pad2(n){ return String(n).padStart(2, '0'); }
  function timeStamp(d){
    return d.getFullYear() + pad2(d.getMonth()+1) + pad2(d.getDate()) + '_' + pad2(d.getHours()) + pad2(d.getMinutes());
  }
  function showToastSafe(msg){
    if (typeof showToast === 'function') showToast(msg);
  }
  function hexToRgba(hex, alpha){
    hex = String(hex || '#ffffff').replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ---------- 上传原图 ---------- */
  function bindUpload(){
    $('wmFileInput').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }

      srcFileName = file.name.replace(/\.[^.]+$/, '') || 'image';
      srcMime = file.type || 'image/jpeg';

      const reader = new FileReader();
      reader.onload = ev => {
        srcDataURL = ev.target.result;
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          let needScale = false;
          if (w > MAX_DIM || h > MAX_DIM){
            needScale = true;
            const scale = Math.min(MAX_DIM / w, MAX_DIM / h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }
          srcCanvasW = w;
          srcCanvasH = h;

          if (needScale){
            const off = document.createElement('canvas');
            off.width = w;
            off.height = h;
            off.getContext('2d').drawImage(img, 0, 0, w, h);
            const newImg = new Image();
            newImg.onload = () => { srcImage = newImg; onImageReady(); };
            newImg.src = off.toDataURL('image/png');
          } else {
            srcImage = img;
            onImageReady();
          }
        };
        img.onerror = () => alert('图片解析失败');
        img.src = ev.target.result;
      };
      reader.onerror = () => alert('读取失败');
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  function onImageReady(){
    $('wmFileInfo').style.display = '';
    $('wmFileInfo').innerHTML =
      '已载入：<b>' + srcImage.naturalWidth + ' × ' + srcImage.naturalHeight + '</b> 像素' +
      (srcCanvasW !== srcImage.naturalWidth ? '（已缩放到 ' + srcCanvasW + ' × ' + srcCanvasH + ' 处理）' : '');
    $('wmDownload').disabled = false;

    const canvas = $('wmCanvas');
    canvas.width = srcCanvasW;
    canvas.height = srcCanvasH;
    canvas.classList.add('show');
    $('wmPreviewEmpty').style.display = 'none';

    requestDraw();
  }

  /* ---------- 上传水印图片 ---------- */
  function bindWatermarkImage(){
    $('wmImageInput').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file){ wmImage = null; wmImageDataURL = ''; $('wmImagePreview').textContent = '未选择'; return; }
      if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }

      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          wmImage = img;
          wmImageDataURL = ev.target.result;
          $('wmImagePreview').innerHTML = '<img src="' + wmImageDataURL + '" alt="">';
          requestDraw();
        };
        img.onerror = () => alert('水印图片解析失败');
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  /* ---------- 参数读取 ---------- */
  function getTextOpts(){
    return {
      text:    $('wmText').value || '',
      size:    Math.max(6, parseInt($('wmTextSize').value, 10) || 32),
      color:   $('wmTextColor').value || '#ffffff',
      font:    $('wmTextFont').value,
      opacity: Math.max(5, Math.min(100, parseInt($('wmTextOpacity').value, 10) || 80)) / 100,
      rotate:  Math.max(-90, Math.min(90, parseInt($('wmTextRotate').value, 10) || 0)) * Math.PI / 180,
      pos:     getActivePos('wmTextPos'),
      tile:    $('wmTile').checked
    };
  }

  function getImageOpts(){
    return {
      size:    Math.max(3, Math.min(80, parseInt($('wmImageSize').value, 10) || 20)) / 100,
      opacity: Math.max(5, Math.min(100, parseInt($('wmImageOpacity').value, 10) || 80)) / 100,
      pos:     getActivePos('wmImagePos')
    };
  }

  function getActivePos(wrapId){
    const wrap = $(wrapId);
    const btn = wrap.querySelector('button.active');
    return btn ? btn.dataset.pos : 'mc';
  }

  function getActiveType(){
    const btn = $('wmTypeSwitch').querySelector('.wm-type-btn.active');
    return btn ? btn.dataset.wmType : 'text';
  }

  /* ---------- 绘制 ---------- */
  function requestDraw(){
    if (drawPending) return;
    drawPending = true;
    requestAnimationFrame(() => {
      drawPending = false;
      draw();
    });
  }

  function draw(){
    if (!srcImage) return;
    const canvas = $('wmCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(srcImage, 0, 0, canvas.width, canvas.height);

    const type = getActiveType();
    if (type === 'text') drawTextWatermark(ctx, canvas);
    else drawImageWatermark(ctx, canvas);
  }

  /* 9 宫格坐标计算：返回绘制锚点 { x, y, anchorX, anchorY } */
  function calcAnchor(canvas, pos, pad){
    pad = pad || 24;
    const W = canvas.width, H = canvas.height;
    let x, y, ax, ay;
    switch(pos){
      case 'tl': x = pad;        y = pad;        ax = 'left';   ay = 'top';    break;
      case 'tc': x = W / 2;      y = pad;        ax = 'center'; ay = 'top';    break;
      case 'tr': x = W - pad;    y = pad;        ax = 'right';  ay = 'top';    break;
      case 'ml': x = pad;        y = H / 2;      ax = 'left';   ay = 'middle'; break;
      case 'mc': x = W / 2;      y = H / 2;      ax = 'center'; ay = 'middle'; break;
      case 'mr': x = W - pad;    y = H / 2;      ax = 'right';  ay = 'middle'; break;
      case 'bl': x = pad;        y = H - pad;    ax = 'left';   ay = 'bottom'; break;
      case 'bc': x = W / 2;      y = H - pad;    ax = 'center'; ay = 'bottom'; break;
      case 'br': x = W - pad;    y = H - pad;    ax = 'right';  ay = 'bottom'; break;
      default:   x = W / 2;      y = H / 2;      ax = 'center'; ay = 'middle'; break;
    }
    return { x, y, ax, ay, pad };
  }

  function drawTextWatermark(ctx, canvas){
    const o = getTextOpts();
    if (!o.text || !o.text.trim()) return;

    ctx.save();
    ctx.font = 'bold ' + o.size + 'px ' + o.font;
    ctx.fillStyle = hexToRgba(o.color, o.opacity);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (o.tile){
      // 平铺模式：以旋转后的水印为单元，铺满整张画布
      const metrics = ctx.measureText(o.text);
      const textW = Math.max(20, metrics.width);
      const textH = o.size;
      const gapX = Math.max(80, textW * 0.6);
      const gapY = Math.max(60, textH * 2.4);

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(o.rotate);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
      const startX = -diag;
      const endX = canvas.width + diag;
      const startY = -diag;
      const endY = canvas.height + diag;

      for (let y = startY; y < endY; y += gapY){
        for (let x = startX; x < endX; x += gapX){
          ctx.fillText(o.text, x, y);
        }
      }
    } else {
      const a = calcAnchor(canvas, o.pos);
      // 旋转时先移到锚点旋转再画回
      ctx.translate(a.x, a.y);
      ctx.rotate(o.rotate);
      ctx.textAlign = a.ax === 'left' ? 'left' : a.ax === 'right' ? 'right' : 'center';
      ctx.textBaseline = a.ay === 'top' ? 'top' : a.ay === 'bottom' ? 'bottom' : 'middle';
      ctx.fillText(o.text, 0, 0);
    }
    ctx.restore();
  }

  function drawImageWatermark(ctx, canvas){
    if (!wmImage) return;
    const o = getImageOpts();

    // 水印宽度 = 原图宽度的百分比
    const wmW = Math.max(20, Math.round(canvas.width * o.size));
    const wmH = Math.round(wmW * wmImage.naturalHeight / wmImage.naturalWidth);

    const a = calcAnchor(canvas, o.pos);

    // 根据锚点对齐方式计算左上角坐标
    let dx = a.x, dy = a.y;
    if (a.ax === 'center') dx -= wmW / 2;
    else if (a.ax === 'right') dx -= wmW;
    if (a.ay === 'middle') dy -= wmH / 2;
    else if (a.ay === 'bottom') dy -= wmH;

    ctx.save();
    ctx.globalAlpha = o.opacity;
    ctx.drawImage(wmImage, dx, dy, wmW, wmH);
    ctx.restore();
  }

  /* ---------- 参数绑定 ---------- */
  function bindControls(){
    // 类型切换
    $('wmTypeSwitch').querySelectorAll('.wm-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $('wmTypeSwitch').querySelectorAll('.wm-type-btn').forEach(b => b.classList.toggle('active', b === btn));
        const t = btn.dataset.wmType;
        page.querySelectorAll('.wm-type-panel').forEach(p => p.classList.toggle('active', p.dataset.wmPanel === t));
        requestDraw();
      });
    });

    // 文字水印参数
    ['wmText','wmTextSize','wmTextColor','wmTextFont'].forEach(id => {
      $(id).addEventListener('input', requestDraw);
      $(id).addEventListener('change', requestDraw);
    });

    $('wmTextOpacity').addEventListener('input', e => {
      $('wmTextOpacityVal').textContent = e.target.value + '%';
      requestDraw();
    });
    $('wmTextRotate').addEventListener('input', e => {
      $('wmTextRotateVal').textContent = e.target.value + '°';
      requestDraw();
    });

    $('wmTile').addEventListener('change', requestDraw);

    // 文字位置
    $('wmTextPos').querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        $('wmTextPos').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
        requestDraw();
      });
    });

    // 图片水印参数
    $('wmImageSize').addEventListener('input', e => {
      $('wmImageSizeVal').textContent = e.target.value + '%';
      requestDraw();
    });
    $('wmImageOpacity').addEventListener('input', e => {
      $('wmImageOpacityVal').textContent = e.target.value + '%';
      requestDraw();
    });

    // 图片位置
    $('wmImagePos').querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        $('wmImagePos').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
        requestDraw();
      });
    });

    // 下载
    $('wmDownload').addEventListener('click', doDownload);
  }

  /* ---------- 下载 ---------- */
  function doDownload(){
    if (!srcImage){ showToastSafe('先上传图片'); return; }
    const canvas = $('wmCanvas');

    // 导出格式：PNG 保持原格式（透明），其他统一 JPG
    const isPNG = /png/i.test(srcMime);
    const outMime = isPNG ? 'image/png' : 'image/jpeg';
    const ext = isPNG ? 'png' : 'jpg';

    const fileName = srcFileName + '_watermark_' + timeStamp(new Date()) + '.' + ext;

    if (canvas.toBlob){
      canvas.toBlob(blob => {
        if (!blob){ showToastSafe('导出失败，请重试'); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        showToastSafe('已导出水印图片');
      }, outMime, isPNG ? undefined : 0.92);
    } else {
      const a = document.createElement('a');
      a.href = canvas.toDataURL(outMime, isPNG ? undefined : 0.92);
      a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showToastSafe('已导出水印图片');
    }
  }

  /* ---------- 初始化 ---------- */
  function ensureCanvasReady(){
    if (srcImage){
      const canvas = $('wmCanvas');
      canvas.width = srcCanvasW;
      canvas.height = srcCanvasH;
      requestDraw();
    }
  }

  let bound = false;
  function initOnce(){
    if (bound) return;
    bound = true;
    bindUpload();
    bindWatermarkImage();
    bindControls();
  }

  function init(){
    initOnce();
    ensureCanvasReady();
  }

  // 页面默认是隐藏的（在 compress 子标签下），
  // 但不影响绑定；切到水印 tab 时自动重绘。
  initOnce();

  // 首屏如果恰好在水印 tab（一般不会），也初始化一次
  if (page.classList.contains('active')){
    const wmPage = page.querySelector('.ta-subpage[data-it-page="watermark"]');
    if (wmPage && wmPage.classList.contains('active')) ensureCanvasReady();
  }

  console.log('[图片加水印] 已加载');
})();