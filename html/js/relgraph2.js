/* ============================================================
   岁窦工具箱 · 角色关系图 (V5.0 稳定版 · 淡蓝主题)
   ============================================================ */
(function () {
  'use strict';

  var inited = false;
  var KEY = 'suidou-relgraph-v1';

  var canvas, ctx, stageEl, emptyEl, hintEl;
  var nodePanel, edgePanel;
  var npName, npRole, npColor;
  var epLabel;

  var cw = 0, ch = 0, dpr = 1;

  // V5.0 淡蓝色系调色板（替换原有蜂蜜黄）
  var COLORS = [
    { bg:'#4a90e2', fg:'#ffffff' },  // 主蓝
    { bg:'#2c5f8a', fg:'#ffffff' },  // 深蓝
    { bg:'#7bb8e8', fg:'#1a2e42' },  // 浅蓝
    { bg:'#5fa8a8', fg:'#ffffff' },  // 青绿
    { bg:'#6d5a8c', fg:'#ffffff' },  // 烟紫
    { bg:'#8fb59a', fg:'#ffffff' },  // 苔绿
    { bg:'#c17878', fg:'#ffffff' },  // 陶土红（保留一点红用于区分）
    { bg:'#8ba6c0', fg:'#ffffff' }   // 雾蓝
  ];

  var FONT_NAME = '700 15px "PingFang SC","Microsoft YaHei",sans-serif';
  var FONT_ROLE = '400 11.5px "PingFang SC","Microsoft YaHei",sans-serif';
  var FONT_EDGE = '600 12px "PingFang SC","Microsoft YaHei",sans-serif';

  var measureCanvas = document.createElement('canvas');
  var measureCtx = measureCanvas.getContext('2d');

  var state = {
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
    drag: null,
    mode: 'select',
    connectFrom: null,
    pointer: { x: 0, y: 0 }
  };

  /* ---------- 工具 ---------- */
  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[角色关系图]', msg);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function measureText(text, font) {
    measureCtx.font = font;
    return measureCtx.measureText(text || '').width;
  }

  function ellipsis(text, maxW) {
    text = String(text || '');
    if (measureText(text, FONT_NAME) <= maxW) return text;
    var t = text;
    while (t.length > 1 && measureText(t + '…', FONT_NAME) > maxW) t = t.slice(0, -1);
    return t + '…';
  }

  function roundRect(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function uid(prefix) {
    return (prefix || 'n') + Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36);
  }

  /* ---------- 存储 ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data && Array.isArray(data.nodes)) state.nodes = data.nodes;
      if (data && Array.isArray(data.edges)) state.edges = data.edges;
      state.nodes.forEach(function (n) {
        if (!n._w) n._w = nodeWidth(n);
        if (!n._h) n._h = nodeHeight(n);
      });
    } catch (e) {
      state.nodes = [];
      state.edges = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        nodes: state.nodes,
        edges: state.edges
      }));
    } catch (e) {}
  }

  /* ---------- 尺寸与节点 ---------- */
  function nodeWidth(n) {
    var w1 = measureText(n.name, FONT_NAME);
    var w2 = n.role ? measureText(n.role, FONT_ROLE) : 0;
    return Math.max(90, Math.max(w1, w2) + 34);
  }

  function nodeHeight(n) {
    return n.role ? 56 : 44;
  }

  function refreshNodeSize(n) {
    n._w = nodeWidth(n);
    n._h = nodeHeight(n);
  }

  function findNode(id) {
    for (var i = 0; i < state.nodes.length; i++) {
      if (state.nodes[i].id === id) return state.nodes[i];
    }
    return null;
  }

  function findEdge(id) {
    for (var i = 0; i < state.edges.length; i++) {
      if (state.edges[i].id === id) return state.edges[i];
    }
    return null;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    var page = document.getElementById('page-relgraph');
    if (!page) return;

    if (inited) {
      requestAnimationFrame(function () {
        resize();
        draw();
      });
      return;
    }

    canvas = document.getElementById('rgCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    stageEl = document.getElementById('rgStage');
    emptyEl = document.getElementById('rgEmpty');
    hintEl  = document.getElementById('rgHint');

    nodePanel = document.getElementById('rgNodePanel');
    edgePanel = document.getElementById('rgEdgePanel');
    npName  = document.getElementById('rgNpName');
    npRole  = document.getElementById('rgNpRole');
    npColor = document.getElementById('rgNpColor');
    epLabel = document.getElementById('rgEpLabel');

    inited = true;
    load();
    bindEvents();

    requestAnimationFrame(function () {
      resize();
      draw();
    });

    window.addEventListener('resize', function () {
      clearTimeout(window.__rgResizeTimer);
      window.__rgResizeTimer = setTimeout(resize, 160);
    });

    if (typeof ResizeObserver !== 'undefined' && stageEl) {
      var ro = new ResizeObserver(function () {
        clearTimeout(window.__rgResizeTimer);
        window.__rgResizeTimer = setTimeout(resize, 80);
      });
      ro.observe(stageEl);
    }
  }

  /* ---------- 画布尺寸 ---------- */
  function resize() {
    if (!canvas || !stageEl) return;
    var rect = stageEl.getBoundingClientRect();

    if (rect.width < 10 || rect.height < 10) return;

    cw = Math.max(200, rect.width);
    ch = Math.max(200, rect.height);
    dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.nodes.forEach(clampNode);
    draw();
  }

  function clampNode(n) {
    var halfW = n._w / 2 + 10;
    var halfH = n._h / 2 + 10;
    n.x = Math.max(halfW, Math.min(cw - halfW, n.x));
    n.y = Math.max(halfH, Math.min(ch - halfH, n.y));
  }

  /* ---------- 绘制 ---------- */
  function draw() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    // 背景 (V5.0 极浅蓝)
    ctx.fillStyle = '#f5f9fc';
    ctx.fillRect(0, 0, cw, ch);

    drawGrid();

    state.edges.forEach(drawEdge);

    if (state.mode === 'connect' && state.connectFrom) {
      var from = findNode(state.connectFrom);
      if (from) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(state.pointer.x, state.pointer.y);
        // 临时连线颜色：淡蓝
        ctx.strokeStyle = 'rgba(74,144,226,.75)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.restore();
      }
    }

    state.nodes.forEach(drawNode);

    if (emptyEl) {
      emptyEl.style.display = state.nodes.length ? 'none' : 'flex';
    }
  }

  function drawGrid() {
    // 网格点颜色：淡蓝
    ctx.fillStyle = 'rgba(74,144,226,.18)';
    var step = 32;
    for (var x = step / 2; x < cw; x += step) {
      for (var y = step / 2; y < ch; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function edgeAnchor(from, to) {
    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var w = from._w / 2 + 4;
    var h = from._h / 2 + 4;
    var sx = dx !== 0 ? w / Math.abs(dx) : Infinity;
    var sy = dy !== 0 ? h / Math.abs(dy) : Infinity;
    var s = Math.min(sx, sy);
    if (!isFinite(s)) s = 0;
    return { x: from.x + dx * s, y: from.y + dy * s };
  }

  function drawEdge(e) {
    var from = findNode(e.from);
    var to   = findNode(e.to);
    if (!from || !to) return;

    var p1 = edgeAnchor(from, to);
    var p2 = edgeAnchor(to, from);
    var active = state.selectedEdge === e.id;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    // 连线颜色：主蓝/淡蓝
    ctx.strokeStyle = active ? '#4a90e2' : 'rgba(74,144,226,.42)';
    ctx.lineWidth = active ? 3 : 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    if (e.label) {
      var mx = (p1.x + p2.x) / 2;
      var my = (p1.y + p2.y) / 2;
      ctx.save();
      ctx.font = FONT_EDGE;
      var tw = ctx.measureText(e.label).width;
      var bw = tw + 18;
      var bh = 22;
      // 标签底色
      ctx.fillStyle = '#f5f9fc';
      roundRect(ctx, mx - bw / 2, my - bh / 2, bw, bh, 8);
      ctx.fill();
      // 标签边框
      ctx.strokeStyle = active ? '#4a90e2' : 'rgba(74,144,226,.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // 标签文字：深蓝
      ctx.fillStyle = '#2c5f8a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.label, mx, my);
      ctx.restore();
    }
  }

  function drawNode(n) {
    var w = n._w, h = n._h;
    var x = n.x - w / 2;
    var y = n.y - h / 2;
    var c = COLORS[(n.colorIdx || 0) % COLORS.length];

    // 阴影：蓝色阴影
    ctx.save();
    ctx.shadowColor = 'rgba(74,144,226,.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = c.bg;
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 12);
    ctx.stroke();

    // 选中高亮：蓝色虚线
    if (state.selectedNode === n.id) {
      ctx.save();
      roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 15);
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();
    }
    // 连线模式起点高亮：明亮蓝
    if (state.mode === 'connect' && state.connectFrom === n.id) {
      ctx.save();
      roundRect(ctx, x - 5, y - 5, w + 10, h + 10, 16);
      ctx.strokeStyle = '#5b9bd5';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = c.fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (n.role) {
      ctx.font = FONT_NAME;
      ctx.fillText(ellipsis(n.name, w - 22), n.x, n.y - 9);
      ctx.font = FONT_ROLE;
      ctx.globalAlpha = 0.85;
      ctx.fillText(ellipsis(n.role, w - 22), n.x, n.y + 11);
      ctx.globalAlpha = 1;
    } else {
      ctx.font = FONT_NAME;
      ctx.fillText(ellipsis(n.name, w - 22), n.x, n.y);
    }
    ctx.restore();
  }

  /* ---------- 坐标 ---------- */
  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function hitNode(pos) {
    for (var i = state.nodes.length - 1; i >= 0; i--) {
      var n = state.nodes[i];
      var hw = n._w / 2;
      var hh = n._h / 2;
      if (pos.x >= n.x - hw && pos.x <= n.x + hw &&
          pos.y >= n.y - hh && pos.y <= n.y + hh) {
        return n;
      }
    }
    return null;
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - x1, py - y1);
    var t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    var ex = x1 + t * dx, ey = y1 + t * dy;
    return Math.hypot(px - ex, py - ey);
  }

  function hitEdge(pos) {
    for (var i = state.edges.length - 1; i >= 0; i--) {
      var e = state.edges[i];
      var a = findNode(e.from), b = findNode(e.to);
      if (!a || !b) continue;
      var p1 = edgeAnchor(a, b);
      var p2 = edgeAnchor(b, a);
      if (distToSegment(pos.x, pos.y, p1.x, p1.y, p2.x, p2.y) < 10) return e;
    }
    return null;
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', function () {
      if (!state.drag) draw();
    });

    document.getElementById('rgAdd').addEventListener('click', function () {
      var name = prompt('角色名称：');
      if (name == null) return;
      name = name.trim();
      if (!name) return;
      var role = prompt('身份 / 简介（可留空）：') || '';
      addNode(name, role.trim());
    });

    document.getElementById('rgConnectMode').addEventListener('click', toggleConnectMode);
    document.getElementById('rgAutoLayout').addEventListener('click', autoLayout);
    document.getElementById('rgClear').addEventListener('click', clearAll);
    document.getElementById('rgExport').addEventListener('click', exportPng);

    document.getElementById('rgNpClose').addEventListener('click', hideNodePanel);
    document.getElementById('rgNpSave').addEventListener('click', saveNodeEdit);
    document.getElementById('rgNpDelete').addEventListener('click', deleteSelectedNode);
    document.getElementById('rgNpName').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveNodeEdit(); }
    });
    document.getElementById('rgNpRole').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveNodeEdit(); }
    });

    document.getElementById('rgEpClose').addEventListener('click', hideEdgePanel);
    document.getElementById('rgEpSave').addEventListener('click', saveEdgeEdit);
    document.getElementById('rgEpDelete').addEventListener('click', deleteSelectedEdge);
    document.getElementById('rgEpLabel').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveEdgeEdit(); }
    });
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);

    var pos = getPos(e);
    var n = hitNode(pos);

    if (n) {
      if (state.mode === 'connect') {
        if (!state.connectFrom) {
          state.connectFrom = n.id;
          state.pointer = pos;
          draw();
        } else if (state.connectFrom === n.id) {
          state.connectFrom = null;
          draw();
        } else {
          var fromId = state.connectFrom;
          state.connectFrom = null;
          var label = prompt('关系描述（可留空）：', '');
          if (label === null) { draw(); return; }
          addEdge(fromId, n.id, label.trim());
        }
        return;
      }

      state.selectedNode = n.id;
      state.selectedEdge = null;
      showNodePanel(n);
      hideEdgePanel();
      state.drag = {
        id: n.id,
        dx: pos.x - n.x,
        dy: pos.y - n.y,
        moved: false
      };
      draw();
      return;
    }

    var ed = hitEdge(pos);
    if (ed) {
      state.selectedEdge = ed.id;
      state.selectedNode = null;
      showEdgePanel(ed);
      hideNodePanel();
      draw();
      return;
    }

    state.selectedNode = null;
    state.selectedEdge = null;
    state.connectFrom = null;
    hideNodePanel();
    hideEdgePanel();
    draw();
  }

  function onPointerMove(e) {
    var pos = getPos(e);

    if (state.drag) {
      var n = findNode(state.drag.id);
      if (!n) return;
      n.x = pos.x - state.drag.dx;
      n.y = pos.y - state.drag.dy;
      clampNode(n);
      state.drag.moved = true;
      draw();
      return;
    }

    if (state.mode === 'connect' && state.connectFrom) {
      state.pointer = pos;
      draw();
    }
  }

  function onPointerUp() {
    if (state.drag) {
      state.drag = null;
      save();
    }
  }

  /* ---------- 节点增删改 ---------- */
  function addNode(name, role) {
    var w = Math.max(200, cw);
    var h = Math.max(200, ch);
    var x, y, tries = 0;

    do {
      x = 80 + Math.random() * (w - 160);
      y = 70 + Math.random() * (h - 140);
      tries++;
    } while (tries < 30 && overlaps(x, y));

    var n = {
      id: uid('n'),
      name: name,
      role: role || '',
      x: x,
      y: y,
      colorIdx: state.nodes.length % COLORS.length
    };
    refreshNodeSize(n);
    clampNode(n);
    state.nodes.push(n);
    state.selectedNode = n.id;
    state.selectedEdge = null;

    save();
    draw();
    showNodePanel(n);
    hideEdgePanel();
    toast('已添加角色：' + name);
  }

  function overlaps(x, y) {
    for (var i = 0; i < state.nodes.length; i++) {
      var n = state.nodes[i];
      var dx = n.x - x, dy = n.y - y;
      if (Math.hypot(dx, dy) < Math.max(n._w, n._h) / 2 + 70) return true;
    }
    return false;
  }

  function saveNodeEdit() {
    var n = findNode(state.selectedNode);
    if (!n) return;
    var name = npName.value.trim();
    if (!name) { toast('请填写角色名称'); npName.focus(); return; }
    n.name = name;
    n.role = npRole.value.trim();
    n.colorIdx = parseInt(npColor.value, 10) || 0;
    refreshNodeSize(n);
    clampNode(n);
    save();
    draw();
    toast('已保存');
  }

  function deleteSelectedNode() {
    var n = findNode(state.selectedNode);
    if (!n) return;
    if (!confirm('删除角色「' + n.name + '」及其全部关系？')) return;
    state.nodes = state.nodes.filter(function (x) { return x.id !== n.id; });
    state.edges = state.edges.filter(function (e) {
      return e.from !== n.id && e.to !== n.id;
    });
    state.selectedNode = null;
    save();
    hideNodePanel();
    draw();
    toast('已删除');
  }

  function showNodePanel(n) {
    if (!nodePanel) return;
    npName.value  = n.name || '';
    npRole.value  = n.role || '';
    npColor.value = String(n.colorIdx || 0);
    nodePanel.style.display = '';
    edgePanel.style.display = 'none';
  }

  function hideNodePanel() {
    if (nodePanel) nodePanel.style.display = 'none';
  }

  /* ---------- 边增删改 ---------- */
  function addEdge(fromId, toId, label) {
    if (fromId === toId) return;
    var exist = state.edges.find(function (e) {
      return (e.from === fromId && e.to === toId) ||
             (e.from === toId   && e.to === fromId);
    });
    if (exist) {
      if (label && label !== exist.label) {
        exist.label = label;
        save();
        draw();
        toast('已更新关系');
      } else {
        toast('这两个角色已存在关系');
      }
      return;
    }
    var e = {
      id: uid('e'),
      from: fromId,
      to: toId,
      label: label || ''
    };
    state.edges.push(e);
    save();
    draw();
    toast('已建立关系');
  }

  function saveEdgeEdit() {
    var e = findEdge(state.selectedEdge);
    if (!e) return;
    e.label = epLabel.value.trim();
    save();
    draw();
    toast('已保存');
  }

  function deleteSelectedEdge() {
    var e = findEdge(state.selectedEdge);
    if (!e) return;
    if (!confirm('确定删除这条关系吗？')) return;
    state.edges = state.edges.filter(function (x) { return x.id !== e.id; });
    state.selectedEdge = null;
    save();
    hideEdgePanel();
    draw();
    toast('已删除关系');
  }

  function showEdgePanel(e) {
    if (!edgePanel) return;
    epLabel.value = e.label || '';
    edgePanel.style.display = '';
    if (nodePanel) nodePanel.style.display = 'none';
  }

  function hideEdgePanel() {
    if (edgePanel) edgePanel.style.display = 'none';
  }

  /* ---------- 模式切换 ---------- */
  function toggleConnectMode() {
    var btn = document.getElementById('rgConnectMode');
    if (state.mode === 'connect') {
      state.mode = 'select';
      state.connectFrom = null;
      btn.classList.remove('active');
      btn.textContent = '🔗 连线模式';
      stageEl.classList.remove('connect-mode');
      hintEl.textContent = '点击「添加角色」创建第一个角色；拖拽可移动位置；切换到「连线模式」后依次点击两个角色即可建立关系。';
    } else {
      state.mode = 'connect';
      state.connectFrom = null;
      state.drag = null;
      btn.classList.add('active');
      btn.textContent = '✓ 退出连线';
      stageEl.classList.add('connect-mode');
      hintEl.textContent = '连线模式已开启：依次点击两个角色即可建立关系；再次点击同一角色可取消。';
    }
    draw();
  }

  /* ---------- 自动布局 ---------- */
  function autoLayout() {
    var n = state.nodes.length;
    if (!n) { toast('还没有角色'); return; }
    if (n === 1) {
      state.nodes[0].x = cw / 2;
      state.nodes[0].y = ch / 2;
    } else {
      var cx = cw / 2;
      var cy = ch / 2;
      var R = Math.max(80, Math.min(cw, ch) / 2 - 90);
      state.nodes.forEach(function (node, i) {
        var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        node.x = cx + Math.cos(ang) * R;
        node.y = cy + Math.sin(ang) * R;
        clampNode(node);
      });
    }
    save();
    draw();
    toast('已自动布局');
  }

  /* ---------- 清空 ---------- */
  function clearAll() {
    if (!state.nodes.length) return;
    if (!confirm('确定清空全部角色与关系吗？此操作不可恢复。')) return;
    state.nodes = [];
    state.edges = [];
    state.selectedNode = null;
    state.selectedEdge = null;
    state.connectFrom = null;
    state.drag = null;
    save();
    hideNodePanel();
    hideEdgePanel();
    draw();
    toast('已清空');
  }

  /* ---------- 导出 PNG ---------- */
  function exportPng() {
    if (!state.nodes.length) { toast('还没有角色'); return; }

    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    state.nodes.forEach(function (n) {
      minX = Math.min(minX, n.x - n._w / 2);
      minY = Math.min(minY, n.y - n._h / 2);
      maxX = Math.max(maxX, n.x + n._w / 2);
      maxY = Math.max(maxY, n.y + n._h / 2);
    });

    var pad = 60;
    var W = Math.max(320, maxX - minX + pad * 2);
    var H = Math.max(240, maxY - minY + pad * 2);
    var scale = 2;

    var off = document.createElement('canvas');
    off.width = Math.round(W * scale);
    off.height = Math.round(H * scale);
    var octx = off.getContext('2d');
    octx.scale(scale, scale);

    // 背景
    octx.fillStyle = '#f5f9fc';
    octx.fillRect(0, 0, W, H);

    // 淡蓝网格
    octx.fillStyle = 'rgba(74,144,226,.15)';
    var step = 32;
    for (var x = step / 2; x < W; x += step) {
      for (var y = step / 2; y < H; y += step) {
        octx.beginPath();
        octx.arc(x, y, 1, 0, Math.PI * 2);
        octx.fill();
      }
    }

    octx.translate(-minX + pad, -minY + pad);

    var oldCtx = ctx;
    var oldSelNode = state.selectedNode;
    var oldSelEdge = state.selectedEdge;
    var oldConnect = state.connectFrom;
    var oldMode = state.mode;

    ctx = octx;
    state.selectedNode = null;
    state.selectedEdge = null;
    state.connectFrom = null;
    state.mode = 'select';

    state.edges.forEach(drawEdge);
    state.nodes.forEach(drawNode);

    ctx = oldCtx;
    state.selectedNode = oldSelNode;
    state.selectedEdge = oldSelEdge;
    state.connectFrom = oldConnect;
    state.mode = oldMode;

    // 右下角水印：灰蓝色
    octx.save();
    octx.font = '500 12px "PingFang SC","Microsoft YaHei",sans-serif';
    octx.fillStyle = 'rgba(107,130,153,.6)';
    octx.textAlign = 'right';
    octx.textBaseline = 'bottom';
    octx.fillText('岁窦工具箱 · 角色关系图', W - pad, H - 18);
    octx.restore();

    var d = new Date();
    var fileName = '角色关系图_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
                   '_' + pad(d.getHours()) + pad(d.getMinutes()) + '.png';

    if (off.toBlob) {
      off.toBlob(function (blob) {
        if (!blob) { toast('导出失败，请重试'); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        toast('已导出 PNG');
      }, 'image/png');
    } else {
      var a2 = document.createElement('a');
      a2.href = off.toDataURL('image/png');
      a2.download = fileName;
      document.body.appendChild(a2);
      a2.click();
      document.body.removeChild(a2);
      toast('已导出 PNG');
    }
  }

  window.__relgraphInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();