/* ============================================================
   岁窦工具箱 · 中国车牌一览表
   ============================================================ */
(function () {
  'use strict';

  var inited = false;

  /* ---------- 数据：按地理大区分组 ---------- */
  var DATA = [
    {
      region: '华北',
      provinces: [
        { name: '北京市', abbr: '京', codes: [['A','北京城区'],['B','出租车'],['C','城区'],['E','城区'],['F','城区'],['G','城区'],['H','城区'],['J','城区'],['K','城区'],['L','城区'],['M','城区'],['N','城区'],['P','城区'],['Q','城区']] },
        { name: '天津市', abbr: '津', codes: [['A','公交 / 公安'],['B','天津市区'],['C','滨海新区'],['D','出租车'],['E','天津市区'],['F','天津市区'],['G','天津市区'],['H','天津市区']] },
        { name: '河北省', abbr: '冀', codes: [['A','石家庄'],['B','唐山'],['C','秦皇岛'],['D','邯郸'],['E','邢台'],['F','保定'],['G','张家口'],['H','承德'],['J','沧州'],['R','廊坊'],['T','衡水']] },
        { name: '山西省', abbr: '晋', codes: [['A','太原'],['B','大同'],['C','阳泉'],['D','长治'],['E','晋城'],['F','朔州'],['H','忻州'],['J','吕梁'],['K','晋中'],['L','临汾'],['M','运城']] },
        { name: '内蒙古自治区', abbr: '蒙', codes: [['A','呼和浩特'],['B','包头'],['C','乌海'],['D','赤峰'],['E','呼伦贝尔'],['F','兴安盟'],['G','通辽'],['H','锡林郭勒盟'],['J','乌兰察布'],['K','鄂尔多斯'],['L','巴彦淖尔'],['M','阿拉善盟']] }
      ]
    },
    {
      region: '东北',
      provinces: [
        { name: '辽宁省', abbr: '辽', codes: [['A','沈阳'],['B','大连'],['C','鞍山'],['D','抚顺'],['E','本溪'],['F','丹东'],['G','锦州'],['H','营口'],['J','阜新'],['K','辽阳'],['L','盘锦'],['M','铁岭'],['N','朝阳'],['P','葫芦岛']] },
        { name: '吉林省', abbr: '吉', codes: [['A','长春'],['B','吉林'],['C','四平'],['D','辽源'],['E','通化'],['F','白山'],['G','白城'],['H','延边'],['J','松原']] },
        { name: '黑龙江省', abbr: '黑', codes: [['A','哈尔滨'],['B','齐齐哈尔'],['C','牡丹江'],['D','佳木斯'],['E','大庆'],['F','伊春'],['G','鸡西'],['H','鹤岗'],['J','双鸭山'],['K','七台河'],['L','松花江'],['M','绥化'],['N','黑河'],['P','大兴安岭']] }
      ]
    },
    {
      region: '华东',
      provinces: [
        { name: '上海市', abbr: '沪', codes: [['A','市区'],['B','市区'],['C','郊区'],['D','市区'],['E','市区'],['F','市区'],['G','市区'],['H','市区'],['J','市区'],['K','市区'],['L','市区'],['M','市区'],['N','市区']] },
        { name: '江苏省', abbr: '苏', codes: [['A','南京'],['B','无锡'],['C','徐州'],['D','常州'],['E','苏州'],['F','南通'],['G','连云港'],['H','淮安'],['J','盐城'],['K','扬州'],['L','镇江'],['M','泰州'],['N','宿迁'],['U','苏州']] },
        { name: '浙江省', abbr: '浙', codes: [['A','杭州'],['B','宁波'],['C','温州'],['D','绍兴'],['E','湖州'],['F','嘉兴'],['G','金华'],['H','衢州'],['J','台州'],['K','丽水'],['L','舟山']] },
        { name: '安徽省', abbr: '皖', codes: [['A','合肥'],['B','芜湖'],['C','蚌埠'],['D','淮南'],['E','马鞍山'],['F','淮北'],['G','铜陵'],['H','安庆'],['J','黄山'],['K','阜阳'],['L','宿州'],['M','滁州'],['N','六安'],['P','宣城'],['R','池州'],['S','亳州']] },
        { name: '福建省', abbr: '闽', codes: [['A','福州'],['B','莆田'],['C','泉州'],['D','厦门'],['E','漳州'],['F','龙岩'],['G','三明'],['H','南平'],['J','宁德']] },
        { name: '江西省', abbr: '赣', codes: [['A','南昌'],['B','赣州'],['C','宜春'],['D','吉安'],['E','上饶'],['F','抚州'],['G','九江'],['H','景德镇'],['J','萍乡'],['K','新余'],['L','鹰潭']] },
        { name: '山东省', abbr: '鲁', codes: [['A','济南'],['B','青岛'],['C','淄博'],['D','枣庄'],['E','东营'],['F','烟台'],['G','潍坊'],['H','济宁'],['J','泰安'],['K','威海'],['L','日照'],['M','滨州'],['N','德州'],['P','聊城'],['Q','临沂'],['R','菏泽'],['S','莱芜（已并入济南）']] }
      ]
    },
    {
      region: '华中',
      provinces: [
        { name: '河南省', abbr: '豫', codes: [['A','郑州'],['B','开封'],['C','洛阳'],['D','平顶山'],['E','安阳'],['F','鹤壁'],['G','新乡'],['H','焦作'],['J','濮阳'],['K','许昌'],['L','漯河'],['M','三门峡'],['N','商丘'],['P','周口'],['Q','驻马店'],['R','南阳'],['S','信阳'],['U','济源']] },
        { name: '湖北省', abbr: '鄂', codes: [['A','武汉'],['B','黄石'],['C','十堰'],['D','荆州'],['E','宜昌'],['F','襄阳'],['G','鄂州'],['H','荆门'],['J','黄冈'],['K','孝感'],['L','咸宁'],['M','仙桃'],['N','潜江'],['P','神农架'],['Q','恩施'],['R','天门'],['S','随州']] },
        { name: '湖南省', abbr: '湘', codes: [['A','长沙'],['B','株洲'],['C','湘潭'],['D','衡阳'],['E','邵阳'],['F','岳阳'],['G','张家界'],['H','益阳'],['J','常德'],['K','娄底'],['L','郴州'],['M','永州'],['N','怀化'],['U','湘西']] }
      ]
    },
    {
      region: '华南',
      provinces: [
        { name: '广东省', abbr: '粤', codes: [['A','广州'],['B','深圳'],['C','珠海'],['D','汕头'],['E','佛山'],['F','韶关'],['G','湛江'],['H','肇庆'],['J','江门'],['K','茂名'],['L','惠州'],['M','梅州'],['N','汕尾'],['P','河源'],['Q','阳江'],['R','清远'],['S','东莞'],['T','中山'],['U','潮州'],['V','揭阳'],['W','云浮']] },
        { name: '广西壮族自治区', abbr: '桂', codes: [['A','南宁'],['B','柳州'],['C','桂林'],['D','梧州'],['E','北海'],['F','崇左'],['G','来宾'],['J','贺州'],['K','玉林'],['L','百色'],['M','河池'],['N','钦州'],['P','防城港'],['R','贵港']] },
        { name: '海南省', abbr: '琼', codes: [['A','海口'],['B','三亚'],['C','琼海'],['D','五指山'],['E','洋浦']] }
      ]
    },
    {
      region: '西南',
      provinces: [
        { name: '重庆市', abbr: '渝', codes: [['A','重庆市区'],['B','重庆市区'],['C','永川'],['D','重庆市区'],['F','万州'],['G','涪陵'],['H','黔江']] },
        { name: '四川省', abbr: '川', codes: [['A','成都'],['B','绵阳'],['C','自贡'],['D','攀枝花'],['E','泸州'],['F','德阳'],['H','广元'],['J','遂宁'],['K','内江'],['L','乐山'],['M','资阳'],['Q','宜宾'],['R','南充'],['S','达州'],['T','雅安'],['U','阿坝'],['V','甘孜'],['W','凉山'],['X','广安'],['Y','巴中'],['Z','眉山']] },
        { name: '贵州省', abbr: '贵', codes: [['A','贵阳'],['B','六盘水'],['C','遵义'],['D','铜仁'],['E','黔西南'],['F','毕节'],['G','安顺'],['H','黔东南'],['J','黔南']] },
        { name: '云南省', abbr: '云', codes: [['A','昆明'],['C','昭通'],['D','曲靖'],['E','楚雄'],['F','玉溪'],['G','红河'],['H','文山'],['J','普洱'],['K','西双版纳'],['L','大理'],['M','保山'],['N','德宏'],['P','丽江'],['Q','怒江'],['R','迪庆'],['S','临沧']] },
        { name: '西藏自治区', abbr: '藏', codes: [['A','拉萨'],['B','昌都'],['C','山南'],['D','日喀则'],['E','那曲'],['F','阿里'],['G','林芝']] }
      ]
    },
    {
      region: '西北',
      provinces: [
        { name: '陕西省', abbr: '陕', codes: [['A','西安'],['B','铜川'],['C','宝鸡'],['D','咸阳'],['E','渭南'],['F','汉中'],['G','安康'],['H','商洛'],['J','延安'],['K','榆林'],['V','杨凌']] },
        { name: '甘肃省', abbr: '甘', codes: [['A','兰州'],['B','嘉峪关'],['C','金昌'],['D','白银'],['E','天水'],['F','酒泉'],['G','张掖'],['H','武威'],['J','定西'],['K','陇南'],['L','平凉'],['M','庆阳'],['N','临夏'],['P','甘南']] },
        { name: '青海省', abbr: '青', codes: [['A','西宁'],['B','海东'],['C','海北'],['D','黄南'],['E','海南'],['F','果洛'],['G','玉树'],['H','海西']] },
        { name: '宁夏回族自治区', abbr: '宁', codes: [['A','银川'],['B','石嘴山'],['C','吴忠'],['D','固原'],['E','中卫']] },
        { name: '新疆维吾尔自治区', abbr: '新', codes: [['A','乌鲁木齐'],['B','昌吉'],['C','石河子'],['D','奎屯'],['E','博尔塔拉'],['F','伊犁'],['G','塔城'],['H','阿勒泰'],['J','克拉玛依'],['K','吐鲁番'],['L','哈密'],['M','巴音郭楞'],['N','阿克苏'],['P','克孜勒苏'],['Q','喀什'],['R','和田']] }
      ]
    }
  ];

  /* 特殊车牌 */
  var SPECIAL = [
    { abbr: '使', name: '驻华使馆',   desc: '外国驻华大使馆、领事馆专用' },
    { abbr: '领', name: '领事馆',     desc: '外国驻华领事馆专用' },
    { abbr: '警', name: '警车',       desc: '公安、司法等部门警用车辆' },
    { abbr: '军', name: '军队',       desc: '中国人民解放军车辆' },
    { abbr: '挂', name: '港澳入境',   desc: '港澳入出境车辆专用' },
    { abbr: '学', name: '教练车',     desc: '驾驶培训学校学员用车' },
    { abbr: '试', name: '试验车',     desc: '汽车试验用临时牌照' },
    { abbr: '超', name: '超限车',     desc: '超过国家规定尺寸 / 载重的特种运输车' }
  ];

  var searchInput, listEl, emptyEl, statsEl;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (inited) return;
    var page = document.getElementById('page-carlist');
    if (!page) return;

    searchInput = document.getElementById('clSearch');
    listEl      = document.getElementById('clList');
    emptyEl     = document.getElementById('clEmpty');
    statsEl     = document.getElementById('clStats');
    if (!listEl) return;

    inited = true;
    render();
    bindEvents();
    console.log('[车牌一览] 已加载');
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var totalProvince = 0;
    var totalCode = 0;

    var html = DATA.map(function (region) {
      var provinceHtml = region.provinces.map(function (p) {
        totalProvince++;
        totalCode += p.codes.length;

        var searchKey = (p.name + p.abbr + region.region + p.codes.map(function (c) {
          return p.abbr + c[0] + c[1];
        }).join('')).toLowerCase();

        var codesHtml = p.codes.map(function (c) {
          return '<div class="cl-code-item" data-k="' + esc((p.abbr + c[0] + c[1]).toLowerCase()) + '">' +
            '<span class="cl-code">' + esc(p.abbr) + '<b>' + esc(c[0]) + '</b></span>' +
            '<span class="cl-city">' + esc(c[1]) + '</span>' +
          '</div>';
        }).join('');

        return '<div class="cl-province-card" data-search="' + esc(searchKey) + '">' +
          '<div class="cl-province-head">' +
            '<span class="cl-province-abbr">' + esc(p.abbr) + '</span>' +
            '<span class="cl-province-name">' + esc(p.name) + '</span>' +
            '<span class="cl-province-count">' + p.codes.length + ' 个代码</span>' +
          '</div>' +
          '<div class="cl-code-list">' + codesHtml + '</div>' +
        '</div>';
      }).join('');

      return '<div class="cl-region" data-region="' + esc(region.region) + '">' +
        '<div class="cl-region-head">' +
          '<span class="cl-region-dot"></span>' +
          '<h3>' + esc(region.region) + '</h3>' +
          '<span class="cl-region-line"></span>' +
        '</div>' +
        '<div class="cl-province-grid">' + provinceHtml + '</div>' +
      '</div>';
    }).join('');

    /* 特殊车牌 */
    var specialHtml = SPECIAL.map(function (s) {
      return '<div class="cl-special-item">' +
        '<span class="cl-special-abbr">' + esc(s.abbr) + '</span>' +
        '<div class="cl-special-body">' +
          '<b>' + esc(s.name) + '</b>' +
          '<span>' + esc(s.desc) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    html += '<div class="cl-region cl-region-special" data-region="特殊车牌">' +
      '<div class="cl-region-head">' +
        '<span class="cl-region-dot"></span>' +
        '<h3>特殊车牌</h3>' +
        '<span class="cl-region-line"></span>' +
      '</div>' +
      '<div class="cl-special-grid">' + specialHtml + '</div>' +
    '</div>';

    listEl.innerHTML = html;

    if (statsEl) {
      statsEl.innerHTML =
        '<span>共 <b>' + DATA.length + '</b> 个大区</span>' +
        '<span>·</span>' +
        '<span><b>' + totalProvince + '</b> 个省级行政区</span>' +
        '<span>·</span>' +
        '<span><b>' + totalCode + '</b> 个车牌代码</span>';
    }
  }

  /* ---------- 搜索 ---------- */
  function bindEvents() {
    if (!searchInput) return;
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();

      // 清空按钮状态
      var clearBtn = document.getElementById('clClear');
      if (clearBtn) clearBtn.hidden = !q;

      var provinceCards = listEl.querySelectorAll('.cl-province-card');
      var regionBlocks  = listEl.querySelectorAll('.cl-region');

      if (!q) {
        provinceCards.forEach(function (c) {
          c.style.display = '';
          var items = c.querySelectorAll('.cl-code-item');
          items.forEach(function (it) { it.style.display = ''; });
        });
        regionBlocks.forEach(function (r) { r.style.display = ''; });
        if (emptyEl) emptyEl.style.display = 'none';
        return;
      }

      provinceCards.forEach(function (c) {
        var search = c.dataset.search || '';
        var provinceMatch = search.indexOf(q) !== -1;

        // 如果省份名本身匹配，显示全部代码；否则只显示匹配的代码
        var items = c.querySelectorAll('.cl-code-item');
        var anyCodeMatch = false;
        items.forEach(function (it) {
          var codeKey = it.dataset.k || '';
          var cityText = (it.querySelector('.cl-city') || {}).textContent || '';
          var ok = provinceMatch || codeKey.indexOf(q) !== -1 || cityText.toLowerCase().indexOf(q) !== -1;
          it.style.display = ok ? '' : 'none';
          if (ok) anyCodeMatch = true;
        });

        c.style.display = anyCodeMatch ? '' : 'none';
      });

      // 大区标题：该大区内无可见省份则隐藏
      regionBlocks.forEach(function (r) {
        var visibleCards = r.querySelectorAll('.cl-province-card:not([style*="display: none"])');
        var specials = r.querySelectorAll('.cl-special-item');
        var specialMatch = false;
        if (specials.length) {
          specials.forEach(function (s) {
            var ok = (s.textContent || '').toLowerCase().indexOf(q) !== -1;
            s.style.display = ok ? '' : 'none';
            if (ok) specialMatch = true;
          });
        }
        var anyVisible = false;
        if (visibleCards.length) anyVisible = true;
        if (specialMatch) anyVisible = true;
        r.style.display = anyVisible ? '' : 'none';
      });

      // 是否所有内容都被隐藏
      var anyRegionVisible = false;
      regionBlocks.forEach(function (r) {
        if (r.style.display !== 'none') anyRegionVisible = true;
      });
      if (emptyEl) emptyEl.style.display = anyRegionVisible ? 'none' : 'block';
    });

    var clearBtn = document.getElementById('clClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.focus();
      });
    }
  }

  window.__carlistInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();