(function () {
  'use strict';

  var page = document.getElementById('page-help');
  var sidebar = document.getElementById('helpSidebar');
  if (!page) { console.warn('[帮助] 找不到 #page-help'); return; }

  /* ============================================================
     一、侧边目录：点击跳转 + 滚动高亮
     ============================================================ */
  if (sidebar && sidebar.dataset.bound !== '1') {
    sidebar.dataset.bound = '1';

    var links = Array.prototype.slice.call(sidebar.querySelectorAll('a[data-target]'));
    var sections = links.map(function (a) {
      return document.getElementById(a.dataset.target);
    }).filter(Boolean);

    var setActive = function (id) {
      links.forEach(function (a) {
        a.classList.toggle('active', a.dataset.target === id);
      });
    };

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.getElementById(a.dataset.target);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        var best = null, bestRatio = 0;
        entries.forEach(function (en) {
          if (en.isIntersecting && en.intersectionRatio > bestRatio) {
            bestRatio = en.intersectionRatio;
            best = en.target;
          }
        });
        if (best) setActive(best.id);
      }, { rootMargin: '-80px 0px -40% 0px', threshold: [0, .1, .25, .5, .75, 1] });
      sections.forEach(function (s) { obs.observe(s); });
    }

    window.addEventListener('scroll', function () {
      if (!page.classList.contains('active')) return;
      var atBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 8);
      if (atBottom && sections.length) setActive(sections[sections.length - 1].id);
    }, { passive: true });
  }

  /* ============================================================
     二、快速导航按钮
     ============================================================ */
  if (page.dataset.tocBound !== '1') {
    page.dataset.tocBound = '1';
    page.querySelectorAll('[data-help]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(btn.getAttribute('data-help'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ============================================================
     三、工具函数
     ============================================================ */
  function stamp() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes());
  }

  function toast(msg) {
    if (typeof window.showToast === 'function'){ window.showToast(msg); return; }
    var el = document.getElementById('toast');
    if (!el) { console.log('[帮助]', msg); return; }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el.__helpToastTimer);
    el.__helpToastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function download(text, filename, mime) {
    try {
      var blob = new Blob([text], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      toast('已开始下载：' + filename);
    } catch (e) {
      console.error('[帮助] 下载失败：', e);
      alert('下载失败：' + (e && e.message ? e.message : e));
    }
  }

  /* ============================================================
     四、生成 HTML 帮助文档
     ============================================================ */
  function buildHtml() {
    var d = new Date();
    var dateStr = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';

    var css = '*{box-sizing:border-box;}' +
    'body{margin:0;background:#fffdf5;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:#3a2a00;line-height:1.9;}' +
    '.doc{max-width:860px;margin:0 auto;background:#fff;padding:56px 60px 64px;min-height:100vh;}' +
    '.cover{text-align:center;padding-bottom:34px;border-bottom:3px solid #f5b301;margin-bottom:44px;}' +
    '.cover h1{font-size:32px;font-weight:800;letter-spacing:3px;margin:0 0 14px;color:#8d5a00;}' +
    '.cover .sub{color:#8a7340;font-size:15px;margin:0;}' +
    '.cover .ver{display:inline-block;margin-top:16px;padding:5px 16px;border-radius:999px;background:#fff4cc;color:#8d5a00;font-size:13px;font-weight:700;}' +
    'h2{font-size:21px;margin:44px 0 18px;padding-left:14px;border-left:5px solid #f5b301;color:#8d5a00;}' +
    'p{margin:0 0 12px;font-size:15px;color:#4a3800;}' +
    'ul,ol{margin:0 0 14px;padding-left:26px;font-size:15px;color:#4a3800;}' +
    'li{margin-bottom:7px;}' +
    'b,strong{color:#3a2a00;}' +
    'code{background:#fff4cc;color:#8d5a00;padding:1px 7px;border-radius:5px;font-family:Consolas,Menlo,monospace;font-size:13.5px;}' +
    '.qa{border:1px solid #f0e0b0;border-radius:10px;padding:15px 18px;margin-bottom:11px;background:#fffdf5;}' +
    '.qa .q{font-size:15.5px;font-weight:700;margin:0 0 8px;color:#8d5a00;}' +
    '.qa .a{font-size:14.5px;color:#4a3800;}' +
    '.qa .a p{margin:0 0 8px;font-size:14.5px;color:#4a3800;}' +
    '.tip{border-left:4px solid #ffd54f;background:#fffdf5;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:11px;font-size:14.5px;color:#4a3800;}' +
    '.tip b{color:#8d5a00;display:block;margin-bottom:4px;}' +
    '.kbd{display:inline-block;padding:2px 8px;margin:0 2px;border:1px solid #f0e0b0;border-bottom-width:2px;border-radius:6px;background:#fff;font-family:Consolas,Menlo,monospace;font-size:12.5px;color:#8a7340;white-space:nowrap;}' +
    'table{width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14.5px;}' +
    'th,td{text-align:left;padding:10px 13px;border-bottom:1px solid #f0e0b0;vertical-align:top;}' +
    'th{background:#fff4cc;color:#8a7340;font-weight:600;font-size:13px;}' +
    '.footer{margin-top:52px;padding-top:22px;border-top:1px solid #f0e0b0;text-align:center;color:#b09860;font-size:13px;}' +
    '@media print{body{background:#fff;}.doc{padding:0;max-width:none;}.qa,.tip{break-inside:avoid;}}' +
    '@media(max-width:640px){.doc{padding:28px 20px 40px;}.cover h1{font-size:24px;}h2{font-size:18px;}}';

    var body = '<div class="cover"><h1>岁窦工具箱 · 帮助文档（V4.2 活力版）</h1>' +
      '<p class="sub">新手教程 · 常见问题 · 工具小贴士 · 快捷键 · 数据说明</p>' +
      '<span class="ver">V4.2 活力版（2026.10）</span></div>' +

      '<h2>一、快速开始</h2><ol>' +
      '<li><b>先逛一圈首页</b>：首页采用常规单页滚动布局，从上到下依次是 Hero 区、推广轮播、热门工具、最新上架、专题推荐、「为什么选择岁窦工具箱」、编者的话与页脚。推广轮播会自动切换，鼠标悬停暂停，支持左右箭头、圆点手动切换与触屏滑动。</li>' +
      '<li><b>从应用中心挑选工具</b>：点击顶部导航「应用」进入应用中心，按九大分类浏览，也可以在「全部应用」里按拼音首字母查找。支持「我的常用」收藏，工具用满 3 次自动加入。</li>' +
      '<li><b>用搜索快速找到工具</b>：点击顶部导航栏的「搜索」按钮进入独立搜索页。搜索页支持两种模式：<b>模糊搜索</b>（匹配名称、简介、关键词、分类）与<b>精确搜索</b>（只匹配工具名或 id）。页面内置 12 个热门搜索标签，点击即搜；结果列表关键词自动高亮；只命中一款工具时会直接跳到该工具页。空状态时搜索框与热门标签整体居中，输入后自动靠顶。</li>' +
      '<li><b>不登录也能直接使用</b>：默认是「本地模式」，所有数据保存在你自己的浏览器里，不需要注册。</li>' +
      '<li><b>登录后开启云端同步与 AI</b>：点击右上角「登录」注册账号后，数据会同步到云端，换设备登录同一账号即可继续使用。</li>' +
      '<li><b>养成备份的习惯</b>：在「设置 → 数据管理」里点「导出全部数据（JSON）」即可下载一份完整备份。单工具页也各自带导出按钮（CSV / JSON / PNG / Word / TXT）。</li>' +
      '<li><b>健康数据仅供参考</b>：BMI、睡眠时长、心率 / 血糖 / 血压判定、运动热量估算、鞋码推荐等均为参考性质，<b>不能替代专业医疗意见</b>，如有不适请及时就医。</li>' +
      '</ol>' +

      '<h2>二、常见问题</h2>' +

      '<div class="qa"><p class="q">V4.2 活力版相比 V4.1 改了什么？</p><div class="a">' +
      '<p><b>V4.2 的核心是首页重构与搜索系统升级。</b></p>' +
      '<p><b>首页重构</b>：从「整屏翻页」改为常规单页滚动布局，新增推广轮播（4 张自动轮播）、最新上架、专题推荐、「为什么选择岁窦工具箱」等板块，让首页内容更丰富、浏览更顺畅。</p>' +
      '<p><b>搜索系统升级</b>：顶部搜索框改为「搜索」按钮，点击进入独立搜索页，告别下拉面板遮挡问题。搜索页支持模糊搜索与精确搜索两种模式，内置 12 个热门搜索标签、关键词自动高亮、空状态居中显示；只命中一款工具时直接跳到该工具页。切换搜索模式即时生效，无需重新输入。</p>' +
      '<p><b>专题推荐</b>：按使用场景打包四组专题——学习专区、健康生活、创作工坊、效率工具，每个专题内嵌 6 个常用工具快捷入口。</p>' +
      '<p><b>帮助文档 & 编者的话</b>：同步更新到 V4.2，覆盖首页重构、搜索升级等所有新变化。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">搜索用模糊还是精确？有什么区别？</p><div class="a">' +
      '<p><b>模糊搜索</b>（默认）：关键词命中工具的名称、简介、关键词、分类中任意一项即可，适合记不清工具全名时使用。</p>' +
      '<p><b>精确搜索</b>：关键词必须完全等于工具的名称或 id，用来快速定位某一款具体工具。</p>' +
      '<p>两种模式可以随时切换，切换后立即重新出结果，不需要重新输入。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">为什么点了搜索会直接跳到工具页？</p><div class="a">' +
      '<p>当搜索关键词只命中一款工具时，系统会直接跳到该工具页，省去中转。</p>' +
      '<p>命中多款或没有命中时，会停留在搜索页显示结果列表或空状态提示。你也可以手动切换为「精确搜索」，只匹配工具名或 id。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">V4.1 活力版相比 V4.0 改了什么？</p><div class="a">' +
      '<p><b>V4.1 的核心是新增「学科与学习」大类</b>，把学习类工具集中收纳，并拆分为「数理化」与「文史地理」两个子分类。</p>' +
      '<p><b>新增 15 款学习工具</b>：函数图像绘制、化学方程式、元素周期表、物理公式计算、解方程组、矩阵运算、电路计算、遗传计算、人体系统速查、中国历史简表、世界历史简表、地球模块、中国地理、古诗词默写、细胞结构速查。</p>' +
      '<p><b>重点工具</b>：函数图像绘制支持多函数叠加、标题与标签拖拽缩放、坐标轴范围自定义；化学方程式支持自动配平、电荷守恒、反应类型判断、气体 / 沉淀 / 水判定、摩尔质量计算；地球模块四合一；中国地理三合一；古诗词默写内置 160 首经典诗词。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">V4.0 活力版相比 V3.0.10.1 改了什么？</p><div class="a">' +
      '<p><b>V4.0 主要做了三件事</b>：一是视觉全面换装，二是新增 20 款工具，三是首页 / 帮助页改版为整屏翻页。</p>' +
      '<p><b>视觉方面</b>：全站主题色从「中国红 + 金色」换成「蜂蜜黄 + 暖棕」（主色 <code>#f5b301</code>）。</p>' +
      '<p><b>新增工具</b>（20 款）：表格填入器、幸运转盘、抛硬币模拟器、反应速度测试、中国车牌一览表、饮水量计算、倒数日、白噪音助眠、食物过敏清单、角色关系图、小说收藏、油耗计算、颜色转换、日期计算、贷款计算器、折扣计算器、世界时钟、生肖星座、Cron 表达式、分贝仪。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">数据保存在哪里？会不会丢？</p><div class="a">' +
      '<p>不登录时，所有数据保存在你浏览器的 localStorage 中（键名以 <code>suidou-</code> 开头），刷新或关闭页面都不会丢失。</p>' +
      '<p>但<b>清除浏览器缓存、更换设备 / 浏览器、使用无痕模式</b>都会导致数据丢失，建议定期在「设置 → 数据管理」导出 JSON 备份。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">换了一台设备，怎么把数据搬过去？</p><div class="a">' +
      '<p><b>方式一（推荐）</b>：注册并登录账号 → 在设置页点「上传本地数据到云端」→ 另一台设备登录同一账号后点「从云端拉取数据」。</p>' +
      '<p><b>方式二</b>：在旧设备导出 JSON 备份文件，在新设备通过「设置 → 导入数据」恢复。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">本地模式和云端模式有什么区别？</p><div class="a">' +
      '<p><b>本地模式</b>：数据只存在你自己的浏览器里，不上传服务器，无需登录，适合单设备使用。</p>' +
      '<p><b>云端模式</b>：登录后数据同步到 Supabase，多设备共用同一份数据；AI 相关功能也只对登录用户开放。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">为什么 AI 功能提示「请先登录」？</p><div class="a">' +
      '<p>AI 请求需要通过你的登录凭证转发到服务端进行鉴权和额度统计，因此必须先登录才能使用。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">AI 每天能用多少次？额度什么时候重置？</p><div class="a">' +
      '<p>每个账号每天有固定的免费调用次数，AI 助手聊天页会实时显示今日已用次数。额度按<b>自然日</b>重置。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">忘记密码了怎么办？</p><div class="a">' +
      '<p>在登录页点击「忘记密码？」，输入注册邮箱后我们会发送一封重置密码的邮件。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">怎么修改用户名和头像？</p><div class="a">' +
      '<p>登录后进入「设置 → 个人资料」，可以上传头像（自动压缩到 180px 以内）和修改用户名。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">上传的图片会不会占用很多空间？</p><div class="a">' +
      '<p>所有图片在上传前都会自动压缩：头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px。「表格填入器」的图片只在当前页面内存中使用，导出后不会占用浏览器存储空间。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">「健康管理」都能做什么？鞋码在哪？</p><div class="a">' +
      '<p><b>BMI 计算</b>：输入身高、体重得到 BMI 数值、分级与理想体重区间。</p>' +
      '<p><b>鞋码计算</b>：输入脚长与年龄，区分成人码与童码，给出多国鞋码推荐。</p>' +
      '<p><b>睡眠记录</b>：录入入睡 / 起床时间自动算时长，绘制近 30 天睡眠曲线。</p>' +
      '<p><b>生命体征</b>：可录入心率、血糖、血压，系统自动判定，并可交给 AI 做趋势解读。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">「表格填入器」的图片怎么移动？</p><div class="a">' +
      '<p>表格里的图片可以直接拖到其他单元格；也可以拖回下方素材区，重新分配。点击图片右上角的 × 可以删除。导出前还可以勾选是否导出标题。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">「白噪音助眠」的音频是从哪来的？</p><div class="a">' +
      '<p>所有白噪音都由浏览器实时合成（Web Audio API），不加载任何外部音频文件。八种音色全部本地生成，不上传任何数据。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">「分贝仪」需要麦克风权限吗？安全吗？</p><div class="a">' +
      '<p>首次使用需要授权麦克风权限。所有音频处理都在你的浏览器本地完成，<b>不会录制、不会上传任何音频</b>。分贝值为相对值，非专业声级计，仅供日常生活参考。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">点了导出按钮却找不到文件？</p><div class="a">' +
      '<p>所有导出（JSON 备份、CSV、docx、TXT、HTML、PNG）都通过浏览器的下载功能保存到默认下载目录。若没有反应，请检查浏览器是否拦截了下载。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">误删或清空的数据还能恢复吗？</p><div class="a">' +
      '<p>不能。工具箱不保存历史版本，已清空且没有备份的数据无法找回。执行「清空全部数据」之前请务必先导出备份。</p>' +
      '</div></div>' +

      '<div class="qa"><p class="q">页面显示异常、按钮点不动怎么办？</p><div class="a">' +
      '<p>可以依次尝试：① 刷新页面；② 检查网络；③ 换用 Chrome / Edge / Safari 等现代浏览器。</p>' +
      '</div></div>' +

      '<h2>三、工具小贴士</h2>' +

      '<div class="tip"><b>函数图像绘制</b>输入一个或多个函数表达式（如 sin(x)、x^2、1/x），自动生成函数图像。可自定义 X / Y 范围、坐标轴自身范围、刻度线方向、箭头、标题与函数标签的位置与字号，支持导出高清 PNG。乘号不能省略（写 2*x，不要写 2x）。</div>' +
      '<div class="tip"><b>化学方程式</b>输入化学方程式自动配平，同时验证原子守恒与电荷守恒，识别反应类型，标注气体 / 沉淀 / 水，并计算各物质的摩尔质量。支持离子方程式。</div>' +
      '<div class="tip"><b>元素周期表</b>118 种元素完整数据：原子量、电子排布、熔点、沸点、密度、发现年。按类别上色，支持按名称、符号、原子序数搜索，按类别筛选。</div>' +
      '<div class="tip"><b>物理公式计算</b>输入已知量自动求未知量。涵盖运动学、力学、能量、电学、热学五大类共 25+ 个公式。</div>' +
      '<div class="tip"><b>解方程组</b>一元一次、一元二次、二元一次、三元一次方程组求解。一元二次按判别式分类讨论，支持复数根；多元一次使用克拉默法则。</div>' +
      '<div class="tip"><b>矩阵运算</b>加法、减法、乘法、转置、行列式、逆矩阵六大运算，支持 1×1 到 5×5。输入支持整数、小数、负数、分数（如 1/2）。</div>' +
      '<div class="tip"><b>电路计算</b>串联电阻、并联电阻、欧姆定律、电阻定律、电功率、电能、串联分压、并联分流，共 10 个公式。</div>' +
      '<div class="tip"><b>遗传计算</b>一对基因、两对独立基因、ABO 血型三大模块。庞纳特方格可视化，基因型 / 表现型比例自动统计。</div>' +
      '<div class="tip"><b>人体系统速查</b>运动、消化、呼吸、循环、泌尿、神经、内分泌、生殖八大系统。每个系统含主要器官、器官功能、常见疾病、日常保健。</div>' +
      '<div class="tip"><b>中国历史简表</b>从夏商周到新中国，共 38 个时期的时间轴。含都城、开国君主、末代君主、代表人物、大事记、主要成就。子页另设「朝代对比」「历史地图」「历代帝王」。</div>' +
      '<div class="tip"><b>世界历史简表</b>古埃及、两河流域、古印度、古希腊、古罗马、拜占庭、阿拉伯帝国、中世纪欧洲、文艺复兴、大航海时代、工业革命、两次世界大战、冷战、当代世界，共 15 个时期。</div>' +
      '<div class="tip"><b>地球模块</b>四合一：公转与四季（太阳直射点 / 昼长 / 极昼范围）、自转（昼夜半球 / 线速度 / 地方时）、板块构造（六大板块）、经纬度距离（Haversine 公式）。</div>' +
      '<div class="tip"><b>中国地理</b>三合一：中国地形（28 条）、河流湖泊（10 条河流 + 8 个湖泊）、行政区划（34 个省级行政区）。</div>' +
      '<div class="tip"><b>古诗词默写</b>内置 160 首经典诗词。名句上下句填空、按朝代筛选、朗读、诗词库浏览。可选加载在线诗词库。</div>' +
      '<div class="tip"><b>细胞结构速查</b>动物细胞、植物细胞、原核细胞三类。SVG 示意图可点击查看结构详情，含 15 种主要细胞结构。</div>' +
      '<div class="tip"><b>数理化实验</b>30 个高中经典实验，覆盖数学、物理、化学三科。含实验目的、原理、器材、步骤、现象、结论、注意事项，动画可播放、暂停、拖动进度条。</div>' +
      '<div class="tip"><b>生活可视化</b>18 个动画科普：血液循环、呼吸过程、水循环、月相、潮汐、声音波形、光的色散等。支持播放、暂停、拖动进度条。</div>' +

      '<div class="tip"><b>健康管理</b>共四个子模块：BMI 计算、鞋码计算、睡眠记录、生命体征。</div>' +
      '<div class="tip"><b>运动记录</b>先填好个人信息，再添加运动。状态可选「计划」或「已记录」，AI 可辅助估算热量。</div>' +
      '<div class="tip"><b>急救知识速查</b>12 个常见紧急场景的分步处理指南，含 CPR 节拍器、AED 使用引导与紧急信息卡。</div>' +
      '<div class="tip"><b>常见穴位速查</b>25 个常用穴位的定位、主治、按摩方法与禁忌，支持按症状、按部位、按经络三种视角查询。</div>' +
      '<div class="tip"><b>轻断食时间表</b>支持 16:8 / 18:6 / 20:4 / 14:10 与自定义模式，实时显示进食窗口、断食窗口、当前状态与倒计时，含 30 天打卡统计。</div>' +
      '<div class="tip"><b>运动损伤应急处理</b>10 种常见运动损伤的识别、现场处理、就医指征、停训建议与预防方法，含 RICE / PRICE 分步指导。</div>' +
      '<div class="tip"><b>体感温度</b>结合温湿度风速计算体感温度，自动切换酷热 / 风寒模型，给出户外运动风险与建议。</div>' +
      '<div class="tip"><b>冥想练习</b>四种呼吸节奏：4-7-8、箱式、等长、深度放松。圆形随呼吸节律缩放，可开关提示音。</div>' +
      '<div class="tip"><b>饮水量计算</b>输入体重、年龄，选择性别、活动量与气温，估算每日建议饮水量，含分时段参考。</div>' +
      '<div class="tip"><b>白噪音助眠</b>雨声 / 海浪 / 壁炉 / 咖啡厅 / 森林 / 风扇 / 火车 / 棕噪音八种音色，全部由浏览器实时合成。</div>' +
      '<div class="tip"><b>食物过敏清单</b>记录过敏原、类别、严重程度、典型症状与应对方法，支持筛选、搜索与导出。</div>' +
      '<div class="tip"><b>数学计算</b>计算器（普通 / 专家）与单位换算（8 大类）两个模块。</div>' +
      '<div class="tip"><b>文章分析</b>字数统计按字符计算；词频分析中文按双字组切分，可切换停用词过滤。</div>' +
      '<div class="tip"><b>小说助手</b>包含时间线、起名器、对话生成器、随机灵感、灵感速记、小说管理六个子工具。</div>' +
      '<div class="tip"><b>随机灵感</b>本地随机不耗额度；AI 批量生成会一次给 3 / 6 / 10 条，并自动避开已生成过的内容。</div>' +
      '<div class="tip"><b>角色关系图</b>拖拽式人物关系网，可导出高清 PNG。</div>' +
      '<div class="tip"><b>图片工具</b>包含图片压缩、拼图（长图）、去除背景、图片加水印四个子工具。</div>' +
      '<div class="tip"><b>小说收藏</b>记录读过的书，书名、作者、阅读进度、评分与短评，支持筛选、搜索与导出。</div>' +
      '<div class="tip"><b>视频收藏</b>B站 / 抖音 / 快手 / 小红书 / 微博 / YouTube 等多平台链接，记录博主、发布日期、类型、时长、评分与备注。</div>' +
      '<div class="tip"><b>表情包收藏</b>拖拽批量上传，静态图自动压缩到 480px 以内，GIF 保留动图；一键复制到剪贴板。</div>' +
      '<div class="tip"><b>我的日历</b>点击日期格子添加安排，可导出当月图片。</div>' +
      '<div class="tip"><b>我的记账本</b>多币种，按币种汇总，可导出 CSV。</div>' +
      '<div class="tip"><b>时间戳转换</b>秒 / 毫秒自动识别、多时区、多格式，附时间差计算。</div>' +
      '<div class="tip"><b>世界时钟</b>多城市时间并排对比，自动处理夏令时。</div>' +
      '<div class="tip"><b>生肖星座</b>输入出生日期即可查询生肖与星座，内容仅供娱乐参考。</div>' +
      '<div class="tip"><b>油耗计算</b>记录加油台账，自动计算百公里油耗、每公里花费、累计里程与累计油费。</div>' +
      '<div class="tip"><b>颜色转换</b>HEX / RGB / HSL / CMYK 四种格式实时互转。</div>' +
      '<div class="tip"><b>日期计算</b>日期间隔、日期加减、工作日计算三种模式。</div>' +
      '<div class="tip"><b>贷款计算器</b>等额本息 / 等额本金两种方式，可导出 CSV。</div>' +
      '<div class="tip"><b>折扣计算器</b>支持打折、满减、优惠券、折上折、运费，输出到手价与详细计算过程。</div>' +
      '<div class="tip"><b>JSON 格式化</b>格式化 / 压缩 / 转义，语法错误定位到行列。</div>' +
      '<div class="tip"><b>Cron 表达式</b>可视化生成表达式并解释每一段含义，支持 5 段与 6 段格式。</div>' +
      '<div class="tip"><b>二维码生成</b>文本 / 网址 / 电话 / WiFi 生成二维码，支持 Logo 与参数调节，导出 PNG 与 SVG。</div>' +
      '<div class="tip"><b>表格填入器</b>把图片拖进「夯 / 顶级 / 人上人 / NPC / 拉完了」五个档位，支持多图、跨格移动。可自定义标题并勾选是否导出标题，最终导出为高清 PNG。</div>' +
      '<div class="tip"><b>汇率换算</b>内置参考汇率，离线可用；可联网更新当日参考值。</div>' +
      '<div class="tip"><b>幸运转盘</b>每个选项可设置权重（1-100），权重越大扇区越宽，六套主题可选。</div>' +
      '<div class="tip"><b>抛硬币模拟器</b>单次 3D 翻转，批量最多 10000 次，统计正反占比与连续记录。</div>' +
      '<div class="tip"><b>反应速度测试</b>6 次取平均，7 档评级，不支持键盘，鼠标 / 触摸均可。</div>' +
      '<div class="tip"><b>中国车牌一览表</b>按七大地理大区浏览车牌代码，支持省份 / 城市 / 代码搜索。</div>' +
      '<div class="tip"><b>倒数日</b>内置 10 种常见节日，实时显示距下一个节日的天数，可查 2024-2036 年日期。</div>' +
      '<div class="tip"><b>分贝仪</b>用麦克风实时测量环境噪音，所有处理本地完成，不会录制或上传任何音频。</div>' +
      '<div class="tip"><b>随机数</b>随机整数、随机小数、从列表抽取、随机洗牌四种模式。</div>' +
      '<div class="tip"><b>实用测试</b>键盘、鼠标、网络、麦克风四项硬件测试，全部在浏览器本地完成。</div>' +

      '<h2>四、快捷键速查</h2>' +
      '<table><thead><tr><th style="width:130px;">场景</th><th>按键</th></tr></thead><tbody>' +
      '<tr><td>数学计算 · 计算器</td><td><span class="kbd">0-9</span><span class="kbd">+</span><span class="kbd">-</span><span class="kbd">*</span><span class="kbd">/</span><span class="kbd">(</span><span class="kbd">)</span><span class="kbd">.</span><span class="kbd">%</span><span class="kbd">^</span><br>求值：<span class="kbd">Enter</span> 或 <span class="kbd">=</span>　退格：<span class="kbd">Backspace</span>　清空：<span class="kbd">Esc</span></td></tr>' +
      '<tr><td>代码编辑器</td><td><span class="kbd">Tab</span> 插入两个空格缩进<br>立即运行 / 渲染：<span class="kbd">Ctrl</span> / <span class="kbd">⌘</span> + <span class="kbd">Enter</span></td></tr>' +
      '<tr><td>AI 聊天</td><td>发送消息：<span class="kbd">Ctrl</span> / <span class="kbd">⌘</span> + <span class="kbd">Enter</span></td></tr>' +
      '<tr><td>化学方程式</td><td>输入框中按 <span class="kbd">Ctrl</span> / <span class="kbd">⌘</span> + <span class="kbd">Enter</span> 直接分析</td></tr>' +
      '<tr><td>随机灵感</td><td>关键词输入框中按 <span class="kbd">Enter</span> 直接触发生成</td></tr>' +
      '<tr><td>时间戳转换</td><td>输入框中按 <span class="kbd">Enter</span> 直接触发转换</td></tr>' +
      '<tr><td>JSON 格式化</td><td><span class="kbd">Ctrl</span> / <span class="kbd">⌘</span> + <span class="kbd">Enter</span> 一键格式化</td></tr>' +
      '<tr><td>汇率换算</td><td>金额输入框中按 <span class="kbd">Enter</span> 直接换算</td></tr>' +
      '<tr><td>搜索页</td><td>输入框中按 <span class="kbd">Enter</span> 直接搜索</td></tr>' +
      '</tbody></table>' +

      '<h2>五、数据与隐私</h2>' +
      '<div class="tip"><b>本地模式</b>数据保存在浏览器 localStorage，不会上传到任何服务器；浏览器上限一般约 5 MB。</div>' +
      '<div class="tip"><b>云端模式</b>登录后数据通过 Supabase 同步，密码由 Supabase Auth 加密处理。</div>' +
      '<div class="tip"><b>图片压缩</b>头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px，上传前自动压缩以节省空间。</div>' +
      '<div class="tip"><b>导出格式</b>JSON（完整备份）、CSV（记账、小说、油耗、过敏）、docx（歌曲、运动记录）、TXT / HTML（小说）、PNG（日历、影视、画布、运动、睡眠曲线、关系图、表格填入器、角色关系图）。</div>' +

      '<h2>六、联系与反馈</h2>' +
      '<ul>' +
      '<li><b>微博</b>：@岁窦工作室</li>' +
      '<li><b>邮箱</b>：q13052830801@163.com</li>' +
      '<li><b>版本</b>：V4.2 活力版（2026.10）</li>' +
      '</ul>' +

      '<div class="footer">岁窦工具箱 · 帮助文档（V4.2 活力版）<br>导出时间：' + dateStr + '　|　2026© 岁窦制作</div>';

    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>岁窦工具箱 · 帮助文档（V4.2 活力版）</title><style>' + css + '</style></head><body>' +
      '<div class="doc">' + body + '</div></body></html>';
  }

  /* ============================================================
     五、生成 Markdown 帮助文档
     ============================================================ */
  function buildMd() {
    var d = new Date();
    var dateStr = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
    return [
      '# 岁窦工具箱 · 帮助文档（V4.2 活力版）', '',
      '> 新手教程 · 常见问题 · 工具小贴士 · 快捷键 · 数据说明  ',
      '> 版本：V4.2 活力版（2026.10）', '', '---', '',

      '## 一、快速开始', '',
      '1. **先逛一圈首页**：首页采用常规单页滚动布局，从上到下依次是 Hero 区、推广轮播、热门工具、最新上架、专题推荐、「为什么选择岁窦工具箱」、编者的话与页脚。推广轮播会自动切换，鼠标悬停暂停，支持左右箭头、圆点手动切换与触屏滑动。',
      '2. **从应用中心挑选工具**：点击顶部导航「应用」进入应用中心，按九大分类浏览，也可以在「全部应用」里按拼音首字母查找。支持「我的常用」收藏，工具用满 3 次自动加入。',
      '3. **用搜索快速找到工具**：点击顶部导航栏的「搜索」按钮进入独立搜索页。搜索页支持两种模式：**模糊搜索**（匹配名称、简介、关键词、分类）与**精确搜索**（只匹配工具名或 id）。页面内置 12 个热门搜索标签，点击即搜；结果列表关键词自动高亮；只命中一款工具时会直接跳到该工具页。空状态时搜索框与热门标签整体居中，输入后自动靠顶。',
      '4. **不登录也能直接使用**：默认是「本地模式」，所有数据保存在你自己的浏览器里。',
      '5. **登录后开启云端同步与 AI**：点击右上角「登录」注册账号后，数据会同步到云端。',
      '6. **养成备份的习惯**：在「设置 → 数据管理」里点「导出全部数据（JSON）」即可下载完整备份。',
      '7. **健康数据仅供参考**：BMI、睡眠时长、心率 / 血糖 / 血压判定、运动热量估算、鞋码推荐等均为参考性质，**不能替代专业医疗意见**。', '',

      '## 二、常见问题', '',
      '### Q1. V4.2 活力版相比 V4.1 改了什么？',
      '**V4.2 的核心是首页重构与搜索系统升级。**',
      '',
      '**首页重构**：从「整屏翻页」改为常规单页滚动布局，新增推广轮播（4 张自动轮播）、最新上架、专题推荐、「为什么选择岁窦工具箱」等板块。',
      '',
      '**搜索系统升级**：顶部搜索框改为「搜索」按钮，点击进入独立搜索页。搜索页支持模糊搜索与精确搜索两种模式，内置 12 个热门搜索标签、关键词自动高亮、空状态居中显示；只命中一款工具时直接跳到工具页。',
      '',
      '**专题推荐**：按使用场景打包四组专题——学习专区、健康生活、创作工坊、效率工具。',
      '',
      '**帮助文档 & 编者的话**：同步更新到 V4.2。', '',
      '### Q2. 搜索用模糊还是精确？有什么区别？',
      '- **模糊搜索**（默认）：关键词命中工具的名称、简介、关键词、分类中任意一项即可。',
      '- **精确搜索**：关键词必须完全等于工具的名称或 id。',
      '',
      '两种模式可以随时切换，切换后立即重新出结果，不需要重新输入。', '',
      '### Q3. 为什么点了搜索会直接跳到工具页？',
      '当搜索关键词只命中一款工具时，系统会直接跳到该工具页，省去中转。命中多款或没有命中时，会停留在搜索页显示结果列表或空状态提示。', '',
      '### Q4. V4.1 活力版相比 V4.0 改了什么？',
      '**V4.1 的核心是新增「学科与学习」大类**，把学习类工具集中收纳，并拆分为「数理化」与「文史地理」两个子分类。',
      '',
      '**新增 15 款学习工具**：函数图像绘制、化学方程式、元素周期表、物理公式计算、解方程组、矩阵运算、电路计算、遗传计算、人体系统速查、中国历史简表、世界历史简表、地球模块、中国地理、古诗词默写、细胞结构速查。', '',
      '### Q5. V4.0 活力版相比 V3.0.10.1 改了什么？',
      '**V4.0 主要做了三件事**：一是视觉全面换装，二是新增 20 款工具，三是首页 / 帮助页改版为整屏翻页。', '',
      '### Q6. 数据保存在哪里？会不会丢？',
      '不登录时，所有数据保存在你浏览器的 localStorage 中（键名以 `suidou-` 开头），刷新或关闭页面都不会丢失。但**清除浏览器缓存、更换设备 / 浏览器、使用无痕模式**都会导致数据丢失，建议定期导出 JSON 备份。', '',
      '### Q7. 换了一台设备，怎么把数据搬过去？',
      '- **方式一（推荐）**：注册并登录账号 → 在设置页点「上传本地数据到云端」→ 另一台设备登录同一账号后点「从云端拉取数据」。',
      '- **方式二**：在旧设备导出 JSON 备份文件，在新设备通过「设置 → 导入数据」恢复。', '',
      '### Q8. 本地模式和云端模式有什么区别？',
      '- **本地模式**：数据只存在你自己的浏览器里，不上传服务器，无需登录。',
      '- **云端模式**：登录后数据同步到 Supabase，多设备共用同一份数据；AI 相关功能也只对登录用户开放。', '',
      '### Q9. 为什么 AI 功能提示「请先登录」？',
      'AI 请求需要通过你的登录凭证转发到服务端进行鉴权和额度统计，因此必须先登录才能使用。', '',
      '### Q10. AI 每天能用多少次？额度什么时候重置？',
      '每个账号每天有固定的免费调用次数，AI 助手聊天页会实时显示今日已用次数。额度按**自然日**重置。', '',
      '### Q11. 忘记密码了怎么办？',
      '在登录页点击「忘记密码？」，输入注册邮箱后我们会发送一封重置密码的邮件。', '',
      '### Q12. 怎么修改用户名和头像？',
      '登录后进入「设置 → 个人资料」，可以上传头像和修改用户名。', '',
      '### Q13. 上传的图片会不会占用很多空间？',
      '所有图片在上传前都会自动压缩：头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px。「表格填入器」的图片只在当前页面内存中使用。', '',
      '### Q14. 「健康管理」都能做什么？鞋码在哪？',
      '- **BMI 计算**：输入身高、体重得到 BMI 数值、分级与理想体重区间。',
      '- **鞋码计算**：输入脚长与年龄，区分成人码与童码，给出多国鞋码推荐。',
      '- **睡眠记录**：录入入睡 / 起床时间自动算时长，绘制近 30 天睡眠曲线。',
      '- **生命体征**：可录入心率、血糖、血压，可交给 AI 做趋势解读。', '',
      '### Q15. 「表格填入器」的图片怎么移动？',
      '表格里的图片可以直接拖到其他单元格；也可以拖回下方素材区，重新分配。点击图片右上角的 × 可以删除。导出前还可以勾选是否导出标题。', '',
      '### Q16. 「白噪音助眠」的音频是从哪来的？',
      '所有白噪音都由浏览器实时合成（Web Audio API），不加载任何外部音频文件。八种音色全部本地生成，不上传任何数据。', '',
      '### Q17. 「分贝仪」需要麦克风权限吗？安全吗？',
      '首次使用需要授权麦克风权限。所有音频处理都在你的浏览器本地完成，**不会录制、不会上传任何音频**。', '',
      '### Q18. 点了导出按钮却找不到文件？',
      '所有导出（JSON 备份、CSV、docx、TXT、HTML、PNG）都通过浏览器的下载功能保存到默认下载目录。检查浏览器是否拦截了下载。', '',
      '### Q19. 误删或清空的数据还能恢复吗？',
      '不能。工具箱不保存历史版本，已清空且没有备份的数据无法找回。', '',
      '### Q20. 页面显示异常、按钮点不动怎么办？',
      '可以依次尝试：① 刷新页面；② 检查网络；③ 换用 Chrome / Edge / Safari 等现代浏览器。', '',

      '## 三、工具小贴士', '',
      '### 学科与学习', '',
      '- **函数图像绘制**：多函数叠加、坐标范围与坐标轴范围自定义、标题与标签拖拽缩放、导出高清 PNG。',
      '- **化学方程式**：自动配平 + 电荷守恒 + 反应类型 + 气体沉淀水判定 + 摩尔质量。',
      '- **元素周期表**：118 种元素完整数据，按类别上色，支持搜索与筛选。',
      '- **物理公式计算**：运动学 / 力学 / 能量 / 电学 / 热学五大类共 25+ 公式。',
      '- **解方程组**：一元一次 / 一元二次 / 二元一次 / 三元一次，附判别式与解题步骤。',
      '- **矩阵运算**：加减乘、转置、行列式、逆矩阵，1×1 到 5×5。',
      '- **电路计算**：串并联、欧姆定律、电功率、分压分流，共 10 个公式。',
      '- **遗传计算**：一对基因 / 两对基因 / ABO 血型，庞纳特方格可视化。',
      '- **人体系统速查**：八大系统含器官、功能、常见疾病与日常保健。',
      '- **中国历史简表**：38 个时期时间轴 + 朝代对比 + 历史地图 + 历代帝王。',
      '- **世界历史简表**：15 个主要文明 / 时期时间轴，含人物、大事记与成就。',
      '- **地球模块**：公转与四季 + 自转 + 板块构造 + 经纬度距离四合一。',
      '- **中国地理**：中国地形 + 河流湖泊 + 行政区划三合一。',
      '- **古诗词默写**：160 首内置 + 在线库可选，名句填空 + 朗读 + 诗词库。',
      '- **细胞结构速查**：动物 / 植物 / 原核细胞结构，SVG 点击查详情。',
      '- **数理化实验**：30 个高中经典实验，含目的、原理、器材、步骤、现象、结论与注意事项。',
      '- **生活可视化**：18 个动画科普，含血液循环、呼吸过程、水循环、月相、潮汐等。', '',
      '### 其他工具', '',
      '- **健康管理**：BMI 计算 + 鞋码计算 + 睡眠记录 + 生命体征四合一。',
      '- **运动记录**：先填个人信息，再添加运动。状态可选「计划」或「已记录」。',
      '- **急救知识速查**：12 个常见紧急场景，含 CPR 节拍器、AED 使用引导与紧急信息卡。',
      '- **常见穴位速查**：25 个常用穴位，支持按症状、按部位、按经络三种视角查询。',
      '- **轻断食时间表**：16:8 / 18:6 / 20:4 / 14:10 与自定义模式，含 30 天打卡统计。',
      '- **运动损伤应急处理**：10 种常见损伤，含 RICE / PRICE 分步指导。',
      '- **白噪音助眠**：八种环境声，全部由浏览器实时合成。',
      '- **小说助手**：包含时间线、起名器、对话生成器、随机灵感、灵感速记、小说管理六个子工具。',
      '- **随机灵感**：本地随机不耗额度；AI 批量生成一次给 3 / 6 / 10 条。',
      '- **角色关系图**：拖拽式人物关系网，可导出高清 PNG。',
      '- **图片工具**：图片压缩、拼图、去除背景、图片加水印四个子工具。',
      '- **表情包收藏**：拖拽批量上传，一键复制到剪贴板。',
      '- **视频收藏**：B站 / 抖音 / YouTube 等多平台链接记录。',
      '- **我的记账本**：多币种，按币种汇总，可导出 CSV。',
      '- **时间戳转换**：秒 / 毫秒自动识别、多时区、多格式，附时间差计算。',
      '- **表格填入器**：把图片拖进「夯 / 顶级 / 人上人 / NPC / 拉完了」五个档位，可导出高清 PNG。',
      '- **实用测试**：键盘、鼠标、网络、麦克风四项硬件测试。', '',

      '## 四、快捷键速查', '',
      '| 场景 | 按键 |',
      '| --- | --- |',
      '| 数学计算 · 计算器 | `0-9` `+` `-` `*` `/` `(` `)` `.` `%` `^`；`Enter` / `=` 求值；`Backspace` 退格；`Esc` 清空 |',
      '| 代码编辑器 | `Tab` 缩进两个空格；`Ctrl` / `⌘` + `Enter` 立即运行或渲染 |',
      '| AI 聊天 | `Ctrl` / `⌘` + `Enter` 发送消息 |',
      '| 化学方程式 | 输入框中按 `Ctrl` / `⌘` + `Enter` 直接分析 |',
      '| 随机灵感 | 关键词输入框中按 `Enter` 直接触发生成 |',
      '| 时间戳转换 | 输入框中按 `Enter` 直接触发转换 |',
      '| JSON 格式化 | `Ctrl` / `⌘` + `Enter` 一键格式化 |',
      '| 汇率换算 | 金额输入框中按 `Enter` 直接换算 |',
      '| 搜索页 | 输入框中按 `Enter` 直接搜索 |', '',

      '## 五、数据与隐私', '',
      '- **本地模式**：数据保存在浏览器 localStorage，不上传服务器，上限约 5 MB。',
      '- **云端模式**：登录后通过 Supabase 同步，密码由 Supabase Auth 加密处理。',
      '- **图片压缩**：头像 180px、人物 400px、小说封面 600px、地点 / 影视 / 运动 800px。',
      '- **导出格式**：JSON、CSV、docx、TXT / HTML、PNG。', '',

      '## 六、联系与反馈', '',
      '- 微博：@岁窦工作室',
      '- 邮箱：q13052830801@163.com',
      '- 版本：V4.2 活力版（2026.10）', '',

      '---', '',
      '*岁窦工具箱 · 帮助文档（V4.2 活力版）　|　导出时间：' + dateStr + '　|　2026© 岁窦制作*', ''
    ].join('\n');
  }

  /* ============================================================
     六、生成并下载 Word（docx）帮助文档
     ============================================================ */
  async function downloadDocx() {
    if (typeof window.docx === 'undefined') {
      alert('Word 导出库未加载，请刷新页面后重试');
      return;
    }

    var D = window.docx;
    var FONT = 'Microsoft YaHei';
    var children = [];

    children.push(new D.Paragraph({
      children: [new D.TextRun({ text: '岁窦工具箱 · 帮助文档（V4.2 活力版）', bold: true, size: 44, font: FONT, color: '8d5a00' })],
      alignment: D.AlignmentType.CENTER,
      spacing: { before: 600, after: 200 }
    }));
    children.push(new D.Paragraph({
      children: [new D.TextRun({ text: '新手教程 · 常见问题 · 工具小贴士 · 快捷键 · 数据说明', size: 22, font: FONT, color: '8a7340' })],
      alignment: D.AlignmentType.CENTER,
      spacing: { after: 120 }
    }));
    children.push(new D.Paragraph({
      children: [new D.TextRun({ text: 'V4.2 活力版（2026.10）', size: 22, font: FONT, color: '8d5a00', bold: true })],
      alignment: D.AlignmentType.CENTER,
      spacing: { after: 400 },
      border: { bottom: { color: 'f5b301', space: 6, style: D.BorderStyle.SINGLE, size: 12 } }
    }));

    function H1(text) {
      return new D.Paragraph({
        children: [new D.TextRun({ text: text, bold: true, size: 30, font: FONT, color: '8d5a00' })],
        spacing: { before: 400, after: 200 },
        border: { left: { color: 'f5b301', space: 8, style: D.BorderStyle.SINGLE, size: 24 } },
        indent: { left: 160 }
      });
    }
    function Runs(runs, opts) {
      opts = opts || {};
      return new D.Paragraph({
        children: runs.map(function (r) {
          return new D.TextRun({
            text: r.text,
            bold: !!r.bold,
            size: r.size || 22,
            font: FONT,
            color: r.color || '4a3800'
          });
        }),
        spacing: { after: opts.after !== undefined ? opts.after : 120, line: 340 },
        indent: opts.indent
      });
    }

    children.push(H1('一、快速开始'));
    [
      ['先逛一圈首页', '首页采用常规单页滚动布局，从上到下依次是 Hero 区、推广轮播、热门工具、最新上架、专题推荐、「为什么选择岁窦工具箱」、编者的话与页脚。推广轮播会自动切换，鼠标悬停暂停，支持左右箭头、圆点手动切换与触屏滑动。'],
      ['从应用中心挑选工具', '点击顶部导航「应用」进入应用中心，按九大分类浏览，也可以在「全部应用」里按拼音首字母查找。支持「我的常用」收藏，工具用满 3 次自动加入。'],
      ['用搜索快速找到工具', '点击顶部导航栏的「搜索」按钮进入独立搜索页。搜索页支持模糊搜索（匹配名称、简介、关键词、分类）与精确搜索（只匹配工具名或 id）。页面内置 12 个热门搜索标签，点击即搜；结果列表关键词自动高亮；只命中一款工具时会直接跳到该工具页。'],
      ['不登录也能直接使用', '默认是「本地模式」，所有数据保存在你自己的浏览器里。'],
      ['登录后开启云端同步与 AI', '点击右上角「登录」注册账号后，数据会同步到云端。'],
      ['养成备份的习惯', '在「设置 → 数据管理」里点「导出全部数据（JSON）」即可下载完整备份。'],
      ['健康数据仅供参考', 'BMI、睡眠时长、心率 / 血糖 / 血压判定、运动热量估算、鞋码推荐等均为参考性质，不能替代专业医疗意见。']
    ].forEach(function (s, i) {
      children.push(Runs([
        { text: (i + 1) + '. ', bold: true, color: '8d5a00' },
        { text: s[0] + '：', bold: true, color: '3a2a00' },
        { text: s[1] }
      ]));
    });

    children.push(H1('二、常见问题'));
    var faqs = [
      ['V4.2 活力版相比 V4.1 改了什么？', [
        'V4.2 的核心是首页重构与搜索系统升级。',
        '首页重构：从「整屏翻页」改为常规单页滚动布局，新增推广轮播、最新上架、专题推荐、「为什么选择岁窦工具箱」等板块。',
        '搜索系统升级：顶部搜索框改为「搜索」按钮，点击进入独立搜索页。搜索页支持模糊搜索与精确搜索两种模式，内置 12 个热门搜索标签、关键词自动高亮、空状态居中显示；只命中一款工具时直接跳到工具页。',
        '专题推荐：按使用场景打包四组专题——学习专区、健康生活、创作工坊、效率工具。',
        '帮助文档 & 编者的话：同步更新到 V4.2。'
      ]],
      ['搜索用模糊还是精确？有什么区别？', [
        '模糊搜索（默认）：关键词命中工具的名称、简介、关键词、分类中任意一项即可。',
        '精确搜索：关键词必须完全等于工具的名称或 id。',
        '两种模式可以随时切换，切换后立即重新出结果，不需要重新输入。'
      ]],
      ['为什么点了搜索会直接跳到工具页？', [
        '当搜索关键词只命中一款工具时，系统会直接跳到该工具页，省去中转。命中多款或没有命中时，会停留在搜索页显示结果列表或空状态提示。'
      ]],
      ['V4.1 活力版相比 V4.0 改了什么？', [
        'V4.1 的核心是新增「学科与学习」大类，把学习类工具集中收纳，并拆分为「数理化」与「文史地理」两个子分类。',
        '新增 15 款学习工具：函数图像绘制、化学方程式、元素周期表、物理公式计算、解方程组、矩阵运算、电路计算、遗传计算、人体系统速查、中国历史简表、世界历史简表、地球模块、中国地理、古诗词默写、细胞结构速查。'
      ]],
      ['V4.0 活力版相比 V3.0.10.1 改了什么？', [
        'V4.0 主要做了三件事：一是视觉全面换装，二是新增 20 款工具，三是首页 / 帮助页改版为整屏翻页。',
        '新增工具（20 款）：表格填入器、幸运转盘、抛硬币模拟器、反应速度测试、中国车牌一览表、饮水量计算、倒数日、白噪音助眠、食物过敏清单、角色关系图、小说收藏、油耗计算、颜色转换、日期计算、贷款计算器、折扣计算器、世界时钟、生肖星座、Cron 表达式、分贝仪。'
      ]],
      ['数据保存在哪里？会不会丢？', [
        '不登录时，所有数据保存在你浏览器的 localStorage 中（键名以 suidou- 开头），刷新或关闭页面都不会丢失。但清除浏览器缓存、更换设备 / 浏览器、使用无痕模式都会导致数据丢失，建议定期导出 JSON 备份。'
      ]],
      ['换了一台设备，怎么把数据搬过去？', [
        '方式一（推荐）：注册并登录账号 → 在设置页点「上传本地数据到云端」→ 另一台设备登录同一账号后点「从云端拉取数据」。',
        '方式二：在旧设备导出 JSON 备份文件，在新设备通过「设置 → 导入数据」恢复。'
      ]],
      ['本地模式和云端模式有什么区别？', [
        '本地模式：数据只存在你自己的浏览器里，不上传服务器，无需登录。',
        '云端模式：登录后数据同步到 Supabase，多设备共用同一份数据；AI 相关功能也只对登录用户开放。'
      ]],
      ['为什么 AI 功能提示「请先登录」？', [
        'AI 请求需要通过你的登录凭证转发到服务端进行鉴权和额度统计，因此必须先登录才能使用。'
      ]],
      ['AI 每天能用多少次？额度什么时候重置？', [
        '每个账号每天有固定的免费调用次数，AI 助手聊天页会实时显示今日已用次数。额度按自然日重置。'
      ]],
      ['忘记密码了怎么办？', [
        '在登录页点击「忘记密码？」，输入注册邮箱后我们会发送一封重置密码的邮件。'
      ]],
      ['怎么修改用户名和头像？', [
        '登录后进入「设置 → 个人资料」，可以上传头像和修改用户名。'
      ]],
      ['上传的图片会不会占用很多空间？', [
        '所有图片在上传前都会自动压缩：头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px。',
        '「表格填入器」的图片只在当前页面内存中使用，导出后不会占用浏览器存储空间。'
      ]],
      ['「健康管理」都能做什么？鞋码在哪？', [
        'BMI 计算：输入身高、体重得到 BMI 数值、分级与理想体重区间。',
        '鞋码计算：输入脚长与年龄，区分成人码与童码，给出多国鞋码推荐。',
        '睡眠记录：录入入睡 / 起床时间自动算时长，绘制近 30 天睡眠曲线。',
        '生命体征：可录入心率、血糖、血压，可交给 AI 做趋势解读。'
      ]],
      ['「表格填入器」的图片怎么移动？', [
        '表格里的图片可以直接拖到其他单元格；也可以拖回下方素材区，重新分配。点击图片右上角的 × 可以删除。导出前还可以勾选是否导出标题。'
      ]],
      ['「白噪音助眠」的音频是从哪来的？', [
        '所有白噪音都由浏览器实时合成（Web Audio API），不加载任何外部音频文件。八种音色全部本地生成，不上传任何数据。'
      ]],
      ['「分贝仪」需要麦克风权限吗？安全吗？', [
        '首次使用需要授权麦克风权限。所有音频处理都在你的浏览器本地完成，不会录制、不会上传任何音频。',
        '分贝值为相对值，非专业声级计，仅供日常生活参考。'
      ]],
      ['点了导出按钮却找不到文件？', [
        '所有导出（JSON 备份、CSV、docx、TXT、HTML、PNG）都通过浏览器的下载功能保存到默认下载目录。检查浏览器是否拦截了下载。'
      ]],
      ['误删或清空的数据还能恢复吗？', [
        '不能。工具箱不保存历史版本，已清空且没有备份的数据无法找回。'
      ]],
      ['页面显示异常、按钮点不动怎么办？', [
        '可以依次尝试：① 刷新页面；② 检查网络；③ 换用 Chrome / Edge / Safari 等现代浏览器。'
      ]]
    ];
    faqs.forEach(function (f, i) {
      children.push(new D.Paragraph({
        children: [
          new D.TextRun({ text: 'Q' + (i + 1) + '. ', bold: true, size: 24, font: FONT, color: '8d5a00' }),
          new D.TextRun({ text: f[0], bold: true, size: 24, font: FONT, color: '3a2a00' })
        ],
        spacing: { before: 200, after: 100 },
        indent: { left: 160 }
      }));
      f[1].forEach(function (line) {
        children.push(new D.Paragraph({
          children: [new D.TextRun({ text: line, size: 22, font: FONT, color: '4a3800' })],
          spacing: { after: 100, line: 340 },
          indent: { left: 360 }
        }));
      });
    });

    children.push(H1('三、工具小贴士'));

    children.push(new D.Paragraph({
      children: [new D.TextRun({ text: '学科与学习', bold: true, size: 26, font: FONT, color: '8d5a00' })],
      spacing: { before: 200, after: 120 },
      indent: { left: 160 }
    }));
    [
      ['函数图像绘制', '多函数叠加、坐标范围与坐标轴范围自定义、标题与标签拖拽缩放、导出高清 PNG。'],
      ['化学方程式', '自动配平 + 电荷守恒 + 反应类型 + 气体沉淀水判定 + 摩尔质量。'],
      ['元素周期表', '118 种元素完整数据，按类别上色，支持搜索与筛选。'],
      ['物理公式计算', '运动学 / 力学 / 能量 / 电学 / 热学五大类共 25+ 公式。'],
      ['解方程组', '一元一次 / 一元二次 / 二元一次 / 三元一次，附判别式与解题步骤。'],
      ['矩阵运算', '加减乘、转置、行列式、逆矩阵，1×1 到 5×5。'],
      ['电路计算', '串并联、欧姆定律、电功率、分压分流，共 10 个公式。'],
      ['遗传计算', '一对基因 / 两对基因 / ABO 血型，庞纳特方格可视化。'],
      ['人体系统速查', '八大系统含器官、功能、常见疾病与日常保健。'],
      ['中国历史简表', '38 个时期时间轴 + 朝代对比 + 历史地图 + 历代帝王。'],
      ['世界历史简表', '15 个主要文明 / 时期时间轴，含人物、大事记与成就。'],
      ['地球模块', '公转与四季 + 自转 + 板块构造 + 经纬度距离四合一。'],
      ['中国地理', '中国地形 + 河流湖泊 + 行政区划三合一。'],
      ['古诗词默写', '160 首内置 + 在线库可选，名句填空 + 朗读 + 诗词库。'],
      ['细胞结构速查', '动物 / 植物 / 原核细胞结构，SVG 点击查详情。'],
      ['数理化实验', '30 个高中经典实验，含目的、原理、器材、步骤、现象、结论与注意事项。'],
      ['生活可视化', '18 个动画科普，含血液循环、呼吸过程、水循环、月相、潮汐等。']
    ].forEach(function (t) {
      children.push(Runs([
        { text: '• ', color: '8d5a00', bold: true, size: 24 },
        { text: t[0] + '：', bold: true, color: '8d5a00' },
        { text: t[1] }
      ]));
    });

    children.push(new D.Paragraph({
      children: [new D.TextRun({ text: '其他工具', bold: true, size: 26, font: FONT, color: '8d5a00' })],
      spacing: { before: 240, after: 120 },
      indent: { left: 160 }
    }));

    [
      ['健康管理', 'BMI 计算 + 鞋码计算 + 睡眠记录 + 生命体征四合一。'],
      ['运动记录', '先填个人信息，再添加运动。状态可选「计划」或「已记录」。'],
      ['急救知识速查', '12 个常见紧急场景，含 CPR 节拍器、AED 使用引导与紧急信息卡。'],
      ['常见穴位速查', '25 个常用穴位，支持按症状、按部位、按经络三种视角查询。'],
      ['轻断食时间表', '16:8 / 18:6 / 20:4 / 14:10 与自定义模式，含 30 天打卡统计。'],
      ['运动损伤应急处理', '10 种常见损伤，含 RICE / PRICE 分步指导。'],
      ['白噪音助眠', '八种环境声，全部由浏览器实时合成。'],
      ['小说助手', '包含时间线、起名器、对话生成器、随机灵感、灵感速记、小说管理六个子工具。'],
      ['随机灵感', '本地随机不耗额度；AI 批量生成一次给 3 / 6 / 10 条。'],
      ['角色关系图', '拖拽式人物关系网，可导出高清 PNG。'],
      ['图片工具', '图片压缩、拼图、去除背景、图片加水印四个子工具。'],
      ['表情包收藏', '拖拽批量上传，一键复制到剪贴板。'],
      ['视频收藏', 'B站 / 抖音 / YouTube 等多平台链接记录。'],
      ['我的记账本', '多币种，按币种汇总，可导出 CSV。'],
      ['时间戳转换', '秒 / 毫秒自动识别、多时区、多格式，附时间差计算。'],
      ['表格填入器', '把图片拖进「夯 / 顶级 / 人上人 / NPC / 拉完了」五个档位，可导出高清 PNG。'],
      ['实用测试', '键盘、鼠标、网络、麦克风四项硬件测试。']
    ].forEach(function (t) {
      children.push(Runs([
        { text: '• ', color: '8d5a00', bold: true, size: 24 },
        { text: t[0] + '：', bold: true, color: '8d5a00' },
        { text: t[1] }
      ]));
    });

    children.push(H1('四、快捷键速查'));
    var keyRows = [
      ['数学计算 · 计算器', '0-9   +   -   *   /   (   )   .   %   ^      求值：Enter 或 =　退格：Backspace　清空：Esc'],
      ['代码编辑器', 'Tab 插入两个空格缩进      立即运行 / 渲染：Ctrl / ⌘ + Enter'],
      ['AI 聊天', '发送消息：Ctrl / ⌘ + Enter'],
      ['化学方程式', '输入框中按 Ctrl / ⌘ + Enter 直接分析'],
      ['随机灵感', '关键词输入框中按 Enter 直接触发生成'],
      ['时间戳转换', '输入框中按 Enter 直接触发转换'],
      ['JSON 格式化', 'Ctrl / ⌘ + Enter 一键格式化'],
      ['汇率换算', '金额输入框中按 Enter 直接换算'],
      ['搜索页', '输入框中按 Enter 直接搜索']
    ];
    children.push(new D.Table({
      width: { size: 100, type: D.WidthType.PERCENTAGE },
      rows: [
        new D.TableRow({
          tableHeader: true,
          children: [
            new D.TableCell({
              width: { size: 25, type: D.WidthType.PERCENTAGE },
              shading: { type: D.ShadingType.CLEAR, fill: 'fff4cc', color: 'auto' },
              children: [new D.Paragraph({
                children: [new D.TextRun({ text: '场景', bold: true, size: 22, font: FONT, color: '8a7340' })]
              })]
            }),
            new D.TableCell({
              width: { size: 75, type: D.WidthType.PERCENTAGE },
              shading: { type: D.ShadingType.CLEAR, fill: 'fff4cc', color: 'auto' },
              children: [new D.Paragraph({
                children: [new D.TextRun({ text: '按键', bold: true, size: 22, font: FONT, color: '8a7340' })]
              })]
            })
          ]
        })
      ].concat(keyRows.map(function (row) {
        return new D.TableRow({
          children: [
            new D.TableCell({
              width: { size: 25, type: D.WidthType.PERCENTAGE },
              children: [new D.Paragraph({
                children: [new D.TextRun({ text: row[0], bold: true, size: 22, font: FONT, color: '3a2a00' })]
              })]
            }),
            new D.TableCell({
              width: { size: 75, type: D.WidthType.PERCENTAGE },
              children: [new D.Paragraph({
                children: [new D.TextRun({ text: row[1], size: 22, font: FONT, color: '4a3800' })]
              })]
            })
          ]
        });
      }))
    }));
    children.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));

    children.push(H1('五、数据与隐私'));
    [
      ['本地模式', '数据保存在浏览器 localStorage，不会上传到任何服务器；浏览器上限一般约 5 MB。'],
      ['云端模式', '登录后数据通过 Supabase 同步，密码由 Supabase Auth 加密处理。'],
      ['图片压缩', '头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px。'],
      ['导出格式', 'JSON（完整备份）、CSV（记账、小说、油耗、过敏）、docx（歌曲、运动记录）、TXT / HTML（小说）、PNG（日历、影视、画布、运动、睡眠曲线、关系图、表格填入器、角色关系图）。']
    ].forEach(function (t) {
      children.push(Runs([
        { text: '• ', color: '8d5a00', bold: true, size: 24 },
        { text: t[0] + '：', bold: true, color: '8d5a00' },
        { text: t[1] }
      ]));
    });

    children.push(H1('六、联系与反馈'));
    [
      ['微博', '@岁窦工作室'],
      ['邮箱', 'q13052830801@163.com'],
      ['版本', 'V4.2 活力版（2026.10）']
    ].forEach(function (t) {
      children.push(Runs([
        { text: '• ', color: '8d5a00', bold: true, size: 24 },
        { text: t[0] + '：', bold: true, color: '8d5a00' },
        { text: t[1] }
      ]));
    });

    var dd = new Date();
    var dateStr = dd.getFullYear() + '-' +
      String(dd.getMonth() + 1).padStart(2, '0') + '-' +
      String(dd.getDate()).padStart(2, '0');
    children.push(new D.Paragraph({
      children: [new D.TextRun({
        text: '岁窦工具箱 · 帮助文档（V4.2 活力版）　|　导出时间：' + dateStr + '　|　2026© 岁窦制作',
        size: 20, font: FONT, color: 'b09860'
      })],
      alignment: D.AlignmentType.CENTER,
      spacing: { before: 600 },
      border: { top: { color: 'f0e0b0', space: 12, style: D.BorderStyle.SINGLE, size: 6 } }
    }));

    try {
      var doc = new D.Document({
        creator: '岁窦工具箱',
        title: '岁窦工具箱 · 帮助文档（V4.2 活力版）',
        description: '岁窦工具箱 V4.2 活力版帮助文档',
        styles: { default: { document: { run: { font: FONT, size: 22 } } } },
        sections: [{
          properties: { page: { margin: { top: 1100, bottom: 1100, left: 1100, right: 1100 } } },
          children: children
        }]
      });

      var blob = await D.Packer.toBlob(doc);
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '岁窦工具箱_帮助文档_' + stamp() + '.docx';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);

      toast('已开始下载 Word 文档');
    } catch (err) {
      console.error('[帮助] docx 生成失败：', err);
      alert('生成 Word 文档失败：' + (err && err.message ? err.message : err));
    }
  }

  if (page.dataset.dlBound !== '1') {
    page.dataset.dlBound = '1';

    page.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-help-dl]');
      if (!btn) return;
      e.preventDefault();
      var kind = btn.getAttribute('data-help-dl');
      console.log('[帮助] 点击下载按钮：', kind);

      if (kind === 'html') {
        download(buildHtml(), '岁窦工具箱_帮助文档_' + stamp() + '.html', 'text/html;charset=utf-8');
      } else if (kind === 'md') {
        download(buildMd(), '岁窦工具箱_帮助文档_' + stamp() + '.md', 'text/markdown;charset=utf-8');
      } else if (kind === 'docx') {
        downloadDocx();
      }
    });
  }

  console.log('[帮助] 帮助页脚本已加载（V4.2）');
})();