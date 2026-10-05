/* ============================================================
   运动损伤应急处理 · V4.1 活力版
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-sportsinjury');
  if (!page) return;

  const SEV_LABEL = { minor: '轻微', moderate: '中度', severe: '严重' };

  const SCENES = [
    {
      id: 'ankle', name: '踝关节扭伤', severity: 'moderate',
      tagline: '脚踝崴了一下，肿痛、走路疼',
      identify: '脚踝向内或向外翻了一下，随后出现疼痛、肿胀、淤青；走路或踩地时疼痛明显，部分人可听到"啪"的一声。',
      steps: [
        { title: 'P — Protection 保护', desc: '立即停止活动，避免二次损伤。如果现场有护踝、弹力绷带，轻轻固定住。' },
        { title: 'R — Rest 休息', desc: '48 小时内尽量不要走路，必要时用拐杖，避免受伤脚承重。' },
        { title: 'I — Ice 冰敷', desc: '用毛巾包冰袋敷 15-20 分钟，每 2 小时一次。48 小时内只冰敷，不要热敷。' },
        { title: 'C — Compression 加压', desc: '用弹力绷带从脚趾向小腿方向轻轻缠绕，不要过紧（脚趾不能发麻发紫）。' },
        { title: 'E — Elevation 抬高', desc: '平躺时把脚垫高到心脏水平以上，减少肿胀。' },
        { title: '48 小时后', desc: '开始轻柔活动、热敷、按摩，逐步恢复负重。疼痛加重就回退到上一步。' }
      ],
      doctor: [
        '完全不能承重，或勉强走不到 4 步',
        '脚踝明显畸形、骨性压痛（按压骨头而不是软组织时剧痛）',
        '脚趾发麻、发凉、发白（可能压迫神经血管）',
        '48 小时后肿痛仍在加重',
        '听到"啪"的断裂声，怀疑韧带断裂'
      ],
      stopTraining: '至少完全停训 48-72 小时。恢复训练需要满足：能无痛正常走路、能单脚站立 30 秒、脚踝不肿、按压不痛。达标后从低强度逐步恢复，2-4 周内避免剧烈变向和跳跃。',
      recover: [
        '第 1 周：RICE + 无负重活动（脚趾、脚踝空中绕环）',
        '第 2 周：部分负重 + 平衡训练（单脚站）',
        '第 3 周：完全负重 + 力量训练（弹力带抗阻）',
        '第 4 周起：渐进恢复跑跳，佩戴护踝 2-4 周'
      ],
      prevent: [
        '加强踝周肌群力量（提踵、弹力带训练）',
        '加入平衡训练（单脚站、平衡垫）',
        '运动前充分热身，穿合脚的运动鞋',
        '有反复扭伤史的人，运动时佩戴护踝'
      ],
      related: ['muscle', 'fracture'],
      crossFirstaid: 'fracture'
    },
    {
      id: 'muscle', name: '肌肉拉伤', severity: 'moderate',
      tagline: '突然用力时肌肉刺痛，之后僵硬、压痛',
      identify: '运动中突然感到肌肉"撕裂"样的刺痛，随后局部疼痛、僵硬、不敢用力；严重时能摸到凹陷或大块淤青。',
      steps: [
        { title: '立即停止运动', desc: '感觉不对就马上停，继续使用会加重撕裂。' },
        { title: '冰敷', desc: '用毛巾包冰袋敷 15-20 分钟，每 2 小时一次，48 小时内持续。' },
        { title: '加压包扎', desc: '用弹力绷带轻轻缠绕受伤部位，减少出血和肿胀。' },
        { title: '抬高休息', desc: '抬高受伤部位到心脏水平以上。' },
        { title: '48 小时后', desc: '改用热敷、按摩，做轻柔的拉伸和低强度活动，逐步恢复力量。' },
        { title: '不要硬撑', desc: '疼痛、无力、活动受限时就不要再练，否则可能从 1 级变 2 级、从 2 级变 3 级。' }
      ],
      doctor: [
        '完全不能活动受伤肌肉，或肌肉摸到明显凹陷',
        '大块淤青、肿胀迅速加重',
        '疼痛超过 1 周不缓解',
        '怀疑三级撕裂（肌肉完全断裂）',
        '运动时听到"啪"的声音，随后无力'
      ],
      stopTraining: '一级（轻度拉伤）：停训 1-2 周；二级（中度）：2-4 周；三级（完全断裂）：数月，可能需手术。恢复标准：无痛、力量恢复到健侧的 90% 以上、能正常完成专项动作。',
      recover: [
        '急性期（48h）：RICE，绝对休息',
        '恢复期（3 天-2 周）：轻柔拉伸 + 等长收缩',
        '强化期（2-4 周）：离心训练 + 渐进负荷',
        '回归期（4 周后）：专项动作 + 热身流程完整'
      ],
      prevent: [
        '充分热身 10-15 分钟，尤其冷天',
        '运动前做动态拉伸，运动后做静态拉伸',
        '训练量循序渐进，每周增加不超过 10%',
        '注意补水和电解质'
      ],
      related: ['doms', 'cramp'],
      crossFirstaid: null
    },
    {
      id: 'doms', name: '延迟性肌肉酸痛（DOMS）', severity: 'minor',
      tagline: '运动后 24-72 小时出现的酸痛僵硬',
      identify: '运动后 24-72 小时逐渐出现肌肉酸痛、僵硬、按压痛，没有红肿热，休息后慢慢缓解。新手或突然加量时最常见。',
      steps: [
        { title: '轻度活动', desc: '不要完全静止，做低强度的散步、慢跑、拉伸，能加快恢复。' },
        { title: '热敷或泡澡', desc: '温水澡、热敷能放松肌肉、促进循环。' },
        { title: '轻柔按摩', desc: '用手或滚轴轻柔按压酸痛处，不要用力揉搓。' },
        { title: '补充营养', desc: '多喝水，补充蛋白质和电解质。' },
        { title: '保证睡眠', desc: '睡眠是肌肉修复的关键，保证 7-8 小时。' },
        { title: '不要重复高强度', desc: '酸痛没缓解前不要重复同样的高强度训练。' }
      ],
      doctor: [
        '酸痛超过 5-7 天不缓解',
        '出现酱油色尿、严重肌无力、浮肿（可能是横纹肌溶解）→ 立即急诊',
        '伴随发热、皮肤红肿热'
      ],
      stopTraining: '酸痛明显时，降低训练强度 50% 或改为低强度有氧。一般 2-3 天自愈，不用完全停训。',
      recover: [
        '第 1 天：轻度活动 + 热敷',
        '第 2 天：拉伸 + 泡澡',
        '第 3 天：基本缓解，可恢复训练'
      ],
      prevent: [
        '新动作、新强度要循序渐进',
        '运动前充分热身',
        '运动后做静态拉伸',
        '保持规律训练，不要"周末勇士"式集中训练'
      ],
      related: ['muscle', 'cramp'],
      crossFirstaid: null
    },
    {
      id: 'cramp', name: '抽筋', severity: 'minor',
      tagline: '肌肉突然不自主收缩，剧痛、硬块',
      identify: '运动中或夜间，某块肌肉突然不自主收缩、剧痛、摸到硬块，常见于小腿、大腿、脚掌。',
      steps: [
        { title: '立即停止运动', desc: '不要再继续使用抽筋的肌肉。' },
        { title: '缓慢拉伸', desc: '小腿抽筋：坐姿，用手勾住脚尖往身体方向拉，膝盖伸直；大腿抽筋：站立，弯曲膝盖用手拉脚踝。' },
        { title: '轻柔按摩', desc: '拉伸缓解后，用手掌轻柔按摩肌肉。' },
        { title: '热敷', desc: '用热毛巾敷 10-15 分钟，放松肌肉。' },
        { title: '补充电解质', desc: '喝淡盐水、运动饮料，或吃根香蕉。' },
        { title: '恢复活动', desc: '缓解后可以继续，但降低强度，避免再次发作。' }
      ],
      doctor: [
        '频繁反复发作，每周多次',
        '伴随肢体麻木、无力、肌肉萎缩',
        '夜间频繁抽筋，补钙补镁后不改善',
        '伴随水肿、皮肤颜色改变'
      ],
      stopTraining: '单次抽筋缓解后一般可以继续，但要降低强度。频繁抽筋建议停训 1-2 天，检查补水和电解质。',
      recover: [
        '几分钟到几小时缓解',
        '当天避免再次高强度使用同一肌群'
      ],
      prevent: [
        '运动前、中、后补水补电解质',
        '运动前充分热身',
        '避免过度疲劳和突然加量',
        '注意保暖，尤其冷天和游泳'
      ],
      related: ['doms', 'muscle'],
      crossFirstaid: null
    },
    {
      id: 'dislocation', name: '关节脱臼', severity: 'severe',
      tagline: '关节变形、剧痛、不能活动——立即就医',
      identify: '关节明显变形、剧烈疼痛、不能活动、可能麻木；常见于肩、肘、指关节、下颌。',
      steps: [
        { title: '不要自己复位', desc: '绝对不要尝试把关节推回去，会伤到神经、血管、韧带。' },
        { title: '保持原位固定', desc: '用围巾、三角巾、衣服做成吊带或夹板固定住受伤关节，保持最舒服的位置。' },
        { title: '冰敷', desc: '用毛巾包冰袋敷在关节周围，每次 15-20 分钟，减少肿胀和疼痛。' },
        { title: '立即就医', desc: '拨打 120 或尽快送急诊，让专业医生复位。' },
        { title: '不要吃喝', desc: '如果需要麻醉复位，禁食禁水会更安全。' },
        { title: '观察神经血管', desc: '留意手指 / 脚趾是否发麻、发凉、发紫，及时告诉医生。' }
      ],
      doctor: [
        '任何脱臼都立即就医，没有例外',
        '远端麻木、发凉、发紫',
        '怀疑伴随骨折（畸形、骨性压痛）',
        '脱臼后不能复位或复位后仍剧痛'
      ],
      stopTraining: '至少数周完全停训。复位后需专业康复，一般 4-12 周才能逐步恢复训练，具体以医生评估为准。',
      recover: [
        '复位后 1-2 周：固定 + 无负重活动',
        '2-4 周：被动活动 + 轻柔拉伸',
        '4-8 周：主动力量训练',
        '8 周后：逐步恢复专项训练'
      ],
      prevent: [
        '加强关节周围肌群力量',
        '避免极限关节活动',
        '有脱臼史的人运动时佩戴护具',
        '摔倒时学会保护性滚翻'
      ],
      related: ['fracture'],
      crossFirstaid: 'fracture'
    },
    {
      id: 'fracture', name: '应力性骨折 / 疑似骨折', severity: 'severe',
      tagline: '骨性压痛、不能负重、畸形——立即固定就医',
      identify: '剧烈疼痛、迅速肿胀、可能畸形或异常活动、骨擦音；应力性骨折表现为某一点骨性压痛、跑跳加重、休息减轻。',
      steps: [
        { title: '固定', desc: '用夹板、硬纸板、树枝等固定上下两个关节，绑带不要直接压在骨折处。' },
        { title: '开放性骨折先覆盖', desc: '伤口用无菌纱布或干净布料覆盖，不要试图把骨头推回去。' },
        { title: '冰敷', desc: '用毛巾包冰袋敷在周围，每次 15-20 分钟。' },
        { title: '抬高', desc: '抬高受伤肢体，减少肿胀。' },
        { title: '立即就医', desc: '拨打 120 或尽快送医，拍摄 X 光确认。' },
        { title: '不要吃喝', desc: '可能需要手术，禁食禁水更安全。' }
      ],
      doctor: [
        '任何疑似骨折都立即就医',
        '开放性骨折（骨头戳出皮肤）',
        '远端发麻、发凉、发紫',
        '严重畸形或异常活动',
        '应力性骨折：同一个点持续疼痛 2 周不缓解'
      ],
      stopTraining: '整个骨愈合期（一般 6-12 周，应力性骨折 6-8 周）。完全以医生评估为准，不要自行提前复训。',
      recover: [
        '第 0-2 周：固定 + 完全休息',
        '第 2-6 周：根据医生指导做非负重活动',
        '第 6-8 周：逐步负重',
        '第 8 周后：遵医嘱逐步恢复训练'
      ],
      prevent: [
        '训练量循序渐进，避免过度使用',
        '注意钙和维生素 D 摄入',
        '合适的鞋和场地',
        '出现骨性压痛立即减量'
      ],
      related: ['ankle', 'dislocation'],
      crossFirstaid: 'sprain'
    },
    {
      id: 'abrasion', name: '擦伤 / 起水泡', severity: 'minor',
      tagline: '皮肤破损、水泡——清洁消毒是关键',
      identify: '皮肤擦破、出血或渗液；水泡是皮肤表层下有透明液体，常见于脚后跟、脚趾、手掌。',
      steps: [
        { title: '流动清水冲洗', desc: '用清水冲洗伤口，把泥沙、灰尘冲掉。不要用酒精直接倒在伤口上。' },
        { title: '碘伏消毒', desc: '用碘伏棉签轻轻涂抹伤口周围。没有碘伏也可以用生理盐水。' },
        { title: '覆盖', desc: '小伤口用创可贴，大伤口用无菌纱布 + 医用胶带。' },
        { title: '水泡处理', desc: '小的不要挑，让它自己吸收；大的影响活动时，消毒后用无菌针从边缘穿刺放出液体，保留表皮不要撕掉。' },
        { title: '每天换药', desc: '每天换一次敷料，观察有无感染。' },
        { title: '预防感染', desc: '保持伤口干燥清洁，出汗多就多换。' }
      ],
      doctor: [
        '伤口深、有泥沙冲不出',
        '伤口红肿热痛加剧，或有脓液',
        '伴随发热',
        '水泡反复感染不愈合',
        '被生锈金属或动物抓咬伤'
      ],
      stopTraining: '小擦伤可以继续，注意保护；水泡或大面积擦伤建议停训 2-3 天，等表皮长好再恢复。',
      recover: [
        '小擦伤：3-5 天',
        '水泡：5-7 天',
        '大面积：1-2 周'
      ],
      prevent: [
        '穿合脚的鞋、穿吸汗袜',
        '新鞋先短距离磨合',
        '容易磨的位置提前贴防磨贴',
        '保持皮肤干燥'
      ],
      related: [],
      crossFirstaid: null
    },
    {
      id: 'achilles', name: '跟腱炎', severity: 'moderate',
      tagline: '跟腱部位疼痛、晨起僵硬、跑跳加重',
      identify: '跟腱（脚后跟上方的那根粗筋）疼痛、按压痛、晨起僵硬；活动一会后减轻，跑跳时加重。',
      steps: [
        { title: '立即减量', desc: '减少跑量 50%，停止跑坡、跳跃、冲刺。' },
        { title: '冰敷', desc: '运动后冰敷跟腱 15 分钟。' },
        { title: '离心训练', desc: '站在台阶边缘，双脚提起后单脚缓慢下放，每天 3 组 × 15 次，这是最有效的康复动作。' },
        { title: '拉伸小腿', desc: '每天拉伸小腿三头肌 2-3 次，每次 30 秒。' },
        { title: '支撑鞋垫', desc: '鞋里加足跟垫，减少跟腱张力。' },
        { title: '逐步恢复', desc: '疼痛消失后，逐步恢复跑量，每次增加不超过 10%。' }
      ],
      doctor: [
        '疼痛持续 2 周以上不缓解',
        '走路跛行',
        '运动中听到"啪"的一声后无法蹬地（可能是跟腱断裂）→ 立即就医',
        '跟腱明显增粗、有结节'
      ],
      stopTraining: '轻度：减量 50%，避免跑坡跳跃；中度：完全停止跑跳 2-4 周；重度或疑似断裂：立即就医。',
      recover: [
        '第 1-2 周：减量 + 冰敷 + 离心训练',
        '第 3-4 周：开始慢跑，距离逐步增加',
        '第 4-8 周：恢复到原跑量的 70-100%',
        '完全恢复：4-12 周'
      ],
      prevent: [
        '加强小腿三头肌力量',
        '避免突然加量、突然换鞋',
        '跑前热身、跑后拉伸',
        '注意跑鞋的磨损，及时更换'
      ],
      related: ['muscle'],
      crossFirstaid: null
    },
    {
      id: 'tenniselbow', name: '网球肘 / 高尔夫球肘', severity: 'moderate',
      tagline: '肘外侧或内侧疼痛，握拳、拧毛巾加重',
      identify: '网球肘：肘关节外侧骨突处疼痛，握拳、拧毛巾、提重物加重。高尔夫球肘：肘关节内侧疼痛，屈腕、抓握加重。',
      steps: [
        { title: '减少诱发动作', desc: '避免反复握拳、拧、提重物，换手或换工具。' },
        { title: '冰敷', desc: '运动后或疼痛时冰敷肘部 15 分钟。' },
        { title: '护肘', desc: '戴网球肘护带，位置在前臂肌肉最厚处，可以分散受力。' },
        { title: '拉伸', desc: '伸直手臂，另一手压手腕向下（网球肘）/ 向上（高尔夫球肘），保持 30 秒。' },
        { title: '离心训练', desc: '用哑铃做缓慢的腕伸 / 腕屈，重点在"下放"阶段，每天 3 组 × 15 次。' },
        { title: '逐步恢复', desc: '疼痛消失后，逐步恢复运动，注意动作规范。' }
      ],
      doctor: [
        '疼痛持续 2 周以上不缓解',
        '影响日常生活（梳头、刷牙、拧瓶盖）',
        '肘关节肿胀明显、活动受限',
        '伴随手指麻木（可能神经压迫）'
      ],
      stopTraining: '完全休息一般不需要，避免诱发动作即可。其他肌群可以继续训练。重度疼痛时停训 1-2 周。',
      recover: [
        '第 1-2 周：休息 + 冰敷 + 拉伸',
        '第 2-6 周：离心训练 + 逐步恢复',
        '完全恢复：数周到数月'
      ],
      prevent: [
        '规范动作，避免过度依赖手腕',
        '加强前臂肌群',
        '换用更合手的球拍 / 工具',
        '避免长时间重复同一动作'
      ],
      related: [],
      crossFirstaid: null
    },
    {
      id: 'heat', name: '运动性中暑 / 脱水', severity: 'severe',
      tagline: '高温运动后头晕、乏力、意识模糊——立即降温',
      identify: '高温环境下运动后出现头晕、头痛、恶心、乏力、大量出汗或不出汗、皮肤发红发热、心率加快。严重时意识模糊、抽搐、昏迷。',
      steps: [
        { title: '立即停止运动', desc: '马上离开高温环境，到阴凉、通风、有空调的地方。' },
        { title: '松衣降温', desc: '脱去多余衣物，用湿毛巾擦身，冰袋敷腋下、脖子、大腿根。' },
        { title: '补液', desc: '清醒时喝淡盐水或运动饮料，小口多次。' },
        { title: '监测体温', desc: '每 10 分钟测一次，降到 38℃ 以下停止强降温。' },
        { title: '意识不清立即 120', desc: '意识模糊、抽搐、昏迷 → 立即拨打 120，同时持续降温。' },
        { title: '不要给昏迷者喂水', desc: '意识不清时喂水会呛入气管，造成窒息。' }
      ],
      doctor: [
        '体温超过 40℃',
        '意识模糊、说胡话、抽搐、昏迷',
        '皮肤发红发烫但不出汗（热射病信号）',
        '恶心呕吐不止',
        '补水后仍持续头晕、心悸'
      ],
      stopTraining: '当天绝对停止运动。轻度中暑 1-2 天恢复；重度（热射病）需要数周甚至数月，必须医生评估后才能复训。',
      recover: [
        '轻度：当天休息，第 2-3 天可轻度活动',
        '中度：3-7 天逐步恢复',
        '重度：数周-数月，遵医嘱'
      ],
      prevent: [
        '避开正午高温时段',
        '运动前、中、后充分补水补盐',
        '穿透气排汗的运动服',
        '适应期：高温天运动前 1-2 周逐步适应'
      ],
      related: [],
      crossFirstaid: 'heatstroke'
    }
  ];

  const $ = id => document.getElementById(id);
  let searchQ = '';
  let sevFilter = '';
  let currentId = null;

  /* ---------- 列表渲染 ---------- */
  function filtered(){
    const q = searchQ.toLowerCase().trim();
    return SCENES.filter(s => {
      if (sevFilter && s.severity !== sevFilter) return false;
      if (!q) return true;
      const hay = [s.name, s.tagline, s.identify].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  function renderGrid(){
    const grid = $('siGrid');
    const empty = $('siEmpty');
    const arr = filtered();
    if (!arr.length){
      grid.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = arr.map(s => `
      <div class="si-card sev-${s.severity}" data-si-id="${s.id}">
        <div class="si-card-head">
          <span class="si-sev-badge ${s.severity}">${SEV_LABEL[s.severity]}</span>
          <h3 class="si-card-name">${esc(s.name)}</h3>
        </div>
        <p class="si-card-tagline">${esc(s.tagline)}</p>
      </div>
    `).join('');
    grid.querySelectorAll('[data-si-id]').forEach(el => {
      el.addEventListener('click', () => openDetail(el.dataset.siId));
    });
  }

  /* ---------- 详情渲染 ---------- */
  function openDetail(id){
    const s = SCENES.find(x => x.id === id);
    if (!s) return;
    currentId = id;
    $('siMainView').style.display = 'none';
    $('siDetailView').style.display = '';
    $('siDetailView').innerHTML = renderDetail(s);
    bindDetail(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderDetail(s){
    const sevLabel = SEV_LABEL[s.severity];

    const stepsHtml = `
      <div class="si-steps">
        ${s.steps.map((st, i) => `
          <div class="si-step">
            <div class="si-step-num">${i+1}</div>
            <div class="si-step-body">
              <h4 class="si-step-title">${esc(st.title)}</h4>
              <p class="si-step-desc">${esc(st.desc)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const doctorHtml = `
      <div class="si-doctor-box">
        <h4>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          出现以下情况必须就医
        </h4>
        <ul>${s.doctor.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
      </div>
    `;

    const stopHtml = `
      <div class="si-stop-box">
        <h4>🚦 何时可以继续运动 / 必须停训</h4>
        <p>${esc(s.stopTraining)}</p>
      </div>
    `;

    const recoverHtml = `
      <div class="si-block">
        <h4>恢复期建议</h4>
        <ul>${s.recover.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
      </div>
    `;

    const preventHtml = `
      <div class="si-block">
        <h4>预防方法</h4>
        <ul>${s.prevent.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      </div>
    `;

    const relatedHtml = (s.related && s.related.length) ? `
      <div class="si-related">
        <span class="si-related-label">相关损伤：</span>
        ${s.related.map(rid => {
          const r = SCENES.find(x => x.id === rid);
          if (!r) return '';
          return `<button class="si-related-btn" data-si-jump="${r.id}" type="button">${esc(r.name)}</button>`;
        }).join('')}
      </div>
    ` : '';

    const firstaidBtn = s.crossFirstaid ? `
      <button class="si-related-btn danger" data-si-firstaid="${s.crossFirstaid}" type="button">→ 跳转到急救速查</button>
    ` : '';

    return `
      <div class="si-detail-head">
        <button class="si-back-btn" id="siDetailBack" type="button">← 返回</button>
        <div class="si-detail-title-block">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span class="si-sev-badge ${s.severity}">${sevLabel}</span>
            <h2 class="si-detail-name">${esc(s.name)}</h2>
          </div>
          <p class="si-detail-tagline">${esc(s.tagline)}</p>
        </div>
      </div>

      <div class="si-identify">
        <b>怎么判断</b>
        ${esc(s.identify)}
      </div>

      ${stepsHtml}
      ${doctorHtml}
      ${stopHtml}
      ${recoverHtml}
      ${preventHtml}

      ${(relatedHtml || firstaidBtn) ? `
        <div class="si-related">
          ${relatedHtml}
          ${firstaidBtn}
        </div>
      ` : ''}
    `;
  }

  function bindDetail(s){
    $('siDetailBack').addEventListener('click', closeDetail);

    $('siDetailView').querySelectorAll('[data-si-jump]').forEach(btn => {
      btn.addEventListener('click', () => openDetail(btn.dataset.siJump));
    });

    $('siDetailView').querySelectorAll('[data-si-firstaid]').forEach(btn => {
      btn.addEventListener('click', () => {
        // 跳转到急救速查并切到对应场景
        if (typeof go === 'function') go('firstaid');
        // 急救页初始化后，尝试打开对应场景
        setTimeout(() => {
          const target = btn.dataset.siFirstaid;
          const faCard = document.querySelector('#faGrid [data-fa-id="' + target + '"]');
          if (faCard) faCard.click();
        }, 200);
      });
    });
  }

  function closeDetail(){
    currentId = null;
    $('siDetailView').style.display = 'none';
    $('siDetailView').innerHTML = '';
    $('siMainView').style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents(){
    $('siSearch').addEventListener('input', e => {
      searchQ = e.target.value;
      renderGrid();
    });
    $('siSevFilter').querySelectorAll('.si-sev-btn').forEach(b => {
      b.addEventListener('click', () => {
        sevFilter = b.dataset.sev;
        $('siSevFilter').querySelectorAll('.si-sev-btn').forEach(x => x.classList.toggle('active', x === b));
        renderGrid();
      });
    });
  }

  /* ---------- 对外接口 ---------- */
  window.__sportsinjuryInit = function(){
    if (currentId){
      // 重新打开之前看的场景
      const s = SCENES.find(x => x.id === currentId);
      if (s) $('siDetailView').innerHTML = renderDetail(s);
    } else {
      renderGrid();
    }
  };

  bindEvents();
  if (page.classList.contains('active')) window.__sportsinjuryInit();

  console.log('[运动损伤应急处理] 已加载');
})();