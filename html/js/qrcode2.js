
  (function () {
    'use strict';

    // ========== 元素获取 ==========
    const tabs = document.querySelectorAll('#qrTabs .ta-subtab');
    const pages = document.querySelectorAll('[data-qr-page]');
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    const sizeInput = document.getElementById('qrSize');
    const levelSelect = document.getElementById('qrLevel');
    const marginInput = document.getElementById('qrMargin');
    const logoInput = document.getElementById('qrLogoInput');
    const logoPreview = document.getElementById('qrLogoPreview');
    const logoClearBtn = document.getElementById('qrLogoClear');
    let logoImage = null; // 缓存Logo图片对象

    // ========== 1. 标签切换逻辑 ==========
    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        // 切换标签选中状态
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        // 切换对应面板
        const target = this.dataset.qr;
        pages.forEach(page => {
          page.classList.toggle('active', page.dataset.qrPage === target);
        });
        // 切换后重绘二维码
        renderQR();
      });
    });

    // ========== 2. 获取当前激活的二维码内容 ==========
    function getPayload() {
      const activeTab = document.querySelector('#qrTabs .ta-subtab.active').dataset.qr;
      switch (activeTab) {
        case 'text':
          return document.getElementById('qrTextInput').value.trim();
        case 'url':
          let url = document.getElementById('qrUrlInput').value.trim();
          if (!url) return '';
          if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
          return url;
        case 'tel':
          const tel = document.getElementById('qrTelInput').value.trim();
          return tel ? 'tel:' + tel : '';
        case 'wifi':
          const ssid = document.getElementById('qrWifiSsid').value.trim();
          const pwd = document.getElementById('qrWifiPwd').value.trim();
          const enc = document.getElementById('qrWifiEnc').value;
          if (!ssid) return '';
          if (enc === 'nopass') return `WIFI:T:;S:${ssid};;;`;
          return `WIFI:T:${enc};S:${ssid};P:${pwd};;`;
        default:
          return '';
      }
    }

    // ========== 3. 核心渲染二维码 ==========
    function renderQR() {
      if (!canvas || !canvas.parentNode) return;

      const payload = getPayload();
      let size = parseInt(sizeInput.value) || 320;
      if (!isFinite(size) || size < 40) size = 40;   // 保底，防止画布 0 尺寸
      const level = levelSelect.value;
      let margin = parseInt(marginInput.value);
      if (!isFinite(margin) || margin < 0) margin = 2;
      if (margin > 10) margin = 10;

      // 空内容：显示占位提示，而不是留白
      if (!payload) {
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = '#fafbfc';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#b0b6c4';
        ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('输入内容后自动生成二维码', size / 2, size / 2);
        document.getElementById('qrPreviewHint').textContent = '输入内容后自动生成';
        return;
      }

      try {
        const qr = qrcode(0, level);
        qr.addData(payload);
        qr.make();

        const moduleCount = qr.getModuleCount();
        // 关键保底：tileSize 至少 1
        let tileSize = Math.floor(size / (moduleCount + margin * 2));
        if (!isFinite(tileSize) || tileSize < 1) tileSize = 1;
        const totalSize = tileSize * (moduleCount + margin * 2);
        const offset = tileSize * margin;

        canvas.width = totalSize;
        canvas.height = totalSize;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, totalSize, totalSize);

        ctx.fillStyle = '#1c1f23';
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(offset + col * tileSize, offset + row * tileSize, tileSize, tileSize);
            }
          }
        }

        if (logoImage && logoImage.complete) {
          const logoSize = Math.floor(totalSize * 0.2);
          const logoX = (totalSize - logoSize) / 2;
          const logoY = (totalSize - logoSize) / 2;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        }

        document.getElementById('qrPreviewHint').textContent = '生成成功';
      } catch (e) {
        console.error('[二维码] 渲染失败：', e);
        document.getElementById('qrPreviewHint').textContent = '生成失败：' + (e && e.message ? e.message : e);
      }
    }

    // ========== 4. Logo上传处理 ==========
    logoInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = new Image();
        img.onload = function () {
          logoImage = img;
          logoPreview.innerHTML = '';
          logoPreview.appendChild(img.cloneNode());
          // 有Logo自动切换到H纠错
          if (levelSelect.value !== 'H') {
            levelSelect.value = 'H';
          }
          renderQR();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    // 清除Logo
    logoClearBtn.addEventListener('click', function () {
      logoImage = null;
      logoPreview.innerHTML = '未选择';
      logoInput.value = '';
      renderQR();
    });

    // ========== 5. 导出功能 ==========
    // 导出PNG
    document.getElementById('qrDownloadPng').addEventListener('click', function () {
      if (!getPayload()) {
        alert('请先输入二维码内容');
        return;
      }
      try {
        const link = document.createElement('a');
        link.download = '二维码.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        if (typeof showToast === 'function') showToast('导出失败，建议改用 SVG 格式');
        else alert('导出失败，建议改用 SVG 格式');
      }
    });

    // 导出SVG
    document.getElementById('qrDownloadSvg').addEventListener('click', function () {
      const payload = getPayload();
      if (!payload) {
        if (typeof showToast === 'function') showToast('请先输入二维码内容');
        else alert('请先输入二维码内容');
        return;
      }
      const level = levelSelect.value;
      const margin = parseInt(marginInput.value) || 2;
      const qr = qrcode(0, level);
      qr.addData(payload);
      qr.make();
      const svgStr = qr.createSvgTag({ margin: margin });

      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = '二维码.svg';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    });

    // 复制编码内容
    document.getElementById('qrCopyPayload').addEventListener('click', function () {
      const payload = getPayload();
      if (!payload) {
        alert('请先输入二维码内容');
        return;
      }
      navigator.clipboard.writeText(payload).then(() => {
        if (typeof showToast === 'function') showToast('已复制编码内容');
        else alert('已复制到剪贴板');
      }).catch(() => {
        if (typeof showToast === 'function') showToast('复制失败，请手动复制');
        else alert('复制失败，请手动复制');
      });
    });

    // ========== 6. 输入事件绑定：实时更新 ==========
    const inputEls = [
      'qrTextInput', 'qrUrlInput', 'qrTelInput',
      'qrWifiSsid', 'qrWifiPwd', 'qrWifiEnc',
      'qrSize', 'qrLevel', 'qrMargin'
    ];
    inputEls.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', renderQR);
      if (el) el.addEventListener('change', renderQR);
    });

    // ========== 7. 初始化（等库和 DOM 都就绪再渲染） ==========
    function qrInit(){
      if (typeof window.qrcode === 'undefined'){
        document.getElementById('qrPreviewHint').textContent =
          '二维码库加载失败，请检查网络后刷新页面';
        return;
      }
      document.getElementById('qrTextInput').value = '岁窦工具箱 · 铂金版';
      renderQR();
      console.log('[二维码] 模块已加载');
    }

    if (typeof window.qrcode === 'undefined'){
      window.addEventListener('load', qrInit);
    } else {
      qrInit();
    }

    // 把渲染函数暴露到全局，供主脚本 go('qrcode') 调用
    window.__qrRender = renderQR;
  })();