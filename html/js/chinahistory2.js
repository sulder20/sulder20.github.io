/* ============================================================
   中国历史简表 · 岁窦工具箱 V4.0 · 四合一版（防御性重写）
   时间轴 / 朝代对比 / 历史地图 / 历代帝王
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-chinahistory');
  if (!page) return;

  /* ============================================================
     数据
     ============================================================ */
  var DATA = [
    { name:'夏', years:'约前 2070 — 前 1600', start:-2070, end:-1600, era:'先秦', capital:'阳城、斟鄩', founder:'禹', last:'桀', people:['禹','启','桀'], events:['禹传子启，世袭制取代禅让制','太康失国、少康中兴','末代君主桀荒淫无道，为商汤所灭'], achievements:['中国历史上第一个王朝','二里头文化','青铜器开始使用'] },
    { name:'商', years:'约前 1600 — 前 1046', start:-1600, end:-1046, era:'先秦', capital:'亳、殷（今安阳）', founder:'汤', last:'纣', people:['汤','盘庚','纣','伊尹'], events:['汤灭夏建商','盘庚迁殷，商朝中兴','武丁盛世','牧野之战，商亡'], achievements:['甲骨文成熟','青铜器鼎盛（司母戊鼎）','干支纪日法'] },
    { name:'西周', years:'前 1046 — 前 771', start:-1046, end:-771, era:'先秦', capital:'镐京（今西安）', founder:'周武王', last:'周幽王', people:['周武王','周公旦','周厉王','周幽王'], events:['武王伐纣，建西周','分封制、宗法制、礼乐制确立','国人暴动（前 841，中国确切纪年开端）','犬戎攻破镐京，西周亡'], achievements:['分封制','宗法制','青铜铭文','《诗经》早期作品'] },
    { name:'东周·春秋', years:'前 770 — 前 476', start:-770, end:-476, era:'先秦', capital:'洛邑（今洛阳）', founder:'周平王', last:'—', people:['齐桓公','晋文公','楚庄王','孔子','老子'], events:['周平王东迁','春秋五霸争雄','孔子创儒家，老子创道家','铁器、牛耕开始推广'], achievements:['儒家、道家创立','《春秋》《道德经》','铁器牛耕推广'] },
    { name:'东周·战国', years:'前 475 — 前 221', start:-475, end:-221, era:'先秦', capital:'洛邑', founder:'—', last:'—', people:['商鞅','孙膑','孟子','庄子','屈原','韩非'], events:['战国七雄并立','商鞅变法（前 356）','百家争鸣','前 221 秦灭六国，天下一统'], achievements:['百家争鸣','《孙子兵法》《庄子》《离骚》','都江堰、郑国渠'] },
    { name:'秦', years:'前 221 — 前 207', start:-221, end:-207, era:'秦汉', capital:'咸阳', founder:'秦始皇', last:'秦二世胡亥', people:['秦始皇','李斯','蒙恬','陈胜','吴广'], events:['秦始皇统一六国','书同文、车同轨、统一度量衡','焚书坑儒','陈胜吴广起义（前 209）','巨鹿之战，秦亡'], achievements:['中央集权郡县制','万里长城','秦始皇陵兵马俑','统一文字（小篆）'] },
    { name:'西汉', years:'前 202 — 公元 8', start:-202, end:8, era:'秦汉', capital:'长安', founder:'刘邦', last:'孺子婴', people:['刘邦','汉武帝','张骞','司马迁','卫青','霍去病'], events:['刘邦建汉','文景之治','汉武帝罢黜百家独尊儒术','张骞通西域，丝绸之路开通','司马迁著《史记》'], achievements:['丝绸之路','《史记》','造纸术雏形','儒学独尊'] },
    { name:'新', years:'公元 9 — 23', start:9, end:23, era:'秦汉', capital:'常安（长安）', founder:'王莽', last:'王莽', people:['王莽'], events:['王莽篡汉','托古改制失败','绿林赤眉起义','昆阳之战，新亡'], achievements:['土地改革尝试（王田制）','货币改革（失败）'] },
    { name:'东汉', years:'25 — 220', start:25, end:220, era:'秦汉', capital:'洛阳', founder:'刘秀', last:'汉献帝刘协', people:['刘秀','蔡伦','张衡','华佗','曹操','班超'], events:['光武中兴','蔡伦改进造纸术','张衡发明地动仪','黄巾起义（184）','官渡之战、赤壁之战'], achievements:['造纸术改进','地动仪','《汉书》','《九章算术》'] },
    { name:'三国·魏', years:'220 — 265', start:220, end:265, era:'三国两晋南北朝', capital:'洛阳', founder:'曹丕', last:'曹奂', people:['曹操','曹丕','司马懿','钟繇'], events:['曹丕称帝建魏','屯田制','灭蜀（263）','司马炎代魏建晋'], achievements:['屯田制','九品中正制','建安文学'] },
    { name:'三国·蜀汉', years:'221 — 263', start:221, end:263, era:'三国两晋南北朝', capital:'成都', founder:'刘备', last:'刘禅', people:['刘备','诸葛亮','关羽','张飞','赵云'], events:['刘备称帝','诸葛亮北伐','邓艾灭蜀'], achievements:['蜀锦','都江堰维护','《出师表》'] },
    { name:'三国·吴', years:'222 — 280', start:222, end:280, era:'三国两晋南北朝', capital:'建业（今南京）', founder:'孙权', last:'孙皓', people:['孙权','周瑜','陆逊','鲁肃'], events:['孙权称帝','开发江南','西晋灭吴（280），三国归晋'], achievements:['开发江南','造船业','海外交流（卫温到夷洲）'] },
    { name:'西晋', years:'266 — 316', start:266, end:316, era:'三国两晋南北朝', capital:'洛阳', founder:'司马炎', last:'晋愍帝', people:['司马炎','陈寿','竹林七贤'], events:['司马炎代魏建晋','八王之乱','五胡内迁','永嘉之乱，西晋亡'], achievements:['《三国志》','占田制','玄学兴起'] },
    { name:'东晋', years:'317 — 420', start:317, end:420, era:'三国两晋南北朝', capital:'建康（今南京）', founder:'司马睿', last:'晋恭帝', people:['王导','谢安','王羲之','陶渊明','顾恺之'], events:['衣冠南渡','淝水之战（383）','王羲之《兰亭集序》'], achievements:['书法（王羲之）','田园诗（陶渊明）','绘画（顾恺之）','江南开发'] },
    { name:'南朝·宋', years:'420 — 479', start:420, end:479, era:'三国两晋南北朝', capital:'建康', founder:'刘裕', last:'宋顺帝', people:['刘裕','谢灵运'], events:['刘裕代晋建宋','元嘉之治'], achievements:['山水诗（谢灵运）','《世说新语》'] },
    { name:'南朝·齐', years:'479 — 502', start:479, end:502, era:'三国两晋南北朝', capital:'建康', founder:'萧道成', last:'齐和帝', people:['萧道成'], events:['萧道成代宋建齐','永明之治'], achievements:['永明体诗歌','《南齐书》'] },
    { name:'南朝·梁', years:'502 — 557', start:502, end:557, era:'三国两晋南北朝', capital:'建康', founder:'萧衍（梁武帝）', last:'梁敬帝', people:['梁武帝','刘勰','钟嵘'], events:['萧衍建梁','侯景之乱'], achievements:['《文心雕龙》','《诗品》','《昭明文选》'] },
    { name:'南朝·陈', years:'557 — 589', start:557, end:589, era:'三国两晋南北朝', capital:'建康', founder:'陈霸先', last:'陈后主', people:['陈霸先','陈后主'], events:['陈霸先建陈','隋灭陈，南北朝结束'], achievements:['《玉台新咏》','陈后主《玉树后庭花》'] },
    { name:'北朝·北魏', years:'386 — 534', start:386, end:534, era:'三国两晋南北朝', capital:'平城、洛阳', founder:'拓跋珪', last:'元修', people:['孝文帝','贾思勰','郦道元'], events:['统一北方','孝文帝改革（迁都洛阳、汉化）','六镇起义'], achievements:['云冈石窟、龙门石窟','《齐民要术》','《水经注》'] },
    { name:'北朝·东魏', years:'534 — 550', start:534, end:550, era:'三国两晋南北朝', capital:'邺城', founder:'元善见', last:'元善见', people:['高欢'], events:['高欢立元善见为帝','为北齐所代'], achievements:['—'] },
    { name:'北朝·西魏', years:'535 — 557', start:535, end:557, era:'三国两晋南北朝', capital:'长安', founder:'元宝炬', last:'元廓', people:['宇文泰'], events:['宇文泰立元宝炬为帝','为北周所代'], achievements:['府兵制雏形'] },
    { name:'北朝·北齐', years:'550 — 577', start:550, end:577, era:'三国两晋南北朝', capital:'邺城', founder:'高洋', last:'高恒', people:['高洋','高欢'], events:['高洋代东魏建北齐','为北周所灭'], achievements:['北齐佛像艺术'] },
    { name:'北朝·北周', years:'557 — 581', start:557, end:581, era:'三国两晋南北朝', capital:'长安', founder:'宇文觉', last:'宇文阐', people:['宇文觉','宇文邕（周武帝）'], events:['宇文觉代西魏建北周','周武帝灭北齐，统一北方','杨坚代周建隋'], achievements:['府兵制完善','灭佛运动'] },
    { name:'隋', years:'581 — 618', start:581, end:618, era:'隋唐', capital:'长安、洛阳', founder:'隋文帝杨坚', last:'隋炀帝杨广', people:['隋文帝','隋炀帝','李春'], events:['隋灭陈，结束分裂','首创科举制','开凿大运河','三征高丽','隋末农民起义'], achievements:['科举制','大运河','赵州桥','三省六部制'] },
    { name:'唐', years:'618 — 907', start:618, end:907, era:'隋唐', capital:'长安', founder:'唐高祖李渊', last:'唐哀帝李柷', people:['唐太宗','武则天','唐玄宗','李白','杜甫','白居易','玄奘'], events:['贞观之治','武则天称帝','开元盛世','安史之乱（755—763）','黄巢起义'], achievements:['唐诗鼎盛','丝绸之路繁荣','雕版印刷术','火药用于军事','《唐律疏议》'] },
    { name:'五代十国', years:'907 — 960', start:907, end:960, era:'宋辽夏金元', capital:'—', founder:'—', last:'—', people:['朱温','李煜','柴荣'], events:['五代：后梁、后唐、后晋、后汉、后周','十国并立','赵匡胤陈桥兵变，建宋'], achievements:['词的发展（李煜）','雕版印刷普及'] },
    { name:'北宋', years:'960 — 1127', start:960, end:1127, era:'宋辽夏金元', capital:'东京（今开封）', founder:'宋太祖赵匡胤', last:'宋钦宗', people:['赵匡胤','包拯','王安石','苏轼','司马光','范仲淹'], events:['杯酒释兵权','澶渊之盟（1005）','王安石变法','靖康之变，北宋亡'], achievements:['活字印刷（毕昇）','指南针用于航海','火药广泛使用','《资治通鉴》《梦溪笔谈》','宋词繁荣'] },
    { name:'辽', years:'916 — 1125', start:916, end:1125, era:'宋辽夏金元', capital:'上京临潢府', founder:'耶律阿保机', last:'天祚帝', people:['耶律阿保机','萧太后'], events:['契丹建国','与北宋长期对峙','澶渊之盟','为金所灭'], achievements:['契丹文字','南北面官制','佛塔建筑'] },
    { name:'西夏', years:'1038 — 1227', start:1038, end:1227, era:'宋辽夏金元', capital:'兴庆府（今银川）', founder:'李元昊', last:'末帝李睍', people:['李元昊'], events:['党项族建立','与宋、辽、金长期鼎立','为蒙古所灭'], achievements:['西夏文字','西夏佛塔','党项文化'] },
    { name:'金', years:'1115 — 1234', start:1115, end:1234, era:'宋辽夏金元', capital:'会宁府、中都（今北京）', founder:'完颜阿骨打', last:'金末帝', people:['完颜阿骨打','完颜亮','元好问'], events:['女真建国','灭辽、灭北宋','迁都中都（北京）','为蒙古所灭'], achievements:['女真文字','猛安谋克制','金代文学'] },
    { name:'南宋', years:'1127 — 1279', start:1127, end:1279, era:'宋辽夏金元', capital:'临安（今杭州）', founder:'宋高宗赵构', last:'宋末帝赵昺', people:['岳飞','辛弃疾','陆游','文天祥','朱熹'], events:['赵构建南宋','岳飞抗金','绍兴和议','崖山海战（1279），宋亡'], achievements:['理学（朱熹）','经济重心南移完成','海上贸易发达','指南针、火药西传'] },
    { name:'元', years:'1271 — 1368', start:1271, end:1368, era:'宋辽夏金元', capital:'大都（今北京）', founder:'元世祖忽必烈', last:'元顺帝', people:['成吉思汗','忽必烈','郭守敬','关汉卿','马可·波罗'], events:['成吉思汗统一蒙古','忽必烈定国号元','灭南宋统一全国','元末红巾军起义'], achievements:['行省制度','《授时历》','元曲（关汉卿、王实甫）','大运河改道','中外交流频繁'] },
    { name:'明', years:'1368 — 1644', start:1368, end:1644, era:'明清', capital:'南京、北京', founder:'明太祖朱元璋', last:'明思宗崇祯', people:['朱元璋','郑和','戚继光','张居正','李时珍','徐光启'], events:['朱元璋建明','郑和七下西洋（1405—1433）','戚继光抗倭','张居正改革','李自成攻入北京，明亡'], achievements:['《永乐大典》','《本草纲目》《天工开物》《农政全书》','紫禁城','明长城','小说（四大名著中三部）'] },
    { name:'清', years:'1636 — 1912', start:1636, end:1912, era:'明清', capital:'盛京、北京', founder:'皇太极', last:'宣统帝溥仪', people:['努尔哈赤','康熙','乾隆','林则徐','李鸿章','曾国藩'], events:['努尔哈赤建后金','皇太极改国号清','康乾盛世','鸦片战争（1840）','洋务运动、戊戌变法','辛亥革命（1911），清帝退位'], achievements:['《康熙字典》《四库全书》','疆域奠定','近代化尝试（洋务运动）','京剧形成'] },
    { name:'太平天国', years:'1851 — 1864', start:1851, end:1864, era:'近现代', capital:'天京（今南京）', founder:'洪秀全', last:'洪天贵福', people:['洪秀全','杨秀清','石达开','李秀成'], events:['金田起义（1851）','定都天京','天京事变','为湘军所灭'], achievements:['《天朝田亩制度》','《资政新篇》','沉重打击清朝统治'] },
    { name:'中华民国', years:'1912 — 1949', start:1912, end:1949, era:'近现代', capital:'南京、重庆', founder:'孙中山', last:'蒋介石', people:['孙中山','袁世凯','蒋介石','毛泽东','鲁迅'], events:['中华民国成立','五四运动（1919）','北伐战争','抗日战争（1937—1945）','解放战争'], achievements:['推翻帝制','新文化运动','抗日战争胜利','民族工业发展'] },
    { name:'中华人民共和国', years:'1949 至今', start:1949, end:2025, era:'近现代', capital:'北京', founder:'毛泽东', last:'—', people:['毛泽东','邓小平等'], events:['1949 年 10 月 1 日开国大典','改革开放（1978）','香港回归（1997）','澳门回归（1999）','加入 WTO（2001）','全面建成小康社会（2021）'], achievements:['两弹一星','载人航天','高铁网络','脱贫攻坚','经济体量世界前列'] }
  ];

  var EMPERORS = {
    '秦': [
      { name:'秦始皇', title:'始皇帝', reign:'前 221 — 前 210', summary:'统一六国，推行郡县制、书同文车同轨，中国第一位皇帝。', detail:{ '本名':'嬴政','生卒':'前 259 — 前 210','主要功绩':'灭六国、统度量衡、修长城、建驰道','晚年':'求仙问药，暴政激起民怨' } },
      { name:'秦二世', title:'二世皇帝', reign:'前 210 — 前 207', summary:'胡亥，赵高专权，秦朝迅速走向崩溃。', detail:{ '本名':'胡亥','生卒':'前 230 — 前 207','主要事件':'赵高专权、指鹿为马、陈胜吴广起义','结局':'为赵高所逼自杀' } }
    ],
    '西汉': [
      { name:'汉高祖', title:'高祖', reign:'前 202 — 前 195', summary:'刘邦，布衣出身，击败项羽建立汉朝。', detail:{ '本名':'刘邦','生卒':'前 256 — 前 195','主要功绩':'楚汉战争胜利、定都长安、休养生息','著名典故':'约法三章、鸿门宴' } },
      { name:'汉文帝', title:'文帝', reign:'前 180 — 前 157', summary:'刘恒，与景帝共开「文景之治」。', detail:{ '本名':'刘恒','生卒':'前 203 — 前 157','主要功绩':'轻徭薄赋、废肉刑','与民休息':'文景之治核心人物' } },
      { name:'汉景帝', title:'景帝', reign:'前 157 — 前 141', summary:'刘启，平定七国之乱，延续文景之治。', detail:{ '本名':'刘启','生卒':'前 188 — 前 141','主要事件':'削藩、平定七国之乱','延续':'与文帝共为「文景之治」' } },
      { name:'汉武帝', title:'武帝', reign:'前 141 — 前 87', summary:'刘彻，罢黜百家独尊儒术，北击匈奴，开丝绸之路。', detail:{ '本名':'刘彻','生卒':'前 156 — 前 87','主要功绩':'独尊儒术、卫青霍去病击匈奴、张骞通西域','晚年':'巫蛊之祸，下轮台诏反省' } }
    ],
    '东汉': [
      { name:'汉光武帝', title:'光武帝', reign:'25 — 57', summary:'刘秀，重建汉室，史称「光武中兴」。', detail:{ '本名':'刘秀','生卒':'前 5 — 57','主要功绩':'昆阳之战、重建汉朝、柔道治国','典故':'仕宦当作执金吾，娶妻当得阴丽华' } },
      { name:'汉献帝', title:'献帝', reign:'189 — 220', summary:'刘协，东汉末代皇帝，禅位于曹丕。', detail:{ '本名':'刘协','生卒':'181 — 234','主要事件':'董卓之乱、曹操挟天子以令诸侯','结局':'禅位后被封山阳公' } }
    ],
    '三国·魏': [
      { name:'魏武帝', title:'武帝（追尊）', reign:'未即位', summary:'曹操，挟天子以令诸侯，奠基曹魏。', detail:{ '本名':'曹操','生卒':'155 — 220','主要功绩':'统一北方、屯田制、唯才是举','文学':'建安文学领袖，《短歌行》《观沧海》' } },
      { name:'魏文帝', title:'文帝', reign:'220 — 226', summary:'曹丕，代汉称帝，建曹魏。', detail:{ '本名':'曹丕','生卒':'187 — 226','主要功绩':'代汉建魏、九品中正制','文学':'《典论·论文》' } }
    ],
    '隋': [
      { name:'隋文帝', title:'文帝', reign:'581 — 604', summary:'杨坚，结束南北朝分裂，创「开皇之治」。', detail:{ '本名':'杨坚','生卒':'541 — 604','主要功绩':'统一全国、创科举制、三省六部制','后世评价':'被尊为「圣人可汗」' } },
      { name:'隋炀帝', title:'炀帝', reign:'604 — 618', summary:'杨广，开大运河、三征高丽，民变蜂起。', detail:{ '本名':'杨广','生卒':'569 — 618','主要功绩':'开大运河、创进士科','争议':'滥用民力，隋朝二世而亡' } }
    ],
    '唐': [
      { name:'唐高祖', title:'高祖', reign:'618 — 626', summary:'李渊，起兵晋阳，建立唐朝。', detail:{ '本名':'李渊','生卒':'566 — 635','主要功绩':'建唐、统一全国','退位':'玄武门之变后让位于李世民' } },
      { name:'唐太宗', title:'太宗', reign:'626 — 649', summary:'李世民，开创「贞观之治」。', detail:{ '本名':'李世民','生卒':'598 — 649','主要功绩':'贞观之治、灭东突厥、纳谏如流','名臣':'房玄龄、杜如晦、魏征' } },
      { name:'武则天', title:'则天大圣皇帝', reign:'690 — 705', summary:'中国历史上唯一的女皇帝。', detail:{ '本名':'武曌','生卒':'624 — 705','主要功绩':'承贞观启开元、发展科举','国号':'改唐为周，史称「武周」' } },
      { name:'唐玄宗', title:'玄宗', reign:'712 — 756', summary:'李隆基，前期「开元盛世」，后期「安史之乱」。', detail:{ '本名':'李隆基','生卒':'685 — 762','前期':'开元盛世，唐朝极盛','转折':'安史之乱，唐由盛转衰','典故':'与杨贵妃的爱情故事' } }
    ],
    '北宋': [
      { name:'宋太祖', title:'太祖', reign:'960 — 976', summary:'赵匡胤，陈桥兵变建宋，杯酒释兵权。', detail:{ '本名':'赵匡胤','生卒':'927 — 976','主要功绩':'建宋、结束五代十国、重文轻武','典故':'杯酒释兵权、黄袍加身' } },
      { name:'宋神宗', title:'神宗', reign:'1067 — 1085', summary:'赵顼，支持王安石变法。', detail:{ '本名':'赵顼','生卒':'1048 — 1085','主要事件':'熙宁变法、元丰改制','争议':'新旧党争激烈' } },
      { name:'宋徽宗', title:'徽宗', reign:'1100 — 1126', summary:'赵佶，书画大家，靖康之变被金所俘。', detail:{ '本名':'赵佶','生卒':'1082 — 1135','艺术':'瘦金体、花鸟画','结局':'靖康之变被掳北上，死于五国城' } }
    ],
    '南宋': [
      { name:'宋高宗', title:'高宗', reign:'1127 — 1162', summary:'赵构，南宋开国皇帝。', detail:{ '本名':'赵构','生卒':'1107 — 1187','主要事件':'绍兴和议、岳飞被害','争议':'偏安江南，不思北伐' } },
      { name:'宋孝宗', title:'孝宗', reign:'1162 — 1189', summary:'赵昚，南宋最有作为的皇帝。', detail:{ '本名':'赵昚','生卒':'1127 — 1194','主要功绩':'平反岳飞、发动隆兴北伐','评价':'南宋中兴之主' } }
    ],
    '元': [
      { name:'元太祖', title:'太祖（追尊）', reign:'未即位', summary:'成吉思汗，统一蒙古诸部。', detail:{ '本名':'铁木真','生卒':'1162 — 1227','主要功绩':'统一蒙古、西征、奠定大蒙古国','后世影响':'世界历史上著名的征服者' } },
      { name:'元世祖', title:'世祖', reign:'1271 — 1294', summary:'忽必烈，定国号元，灭南宋统一全国。', detail:{ '本名':'忽必烈','生卒':'1215 — 1294','主要功绩':'建元、灭南宋、行省制度','对外':'两次征日失败、马可·波罗来华' } }
    ],
    '明': [
      { name:'明太祖', title:'太祖', reign:'1368 — 1398', summary:'朱元璋，布衣出身，建立明朝。', detail:{ '本名':'朱元璋','生卒':'1328 — 1398','主要功绩':'建明、废除丞相、设锦衣卫','典故':'当过和尚、放过牛' } },
      { name:'明成祖', title:'成祖', reign:'1402 — 1424', summary:'朱棣，靖难之役夺位，迁都北京。', detail:{ '本名':'朱棣','生卒':'1360 — 1424','主要功绩':'迁都北京、郑和下西洋、编《永乐大典》','争议':'靖难之役夺侄儿皇位' } },
      { name:'明神宗', title:'神宗（万历）', reign:'1572 — 1620', summary:'朱翊钧，前十年张居正改革，后期怠政。', detail:{ '本名':'朱翊钧','生卒':'1563 — 1620','前期':'张居正改革，万历中兴','后期':'三十年不上朝，明亡之始' } },
      { name:'明思宗', title:'思宗（崇祯）', reign:'1627 — 1644', summary:'朱由检，明朝末代皇帝，自缢煤山。', detail:{ '本名':'朱由检','生卒':'1611 — 1644','主要事件':'李自成破北京、自缢煤山','遗言':'「任贼分裂朕尸，勿伤百姓一人」' } }
    ],
    '清': [
      { name:'清太祖', title:'太祖', reign:'1616 — 1626', summary:'努尔哈赤，建后金。', detail:{ '本名':'爱新觉罗·努尔哈赤','生卒':'1559 — 1626','主要功绩':'统一女真、建后金、八旗制度','结局':'宁远之战为袁崇焕所败，病死' } },
      { name:'清太宗', title:'太宗', reign:'1626 — 1643', summary:'皇太极，改国号为清。', detail:{ '本名':'爱新觉罗·皇太极','生卒':'1592 — 1643','主要功绩':'改国号清、收降明将、松锦之战','结局':'未入关即病逝' } },
      { name:'康熙帝', title:'圣祖', reign:'1661 — 1722', summary:'玄烨，在位 61 年，康乾盛世开端。', detail:{ '本名':'爱新觉罗·玄烨','生卒':'1654 — 1722','主要功绩':'平三藩、收台湾、抗击沙俄、编《康熙字典》','著名':'中国在位时间最长的皇帝' } },
      { name:'乾隆帝', title:'高宗', reign:'1735 — 1796', summary:'弘历，康乾盛世顶峰，晚年吏治腐败。', detail:{ '本名':'爱新觉罗·弘历','生卒':'1711 — 1799','主要功绩':'编《四库全书》、平定准噶尔','争议':'闭关锁国、文字狱、宠信和珅' } },
      { name:'宣统帝', title:'宣统', reign:'1908 — 1912', summary:'溥仪，中国最后一位皇帝。', detail:{ '本名':'爱新觉罗·溥仪','生卒':'1906 — 1967','主要事件':'辛亥革命后退位、伪满洲国、特赦后成为公民','著作':'《我的前半生》' } }
    ]
  };

  var MAPS = {
    '夏': { mainPath:'M 200,200 L 260,185 L 300,200 L 320,230 L 290,265 L 230,270 L 195,250 Z', region:'黄河中下游', color:'#ffd5b8', note:'核心区约在今河南西部、山西南部' },
    '商': { mainPath:'M 185,195 L 265,175 L 315,195 L 335,235 L 300,275 L 225,282 L 180,255 Z', region:'黄河中下游（扩大）', color:'#ffd5b8', note:'较夏朝范围扩大，东至海，西至陕西' },
    '西周': { mainPath:'M 130,170 L 280,140 L 360,180 L 375,235 L 340,290 L 250,305 L 160,285 L 120,230 Z', region:'黄河、长江流域', color:'#ffd5b8', note:'分封制下疆域大幅扩展' },
    '秦': { mainPath:'M 90,160 L 300,115 L 405,165 L 410,240 L 350,330 L 200,355 L 100,300 L 70,220 Z', region:'东至海、西至陇西', color:'#c9b3e8', note:'中国首个大一统帝国，北筑长城，南征百越' },
    '西汉': { mainPath:'M 60,145 L 300,100 L 415,155 L 420,235 L 360,335 L 190,360 L 80,300 L 50,200 Z M 20,180 L 60,175 L 70,215 L 30,225 Z', region:'东至海、西至西域', color:'#c9b3e8', note:'张骞通西域后，设西域都护府' },
    '东汉': { mainPath:'M 70,150 L 300,105 L 410,160 L 415,240 L 355,335 L 200,360 L 90,305 L 60,205 Z M 25,180 L 65,175 L 75,215 L 35,225 Z', region:'与西汉相当', color:'#c9b3e8', note:'班超经营西域，丝路持续繁荣' },
    '唐': { mainPath:'M 40,120 L 250,70 L 400,110 L 435,180 L 420,250 L 360,345 L 200,370 L 70,320 L 30,220 Z M 5,150 L 50,140 L 60,215 L 15,225 Z', region:'东至海、西至咸海', color:'#ffd76e', note:'极盛时疆域空前辽阔，设安西、北庭都护府' },
    '北宋': { mainPath:'M 110,160 L 320,130 L 400,175 L 400,250 L 320,310 L 175,320 L 105,260 Z', region:'中原及江南，北界接辽', color:'#a8c8ef', note:'与辽、西夏、吐蕃等并立' },
    '南宋': { mainPath:'M 130,215 L 320,200 L 400,235 L 405,290 L 340,345 L 195,350 L 125,300 Z', region:'淮河以南、江南', color:'#a8c8ef', note:'与金朝以淮河—大散关为界' },
    '元': { mainPath:'M 30,90 L 320,55 L 450,120 L 455,220 L 400,340 L 200,380 L 40,320 L 15,200 Z M 5,110 L 35,100 L 45,160 L 10,170 Z', region:'横跨欧亚', color:'#a8d4ab', note:'中国历史上疆域最辽阔的王朝之一' },
    '明': { mainPath:'M 75,145 L 300,110 L 415,160 L 425,240 L 365,340 L 190,365 L 80,305 L 55,205 Z M 8,155 L 55,145 L 65,225 L 18,235 Z', region:'东至海、西至嘉峪关', color:'#a8d4ab', note:'永乐时郑和下西洋，北修长城' },
    '清': { mainPath:'M 40,110 L 300,70 L 445,125 L 460,220 L 405,350 L 200,390 L 45,335 L 15,220 Z', region:'奠定现代中国版图', color:'#a8d4ab', note:'极盛时疆域超 1300 万平方公里' }
  };

  var MAP_LEGEND = [
    { color:'#ffd5b8', label:'先秦' },
    { color:'#c9b3e8', label:'秦汉' },
    { color:'#ffd76e', label:'隋唐' },
    { color:'#a8c8ef', label:'宋' },
    { color:'#a8d4ab', label:'元明清' }
  ];

  /* ============================================================
     工具函数
     ============================================================ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function durationOf(item) { return Math.max(0, item.end - item.start); }
  function fmtDuration(n) {
    if (n <= 0) return '—';
    if (n < 10000) return n + ' 年';
    return Math.round(n / 100) / 10 + ' 世纪';
  }
  function safeCall(fn, label) {
    try {
      if (typeof fn === 'function') fn();
    } catch (e) {
      console.error('[中国历史简表] ' + label + ' 渲染失败：', e);
    }
  }

  /* ============================================================
     一、时间轴
     ============================================================ */
  var timelineEl = document.getElementById('chTimeline');
  var searchEl   = document.getElementById('chSearch');
  var eraEl      = document.getElementById('chEra');
  var sortEl     = document.getElementById('chSort');
  var statsBarEl = document.getElementById('chStatsBar');

  var expandedSet = new Set();

  function matchesTimeline(item) {
    if (!eraEl) return true;
    if (eraEl.value && item.era !== eraEl.value) return false;
    var q = String(searchEl && searchEl.value || '').trim().toLowerCase();
    if (!q) return true;
    if (item.name.indexOf(q) >= 0) return true;
    if (item.years.indexOf(q) >= 0) return true;
    if (item.capital.indexOf(q) >= 0) return true;
    if (item.founder && item.founder.indexOf(q) >= 0) return true;
    if (item.last && item.last.indexOf(q) >= 0) return true;
    if (item.people.some(function (p) { return p.indexOf(q) >= 0; })) return true;
    if (item.events.some(function (e) { return e.indexOf(q) >= 0; })) return true;
    if (item.achievements.some(function (a) { return a.indexOf(q) >= 0; })) return true;
    return false;
  }

  function sortList(list) {
    var s = sortEl ? sortEl.value : 'time';
    if (s === 'duration') return list.slice().sort(function (a, b) { return durationOf(b) - durationOf(a); });
    if (s === 'name') {
      return list.slice().sort(function (a, b) {
        try { return a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'base' }); }
        catch (e) { return a.name.localeCompare(b.name); }
      });
    }
    return list.slice().sort(function (a, b) {
      if (a.start !== b.start) return a.start - b.start;
      return a.end - b.end;
    });
  }

  function renderStats(list) {
    if (!statsBarEl) return;
    if (!list.length) { statsBarEl.innerHTML = ''; return; }
    var total = list.length;
    var sum = 0;
    var longest = list[0], shortest = list[0];
    list.forEach(function (it) {
      var d = durationOf(it);
      sum += d;
      if (d > durationOf(longest)) longest = it;
      if (d < durationOf(shortest)) shortest = it;
    });
    var avg = Math.round(sum / total);
    statsBarEl.innerHTML =
      '<div class="ch-stat-card"><div class="ch-stat-label">当前展示</div><div class="ch-stat-value">' + total + ' 个时期</div><div class="ch-stat-sub">共收录 ' + DATA.length + ' 个</div></div>' +
      '<div class="ch-stat-card"><div class="ch-stat-label">平均存续</div><div class="ch-stat-value">' + fmtDuration(avg) + '</div><div class="ch-stat-sub">当前筛选范围内</div></div>' +
      '<div class="ch-stat-card"><div class="ch-stat-label">存续最长</div><div class="ch-stat-value">' + esc(longest.name) + '</div><div class="ch-stat-sub">' + fmtDuration(durationOf(longest)) + '</div></div>' +
      '<div class="ch-stat-card"><div class="ch-stat-label">存续最短</div><div class="ch-stat-value">' + esc(shortest.name) + '</div><div class="ch-stat-sub">' + fmtDuration(durationOf(shortest)) + '</div></div>';
  }

  function renderTimeline() {
    if (!timelineEl) return;
    var list = sortList(DATA.filter(matchesTimeline));
    renderStats(list);

    if (!list.length) {
      timelineEl.innerHTML = '<p class="ch-empty">没有匹配的朝代<br>换个关键词或调整筛选试试～</p>';
      return;
    }

    timelineEl.innerHTML = list.map(function (item) {
      var isExpanded = expandedSet.has(item.name);
      var summaryChips = '';
      if (item.capital && item.capital !== '—') {
        summaryChips += '<span class="ch-chip">都 ' + esc(item.capital.split(/[、（）(]/)[0]) + '</span>';
      }
      if (item.founder && item.founder !== '—') {
        summaryChips += '<span class="ch-chip">开国 ' + esc(item.founder) + '</span>';
      }
      if (item.people.length) {
        summaryChips += '<span class="ch-chip">' + esc(item.people.slice(0, 2).join('、')) + ' 等</span>';
      }

      return '' +
        '<div class="ch-row' + (isExpanded ? ' expanded' : '') + '" data-name="' + esc(item.name) + '">' +
          '<div class="ch-row-year">' +
            esc(item.years.split('—')[0].trim()) +
            '<span class="ch-row-end">↓</span>' +
            esc(item.years.split('—')[1] ? item.years.split('—')[1].trim() : '') +
          '</div>' +
          '<div class="ch-row-dot"></div>' +
          '<div class="ch-row-card">' +
            '<div class="ch-row-toggle"></div>' +
            '<div class="ch-row-card-head">' +
              '<h3 class="ch-row-name">' + esc(item.name) + '</h3>' +
              '<span class="ch-row-years">' + esc(item.years) + '</span>' +
              '<span class="ch-row-era">' + esc(item.era) + '</span>' +
              '<span class="ch-row-duration">' + fmtDuration(durationOf(item)) + '</span>' +
            '</div>' +
            '<div class="ch-row-summary">' + summaryChips + '</div>' +
            '<div class="ch-row-detail">' +
              '<div class="ch-detail-grid">' +
                '<div class="ch-detail-item"><b>都城</b><span>' + esc(item.capital) + '</span></div>' +
                '<div class="ch-detail-item"><b>开国君主</b><span>' + esc(item.founder) + '</span></div>' +
                '<div class="ch-detail-item"><b>末代君主</b><span>' + esc(item.last) + '</span></div>' +
                '<div class="ch-detail-item"><b>存续时长</b><span>' + fmtDuration(durationOf(item)) + '</span></div>' +
              '</div>' +
              '<div class="ch-detail-block"><div class="ch-detail-block-title">代表人物</div><div class="ch-row-summary">' +
                item.people.map(function (p) { return '<span class="ch-chip">' + esc(p) + '</span>'; }).join('') +
              '</div></div>' +
              '<div class="ch-detail-block"><div class="ch-detail-block-title">大事记</div><ul class="ch-detail-list">' +
                item.events.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') +
              '</ul></div>' +
              '<div class="ch-detail-block"><div class="ch-detail-block-title">主要成就</div><ul class="ch-detail-list">' +
                item.achievements.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') +
              '</ul></div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    timelineEl.querySelectorAll('.ch-row').forEach(function (row) {
      var card = row.querySelector('.ch-row-card');
      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        var name = row.dataset.name;
        if (expandedSet.has(name)) expandedSet.delete(name);
        else expandedSet.add(name);
        row.classList.toggle('expanded');
      });
    });
  }

  function bindTimelineEvents() {
    if (searchEl) searchEl.addEventListener('input', renderTimeline);
    if (eraEl)    eraEl.addEventListener('change', renderTimeline);
    if (sortEl)   sortEl.addEventListener('change', renderTimeline);
    var ea = document.getElementById('chExpandAll');
    var ca = document.getElementById('chCollapseAll');
    if (ea) ea.addEventListener('click', function () {
      DATA.filter(matchesTimeline).forEach(function (it) { expandedSet.add(it.name); });
      renderTimeline();
    });
    if (ca) ca.addEventListener('click', function () {
      expandedSet = new Set();
      renderTimeline();
    });
  }

  /* ============================================================
     二、朝代对比
     ============================================================ */
  var cmpAEl = document.getElementById('chCmpA');
  var cmpBEl = document.getElementById('chCmpB');
  var cmpResultEl = document.getElementById('chCmpResult');

  var CMP_OPTIONS = DATA.map(function (d) { return d.name; });

  function fillCmpSelects() {
    if (!cmpAEl || !cmpBEl) return;
    var html = CMP_OPTIONS.map(function (n) {
      return '<option value="' + esc(n) + '">' + esc(n) + '</option>';
    }).join('');
    cmpAEl.innerHTML = html;
    cmpBEl.innerHTML = html;

    /* 默认：秦 / 唐；若不存在则回退 */
    var defA = CMP_OPTIONS.indexOf('秦') >= 0 ? '秦' : CMP_OPTIONS[0];
    var defB = CMP_OPTIONS.indexOf('唐') >= 0 ? '唐' :
               (CMP_OPTIONS.indexOf('西汉') >= 0 ? '西汉' : CMP_OPTIONS[1] || CMP_OPTIONS[0]);
    if (defA) cmpAEl.value = defA;
    if (defB) cmpBEl.value = defB;
  }

  function renderCompare() {
    if (!cmpAEl || !cmpBEl || !cmpResultEl) return;
    var a = DATA.find(function (d) { return d.name === cmpAEl.value; });
    var b = DATA.find(function (d) { return d.name === cmpBEl.value; });
    if (!a || !b) {
      cmpResultEl.innerHTML = '<div class="panel" style="text-align:center;color:#8a7340;font-size:13.5px;">请选择两个朝代</div>';
      return;
    }

    var durA = durationOf(a), durB = durationOf(b);
    var maxDur = Math.max(durA, durB, 1);
    var maxAch = Math.max(a.achievements.length, b.achievements.length, 1);
    var maxPpl = Math.max(a.people.length, b.people.length, 1);

    function card(item, cls, dur) {
      return '' +
        '<div class="ch-cmp-card ' + cls + '">' +
          '<div class="ch-cmp-head">' +
            '<h3 class="ch-cmp-name">' + esc(item.name) + '</h3>' +
            '<span class="ch-cmp-years">' + esc(item.years) + '</span>' +
            '<span class="ch-cmp-era">' + esc(item.era) + '</span>' +
          '</div>' +
          '<div class="ch-cmp-rows">' +
            '<div class="ch-cmp-row"><span class="ch-cmp-row-label">都城</span><span class="ch-cmp-row-value">' + esc(item.capital) + '</span></div>' +
            '<div class="ch-cmp-row"><span class="ch-cmp-row-label">开国</span><span class="ch-cmp-row-value">' + esc(item.founder) + '</span></div>' +
            '<div class="ch-cmp-row"><span class="ch-cmp-row-label">末代</span><span class="ch-cmp-row-value">' + esc(item.last) + '</span></div>' +
            '<div class="ch-cmp-row"><span class="ch-cmp-row-label">存续</span><span class="ch-cmp-row-value">' + fmtDuration(dur) + '</span></div>' +
            '<div class="ch-cmp-row"><span class="ch-cmp-row-label">代表人物</span><span class="ch-cmp-row-value">' +
              item.people.map(function (p) { return '<span class="ch-chip">' + esc(p) + '</span>'; }).join('') +
            '</span></div>' +
            '<div class="ch-cmp-row"><span class="ch-cmp-row-label">大事记</span><span class="ch-cmp-row-value">' +
              item.events.map(function (e) { return '· ' + esc(e); }).join('<br>') +
            '</span></div>' +
            '<div class="ch-cmp-row"><span class="ch-cmp-row-label">主要成就</span><span class="ch-cmp-row-value">' +
              item.achievements.map(function (ac) { return '· ' + esc(ac); }).join('<br>') +
            '</span></div>' +
          '</div>' +
        '</div>';
    }

    var bars =
      '<div class="ch-cmp-bar-wrap">' +
        '<div class="ch-cmp-bar-title">关键指标对比</div>' +
        '<div class="ch-cmp-bar-row">' +
          '<span class="ch-cmp-bar-val a">' + fmtDuration(durA) + '</span>' +
          '<div class="ch-cmp-bar-track">' +
            '<div class="ch-cmp-bar-seg a" style="width:' + (durA / maxDur * 50) + '%;">' + esc(a.name) + '</div>' +
            '<div class="ch-cmp-bar-seg b" style="width:' + (durB / maxDur * 50) + '%;">' + esc(b.name) + '</div>' +
          '</div>' +
          '<span class="ch-cmp-bar-val b">' + fmtDuration(durB) + '</span>' +
        '</div>' +
        '<div class="ch-cmp-bar-row">' +
          '<span class="ch-cmp-bar-val a">' + a.achievements.length + ' 项</span>' +
          '<div class="ch-cmp-bar-track">' +
            '<div class="ch-cmp-bar-seg a" style="width:' + (a.achievements.length / maxAch * 50) + '%;">成就</div>' +
            '<div class="ch-cmp-bar-seg b" style="width:' + (b.achievements.length / maxAch * 50) + '%;">成就</div>' +
          '</div>' +
          '<span class="ch-cmp-bar-val b">' + b.achievements.length + ' 项</span>' +
        '</div>' +
        '<div class="ch-cmp-bar-row">' +
          '<span class="ch-cmp-bar-val a">' + a.people.length + ' 人</span>' +
          '<div class="ch-cmp-bar-track">' +
            '<div class="ch-cmp-bar-seg a" style="width:' + (a.people.length / maxPpl * 50) + '%;">人物</div>' +
            '<div class="ch-cmp-bar-seg b" style="width:' + (b.people.length / maxPpl * 50) + '%;">人物</div>' +
          '</div>' +
          '<span class="ch-cmp-bar-val b">' + b.people.length + ' 人</span>' +
        '</div>' +
      '</div>';

    cmpResultEl.innerHTML = card(a, 'a', durA) + card(b, 'b', durB) + bars;
  }

  function bindCompareEvents() {
    if (cmpAEl) cmpAEl.addEventListener('change', renderCompare);
    if (cmpBEl) cmpBEl.addEventListener('change', renderCompare);
    document.querySelectorAll('#page-chinahistory [data-ch-cmp]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parts = btn.dataset.chCmp.split(',');
        if (parts.length !== 2) return;
        var n1 = parts[0].trim(), n2 = parts[1].trim();
        if (CMP_OPTIONS.indexOf(n1) >= 0) cmpAEl.value = n1;
        if (CMP_OPTIONS.indexOf(n2) >= 0) cmpBEl.value = n2;
        renderCompare();
      });
    });
  }

  /* ============================================================
     三、历史地图
     ============================================================ */
  var mapSelectEl = document.getElementById('chMapSelect');
  var mapSvgEl    = document.getElementById('chMapSvg');
  var mapNoteEl   = document.getElementById('chMapNote');
  var mapLegendEl = document.getElementById('chMapLegend');

  function fillMapSelect() {
    if (!mapSelectEl) return;
    var keys = Object.keys(MAPS);
    mapSelectEl.innerHTML = keys.map(function (k) {
      return '<option value="' + esc(k) + '">' + esc(k) + '</option>';
    }).join('');
    mapSelectEl.value = MAPS['唐'] ? '唐' : keys[0];
  }

  function renderMap() {
    if (!mapSvgEl || !mapSelectEl) return;
    var key = mapSelectEl.value;
    var map = MAPS[key];
    if (!map) return;

    var svgNS = 'http://www.w3.org/2000/svg';
    while (mapSvgEl.firstChild) mapSvgEl.removeChild(mapSvgEl.firstChild);

    var defs = document.createElementNS(svgNS, 'defs');
    var pattern = document.createElementNS(svgNS, 'pattern');
    pattern.setAttribute('id', 'chMapGrid');
    pattern.setAttribute('width', '40');
    pattern.setAttribute('height', '40');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    var path1 = document.createElementNS(svgNS, 'path');
    path1.setAttribute('d', 'M 40 0 L 0 0 0 40');
    path1.setAttribute('fill', 'none');
    path1.setAttribute('stroke', 'rgba(245,179,1,.12)');
    path1.setAttribute('stroke-width', '1');
    pattern.appendChild(path1);
    defs.appendChild(pattern);
    mapSvgEl.appendChild(defs);

    var bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('x', '0'); bg.setAttribute('y', '0');
    bg.setAttribute('width', '480'); bg.setAttribute('height', '420');
    bg.setAttribute('fill', 'url(#chMapGrid)');
    mapSvgEl.appendChild(bg);

    var main = document.createElementNS(svgNS, 'path');
    main.setAttribute('d', map.mainPath);
    main.setAttribute('fill', map.color);
    main.setAttribute('fill-opacity', '0.75');
    main.setAttribute('stroke', '#b47c00');
    main.setAttribute('stroke-width', '2');
    main.setAttribute('stroke-linejoin', 'round');
    main.setAttribute('stroke-linecap', 'round');
    mapSvgEl.appendChild(main);

    var bbox;
    try { bbox = main.getBBox(); } catch (e) { bbox = { x: 200, y: 180, width: 80, height: 80 }; }
    var cx = bbox.x + bbox.width / 2;
    var cy = bbox.y + bbox.height / 2;

    var label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', cx);
    label.setAttribute('y', cy);
    label.setAttribute('class', 'ch-map-label');
    label.setAttribute('font-size', '28');
    label.setAttribute('font-weight', '900');
    label.setAttribute('fill', '#3a2a00');
    label.setAttribute('fill-opacity', '0.85');
    label.textContent = key;
    mapSvgEl.appendChild(label);

    var subLabel = document.createElementNS(svgNS, 'text');
    subLabel.setAttribute('x', cx);
    subLabel.setAttribute('y', cy + 20);
    subLabel.setAttribute('class', 'ch-map-label');
    subLabel.setAttribute('font-size', '11');
    subLabel.setAttribute('fill', '#8a7340');
    subLabel.textContent = map.region;
    mapSvgEl.appendChild(subLabel);

    var north = document.createElementNS(svgNS, 'text');
    north.setAttribute('x', '455');
    north.setAttribute('y', '28');
    north.setAttribute('class', 'ch-map-label dim');
    north.setAttribute('font-size', '14');
    north.textContent = 'N ↑';
    mapSvgEl.appendChild(north);

    if (mapNoteEl) mapNoteEl.textContent = map.note || '示意图，非精确比例';

    if (mapLegendEl) {
      mapLegendEl.innerHTML = MAP_LEGEND.map(function (l) {
        return '<span class="ch-map-leg">' +
          '<span class="ch-map-leg-dot" style="background:' + l.color + ';"></span>' + esc(l.label) +
        '</span>';
      }).join('');
    }
  }

  function bindMapEvents() {
    if (mapSelectEl) mapSelectEl.addEventListener('change', renderMap);
  }

  /* ============================================================
     四、历代帝王
     ============================================================ */
  var empDynastyEl = document.getElementById('chEmpDynasty');
  var empSearchEl  = document.getElementById('chEmpSearch');
  var empInfoEl    = document.getElementById('chEmpInfo');
  var empListEl    = document.getElementById('chEmpList');

  var empExpanded = new Set();

  function fillEmpSelect() {
    if (!empDynastyEl) return;
    var keys = Object.keys(EMPERORS);
    empDynastyEl.innerHTML = keys.map(function (k) {
      return '<option value="' + esc(k) + '">' + esc(k) + '</option>';
    }).join('');
    empDynastyEl.value = keys[0];
  }

  function renderEmperors() {
    if (!empDynastyEl || !empListEl || !empInfoEl) return;
    var dyn = empDynastyEl.value;
    var list = EMPERORS[dyn] || [];
    var q = String(empSearchEl && empSearchEl.value || '').trim().toLowerCase();

    var filtered = list.filter(function (e) {
      if (!q) return true;
      return (e.name + e.title + e.reign + e.summary).toLowerCase().indexOf(q) >= 0;
    });

    var dynInfo = DATA.find(function (d) { return d.name === dyn; });
    empInfoEl.innerHTML =
      '<span class="ch-emp-info-name">' + esc(dyn) + '</span>' +
      (dynInfo ? '<span class="ch-emp-info-years">' + esc(dynInfo.years) + '</span>' : '') +
      '<span class="ch-emp-info-count">共 ' + list.length + ' 位，展示 ' + filtered.length + ' 位</span>';

    if (!filtered.length) {
      empListEl.innerHTML = '<p class="ch-emp-empty">没有匹配的帝王，换个关键词试试～</p>';
      return;
    }

    empListEl.innerHTML = filtered.map(function (e) {
      var key = dyn + ':' + e.name;
      var isExpanded = empExpanded.has(key);
      var detailHtml = '';
      if (e.detail) {
        detailHtml = Object.keys(e.detail).map(function (k) {
          return '<div class="ch-emp-detail-item"><b>' + esc(k) + '</b><span>' + esc(e.detail[k]) + '</span></div>';
        }).join('');
      }
      return '' +
        '<div class="ch-emp-card' + (isExpanded ? ' expanded' : '') + '" data-emp-key="' + esc(key) + '">' +
          '<div class="ch-emp-head">' +
            '<h4 class="ch-emp-name">' + esc(e.name) + '</h4>' +
            (e.title ? '<span class="ch-emp-title">' + esc(e.title) + '</span>' : '') +
            '<span class="ch-emp-reign">' + esc(e.reign) + '</span>' +
          '</div>' +
          '<p class="ch-emp-summary">' + esc(e.summary) + '</p>' +
          (detailHtml ? '<div class="ch-emp-detail">' + detailHtml + '</div>' : '') +
        '</div>';
    }).join('');

    empListEl.querySelectorAll('.ch-emp-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var key = card.dataset.empKey;
        if (empExpanded.has(key)) empExpanded.delete(key);
        else empExpanded.add(key);
        card.classList.toggle('expanded');
      });
    });
  }

  function bindEmperorEvents() {
    if (empDynastyEl) empDynastyEl.addEventListener('change', renderEmperors);
    if (empSearchEl)  empSearchEl.addEventListener('input', renderEmperors);
  }

  /* ============================================================
     子标签切换 + 兜底渲染
     ============================================================ */
  document.querySelectorAll('#page-chinahistory .ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#page-chinahistory .ta-subtab').forEach(function (t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      var target = tab.dataset.ch;
      document.querySelectorAll('#page-chinahistory .ta-subpage').forEach(function (p) {
        p.classList.toggle('active', p.dataset.chPage === target);
      });

      /* 兜底：如果目标子页内容为空，主动渲染 */
      if (target === 'compare') {
        if (cmpAEl && !cmpAEl.options.length) {
          safeCall(fillCmpSelects, '朝代对比初始化');
          safeCall(renderCompare, '朝代对比渲染');
        } else {
          safeCall(renderCompare, '朝代对比渲染');
        }
      }
      if (target === 'map') {
        if (mapSelectEl && !mapSelectEl.options.length) {
          safeCall(fillMapSelect, '地图初始化');
        }
        setTimeout(function () { safeCall(renderMap, '地图渲染'); }, 40);
      }
      if (target === 'emperors') {
        if (empDynastyEl && !empDynastyEl.options.length) {
          safeCall(fillEmpSelect, '帝王初始化');
        }
        safeCall(renderEmperors, '帝王渲染');
      }
      if (target === 'timeline') {
        safeCall(renderTimeline, '时间轴渲染');
      }
    });
  });

  /* ============================================================
     导出 PNG（沿用时间轴逻辑）
     ============================================================ */
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function wrapText(ctx, text, maxW) {
    var out = [];
    String(text).split('\n').forEach(function (seg) {
      if (seg === '') { out.push(''); return; }
      var cur = '';
      for (var i = 0; i < seg.length; i++) {
        var ch = seg.charAt(i);
        if (cur && ctx.measureText(cur + ch).width > maxW) { out.push(cur); cur = ch; }
        else cur += ch;
      }
      out.push(cur);
    });
    return out;
  }

  function exportPng() {
    var list = sortList(DATA.filter(matchesTimeline));
    if (!list.length) { showToast('没有可导出的内容'); return; }

    var FONT = '"PingFang SC","Microsoft YaHei",sans-serif';
    var MONO = 'Consolas, Menlo, "Courier New", monospace';
    var W = 900, PAD = 48, HEAD_H = 96, CARD_PAD = 18, CARD_GAP = 12, FOOT_H = 52;

    var measure = document.createElement('canvas').getContext('2d');
    var blocks = list.map(function (item) {
      var rows = [];
      rows.push({ kind:'title', text:item.name, years:item.years, era:item.era, h:28 });
      rows.push({ kind:'meta', text:'都城：' + item.capital + '　·　开国：' + item.founder + '　·　末代：' + item.last + '　·　' + fmtDuration(durationOf(item)), h:22 });
      measure.font = '13px ' + FONT;
      wrapText(measure, '代表人物：' + item.people.join('、'), W - PAD * 2 - CARD_PAD * 2).forEach(function (l) {
        rows.push({ kind:'body', text:l, h:20 });
      });
      rows.push({ kind:'sub', text:'大事记', h:22 });
      measure.font = '12.5px ' + FONT;
      item.events.forEach(function (ev) {
        wrapText(measure, '· ' + ev, W - PAD * 2 - CARD_PAD * 2 - 16).forEach(function (l) {
          rows.push({ kind:'body2', text:l, h:19 });
        });
      });
      rows.push({ kind:'sub', text:'主要成就', h:22 });
      item.achievements.forEach(function (ac) {
        wrapText(measure, '· ' + ac, W - PAD * 2 - CARD_PAD * 2 - 16).forEach(function (l) {
          rows.push({ kind:'body2', text:l, h:19 });
        });
      });
      var cardH = CARD_PAD * 2 + rows.reduce(function (a, r) { return a + r.h; }, 0);
      return { rows:rows, cardH:cardH };
    });

    var contentH = blocks.reduce(function (a, b) { return a + b.cardH + CARD_GAP; }, 0);
    var H = PAD + HEAD_H + contentH + FOOT_H + PAD;

    var dpr = 2;
    var canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f5b301'; ctx.fillRect(0, 0, W, 5);
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';

    ctx.fillStyle = '#3a2a00'; ctx.font = '800 26px ' + FONT;
    ctx.fillText('中国历史简表', PAD, PAD + 20);

    var desc = [];
    if (eraEl && eraEl.value) desc.push('时期：' + eraEl.value);
    if (searchEl && searchEl.value.trim()) desc.push('搜索：' + searchEl.value.trim());
    desc.push('排序：' + ({ time:'按时间', duration:'按存续时长', name:'按名称' }[(sortEl && sortEl.value) || 'time'] || '按时间'));

    ctx.fillStyle = '#9c8a5a'; ctx.font = '13px ' + FONT;
    ctx.fillText('岁窦工具箱 · 共 ' + list.length + ' 个时期　·　' + desc.join('　·　'), PAD, PAD + 52);

    ctx.strokeStyle = '#f0e0b0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, PAD + HEAD_H - 8); ctx.lineTo(W - PAD, PAD + HEAD_H - 8); ctx.stroke();

    var y = PAD + HEAD_H;
    blocks.forEach(function (block) {
      var cardH = block.cardH;
      ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = '#f0e0b0';
      roundRect(ctx, PAD, y + 0.5, W - PAD * 2, cardH - 1, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f5b301';
      roundRect(ctx, PAD, y + 12, 4, cardH - 24, 2); ctx.fill();

      var ry = y + CARD_PAD;
      var textLeft = PAD + CARD_PAD + 6;
      block.rows.forEach(function (r) {
        if (r.kind === 'title') {
          ctx.fillStyle = '#b47c00'; ctx.font = '900 20px ' + FONT;
          ctx.fillText(r.text, textLeft, ry + 14);
          var nw = ctx.measureText(r.text).width;
          ctx.fillStyle = '#8a7340'; ctx.font = '700 12.5px ' + MONO;
          ctx.fillText(r.years, textLeft + nw + 12, ry + 14);
          var yw = ctx.measureText(r.years).width;
          ctx.fillStyle = '#6b7280'; ctx.font = '700 11.5px ' + FONT;
          ctx.fillText('[' + r.era + ']', textLeft + nw + 12 + yw + 10, ry + 14);
        } else if (r.kind === 'meta') {
          ctx.fillStyle = '#565d65'; ctx.font = '12.5px ' + FONT;
          ctx.fillText(r.text, textLeft, ry + 11);
        } else if (r.kind === 'sub') {
          ctx.fillStyle = '#b47c00'; ctx.font = '800 12.5px ' + FONT;
          ctx.fillText(r.text, textLeft, ry + 11);
        } else if (r.kind === 'body') {
          ctx.fillStyle = '#4b5563'; ctx.font = '13px ' + FONT;
          ctx.fillText(r.text, textLeft, ry + 10);
        } else if (r.kind === 'body2') {
          ctx.fillStyle = '#5a4a20'; ctx.font = '12.5px ' + FONT;
          ctx.fillText(r.text, textLeft + 6, ry + 9);
        }
        ry += r.h;
      });
      y += cardH + CARD_GAP;
    });

    var d = new Date();
    ctx.textAlign = 'center'; ctx.fillStyle = '#c0b48f'; ctx.font = '12px ' + FONT;
    ctx.fillText('导出时间：' + d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + '　|　岁窦工具箱 · 中国历史简表',
      W / 2, H - PAD + 6);

    var fileName = '中国历史简表_' + d.getFullYear() + pad2(d.getMonth()+1) + pad2(d.getDate()) + '_' + pad2(d.getHours()) + pad2(d.getMinutes()) + '.png';
    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (!blob) { showToast('导出失败'); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        showToast('已导出 PNG');
      }, 'image/png');
    } else {
      var a2 = document.createElement('a');
      a2.href = canvas.toDataURL('image/png'); a2.download = fileName;
      document.body.appendChild(a2); a2.click(); document.body.removeChild(a2);
      showToast('已导出 PNG');
    }
  }

  function bindExportEvent() {
    var btn = document.getElementById('chExportPng');
    if (btn) btn.addEventListener('click', exportPng);
  }

  /* ============================================================
     初始化（防御性：分步 try-catch）
     ============================================================ */
  function initOnce() {
    safeCall(renderTimeline, '时间轴');
    safeCall(fillCmpSelects, '朝代对比初始化');
    safeCall(renderCompare, '朝代对比渲染');
    safeCall(fillMapSelect, '地图初始化');
    safeCall(renderMap, '地图渲染');
    safeCall(fillEmpSelect, '帝王初始化');
    safeCall(renderEmperors, '帝王渲染');
  }

  function init() {
    if (window.__chinahistoryInited) return;
    window.__chinahistoryInited = true;

    /* 只绑定一次事件 */
    safeCall(bindTimelineEvents, '时间轴事件');
    safeCall(bindCompareEvents, '朝代对比事件');
    safeCall(bindMapEvents, '地图事件');
    safeCall(bindEmperorEvents, '帝王事件');
    safeCall(bindExportEvent, '导出事件');

    initOnce();
  }

  window.__chinahistoryInit = function () {
    if (!window.__chinahistoryInited) {
      init();
    } else {
      /* 已初始化过，只重新渲染一次，保证布局 */
      safeCall(renderTimeline, '时间轴刷新');
      safeCall(renderCompare, '朝代对比刷新');
      safeCall(renderEmperors, '帝王刷新');
      if (mapSvgEl) setTimeout(function () { safeCall(renderMap, '地图刷新'); }, 60);
    }
  };

  /* 启动：页面已是 active，或 DOM 已就绪 */
  if (page.classList.contains('active')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  /* 最后一道保险：无论何时，只要页面被显示，都尝试初始化一次 */
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function () {
      if (page.classList.contains('active')) {
        if (!window.__chinahistoryInited) init();
        else {
          /* 已初始化过，切换回来时刷新地图尺寸 */
          if (mapSvgEl && mapSvgEl.offsetParent) {
            setTimeout(function () { safeCall(renderMap, '地图尺寸刷新'); }, 60);
          }
        }
      }
    });
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  }

  console.log('[中国历史简表] 已加载');
})();