/* ============================================================
   常见穴位速查 · V4.1 活力版
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-acupoint');
  if (!page) return;

  const FAV_KEY = 'suidou-acupoint-fav-v1';

  /* ---------- 25 个穴位数据 ---------- */
  const POINTS = [
    { id:'baihui', name:'百会', pinyin:'bǎi huì', code:'GV20', meridian:'督脉', part:'head', svg:'head',
      position:'头顶正中线与两耳尖连线的交点处',
      simple:'两耳尖向上连线的中点，头顶正中',
      functions:['头痛','失眠','疲劳乏力','高血压辅助','焦虑'],
      massage:'用中指指腹轻轻按揉 1-2 分钟，力度轻柔，早晚各一次',
      combo:['配 风池 治头痛','配 神门 治失眠'],
      warning:['婴幼儿囟门未闭合禁按','高血压急性期慎按'],
      x:250, y:48, labelSide:'top' },

    { id:'taiyang', name:'太阳', pinyin:'tài yáng', code:'EX-HN5', meridian:'经外奇穴', part:'head', svg:'head',
      position:'眉梢与目外眦之间，向后约一横指的凹陷处',
      simple:'眉梢和眼角连线中点向后一横指',
      functions:['头痛','眼疲劳','感冒初期','晕车'],
      massage:'双手拇指或中指按揉 1-2 分钟，力度以轻微酸胀为宜',
      combo:['配 睛明 治眼疲劳','配 风池 治头痛'],
      warning:['皮肤破损处禁按','力度不要过重'],
      x:172, y:195, labelSide:'left' },

    { id:'yintang', name:'印堂', pinyin:'yìn táng', code:'EX-HN3', meridian:'经外奇穴', part:'head', svg:'head',
      position:'两眉头连线的中点处',
      simple:'两眉头正中间',
      functions:['头痛','失眠','鼻塞','焦虑'],
      massage:'用中指指腹向上推按或按揉 1 分钟',
      combo:['配 迎香 治鼻塞','配 神门 治失眠'],
      warning:['皮肤破损禁按'],
      x:250, y:163, labelSide:'top' },

    { id:'fengchi', name:'风池', pinyin:'fēng chí', code:'GB20', meridian:'足少阳胆经', part:'neck', svg:'neck',
      position:'枕骨之下，胸锁乳突肌与斜方肌上端之间的凹陷中',
      simple:'后脑勺下方，两条大筋外侧的凹陷处',
      functions:['头痛','颈椎痛','眼疲劳','感冒初期','晕车','高血压辅助'],
      massage:'双手拇指指腹同时按揉两侧，1-2 分钟，力度适中',
      combo:['配 大椎 治颈椎痛','配 太阳 治头痛'],
      warning:['不宜重按','高血压急性期慎按'],
      x:195, y:178, labelSide:'left' },

    { id:'jingming', name:'睛明', pinyin:'jīng míng', code:'BL1', meridian:'足太阳膀胱经', part:'head', svg:'head',
      position:'目内眦角稍上方的凹陷处',
      simple:'内眼角稍上方的小凹陷',
      functions:['眼疲劳','近视辅助','迎风流泪'],
      massage:'用拇指和食指轻轻捏按，或指腹轻按 1 分钟，力度一定要轻',
      combo:['配 太阳 治眼疲劳','配 攒竹 治迎风流泪'],
      warning:['眼部有炎症时禁按','力度必须极轻','按压方向朝上朝后'],
      x:224, y:195, labelSide:'bl' },

    { id:'yingxiang', name:'迎香', pinyin:'yíng xiāng', code:'LI20', meridian:'手阳明大肠经', part:'head', svg:'head',
      position:'鼻翼外缘中点旁开约 0.5 寸，鼻唇沟中',
      simple:'鼻翼两侧的鼻唇沟里',
      functions:['鼻塞','感冒初期','鼻炎辅助'],
      massage:'两手食指指腹按揉 1-2 分钟，或从迎香向上推至鼻根 30 次',
      combo:['配 印堂 治鼻塞','配 合谷 治感冒'],
      warning:['鼻部有炎症或出血时禁按'],
      x:232, y:248, labelSide:'left' },

    { id:'dazhui', name:'大椎', pinyin:'dà zhuī', code:'GV14', meridian:'督脉', part:'neck', svg:'neck',
      position:'第 7 颈椎棘突下凹陷处',
      simple:'低头时，脖子后面最突出的骨头下方凹陷',
      functions:['感冒初期','颈椎痛','疲劳乏力'],
      massage:'用中指指腹按揉 1-2 分钟，或用掌根上下擦到发热',
      combo:['配 风池 治颈椎痛','配 合谷 治感冒'],
      warning:['发热时不宜重按','皮肤破损禁按'],
      x:250, y:220, labelSide:'right' },

    { id:'jianjing', name:'肩井', pinyin:'jiān jǐng', code:'GB21', meridian:'足少阳胆经', part:'neck', svg:'neck',
      position:'大椎与肩峰端连线的中点',
      simple:'大椎和肩头连线的中点，肩部肌肉最厚处',
      functions:['颈椎痛','肩周炎','落枕','疲劳乏力'],
      massage:'用对侧手掌或中指按揉 1-2 分钟，或拿捏肩部肌肉',
      combo:['配 风池 治颈椎痛','配 曲池 治肩周炎'],
      warning:['孕妇禁按（易导致流产）'],
      x:175, y:240, labelSide:'left' },

    { id:'mingmen', name:'命门', pinyin:'mìng mén', code:'GV4', meridian:'督脉', part:'back', svg:'neck',
      position:'第 2 腰椎棘突下凹陷，与肚脐相对',
      simple:'后腰正中，与肚脐相对的位置',
      functions:['腰痛','疲劳乏力','月经不调'],
      massage:'用手掌上下摩擦到发热，或中指按揉 1-2 分钟',
      combo:['配 肾俞 治腰痛','配 关元 治疲劳'],
      warning:['孕妇慎按'],
      x:250, y:370, labelSide:'right' },

    { id:'danzhong', name:'膻中', pinyin:'dàn zhōng', code:'RN17', meridian:'任脉', part:'chest', svg:'chest',
      position:'前正中线，两乳头连线的中点',
      simple:'两乳头连线的正中间',
      functions:['心悸','咳嗽','恶心呕吐','焦虑'],
      massage:'用中指指腹按揉 1-2 分钟，或从上往下推 30 次',
      combo:['配 内关 治心悸','配 中脘 治恶心'],
      warning:['胸部外伤或肋骨骨折时禁按'],
      x:250, y:145, labelSide:'right' },

    { id:'zhongwan', name:'中脘', pinyin:'zhōng wǎn', code:'RN12', meridian:'任脉', part:'chest', svg:'chest',
      position:'前正中线，肚脐上 4 寸',
      simple:'肚脐上 4 横指（约 5 横指）',
      functions:['胃胀','消化不良','恶心呕吐','便秘','腹泻'],
      massage:'用食指、中指、无名指指腹按揉 2-3 分钟，或顺时针揉腹',
      combo:['配 足三里 治消化不良','配 内关 治恶心'],
      warning:['饭后 1 小时内禁按','孕妇慎按'],
      x:250, y:245, labelSide:'left' },

    { id:'tianshu', name:'天枢', pinyin:'tiān shū', code:'ST25', meridian:'足阳明胃经', part:'chest', svg:'chest',
      position:'肚脐旁开 2 寸',
      simple:'肚脐左右各 3 横指',
      functions:['便秘','腹泻','胃胀','月经不调'],
      massage:'两手食指和中指指腹同时按揉两侧 2-3 分钟',
      combo:['配 中脘 治胃胀','配 足三里 治腹泻'],
      warning:['饭后 1 小时内禁按','孕妇禁按'],
      x:198, y:300, labelSide:'left' },

    { id:'guanyuan', name:'关元', pinyin:'guān yuán', code:'RN4', meridian:'任脉', part:'chest', svg:'chest',
      position:'前正中线，肚脐下 3 寸',
      simple:'肚脐下 4 横指',
      functions:['月经不调','痛经','疲劳乏力','腰痛'],
      massage:'用手掌搓热后按揉 2-3 分钟，或艾灸',
      combo:['配 三阴交 治痛经','配 命门 治疲劳'],
      warning:['孕妇禁按','饭后 1 小时内禁按'],
      x:250, y:355, labelSide:'right' },

    { id:'hegu', name:'合谷', pinyin:'hé gǔ', code:'LI4', meridian:'手阳明大肠经', part:'hand', svg:'hand',
      position:'手背，第 1、2 掌骨之间，约平第 2 掌骨中点处',
      simple:'拇指、食指并拢，虎口肌肉最高点',
      functions:['头痛','牙痛','鼻塞','感冒初期','咽喉痛','便秘'],
      massage:'用另一手拇指指腹按揉 1-2 分钟，力度以明显酸胀为宜，左右手交替',
      combo:['配 太冲 治头痛','配 迎香 治鼻塞','配 曲池 治感冒'],
      warning:['孕妇禁按（催产作用）'],
      x:198, y:400, labelSide:'left' },

    { id:'neiguan', name:'内关', pinyin:'nèi guān', code:'PC6', meridian:'手厥阴心包经', part:'hand', svg:'hand',
      position:'前臂掌侧，腕横纹上 2 寸，两筋之间',
      simple:'手腕横纹上 3 横指，两条筋中间',
      functions:['心悸','恶心呕吐','晕车','失眠','焦虑','胃胀'],
      massage:'用另一手拇指指腹按揉 2-3 分钟，力度适中，左右手交替',
      combo:['配 神门 治心悸','配 中脘 治胃胀'],
      warning:['力度不宜过重'],
      x:250, y:240, labelSide:'right' },

    { id:'waiguan', name:'外关', pinyin:'wài guān', code:'TE5', meridian:'手少阳三焦经', part:'hand', svg:'hand',
      position:'前臂背侧，腕背横纹上 2 寸，两骨之间',
      simple:'手背腕横纹上 3 横指，两骨之间',
      functions:['颈椎痛','肩周炎','落枕','感冒初期'],
      massage:'用另一手拇指指腹按揉 2-3 分钟',
      combo:['配 风池 治颈椎痛','配 肩井 治肩周炎'],
      warning:['皮肤破损禁按'],
      x:280, y:240, labelSide:'right' },

    { id:'quchi', name:'曲池', pinyin:'qū chí', code:'LI11', meridian:'手阳明大肠经', part:'hand', svg:'hand',
      position:'屈肘成直角，肘横纹外侧端与肱骨外上髁连线的中点',
      simple:'屈肘，肘横纹外侧尽头的凹陷',
      functions:['肩周炎','感冒初期','咽喉痛','高血压辅助'],
      massage:'用另一手拇指按揉 1-2 分钟，力度稍大',
      combo:['配 合谷 治感冒','配 肩井 治肩周炎'],
      warning:['皮肤破损禁按'],
      x:290, y:80, labelSide:'right' },

    { id:'shenmen', name:'神门', pinyin:'shén mén', code:'HT7', meridian:'手少阴心经', part:'hand', svg:'hand',
      position:'腕横纹尺侧端，尺侧腕屈肌腱的桡侧凹陷处',
      simple:'手腕横纹小指侧的凹陷处',
      functions:['失眠','心悸','焦虑','健忘'],
      massage:'用另一手拇指指腹轻轻按揉 2-3 分钟，睡前按效果好',
      combo:['配 内关 治心悸','配 三阴交 治失眠'],
      warning:['力度宜轻'],
      x:288, y:292, labelSide:'right' },

    { id:'laogong', name:'劳宫', pinyin:'láo gōng', code:'PC8', meridian:'手厥阴心包经', part:'hand', svg:'hand',
      position:'掌心横纹中，第 2、3 掌骨之间偏于第 3 掌骨',
      simple:'握拳时，中指尖所指的掌心处',
      functions:['心悸','焦虑','口疮','手心出汗'],
      massage:'用另一手拇指按揉 1-2 分钟，或用两手掌心相互摩擦',
      combo:['配 内关 治心悸','配 涌泉 治失眠'],
      warning:['皮肤破损禁按'],
      x:250, y:380, labelSide:'right' },

    { id:'zusanli', name:'足三里', pinyin:'zú sān lǐ', code:'ST36', meridian:'足阳明胃经', part:'leg', svg:'leg',
      position:'小腿外侧，外膝眼下 3 寸，胫骨前缘外一横指',
      simple:'外膝眼下 4 横指，胫骨外侧一横指',
      functions:['胃胀','消化不良','便秘','腹泻','疲劳乏力','感冒初期'],
      massage:'用拇指指腹按揉 2-3 分钟，力度以明显酸胀为宜，双腿交替',
      combo:['配 中脘 治消化不良','配 天枢 治腹泻'],
      warning:['皮肤破损禁按'],
      x:298, y:240, labelSide:'right' },

    { id:'sanyinjiao', name:'三阴交', pinyin:'sān yīn jiāo', code:'SP6', meridian:'足太阴脾经', part:'leg', svg:'leg',
      position:'小腿内侧，内踝尖上 3 寸，胫骨内侧缘后方',
      simple:'内踝尖上 4 横指，胫骨内侧后缘',
      functions:['月经不调','痛经','失眠','消化不良'],
      massage:'用拇指指腹按揉 2-3 分钟，力度适中，双腿交替',
      combo:['配 关元 治痛经','配 神门 治失眠'],
      warning:['孕妇禁按（催产作用）','月经期慎按'],
      x:212, y:395, labelSide:'left' },

    { id:'taichong', name:'太冲', pinyin:'tài chōng', code:'LR3', meridian:'足厥阴肝经', part:'leg', svg:'leg',
      position:'足背，第 1、2 跖骨结合部之前的凹陷处',
      simple:'脚背大脚趾和二脚趾之间的凹陷，往脚踝方向推',
      functions:['头痛','痛经','焦虑','高血压辅助','月经不调'],
      massage:'用拇指指腹从下往上推按 1-2 分钟，力度稍大',
      combo:['配 合谷 治头痛','配 三阴交 治痛经'],
      warning:['孕妇慎按'],
      x:245, y:465, labelSide:'right' },

    { id:'taixi', name:'太溪', pinyin:'tài xī', code:'KI3', meridian:'足少阴肾经', part:'leg', svg:'leg',
      position:'足内踝尖与跟腱之间的凹陷处',
      simple:'内踝尖和脚后跟筋之间的凹陷',
      functions:['腰痛','耳鸣','高血压辅助','疲劳乏力'],
      massage:'用拇指指腹按揉 2-3 分钟，力度适中',
      combo:['配 命门 治腰痛','配 太冲 治高血压'],
      warning:['皮肤破损禁按'],
      x:205, y:430, labelSide:'bl' },

    { id:'yongquan', name:'涌泉', pinyin:'yǒng quán', code:'KI1', meridian:'足少阴肾经', part:'leg', svg:'leg',
      position:'足底前 1/3 处，卷足时足心最凹陷处',
      simple:'脚底前 1/3，脚趾弯曲时最凹的地方',
      functions:['失眠','高血压辅助','疲劳乏力','头痛'],
      massage:'用拇指指腹按揉 2-3 分钟，或用手掌搓热脚心',
      combo:['配 百会 治失眠','配 太冲 治高血压'],
      warning:['皮肤破损禁按'],
      x:250, y:485, labelSide:'bottom' },

    { id:'xuehai', name:'血海', pinyin:'xuè hǎi', code:'SP10', meridian:'足太阴脾经', part:'leg', svg:'leg',
      position:'屈膝，髌骨内上缘上 2 寸，股内侧肌隆起处',
      simple:'屈膝，膝盖骨内侧上方 3 横指',
      functions:['月经不调','痛经','皮肤瘙痒'],
      massage:'用拇指指腹按揉 2-3 分钟，双腿交替',
      combo:['配 三阴交 治痛经','配 关元 治月经不调'],
      warning:['孕妇慎按'],
      x:212, y:160, labelSide:'left' }
  ];

  /* ---------- 25 个症状数据 ---------- */
  const SYMPTOMS = [
    { id:'headache',     name:'头痛',       points:['taiyang','fengchi','baihui','hegu'],           primary:'taiyang',   tip:'先按太阳和风池，配合合谷，按 3-5 分钟' },
    { id:'insomnia',     name:'失眠',       points:['shenmen','neiguan','sanyinjiao','yongquan'],   primary:'shenmen',   tip:'睡前 1 小时按，神门和三阴交是核心' },
    { id:'eyestrain',    name:'眼疲劳',     points:['jingming','taiyang','fengchi','hegu'],         primary:'jingming',  tip:'睛明手法要轻，按完闭眼休息 2 分钟' },
    { id:'nasal',        name:'鼻塞',       points:['yingxiang','yintang','hegu','fengchi'],        primary:'yingxiang', tip:'迎香可以向上推，配合搓热鼻翼两侧' },
    { id:'toothache',    name:'牙痛',       points:['hegu','taiyang','quchi'],                      primary:'hegu',      tip:'合谷是止痛要穴，孕妇禁按' },
    { id:'neckpain',     name:'颈椎痛',     points:['fengchi','jianjing','dazhui','waiguan'],       primary:'fengchi',   tip:'配合热敷效果更好，避免长时间低头' },
    { id:'frozenshoulder',name:'肩周炎',    points:['jianjing','quchi','hegu','waiguan'],           primary:'jianjing',  tip:'拿捏肩部肌肉，配合爬墙运动' },
    { id:'backpain',     name:'腰痛',       points:['mingmen','dazhui','taixi','yongquan'],         primary:'mingmen',   tip:'命门搓热后按，效果更好' },
    { id:'bloating',     name:'胃胀',       points:['zhongwan','zusanli','neiguan','tianshu'],      primary:'zhongwan',  tip:'饭后 1 小时再按，顺时针揉腹 5 分钟' },
    { id:'indigestion',  name:'消化不良',   points:['zhongwan','zusanli','tianshu','neiguan'],      primary:'zusanli',   tip:'足三里每天按 3-5 分钟，坚持效果好' },
    { id:'constipation', name:'便秘',       points:['tianshu','zhongwan','hegu','zusanli'],         primary:'tianshu',   tip:'顺时针揉腹 100 圈，早上空腹按效果最好' },
    { id:'diarrhea',     name:'腹泻',       points:['tianshu','zusanli','zhongwan','guanyuan'],     primary:'tianshu',   tip:'配合艾灸关元，不要吃生冷' },
    { id:'carmotion',    name:'晕车',       points:['neiguan','hegu','taiyang','fengchi'],          primary:'neiguan',   tip:'上车前 30 分钟按内关，可按 5-10 分钟' },
    { id:'nausea',       name:'恶心呕吐',   points:['neiguan','zhongwan','zusanli','danzhong'],     primary:'neiguan',   tip:'内关按压能快速止呕，力度稍大' },
    { id:'menstruation', name:'月经不调',   points:['sanyinjiao','guanyuan','xuehai','taichong'],   primary:'sanyinjiao',tip:'经前一周开始按，经期改轻手法' },
    { id:'dysmenorrhea', name:'痛经',       points:['sanyinjiao','guanyuan','xuehai','taichong'],   primary:'guanyuan',  tip:'经前一周开始按，配合热敷小腹' },
    { id:'anxiety',      name:'焦虑',       points:['neiguan','shenmen','taichong','baihui'],       primary:'neiguan',   tip:'缓慢深呼吸，配合按内关 3 分钟' },
    { id:'palpitation',  name:'心悸',       points:['neiguan','shenmen','danzhong','laogong'],      primary:'neiguan',   tip:'心悸发作时按内关，无效立即就医' },
    { id:'hypertension', name:'高血压辅助', points:['taichong','taixi','yongquan','fengchi'],       primary:'taichong',  tip:'仅辅助，不能替代降压药，头晕立即就医' },
    { id:'cold',         name:'感冒初期',   points:['fengchi','dazhui','hegu','yingxiang'],         primary:'fengchi',   tip:'感冒头两天按效果最好，配合喝热水发汗' },
    { id:'cough',        name:'咳嗽',       points:['danzhong','fengchi','neiguan','hegu'],         primary:'danzhong',  tip:'膻中从上往下推 30 次，配合拍背' },
    { id:'sorethroat',   name:'咽喉痛',     points:['hegu','quchi','waiguan','taiyang'],            primary:'hegu',      tip:'合谷是止痛要穴，孕妇禁按' },
    { id:'fatigue',      name:'疲劳乏力',   points:['zusanli','baihui','guanyuan','mingmen'],       primary:'zusanli',   tip:'足三里 + 关元是经典补气组合，长期按效果好' },
    { id:'tinnitus',     name:'耳鸣',       points:['fengchi','taixi','taiyang','waiguan'],         primary:'taixi',     tip:'耳鸣原因复杂，长期不缓解建议就医' },
    { id:'stiffneck',    name:'落枕',       points:['fengchi','jianjing','waiguan','hegu'],         primary:'fengchi',   tip:'边按风池边慢慢转头，配合热敷' }
  ];

  /* ---------- 5 张 SVG 基础轮廓 ---------- */
  const SVG_BODIES = {
    'head': `
      <path d="M250 70 C190 70,145 120,145 200 C145 280,195 345,250 345 C305 345,355 280,355 200 C355 120,310 70,250 70 Z"
            fill="#fffaf0" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="145" cy="200" rx="14" ry="26" fill="#fffaf0" stroke="#8a7340" stroke-width="2"/>
      <ellipse cx="355" cy="200" rx="14" ry="26" fill="#fffaf0" stroke="#8a7340" stroke-width="2"/>
      <path d="M162 128 Q250 68,338 128" fill="none" stroke="#8a7340" stroke-width="1.6" opacity="0.55"/>
      <path d="M156 148 Q250 88,344 148" fill="none" stroke="#8a7340" stroke-width="1.2" opacity="0.35"/>
      <path d="M182 168 Q205 158,228 168" fill="none" stroke="#8a7340" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M272 168 Q295 158,318 168" fill="none" stroke="#8a7340" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M185 195 Q205 183,225 195 Q205 207,185 195 Z" fill="#fff" stroke="#8a7340" stroke-width="1.5"/>
      <path d="M275 195 Q295 183,315 195 Q295 207,275 195 Z" fill="#fff" stroke="#8a7340" stroke-width="1.5"/>
      <circle cx="205" cy="195" r="3.5" fill="#8a7340"/>
      <circle cx="295" cy="195" r="3.5" fill="#8a7340"/>
      <path d="M250 205 L250 245" fill="none" stroke="#8a7340" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M236 250 Q250 260,264 250" fill="none" stroke="#8a7340" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M225 285 Q250 302,275 285" fill="none" stroke="#8a7340" stroke-width="1.8" stroke-linecap="round"/>
    `,

    'neck': `
      <ellipse cx="250" cy="105" rx="62" ry="72" fill="#fffaf0" stroke="#8a7340" stroke-width="2.2"/>
      <path d="M200 78 Q250 52,300 78" fill="none" stroke="#8a7340" stroke-width="1.5" opacity="0.5"/>
      <path d="M215 175 L215 215 L285 215 L285 175" fill="none" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M120 230 Q190 208,250 212 Q310 208,380 230 L380 270 Q250 292,120 270 Z"
            fill="#fffaf0" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M140 270 Q155 350,160 400 Q155 435,150 460 L350 460 Q345 435,340 400 Q345 350,360 270"
            fill="#fffaf0" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M250 175 L250 460" fill="none" stroke="#8a7340" stroke-width="1.2" stroke-dasharray="5,5" opacity="0.45"/>
    `,

    'chest': `
      <path d="M130 70 Q190 50,250 55 Q310 50,370 70" fill="none" stroke="#8a7340" stroke-width="2.2"/>
      <path d="M130 70 C130 200,155 280,165 380 L175 460 L325 460 L335 380 C345 280,370 200,370 70"
            fill="#fffaf0" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M170 145 Q250 178,330 145" fill="none" stroke="#8a7340" stroke-width="1.2" opacity="0.4"/>
      <ellipse cx="250" cy="300" rx="11" ry="9" fill="#fffaf0" stroke="#8a7340" stroke-width="1.6"/>
      <path d="M250 55 L250 460" fill="none" stroke="#8a7340" stroke-width="1" stroke-dasharray="5,5" opacity="0.4"/>
    `,

    'hand': `
      <path d="M215 60 C205 130,200 210,205 285 L295 285 C300 210,295 130,285 60 Z"
            fill="#fffaf0" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M215 75 Q250 88,285 75" fill="none" stroke="#8a7340" stroke-width="1.4" opacity="0.55"/>
      <path d="M205 285 L205 295 M295 285 L295 295" stroke="#8a7340" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M200 295 C190 350,185 405,200 435 L300 435 C315 405,310 350,300 295 Z"
            fill="#fffaf0" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M200 335 C175 360,160 385,162 412 L200 420" fill="#fffaf0" stroke="#8a7340" stroke-width="2" stroke-linejoin="round"/>
      <path d="M215 435 L210 475 Q215 480,220 475 L225 435" fill="#fffaf0" stroke="#8a7340" stroke-width="2" stroke-linejoin="round"/>
      <path d="M240 435 L238 485 Q243 490,248 485 L250 435" fill="#fffaf0" stroke="#8a7340" stroke-width="2" stroke-linejoin="round"/>
      <path d="M265 435 L265 478 Q270 483,275 478 L278 435" fill="#fffaf0" stroke="#8a7340" stroke-width="2" stroke-linejoin="round"/>
      <path d="M290 435 L295 465 Q300 470,303 465 L303 435" fill="#fffaf0" stroke="#8a7340" stroke-width="2" stroke-linejoin="round"/>
      <path d="M215 355 Q250 372,290 355" fill="none" stroke="#8a7340" stroke-width="1" opacity="0.4"/>
      <path d="M215 382 Q250 398,290 382" fill="none" stroke="#8a7340" stroke-width="1" opacity="0.4"/>
    `,

    'leg': `
      <path d="M210 60 C200 120,200 170,205 200 C195 250,195 320,200 380 C200 405,205 420,210 435 L290 435 C295 420,300 405,300 380 C305 320,305 250,295 200 C300 170,300 120,290 60 Z"
            fill="#fffaf0" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="250" cy="200" rx="42" ry="26" fill="none" stroke="#8a7340" stroke-width="1.5" opacity="0.45"/>
      <path d="M250 230 L250 420" fill="none" stroke="#8a7340" stroke-width="1" stroke-dasharray="4,4" opacity="0.35"/>
      <path d="M210 435 C200 455,190 470,190 482 Q195 490,210 490 L290 490 Q305 490,310 482 C310 470,300 455,290 435 Z"
            fill="#fffaf0" stroke="#8a7340" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M200 482 Q250 486,300 482" fill="none" stroke="#8a7340" stroke-width="1" opacity="0.4"/>
    `
  };

  const PART_LABEL = {
    head:  { label: '头面部',   svg: 'head' },
    neck:  { label: '颈肩背部', svg: 'neck' },
    back:  { label: '颈肩背部', svg: 'neck' },
    chest: { label: '胸腹部',   svg: 'chest' },
    hand:  { label: '上肢',     svg: 'hand' },
    leg:   { label: '下肢',     svg: 'leg' }
  };

  const $ = id => document.getElementById(id);

  let currentView = 'symptom';
  let currentPart = 'head';
  let currentSym = null;

  /* ---------- 收藏 ---------- */
  function getFavs(){
    try { const raw = localStorage.getItem(FAV_KEY); return new Set(raw ? JSON.parse(raw) : []); }
    catch(e){ return new Set(); }
  }
  function saveFavs(set){
    try { localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set))); } catch(e){}
  }

  /* ---------- 标签位置计算 ---------- */
  function calcLabel(x, y, side){
    switch(side){
      case 'top':    return [x, y - 16, 'middle'];
      case 'bottom': return [x, y + 24, 'middle'];
      case 'left':   return [x - 14, y + 4, 'end'];
      case 'right':  return [x + 14, y + 4, 'start'];
      case 'tl':     return [x - 10, y - 12, 'end'];
      case 'tr':     return [x + 10, y - 12, 'start'];
      case 'bl':     return [x - 10, y + 20, 'end'];
      case 'br':     return [x + 10, y + 20, 'start'];
      default:       return [x, y - 16, 'middle'];
    }
  }

  function buildSvgInner(svgId, points, activeId){
    const body = SVG_BODIES[svgId] || '';
    const dots = points.map(p => {
      const [lx, ly, anchor] = calcLabel(p.x, p.y, p.labelSide);
      const isActive = String(p.id) === String(activeId);
      return `<g class="ap-point ${isActive ? 'active' : ''}" data-ap-point="${p.id}">
        <circle cx="${p.x}" cy="${p.y}" r="9"/>
        <text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="12">${p.name}</text>
      </g>`;
    }).join('');
    return body + dots;
  }

  /* ---------- 视图切换 ---------- */
  function switchView(v){
    currentView = v;
    $('apTabs').querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.ap === v));
    page.querySelectorAll('.ta-subpage').forEach(p => p.classList.toggle('active', p.dataset.apPage === v));
    if (v === 'symptom') renderSymptoms();
    else if (v === 'part') renderPart();
    else if (v === 'meridian') renderMeridian();
  }

  /* ---------- 按症状查 ---------- */
  function renderSymptoms(){
    const grid = $('apSymGrid');
    const q = ($('apSymSearch').value || '').trim().toLowerCase();
    const arr = q ? SYMPTOMS.filter(s => s.name.toLowerCase().includes(q)) : SYMPTOMS;
    if (!arr.length){
      grid.innerHTML = '<p class="empty" style="grid-column:1/-1;">没有匹配的症状，换个关键词试试～</p>';
      return;
    }
    grid.innerHTML = arr.map(s => {
      const cls = 'ap-sym-chip' + (currentSym === s.id ? ' active' : '');
      return `<button class="${cls}" data-ap-sym="${s.id}" type="button">${esc(s.name)}</button>`;
    }).join('');
    grid.querySelectorAll('[data-ap-sym]').forEach(b => {
      b.addEventListener('click', () => { currentSym = b.dataset.apSym; renderSymptoms(); renderSymDetail(); });
    });
  }

  function renderSymDetail(){
    const box = $('apSymDetail');
    if (!currentSym){ box.style.display = 'none'; return; }
    const s = SYMPTOMS.find(x => x.id === currentSym);
    if (!s){ box.style.display = 'none'; return; }
    const pts = s.points.map(id => POINTS.find(p => p.id === id)).filter(Boolean);
    box.style.display = '';
    box.innerHTML = `
      <div class="panel">
        <div class="ap-sym-detail-head">
          <h3 class="ap-sym-detail-name">${esc(s.name)}</h3>
          <span style="font-size:12.5px;color:var(--muted);">推荐 ${pts.length} 个穴位</span>
        </div>
        <div class="ap-sym-tip">💡 ${esc(s.tip)}</div>
        <div class="ap-sym-points">
          ${pts.map(p => `
            <button class="ap-sym-point ${p.id === s.primary ? 'primary' : ''}" data-ap-open="${p.id}" type="button">
              <b>${esc(p.name)}</b>
              <span>${esc(p.code)} · ${esc(p.meridian)}</span>
              <span style="margin-top:6px;color:#5a4a20;">${p.functions.slice(0,3).map(f => esc(f)).join(' / ')}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    box.querySelectorAll('[data-ap-open]').forEach(b => {
      b.addEventListener('click', () => openPoint(b.dataset.apOpen));
    });
  }

  /* ---------- 按部位查 ---------- */
  function renderPart(){
    const tabs = $('apPartTabs');
    const parts = [
      { id:'head',  label:'头面部' },
      { id:'neck',  label:'颈肩背部' },
      { id:'chest', label:'胸腹部' },
      { id:'hand',  label:'上肢' },
      { id:'leg',   label:'下肢' }
    ];
    tabs.innerHTML = parts.map(p =>
      `<button class="ap-part-tab ${currentPart === p.id ? 'active' : ''}" data-ap-part="${p.id}" type="button">${p.label}</button>`
    ).join('');
    tabs.querySelectorAll('[data-ap-part]').forEach(b => {
      b.addEventListener('click', () => { currentPart = b.dataset.apPart; renderPart(); });
    });

    // 当前部位对应的 svg
    const svgId = PART_LABEL[currentPart].svg;
    // 属于这张图的穴位
    let pts = POINTS.filter(p => p.svg === svgId);

    // 更新 SVG
    const wrap = page.querySelector('.ap-svg-panel');
    let svgEl = page.querySelector('#apPartSvg');
    if (!svgEl){
      svgEl = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svgEl.setAttribute('id','apPartSvg');
      svgEl.setAttribute('viewBox','0 0 500 500');
      svgEl.setAttribute('xmlns','http://www.w3.org/2000/svg');
      wrap.insertBefore(svgEl, wrap.firstChild);
    }
    svgEl.innerHTML = buildSvgInner(svgId, pts, null);
    svgEl.querySelectorAll('[data-ap-point]').forEach(g => {
      g.style.cursor = 'pointer';
      g.addEventListener('click', () => openPoint(g.dataset.apPoint));
    });

    // 列表
    const list = $('apPartList');
    if (!pts.length){
      list.innerHTML = '<p class="empty">此部位暂无穴位收录</p>';
    } else {
      list.innerHTML = pts.map(p => `
        <button class="ap-point-chip" data-ap-open="${p.id}" type="button">
          <b>${esc(p.name)}</b>
          <span>${esc(p.code)} · ${esc(p.meridian)}</span>
        </button>
      `).join('');
      list.querySelectorAll('[data-ap-open]').forEach(b => {
        b.addEventListener('click', () => openPoint(b.dataset.apOpen));
      });
    }
  }

  /* ---------- 按经络查 ---------- */
  function renderMeridian(){
    const grid = $('apMerGrid');
    const byMer = {};
    POINTS.forEach(p => {
      if (!byMer[p.meridian]) byMer[p.meridian] = [];
      byMer[p.meridian].push(p);
    });
    const list = Object.keys(byMer).map(m => ({ name: m, points: byMer[m] }));
    grid.innerHTML = list.map(m => `
      <button class="ap-mer-card" data-ap-mer="${esc(m.name)}" type="button">
        <b>${esc(m.name)}</b>
        <span>${m.points.map(p => esc(p.name)).join(' · ')}</span>
      </button>
    `).join('');
    grid.querySelectorAll('[data-ap-mer]').forEach(b => {
      b.addEventListener('click', () => {
        const m = b.dataset.apMer;
        const pts = byMer[m] || [];
        if (pts.length >= 1) openPoint(pts[0].id);
      });
    });
  }

  /* ---------- 穴位详情弹层 ---------- */
  let overlay = null;
  function ensureOverlay(){
    if (overlay) return overlay;
    overlay = $('apDetail');
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closePoint();
    });
    return overlay;
  }

  function openPoint(id){
    const p = POINTS.find(x => x.id === id);
    if (!p) return;
    const ov = ensureOverlay();
    const favs = getFavs();
    const isFav = favs.has(p.id);

    // 用该穴位所属的图 + 高亮该穴位
    const svgId = p.svg;
    const pts = POINTS.filter(x => x.svg === svgId);

    ov.innerHTML = `
      <div class="ap-detail-card">
        <div class="ap-detail-head">
          <div class="ap-detail-head-left">
            <div class="ap-detail-title-row">
              <h3 class="ap-detail-title">${esc(p.name)}</h3>
              <span class="ap-detail-pinyin">${esc(p.pinyin)}</span>
              <span class="ap-detail-code">${esc(p.code)}</span>
            </div>
            <div class="ap-detail-meridian">${esc(p.meridian)} · ${esc(PART_LABEL[p.part]?.label || '')}</div>
          </div>
          <button class="ap-detail-close" id="apDetailClose" type="button">✕</button>
        </div>
        <div class="ap-detail-body">
          <div class="ap-detail-svg-wrap">
            <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" class="ap-detail-svg">
              ${buildSvgInner(svgId, pts, p.id)}
            </svg>
          </div>

          <div class="ap-detail-section">
            <div class="ap-detail-label">简易定位</div>
            <div class="ap-detail-simple">${esc(p.simple)}</div>
          </div>

          <div class="ap-detail-section">
            <div class="ap-detail-label">详细定位</div>
            <div class="ap-detail-value">${esc(p.position)}</div>
          </div>

          <div class="ap-detail-section">
            <div class="ap-detail-label">主治</div>
            <div class="ap-detail-tags">${p.functions.map(f => `<span class="ap-detail-tag">${esc(f)}</span>`).join('')}</div>
          </div>

          <div class="ap-detail-section">
            <div class="ap-detail-label">按摩方法</div>
            <div class="ap-detail-value">${esc(p.massage)}</div>
          </div>

          ${p.combo && p.combo.length ? `
          <div class="ap-detail-section">
            <div class="ap-detail-label">常用配伍</div>
            <div class="ap-detail-value">${p.combo.map(c => '· ' + esc(c)).join('<br>')}</div>
          </div>` : ''}

          ${p.warning && p.warning.length ? `
          <div class="ap-detail-section">
            <div class="ap-detail-label">⚠️ 禁忌</div>
            <div class="ap-detail-warning">${p.warning.map(w => '· ' + esc(w)).join('<br>')}</div>
          </div>` : ''}
        </div>
        <div class="ap-detail-foot">
          <button class="btn ghost small ap-fav-btn ${isFav ? 'on' : ''}" id="apFavBtn" type="button">${isFav ? '★ 已收藏' : '☆ 收藏'}</button>
          <button class="btn ghost small" id="apSpeakBtn" type="button">🔊 朗读定位</button>
        </div>
      </div>
    `;
    ov.classList.add('show');

    $('apDetailClose').addEventListener('click', closePoint);
    $('apFavBtn').addEventListener('click', () => {
      const set = getFavs();
      if (set.has(p.id)) set.delete(p.id); else set.add(p.id);
      saveFavs(set);
      const btn = $('apFavBtn');
      const nowFav = set.has(p.id);
      btn.classList.toggle('on', nowFav);
      btn.textContent = nowFav ? '★ 已收藏' : '☆ 收藏';
      showToast(nowFav ? '已收藏' : '已取消收藏');
    });
    $('apSpeakBtn').addEventListener('click', () => {
      if (!window.speechSynthesis){ showToast('当前浏览器不支持语音朗读'); return; }
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(`${p.name}。定位：${p.position}。简易定位：${p.simple}。按摩方法：${p.massage}`);
        u.lang = 'zh-CN'; u.rate = 1.05;
        window.speechSynthesis.speak(u);
      } catch(e){ showToast('朗读失败'); }
    });
  }

  function closePoint(){
    if (overlay) overlay.classList.remove('show');
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents(){
    $('apTabs').querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => switchView(b.dataset.ap));
    });
    $('apSymSearch').addEventListener('input', () => renderSymptoms());
  }

  /* ---------- 对外接口 ---------- */
  window.__acupointInit = function(){
    switchView('symptom');
  };

  bindEvents();
  if (page.classList.contains('active')) window.__acupointInit();

  console.log('[常见穴位速查] 已加载');
})();