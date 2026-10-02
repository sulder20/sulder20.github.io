/* ============================================================
   人体系统速查 · 岁窦工具箱 V4.0 · 扁平图标版
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-bodysystems');
  if (!page) return;

  var tabsEl   = document.getElementById('bsTabs');
  var detailEl = document.getElementById('bsDetail');
  var searchEl = document.getElementById('bsSearch');

  /* ---------- 扁平线性 SVG 图标（24x24，与全站风格一致） ---------- */
  var SVG = {
    skeletal:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M6 6v12M3 9v6M18 6v12M21 9v6M6 12h12"/>' +
      '</svg>',
    digestive:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9 3v6a5 5 0 0 0 5 5h2a4 4 0 0 1 0 8h-4a7 7 0 0 1-7-7V3"/>' +
      '<path d="M14 18h2"/>' +
      '</svg>',
    respiratory:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 3v9"/>' +
      '<path d="M12 8c-2 0-4 1.5-4 4v6a2 2 0 0 0 2 2h2"/>' +
      '<path d="M12 8c2 0 4 1.5 4 4v6a2 2 0 0 1-2 2h-2"/>' +
      '</svg>',
    circulatory:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z"/>' +
      '<path d="M9 10h2l1-2 1 4 1-2h2"/>' +
      '</svg>',
    urinary:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M8 5c-3 0-5 2.5-5 6 0 5 3 9 6 9 2 0 3-1.5 3-3.5S11 13 11 10 10.5 5 8 5z"/>' +
    '<path d="M16 5c3 0 5 2.5 5 6 0 5-3 9-6 9-2 0-3-1.5-3-3.5S13 13 13 10s.5-5 3-5z"/>' +
    '</svg>',
    nervous:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 4a3.5 3.5 0 0 0-3.5 3.5A3 3 0 0 0 6 10.5a3 3 0 0 0 1.5 2.6A3 3 0 0 0 9 18h1.5"/>' +
      '<path d="M12 4a3.5 3.5 0 0 1 3.5 3.5A3 3 0 0 1 18 10.5a3 3 0 0 1-1.5 2.6A3 3 0 0 1 15 18h-1.5"/>' +
      '<path d="M12 4v14"/>' +
      '</svg>',
    endocrine:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="2.5"/>' +
      '<circle cx="5" cy="6" r="1.8"/>' +
      '<circle cx="19" cy="6" r="1.8"/>' +
      '<circle cx="5" cy="18" r="1.8"/>' +
      '<circle cx="19" cy="18" r="1.8"/>' +
      '<path d="M6.5 7.2l3.6 3.4M17.5 7.2l-3.6 3.4M6.5 16.8l3.6-3.4M17.5 16.8l-3.6-3.4"/>' +
      '</svg>',
    reproductive:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="9" cy="8" r="3"/>' +
      '<circle cx="17" cy="10" r="2.2"/>' +
      '<path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/>' +
      '<path d="M15 20c0-2 1.8-3.5 4-3.5s3 1 3 3"/>' +
      '</svg>'
  };

  var SYSTEMS = [
    {
      id: 'skeletal',
      icon: SVG.skeletal,
      name: '运动系统',
      func: '支撑、保护、运动',
      desc: '由骨、骨连结和骨骼肌组成。成人有 206 块骨，构成人体支架，保护内脏，与肌肉配合完成各种运动。',
      organs: [
        { name: '颅骨', role: '保护脑；由 22 块骨组成' },
        { name: '脊柱', role: '支撑身体，保护脊髓，有 33 块椎骨' },
        { name: '胸廓', role: '保护心肺，由胸骨、肋骨、胸椎组成' },
        { name: '四肢骨', role: '上肢骨 64 块，下肢骨 62 块' },
        { name: '骨骼肌', role: '600 多块，通过收缩牵动骨骼产生运动' },
        { name: '关节', role: '骨与骨之间的活动连接' }
      ],
      diseases: ['骨折', '骨质疏松', '关节炎', '腰椎间盘突出', '肌肉拉伤', '腱鞘炎'],
      tips: ['每周 150 分钟中等强度运动', '补钙 + 晒太阳促进维生素 D 合成', '避免长时间低头和久坐']
    },
    {
      id: 'digestive',
      icon: SVG.digestive,
      name: '消化系统',
      func: '消化食物、吸收营养',
      desc: '由消化道和消化腺组成，全长约 8-9 米。将食物分解为可吸收的小分子，通过小肠吸收进入血液。',
      organs: [
        { name: '口腔', role: '牙齿咀嚼、唾液淀粉酶初步分解淀粉' },
        { name: '食管', role: '通过蠕动把食物送入胃' },
        { name: '胃', role: '胃酸 + 胃蛋白酶，初步消化蛋白质' },
        { name: '小肠', role: '消化和吸收的主要场所，长 5-6 米' },
        { name: '大肠', role: '吸收水分，形成粪便' },
        { name: '肝脏', role: '最大的消化腺，分泌胆汁乳化脂肪' },
        { name: '胰腺', role: '分泌胰液，含多种消化酶' }
      ],
      diseases: ['胃炎', '胃溃疡', '阑尾炎', '胆结石', '肠炎', '便秘', '消化不良'],
      tips: ['三餐规律，少食多餐', '细嚼慢咽，减少胃肠负担', '多吃膳食纤维，少吃高脂高糖']
    },
    {
      id: 'respiratory',
      icon: SVG.respiratory,
      name: '呼吸系统',
      func: '气体交换',
      desc: '由呼吸道和肺组成。呼吸道包括鼻、咽、喉、气管、支气管，是气体进出的通道；肺是气体交换的主要场所。',
      organs: [
        { name: '鼻腔', role: '温暖、湿润、清洁吸入的空气' },
        { name: '咽', role: '呼吸道和消化道的共同通道' },
        { name: '喉', role: '含声带，是发声器官' },
        { name: '气管和支气管', role: '纤毛和黏液清洁空气' },
        { name: '肺', role: '约 3 亿个肺泡，进行气体交换' },
        { name: '膈肌', role: '主要的呼吸肌，协助完成呼吸运动' }
      ],
      diseases: ['感冒', '支气管炎', '肺炎', '哮喘', '慢阻肺', '肺结核', '肺癌'],
      tips: ['不吸烟，远离二手烟', '雾霾天戴口罩', '保持室内通风']
    },
    {
      id: 'circulatory',
      icon: SVG.circulatory,
      name: '循环系统',
      func: '运输血液、氧气、营养',
      desc: '由心脏、血管和血液组成。心脏是泵，血管是管道，血液运输氧气、养料、二氧化碳和废物。',
      organs: [
        { name: '心脏', role: '四腔结构，每分钟跳 60-100 次' },
        { name: '动脉', role: '把血液从心脏送到全身' },
        { name: '静脉', role: '把血液送回心脏' },
        { name: '毛细血管', role: '进行物质交换的场所' },
        { name: '血液', role: '红细胞运输氧气，白细胞免疫，血小板凝血' },
        { name: '淋巴系统', role: '回收组织液，参与免疫' }
      ],
      diseases: ['高血压', '冠心病', '心肌梗死', '心律失常', '贫血', '静脉曲张', '动脉硬化'],
      tips: ['低盐低脂饮食', '规律有氧运动', '控制血压血脂血糖', '戒烟限酒']
    },
    {
      id: 'urinary',
      icon: SVG.urinary,
      name: '泌尿系统',
      func: '排出代谢废物',
      desc: '由肾脏、输尿管、膀胱和尿道组成。肾脏是主要器官，通过形成尿液排出尿素、多余水分和盐。',
      organs: [
        { name: '肾脏', role: '一对，约 100 万个肾单位，形成尿液' },
        { name: '输尿管', role: '把尿液从肾脏送到膀胱' },
        { name: '膀胱', role: '暂时储存尿液' },
        { name: '尿道', role: '把尿液排出体外' }
      ],
      diseases: ['肾炎', '肾结石', '尿路感染', '肾衰竭', '前列腺增生'],
      tips: ['每天喝水 1500-2000 mL', '不憋尿', '少吃高盐高嘌呤食物']
    },
    {
      id: 'nervous',
      icon: SVG.nervous,
      name: '神经系统',
      func: '调节和控制全身活动',
      desc: '由中枢神经系统（脑和脊髓）和周围神经系统（脑神经、脊神经）组成，是人体各系统协调的指挥中心。',
      organs: [
        { name: '大脑', role: '高级中枢，负责思维、记忆、语言' },
        { name: '小脑', role: '协调运动，维持平衡' },
        { name: '脑干', role: '生命中枢，控制呼吸、心跳' },
        { name: '脊髓', role: '低级反射中枢，传导神经冲动' },
        { name: '脑神经', role: '12 对，支配头面部' },
        { name: '脊神经', role: '31 对，支配躯干和四肢' }
      ],
      diseases: ['头痛', '脑卒中', '帕金森病', '癫痫', '神经衰弱', '失眠'],
      tips: ['保证 7-9 小时睡眠', '多用脑，常读书学习', '避免长时间盯屏幕']
    },
    {
      id: 'endocrine',
      icon: SVG.endocrine,
      name: '内分泌系统',
      func: '分泌激素、调节代谢',
      desc: '由内分泌腺组成，分泌激素直接进入血液，调节生长、发育、代谢、生殖等生命活动。',
      organs: [
        { name: '垂体', role: '分泌生长激素，调节其它内分泌腺' },
        { name: '甲状腺', role: '分泌甲状腺激素，调节代谢' },
        { name: '甲状旁腺', role: '调节血钙' },
        { name: '肾上腺', role: '分泌肾上腺素，应激反应' },
        { name: '胰岛', role: '分泌胰岛素和胰高血糖素，调节血糖' },
        { name: '性腺', role: '分泌性激素，调节生殖功能' }
      ],
      diseases: ['糖尿病', '甲亢', '甲减', '肥胖症', '生长发育迟缓', '骨质疏松'],
      tips: ['规律作息，不熬夜', '控制糖分摄入', '定期体检，关注激素指标']
    },
    {
      id: 'reproductive',
      icon: SVG.reproductive,
      name: '生殖系统',
      func: '产生生殖细胞、繁衍后代',
      desc: '男性生殖系统包括睾丸、附睾、输精管等；女性包括卵巢、输卵管、子宫、阴道等。负责产生生殖细胞和激素。',
      organs: [
        { name: '睾丸', role: '男性主要生殖器官，产生精子和雄激素' },
        { name: '附睾', role: '精子成熟与储存的场所' },
        { name: '输精管', role: '输送精子' },
        { name: '卵巢', role: '女性主要生殖器官，产生卵子和雌激素' },
        { name: '输卵管', role: '卵子受精的场所' },
        { name: '子宫', role: '胚胎和胎儿发育的场所' }
      ],
      diseases: ['前列腺炎', '月经不调', '子宫肌瘤', '不孕不育', '卵巢囊肿'],
      tips: ['注意个人卫生', '规律作息，戒烟限酒', '定期进行妇科 / 男科检查']
    }
  ];

  var currentId = 'skeletal';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }

  function renderTabs(filter) {
    var q = String(filter || '').trim().toLowerCase();
    tabsEl.innerHTML = SYSTEMS.map(function (s) {
      var hit = !q || s.name.indexOf(q) >= 0 || s.func.indexOf(q) >= 0 ||
                s.organs.some(function (o) { return o.name.indexOf(q) >= 0 || o.role.indexOf(q) >= 0; }) ||
                s.diseases.some(function (d) { return d.indexOf(q) >= 0; });
      if (!hit && q) return '';
      return '<button type="button" class="bs-tab' + (currentId === s.id ? ' active' : '') + '" data-bs="' + s.id + '">' +
        '<span class="bs-tab-icon">' + s.icon + '</span>' +
        '<span class="bs-tab-name">' + esc(s.name) + '</span>' +
        '<span class="bs-tab-count">' + s.organs.length + ' 器官</span>' +
      '</button>';
    }).join('');

    tabsEl.querySelectorAll('.bs-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        currentId = t.dataset.bs;
        renderTabs(searchEl.value);
        renderDetail();
      });
    });
  }

  function renderDetail() {
    var s = SYSTEMS.find(function (x) { return x.id === currentId; });
    if (!s) { detailEl.innerHTML = ''; return; }

    var html = '<div class="bs-detail-card">' +
      '<div class="bs-detail-head">' +
        '<h3 class="bs-detail-name"><span class="bs-detail-icon">' + s.icon + '</span>' + esc(s.name) + '</h3>' +
        '<span class="bs-detail-func">' + esc(s.func) + '</span>' +
      '</div>' +
      '<p class="bs-detail-desc">' + esc(s.desc) + '</p>' +

      '<div class="bs-section">' +
        '<div class="bs-section-title">主要器官</div>' +
        '<div class="bs-organ-grid">' +
          s.organs.map(function (o) {
            return '<div class="bs-organ">' +
              '<div class="bs-organ-name">' + esc(o.name) + '</div>' +
              '<div class="bs-organ-role">' + esc(o.role) + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="bs-section">' +
        '<div class="bs-section-title">常见疾病</div>' +
        '<div class="bs-disease-list">' +
          s.diseases.map(function (d) { return '<span class="bs-disease">' + esc(d) + '</span>'; }).join('') +
        '</div>' +
      '</div>' +

      '<div class="bs-section">' +
        '<div class="bs-section-title">日常保健</div>' +
        '<ul class="bs-tips-list">' +
          s.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
        '</ul>' +
      '</div>' +
    '</div>';

    detailEl.innerHTML = html;
  }

  searchEl.addEventListener('input', function () {
    renderTabs(searchEl.value);
  });

  function init() {
    if (window.__bodysystemsInited) return;
    window.__bodysystemsInited = true;
    renderTabs('');
    renderDetail();
  }
  window.__bodysystemsInit = function () { if (!window.__bodysystemsInited) init(); };

  if (page.classList.contains('active')) init();
  console.log('[人体系统速查] 已加载');
})();