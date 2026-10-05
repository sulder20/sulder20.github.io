/* ============================================================
   图片工具 · 岁窦工具箱 V4.1
   图片压缩 / 拼图（长图）/ 去除背景
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-imagecompress');
  if (!page) return;

  var tabsEl = document.getElementById('itTabs');
  var current = 'compress';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function formatBytes(b) {
    if (!b) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  }
  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function stampSuffix() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes());
  }

  /* ============================================================
     一、图片压缩
     ============================================================ */
  function initCompress() {
    if (window.__compressInited) return;
    window.__compressInited = true;

    var fileInput = document.getElementById('compressFileInput');
    var qualityEl = document.getElementById('compressQuality');
    var qualityVal = document.getElementById('compressQualityVal');
    var targetSizeEl = document.getElementById('compressTargetSize');
    var formatEl = document.getElementById('compressFormat');
    var originalBox = document.getElementById('originalBox');
    var compressedBox = document.getElementById('compressedBox');
    var originalSize = document.getElementById('originalSize');
    var compressedSize = document.getElementById('compressedSize');
    var originalDim = document.getElementById('originalDim');
    var compressedDim = document.getElementById('compressedDim');
    var originalFormat = document.getElementById('originalFormat');
    var compressRate = document.getElementById('compressRate');
    var downloadBtn = document.getElementById('compressDownloadBtn');
    var resetBtn = document.getElementById('compressResetBtn');

    if (!fileInput) return;

    var originalFile = null;
    var originalDataUrl = null;
    var compressedBlob = null;
    var compressedDataUrl = null;
    var originalImg = null;

    function resetAll() {
      originalFile = null;
      originalDataUrl = null;
      compressedBlob = null;
      compressedDataUrl = null;
      originalImg = null;
      fileInput.value = '';
      originalBox.innerHTML = '<span style="color:#b0b6c4;font-size:13px;">选择图片后显示</span>';
      compressedBox.innerHTML = '<span style="color:#b0b6c4;font-size:13px;">压缩后显示</span>';
      originalSize.textContent = '—';
      compressedSize.textContent = '—';
      originalDim.textContent = '—';
      compressedDim.textContent = '—';
      originalFormat.textContent = '—';
      compressRate.textContent = '—';
      compressRate.className = 'compress-rate';
      downloadBtn.disabled = true;
    }

    function handleFile(file) {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }
      originalFile = file;
      originalSize.textContent = formatBytes(file.size);
      originalFormat.textContent = file.type.replace('image/', '').toUpperCase();

      var reader = new FileReader();
      reader.onload = function (e) {
        originalDataUrl = e.target.result;
        var img = new Image();
        img.onload = function () {
          originalImg = img;
          originalDim.textContent = img.width + ' × ' + img.height;
          originalBox.innerHTML = '<img src="' + originalDataUrl + '" alt="">';
          doCompress();
        };
        img.src = originalDataUrl;
      };
      reader.readAsDataURL(file);
    }

    function doCompress() {
      if (!originalImg) return;
      var q = parseInt(qualityEl.value, 10) / 100;
      var fmt = formatEl.value;
      var target = parseInt(targetSizeEl.value, 10);

      var canvas = document.createElement('canvas');
      canvas.width = originalImg.width;
      canvas.height = originalImg.height;
      var ctx = canvas.getContext('2d');
      if (fmt === 'image/jpeg') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(originalImg, 0, 0);

      function finish(blob) {
        compressedBlob = blob;
        compressedSize.textContent = formatBytes(blob.size);
        compressedDim.textContent = canvas.width + ' × ' + canvas.height;

        if (originalFile.size > 0) {
          var rate = (1 - blob.size / originalFile.size) * 100;
          if (rate >= 0) {
            compressRate.textContent = '减小 ' + rate.toFixed(1) + '%';
            compressRate.className = 'compress-rate small';
          } else {
            compressRate.textContent = '增大 ' + (-rate).toFixed(1) + '%';
            compressRate.className = 'compress-rate warn';
          }
        }

        var url = URL.createObjectURL(blob);
        compressedDataUrl = url;
        compressedBox.innerHTML = '<img src="' + url + '" alt="">';
        downloadBtn.disabled = false;
      }

      /* 如果设置了目标大小，二分查找质量 */
      if (target && isFinite(target) && target > 0) {
        var targetBytes = target * 1024;
        var lo = 0.05, hi = 1.0, best = null;
        var tryCount = 0;
        function tryQuality() {
          if (tryCount++ > 10 || hi - lo < 0.03) {
            if (best) finish(best);
            else canvas.toBlob(finish, fmt, lo);
            return;
          }
          var mid = (lo + hi) / 2;
          canvas.toBlob(function (b) {
            if (b.size <= targetBytes) { best = b; lo = mid; }
            else hi = mid;
            tryQuality();
          }, fmt, mid);
        }
        tryQuality();
      } else {
        canvas.toBlob(finish, fmt, q);
      }
    }

    fileInput.addEventListener('change', function (e) {
      handleFile(e.target.files[0]);
    });

    qualityEl.addEventListener('input', function () {
      qualityVal.textContent = qualityEl.value + '%';
      doCompress();
    });
    formatEl.addEventListener('change', doCompress);
    targetSizeEl.addEventListener('input', function () {
      clearTimeout(window.__compressTimer);
      window.__compressTimer = setTimeout(doCompress, 500);
    });

    downloadBtn.addEventListener('click', function () {
      if (!compressedBlob) return;
      var fmt = formatEl.value;
      var ext = fmt === 'image/png' ? 'png' : (fmt === 'image/webp' ? 'webp' : 'jpg');
      downloadBlob(compressedBlob, '压缩图片_' + stampSuffix() + '.' + ext);
      if (typeof showToast === 'function') showToast('已开始下载');
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        qualityEl.value = 80;
        qualityVal.textContent = '80%';
        targetSizeEl.value = '';
        formatEl.value = 'image/jpeg';
        resetAll();
      });
    }
  }

  /* ============================================================
     二、拼图（长图）
     ============================================================ */
  function initStitch() {
    if (window.__stitchInited) return;
    window.__stitchInited = true;

    var fileInput = document.getElementById('stitchFileInput');
    var listEl = document.getElementById('stitchList');
    var clearBtn = document.getElementById('stitchClear');
    var gapEl = document.getElementById('stitchGap');
    var maxWEl = document.getElementById('stitchMaxW');
    var bgEl = document.getElementById('stitchBg');
    var runBtn = document.getElementById('stitchRun');
    var dlBtn = document.getElementById('stitchDownload');
    var previewEl = document.getElementById('stitchPreview');
    var msgEl = document.getElementById('stitchMsg');

    if (!fileInput) return;

    var images = []; /* [{ id, name, img, dataUrl }] */
    var resultBlob = null;

    function showMsg(text, kind) {
      msgEl.textContent = text;
      msgEl.className = 'mx-msg' + (text ? ' show' : '') + (kind ? ' ' + kind : '');
    }

    function renderList() {
      if (!images.length) {
        listEl.innerHTML = '';
        return;
      }
      listEl.innerHTML = images.map(function (item, i) {
        return '<div class="stitch-thumb" data-id="' + item.id + '">' +
          '<img src="' + item.dataUrl + '" alt="">' +
          '<button class="stitch-thumb-del" data-del="' + item.id + '" title="删除">✕</button>' +
        '</div>';
      }).join('');

      listEl.querySelectorAll('[data-del]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.dataset.del;
          images = images.filter(function (x) { return x.id !== id; });
          renderList();
        });
      });
    }

    function addFiles(files) {
      Array.prototype.forEach.call(files, function (file) {
        if (!file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          var img = new Image();
          img.onload = function () {
            images.push({
              id: 's' + Date.now() + Math.random().toString(36).slice(2, 6),
              name: file.name,
              img: img,
              dataUrl: e.target.result
            });
            renderList();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    fileInput.addEventListener('change', function (e) {
      addFiles(e.target.files);
      fileInput.value = '';
    });

    clearBtn.addEventListener('click', function () {
      if (!images.length) return;
      if (!confirm('确定清空已选图片吗？')) return;
      images = [];
      renderList();
      previewEl.innerHTML = '<span style="color:#b0b6c4;font-size:13px;">生成后显示预览</span>';
      dlBtn.disabled = true;
      resultBlob = null;
      showMsg('', '');
    });

    runBtn.addEventListener('click', function () {
      if (!images.length) {
        showMsg('请先选择至少一张图片', 'err');
        return;
      }
      var gap = parseInt(gapEl.value, 10);
      if (!isFinite(gap) || gap < 0) gap = 0;
      if (gap > 200) gap = 200;
      var maxW = parseInt(maxWEl.value, 10);
      if (!isFinite(maxW) || maxW < 0) maxW = 0;
      var bgColor = bgEl.value || '#ffffff';

      /* 计算目标宽度 */
      var targetW = maxW > 0 ? maxW : Math.max.apply(null, images.map(function (x) { return x.img.width; }));
      targetW = Math.min(targetW, 4000);

      /* 计算每张图缩放后的高度 */
      var heights = images.map(function (x) {
        var ratio = x.img.height / x.img.width;
        return Math.round(targetW * ratio);
      });
      var totalH = heights.reduce(function (a, b) { return a + b; }, 0) + gap * (images.length - 1);

      /* 高度上限保护 */
      var MAX_H = 20000;
      var scale = 1;
      if (totalH > MAX_H) {
        scale = MAX_H / totalH;
        totalH = MAX_H;
      }
      var finalW = Math.round(targetW * scale);

      var canvas = document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = totalH;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, finalW, totalH);

      var y = 0;
      images.forEach(function (x, i) {
        var h = Math.round(heights[i] * scale);
        ctx.drawImage(x.img, 0, y, finalW, h);
        y += h;
        if (i < images.length - 1) y += gap;
      });

      canvas.toBlob(function (blob) {
        if (!blob) {
          showMsg('生成失败，请重试', 'err');
          return;
        }
        resultBlob = blob;
        var url = URL.createObjectURL(blob);
        previewEl.innerHTML = '<img src="' + url + '" alt="">';
        dlBtn.disabled = false;
        showMsg('已生成 ' + finalW + ' × ' + totalH + ' 长图，大小 ' + formatBytes(blob.size), 'ok');
      }, 'image/png');
    });

    dlBtn.addEventListener('click', function () {
      if (!resultBlob) return;
      downloadBlob(resultBlob, '拼图_' + stampSuffix() + '.png');
      if (typeof showToast === 'function') showToast('已开始下载');
    });
  }

  /* ============================================================
     三、去除背景
     ============================================================ */
  function initBgRemove() {
    if (window.__bgRemoveInited) return;
    window.__bgRemoveInited = true;

    var fileInput = document.getElementById('bgFileInput');
    var controlPanel = document.getElementById('bgControlPanel');
    var colorPreview = document.getElementById('bgColorPreview');
    var colorInput = document.getElementById('bgColorInput');
    var tolEl = document.getElementById('bgTolerance');
    var tolVal = document.getElementById('bgTolVal');
    var autoPickBtn = document.getElementById('bgAutoPick');
    var runBtn = document.getElementById('bgRun');
    var dlBtn = document.getElementById('bgDownload');
    var resetBtn = document.getElementById('bgReset');
    var canvas = document.getElementById('bgCanvas');
    var hintEl = document.getElementById('bgHint');

    if (!fileInput) return;

    var sourceImg = null;
    var sourceImageData = null;
    var originalImageData = null;
    var resultBlob = null;
    var pickedColor = { r: 255, g: 255, b: 255 };

    function setPickColor(r, g, b) {
      pickedColor = { r: r, g: g, b: b };
      var hex = rgbToHex(r, g, b);
      colorInput.value = hex;
      if (colorPreview) colorPreview.style.background = hex;
    }

    function rgbToHex(r, g, b) {
      var p = function (n) { return String(n).padStart(2, '0'); };
      return '#' + p(r.toString(16)) + p(g.toString(16)) + p(b.toString(16));
    }
    function hexToRgb(hex) {
      hex = hex.replace(/^#/, '');
      var n = parseInt(hex, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          sourceImg = img;
          /* 设置画布尺寸 */
          var MAX = 1600;
          var w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            var scale = Math.min(MAX / w, MAX / h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          sourceImageData = ctx.getImageData(0, 0, w, h);
          originalImageData = new ImageData(
            new Uint8ClampedArray(sourceImageData.data),
            sourceImageData.width,
            sourceImageData.height
          );

          controlPanel.style.display = '';
          hintEl.style.display = '';
          dlBtn.disabled = true;
          resultBlob = null;

          /* 默认从左上角取色 */
          autoPickCorners();

          /* 应用一次 */
          applyRemove();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function autoPickCorners() {
      if (!originalImageData) return;
      var w = originalImageData.width, h = originalImageData.height;
      var d = originalImageData.data;
      function sample(x, y) {
        var i = (y * w + x) * 4;
        return { r: d[i], g: d[i + 1], b: d[i + 2] };
      }
      var corners = [
        sample(2, 2),
        sample(w - 3, 2),
        sample(2, h - 3),
        sample(w - 3, h - 3)
      ];
      var avgR = Math.round(corners.reduce(function (a, c) { return a + c.r; }, 0) / 4);
      var avgG = Math.round(corners.reduce(function (a, c) { return a + c.g; }, 0) / 4);
      var avgB = Math.round(corners.reduce(function (a, c) { return a + c.b; }, 0) / 4);
      setPickColor(avgR, avgG, avgB);
    }

    function applyRemove() {
      if (!sourceImageData) return;
      var w = sourceImageData.width, h = sourceImageData.height;
      var src = originalImageData.data;
      var dst = sourceImageData.data;
      var tr = pickedColor.r, tg = pickedColor.g, tb = pickedColor.b;
      var tol = parseInt(tolEl.value, 10) || 0;
      var maxDist = tol * 4.42; /* 0-100 → 0-442 */
      var maxDistSq = maxDist * maxDist;

      for (var i = 0; i < src.length; i += 4) {
        var dr = src[i] - tr;
        var dg = src[i + 1] - tg;
        var db = src[i + 2] - tb;
        var distSq = dr * dr + dg * dg + db * db;
        if (distSq <= maxDistSq) {
          dst[i + 3] = 0; /* 透明 */
        } else {
          dst[i] = src[i];
          dst[i + 1] = src[i + 1];
          dst[i + 2] = src[i + 2];
          dst[i + 3] = src[i + 3];
        }
      }
      var ctx = canvas.getContext('2d');
      ctx.putImageData(sourceImageData, 0, 0);

      /* 生成 blob */
      canvas.toBlob(function (b) {
        resultBlob = b;
        dlBtn.disabled = !b;
      }, 'image/png');
    }

    fileInput.addEventListener('change', function (e) {
      handleFile(e.target.files[0]);
    });

    colorInput.addEventListener('input', function () {
      var rgb = hexToRgb(colorInput.value);
      setPickColor(rgb.r, rgb.g, rgb.b);
      applyRemove();
    });

    tolEl.addEventListener('input', function () {
      tolVal.textContent = tolEl.value;
      applyRemove();
    });

    autoPickBtn.addEventListener('click', function () {
      autoPickCorners();
      applyRemove();
      if (typeof showToast === 'function') showToast('已从四角取样');
    });

    runBtn.addEventListener('click', function () {
      applyRemove();
      if (typeof showToast === 'function') showToast('已应用');
    });

    dlBtn.addEventListener('click', function () {
      if (!resultBlob) return;
      downloadBlob(resultBlob, '去背景_' + stampSuffix() + '.png');
      if (typeof showToast === 'function') showToast('已开始下载');
    });

    resetBtn.addEventListener('click', function () {
      if (!originalImageData) return;
      sourceImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
      );
      canvas.getContext('2d').putImageData(sourceImageData, 0, 0);
      tolEl.value = 30;
      tolVal.textContent = '30';
      autoPickCorners();
      applyRemove();
    });

    /* 点击画布取色 */
    canvas.addEventListener('click', function (e) {
      if (!sourceImageData) return;
      var rect = canvas.getBoundingClientRect();
      var x = Math.floor((e.clientX - rect.left) * canvas.width / rect.width);
      var y = Math.floor((e.clientY - rect.top) * canvas.height / rect.height);
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
      var idx = (y * canvas.width + x) * 4;
      /* 从原图取色，避免取样到已处理后的透明像素 */
      var src = originalImageData.data;
      setPickColor(src[idx], src[idx + 1], src[idx + 2]);
      applyRemove();
      hintEl.style.display = 'none';
    });
  }

  /* ============================================================
     子标签切换
     ============================================================ */
  if (tabsEl) {
    tabsEl.querySelectorAll('.ta-subtab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabsEl.querySelectorAll('.ta-subtab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        current = tab.dataset.it;
        document.querySelectorAll('#page-imagecompress .ta-subpage').forEach(function (p) {
          p.classList.toggle('active', p.dataset.itPage === current);
        });
      });
    });
  }

  /* ---------- 初始化三个子工具（无论页面是否激活，DOM 就绪就初始化） ---------- */
  function initAll() {
    initCompress();
    initStitch();
    initBgRemove();
  }

  window.__imagecompressInit = initAll;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  console.log('[图片工具] 已加载');
})();