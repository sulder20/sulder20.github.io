/* ============================================================
   细胞结构速查 · 岁窦工具箱 V4.0
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-cellstructure');
  if (!page) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  /* ---------- 通用结构（三类细胞共有） ---------- */
  var COMMON = {
    membrane: { name:'细胞膜', tag:'边界', desc:'由磷脂双分子层和蛋白质组成，控制物质进出细胞，进行细胞间的信息交流。具有选择透过性。', extra:{ '成分':'磷脂、蛋白质、少量糖类', '功能':'控制物质进出、信息传递、保护细胞', '特点':'流动镶嵌模型' } },
    cytoplasm: { name:'细胞质', tag:'基质', desc:'细胞膜以内、细胞核以外的部分，包括细胞质基质和各种细胞器。是多种代谢反应的场所。', extra:{ '成分':'水、无机盐、脂质、糖类、氨基酸、核苷酸、多种酶', '功能':'代谢反应场所、物质运输', '特点':'活细胞的细胞质处于不断流动状态' } },
    nucleus: { name:'细胞核', tag:'控制中心', desc:'由核膜、核仁、染色质组成，是遗传物质 DNA 的主要存在场所，是细胞代谢和遗传的控制中心。', extra:{ '成分':'核膜、核仁、染色质、核孔', '功能':'储存遗传信息、控制细胞代谢和遗传', '特点':'核孔是大分子进出通道' } },
    mitochondria: { name:'线粒体', tag:'动力车间', desc:'有双层膜结构，内膜向内折叠形成嵴。是细胞进行有氧呼吸的主要场所，为细胞提供大量能量（ATP）。', extra:{ '结构':'双层膜、内膜折叠成嵴', '功能':'有氧呼吸主要场所、产生 ATP', '特点':'含少量 DNA 和 RNA，可半自主复制' } },
    ribosome: { name:'核糖体', tag:'生产蛋白质', desc:'无膜结构，由 rRNA 和蛋白质组成。是蛋白质合成的场所，被称为「生产蛋白质的机器」。', extra:{ '结构':'无膜，由大小两个亚基组成', '功能':'蛋白质合成场所', '分布':'游离在细胞质基质或附着在内质网上' } },
    er: { name:'内质网', tag:'加工车间', desc:'由膜连成的网状结构，与核膜、细胞膜相连。分为粗面内质网（附着核糖体）和光面内质网。', extra:{ '结构':'单层膜、网状', '功能':'蛋白质加工、脂质合成、物质运输通道', '分类':'粗面内质网、光面内质网' } },
    golgi: { name:'高尔基体', tag:'包装车间', desc:'由囊泡和小管组成。对来自内质网的蛋白质进行加工、分类和包装，再运到细胞外或细胞内其他部位。', extra:{ '结构':'单层膜、扁平囊泡堆叠', '功能':'蛋白质加工分类和包装', '植物中作用':'与细胞壁形成有关' } },
    lysosome: { name:'溶酶体', tag:'消化车间', desc:'单层膜包被的小泡，含多种水解酶，能分解衰老、损伤的细胞器和侵入细胞的病菌。', extra:{ '结构':'单层膜小泡', '功能':'分解衰老细胞器、消灭入侵病菌', '别称':'消化车间' } },
    centrosome: { name:'中心体', tag:'动物特有', desc:'由两个互相垂直的中心粒及周围物质组成，无膜。与细胞的有丝分裂有关。', extra:{ '结构':'两个互相垂直的中心粒', '功能':'与有丝分裂纺锤体形成有关', '分布':'动物细胞和低等植物细胞' } }
  };

  /* ---------- 植物特有 ---------- */
  var PLANT_ONLY = {
    cellwall: { name:'细胞壁', tag:'植物特有', desc:'位于细胞膜外，主要成分是纤维素和果胶。对细胞有支持和保护作用。', extra:{ '成分':'纤维素和果胶', '功能':'支持和保护细胞', '特点':'全透性，不控制物质进出' } },
    chloroplast: { name:'叶绿体', tag:'光合作用', desc:'有双层膜，内部有类囊体堆叠形成的基粒和基质。是绿色植物进行光合作用的场所。', extra:{ '结构':'双层膜、基粒、基质', '功能':'光合作用场所、制造有机物', '特点':'含叶绿素、叶黄素、胡萝卜素等色素' } },
    vacuole: { name:'液泡', tag:'植物特有', desc:'成熟植物细胞中有一个大液泡，内含细胞液，可含有糖类、无机盐、色素等。调节植物细胞内环境，保持细胞坚挺。', extra:{ '结构':'单层膜', '功能':'储存物质、调节渗透压、维持细胞形态', '特点':'成熟植物细胞中央有一个大液泡' } }
  };

  /* ---------- 原核特有 ---------- */
  var PROKARYOTE = {
    wallP: { name:'细胞壁', tag:'原核特有', desc:'主要成分是肽聚糖（细菌），对细胞有支持和保护作用。', extra:{ '成分':'肽聚糖（细菌）', '功能':'支持和保护', '特点':'与植物细胞壁成分不同' } },
    nucleoid: { name:'拟核', tag:'原核特有', desc:'没有核膜包被，是 DNA 集中的区域。原核细胞的遗传物质是一条环状 DNA 分子。', extra:{ '结构':'无核膜包被的 DNA 区域', '功能':'储存遗传信息', '特点':'与真核细胞最主要的区别' } },
    plasmid: { name:'质粒', tag:'原核特有', desc:'独立于拟核 DNA 之外的小型环状 DNA 分子，常携带抗性基因等，是基因工程中常用的运载体。', extra:{ '结构':'小型环状 DNA', '功能':'携带额外遗传信息', '应用':'基因工程运载体' } },
    capsule: { name:'荚膜', tag:'部分细菌', desc:'某些细菌细胞壁外的一层黏液性物质，有保护作用，与致病性有关。', extra:{ '成分':'多糖或多肽', '功能':'保护、抗吞噬', '分布':'部分细菌' } }
  };

  var CELLS = {
    animal: {
      name: '动物细胞',
      parts: ['membrane', 'cytoplasm', 'nucleus', 'mitochondria', 'ribosome', 'er', 'golgi', 'lysosome', 'centrosome'],
      organelles: COMMON
    },
    plant: {
      name: '植物细胞',
      parts: ['cellwall', 'membrane', 'cytoplasm', 'nucleus', 'mitochondria', 'ribosome', 'er', 'golgi', 'chloroplast', 'vacuole'],
      organelles: Object.assign({}, COMMON, PLANT_ONLY)
    },
    prokaryote: {
      name: '原核细胞',
      parts: ['wallP', 'membrane', 'cytoplasm', 'nucleoid', 'ribosome', 'plasmid', 'capsule'],
      organelles: Object.assign({}, {
        membrane: COMMON.membrane,
        cytoplasm: COMMON.cytoplasm,
        ribosome: COMMON.ribosome
      }, PROKARYOTE)
    }
  };

  var currentType = 'animal';
  var currentPart = null;

  var svgEl = document.getElementById('csSvg');
  var listEl = document.getElementById('csOrganList');
  var detailPanel = document.getElementById('csDetailPanel');
  var detailEl = document.getElementById('csDetail');

  /* ---------- 绘制细胞示意图 ---------- */
  function drawCell() {
    if (!svgEl) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

    var parts = [];  /* 依次绘制：底层到顶层 */

    if (currentType === 'animal') {
      /* 外轮廓：圆形 */
      parts.push({
        id: 'membrane',
        el: 'ellipse',
        attrs: { cx: 210, cy: 190, rx: 175, ry: 155, fill: '#f0e2c8', stroke: '#b47c00', 'stroke-width': 2 }
      });
      parts.push({
        id: 'cytoplasm',
        el: 'ellipse',
        attrs: { cx: 210, cy: 190, rx: 165, ry: 145, fill: '#fff8e1', stroke: 'none' }
      });
      /* 细胞核 */
      parts.push({
        id: 'nucleus',
        el: 'circle',
        attrs: { cx: 210, cy: 190, r: 52, fill: '#e5d5a5', stroke: '#8a6414', 'stroke-width': 2 }
      });
      parts.push({
        el: 'circle',
        attrs: { cx: 210, cy: 190, r: 22, fill: '#c9a02b', stroke: 'none', opacity: 0.85 }
      });
      /* 内质网（网状线条） */
      parts.push({ id: 'er', el: 'path', attrs: { d: 'M 130,120 Q 150,140 130,160 Q 110,180 130,200 M 290,120 Q 270,140 290,160 Q 310,180 290,200', fill: 'none', stroke: '#7a9c5f', 'stroke-width': 2.5, 'stroke-linecap': 'round' } });
      /* 高尔基体 */
      parts.push({ id: 'golgi', el: 'path', attrs: { d: 'M 260,240 Q 270,255 260,270 M 275,240 Q 285,255 275,270 M 290,240 Q 300,255 290,270', fill: 'none', stroke: '#c47a2b', 'stroke-width': 3, 'stroke-linecap': 'round' } });
      /* 线粒体 */
      parts.push({ id: 'mitochondria', el: 'ellipse', attrs: { cx: 140, cy: 250, rx: 32, ry: 18, fill: '#c17878', stroke: '#8f3a3a', 'stroke-width': 1.8, transform: 'rotate(-20 140 250)' } });
      parts.push({ el: 'path', attrs: { d: 'M 118,245 Q 128,252 138,245 Q 148,238 158,245 Q 162,248 162,255', fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: 0.8 } });
      /* 溶酶体 */
      parts.push({ id: 'lysosome', el: 'circle', attrs: { cx: 280, cy: 130, r: 20, fill: '#a69bbf', stroke: '#6d5a8c', 'stroke-width': 1.8 } });
      /* 中心体 */
      parts.push({ id: 'centrosome', el: 'circle', attrs: { cx: 130, cy: 190, r: 8, fill: '#5a6b7d', stroke: '#3a4a5c', 'stroke-width': 1.5 } });
      parts.push({ el: 'circle', attrs: { cx: 130, cy: 176, r: 8, fill: '#5a6b7d', stroke: '#3a4a5c', 'stroke-width': 1.5 } });
      /* 核糖体（散布） */
      var ribosomePositions = [[100,100],[320,180],[160,320],[290,300],[80,280],[330,240],[110,150],[300,90]];
      ribosomePositions.forEach(function (p) {
        parts.push({ id: 'ribosome', el: 'circle', attrs: { cx: p[0], cy: p[1], r: 5, fill: '#8ba6c0', stroke: '#4a7fb5', 'stroke-width': 1 } });
      });
    } else if (currentType === 'plant') {
      /* 细胞壁 */
      parts.push({
        id: 'cellwall',
        el: 'rect',
        attrs: { x: 20, y: 20, width: 380, height: 340, rx: 30, fill: '#c9a02b', stroke: '#8a6414', 'stroke-width': 2 }
      });
      /* 细胞膜 */
      parts.push({
        id: 'membrane',
        el: 'rect',
        attrs: { x: 32, y: 32, width: 356, height: 316, rx: 26, fill: '#fff8e1', stroke: '#b47c00', 'stroke-width': 1.5 }
      });
      /* 细胞质 */
      parts.push({
        id: 'cytoplasm',
        el: 'rect',
        attrs: { x: 38, y: 38, width: 344, height: 304, rx: 24, fill: '#fffdf5', stroke: 'none' }
      });
      /* 液泡（大） */
      parts.push({
        id: 'vacuole',
        el: 'ellipse',
        attrs: { cx: 130, cy: 200, rx: 68, ry: 88, fill: '#d5eaf0', stroke: '#7aa6bf', 'stroke-width': 2 }
      });
      /* 细胞核 */
      parts.push({
        id: 'nucleus',
        el: 'circle',
        attrs: { cx: 280, cy: 110, r: 42, fill: '#e5d5a5', stroke: '#8a6414', 'stroke-width': 2 }
      });
      parts.push({ el: 'circle', attrs: { cx: 280, cy: 110, r: 18, fill: '#c9a02b', opacity: 0.85 } });
      /* 叶绿体（多个椭圆） */
      var chls = [[260, 250, -30], [320, 220, 20], [220, 320, -15], [330, 300, 40]];
      chls.forEach(function (c, i) {
        parts.push({ id: 'chloroplast', el: 'ellipse', attrs: { cx: c[0], cy: c[1], rx: 28, ry: 16, fill: '#8fb59a', stroke: '#3f6b52', 'stroke-width': 1.8, transform: 'rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')' } });
        parts.push({ el: 'ellipse', attrs: { cx: c[0], cy: c[1], rx: 22, ry: 4, fill: 'none', stroke: '#fff', 'stroke-width': 1, opacity: 0.7, transform: 'rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')' } });
      });
      /* 线粒体 */
      parts.push({ id: 'mitochondria', el: 'ellipse', attrs: { cx: 90, cy: 100, rx: 28, ry: 16, fill: '#c17878', stroke: '#8f3a3a', 'stroke-width': 1.8, transform: 'rotate(20 90 100)' } });
      /* 高尔基体 */
      parts.push({ id: 'golgi', el: 'path', attrs: { d: 'M 60,300 Q 75,315 60,330 M 78,300 Q 93,315 78,330 M 96,300 Q 111,315 96,330', fill: 'none', stroke: '#c47a2b', 'stroke-width': 3, 'stroke-linecap': 'round' } });
      /* 内质网 */
      parts.push({ id: 'er', el: 'path', attrs: { d: 'M 190,60 Q 210,80 190,100 M 210,60 Q 230,80 210,100', fill: 'none', stroke: '#7a9c5f', 'stroke-width': 2.5, 'stroke-linecap': 'round' } });
      /* 核糖体 */
      var riboPositions = [[180,150],[240,180],[180,280],[80,240],[300,160],[220,40]];
      riboPositions.forEach(function (p) {
        parts.push({ id: 'ribosome', el: 'circle', attrs: { cx: p[0], cy: p[1], r: 5, fill: '#8ba6c0', stroke: '#4a7fb5', 'stroke-width': 1 } });
      });
    } else {
      /* 原核细胞：杆状 */
      /* 荚膜 */
      parts.push({
        id: 'capsule',
        el: 'rect',
        attrs: { x: 30, y: 100, width: 360, height: 180, rx: 90, fill: '#f0e2c8', stroke: '#c9a02b', 'stroke-width': 2, opacity: 0.7 }
      });
      /* 细胞壁 */
      parts.push({
        id: 'wallP',
        el: 'rect',
        attrs: { x: 55, y: 120, width: 310, height: 140, rx: 70, fill: '#c9a02b', stroke: '#8a6414', 'stroke-width': 2 }
      });
      /* 细胞膜 */
      parts.push({
        id: 'membrane',
        el: 'rect',
        attrs: { x: 66, y: 130, width: 288, height: 120, rx: 60, fill: '#fff8e1', stroke: '#b47c00', 'stroke-width': 1.5 }
      });
      /* 细胞质 */
      parts.push({
        id: 'cytoplasm',
        el: 'rect',
        attrs: { x: 72, y: 136, width: 276, height: 108, rx: 54, fill: '#fffdf5', stroke: 'none' }
      });
      /* 拟核（不规则曲线区域） */
      parts.push({
        id: 'nucleoid',
        el: 'ellipse',
        attrs: { cx: 180, cy: 190, rx: 48, ry: 30, fill: '#e5d5a5', stroke: '#8a6414', 'stroke-width': 2, transform: 'rotate(-10 180 190)' }
      });
      parts.push({ el: 'path', attrs: { d: 'M 145,185 Q 165,175 185,190 Q 205,205 220,190', fill: 'none', stroke: '#c9a02b', 'stroke-width': 2, opacity: 0.8 } });
      /* 质粒 */
      parts.push({ id: 'plasmid', el: 'ellipse', attrs: { cx: 290, cy: 165, rx: 18, ry: 10, fill: 'none', stroke: '#a69bbf', 'stroke-width': 2.2, transform: 'rotate(20 290 165)' } });
      parts.push({ id: 'plasmid', el: 'ellipse', attrs: { cx: 110, cy: 215, rx: 14, ry: 8, fill: 'none', stroke: '#a69bbf', 'stroke-width': 2.2, transform: 'rotate(-30 110 215)' } });
      /* 核糖体 */
      var riboPositions = [[120,155],[250,150],[310,215],[150,225],[200,150],[240,230]];
      riboPositions.forEach(function (p) {
        parts.push({ id: 'ribosome', el: 'circle', attrs: { cx: p[0], cy: p[1], r: 5, fill: '#8ba6c0', stroke: '#4a7fb5', 'stroke-width': 1 } });
      });
    }

    /* 添加标注 */
    var LABELS = {
      animal: [
        { text: '细胞膜', x: 210, y: 30 },
        { text: '细胞质', x: 60, y: 200 },
        { text: '细胞核', x: 210, y: 190 },
        { text: '线粒体', x: 140, y: 290 },
        { text: '内质网', x: 105, y: 90 },
        { text: '高尔基体', x: 310, y: 265 },
        { text: '溶酶体', x: 280, y: 100 },
        { text: '中心体', x: 130, y: 160 }
      ],
      plant: [
        { text: '细胞壁', x: 210, y: 14 },
        { text: '细胞膜', x: 210, y: 372 },
        { text: '液泡', x: 130, y: 200 },
        { text: '细胞核', x: 280, y: 110 },
        { text: '叶绿体', x: 290, y: 260 },
        { text: '线粒体', x: 90, y: 100 },
        { text: '高尔基体', x: 90, y: 345 }
      ],
      prokaryote: [
        { text: '荚膜', x: 210, y: 82 },
        { text: '细胞壁', x: 210, y: 108 },
        { text: '细胞膜', x: 210, y: 272 },
        { text: '拟核', x: 180, y: 190 },
        { text: '质粒', x: 290, y: 140 }
      ]
    };

    parts.forEach(function (p) {
      var e = document.createElementNS(svgNS, p.el);
      for (var k in p.attrs) e.setAttribute(k, p.attrs[k]);
      if (p.id) {
        e.setAttribute('class', 'cs-cell-part');
        e.setAttribute('data-part', p.id);
        e.style.cursor = 'pointer';
      }
      svgEl.appendChild(e);
    });

    /* 添加文字标注 */
    (LABELS[currentType] || []).forEach(function (l) {
      var t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', l.x);
      t.setAttribute('y', l.y);
      t.setAttribute('class', 'cs-cell-label');
      t.textContent = l.text;
      svgEl.appendChild(t);
    });

    /* 绑定点击 */
    svgEl.querySelectorAll('[data-part]').forEach(function (el) {
      el.addEventListener('click', function () {
        currentPart = el.dataset.part;
        renderList();
        renderDetail();
      });
    });
  }

  /* ---------- 渲染结构列表 ---------- */
  function renderList() {
    var cell = CELLS[currentType];
    listEl.innerHTML = cell.parts.map(function (id) {
      var item = cell.organelles[id];
      if (!item) return '';
      var tagCls = '';
      if (id === 'chloroplast' || id === 'vacuole' || id === 'cellwall') tagCls = 'plant-only';
      else if (id === 'centrosome') tagCls = 'animal-only';
      else if (id === 'nucleoid' || id === 'plasmid' || id === 'wallP' || id === 'capsule') tagCls = 'prokaryote';
      var active = (currentPart === id) ? ' active' : '';
      return '<div class="cs-organ-item' + active + (tagCls ? ' ' + tagCls : '') + '" data-part="' + id + '">' +
        '<span class="cs-organ-name">' + esc(item.name) + '</span>' +
        '<span class="cs-organ-tag">' + esc(item.tag) + '</span>' +
      '</div>';
    }).join('');

    listEl.querySelectorAll('.cs-organ-item').forEach(function (el) {
      el.addEventListener('click', function () {
        currentPart = el.dataset.part;
        renderList();
        renderDetail();
      });
    });
  }

  /* ---------- 渲染详情 ---------- */
  function renderDetail() {
    if (!currentPart) {
      detailPanel.style.display = 'none';
      return;
    }
    var cell = CELLS[currentType];
    var item = cell.organelles[currentPart];
    if (!item) { detailPanel.style.display = 'none'; return; }

    var rowsHtml = '';
    if (item.extra) {
      rowsHtml = Object.keys(item.extra).map(function (k) {
        return '<div class="cs-detail-row"><b>' + esc(k) + '</b><span>' + esc(item.extra[k]) + '</span></div>';
      }).join('');
    }

    detailEl.innerHTML = '<div class="cs-detail-head">' +
      '<h3 class="cs-detail-name">' + esc(item.name) + '</h3>' +
      '<span class="cs-detail-tag">' + esc(item.tag) + '</span>' +
    '</div>' +
    '<p style="margin:0 0 12px;font-size:13.5px;line-height:1.9;color:#4a3800;">' + esc(item.desc) + '</p>' +
    rowsHtml;

    detailPanel.style.display = '';

    /* 高亮示意图 */
    svgEl.querySelectorAll('.cs-cell-part').forEach(function (el) {
      el.classList.toggle('active', el.dataset.part === currentPart);
    });
  }

  /* ---------- 子标签切换 ---------- */
  document.querySelectorAll('#page-cellstructure .ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#page-cellstructure .ta-subtab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentType = tab.dataset.cs;
      currentPart = null;
      detailPanel.style.display = 'none';
      drawCell();
      renderList();
    });
  });

  /* ---------- 初始化 ---------- */
  function init() {
    if (window.__cellstructureInited) return;
    window.__cellstructureInited = true;
    drawCell();
    renderList();
  }
  window.__cellstructureInit = function () {
    if (!window.__cellstructureInited) init();
    else { drawCell(); renderList(); }
  };
  if (page.classList.contains('active')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
  console.log('[细胞结构速查] 已加载');
})();