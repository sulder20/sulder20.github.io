/* ============================================================
   岁窦工具箱 · 表格填入器
   ============================================================ */
(function () {
  'use strict';

  let inited = false;
  let uid = 0;
  const ROWS = [
    { label: '夯',     bg: '#c62828', fg: '#ffffff' },
    { label: '顶级',   bg: '#e8734a', fg: '#ffffff' },
    { label: '人上人', bg: '#f6c453', fg: '#5a3300' },
    { label: 'NPC',    bg: '#F9F5CF', fg: '#4a4632' },
    { label: '拉完了', bg: '#F8FBF8', fg: '#3a3f3a' }
  ];

  const cells = ROWS.map(() => []);
  let pending = [];
  let selectedPendingId = null;
  let targetRow = null;

  let table, tbody, picker, fileInput, exportBtn, clearBtn, titleInput, exportTitleChk;
  const cellInners = [];
  const cellTds = [];

  /* ---------- Toast 兼容 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[表格填入器]', msg);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    table = document.getElementById('tbl');
    if (!table) return;
    inited = true;

    tbody = table.querySelector('tbody');
    picker = document.getElementById('picker');
    fileInput = document.getElementById('fileInput');
    exportBtn = document.getElementById('exportBtn');
    titleInput = document.getElementById('titleInput');
    exportTitleChk = document.getElementById('exportTitleChk');
    clearBtn = document.getElementById('clearBtn');

    buildTable();
    bindPicker();
    bindClear();  
    bindExport();

    ROWS.forEach((_, i) => renderCell(i));
    renderPending();
    console.log('[表格填入器] 已加载');
  }

  /* ---------- 构建表格 ---------- */
  function buildTable() {
    tbody.innerHTML = '';
    cellInners.length = 0;
    cellTds.length = 0;

    ROWS.forEach((row, i) => {
      const tr = document.createElement('tr');

      const tdLabel = document.createElement('td');
      tdLabel.className = 'label';
      tdLabel.style.background = row.bg;
      tdLabel.style.color = row.fg;
      tdLabel.textContent = row.label;

      const tdCell = document.createElement('td');
      tdCell.className = 'cell';
      const inner = document.createElement('div');
      inner.className = 'cell-inner';
      tdCell.appendChild(inner);
      cellInners.push(inner);
      cellTds.push(tdCell);

      /* 放置目标 */
      inner.addEventListener('dragover', e => {
        const types = e.dataTransfer.types;
        const hasData = types && (types.includes ? types.includes('text/plain')
                                                 : Array.prototype.indexOf.call(types, 'text/plain') !== -1);
        if (!hasData && !(e.dataTransfer.files && e.dataTransfer.files.length)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        tdCell.classList.add('over');
      });
      inner.addEventListener('dragleave', e => {
        if (!inner.contains(e.relatedTarget)) tdCell.classList.remove('over');
      });
      inner.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        tdCell.classList.remove('over');
        const data = e.dataTransfer.getData('text/plain') || '';

        if (data.startsWith('pending:')) {
          const id = Number(data.slice(8));
          const item = pending.find(p => p.id === id);
          if (item) {
            cells[i].push({ id: ++uid, src: item.src });
            pending = pending.filter(p => p.id !== id);
            if (selectedPendingId === id) selectedPendingId = null;
            renderCell(i);
            renderPending();
          }
          return;
        }
        if (data.startsWith('cell:')) {
          const parts = data.split(':');
          const srcRow = Number(parts[1]);
          const imgId  = Number(parts[2]);
          if (srcRow === i) return;
          const idx = cells[srcRow].findIndex(x => x.id === imgId);
          if (idx === -1) return;
          const [item] = cells[srcRow].splice(idx, 1);
          cells[i].push(item);
          renderCell(srcRow);
          renderCell(i);
          return;
        }
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          readFiles(e.dataTransfer.files, srcs => addImagesToCell(i, srcs));
        }
      });

      /* 点击格子 */
      tdCell.addEventListener('click', e => {
        if (e.target.closest('.thumb')) return;
        if (selectedPendingId !== null) {
          const item = pending.find(p => p.id === selectedPendingId);
          if (item) {
            cells[i].push({ id: ++uid, src: item.src });
            pending = pending.filter(p => p.id !== selectedPendingId);
            selectedPendingId = null;
            renderCell(i);
            renderPending();
          }
          return;
        }
        targetRow = i;
        fileInput.click();
      });

      tr.append(tdLabel, tdCell);
      tbody.appendChild(tr);
    });
  }

  /* ---------- 渲染单元格 ---------- */
  function renderCell(i) {
    const inner = cellInners[i];
    inner.innerHTML = '';
    cells[i].forEach(item => {
      const wrap = document.createElement('div');
      wrap.className = 'thumb';
      wrap.draggable = true;
      wrap.dataset.id = item.id;

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.draggable = false;

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'del';
      del.textContent = '×';
      del.addEventListener('click', ev => {
        ev.stopPropagation();
        cells[i] = cells[i].filter(x => x.id !== item.id);
        renderCell(i);
      });

      wrap.addEventListener('dragstart', e => {
        wrap.classList.add('dragging');
        e.dataTransfer.setData('text/plain', `cell:${i}:${item.id}`);
        e.dataTransfer.effectAllowed = 'move';
      });
      wrap.addEventListener('dragend', () => {
        wrap.classList.remove('dragging');
        cellTds.forEach(td => td.classList.remove('over'));
      });

      wrap.append(img, del);
      inner.appendChild(wrap);
    });
  }

  /* ---------- 渲染下方选择器 ---------- */
  function renderPending() {
    if (!picker) return;
    picker.querySelectorAll('.thumb, .placeholder').forEach(el => el.remove());

    if (!pending.length) {
      const ph = document.createElement('div');
      ph.className = 'placeholder';
      ph.innerHTML = '<span class="plus">＋</span><span>点击选择图片（可多选），或拖到上方表格中</span>';
      picker.appendChild(ph);
      return;
    }

    pending.forEach(item => {
      const wrap = document.createElement('div');
      wrap.className = 'thumb' + (item.id === selectedPendingId ? ' selected' : '');
      wrap.draggable = true;

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.draggable = false;

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'del';
      del.textContent = '×';
      del.addEventListener('click', ev => {
        ev.stopPropagation();
        pending = pending.filter(x => x.id !== item.id);
        if (selectedPendingId === item.id) selectedPendingId = null;
        renderPending();
      });

      wrap.append(img, del);

      wrap.addEventListener('click', ev => {
        ev.stopPropagation();
        selectedPendingId = (selectedPendingId === item.id) ? null : item.id;
        renderPending();
      });

      wrap.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', 'pending:' + item.id);
        e.dataTransfer.effectAllowed = 'copyMove';
      });

      picker.appendChild(wrap);
    });
  }

  /* ---------- 文件读取 ---------- */
  function addImagesToCell(i, srcs) {
    srcs.forEach(src => cells[i].push({ id: ++uid, src }));
    renderCell(i);
  }

  function readFiles(files, cb) {
    const list = [...files].filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    const out = new Array(list.length);
    let done = 0;
    list.forEach((f, idx) => {
      const fr = new FileReader();
      fr.onload = () => {
        out[idx] = fr.result;
        if (++done === list.length) cb(out);
      };
      fr.readAsDataURL(f);
    });
  }

  /* ---------- 选择器交互 ---------- */
  function bindPicker() {
    picker.addEventListener('click', e => {
      if (e.target.closest('.thumb')) return;
      targetRow = null;
      fileInput.click();
    });

    picker.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      picker.classList.add('over');
    });
    picker.addEventListener('dragleave', e => {
      if (!picker.contains(e.relatedTarget)) picker.classList.remove('over');
    });
    picker.addEventListener('drop', e => {
      e.preventDefault();
      picker.classList.remove('over');
      const data = e.dataTransfer.getData('text/plain') || '';

      if (data.startsWith('cell:')) {
        const parts = data.split(':');
        const srcRow = Number(parts[1]);
        const imgId  = Number(parts[2]);
        const idx = cells[srcRow].findIndex(x => x.id === imgId);
        if (idx !== -1) {
          const [item] = cells[srcRow].splice(idx, 1);
          pending.push(item);
          renderCell(srcRow);
          renderPending();
        }
        return;
      }
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        readFiles(e.dataTransfer.files, srcs => {
          srcs.forEach(src => pending.push({ id: ++uid, src }));
          renderPending();
        });
      }
    });

    fileInput.addEventListener('change', () => {
      const files = [...fileInput.files];
      if (!files.length) return;
      if (targetRow !== null) {
        const row = targetRow;
        readFiles(files, srcs => addImagesToCell(row, srcs));
      } else {
        readFiles(files, srcs => {
          srcs.forEach(src => pending.push({ id: ++uid, src }));
          renderPending();
        });
      }
      fileInput.value = '';
      targetRow = null;
    });
  }

  /* ---------- 导出 ---------- */
  const TITLE_FONT_FAMILY = '"PingFang SC","Microsoft YaHei",system-ui,-apple-system,sans-serif';

  function roundRectPath(ctx, x, y, w, h, r) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  async function exportAsImage() {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (e) {}
    }
    const showTitle = exportTitleChk.checked && titleInput.value.trim() !== '';
    const titleText = titleInput.value.trim();
    const tableRect = table.getBoundingClientRect();
    const W = tableRect.width;

    const TITLE_BASE = 22;
    const TITLE_PAD_TOP = 20;
    const TITLE_PAD_BOTTOM = 22;
    let titleFontSize = TITLE_BASE;

    if (showTitle) {
      const mc = document.createElement('canvas').getContext('2d');
      mc.font = `700 ${titleFontSize}px ${TITLE_FONT_FAMILY}`;
      while (mc.measureText(titleText).width > W - 40 && titleFontSize > 12) {
        titleFontSize -= 1;
        mc.font = `700 ${titleFontSize}px ${TITLE_FONT_FAMILY}`;
      }
    }
    const titleBlock = showTitle ? (TITLE_PAD_TOP + titleFontSize * 1.4 + TITLE_PAD_BOTTOM) : 0;
    const H = tableRect.height + titleBlock;

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    if (showTitle) {
      ctx.fillStyle = '#8e0000';
      ctx.font = `700 ${titleFontSize}px ${TITLE_FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(titleText, W / 2, TITLE_PAD_TOP + titleFontSize * 0.7);
    }

    const ox = tableRect.left;
    const oy = tableRect.top - titleBlock;
    const rel = r => ({ x: r.left - ox, y: r.top - oy, w: r.width, h: r.height });

    table.querySelectorAll('td').forEach(td => {
      const p = rel(td.getBoundingClientRect());
      ctx.fillStyle = getComputedStyle(td).backgroundColor || '#ffffff';
      ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    ctx.strokeStyle = '#f2d8b8';
    ctx.lineWidth = 1;
    table.querySelectorAll('td').forEach(td => {
      const p = rel(td.getBoundingClientRect());
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, Math.max(0, p.w - 1), Math.max(0, p.h - 1));
    });

    table.querySelectorAll('td.label').forEach(td => {
      const cs = getComputedStyle(td);
      const p = rel(td.getBoundingClientRect());
      ctx.fillStyle = cs.color;
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(td.textContent.trim(), p.x + p.w / 2, p.y + p.h / 2);
    });

    const imgs = [...table.querySelectorAll('img')];
    for (const img of imgs) {
      try { if (!img.complete) await img.decode(); } catch (e) {}
      const p = rel(img.getBoundingClientRect());
      if (p.w <= 0 || p.h <= 0) continue;
      ctx.save();
      roundRectPath(ctx, p.x, p.y, p.w, p.h, 6);
      ctx.clip();
      try { ctx.drawImage(img, p.x, p.y, p.w, p.h); } catch (e) {}
      ctx.restore();
    }

    canvas.toBlob(blob => {
      if (!blob) { toast('导出失败，请重试'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      a.href = url;
      a.download = `表格填入器_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      toast('已导出图片');
    }, 'image/png');
  }

    /* ---------- 清空 ---------- */
  function bindClear() {
    if (!clearBtn) return;
    clearBtn.addEventListener('click', () => {
      const hasCellImgs = cells.some(arr => arr.length > 0);
      const hasPending = pending.length > 0;
      if (!hasCellImgs && !hasPending) {
        toast('已经是空的了');
        return;
      }
      if (!confirm('确定清空表格中的所有图片吗？\n（素材区的图片也会一起清空，标题会保留）')) return;

      // 清空所有单元格
      for (let i = 0; i < cells.length; i++) {
        cells[i] = [];
        renderCell(i);
      }
      // 清空素材区
      pending = [];
      selectedPendingId = null;
      renderPending();

      toast('已清空');
    });
  }

  function bindExport() {
    exportBtn.addEventListener('click', async () => {
      const old = exportBtn.textContent;
      exportBtn.disabled = true;
      exportBtn.textContent = '导出中…';
      try { await exportAsImage(); }
      catch (err) { alert('导出失败：' + err.message); }
      finally { exportBtn.disabled = false; exportBtn.textContent = old; }
    });
  }

  /* ---------- 暴露给 main.js ---------- */
  window.__tablefillInit = init;

  /* 页面加载后也可以自动初始化（工具箱中页面隐藏也没关系） */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();