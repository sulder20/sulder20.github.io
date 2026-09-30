 (function () {
    'use strict';

    const fileInput = document.getElementById('compressFileInput');
    const qualityInput = document.getElementById('compressQuality');
    const qualityVal = document.getElementById('compressQualityVal');
    const targetSizeInput = document.getElementById('compressTargetSize');
    const formatSelect = document.getElementById('compressFormat');
    const resetBtn = document.getElementById('compressResetBtn');
    const downloadBtn = document.getElementById('compressDownloadBtn');

    const originalBox = document.getElementById('originalBox');
    const compressedBox = document.getElementById('compressedBox');
    const originalSizeEl = document.getElementById('originalSize');
    const compressedSizeEl = document.getElementById('compressedSize');
    const originalDimEl = document.getElementById('originalDim');
    const compressedDimEl = document.getElementById('compressedDim');
    const originalFormatEl = document.getElementById('originalFormat');
    const compressRateEl = document.getElementById('compressRate');

    let originalFile = null;
    let originalImage = null;
    let compressedBlob = null;
    let compressedUrl = null;

    // 格式化文件大小
    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }

    // 质量滑块实时显示
    qualityInput.addEventListener('input', function () {
      qualityVal.textContent = this.value + '%';
      if (originalImage) doCompress();
    });

    // 格式变更重新压缩
    formatSelect.addEventListener('change', function () {
      if (originalImage) doCompress();
    });

    // 目标大小输入变更
    targetSizeInput.addEventListener('change', function () {
      if (!originalImage) return;
      const target = parseInt(this.value);
      if (isNaN(target) || target <= 0) {
        doCompress();
        return;
      }
      compressToTarget(target * 1024);
    });

    // 选择文件
    fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      originalFile = file;
      loadImage(file);
    });

    // 加载图片
    function loadImage(file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = new Image();
        img.onload = function () {
          originalImage = img;
          // 显示原图
          originalBox.innerHTML = '';
          originalBox.appendChild(img.cloneNode());
          originalSizeEl.textContent = formatSize(file.size);
          originalDimEl.textContent = img.naturalWidth + ' × ' + img.naturalHeight;
          originalFormatEl.textContent = file.type || '未知';
          // 执行压缩
          doCompress();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }

    // 核心压缩函数
    function doCompress() {
      if (!originalImage) return;
      const quality = parseInt(qualityInput.value) / 100;
      const format = formatSelect.value;
      const maxSize = 2000; // 最大边长限制，避免画布过大

      let w = originalImage.naturalWidth;
      let h = originalImage.naturalHeight;

      // 超大图等比缩小最大边长到2000
      if (w > maxSize || h > maxSize) {
        if (w >= h) {
          h = Math.round(h * maxSize / w);
          w = maxSize;
        } else {
          w = Math.round(w * maxSize / h);
          h = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0, w, h);

      canvas.toBlob(function (blob) {
        if (!blob) {
          alert('压缩失败，该格式可能不被当前浏览器支持');
          return;
        }
        compressedBlob = blob;
        // 释放旧url
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        compressedUrl = URL.createObjectURL(blob);

        // 显示压缩后
        compressedBox.innerHTML = '';
        const img = document.createElement('img');
        img.src = compressedUrl;
        compressedBox.appendChild(img);

        // 更新信息
        compressedSizeEl.textContent = formatSize(blob.size);
        compressedDimEl.textContent = w + ' × ' + h;

        // 压缩率
        const rate = blob.size / originalFile.size;
        const ratePercent = (rate * 100).toFixed(1) + '%';
        compressRateEl.textContent = '体积 ' + ratePercent;
        compressRateEl.className = 'compress-rate';
        if (rate < 0.5) compressRateEl.classList.add('small');
        if (rate > 0.9) compressRateEl.classList.add('warn');

        downloadBtn.disabled = false;
      }, format, quality);
    }

    // 逼近目标文件大小（二分法）
    function compressToTarget(targetBytes) {
      if (!originalImage) return;
      let minQ = 1, maxQ = 100;
      let bestQ = 80;
      const format = formatSelect.value;
      const maxSize = 2000;
      let w = originalImage.naturalWidth;
      let h = originalImage.naturalHeight;
      if (w > maxSize || h > maxSize) {
        if (w >= h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0, w, h);

      // 迭代10次逼近
      let count = 0;
      function test(q, callback) {
        canvas.toBlob(function (blob) {
          callback(blob ? blob.size : Infinity);
        }, format, q / 100);
      }

      function iterate() {
        if (count > 10) {
          qualityInput.value = bestQ;
          qualityVal.textContent = bestQ + '%';
          doCompress();
          return;
        }
        count++;
        const mid = Math.round((minQ + maxQ) / 2);
        test(mid, function (size) {
          if (size <= targetBytes) {
            bestQ = mid;
            minQ = mid + 1;
          } else {
            maxQ = mid - 1;
          }
          iterate();
        });
      }
      iterate();
    }

    // 下载
    downloadBtn.addEventListener('click', function () {
      if (!compressedBlob) return;
      const a = document.createElement('a');
      a.href = compressedUrl;
      const baseName = originalFile.name.replace(/\.[^.]+$/, '');
      const ext = formatSelect.value === 'image/jpeg' ? '.jpg'
               : formatSelect.value === 'image/webp' ? '.webp' : '.png';
      a.download = baseName + '_压缩' + ext;
      a.click();
    });

    // 重置
    resetBtn.addEventListener('click', function () {
      qualityInput.value = 80;
      qualityVal.textContent = '80%';
      targetSizeInput.value = '';
      formatSelect.value = 'image/jpeg';
      if (originalImage) doCompress();
    });

    console.log('[图片压缩] 模块已加载');
  })();