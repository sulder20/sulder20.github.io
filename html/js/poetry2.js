/* ============================================================
   古诗词默写 · 岁窦工具箱 V4.0 · 自包含版
   内置 160 首 + 在线库可选加载
   ============================================================ */
(function () {
  'use strict';

  var page = document.getElementById('page-poetryrecite');
  if (!page) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c];
    });
  }
  function safeCall(fn, label) {
    try { if (typeof fn === 'function') fn(); }
    catch (e) { console.error('[古诗词默写] ' + label + '：', e); }
  }

  /* ============================================================
     本地诗词库（160 首）
     ============================================================ */
  var LOCAL_POEMS = [
/* ---------- 先秦 ---------- */
{d:'先秦',a:'佚名',t:'关雎',l:['关关雎鸠，在河之洲。','窈窕淑女，君子好逑。','参差荇菜，左右流之。','窈窕淑女，寤寐求之。','求之不得，寤寐思服。','悠哉悠哉，辗转反侧。']},
{d:'先秦',a:'佚名',t:'蒹葭',l:['蒹葭苍苍，白露为霜。','所谓伊人，在水一方。','溯洄从之，道阻且长。','溯游从之，宛在水中央。','蒹葭萋萋，白露未晞。','所谓伊人，在水之湄。']},
{d:'先秦',a:'佚名',t:'采薇（节选）',l:['昔我往矣，杨柳依依。','今我来思，雨雪霏霏。']},
{d:'先秦',a:'佚名',t:'关雎·桃夭',l:['桃之夭夭，灼灼其华。','之子于归，宜其室家。']},
{d:'先秦',a:'屈原',t:'离骚（节选）',l:['路漫漫其修远兮，吾将上下而求索。','长太息以掩涕兮，哀民生之多艰。','亦余心之所善兮，虽九死其犹未悔。']},
{d:'先秦',a:'屈原',t:'渔父（节选）',l:['沧浪之水清兮，可以濯吾缨。','沧浪之水浊兮，可以濯吾足。']},

/* ---------- 汉魏 ---------- */
{d:'汉',a:'刘邦',t:'大风歌',l:['大风起兮云飞扬，','威加海内兮归故乡，','安得猛士兮守四方！']},
{d:'汉',a:'佚名',t:'长歌行',l:['青青园中葵，朝露待日晞。','阳春布德泽，万物生光辉。','常恐秋节至，焜黄华叶衰。','少壮不努力，老大徒伤悲。']},
{d:'汉',a:'佚名',t:'江南',l:['江南可采莲，莲叶何田田。','鱼戏莲叶间。','鱼戏莲叶东，鱼戏莲叶西，','鱼戏莲叶南，鱼戏莲叶北。']},
{d:'汉',a:'佚名',t:'迢迢牵牛星',l:['迢迢牵牛星，皎皎河汉女。','纤纤擢素手，札札弄机杼。','终日不成章，泣涕零如雨。','河汉清且浅，相去复几许？','盈盈一水间，脉脉不得语。']},
{d:'汉',a:'曹操',t:'观沧海',l:['东临碣石，以观沧海。','水何澹澹，山岛竦峙。','树木丛生，百草丰茂。','秋风萧瑟，洪波涌起。','日月之行，若出其中；','星汉灿烂，若出其里。','幸甚至哉，歌以咏志。']},
{d:'汉',a:'曹操',t:'龟虽寿',l:['神龟虽寿，犹有竟时。','螣蛇乘雾，终为土灰。','老骥伏枥，志在千里。','烈士暮年，壮心不已。']},
{d:'汉',a:'曹操',t:'短歌行',l:['对酒当歌，人生几何！','譬如朝露，去日苦多。','慨当以慷，忧思难忘。','何以解忧？唯有杜康。','山不厌高，海不厌深。','周公吐哺，天下归心。']},
{d:'魏',a:'曹植',t:'七步诗',l:['煮豆燃豆萁，豆在釜中泣。','本是同根生，相煎何太急？']},
{d:'东晋',a:'陶渊明',t:'饮酒·其五',l:['结庐在人境，而无车马喧。','问君何能尔？心远地自偏。','采菊东篱下，悠然见南山。','山气日夕佳，飞鸟相与还。','此中有真意，欲辨已忘言。']},
{d:'东晋',a:'陶渊明',t:'归园田居·其三',l:['种豆南山下，草盛豆苗稀。','晨兴理荒秽，带月荷锄归。','道狭草木长，夕露沾我衣。','衣沾不足惜，但使愿无违。']},

/* ---------- 南北朝 ---------- */
{d:'南北朝',a:'佚名',t:'敕勒歌',l:['敕勒川，阴山下。','天似穹庐，笼盖四野。','天苍苍，野茫茫，','风吹草低见牛羊。']},
{d:'南北朝',a:'佚名',t:'木兰诗（节选）',l:['唧唧复唧唧，木兰当户织。','不闻机杼声，唯闻女叹息。','万里赴戎机，关山度若飞。','朔气传金柝，寒光照铁衣。','将军百战死，壮士十年归。']},

/* ---------- 唐 ---------- */
{d:'唐',a:'骆宾王',t:'咏鹅',l:['鹅，鹅，鹅，曲项向天歌。','白毛浮绿水，红掌拨清波。']},
{d:'唐',a:'王勃',t:'送杜少府之任蜀州',l:['城阙辅三秦，风烟望五津。','与君离别意，同是宦游人。','海内存知己，天涯若比邻。','无为在歧路，儿女共沾巾。']},
{d:'唐',a:'陈子昂',t:'登幽州台歌',l:['前不见古人，后不见来者。','念天地之悠悠，独怆然而涕下。']},
{d:'唐',a:'贺知章',t:'咏柳',l:['碧玉妆成一树高，万条垂下绿丝绦。','不知细叶谁裁出，二月春风似剪刀。']},
{d:'唐',a:'贺知章',t:'回乡偶书',l:['少小离家老大回，乡音无改鬓毛衰。','儿童相见不相识，笑问客从何处来。']},
{d:'唐',a:'王之涣',t:'登鹳雀楼',l:['白日依山尽，黄河入海流。','欲穷千里目，更上一层楼。']},
{d:'唐',a:'王之涣',t:'凉州词',l:['黄河远上白云间，一片孤城万仞山。','羌笛何须怨杨柳，春风不度玉门关。']},
{d:'唐',a:'孟浩然',t:'春晓',l:['春眠不觉晓，处处闻啼鸟。','夜来风雨声，花落知多少。']},
{d:'唐',a:'孟浩然',t:'过故人庄',l:['故人具鸡黍，邀我至田家。','绿树村边合，青山郭外斜。','开轩面场圃，把酒话桑麻。','待到重阳日，还来就菊花。']},
{d:'唐',a:'王翰',t:'凉州词',l:['葡萄美酒夜光杯，欲饮琵琶马上催。','醉卧沙场君莫笑，古来征战几人回。']},
{d:'唐',a:'王昌龄',t:'出塞',l:['秦时明月汉时关，万里长征人未还。','但使龙城飞将在，不教胡马度阴山。']},
{d:'唐',a:'王昌龄',t:'芙蓉楼送辛渐',l:['寒雨连江夜入吴，平明送客楚山孤。','洛阳亲友如相问，一片冰心在玉壶。']},
{d:'唐',a:'王维',t:'山居秋暝',l:['空山新雨后，天气晚来秋。','明月松间照，清泉石上流。','竹喧归浣女，莲动下渔舟。','随意春芳歇，王孙自可留。']},
{d:'唐',a:'王维',t:'使至塞上',l:['单车欲问边，属国过居延。','征蓬出汉塞，归雁入胡天。','大漠孤烟直，长河落日圆。','萧关逢候骑，都护在燕然。']},
{d:'唐',a:'王维',t:'送元二使安西',l:['渭城朝雨浥轻尘，客舍青青柳色新。','劝君更尽一杯酒，西出阳关无故人。']},
{d:'唐',a:'王维',t:'相思',l:['红豆生南国，春来发几枝。','愿君多采撷，此物最相思。']},
{d:'唐',a:'王维',t:'鹿柴',l:['空山不见人，但闻人语响。','返景入深林，复照青苔上。']},
{d:'唐',a:'李白',t:'静夜思',l:['床前明月光，疑是地上霜。','举头望明月，低头思故乡。']},
{d:'唐',a:'李白',t:'古朗月行',l:['小时不识月，呼作白玉盘。','又疑瑶台镜，飞在青云端。']},
{d:'唐',a:'李白',t:'望庐山瀑布',l:['日照香炉生紫烟，遥看瀑布挂前川。','飞流直下三千尺，疑是银河落九天。']},
{d:'唐',a:'李白',t:'赠汪伦',l:['李白乘舟将欲行，忽闻岸上踏歌声。','桃花潭水深千尺，不及汪伦送我情。']},
{d:'唐',a:'李白',t:'黄鹤楼送孟浩然之广陵',l:['故人西辞黄鹤楼，烟花三月下扬州。','孤帆远影碧空尽，唯见长江天际流。']},
{d:'唐',a:'李白',t:'早发白帝城',l:['朝辞白帝彩云间，千里江陵一日还。','两岸猿声啼不住，轻舟已过万重山。']},
{d:'唐',a:'李白',t:'望天门山',l:['天门中断楚江开，碧水东流至此回。','两岸青山相对出，孤帆一片日边来。']},
{d:'唐',a:'李白',t:'独坐敬亭山',l:['众鸟高飞尽，孤云独去闲。','相看两不厌，只有敬亭山。']},
{d:'唐',a:'李白',t:'将进酒',l:['君不见黄河之水天上来，奔流到海不复回。','君不见高堂明镜悲白发，朝如青丝暮成雪。','人生得意须尽欢，莫使金樽空对月。','天生我材必有用，千金散尽还复来。','古来圣贤皆寂寞，惟有饮者留其名。','五花马，千金裘，呼儿将出换美酒，与尔同销万古愁。']},
{d:'唐',a:'李白',t:'行路难',l:['金樽清酒斗十千，玉盘珍羞直万钱。','停杯投箸不能食，拔剑四顾心茫然。','欲渡黄河冰塞川，将登太行雪满山。','长风破浪会有时，直挂云帆济沧海。']},
{d:'唐',a:'李白',t:'月下独酌',l:['花间一壶酒，独酌无相亲。','举杯邀明月，对影成三人。','月既不解饮，影徒随我身。','永结无情游，相期邈云汉。']},
{d:'唐',a:'高适',t:'别董大',l:['千里黄云白日曛，北风吹雁雪纷纷。','莫愁前路无知己，天下谁人不识君。']},
{d:'唐',a:'杜甫',t:'绝句',l:['两个黄鹂鸣翠柳，一行白鹭上青天。','窗含西岭千秋雪，门泊东吴万里船。']},
{d:'唐',a:'杜甫',t:'春夜喜雨',l:['好雨知时节，当春乃发生。','随风潜入夜，润物细无声。','野径云俱黑，江船火独明。','晓看红湿处，花重锦官城。']},
{d:'唐',a:'杜甫',t:'春望',l:['国破山河在，城春草木深。','感时花溅泪，恨别鸟惊心。','烽火连三月，家书抵万金。','白头搔更短，浑欲不胜簪。']},
{d:'唐',a:'杜甫',t:'望岳',l:['岱宗夫如何？齐鲁青未了。','造化钟神秀，阴阳割昏晓。','荡胸生曾云，决眦入归鸟。','会当凌绝顶，一览众山小。']},
{d:'唐',a:'杜甫',t:'登高',l:['风急天高猿啸哀，渚清沙白鸟飞回。','无边落木萧萧下，不尽长江滚滚来。','万里悲秋常作客，百年多病独登台。','艰难苦恨繁霜鬓，潦倒新停浊酒杯。']},
{d:'唐',a:'杜甫',t:'江南逢李龟年',l:['岐王宅里寻常见，崔九堂前几度闻。','正是江南好风景，落花时节又逢君。']},
{d:'唐',a:'杜甫',t:'闻官军收河南河北',l:['剑外忽传收蓟北，初闻涕泪满衣裳。','却看妻子愁何在，漫卷诗书喜欲狂。','白日放歌须纵酒，青春作伴好还乡。','即从巴峡穿巫峡，便下襄阳向洛阳。']},
{d:'唐',a:'杜甫',t:'茅屋为秋风所破歌',l:['八月秋高风怒号，卷我屋上三重茅。','安得广厦千万间，大庇天下寒士俱欢颜！','风雨不动安如山。','呜呼！何时眼前突兀见此屋，吾庐独破受冻死亦足！']},
{d:'唐',a:'岑参',t:'白雪歌送武判官归京',l:['北风卷地白草折，胡天八月即飞雪。','忽如一夜春风来，千树万树梨花开。','散入珠帘湿罗幕，狐裘不暖锦衾薄。','山回路转不见君，雪上空留马行处。']},
{d:'唐',a:'张继',t:'枫桥夜泊',l:['月落乌啼霜满天，江枫渔火对愁眠。','姑苏城外寒山寺，夜半钟声到客船。']},
{d:'唐',a:'韦应物',t:'滁州西涧',l:['独怜幽草涧边生，上有黄鹂深树鸣。','春潮带雨晚来急，野渡无人舟自横。']},
{d:'唐',a:'刘禹锡',t:'望洞庭',l:['湖光秋月两相和，潭面无风镜未磨。','遥望洞庭山水翠，白银盘里一青螺。']},
{d:'唐',a:'刘禹锡',t:'竹枝词',l:['杨柳青青江水平，闻郎江上唱歌声。','东边日出西边雨，道是无晴却有晴。']},
{d:'唐',a:'刘禹锡',t:'乌衣巷',l:['朱雀桥边野草花，乌衣巷口夕阳斜。','旧时王谢堂前燕，飞入寻常百姓家。']},
{d:'唐',a:'刘禹锡',t:'陋室铭',l:['山不在高，有仙则名。','水不在深，有龙则灵。','斯是陋室，惟吾德馨。','苔痕上阶绿，草色入帘青。','谈笑有鸿儒，往来无白丁。','无丝竹之乱耳，无案牍之劳形。','孔子云：何陋之有？']},
{d:'唐',a:'白居易',t:'赋得古原草送别',l:['离离原上草，一岁一枯荣。','野火烧不尽，春风吹又生。','远芳侵古道，晴翠接荒城。','又送王孙去，萋萋满别情。']},
{d:'唐',a:'白居易',t:'钱塘湖春行',l:['孤山寺北贾亭西，水面初平云脚低。','几处早莺争暖树，谁家新燕啄春泥。','乱花渐欲迷人眼，浅草才能没马蹄。','最爱湖东行不足，绿杨阴里白沙堤。']},
{d:'唐',a:'白居易',t:'忆江南',l:['江南好，风景旧曾谙。','日出江花红胜火，春来江水绿如蓝。','能不忆江南？']},
{d:'唐',a:'白居易',t:'大林寺桃花',l:['人间四月芳菲尽，山寺桃花始盛开。','长恨春归无觅处，不知转入此中来。']},
{d:'唐',a:'李绅',t:'悯农（其一）',l:['春种一粒粟，秋收万颗子。','四海无闲田，农夫犹饿死。']},
{d:'唐',a:'李绅',t:'悯农（其二）',l:['锄禾日当午，汗滴禾下土。','谁知盘中餐，粒粒皆辛苦。']},
{d:'唐',a:'柳宗元',t:'江雪',l:['千山鸟飞绝，万径人踪灭。','孤舟蓑笠翁，独钓寒江雪。']},
{d:'唐',a:'贾岛',t:'寻隐者不遇',l:['松下问童子，言师采药去。','只在此山中，云深不知处。']},
{d:'唐',a:'杜牧',t:'山行',l:['远上寒山石径斜，白云生处有人家。','停车坐爱枫林晚，霜叶红于二月花。']},
{d:'唐',a:'杜牧',t:'清明',l:['清明时节雨纷纷，路上行人欲断魂。','借问酒家何处有，牧童遥指杏花村。']},
{d:'唐',a:'杜牧',t:'江南春',l:['千里莺啼绿映红，水村山郭酒旗风。','南朝四百八十寺，多少楼台烟雨中。']},
{d:'唐',a:'杜牧',t:'泊秦淮',l:['烟笼寒水月笼沙，夜泊秦淮近酒家。','商女不知亡国恨，隔江犹唱后庭花。']},
{d:'唐',a:'杜牧',t:'秋夕',l:['银烛秋光冷画屏，轻罗小扇扑流萤。','天阶夜色凉如水，卧看牵牛织女星。']},
{d:'唐',a:'李商隐',t:'无题',l:['相见时难别亦难，东风无力百花残。','春蚕到死丝方尽，蜡炬成灰泪始干。','晓镜但愁云鬓改，夜吟应觉月光寒。','蓬山此去无多路，青鸟殷勤为探看。']},
{d:'唐',a:'李商隐',t:'夜雨寄北',l:['君问归期未有期，巴山夜雨涨秋池。','何当共剪西窗烛，却话巴山夜雨时。']},
{d:'唐',a:'李商隐',t:'锦瑟',l:['锦瑟无端五十弦，一弦一柱思华年。','庄生晓梦迷蝴蝶，望帝春心托杜鹃。','沧海月明珠有泪，蓝田日暖玉生烟。','此情可待成追忆，只是当时已惘然。']},
{d:'唐',a:'李商隐',t:'登乐游原',l:['向晚意不适，驱车登古原。','夕阳无限好，只是近黄昏。']},
{d:'唐',a:'温庭筠',t:'商山早行',l:['晨起动征铎，客行悲故乡。','鸡声茅店月，人迹板桥霜。','槲叶落山路，枳花明驿墙。','因思杜陵梦，凫雁满回塘。']},
{d:'唐',a:'李贺',t:'马诗',l:['大漠沙如雪，燕山月似钩。','何当金络脑，快走踏清秋。']},
{d:'唐',a:'王湾',t:'次北固山下',l:['客路青山外，行舟绿水前。','潮平两岸阔，风正一帆悬。','海日生残夜，江春入旧年。','乡书何处达？归雁洛阳边。']},
{d:'唐',a:'崔颢',t:'黄鹤楼',l:['昔人已乘黄鹤去，此地空余黄鹤楼。','黄鹤一去不复返，白云千载空悠悠。','晴川历历汉阳树，芳草萋萋鹦鹉洲。','日暮乡关何处是？烟波江上使人愁。']},
{d:'唐',a:'张若虚',t:'春江花月夜（节选）',l:['春江潮水连海平，海上明月共潮生。','滟滟随波千万里，何处春江无月明！','江畔何人初见月？江月何年初照人？','人生代代无穷已，江月年年望相似。']},
{d:'唐',a:'孟郊',t:'游子吟',l:['慈母手中线，游子身上衣。','临行密密缝，意恐迟迟归。','谁言寸草心，报得三春晖。']},
{d:'唐',a:'颜真卿',t:'劝学',l:['三更灯火五更鸡，正是男儿读书时。','黑发不知勤学早，白首方悔读书迟。']},
{d:'唐',a:'杜秋娘',t:'金缕衣',l:['劝君莫惜金缕衣，劝君惜取少年时。','花开堪折直须折，莫待无花空折枝。']},
{d:'唐',a:'王建',t:'十五夜望月',l:['中庭地白树栖鸦，冷露无声湿桂花。','今夜月明人尽望，不知秋思落谁家。']},
{d:'唐',a:'韩愈',t:'早春呈水部张十八员外',l:['天街小雨润如酥，草色遥看近却无。','最是一年春好处，绝胜烟柳满皇都。']},

/* ---------- 宋 ---------- */
{d:'宋',a:'范仲淹',t:'渔家傲·秋思',l:['塞下秋来风景异，衡阳雁去无留意。','四面边声连角起，千嶂里，长烟落日孤城闭。','浊酒一杯家万里，燕然未勒归无计。','羌管悠悠霜满地，人不寐，将军白发征夫泪。']},
{d:'宋',a:'范仲淹',t:'岳阳楼记（节选）',l:['不以物喜，不以己悲。','居庙堂之高则忧其民，处江湖之远则忧其君。','先天下之忧而忧，后天下之乐而乐。']},
{d:'宋',a:'晏殊',t:'浣溪沙',l:['一曲新词酒一杯，去年天气旧亭台。','夕阳西下几时回？','无可奈何花落去，似曾相识燕归来。','小园香径独徘徊。']},
{d:'宋',a:'柳永',t:'雨霖铃（节选）',l:['多情自古伤离别，更那堪冷落清秋节！','今宵酒醒何处？杨柳岸，晓风残月。']},
{d:'宋',a:'欧阳修',t:'醉翁亭记（节选）',l:['醉翁之意不在酒，在乎山水之间也。','山水之乐，得之心而寓之酒也。']},
{d:'宋',a:'王安石',t:'登飞来峰',l:['飞来山上千寻塔，闻说鸡鸣见日升。','不畏浮云遮望眼，自缘身在最高层。']},
{d:'宋',a:'王安石',t:'泊船瓜洲',l:['京口瓜洲一水间，钟山只隔数重山。','春风又绿江南岸，明月何时照我还？']},
{d:'宋',a:'王安石',t:'元日',l:['爆竹声中一岁除，春风送暖入屠苏。','千门万户曈曈日，总把新桃换旧符。']},
{d:'宋',a:'苏轼',t:'水调歌头',l:['明月几时有？把酒问青天。','不知天上宫阙，今夕是何年。','我欲乘风归去，又恐琼楼玉宇，高处不胜寒。','起舞弄清影，何似在人间。','转朱阁，低绮户，照无眠。','不应有恨，何事长向别时圆？','人有悲欢离合，月有阴晴圆缺，此事古难全。','但愿人长久，千里共婵娟。']},
{d:'宋',a:'苏轼',t:'念奴娇·赤壁怀古',l:['大江东去，浪淘尽，千古风流人物。','故垒西边，人道是，三国周郎赤壁。','乱石穿空，惊涛拍岸，卷起千堆雪。','江山如画，一时多少豪杰。','遥想公瑾当年，小乔初嫁了，雄姿英发。','故国神游，多情应笑我，早生华发。','人生如梦，一尊还酹江月。']},
{d:'宋',a:'苏轼',t:'题西林壁',l:['横看成岭侧成峰，远近高低各不同。','不识庐山真面目，只缘身在此山中。']},
{d:'宋',a:'苏轼',t:'饮湖上初晴后雨',l:['水光潋滟晴方好，山色空蒙雨亦奇。','欲把西湖比西子，淡妆浓抹总相宜。']},
{d:'宋',a:'苏轼',t:'江城子·密州出猎',l:['老夫聊发少年狂，左牵黄，右擎苍。','锦帽貂裘，千骑卷平冈。','会挽雕弓如满月，西北望，射天狼。']},
{d:'宋',a:'苏轼',t:'定风波',l:['莫听穿林打叶声，何妨吟啸且徐行。','竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。','料峭春风吹酒醒，微冷，山头斜照却相迎。','回首向来萧瑟处，归去，也无风雨也无晴。']},
{d:'宋',a:'苏轼',t:'惠崇春江晚景',l:['竹外桃花三两枝，春江水暖鸭先知。','蒌蒿满地芦芽短，正是河豚欲上时。']},
{d:'宋',a:'李清照',t:'夏日绝句',l:['生当作人杰，死亦为鬼雄。','至今思项羽，不肯过江东。']},
{d:'宋',a:'李清照',t:'如梦令',l:['常记溪亭日暮，沉醉不知归路。','兴尽晚回舟，误入藕花深处。','争渡，争渡，惊起一滩鸥鹭。']},
{d:'宋',a:'李清照',t:'如梦令·昨夜雨疏风骤',l:['昨夜雨疏风骤，浓睡不消残酒。','试问卷帘人，却道海棠依旧。','知否，知否？应是绿肥红瘦。']},
{d:'宋',a:'李清照',t:'醉花阴',l:['薄雾浓云愁永昼，瑞脑销金兽。','佳节又重阳，玉枕纱厨，半夜凉初透。','东篱把酒黄昏后，有暗香盈袖。','莫道不消魂，帘卷西风，人比黄花瘦。']},
{d:'宋',a:'李清照',t:'一剪梅',l:['红藕香残玉簟秋，轻解罗裳，独上兰舟。','云中谁寄锦书来？雁字回时，月满西楼。','花自飘零水自流，一种相思，两处闲愁。','此情无计可消除，才下眉头，却上心头。']},
{d:'宋',a:'陆游',t:'示儿',l:['死去元知万事空，但悲不见九州同。','王师北定中原日，家祭无忘告乃翁。']},
{d:'宋',a:'陆游',t:'游山西村',l:['莫笑农家腊酒浑，丰年留客足鸡豚。','山重水复疑无路，柳暗花明又一村。','箫鼓追随春社近，衣冠简朴古风存。','从今若许闲乘月，拄杖无时夜叩门。']},
{d:'宋',a:'陆游',t:'十一月四日风雨大作',l:['僵卧孤村不自哀，尚思为国戍轮台。','夜阑卧听风吹雨，铁马冰河入梦来。']},
{d:'宋',a:'陆游',t:'冬夜读书示子聿',l:['古人学问无遗力，少壮工夫老始成。','纸上得来终觉浅，绝知此事要躬行。']},
{d:'宋',a:'辛弃疾',t:'破阵子',l:['醉里挑灯看剑，梦回吹角连营。','八百里分麾下炙，五十弦翻塞外声。','沙场秋点兵。','马作的卢飞快，弓如霹雳弦惊。','了却君王天下事，赢得生前身后名。','可怜白发生！']},
{d:'宋',a:'辛弃疾',t:'青玉案·元夕',l:['东风夜放花千树，更吹落、星如雨。','宝马雕车香满路，凤箫声动，玉壶光转，一夜鱼龙舞。','蛾儿雪柳黄金缕，笑语盈盈暗香去。','众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。']},
{d:'宋',a:'辛弃疾',t:'西江月·夜行黄沙道中',l:['明月别枝惊鹊，清风半夜鸣蝉。','稻花香里说丰年，听取蛙声一片。','七八个星天外，两三点雨山前。','旧时茅店社林边，路转溪桥忽见。']},
{d:'宋',a:'辛弃疾',t:'丑奴儿·书博山道中壁',l:['少年不识愁滋味，爱上层楼。','爱上层楼，为赋新词强说愁。','而今识尽愁滋味，欲说还休。','欲说还休，却道天凉好个秋。']},
{d:'宋',a:'岳飞',t:'满江红',l:['怒发冲冠，凭栏处、潇潇雨歇。','抬望眼，仰天长啸，壮怀激烈。','三十功名尘与土，八千里路云和月。','莫等闲，白了少年头，空悲切！','靖康耻，犹未雪；臣子恨，何时灭！','驾长车，踏破贺兰山缺。','待从头、收拾旧山河，朝天阙。']},
{d:'宋',a:'文天祥',t:'过零丁洋',l:['辛苦遭逢起一经，干戈寥落四周星。','山河破碎风飘絮，身世浮沉雨打萍。','惶恐滩头说惶恐，零丁洋里叹零丁。','人生自古谁无死？留取丹心照汗青。']},
{d:'宋',a:'朱熹',t:'观书有感',l:['半亩方塘一鉴开，天光云影共徘徊。','问渠那得清如许？为有源头活水来。']},
{d:'宋',a:'朱熹',t:'春日',l:['胜日寻芳泗水滨，无边光景一时新。','等闲识得东风面，万紫千红总是春。']},
{d:'宋',a:'叶绍翁',t:'游园不值',l:['应怜屐齿印苍苔，小扣柴扉久不开。','春色满园关不住，一枝红杏出墙来。']},
{d:'宋',a:'杨万里',t:'晓出净慈寺送林子方',l:['毕竟西湖六月中，风光不与四时同。','接天莲叶无穷碧，映日荷花别样红。']},
{d:'宋',a:'杨万里',t:'小池',l:['泉眼无声惜细流，树阴照水爱晴柔。','小荷才露尖尖角，早有蜻蜓立上头。']},
{d:'宋',a:'林升',t:'题临安邸',l:['山外青山楼外楼，西湖歌舞几时休？','暖风熏得游人醉，直把杭州作汴州。']},
{d:'宋',a:'范成大',t:'四时田园杂兴',l:['昼出耘田夜绩麻，村庄儿女各当家。','童孙未解供耕织，也傍桑阴学种瓜。']},
{d:'宋',a:'秦观',t:'鹊桥仙',l:['纤云弄巧，飞星传恨，银汉迢迢暗度。','金风玉露一相逢，便胜却人间无数。','柔情似水，佳期如梦，忍顾鹊桥归路。','两情若是久长时，又岂在朝朝暮暮。']},
{d:'宋',a:'周敦颐',t:'爱莲说',l:['予独爱莲之出淤泥而不染，濯清涟而不妖。','中通外直，不蔓不枝，香远益清，亭亭净植。','可远观而不可亵玩焉。']},
{d:'宋',a:'卢梅坡',t:'雪梅',l:['梅雪争春未肯降，骚人阁笔费评章。','梅须逊雪三分白，雪却输梅一段香。']},
{d:'宋',a:'王安石',t:'梅花',l:['墙角数枝梅，凌寒独自开。','遥知不是雪，为有暗香来。']},
{d:'宋',a:'苏轼',t:'六月二十七日望湖楼醉书',l:['黑云翻墨未遮山，白雨跳珠乱入船。','卷地风来忽吹散，望湖楼下水如天。']},

/* ---------- 元明清 ---------- */
{d:'元',a:'马致远',t:'天净沙·秋思',l:['枯藤老树昏鸦，小桥流水人家，古道西风瘦马。','夕阳西下，断肠人在天涯。']},
{d:'元',a:'王冕',t:'墨梅',l:['我家洗砚池头树，朵朵花开淡墨痕。','不要人夸好颜色，只留清气满乾坤。']},
{d:'明',a:'于谦',t:'石灰吟',l:['千锤万凿出深山，烈火焚烧若等闲。','粉骨碎身浑不怕，要留清白在人间。']},
{d:'明',a:'唐寅',t:'桃花庵歌（节选）',l:['别人笑我太疯癫，我笑他人看不穿。','不见五陵豪杰墓，无花无酒锄作田。']},
{d:'清',a:'郑燮',t:'竹石',l:['咬定青山不放松，立根原在破岩中。','千磨万击还坚劲，任尔东西南北风。']},
{d:'清',a:'龚自珍',t:'己亥杂诗（其五）',l:['浩荡离愁白日斜，吟鞭东指即天涯。','落红不是无情物，化作春泥更护花。']},
{d:'清',a:'龚自珍',t:'己亥杂诗（其一二五）',l:['九州生气恃风雷，万马齐喑究可哀。','我劝天公重抖擞，不拘一格降人才。']},
{d:'清',a:'林则徐',t:'赴戍登程口占示家人',l:['力微任重久神疲，再竭衰庸定不支。','苟利国家生死以，岂因祸福避趋之。']},
{d:'清',a:'纳兰性德',t:'长相思',l:['山一程，水一程，身向榆关那畔行，夜深千帐灯。','风一更，雪一更，聒碎乡心梦不成，故园无此声。']},
{d:'清',a:'袁枚',t:'苔',l:['白日不到处，青春恰自来。','苔花如米小，也学牡丹开。']},
{d:'清',a:'高鼎',t:'村居',l:['草长莺飞二月天，拂堤杨柳醉春烟。','儿童散学归来早，忙趁东风放纸鸢。']},
{d:'清',a:'王士祯',t:'题秋江独钓图',l:['一蓑一笠一扁舟，一丈丝纶一寸钩。','一曲高歌一樽酒，一人独钓一江秋。']},

/* ---------- 近代 ---------- */
{d:'近代',a:'毛泽东',t:'沁园春·雪',l:['北国风光，千里冰封，万里雪飘。','望长城内外，惟余莽莽；大河上下，顿失滔滔。','山舞银蛇，原驰蜡象，欲与天公试比高。','须晴日，看红装素裹，分外妖娆。','江山如此多娇，引无数英雄竞折腰。','惜秦皇汉武，略输文采；唐宗宋祖，稍逊风骚。','一代天骄，成吉思汗，只识弯弓射大雕。','俱往矣，数风流人物，还看今朝。']},
{d:'近代',a:'毛泽东',t:'七律·长征',l:['红军不怕远征难，万水千山只等闲。','五岭逶迤腾细浪，乌蒙磅礴走泥丸。','金沙水拍云崖暖，大渡桥横铁索寒。','更喜岷山千里雪，三军过后尽开颜。']}
  ];

  /* ---------- 关键：把简写字段（d/a/t/l）转成完整字段（dynasty/author/title/lines） ---------- */
  LOCAL_POEMS = LOCAL_POEMS.map(function (p) {
    return {
      dynasty: p.d || '',
      author:  p.a || '佚名',
      title:   p.t || '无题',
      lines:   Array.isArray(p.l) ? p.l : [String(p.l || '')]
    };
  });

  /* ============================================================
     在线库
     ============================================================ */
  var ONLINE_CACHE_KEY = 'suidou-poetry-online-v1';
  var ONLINE_MAX_DISPLAY = 100;

  var CDN_MIRRORS = [
    'https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/',
    'https://fastly.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/',
    'https://gcore.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/',
    'https://cdn.statically.io/gh/chinese-poetry/chinese-poetry/master/',
    'https://rawcdn.githack.com/chinese-poetry/chinese-poetry/master/',
    'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/'
  ];

  var ONLINE_SOURCES = [
    {
      name: '唐诗三百首',
      path: 'json/%E5%94%90%E8%AF%97/%E5%94%90%E8%AF%97%E4%B8%89%E7%99%BE%E9%A6%96.json',
      parse: function (data) {
        if (!Array.isArray(data)) return [];
        return data.map(function (item) {
          var lines = [];
          if (Array.isArray(item.paragraphs)) lines = item.paragraphs.slice();
          else if (item.content) lines = [item.content];
          return { dynasty: '唐', author: item.author || '佚名', title: item.title || item.rhythmic || '无题', lines: lines };
        }).filter(function (p) { return p.title && p.lines.length; });
      }
    },
    {
      name: '宋词三百首',
      path: 'json/%E5%AE%8B%E8%AF%8D/%E5%AE%8B%E8%AF%8D%E4%B8%89%E7%99%BE%E9%A6%96.json',
      parse: function (data) {
        if (!Array.isArray(data)) return [];
        return data.map(function (item) {
          var lines = [];
          if (Array.isArray(item.paragraphs)) lines = item.paragraphs.slice();
          else if (item.content) lines = [item.content];
          return { dynasty: '宋', author: item.author || '佚名', title: (item.rhythmic || '') + (item.title ? '·' + item.title : '') || '无题', lines: lines };
        }).filter(function (p) { return p.title && p.lines.length; });
      }
    },
    {
      name: '诗经',
      path: 'json/%E8%AF%97%E7%BB%8F/shijing.json',
      parse: function (data) {
        if (!Array.isArray(data)) return [];
        return data.map(function (item) {
          var lines = [];
          if (Array.isArray(item.content)) lines = item.content.slice();
          else if (item.content) lines = [item.content];
          return { dynasty: '先秦', author: (item.section || '') + (item.chapter ? '·' + item.chapter : '') || '佚名', title: item.title || '无题', lines: lines };
        }).filter(function (p) { return p.title && p.lines.length; });
      }
    }
  ];

  var POEMS = LOCAL_POEMS.slice();
  var onlineData = null;

  /* ---------- 从 CDN 拉取 ---------- */
  function fetchFromCdn(mirrorIndex, path) {
    if (mirrorIndex >= CDN_MIRRORS.length) return Promise.reject(new Error('所有镜像都失败'));
    var url = CDN_MIRRORS[mirrorIndex] + path;
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).catch(function (err) {
      console.warn('[古诗词] 镜像 ' + mirrorIndex + ' 失败：' + url + ' → ' + (err.message || err));
      return fetchFromCdn(mirrorIndex + 1, path);
    });
  }

  function loadOnlineLibrary() {
    var loadBtn = document.getElementById('ptOnlineLoad');
    var clearBtn = document.getElementById('ptOnlineClear');
    var descEl = document.getElementById('ptOnlineDesc');

    if (window.location.protocol === 'file:') {
      descEl.className = 'pt-online-desc err';
      descEl.innerHTML = '当前以 <b>file://</b> 方式打开，浏览器禁止联网加载。本地 ' + LOCAL_POEMS.length + ' 首仍可用。';
      return;
    }

    loadBtn.disabled = true;
    loadBtn.textContent = '加载中…';
    descEl.className = 'pt-online-desc loading';

    var done = 0;
    var collected = [];
    var failedSources = [];

    function updateProgress() {
      descEl.textContent = '正在加载：' + done + ' / ' + ONLINE_SOURCES.length + ' 个源';
    }
    updateProgress();

    var tasks = ONLINE_SOURCES.map(function (src) {
      return fetchFromCdn(0, src.path).then(function (data) {
        var parsed = src.parse(data);
        collected = collected.concat(parsed);
        console.log('[古诗词] ' + src.name + ' 成功加载 ' + parsed.length + ' 首');
        return { name: src.name, count: parsed.length };
      }).catch(function (err) {
        console.warn('[古诗词] ' + src.name + ' 加载失败：', err);
        failedSources.push(src.name);
        return { name: src.name, count: 0 };
      }).then(function (r) { done++; updateProgress(); return r; });
    });

    Promise.all(tasks).then(function () {
      if (!collected.length) {
        descEl.className = 'pt-online-desc err';
        descEl.innerHTML = '在线库加载失败，本地 ' + LOCAL_POEMS.length + ' 首仍可使用。';
        loadBtn.disabled = false;
        loadBtn.textContent = '重试加载';
        return;
      }

      var seen = {};
      var merged = [];
      collected.forEach(function (p) {
        var key = p.dynasty + '|' + p.author + '|' + p.title;
        if (seen[key]) return;
        seen[key] = true;
        merged.push(p);
      });

      var ok = saveCache(merged);
      applyOnlineLibrary(merged);

      var msg = '已加载在线诗词 ' + merged.length + ' 首';
      if (!ok) msg += '（本地缓存失败）';
      if (failedSources.length) msg += '（' + failedSources.join('、') + ' 失败）';
      descEl.textContent = msg;
      descEl.className = 'pt-online-desc ok';

      loadBtn.style.display = 'none';
      clearBtn.style.display = '';

      if (typeof showToast === 'function') showToast('已加载 ' + merged.length + ' 首在线诗词');
    }).catch(function (err) {
      descEl.textContent = '在线库加载失败：' + (err.message || err);
      descEl.className = 'pt-online-desc err';
      loadBtn.disabled = false;
      loadBtn.textContent = '重试加载';
    });
  }

  function saveCache(arr) {
    try { localStorage.setItem(ONLINE_CACHE_KEY, JSON.stringify(arr)); return true; }
    catch (e) { console.warn('[古诗词] 缓存失败：', e); return false; }
  }
  function readCache() {
    try {
      var raw = localStorage.getItem(ONLINE_CACHE_KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch (e) { return null; }
  }
  function clearCache() {
    try { localStorage.removeItem(ONLINE_CACHE_KEY); } catch (e) {}
  }
  function applyOnlineLibrary(arr) {
    onlineData = arr;
    POEMS = LOCAL_POEMS.slice().concat(arr);
    fillEraSelects();
    renderLibrary();
  }
  function clearOnlineLibrary() {
    if (!confirm('确定清除已加载的在线诗词库吗？')) return;
    clearCache();
    onlineData = null;
    POEMS = LOCAL_POEMS.slice();

    var descEl = document.getElementById('ptOnlineDesc');
    var loadBtn = document.getElementById('ptOnlineLoad');
    var clearBtn = document.getElementById('ptOnlineClear');
    descEl.textContent = '本地收录 ' + LOCAL_POEMS.length + ' 首。可加载唐诗三百首、宋词三百首、诗经。';
    descEl.className = 'pt-online-desc';
    loadBtn.style.display = '';
    loadBtn.disabled = false;
    loadBtn.textContent = '加载在线诗词库';
    clearBtn.style.display = 'none';

    fillEraSelects();
    renderLibrary();
    if (typeof showToast === 'function') showToast('已清除在线诗词库');
  }

  /* ============================================================
     通用工具
     ============================================================ */
  function normalize(s) {
    return String(s || '')
      .replace(/[\s，。；：！？、,.!?;:'"「」『』（）()【】《》—…·]/g, '')
      .toLowerCase();
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) {
      if (typeof showToast === 'function') showToast('当前浏览器不支持朗读');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ============================================================
     子标签切换
     ============================================================ */
  document.querySelectorAll('#page-poetryrecite .ta-subtab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#page-poetryrecite .ta-subtab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.pt;
      document.querySelectorAll('#page-poetryrecite .ta-subpage').forEach(function (p) {
        p.classList.toggle('active', p.dataset.ptPage === target);
      });
      if (target === 'quiz') newQuestion();
      if (target === 'library') renderLibrary();
    });
  });

  /* ============================================================
     一、名句填空
     ============================================================ */
  var quizEraEl = document.getElementById('ptQuizEra');
  var quizTypeEl = document.getElementById('ptQuizType');
  var quizMetaEl = document.getElementById('ptQuizMeta');
  var quizQEl = document.getElementById('ptQuizQuestion');
  var quizInputEl = document.getElementById('ptQuizAnswer');
  var quizFbEl = document.getElementById('ptQuizFeedback');
  var quizStatsEl = document.getElementById('ptQuizStats');

  var quizStats = { total: 0, ok: 0, fail: 0 };
  var currentQ = null;

  function fillEraSelects() {
    var eras = {};
    POEMS.forEach(function (p) { eras[p.dynasty] = true; });
    var list = Object.keys(eras);
    var html = '<option value="">全部朝代</option>' + list.map(function (e) {
      return '<option value="' + esc(e) + '">' + esc(e) + '</option>';
    }).join('');
    if (quizEraEl) {
      var prev = quizEraEl.value;
      quizEraEl.innerHTML = html;
      if (prev && list.indexOf(prev) >= 0) quizEraEl.value = prev;
    }
    var libEl = document.getElementById('ptLibEra');
    if (libEl) {
      var prev2 = libEl.value;
      libEl.innerHTML = html;
      if (prev2 && list.indexOf(prev2) >= 0) libEl.value = prev2;
    }
  }

  function buildQuizPool() {
    var era = quizEraEl.value;
    var pool = [];
    POEMS.forEach(function (p) {
      if (era && p.dynasty !== era) return;
      for (var i = 0; i < p.lines.length - 1; i++) {
        pool.push({ dynasty: p.dynasty, author: p.author, title: p.title, prev: p.lines[i], next: p.lines[i + 1] });
      }
    });
    return pool;
  }

  function newQuestion() {
    var pool = buildQuizPool();
    if (!pool.length) {
      quizQEl.textContent = '没有可用的题目';
      quizMetaEl.textContent = '';
      return;
    }
    var type = quizTypeEl.value;
    if (type === 'random') type = Math.random() < 0.5 ? 'next' : 'prev';

    var q = pool[Math.floor(Math.random() * pool.length)];
    currentQ = { q: q, type: type };

    quizMetaEl.textContent = q.dynasty + ' · ' + q.author + '《' + q.title + '》';
    if (type === 'next') { quizQEl.textContent = q.prev; quizInputEl.placeholder = '输入下句…'; }
    else { quizQEl.textContent = q.next; quizInputEl.placeholder = '输入上句…'; }
    quizInputEl.value = '';
    quizFbEl.textContent = '';
    quizFbEl.className = 'pt-quiz-feedback';
    quizInputEl.focus();
    renderQuizStats();
  }

  function submitAnswer() {
    if (!currentQ) return;
    var ans = quizInputEl.value.trim();
    if (!ans) {
      quizFbEl.textContent = '请先输入答案';
      quizFbEl.className = 'pt-quiz-feedback err';
      return;
    }
    var correct = currentQ.type === 'next' ? currentQ.q.next : currentQ.q.prev;
    var ok = normalize(ans) === normalize(correct);
    quizStats.total++;
    if (ok) quizStats.ok++; else quizStats.fail++;

    if (ok) {
      quizFbEl.textContent = '✓ 回答正确！';
      quizFbEl.className = 'pt-quiz-feedback ok';
    } else {
      quizFbEl.innerHTML = '✗ 回答不正确，正确答案是：<span class="ans-line">' + esc(correct) + '</span>';
      quizFbEl.className = 'pt-quiz-feedback err';
    }
    renderQuizStats();
  }

  function showAnswer() {
    if (!currentQ) return;
    var correct = currentQ.type === 'next' ? currentQ.q.next : currentQ.q.prev;
    quizFbEl.innerHTML = '正确答案：<span class="ans-line">' + esc(correct) + '</span>';
    quizFbEl.className = 'pt-quiz-feedback answer';
  }

  function showHint() {
    if (!currentQ) return;
    var correct = currentQ.type === 'next' ? currentQ.q.next : currentQ.q.prev;
    var hintLen = Math.max(1, Math.floor(correct.length / 3));
    quizFbEl.innerHTML = '提示：答案共 ' + correct.length + ' 字，开头是「' + esc(correct.slice(0, hintLen)) + '…」';
    quizFbEl.className = 'pt-quiz-feedback answer';
  }

  function renderQuizStats() {
    quizStatsEl.innerHTML =
      '<div class="pt-stat">已答 <b>' + quizStats.total + '</b> 题</div>' +
      '<div class="pt-stat">正确 <b>' + quizStats.ok + '</b> 题</div>' +
      '<div class="pt-stat">错误 <b>' + quizStats.fail + '</b> 题</div>';
  }

  document.getElementById('ptNewQuestion').addEventListener('click', newQuestion);
  document.getElementById('ptQuizSubmit').addEventListener('click', submitAnswer);
  document.getElementById('ptQuizHint').addEventListener('click', showHint);
  document.getElementById('ptQuizShow').addEventListener('click', showAnswer);
  quizInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); }
  });
  quizEraEl.addEventListener('change', newQuestion);
  quizTypeEl.addEventListener('change', newQuestion);

  /* ============================================================
     二、诗词库
     ============================================================ */
  var libSearchEl = document.getElementById('ptLibSearch');
  var libEraEl = document.getElementById('ptLibEra');
  var libStatsEl = document.getElementById('ptLibStats');
  var libListEl = document.getElementById('ptLibList');
  var libMoreEl = document.getElementById('ptLibMore');

  function renderLibrary() {
    var q = String(libSearchEl.value || '').trim().toLowerCase();
    var era = libEraEl.value;

    var filtered = POEMS.filter(function (p) {
      if (era && p.dynasty !== era) return false;
      if (!q) return true;
      if (p.title && p.title.indexOf(q) >= 0) return true;
      if (p.author && p.author.indexOf(q) >= 0) return true;
      if (p.dynasty && p.dynasty.indexOf(q) >= 0) return true;
      if (p.lines.some(function (l) { return l.indexOf(q) >= 0; })) return true;
      return false;
    });

    var total = filtered.length;
    var list = filtered.slice(0, ONLINE_MAX_DISPLAY);

    if (libStatsEl) {
      var extra = '';
      if (onlineData) extra = '　·　在线库 <b>' + onlineData.length + '</b> 首';
      if (total > ONLINE_MAX_DISPLAY) extra += '　·　仅显示前 <b>' + ONLINE_MAX_DISPLAY + '</b> 首';
      libStatsEl.innerHTML = '共 <b>' + total + '</b> 首诗词' + extra;
    }

    if (!list.length) {
      libListEl.innerHTML = '<p class="pt-lib-empty">没有匹配的诗词，换个关键词试试～</p>';
      if (libMoreEl) libMoreEl.style.display = 'none';
      return;
    }

    libListEl.innerHTML = list.map(function (p) {
      var fullText = p.lines.join('');
      return '<div class="pt-lib-card">' +
        '<div class="pt-lib-head">' +
          '<h3 class="pt-lib-title">《' + esc(p.title) + '》</h3>' +
          '<span class="pt-lib-author">' + esc(p.author) + '</span>' +
          '<span class="pt-lib-era">' + esc(p.dynasty) + '</span>' +
        '</div>' +
        '<div class="pt-lib-body">' + p.lines.map(function (l) { return esc(l); }).join('\n') + '</div>' +
        '<div class="pt-lib-actions">' +
          '<button class="mini-btn" data-pt-speak="' + esc(fullText) + '" type="button">朗读</button>' +
        '</div>' +
      '</div>';
    }).join('');

    libListEl.querySelectorAll('[data-pt-speak]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        speak(btn.dataset.ptSpeak);
      });
    });

    if (libMoreEl) {
      if (total > ONLINE_MAX_DISPLAY) {
        libMoreEl.style.display = '';
        libMoreEl.innerHTML = '仅显示前 <b>' + ONLINE_MAX_DISPLAY + '</b> 首，共 <b>' + total + '</b> 首。请使用搜索或选择朝代缩小范围。';
      } else {
        libMoreEl.style.display = 'none';
      }
    }
  }

  if (libSearchEl) libSearchEl.addEventListener('input', renderLibrary);
  if (libEraEl) libEraEl.addEventListener('change', renderLibrary);

  var loadBtn = document.getElementById('ptOnlineLoad');
  var clearBtn = document.getElementById('ptOnlineClear');
  if (loadBtn) loadBtn.addEventListener('click', loadOnlineLibrary);
  if (clearBtn) clearBtn.addEventListener('click', clearOnlineLibrary);

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    if (window.__poetryInited) return;
    window.__poetryInited = true;

    var cached = readCache();
    if (cached && cached.length) {
      applyOnlineLibrary(cached);
      var descEl = document.getElementById('ptOnlineDesc');
      if (descEl) {
        descEl.textContent = '已加载在线诗词 ' + cached.length + ' 首（来自本地缓存）';
        descEl.className = 'pt-online-desc ok';
      }
      if (loadBtn) loadBtn.style.display = 'none';
      if (clearBtn) clearBtn.style.display = '';
    } else {
      fillEraSelects();
      /* 更新在线库描述里的数字 */
      var descEl2 = document.getElementById('ptOnlineDesc');
      if (descEl2 && !descEl2.classList.contains('ok') && !descEl2.classList.contains('err')) {
        descEl2.textContent = '本地收录 ' + LOCAL_POEMS.length + ' 首。点击右侧按钮，从网络加载唐诗三百首、宋词三百首、诗经（共约 900 首）。';
      }
    }

    newQuestion();
    renderLibrary();
    console.log('[古诗词默写] 本地库共 ' + LOCAL_POEMS.length + ' 首');
  }

  window.__poetryInit = function () {
    if (!window.__poetryInited) init();
    else { newQuestion(); renderLibrary(); }
  };

  if (page.classList.contains('active')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }

  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function () {
      if (page.classList.contains('active') && !window.__poetryInited) init();
    });
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  }

  console.log('[古诗词默写] 已加载');
})();