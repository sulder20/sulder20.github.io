/* ============================================================
   中国地理 · 岁窦工具箱 V4.0
   地形 / 河流湖泊 / 行政区划
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-chinageo');
  if (!page) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function safeCall(fn, label) {
    try { if (typeof fn === 'function') fn(); }
    catch (e) { console.error('[中国地理] ' + label + ' 出错：', e); }
  }

  /* ============================================================
     数据：地形
     ============================================================ */
  var TERRAIN = [
    { type: '四大高原', name: '青藏高原', region: '青海、西藏、四川西部', feat: '世界最高的高原，被称为「世界屋脊」，平均海拔 4000 米以上', extra: '雪山连绵，冰川广布；是长江、黄河、澜沧江等大河的发源地' },
    { type: '四大高原', name: '内蒙古高原', region: '内蒙古大部、甘肃北部', feat: '中国第二大高原，地面坦荡，一望无际', extra: '草原广布，是重要的畜牧业基地' },
    { type: '四大高原', name: '黄土高原', region: '山西、陕西、甘肃、宁夏', feat: '世界最大的黄土堆积区，黄土厚达 100-200 米', extra: '地表千沟万壑、支离破碎，水土流失严重' },
    { type: '四大高原', name: '云贵高原', region: '云南、贵州大部', feat: '喀斯特地貌广布，地表崎岖不平', extra: '溶洞、地下河、石林、峰林发育，多民族聚居' },

    { type: '四大盆地', name: '塔里木盆地', region: '新疆南部', feat: '中国最大的盆地，也是世界最大的内陆盆地', extra: '中部是塔克拉玛干沙漠（中国最大沙漠），边缘有绿洲' },
    { type: '四大盆地', name: '准噶尔盆地', region: '新疆北部', feat: '中国第二大盆地', extra: '西侧有缺口，可受大西洋水汽影响；有克拉玛依油田' },
    { type: '四大盆地', name: '柴达木盆地', region: '青海西北部', feat: '海拔最高的盆地，约 2600-3000 米', extra: '矿产丰富，有「聚宝盆」之称；多盐湖' },
    { type: '四大盆地', name: '四川盆地', region: '四川东部、重庆', feat: '中国最湿润的盆地，被称为「紫色盆地」', extra: '紫色土肥沃，农业发达，有「天府之国」之称' },

    { type: '三大平原', name: '东北平原', region: '黑吉辽三省', feat: '中国最大的平原，面积约 35 万平方千米', extra: '黑土广布，是中国重要的商品粮基地' },
    { type: '三大平原', name: '华北平原', region: '京、津、冀、鲁、豫', feat: '由黄河、淮河、海河冲积而成，又称黄淮海平原', extra: '地势平坦，人口稠密，是重要的农业区' },
    { type: '三大平原', name: '长江中下游平原', region: '湖北、湖南、江西、安徽、江苏、浙江、上海', feat: '中国地势最低平的平原，河湖密布', extra: '被称为「鱼米之乡」，水网密布' },

    { type: '三大丘陵', name: '东南丘陵', region: '长江以南、云贵高原以东', feat: '中国最大的丘陵，包括江南丘陵、浙闽丘陵、两广丘陵', extra: '红壤广布，茶树、油茶、柑橘等经济作物多' },
    { type: '三大丘陵', name: '山东丘陵', region: '山东中南部', feat: '地势较为崎岖', extra: '有著名的泰山，林果业发达' },
    { type: '三大丘陵', name: '辽东丘陵', region: '辽宁东南部', feat: '千山山脉为主干', extra: '苹果、柞蚕丝的重要产地' },

    { type: '主要山脉', name: '喜马拉雅山脉', region: '西藏南部边境', feat: '世界最高大的山脉，主峰珠穆朗玛峰 8848.86 米', extra: '由印度洋板块与亚欧板块碰撞形成' },
    { type: '主要山脉', name: '昆仑山脉', region: '新疆、西藏之间', feat: '中国西部重要山脉，长约 2500 千米', extra: '有「亚洲脊柱」之称' },
    { type: '主要山脉', name: '天山山脉', region: '新疆中部', feat: '把新疆分为南疆和北疆', extra: '多冰川，是重要的固体水库' },
    { type: '主要山脉', name: '阿尔泰山脉', region: '新疆北部', feat: '中国与蒙古的界山', extra: '有丰富的有色金属矿产' },
    { type: '主要山脉', name: '祁连山脉', region: '青海、甘肃之间', feat: '河西走廊的南侧屏障', extra: '冰雪融水滋养河西走廊绿洲' },
    { type: '主要山脉', name: '秦岭', region: '陕西南部、甘肃东部', feat: '中国南北方重要分界线', extra: '1 月 0℃ 等温线、800mm 年等降水量线经过' },
    { type: '主要山脉', name: '大兴安岭', region: '内蒙古东部、黑龙江西部', feat: '内蒙古高原与东北平原的分界', extra: '中国重要的林业基地' },
    { type: '主要山脉', name: '太行山脉', region: '山西、河北之间', feat: '黄土高原与华北平原的分界', extra: '东侧陡峭，西侧平缓' },
    { type: '主要山脉', name: '巫山', region: '重庆、湖北之间', feat: '四川盆地与长江中下游平原的分界', extra: '长江三峡横穿其间' },
    { type: '主要山脉', name: '横断山脉', region: '四川、云南西部', feat: '南北纵贯，山高谷深', extra: '三江并流（金沙江、澜沧江、怒江）' },
    { type: '主要山脉', name: '雪峰山', region: '湖南西部', feat: '云贵高原与东南丘陵的分界', extra: '中国地势第二、三级阶梯的分界之一' },
    { type: '主要山脉', name: '长白山脉', region: '吉林东南部', feat: '中国与朝鲜的界山', extra: '主峰白头山，天池是中国最深的火山口湖' },
    { type: '主要山脉', name: '武夷山脉', region: '福建、江西之间', feat: '东南丘陵的重要山脉', extra: '是福建与江西的界山，盛产茶叶' },
    { type: '主要山脉', name: '南岭', region: '湖南、江西、广东、广西之间', feat: '长江水系与珠江水系的分水岭', extra: '钨、锡等有色金属矿产丰富' },
    { type: '主要山脉', name: '阴山山脉', region: '内蒙古中部', feat: '中国北方重要地理分界线', extra: '古代农耕与游牧的分界' }
  ];

  /* ============================================================
     数据：河流湖泊
     ============================================================ */
  var RIVERS = [
    { type: '河流', name: '长江', length: '6300 km', source: '青藏高原唐古拉山', mouth: '东海', basin: '约 180 万 km²', feat: '中国第一大河，世界第三长河；流经 11 个省级行政区', note: '上游水能丰富（三峡水电站），中下游航运发达，被称为「黄金水道」' },
    { type: '河流', name: '黄河', length: '5464 km', source: '青藏高原巴颜喀拉山', mouth: '渤海', basin: '约 75 万 km²', feat: '中国第二长河，被称为「母亲河」', note: '含沙量世界第一；下游形成「地上河」；流经 9 个省级行政区' },
    { type: '河流', name: '珠江', length: '2214 km', source: '云南马雄山', mouth: '南海', basin: '约 45 万 km²', feat: '中国第三长河，是西江、北江、东江的总称', note: '水量仅次于长江，航运价值高' },
    { type: '河流', name: '黑龙江', length: '4370 km（中国境内 3474 km）', source: '蒙古肯特山', mouth: '鄂霍次克海', basin: '约 185 万 km²', feat: '中俄界河，中国最北的大河', note: '封冻期长，航运期较短' },
    { type: '河流', name: '雅鲁藏布江', length: '2057 km（中国境内）', source: '喜马拉雅山北麓', mouth: '孟加拉湾（经印度、孟加拉国）', basin: '中国境内约 24 万 km²', feat: '世界上海拔最高的大河', note: '大峡谷是世界最深峡谷之一' },
    { type: '河流', name: '澜沧江', length: '4880 km（中国境内 2130 km）', source: '青海唐古拉山', mouth: '南海（出境后称湄公河）', basin: '中国境内约 16 万 km²', feat: '亚洲流经国家最多的国际河流', note: '出境后流经缅、老、泰、柬、越' },
    { type: '河流', name: '怒江', length: '3240 km（中国境内 2013 km）', source: '青藏高原唐古拉山', mouth: '安达曼海（出境后称萨尔温江）', basin: '中国境内约 13.6 万 km²', feat: '与澜沧江、金沙江形成「三江并流」', note: '水流湍急，水能资源丰富' },
    { type: '河流', name: '辽河', length: '1345 km', source: '河北七老图山', mouth: '渤海', basin: '约 21.9 万 km²', feat: '东北南部重要河流', note: '含沙量较大，下游多洪涝' },
    { type: '河流', name: '海河', length: '1090 km', source: '太行山、燕山', mouth: '渤海', basin: '约 31.8 万 km²', feat: '华北地区重要河流，由五大支流汇成', note: '含沙量大，洪涝与干旱并存' },
    { type: '河流', name: '淮河', length: '1000 km', source: '河南桐柏山', mouth: '洪泽湖，经长江入海', basin: '约 27 万 km²', feat: '中国南北方地理分界线之一', note: '历史上洪涝频发，治理难度大' },

    { type: '湖泊', name: '青海湖', area: '约 4583 km²', depth: '最深约 32.8 m', location: '青海省', feat: '中国最大的湖泊，也是最大的咸水湖', note: '海拔约 3196 m，是重要的湿地和鸟类栖息地' },
    { type: '湖泊', name: '鄱阳湖', area: '约 4070 km²（丰水期）', depth: '最深约 25.1 m', location: '江西省', feat: '中国最大的淡水湖', note: '与长江相连，是重要的候鸟越冬地' },
    { type: '湖泊', name: '洞庭湖', area: '约 2820 km²', depth: '最深约 23.5 m', location: '湖南省', feat: '中国第二大淡水湖', note: '被称为「八百里洞庭」，是重要的调蓄湖泊' },
    { type: '湖泊', name: '太湖', area: '约 2338 km²', depth: '最深约 3.3 m', location: '江苏、浙江', feat: '中国第三大淡水湖', note: '平均水深最浅，是重要的水产基地' },
    { type: '湖泊', name: '洪泽湖', area: '约 2069 km²', depth: '最深约 5.5 m', location: '江苏省', feat: '中国第四大淡水湖', note: '是淮河下游重要的调蓄湖泊' },
    { type: '湖泊', name: '呼伦湖', area: '约 2339 km²', depth: '最深约 8 m', location: '内蒙古', feat: '内蒙古第一大湖', note: '是中国北方重要的生态屏障' },
    { type: '湖泊', name: '纳木错', area: '约 1920 km²', depth: '最深约 33 m', location: '西藏', feat: '世界上海拔最高的大型湖泊之一', note: '海拔约 4718 m，是著名的高原圣湖' },
    { type: '湖泊', name: '巢湖', area: '约 770 km²', depth: '最深约 3.8 m', location: '安徽省', feat: '中国五大淡水湖之一', note: '是重要的农业灌溉水源' }
  ];

  /* ============================================================
     数据：省级行政区
     ============================================================ */
  var PROVINCES = [
    { abbr: '京', name: '北京市', capital: '北京', area: '1.64 万 km²', pop: '约 2189 万', region: '华北', type: '直辖市' },
    { abbr: '津', name: '天津市', capital: '天津', area: '1.19 万 km²', pop: '约 1363 万', region: '华北', type: '直辖市' },
    { abbr: '冀', name: '河北省', capital: '石家庄', area: '18.88 万 km²', pop: '约 7448 万', region: '华北', type: '省' },
    { abbr: '晋', name: '山西省', capital: '太原', area: '15.67 万 km²', pop: '约 3481 万', region: '华北', type: '省' },
    { abbr: '蒙', name: '内蒙古自治区', capital: '呼和浩特', area: '118.3 万 km²', pop: '约 2400 万', region: '华北', type: '自治区' },

    { abbr: '辽', name: '辽宁省', capital: '沈阳', area: '14.59 万 km²', pop: '约 4197 万', region: '东北', type: '省' },
    { abbr: '吉', name: '吉林省', capital: '长春', area: '18.74 万 km²', pop: '约 2347 万', region: '东北', type: '省' },
    { abbr: '黑', name: '黑龙江省', capital: '哈尔滨', area: '47.3 万 km²', pop: '约 3099 万', region: '东北', type: '省' },

    { abbr: '沪', name: '上海市', capital: '上海', area: '0.634 万 km²', pop: '约 2487 万', region: '华东', type: '直辖市' },
    { abbr: '苏', name: '江苏省', capital: '南京', area: '10.72 万 km²', pop: '约 8526 万', region: '华东', type: '省' },
    { abbr: '浙', name: '浙江省', capital: '杭州', area: '10.55 万 km²', pop: '约 6577 万', region: '华东', type: '省' },
    { abbr: '皖', name: '安徽省', capital: '合肥', area: '14.01 万 km²', pop: '约 6127 万', region: '华东', type: '省' },
    { abbr: '闽', name: '福建省', capital: '福州', area: '12.4 万 km²', pop: '约 4188 万', region: '华东', type: '省' },
    { abbr: '赣', name: '江西省', capital: '南昌', area: '16.69 万 km²', pop: '约 4518 万', region: '华东', type: '省' },
    { abbr: '鲁', name: '山东省', capital: '济南', area: '15.58 万 km²', pop: '约 1.02 亿', region: '华东', type: '省' },

    { abbr: '豫', name: '河南省', capital: '郑州', area: '16.7 万 km²', pop: '约 9872 万', region: '华中', type: '省' },
    { abbr: '鄂', name: '湖北省', capital: '武汉', area: '18.59 万 km²', pop: '约 5844 万', region: '华中', type: '省' },
    { abbr: '湘', name: '湖南省', capital: '长沙', area: '21.18 万 km²', pop: '约 6604 万', region: '华中', type: '省' },

    { abbr: '粤', name: '广东省', capital: '广州', area: '17.97 万 km²', pop: '约 1.27 亿', region: '华南', type: '省' },
    { abbr: '桂', name: '广西壮族自治区', capital: '南宁', area: '23.76 万 km²', pop: '约 5047 万', region: '华南', type: '自治区' },
    { abbr: '琼', name: '海南省', capital: '海口', area: '3.54 万 km²', pop: '约 1027 万', region: '华南', type: '省' },
    { abbr: '港', name: '香港特别行政区', capital: '香港', area: '0.11 万 km²', pop: '约 748 万', region: '华南', type: '特别行政区' },
    { abbr: '澳', name: '澳门特别行政区', capital: '澳门', area: '0.0033 万 km²', pop: '约 68 万', region: '华南', type: '特别行政区' },

    { abbr: '渝', name: '重庆市', capital: '重庆', area: '8.24 万 km²', pop: '约 3213 万', region: '西南', type: '直辖市' },
    { abbr: '川', name: '四川省', capital: '成都', area: '48.6 万 km²', pop: '约 8374 万', region: '西南', type: '省' },
    { abbr: '贵', name: '贵州省', capital: '贵阳', area: '17.6 万 km²', pop: '约 3856 万', region: '西南', type: '省' },
    { abbr: '云', name: '云南省', capital: '昆明', area: '39.4 万 km²', pop: '约 4693 万', region: '西南', type: '省' },
    { abbr: '藏', name: '西藏自治区', capital: '拉萨', area: '122.8 万 km²', pop: '约 366 万', region: '西南', type: '自治区' },

    { abbr: '陕', name: '陕西省', capital: '西安', area: '20.56 万 km²', pop: '约 3956 万', region: '西北', type: '省' },
    { abbr: '甘', name: '甘肃省', capital: '兰州', area: '42.58 万 km²', pop: '约 2492 万', region: '西北', type: '省' },
    { abbr: '青', name: '青海省', capital: '西宁', area: '72.23 万 km²', pop: '约 595 万', region: '西北', type: '省' },
    { abbr: '宁', name: '宁夏回族自治区', capital: '银川', area: '6.64 万 km²', pop: '约 725 万', region: '西北', type: '自治区' },
    { abbr: '新', name: '新疆维吾尔自治区', capital: '乌鲁木齐', area: '166 万 km²', pop: '约 2587 万', region: '西北', type: '自治区' },

    { abbr: '台', name: '台湾省', capital: '台北', area: '3.6 万 km²', pop: '约 2326 万', region: '华东', type: '省' }
  ];

  /* ============================================================
     子标签切换
     ============================================================ */
  document.querySelectorAll('#page-chinageo .ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#page-chinageo .ta-subtab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.cng;
      document.querySelectorAll('#page-chinageo .ta-subpage').forEach(function (p) {
        p.classList.toggle('active', p.dataset.cngPage === target);
      });
      if (target === 'terrain')   safeCall(renderTerrain, '地形');
      if (target === 'rivers')    safeCall(renderRivers, '河流');
      if (target === 'provinces') safeCall(renderProvinces, '省份');
    });
  });

  /* ============================================================
     一、地形
     ============================================================ */
  var terrSearchEl = document.getElementById('cngTerrSearch');
  var terrTypeEl   = document.getElementById('cngTerrType');
  var terrStatsEl  = document.getElementById('cngTerrStats');
  var terrGridEl   = document.getElementById('cngTerrGrid');

  function renderTerrain() {
    var q = String(terrSearchEl.value || '').trim().toLowerCase();
    var t = terrTypeEl.value;

    var list = TERRAIN.filter(function (item) {
      if (t && item.type !== t) return false;
      if (!q) return true;
      return item.name.indexOf(q) >= 0 || item.region.indexOf(q) >= 0 || item.feat.indexOf(q) >= 0 || item.extra.indexOf(q) >= 0;
    });

    if (terrStatsEl) {
      terrStatsEl.innerHTML = '共 <b>' + list.length + '</b> 项' + (t ? '　·　类型：<b>' + esc(t) + '</b>' : '');
    }

    if (!list.length) {
      terrGridEl.innerHTML = '<p class="cng-empty">没有匹配的地形，换个关键词试试～</p>';
      return;
    }

    terrGridEl.innerHTML = list.map(function (item) {
      return '<div class="cng-terrain-card">' +
        '<div class="cng-terrain-head">' +
          '<h3 class="cng-terrain-name">' + esc(item.name) + '</h3>' +
          '<span class="cng-terrain-type">' + esc(item.type) + '</span>' +
        '</div>' +
        '<div class="cng-terrain-row"><b>分布</b>' + esc(item.region) + '</div>' +
        '<div class="cng-terrain-row"><b>特征</b>' + esc(item.feat) + '</div>' +
        '<div class="cng-terrain-row"><b>补充</b>' + esc(item.extra) + '</div>' +
      '</div>';
    }).join('');
  }

  if (terrSearchEl) terrSearchEl.addEventListener('input', renderTerrain);
  if (terrTypeEl)   terrTypeEl.addEventListener('change', renderTerrain);

  /* ============================================================
     二、河流湖泊
     ============================================================ */
  var riverSearchEl = document.getElementById('cngRiverSearch');
  var riverTypeEl   = document.getElementById('cngRiverType');
  var riverStatsEl  = document.getElementById('cngRiverStats');
  var riverListEl   = document.getElementById('cngRiverList');

  function renderRivers() {
    var q = String(riverSearchEl.value || '').trim().toLowerCase();
    var t = riverTypeEl.value;

    var list = RIVERS.filter(function (item) {
      if (t && item.type !== t) return false;
      if (!q) return true;
      var hay = (item.name + item.source + item.mouth + item.feat + item.note + (item.location || '')).toLowerCase();
      return hay.indexOf(q) >= 0;
    });

    var riverCount = list.filter(function (x) { return x.type === '河流'; }).length;
    var lakeCount  = list.filter(function (x) { return x.type === '湖泊'; }).length;

    if (riverStatsEl) {
      riverStatsEl.innerHTML = '共 <b>' + list.length + '</b> 项　·　河流 <b>' + riverCount + '</b>　·　湖泊 <b>' + lakeCount + '</b>';
    }

    if (!list.length) {
      riverListEl.innerHTML = '<p class="cng-empty">没有匹配的河流或湖泊，换个关键词试试～</p>';
      return;
    }

    riverListEl.innerHTML = list.map(function (item) {
      var isLake = item.type === '湖泊';
      var bodyRows = isLake
        ? '<div class="cng-river-row"><b>面积</b><span>' + esc(item.area) + '</span></div>' +
          '<div class="cng-river-row"><b>深度</b><span>' + esc(item.depth) + '</span></div>' +
          '<div class="cng-river-row"><b>位置</b><span>' + esc(item.location) + '</span></div>'
        : '<div class="cng-river-row"><b>长度</b><span>' + esc(item.length) + '</span></div>' +
          '<div class="cng-river-row"><b>发源地</b><span>' + esc(item.source) + '</span></div>' +
          '<div class="cng-river-row"><b>注入</b><span>' + esc(item.mouth) + '</span></div>' +
          '<div class="cng-river-row"><b>流域</b><span>' + esc(item.basin) + '</span></div>';

      return '<div class="cng-river-card' + (isLake ? ' lake' : '') + '">' +
        '<div class="cng-river-head">' +
          '<h3 class="cng-river-name">' + esc(item.name) + '</h3>' +
          '<span class="cng-river-badge">' + esc(item.type) + '</span>' +
        '</div>' +
        '<div class="cng-river-body">' +
          bodyRows +
          '<div class="cng-river-note">' + esc(item.feat) + '。' + esc(item.note) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  if (riverSearchEl) riverSearchEl.addEventListener('input', renderRivers);
  if (riverTypeEl)   riverTypeEl.addEventListener('change', renderRivers);

  /* ============================================================
     三、行政区划
     ============================================================ */
  var provSearchEl = document.getElementById('cngProvSearch');
  var provRegionEl = document.getElementById('cngProvRegion');
  var provSortEl   = document.getElementById('cngProvSort');
  var provStatsEl  = document.getElementById('cngProvStats');
  var provGridEl   = document.getElementById('cngProvGrid');

  function parsePop(pop) {
    /* "约 2189 万" -> 2189 */
    var m = String(pop).match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : 0;
  }
  function parseArea(area) {
    /* "18.88 万 km²" -> 18.88 */
    var m = String(area).match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : 0;
  }

  function renderProvinces() {
    var q = String(provSearchEl.value || '').trim().toLowerCase();
    var r = provRegionEl.value;
    var sort = provSortEl.value;

    var list = PROVINCES.filter(function (p) {
      if (r && p.region !== r) return false;
      if (!q) return true;
      return p.name.indexOf(q) >= 0 || p.abbr.indexOf(q) >= 0 || p.capital.indexOf(q) >= 0 || p.region.indexOf(q) >= 0;
    });

    if (sort === 'area') {
      list = list.slice().sort(function (a, b) { return parseArea(b.area) - parseArea(a.area); });
    } else if (sort === 'pop') {
      list = list.slice().sort(function (a, b) { return parsePop(b.pop) - parsePop(a.pop); });
    }

    if (provStatsEl) {
      provStatsEl.innerHTML = '共 <b>' + list.length + '</b> 个省级行政区' + (r ? '　·　大区：<b>' + esc(r) + '</b>' : '');
    }

    if (!list.length) {
      provGridEl.innerHTML = '<p class="cng-empty">没有匹配的省级行政区，换个关键词试试～</p>';
      return;
    }

    provGridEl.innerHTML = list.map(function (p) {
      return '<div class="cng-prov-card">' +
        '<div class="cng-prov-head">' +
          '<div class="cng-prov-abbr">' + esc(p.abbr) + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<h3 class="cng-prov-name">' + esc(p.name) + '</h3>' +
            '<span class="cng-prov-region">' + esc(p.region) + ' · ' + esc(p.type) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="cng-prov-body">' +
          '<div class="cng-prov-cell"><b>省会</b><span>' + esc(p.capital) + '</span></div>' +
          '<div class="cng-prov-cell"><b>简称</b><span>' + esc(p.abbr) + '</span></div>' +
          '<div class="cng-prov-cell"><b>面积</b><span>' + esc(p.area) + '</span></div>' +
          '<div class="cng-prov-cell"><b>人口</b><span>' + esc(p.pop) + '</span></div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  if (provSearchEl) provSearchEl.addEventListener('input', renderProvinces);
  if (provRegionEl) provRegionEl.addEventListener('change', renderProvinces);
  if (provSortEl)   provSortEl.addEventListener('change', renderProvinces);

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    if (window.__chinageoInited) return;
    window.__chinageoInited = true;
    safeCall(renderTerrain, '地形');
    safeCall(renderRivers, '河流');
    safeCall(renderProvinces, '省份');
  }

  window.__chinageoInit = function () {
    if (!window.__chinageoInited) init();
    else {
      safeCall(renderTerrain, '地形刷新');
      safeCall(renderRivers, '河流刷新');
      safeCall(renderProvinces, '省份刷新');
    }
  };

  if (page.classList.contains('active')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function () {
      if (page.classList.contains('active') && !window.__chinageoInited) init();
    });
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  }

  console.log('[中国地理] 已加载');
})();