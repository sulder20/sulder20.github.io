/* ============================================================
   急救知识速查 · V4.1 活力版
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-firstaid');
  if (!page) return;

  const INFO_KEY = 'suidou-firstaid-infocard-v1';

  /* ---------- 数据：12 个场景 ---------- */
  const SCENES = [
    {
      id: 'cpr', name: '心肺复苏 CPR', level: 'red',
      audience: ['adult','child','infant'],
      tagline: '心跳呼吸停止时，争取每一秒',
      judge: '轻拍双肩、高声呼叫无反应，同时观察胸廓无起伏（或仅有濒死叹息），不超过 10 秒',
      steps: [
        { title: '确认环境安全', desc: '观察四周，确保对你和伤者都安全，再靠近' },
        { title: '判断意识和呼吸', desc: '拍双肩、喊两声，同时看胸廓是否起伏，10 秒内完成' },
        { title: '呼叫 120 并取 AED', desc: '指定某人拨打 120，指定另一人取 AED，你自己不要离开' },
        { title: '开始胸外按压', desc: '两手交叠，掌根压在胸骨下半段，深度 5-6cm，频率 100-120 次/分' },
        { title: '30 次按压 + 2 次人工呼吸', desc: '按压 30 次，仰头抬颏开放气道，吹气 2 次，每次 1 秒，循环进行' },
        { title: 'AED 到达后立即使用', desc: '开机，全程听从语音提示，除颤后立即继续按压' }
      ],
      stepsChild: [
        { title: '确认环境安全', desc: '同成人' },
        { title: '判断意识和呼吸', desc: '同成人，10 秒内完成' },
        { title: '呼叫 120 并取 AED', desc: '同成人' },
        { title: '开始胸外按压', desc: '单手或双手掌根，深度约 5cm，频率 100-120 次/分' },
        { title: '30 次按压 + 2 次人工呼吸', desc: '比例同成人，吹气量减小，看到胸廓微起即可' },
        { title: 'AED 到达后立即使用', desc: '儿童可使用成人电极片，有条件优先用儿童电极片' }
      ],
      stepsInfant: [
        { title: '确认环境安全', desc: '同成人' },
        { title: '判断意识和呼吸', desc: '拍足底、弹足跟，观察反应，10 秒内完成' },
        { title: '呼叫 120 并取 AED', desc: '同成人' },
        { title: '开始胸外按压', desc: '两指（或环抱双拇指），按压两乳头连线中点下方，深度约 4cm，频率 100-120 次/分' },
        { title: '30 次按压 + 2 次人工呼吸', desc: '吹气时罩住口鼻，吹气量以看到胸廓微起为准，30:2 循环' },
        { title: 'AED 到达后立即使用', desc: '优先使用儿童电极片或儿童模式' }
      ],
      dont: [
        '不要按在肋骨上，会按断肋骨',
        '不要在软床上按压，要挪到硬地板',
        '不要因为"没反应"就中断按压，除非 AED 提示或伤者恢复',
        '中断按压时间不要超过 10 秒'
      ],
      call120: '只要无反应 + 无呼吸，立即拨打 120，同时让人取 AED',
      related: ['choking','drowning','electric'],
      cprMetronome: true
    },
    {
      id: 'choking', name: '异物卡喉（海姆立克）', level: 'red',
      audience: ['adult','child','infant'],
      tagline: '能咳就让他咳，不能咳就立刻冲击',
      judge: '双手抓喉、面色发紫、不能说话不能咳嗽 → 完全梗阻，立即施救',
      steps: [
        { title: '判断梗阻程度', desc: '能大声咳嗽 → 鼓励继续咳；不能咳、不能说话、面色发紫 → 立即施救' },
        { title: '成人：腹部冲击', desc: '站到背后，一手握拳抵住肚脐上方两指，另一手包住，快速向内向上冲击' },
        { title: '反复冲击直到排出', desc: '每次冲击独立、有力，直到异物排出或伤者失去意识' },
        { title: '失去意识则立即 CPR', desc: '伤者倒地无反应，立即开始心肺复苏，按压时顺便检查口腔' },
        { title: '拨打 120', desc: '即使异物排出，也建议就医检查，可能造成内脏损伤' }
      ],
      stepsChild: [
        { title: '判断梗阻程度', desc: '同成人' },
        { title: '儿童：腹部冲击（力度减轻）', desc: '跪在孩子身后，手法同成人，力度明显减小' },
        { title: '反复冲击直到排出', desc: '同成人' },
        { title: '失去意识则立即 CPR', desc: '同成人' },
        { title: '拨打 120', desc: '同成人' }
      ],
      stepsInfant: [
        { title: '判断梗阻程度', desc: '婴儿不能咳、不能哭、面色发紫 → 立即施救' },
        { title: '5 次拍背', desc: '前臂托住婴儿，头低脚高，用手掌根部在两肩胛骨之间拍 5 次' },
        { title: '5 次压胸', desc: '翻转仰卧，两指在两乳头连线中点下方快速按压 5 次' },
        { title: '交替拍背压胸', desc: '5 次拍背 + 5 次压胸循环，直到异物排出' },
        { title: '失去意识则立即 CPR', desc: '婴儿 CPR 用两指，深度约 4cm' },
        { title: '拨打 120', desc: '无论是否排出，立即送医' }
      ],
      dont: [
        '不要给清醒能咳嗽的人做腹部冲击',
        '不要用手指盲目去掏（可能把异物推得更深）',
        '婴儿不要做腹部冲击，要用拍背 + 压胸',
        '孕妇和肥胖者改做胸部冲击'
      ],
      call120: '完全梗阻伴面色发紫，一边施救一边让旁边人拨打 120',
      related: ['cpr']
    },
    {
      id: 'drowning', name: '溺水', level: 'red',
      audience: ['adult','child','infant'],
      tagline: '先救己，后救人，上岸立刻判断呼吸',
      judge: '从水中救出，无反应 + 无呼吸 → 立即 CPR',
      steps: [
        { title: '先保证自己安全', desc: '不会游泳不要下水，用竹竿、绳子、漂浮物施救，同时呼叫 120' },
        { title: '拉上岸', desc: '从背后接近，避免被抱住，上岸后平放地面' },
        { title: '判断意识和呼吸', desc: '拍肩呼叫，观察胸廓，10 秒内完成' },
        { title: '无呼吸立即 CPR', desc: '先 2 次人工呼吸，再开始 30:2 循环（溺水优先给气）' },
        { title: '有呼吸则侧卧保暖', desc: '恢复侧卧体位，脱去湿衣，用毛毯包裹，等待救护车' },
        { title: '不要倒挂控水', desc: '倒挂控水是错误做法，会延误 CPR，也不要浪费时间去控水' }
      ],
      dont: [
        '不要倒挂控水，这是过时的错误做法',
        '不要为了控水耽误 CPR',
        '不要给无呼吸的溺水者只做胸外按压',
        '不要轻易下水救人（不会游泳就别下）'
      ],
      call120: '发现溺水立即拨打 120，同时开始施救',
      related: ['cpr']
    },
    {
      id: 'electric', name: '触电', level: 'red',
      audience: ['adult','child'],
      tagline: '先断电，再靠近，绝不能用手直接拉',
      judge: '有人触电倒地，第一件事是切断电源，不是去拉人',
      steps: [
        { title: '立即断电', desc: '关总闸、拔插头，或用绝缘物（干木棍、塑料）挑开电线' },
        { title: '确认断电后才能靠近', desc: '没断电前绝不能用手直接拉人，否则你也会触电' },
        { title: '判断意识和呼吸', desc: '断电后拍肩呼叫，观察胸廓，10 秒内完成' },
        { title: '无呼吸立即 CPR', desc: '触电后心跳骤停的，CPR 越早越好' },
        { title: '拨打 120', desc: '即使恢复意识也要送医，电击可能造成迟发性心律失常' },
        { title: '处理烧伤', desc: '电流进出口有烧伤，用干净纱布覆盖，不要涂牙膏酱油' }
      ],
      dont: [
        '不要徒手去拉触电者',
        '不要用湿木棍或金属物挑电线',
        '不要在没断电的情况下接触伤者',
        '不要给电击烧伤涂任何偏方'
      ],
      call120: '触电后一律立即拨打 120',
      related: ['cpr','burn']
    },
    {
      id: 'unconscious', name: '昏迷 / 无意识', level: 'red',
      audience: ['adult','child','infant'],
      tagline: '有呼吸侧卧，无呼吸 CPR',
      judge: '拍肩呼叫无反应，就要立即判断呼吸',
      steps: [
        { title: '拍肩呼叫', desc: '拍双肩，大声叫"你怎么了"，观察有无反应' },
        { title: '无反应立即呼叫 120', desc: '让旁边人拨打，自己不要离开' },
        { title: '判断呼吸 10 秒', desc: '看胸廓起伏、听呼吸声、感觉气流，不超过 10 秒' },
        { title: '有呼吸 → 侧卧', desc: '恢复侧卧体位，防止呕吐物误吸，保暖，等待救护车' },
        { title: '无呼吸 → 立即 CPR', desc: '开始 30:2 心肺复苏' },
        { title: '持续观察', desc: '侧卧期间每 1-2 分钟检查一次呼吸，呼吸停止立即 CPR' }
      ],
      dont: [
        '不要给无意识的人喂水喂药',
        '不要垫高枕头（可能堵气道）',
        '有呼吸时不要做 CPR',
        '不要离开无意识的人'
      ],
      call120: '无反应且无呼吸，立即 120 + CPR；有呼吸也要 120',
      related: ['cpr']
    },
    {
      id: 'bleeding', name: '大出血', level: 'red',
      audience: ['adult','child'],
      tagline: '直接压迫最有效，止血带是最后手段',
      judge: '伤口持续喷射状出血，或血液快速浸透敷料',
      steps: [
        { title: '直接压迫', desc: '戴手套，用无菌纱布或干净布料直接按压伤口，用力压住' },
        { title: '加压包扎', desc: '压住不松，用绷带加压包扎，敷料浸透不要换，直接在上面加' },
        { title: '填塞止血', desc: '深而大的伤口，用长纱布条填满伤口腔，再用力按压' },
        { title: '止血带（四肢大出血）', desc: '在伤口近心端 5-7cm 处绑止血带，勒紧到出血停止，记下时间' },
        { title: '抗休克', desc: '平躺、抬高下肢 30cm、保暖、不要喂水' },
        { title: '立即送医', desc: '大出血必须尽快送医，止血带超过 1 小时要告知医生时间' }
      ],
      dont: [
        '不要频繁打开看伤口',
        '不要把浸透的敷料揭下来换（会破坏血凝块）',
        '止血带不要绑在关节上',
        '止血带不要轻易松开（除非医生指示）'
      ],
      call120: '大出血立即拨打 120，同时止血',
      related: []
    },
    {
      id: 'stroke', name: '中风 FAST 识别', level: 'red',
      audience: ['adult'],
      tagline: '记住 FAST，抢 4.5 小时黄金时间',
      judge: 'F 脸歪 / A 抬臂无力 / S 说话不清，任一出现立即 120',
      steps: [
        { title: 'F — Face 面部', desc: '让患者微笑，看是否一侧脸部下垂、口角歪斜' },
        { title: 'A — Arms 手臂', desc: '让患者平举双臂，看是否一侧手臂无力下垂' },
        { title: 'S — Speech 语言', desc: '让患者重复一句简单的话，看是否含糊不清、用词错误' },
        { title: 'T — Time 记时间', desc: '记下症状出现的准确时间，这决定能不能溶栓' },
        { title: '立即拨打 120', desc: '以上任一项异常，立即 120，不要等、不要观察' },
        { title: '侧卧、不要喂药', desc: '有呕吐倾向的侧卧，不要喂水喂药喂食' }
      ],
      dont: [
        '不要等"再观察观察"，脑细胞每分钟死 190 万个',
        '不要给患者喂阿司匹林（可能是出血性中风）',
        '不要喂水喂饭',
        '不要自行开车送医（路上出事没人管）'
      ],
      call120: '任一 FAST 异常立即拨打 120，越快越好',
      related: ['unconscious']
    },
    {
      id: 'heartattack', name: '心脏病发作', level: 'red',
      audience: ['adult'],
      tagline: '停止活动、含药、等 120',
      judge: '压榨性胸痛超过 15 分钟，放射到左臂、下巴、后背，伴冷汗',
      steps: [
        { title: '立即停止一切活动', desc: '就地坐下或半卧，不要走动、不要爬楼' },
        { title: '含服硝酸甘油（有条件）', desc: '舌下含服硝酸甘油 1 片，5 分钟后不缓解可再含 1 片（最多 3 片）' },
        { title: '嚼服阿司匹林 300mg', desc: '无禁忌（无过敏、无活动性出血）时嚼服 300mg 阿司匹林' },
        { title: '拨打 120', desc: '胸痛不缓解立即 120，不要自行开车' },
        { title: '保持安静等救护车', desc: '松开领口、保持镇静、不要剧烈活动' },
        { title: '失去意识立即 CPR', desc: '心跳骤停立即开始 30:2 心肺复苏' }
      ],
      dont: [
        '不要硬撑、不要自己去医院',
        '不要做任何体力活动',
        '血压低于 90/60 时不要含硝酸甘油',
        '不要给阿斯匹林过敏或有活动性出血的人嚼服'
      ],
      call120: '胸痛超过 15 分钟不缓解，立即 120',
      related: ['cpr']
    },
    {
      id: 'heatstroke', name: '中暑', level: 'orange',
      audience: ['adult','child'],
      tagline: '先降温，再补液，重症立即送医',
      judge: '高温环境下头晕、恶心、乏力；严重者体温＞40℃、意识模糊',
      steps: [
        { title: '快速移到阴凉处', desc: '有空调最好，没有就找树荫、风扇、通风处' },
        { title: '松衣、降温', desc: '解衣、脱鞋，用湿毛巾擦身、冰袋敷腋下大腿根' },
        { title: '补液（清醒者）', desc: '喝淡盐水、运动饮料或凉白开，小口多次' },
        { title: '重症立即送医', desc: '体温＞40℃、意识模糊、抽搐、无汗 → 立即 120' },
        { title: '持续监测', desc: '每 10 分钟测一次体温，降到 38℃ 以下停止强降温' }
      ],
      dont: [
        '不要给意识不清的人喂水',
        '不要用酒精大面积擦身（可能中毒）',
        '不要把人闷在车里',
        '重症不要犹豫，直接 120'
      ],
      call120: '重症中暑（意识不清、体温＞40℃）立即拨打 120',
      related: []
    },
    {
      id: 'burn', name: '烧烫伤', level: 'orange',
      audience: ['adult','child','infant'],
      tagline: '冲脱泡盖送，五字口诀',
      judge: '开水、热油、明火、蒸汽、化学品造成的皮肤损伤',
      steps: [
        { title: '冲 — 冷水冲 15-20 分钟', desc: '用流动的凉水（不是冰水）持续冲 15-20 分钟' },
        { title: '脱 — 边冲边脱衣', desc: '小心脱去覆盖的衣物，粘住的不要硬撕' },
        { title: '泡 — 继续泡 10-30 分钟', desc: '疼痛明显的泡在凉水里，大面积或幼儿不宜泡过久' },
        { title: '盖 — 干净纱布覆盖', desc: '用无菌纱布或干净布单覆盖伤口，不要涂任何东西' },
        { title: '送 — 严重送医', desc: '面积超过手掌、面部/关节/会阴、起大水泡、化学品烧伤 → 送医' },
        { title: '化学品烧伤：先大量清水冲', desc: '冲 20 分钟以上，边冲边脱污染衣物' }
      ],
      dont: [
        '不要涂牙膏、酱油、食用油、紫药水',
        '不要用冰块直接敷（会冻伤）',
        '不要挑破水泡',
        '不要贴创可贴（闷住伤口）'
      ],
      call120: '面积大、面部/关节受伤、化学品烧伤、意识不清 → 立即 120',
      related: ['electric']
    },
    {
      id: 'sprain', name: '扭伤 / 骨折', level: 'orange',
      audience: ['adult','child'],
      tagline: 'RICE 急救，骨折先固定',
      judge: '扭伤：局部肿痛、活动受限；骨折：畸形、骨擦音、异常活动',
      steps: [
        { title: 'R — Rest 制动', desc: '停止活动，不要让受伤部位承重或活动' },
        { title: 'I — Ice 冰敷', desc: '用毛巾包冰袋敷 15-20 分钟，每 2 小时一次，48 小时内' },
        { title: 'C — Compression 加压', desc: '弹力绷带轻轻包扎，不要过紧（远端不能发麻发紫）' },
        { title: 'E — Elevation 抬高', desc: '把受伤部位抬到心脏水平以上，减少肿胀' },
        { title: '骨折先固定', desc: '用夹板、硬纸板、树枝固定上下两个关节，再送医' },
        { title: '开放性骨折：先止血覆盖', desc: '不要试图把骨头推回去，用干净敷料覆盖后固定' }
      ],
      dont: [
        '不要热敷（48 小时内）',
        '不要揉搓肿胀处',
        '不要给骨折者强行复位',
        '不要让受伤部位继续活动'
      ],
      call120: '严重骨折、开放骨折、大面积损伤、不能移动 → 拨打 120',
      related: []
    },
    {
      id: 'minor', name: '常见小意外', level: 'yellow',
      audience: ['adult','child','infant'],
      tagline: '六个最常见的居家应急处理',
      judge: '意识清醒、能说话、能活动、无大出血的情况',
      isCollection: true,
      items: [
        {
          name: '鼻出血',
          steps: ['坐直，头微微前倾（不要仰头）','用拇指食指捏住鼻翼两侧，持续按压 10 分钟','同时用嘴呼吸','10 分钟仍不止，去医院'],
          dont: '不要仰头（血会流到喉咙）；不要塞纸巾乱挖'
        },
        {
          name: '蜂蛰',
          steps: ['用硬卡片（如银行卡）刮出毒刺，不要用手拔','用肥皂水清洗伤口','冰敷减轻肿痛','出现呼吸困难、全身荨麻疹 → 立即 120（过敏性休克）'],
          dont: '不要用手指或镊子拔毒刺（会挤更多毒液）'
        },
        {
          name: '异物入眼',
          steps: ['不要揉眼','翻开眼皮，用流动清水从内眼角向外冲','眨眼让异物随眼泪冲出','异物嵌入眼球或化学品入眼 → 立即就医'],
          dont: '不要揉；不要用棉签去挑'
        },
        {
          name: '小面积烫伤',
          steps: ['冷水冲 15-20 分钟','不涂任何东西，用干净纱布覆盖','起水泡不要挑破','面积大或位置特殊 → 就医'],
          dont: '不要涂牙膏酱油'
        },
        {
          name: '轻微擦伤',
          steps: ['流动清水冲洗伤口','碘伏消毒（不要用酒精，太疼）','无菌纱布覆盖或创可贴','伤口有泥沙冲不出或深 → 就医'],
          dont: '不要用酒精直接消毒伤口；不要用嘴吸'
        },
        {
          name: '抽筋',
          steps: ['立即停止运动','缓慢拉伸抽筋的肌肉（小腿抽筋：勾脚尖）','轻柔按摩','热敷放松','反复抽筋或伴其他症状 → 就医'],
          dont: '不要突然用力拉；不要继续运动'
        }
      ],
      dont: [],
      call120: '小意外一般不需 120，但出现意识不清、呼吸困难、持续出血等情况立即拨打',
      related: []
    }
  ];

  const LEVEL_LABEL = { red: '立即 120', orange: '紧急处理', yellow: '可自行处理' };
  const LEVEL_TEXT  = { red: '红',      orange: '橙',      yellow: '黄' };

  const $ = id => document.getElementById(id);
  let currentAudience = 'adult';
  let currentSceneId = null;
  let searchQ = '';

  /* ---------- 主视图渲染 ---------- */
  function pickSteps(s){
    if (currentAudience === 'child' && s.stepsChild) return s.stepsChild;
    if (currentAudience === 'infant' && s.stepsInfant) return s.stepsInfant;
    return s.steps;
  }

  function filteredScenes(){
    const q = searchQ.toLowerCase().trim();
    let arr = SCENES.slice();
    if (q){
      arr = arr.filter(s => {
        const hay = [s.name, s.tagline, s.judge].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    return arr;
  }

  function renderMain(){
    const grid = $('faGrid');
    const empty = $('faEmpty');
    const arr = filteredScenes();
    if (!arr.length){
      grid.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = arr.map(s => `
      <div class="fa-card level-${s.level}" data-fa-id="${s.id}">
        <div class="fa-card-head">
          <span class="fa-level-badge ${s.level}">${LEVEL_LABEL[s.level]}</span>
          <h3 class="fa-card-name">${esc(s.name)}</h3>
        </div>
        <p class="fa-card-tagline">${esc(s.tagline)}</p>
      </div>
    `).join('');
    grid.querySelectorAll('[data-fa-id]').forEach(el => {
      el.addEventListener('click', () => openDetail(el.dataset.faId));
    });
  }

  /* ---------- 详情视图 ---------- */
  function openDetail(id){
    const s = SCENES.find(x => x.id === id);
    if (!s) return;
    currentSceneId = id;
    $('faMainView').style.display = 'none';
    $('faDetailView').style.display = '';
    $('faDetailView').innerHTML = renderDetail(s);
    bindDetailEvents(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderDetail(s){
    const steps = pickSteps(s);
    const stepsHtml = s.isCollection
      ? renderMinor(s)
      : `
        <div class="fa-steps">
          ${steps.map((st, i) => `
            <div class="fa-step">
              <div class="fa-step-num">${i+1}</div>
              <div class="fa-step-body">
                <h4 class="fa-step-title">${esc(st.title)}</h4>
                <p class="fa-step-desc">${esc(st.desc)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;

    const dontHtml = (s.dont && s.dont.length) ? `
      <div class="fa-dont-box">
        <h4>⚠️ 千万不要做</h4>
        <ul>${s.dont.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
      </div>
    ` : '';

    const relatedHtml = (s.related && s.related.length) ? `
      <div class="fa-related">
        <span class="fa-related-label">相关场景：</span>
        ${s.related.map(rid => {
          const r = SCENES.find(x => x.id === rid);
          if (!r) return '';
          return `<button class="fa-related-btn" data-fa-jump-scene="${r.id}" type="button">${esc(r.name)}</button>`;
        }).join('')}
      </div>
    ` : '';

    const metroBtn = s.cprMetronome
      ? `<button class="btn danger" id="faOpenMetro" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;margin-right:6px;vertical-align:-3px;">
            <path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z"/>
            <path d="M8.5 11h2l1-2 1.5 4 1-2h1.5"/>
          </svg>
          打开 CPR 节拍器
        </button>`
      : '';

    const speakBtn = !s.isCollection
      ? `<button class="btn ghost small" id="faSpeakSteps" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;margin-right:5px;vertical-align:-2px;">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          朗读步骤
        </button>`
      : '';

    return `
      <div class="fa-detail-head">
        <button class="fa-back-btn" id="faDetailBack" type="button">← 返回</button>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span class="fa-level-badge ${s.level}">${LEVEL_LABEL[s.level]}</span>
            <h2 class="fa-detail-name">${esc(s.name)}</h2>
          </div>
          <p class="fa-detail-tagline">${esc(s.tagline)}</p>
        </div>
      </div>

      <div class="fa-judge">
        <b>什么时候用：</b>${esc(s.judge)}
      </div>

      <div class="fa-detail-actions">
        ${metroBtn}
        ${speakBtn}
      </div>

      ${stepsHtml}

      ${dontHtml}

      <div class="fa-call-box">
        <h4>何时拨打 120</h4>
        <p>${esc(s.call120)}</p>
      </div>

      ${relatedHtml}
    `;
  }

  function renderMinor(s){
    return s.items.map((it, i) => `
      <div class="fa-minor-item" data-minor-idx="${i}">
        <div class="fa-minor-head">${esc(it.name)}</div>
        <div class="fa-minor-body">
          <ol>${it.steps.map(st => `<li>${esc(st)}</li>`).join('')}</ol>
          <p class="fa-minor-dont"><b>禁忌：</b>${esc(it.dont)}</p>
        </div>
      </div>
    `).join('');
  }

  function bindDetailEvents(s){
    const back = $('faDetailBack');
    if (back) back.addEventListener('click', closeDetail);

    const metroBtn = $('faOpenMetro');
    if (metroBtn) metroBtn.addEventListener('click', openMetronome);

    const speakBtn = $('faSpeakSteps');
    if (speakBtn){
      speakBtn.addEventListener('click', () => {
        const steps = pickSteps(s);
        const text = steps.map((st, i) => `第 ${i+1} 步：${st.title}。${st.desc}`).join('。');
        speakText(`急救步骤。${s.name}。${text}`);
      });
    }

    if (s.isCollection){
      $('faDetailView').querySelectorAll('.fa-minor-head').forEach(h => {
        h.addEventListener('click', () => {
          h.parentElement.classList.toggle('open');
        });
      });
    }

    $('faDetailView').querySelectorAll('[data-fa-jump-scene]').forEach(btn => {
      btn.addEventListener('click', () => openDetail(btn.dataset.faJumpScene));
    });
  }

  function closeDetail(){
    currentSceneId = null;
    $('faDetailView').style.display = 'none';
    $('faDetailView').innerHTML = '';
    $('faMainView').style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- TTS ---------- */
  let audioCtx = null;
  function getAudioCtx(){
    if (!audioCtx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }
  function speakText(text){
    if (!window.speechSynthesis) { showToast('当前浏览器不支持语音朗读'); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 1.05;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch(e){ showToast('朗读失败'); }
  }

  /* ---------- 主视图事件绑定 ---------- */
  function bindMainEvents(){
    $('faSearch').addEventListener('input', e => { searchQ = e.target.value; renderMain(); });
    $('faAudienceSwitch').querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        $('faAudienceSwitch').querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        currentAudience = b.dataset.aud;
        if (currentSceneId) openDetail(currentSceneId);
      });
    });
    document.querySelectorAll('[data-fa-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.faJump;
        if (t === 'cpr-metronome') openMetronome();
        else if (t === 'aed') openAed();
        else if (t === 'infocard') openInfoCard();
      });
    });
    $('faInfoCardBtn').addEventListener('click', openInfoCard);
  }

  /* ---------- CPR 节拍器 ---------- */
  let metroTimer = null;
  let metroRunning = false;
  let metroStartAt = 0;
  let metroBeats = 0;
  let metroCountdownIndex = 0;
  let metroTipTimer = null;
  let metroTipIndex = 0;
  const METRO_INTERVAL = 545;   // 110 次/分
  const METRO_TIPS = ['掌根压胸骨下半段', '深度 5-6cm', '频率 100-120 次/分'];

  function beepClick(){
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.28, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch(e){}
  }

  function speakCount(n){
    if (!window.speechSynthesis) return;
    try {
      const u = new SpeechSynthesisUtterance(String(n));
      u.lang = 'zh-CN';
      u.rate = 1.35;
      u.pitch = 1.0;
      u.volume = 1.0;
      window.speechSynthesis.speak(u);
    } catch(e){}
  }

  function openMetronome(){
    $('faMainView').style.display = 'none';
    $('faDetailView').style.display = 'none';
    $('faAedView').style.display = 'none';
    $('faInfoCardView').style.display = 'none';
    $('faCprMetronome').style.display = '';
    $('faCprMetronome').innerHTML = `
      <div class="fa-detail-head">
        <button class="fa-back-btn" id="faMetroBack" type="button">← 返回</button>
        <div style="flex:1;min-width:0;">
          <span class="fa-level-badge red">110 次/分</span>
          <h2 class="fa-detail-name" style="margin-top:4px;">CPR 节拍器</h2>
        </div>
      </div>
      <div class="fa-metro-wrap">
        <div class="fa-metro-head">
          <div class="fa-metro-mode" id="faMetroMode">
            <button data-mode="beep" class="active" type="button">滴滴声</button>
            <button data-mode="voice" type="button">人声数数</button>
          </div>
          <div class="fa-metro-timer" id="faMetroTimer">00:00</div>
        </div>
        <div class="fa-metro-dot" id="faMetroDot">0</div>
        <div class="fa-metro-count" id="faMetroCount">已按压 0 次</div>
        <div class="fa-metro-tips" id="faMetroTips">准备好后点击「开始」</div>
        <div class="fa-metro-actions">
          <button class="btn danger" id="faMetroStart" type="button">开始</button>
          <button class="btn ghost" id="faMetroPause" type="button" disabled>暂停</button>
          <button class="btn ghost" id="faMetroReset" type="button">重置</button>
        </div>
        <div class="fa-call-box" style="width:100%;margin-top:12px;">
          <h4>提示</h4>
          <p>节拍频率 110 次/分，落在推荐区间 100-120 内。人声数数模式数到 30 会提示"两次人工呼吸"。</p>
        </div>
      </div>
    `;
    $('faMetroBack').addEventListener('click', closeMetronome);
    $('faMetroStart').addEventListener('click', startMetro);
    $('faMetroPause').addEventListener('click', pauseMetro);
    $('faMetroReset').addEventListener('click', resetMetro);
    $('faMetroMode').querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        $('faMetroMode').querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        metroVoiceMode = (b.dataset.mode === 'voice');
        if (metroRunning) resetMetro();
      });
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  let metroVoiceMode = false;

  function startMetro(){
    if (metroRunning) return;
    metroRunning = true;
    metroStartAt = Date.now();
    $('faMetroStart').disabled = true;
    $('faMetroPause').disabled = false;
    tickMetro();
    metroTimer = setInterval(tickMetro, METRO_INTERVAL);
    metroTipTimer = setInterval(rotateTip, 2800);
  }

  function pauseMetro(){
    if (!metroRunning) return;
    metroRunning = false;
    clearInterval(metroTimer); metroTimer = null;
    clearInterval(metroTipTimer); metroTipTimer = null;
    $('faMetroStart').disabled = false;
    $('faMetroPause').disabled = true;
    $('faMetroStart').textContent = '继续';
  }

  function resetMetro(){
    metroRunning = false;
    clearInterval(metroTimer); metroTimer = null;
    clearInterval(metroTipTimer); metroTipTimer = null;
    metroBeats = 0;
    metroCountdownIndex = 0;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    $('faMetroDot').textContent = '0';
    $('faMetroTimer').textContent = '00:00';
    $('faMetroCount').textContent = '已按压 0 次';
    $('faMetroTips').textContent = '准备好后点击「开始」';
    $('faMetroStart').disabled = false;
    $('faMetroStart').textContent = '开始';
    $('faMetroPause').disabled = true;
  }

  function tickMetro(){
    metroBeats++;
    const dot = $('faMetroDot');
    const elapsed = Math.floor((Date.now() - metroStartAt) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2,'0');
    const ss = String(elapsed % 60).padStart(2,'0');
    $('faMetroTimer').textContent = mm + ':' + ss;

    if (metroVoiceMode){
      if (metroCountdownIndex >= 30){
        metroCountdownIndex = 0;
        if (window.speechSynthesis){
          const u = new SpeechSynthesisUtterance('两次人工呼吸');
          u.lang = 'zh-CN'; u.rate = 1.3;
          window.speechSynthesis.speak(u);
        }
        $('faMetroTips').textContent = '两次人工呼吸！';
      } else {
        metroCountdownIndex++;
        speakCount(metroCountdownIndex);
      }
      dot.textContent = metroCountdownIndex === 0 ? '30' : String(metroCountdownIndex);
    } else {
      beepClick();
      dot.textContent = String(metroBeats);
    }
    $('faMetroCount').textContent = '已按压 ' + metroBeats + ' 次';

    dot.classList.add('pulse');
    setTimeout(() => dot.classList.remove('pulse'), 90);
  }

  function rotateTip(){
    metroTipIndex = (metroTipIndex + 1) % METRO_TIPS.length;
    if (!metroVoiceMode || metroCountdownIndex !== 0){
      if (metroCountdownIndex !== 30){
        $('faMetroTips').textContent = METRO_TIPS[metroTipIndex];
      }
    }
  }

  function closeMetronome(){
    resetMetro();
    $('faCprMetronome').style.display = 'none';
    $('faMainView').style.display = '';
  }

  /* ---------- AED 使用引导 ---------- */
  const AED_STEPS = [
    { title: '开机', desc: '打开 AED 电源开关，按下电源键后 AED 会开始语音提示，全程听从语音。' },
    { title: '贴电极片', desc: '解开伤者上衣，擦干胸壁。一片贴在右上胸壁（锁骨下），另一片贴在左乳头外侧。' },
    { title: '插入导线', desc: '把电极片的插头插入 AED 主机插孔。有些机型电极片已预连接，跳过本步。' },
    { title: '离开伤者', desc: 'AED 会说"不要触碰患者"。所有人离开伤者，喊一声"离开"。' },
    { title: '听 AED 建议', desc: 'AED 会自动分析心律。分析期间任何人不得触碰伤者，否则结果不准。' },
    { title: '按放电键', desc: '若 AED 建议放电，再次确认无人接触后按下闪烁的放电键。' },
    { title: '立即继续 CPR', desc: '放电后 AED 会提示"立即继续心肺复苏"，立即从胸外按压开始，不要停下来检查。' }
  ];

  function openAed(){
    $('faMainView').style.display = 'none';
    $('faDetailView').style.display = 'none';
    $('faCprMetronome').style.display = 'none';
    $('faInfoCardView').style.display = 'none';
    $('faAedView').style.display = '';
    $('faAedView').innerHTML = `
      <div class="fa-detail-head">
        <button class="fa-back-btn" id="faAedBack" type="button">← 返回</button>
        <div style="flex:1;min-width:0;">
          <span class="fa-level-badge red">操作顺序</span>
          <h2 class="fa-detail-name" style="margin-top:4px;">AED 使用引导</h2>
          <p class="fa-detail-tagline">自动体外除颤器，全程听从语音提示</p>
        </div>
      </div>
      ${AED_STEPS.map((s, i) => `
        <div class="fa-aed-step">
          <div class="fa-aed-num">${i+1}</div>
          <div class="fa-aed-body">
            <h4 class="fa-aed-title">${esc(s.title)}</h4>
            <p class="fa-aed-desc">${esc(s.desc)}</p>
          </div>
        </div>
      `).join('')}
      <div class="fa-aed-special">
        <b>特殊情况：</b><br>
        · <b>胸毛多</b>：用备用的剃刀刮一下电极片贴合处<br>
        · <b>心脏起搏器</b>：能摸到皮下硬块，电极片避开硬块 8cm 以上<br>
        · <b>贴了膏药</b>：先撕掉，擦干皮肤<br>
        · <b>水中或潮湿</b>：先把人移开水面，胸部擦干再贴<br>
        · <b>8 岁以下儿童</b>：优先用儿童电极片或儿童模式
      </div>
    `;
    $('faAedBack').addEventListener('click', closeAed);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeAed(){
    $('faAedView').style.display = 'none';
    $('faMainView').style.display = '';
  }

  /* ---------- 紧急信息卡 ---------- */
  function loadInfoCard(){
    try {
      const raw = localStorage.getItem(INFO_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e){ return {}; }
  }
  function saveInfoCard(data){
    try { localStorage.setItem(INFO_KEY, JSON.stringify(data)); return true; }
    catch(e){ return false; }
  }

  function openInfoCard(){
    $('faMainView').style.display = 'none';
    $('faDetailView').style.display = 'none';
    $('faCprMetronome').style.display = 'none';
    $('faAedView').style.display = 'none';
    $('faInfoCardView').style.display = '';
    renderInfoCard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderInfoCard(){
    const d = loadInfoCard();
    const hasData = d.name && d.name.trim();
    $('faInfoCardView').innerHTML = `
      <div class="fa-detail-head">
        <button class="fa-back-btn" id="faInfoBack" type="button">← 返回</button>
        <div style="flex:1;min-width:0;">
          <span class="fa-level-badge red" style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;display:block;">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <circle cx="9" cy="11" r="2.5"/>
              <path d="M4.5 17c.7-2 2.4-3 4.5-3s3.8 1 4.5 3"/>
            </svg>
            紧急信息卡
          </span>
          <h2 class="fa-detail-name" style="margin-top:4px;display:none;">紧急信息卡</h2>
          <p class="fa-detail-tagline">${hasData ? '紧急情况下直接出示给他人看' : '先填写，再给紧急情况用'}</p>
        </div>
      </div>

      <div class="fa-info-card" id="faInfoDisplay" style="${hasData ? '' : 'display:none;'}">
        <div class="fa-info-name-row">
          <div class="fa-info-avatar">${esc((d.name || '?').slice(0,1))}</div>
          <div class="fa-info-basic">
            <h3 class="fa-info-name">${esc(d.name || '—')}</h3>
            <div class="fa-info-sub">
              ${d.birthYear ? '出生年：<b>' + esc(d.birthYear) + '</b>　·　' : ''}
              ${d.bloodType ? '血型：<b>' + esc(d.bloodType) + '</b>' : ''}
            </div>
          </div>
        </div>
        ${d.allergies ? `<div class="fa-info-block"><div class="fa-info-block-title">过敏史</div><div class="fa-info-block-value">${esc(d.allergies)}</div></div>` : ''}
        ${d.chronicDiseases ? `<div class="fa-info-block"><div class="fa-info-block-title">慢性病</div><div class="fa-info-block-value">${esc(d.chronicDiseases)}</div></div>` : ''}
        ${d.medications ? `<div class="fa-info-block"><div class="fa-info-block-title">长期用药</div><div class="fa-info-block-value">${esc(d.medications)}</div></div>` : ''}
        <div class="fa-info-block">
          <div class="fa-info-block-title">紧急联系人</div>
          <div class="fa-info-contacts">
            ${(d.contact1 && d.contact1.name) ? `
              <div class="fa-info-contact">
                <b>${esc(d.contact1.name)}</b>
                <span>${esc(d.contact1.relation || '联系人')}</span>
                ${d.contact1.phone ? `<a href="tel:${esc(d.contact1.phone)}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  ${esc(d.contact1.phone)}
                </a>` : ''}
              </div>
            ` : ''}
            ${(d.contact2 && d.contact2.name) ? `
              <div class="fa-info-contact">
                <b>${esc(d.contact2.name)}</b>
                <span>${esc(d.contact2.relation || '联系人')}</span>
                ${d.contact2.phone ? `<a href="tel:${esc(d.contact2.phone)}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  ${esc(d.contact2.phone)}
                </a>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
        ${d.note ? `<div class="fa-info-block"><div class="fa-info-block-title">备注</div><div class="fa-info-block-value">${esc(d.note)}</div></div>` : ''}
      </div>

      <div class="panel">
        <h3 class="panel-head">${hasData ? '修改信息' : '填写信息'}</h3>
        <div class="form-grid">
          <label class="field"><span>姓名</span><input type="text" id="ficName" value="${esc(d.name || '')}"></label>
          <label class="field"><span>出生年</span><input type="text" id="ficBirth" value="${esc(d.birthYear || '')}" placeholder="如：1995"></label>
          <label class="field"><span>血型</span>
            <select id="ficBlood">
              <option value="">未知</option>
              <option value="A型" ${d.bloodType==='A型'?'selected':''}>A 型</option>
              <option value="B型" ${d.bloodType==='B型'?'selected':''}>B 型</option>
              <option value="O型" ${d.bloodType==='O型'?'selected':''}>O 型</option>
              <option value="AB型" ${d.bloodType==='AB型'?'selected':''}>AB 型</option>
            </select>
          </label>
        </div>
        <div class="field"><span>过敏史（药物、食物）</span><textarea id="ficAllergies" rows="2">${esc(d.allergies || '')}</textarea></div>
        <div class="field"><span>慢性病</span><textarea id="ficChronic" rows="2">${esc(d.chronicDiseases || '')}</textarea></div>
        <div class="field"><span>长期用药</span><textarea id="ficMeds" rows="2">${esc(d.medications || '')}</textarea></div>
        <div class="form-grid">
          <label class="field"><span>紧急联系人 1 姓名</span><input type="text" id="ficC1n" value="${esc(d.contact1?.name || '')}"></label>
          <label class="field"><span>关系</span><input type="text" id="ficC1r" value="${esc(d.contact1?.relation || '')}" placeholder="如：母亲"></label>
          <label class="field"><span>电话</span><input type="text" id="ficC1p" value="${esc(d.contact1?.phone || '')}"></label>
        </div>
        <div class="form-grid">
          <label class="field"><span>紧急联系人 2 姓名</span><input type="text" id="ficC2n" value="${esc(d.contact2?.name || '')}"></label>
          <label class="field"><span>关系</span><input type="text" id="ficC2r" value="${esc(d.contact2?.relation || '')}"></label>
          <label class="field"><span>电话</span><input type="text" id="ficC2p" value="${esc(d.contact2?.phone || '')}"></label>
        </div>
        <div class="field"><span>备注</span><textarea id="ficNote" rows="2">${esc(d.note || '')}</textarea></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn" id="ficSave" type="button">保存</button>
          <button class="btn ghost small" id="ficExport" type="button" ${hasData ? '' : 'disabled'}>导出为图片</button>
        </div>
      </div>
    `;

    $('faInfoBack').addEventListener('click', () => {
      $('faInfoCardView').style.display = 'none';
      $('faMainView').style.display = '';
    });

    $('ficSave').addEventListener('click', () => {
      const data = {
        name: $('ficName').value.trim(),
        birthYear: $('ficBirth').value.trim(),
        bloodType: $('ficBlood').value,
        allergies: $('ficAllergies').value.trim(),
        chronicDiseases: $('ficChronic').value.trim(),
        medications: $('ficMeds').value.trim(),
        contact1: { name: $('ficC1n').value.trim(), relation: $('ficC1r').value.trim(), phone: $('ficC1p').value.trim() },
        contact2: { name: $('ficC2n').value.trim(), relation: $('ficC2r').value.trim(), phone: $('ficC2p').value.trim() },
        note: $('ficNote').value.trim()
      };
      if (!data.name){ alert('请至少填写姓名'); return; }
      if (!saveInfoCard(data)){ alert('保存失败'); return; }
      showToast('已保存');
      renderInfoCard();
    });

    $('ficExport').addEventListener('click', () => {
      const data = loadInfoCard();
      if (!data.name){ showToast('先填写信息'); return; }
      exportInfoCardImage(data);
    });
  }

  function exportInfoCardImage(d){
    const dpr = 2;
    const W = 600, H = 780, PAD = 40;
    const canvas = document.createElement('canvas');
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const FONT = '"PingFang SC","Microsoft YaHei",sans-serif';

    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, W - 16, H - 16);

    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(8, 8, W - 16, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('紧 急 信 息 卡', W/2, 47);

    let y = 100;
    ctx.textAlign = 'left';

    // 头像圈
    ctx.beginPath();
    ctx.arc(90, y + 40, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#fca5a5';
    ctx.fill();
    ctx.fillStyle = '#7f1d1d';
    ctx.font = 'bold 32px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText((d.name || '?').slice(0, 1), 90, y + 53);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#7f1d1d';
    ctx.font = 'bold 30px ' + FONT;
    ctx.fillText(d.name || '', 155, y + 38);
    ctx.font = '14px ' + FONT;
    ctx.fillStyle = '#7a5a20';
    const sub = [d.birthYear ? '出生年 ' + d.birthYear : '', d.bloodType ? '血型 ' + d.bloodType : ''].filter(Boolean).join('　·　');
    ctx.fillText(sub, 155, y + 66);
    y += 110;

    function drawSection(title, body){
      if (!body) return;
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 12px ' + FONT;
      ctx.fillText(title.toUpperCase(), PAD, y);
      ctx.fillStyle = '#3a2a00';
      ctx.font = '15px ' + FONT;
      const maxW = W - PAD * 2;
      const lines = wrapText(ctx, body, maxW);
      lines.forEach(line => {
        y += 24;
        ctx.fillText(line, PAD, y);
      });
      y += 22;
    }

    drawSection('过敏史', d.allergies);
    drawSection('慢性病', d.chronicDiseases);
    drawSection('长期用药', d.medications);

    // 联系人
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 12px ' + FONT;
    ctx.fillText('紧急联系人', PAD, y);
    y += 20;
    [d.contact1, d.contact2].forEach((c, i) => {
      if (!c || !c.name) return;
      ctx.fillStyle = '#fff8e1';
      ctx.fillRect(PAD, y, W - PAD * 2, 60);
      ctx.strokeStyle = 'rgba(220,38,38,.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(PAD, y, W - PAD * 2, 60);
      ctx.fillStyle = '#7f1d1d';
      ctx.font = 'bold 15px ' + FONT;
      ctx.fillText(c.name + '　' + (c.relation || ''), PAD + 12, y + 24);
      ctx.font = 'bold 17px ' + FONT;
      ctx.fillStyle = '#b91c1c';
      ctx.fillText(c.phone || '', PAD + 12, y + 48);
      y += 70;
    });

    if (d.note){
      y += 6;
      drawSection('备注', d.note);
    }

    const d2 = new Date();
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11.5px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('导出时间：' + d2.getFullYear() + '-' + String(d2.getMonth()+1).padStart(2,'0') + '-' + String(d2.getDate()).padStart(2,'0') + '　|　岁窦工具箱 · 紧急信息卡', W/2, H - 20);

    const fileName = '紧急信息卡_' + timeStamp(new Date()) + '.png';
    if (canvas.toBlob){
      canvas.toBlob(blob => {
        if (!blob){ showToast('导出失败'); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        showToast('已导出图片');
      }, 'image/png');
    }
  }

  /* 简易换行（供信息卡图片用） */
  function wrapText(ctx, text, maxW){
    const out = [];
    String(text).split('\n').forEach(seg => {
      if (!seg){ out.push(''); return; }
      let cur = '';
      for (const ch of seg){
        if (cur && ctx.measureText(cur + ch).width > maxW){ out.push(cur); cur = ch; }
        else cur += ch;
      }
      out.push(cur);
    });
    return out;
  }

  /* ---------- 主视图事件绑定 ---------- */
  function bindMainEvents(){
    $('faSearch').addEventListener('input', e => { searchQ = e.target.value; renderMain(); });
    $('faAudienceSwitch').querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        $('faAudienceSwitch').querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        currentAudience = b.dataset.aud;
        if (currentSceneId) openDetail(currentSceneId);
      });
    });
    document.querySelectorAll('[data-fa-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.faJump;
        if (t === 'cpr-metronome') openMetronome();
        else if (t === 'aed') openAed();
        else if (t === 'infocard') openInfoCard();
      });
    });
    $('faInfoCardBtn').addEventListener('click', openInfoCard);
  }

  /* ---------- 对外接口 ---------- */
  window.__firstaidInit = function(){
    renderMain();
  };

  /* 首屏初始化 */
  bindMainEvents();
  if (page.classList.contains('active')) window.__firstaidInit();

  console.log('[急救知识速查] 已加载');
})();