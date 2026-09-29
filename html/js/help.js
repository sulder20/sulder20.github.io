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
         二、快速导航按钮：滚动到对应板块
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
        'body{margin:0;background:#fffaf2;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:#3a1a10;line-height:1.9;}' +
        '.doc{max-width:860px;margin:0 auto;background:#fff;padding:56px 60px 64px;min-height:100vh;}' +
        '.cover{text-align:center;padding-bottom:34px;border-bottom:3px solid #c62828;margin-bottom:44px;}' +
        '.cover h1{font-size:32px;font-weight:800;letter-spacing:3px;margin:0 0 14px;color:#8e0000;}' +
        '.cover .sub{color:#9a5a3c;font-size:15px;margin:0;}' +
        '.cover .ver{display:inline-block;margin-top:16px;padding:5px 16px;border-radius:999px;background:#ffe3c2;color:#8e0000;font-size:13px;font-weight:700;}' +
        'h2{font-size:21px;margin:44px 0 18px;padding-left:14px;border-left:5px solid #c62828;color:#8e0000;}' +
        'p{margin:0 0 12px;font-size:15px;color:#4b2a1a;}' +
        'ul,ol{margin:0 0 14px;padding-left:26px;font-size:15px;color:#4b2a1a;}' +
        'li{margin-bottom:7px;}' +
        'b,strong{color:#3a1a10;}' +
        'code{background:#ffe3c2;color:#8e0000;padding:1px 7px;border-radius:5px;font-family:Consolas,Menlo,monospace;font-size:13.5px;}' +
        '.qa{border:1px solid #f2d8b8;border-radius:10px;padding:15px 18px;margin-bottom:11px;background:#fffaf2;}' +
        '.qa .q{font-size:15.5px;font-weight:700;margin:0 0 8px;color:#8e0000;}' +
        '.qa .a{font-size:14.5px;color:#4b2a1a;}' +
        '.qa .a p{margin:0 0 8px;font-size:14.5px;color:#4b2a1a;}' +
        '.tip{border-left:4px solid #f6c453;background:#fffaf2;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:11px;font-size:14.5px;color:#4b2a1a;}' +
        '.tip b{color:#8e0000;display:block;margin-bottom:4px;}' +
        '.kbd{display:inline-block;padding:2px 8px;margin:0 2px;border:1px solid #f2b8b8;border-bottom-width:2px;border-radius:6px;background:#fff;font-family:Consolas,Menlo,monospace;font-size:12.5px;color:#7a3a17;white-space:nowrap;}' +
        'table{width:100%;border-collapse:collapse;margin:0 0 16px;font-size:14.5px;}' +
        'th,td{text-align:left;padding:10px 13px;border-bottom:1px solid #f2d8b8;vertical-align:top;}' +
        'th{background:#fff0d4;color:#9a5a3c;font-weight:600;font-size:13px;}' +
        '.footer{margin-top:52px;padding-top:22px;border-top:1px solid #f2d8b8;text-align:center;color:#b08868;font-size:13px;}' +
        '@media print{body{background:#fff;}.doc{padding:0;max-width:none;}.qa,.tip{break-inside:avoid;}}' +
        '@media(max-width:640px){.doc{padding:28px 20px 40px;}.cover h1{font-size:24px;}h2{font-size:18px;}}';

        var body = '<div class="cover"><h1>岁窦工具箱 · 帮助文档（V3.0.10.1 国庆特别版）</h1>' +
          '<p class="sub">新手教程 · 常见问题 · 工具小贴士 · 快捷键 · 数据说明</p>' +
          '<span class="ver">3.0.10.1 国庆特别版（2026.10）</span></div>' +

          '<h2>一、快速开始</h2><ol>' +
          '<li><b>找到你要的工具</b>：首页「热门应用」可直接进入常用工具；进入任意工具页后，<b>左侧会显示分类侧边栏</b>，按「健康与运动 / 创作工坊 / 收藏与记录 / 计算与数据 / 时间与生活 / AI 与开发 / 实用工具」七大分类排列，当前工具高亮显示。V3.0 起，全站以中国红 + 金色为主题色，国庆版新增「表格填入器」「幸运转盘」「抛硬币模拟器」「反应速度测试」「中国车牌一览表」「饮水量计算」「倒数日」七款工具。</li>' +
          '<li><b>用搜索框快速定位</b>：顶部搜索框支持按工具名称和关键词检索。输入「睡眠」「运动」「鞋码」「血压」「表格」等词会自动跳转到「应用」页并筛出相关工具。</li>' +
          '<li><b>不登录也能直接使用</b>：默认是「本地模式」，所有数据保存在你自己的浏览器里，不需要注册。</li>' +
          '<li><b>登录后开启云端同步与 AI</b>：点击右上角「登录」注册账号后，数据会同步到云端，换设备登录同一账号即可继续使用。</li>' +
          '<li><b>养成备份的习惯</b>：在「设置 → 数据管理」里点「导出全部数据（JSON）」即可下载一份完整备份。</li>' +
          '<li><b>健康数据仅供参考</b>：BMI、睡眠时长、心率 / 血糖 / 血压判定、运动热量估算、鞋码推荐等均为参考性质，<b>不能替代专业医疗意见</b>，如有不适请及时就医。</li>' +
          '</ol>' +

          '<h2>二、常见问题</h2>' +
          '<div class="qa"><p class="q">V3.0.10.1国庆特别版相比 V2.3.2 改了什么？</p><div class="a">' +
          '<p><b>V3.0 主要做了两件事</b>：一是界面全面焕新，二是新增多款实用工具与导航结构调整。</p>' +
          '<p><b>界面方面</b>：① 全站主题色改为中国红 + 金色（国庆版）；② 首页 Hero 换成红金渐变并加了柔光装饰；③ 工具卡、热门卡悬停细节重做；④ 计算器、时钟、代码编辑器三处深色区改为深墨绿；⑤ 表单 focus 光圈、子标签激活态统一换色。</p>' +
          '<p>同时，<b>所有数据展示色保持不变</b>：统计图、词云、小说章节类型分布、BMI 分段、体感温度风险条、生命体征状态、音乐平台品牌色等，依然是原来的多色方案，确保数据一眼可辨。</p>' +
          '<p><b>新增工具方面</b>（共 7 款）：</p>' +
          '<p>① 「创作工坊」新增<b>表格填入器</b>：五档填图表格，支持多图拖拽、跨格移动，可自定义标题并勾选是否导出标题，导出 2 倍分辨率 PNG。</p>' +
          '<p>② 「实用工具」新增<b>幸运转盘</b>：可自定义 2-12 个选项与权重（1-100），六套主题，结果自动记录。</p>' +
          '<p>③ 「实用工具」新增<b>抛硬币模拟器</b>：单次 3D 翻转，批量最多 10000 次，统计正反占比与连续记录。</p>' +
          '<p>④ 「实用工具」新增<b>反应速度测试</b>：6 次取平均，7 档评级，历史自动保存，不支持键盘。</p>' +
          '<p>⑤ 「实用工具」新增<b>中国车牌一览表</b>：按七大地理大区浏览车牌代码，含特殊车牌，支持实时搜索。</p>' +
          '<p>⑥ 「健康与运动」新增<b>饮水量计算</b>：按体重、活动量、气温估算每日饮水量，含分时段参考。</p>' +
          '<p>⑦ 「实用工具」新增<b>倒数日</b>：内置 10 种常见节日，实时显示距下一个节日的天数，可查 2024-2036 年日期。</p>' +
          '<p><b>结构与导航方面</b>：① 面包屑升级为左侧固定侧边栏，按七大分类重新梳理；② 新增「实用工具」分类；③ 首页新增国庆倒计时卡片；④ 顶部新增通知铃铛。</p>' +
          '<p>原有数据、操作方式、其他工具入口均无变化，无需迁移。</p>' +
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
          '<p>登录后每天有固定的免费额度。运动热量估算、健康数据分析、随机灵感 AI 生成、起名器等同样计入该额度。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">AI 每天能用多少次？额度什么时候重置？</p><div class="a">' +
          '<p>每个账号每天有固定的免费调用次数，AI 助手聊天页会实时显示今日已用次数。</p>' +
          '<p>额度按<b>自然日</b>重置，当天的使用量不会累计到第二天。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">忘记密码了怎么办？</p><div class="a">' +
          '<p>在登录页点击「忘记密码？」，输入注册邮箱后我们会发送一封重置密码的邮件。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">怎么修改用户名和头像？</p><div class="a">' +
          '<p>登录后进入「设置 → 个人资料」，可以上传头像（自动压缩到 180px 以内）和修改用户名。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">上传的图片会不会占用很多空间？</p><div class="a">' +
          '<p>所有图片在上传前都会自动压缩：头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px。</p>' +
          '<p>「表格填入器」的图片只在当前页面内存中使用，导出后不会占用浏览器存储空间。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">V2.3.1 相比 V2.3 改了什么？（历史版本）</p><div class="a">' +
          '<p><b>只调整了工具的分类归属，没有新增或删除任何功能。</b>分类从四类重组为六类：① 健康与运动、② 创作工坊、③ 收藏与记录、④ 计算与数据、⑤ 时间与生活、⑥ AI 与开发。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">V2.3.2 相比 V2.3.1 改了什么？（历史版本）</p><div class="a">' +
          '<p>V2.3.2 新增了四款工具：时间戳转换、二维码生成、图片压缩、体感温度与运动风险。同时优化了二维码模块，修复了本地文件协议下的导出兼容性。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">「健康管理」都能做什么？鞋码在哪？</p><div class="a">' +
          '<p><b>BMI 计算</b>：输入身高、体重得到 BMI 数值、分级与理想体重区间。</p>' +
          '<p><b>鞋码计算</b>：V2.3.1 从数学计算迁入，输入脚长与年龄给出多国鞋码推荐。</p>' +
          '<p><b>睡眠记录</b>：录入入睡 / 起床时间自动算时长，绘制近 30 天睡眠曲线。</p>' +
          '<p><b>生命体征</b>：可录入心率、血糖、血压，系统自动判定，并可交给 AI 做趋势解读。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">睡眠记录怎么算跨夜时长？</p><div class="a">' +
          '<p>若起床时间早于入睡时间，系统会判定为跨夜，自动加 24 小时再相减。例如 23:30 入睡、07:00 起床，睡眠时长为 7 小时 30 分。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">「运动记录」的热量估算准不准？</p><div class="a">' +
          '<p>系统会先基于个人信息做基础估算；勾选「让 AI 辅助估算」后，AI 会结合运动类型、时长、强度给出更细化的参考区间。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">鞋码计算为什么需要「年龄」？</p><div class="a">' +
          '<p>儿童与青少年的脚部仍在发育，同一脚长在成人码与童码中对应关系不同。输入年龄后，系统会区分成人码表与童鞋码表。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">「随机灵感」的 AI 生成会消耗额度吗？</p><div class="a">' +
          '<p>会。<b>本地随机</b>（点上方卡片）不消耗额度，随时可用；<b>AI 批量生成</b>会调用一次 AI 请求，计入当日额度，且需要登录。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">「起名器 / 对话生成器 / 时间线 / 灵感速记」为什么不在 AI 助手里了？</p><div class="a">' +
          '<p>因为它们的本质是<b>创作工具</b>，只是部分功能借助 AI 实现。从 V2.3.1 起它们归入「创作工坊」，与小说助手、人物印象表、表格填入器并列。</p>' +
          '<p>其中时间线、灵感速记和表格填入器<b>完全不依赖 AI</b>，本地即可使用；起名器和对话生成器需要登录后才能调用 AI。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">歌曲收藏能直接试听吗？</p><div class="a">' +
          '<p>不能。本工具只记录歌曲信息与歌词，并提供四大平台的搜索 / 直链跳转，播放需要到对应平台进行。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">日历为什么只能查看 2026 年 10 月到 2036 年 12 月？</p><div class="a">' +
          '<p>这是当前版本设定的可查看范围，超出范围的月份在年份 / 月份下拉框中会被禁用。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">代码编辑器安全吗？支持哪些语言？</p><div class="a">' +
          '<p>JavaScript 模式运行在带有 sandbox 属性的 iframe 中，无法访问本页面的数据和存储，相对安全。</p>' +
          '<p>当前支持 JavaScript 实时运行与 Markdown 实时渲染两种模式。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">点了导出按钮却找不到文件？</p><div class="a">' +
          '<p>所有导出（JSON 备份、CSV、docx、TXT、HTML、PNG）都通过浏览器的下载功能保存到默认下载目录。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">误删或清空的数据还能恢复吗？</p><div class="a">' +
          '<p>不能。工具箱不保存历史版本，已清空且没有备份的数据无法找回。执行「清空全部数据」之前请务必先导出备份。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">页面显示异常、按钮点不动怎么办？</p><div class="a">' +
          '<p>可以依次尝试：① 刷新页面；② 检查网络；③ 换用 Chrome / Edge / Safari 等现代浏览器。</p>' +
          '</div></div>' +
          '<div class="qa"><p class="q">「表格填入器」的图片怎么移动？</p><div class="a">' +
          '<p>表格里的图片可以直接拖到其他单元格；也可以拖回下方素材区，重新分配。点击图片右上角的 × 可以删除。</p>' +
          '<p>如果先点击下方素材区的某张图，再点击表格单元格，也能直接放入。导出前还可以勾选是否导出标题。</p>' +
          '</div></div>' +

          '<h2>三、工具小贴士</h2>' +
          '<div class="tip"><b>健康管理</b>共四个子模块：BMI 计算、鞋码计算、睡眠记录、生命体征。</div>' +
          '<div class="tip"><b>运动记录</b>先填好个人信息，再添加运动。状态可选「计划」或「已记录」，AI 可辅助估算热量，可导出 Word 与 PNG。</div>' +
          '<div class="tip"><b>体感温度</b>结合温湿度风速计算体感温度，自动切换酷热/风寒模型，给出户外运动风险与建议。</div>' +
          '<div class="tip"><b>冥想练习</b>四种呼吸节奏可选：4-7-8 助眠放松、箱式呼吸专注前稳定、等长呼吸最易上手、深度放松适合睡前。圆形随呼吸节律放大缩小，可开 / 关提示音。</div>' +
          '<div class="tip"><b>饮水量计算</b>输入体重、年龄，选择性别、活动量与气温，按「体重 × 35ml × 各系数」估算每日建议饮水量，含分时段参考。结果仅供参考，不能替代专业医嘱。</div>' +
          '<div class="tip"><b>数学计算</b>包含计算器（普通 / 专家）与单位换算（8 大类）两个模块。BMI 与鞋码已迁至健康管理。</div>' +
          '<div class="tip"><b>文章分析</b>字数统计按字符计算；词频分析中文按双字组切分，可切换停用词过滤。</div>' +
          '<div class="tip"><b>小说助手</b>章节分类（前言 / 正文 / 番外 / 附录 / 后记 / 作者的话）、字数统计图，可导出 TXT 与 HTML。</div>' +
          '<div class="tip"><b>人物印象表</b>支持 AI 生成小传，结果可一键插入表单。</div>' +
          '<div class="tip"><b>表格填入器</b>把图片拖进「夯 / 顶级 / 人上人 / NPC / 拉完了」五个档位，支持多图、跨格移动。可自定义标题并勾选是否导出标题，最终导出为高清 PNG。适合做主观评价图、榜单图。</div>' +
          '<div class="tip"><b>时间线</b>纯本地工具，按时间顺序记录事件，支持分类与排序。</div>' +
          '<div class="tip"><b>起名器 / 对话生成器</b>需要登录后调用 AI。</div>' +
          '<div class="tip"><b>随机灵感</b>本地随机不耗额度；AI 批量生成会一次给 3 / 6 / 10 条，并自动避开已生成过的内容。</div>' +
          '<div class="tip"><b>灵感速记</b>纯本地工具，支持标签与全文搜索。</div>' +
          '<div class="tip"><b>地点收藏</b>国内填到门牌号，国外写到城市或地标即可。</div>' +
          '<div class="tip"><b>我的日历</b>点击日期格子添加安排，可导出当月图片。</div>' +
          '<div class="tip"><b>我的记账本</b>多币种，按币种汇总，可导出 CSV。</div>' +
          '<div class="tip"><b>畅想画布</b>支持鼠标与触屏书写，导出 1400 × 900 高清 PNG。</div>' +
          '<div class="tip"><b>代码编辑器</b>JavaScript 沙箱运行，console.log 输出显示在预览下方；Markdown 实时渲染。</div>' +
          '<div class="tip"><b>JSON 格式化</b>格式化 / 压缩 / 转义，语法错误定位到行列；Ctrl / ⌘ + Enter 一键格式化。</div>' +
          '<div class="tip"><b>图片压缩</b>本地浏览器压缩，支持质量滑块、目标大小、格式切换，原图与压缩后并排对比。</div>' +
          '<div class="tip"><b>二维码生成</b>文本 / 网址 / 电话 / WiFi 生成二维码，支持 Logo 与参数调节，导出 PNG 与 SVG。</div>' +
          '<div class="tip"><b>幸运转盘</b>每个选项可设置权重（1-100），权重越大扇区越宽，六套主题可选，结果自动记录。</div>' +
          '<div class="tip"><b>抛硬币模拟器</b>单次 3D 翻转，批量最多 10000 次，统计正反占比与连续记录。</div>' +
          '<div class="tip"><b>反应速度测试</b>6 次取平均，7 档评级，不支持键盘，鼠标 / 触摸均可。</div>' +
          '<div class="tip"><b>中国车牌一览表</b>按七大地理大区浏览车牌代码，支持省份 / 城市 / 代码搜索。</div>' +
          '<div class="tip"><b>倒数日</b>内置 10 种常见节日，实时显示距下一个节日的天数，可查 2024-2036 年日期。</div>' +
          '<div class="tip"><b>汇率换算</b>内置参考汇率，离线可用；可联网更新当日参考值。结果为参考性质，实际以银行成交价为准。</div>' +

          '<h2>四、快捷键速查</h2>' +
          '<table><thead><tr><th style="width:130px;">场景</th><th>按键</th></tr></thead><tbody>' +
          '<tr><td>数学计算 · 计算器</td><td><span class="kbd">0-9</span><span class="kbd">+</span><span class="kbd">-</span><span class="kbd">*</span><span class="kbd">/</span><span class="kbd">(</span><span class="kbd">)</span><span class="kbd">.</span><span class="kbd">%</span><span class="kbd">^</span><br>求值：<span class="kbd">Enter</span> 或 <span class="kbd">=</span>　退格：<span class="kbd">Backspace</span>　清空：<span class="kbd">Esc</span></td></tr>' +
          '<tr><td>代码编辑器</td><td><span class="kbd">Tab</span> 插入两个空格缩进<br>立即运行 / 渲染：<span class="kbd">Ctrl</span> / <span class="kbd">⌘</span> + <span class="kbd">Enter</span></td></tr>' +
          '<tr><td>AI 聊天</td><td>发送消息：<span class="kbd">Ctrl</span> / <span class="kbd">⌘</span> + <span class="kbd">Enter</span></td></tr>' +
          '<tr><td>随机灵感</td><td>关键词输入框中按 <span class="kbd">Enter</span> 直接触发生成</td></tr>' +
          '<tr><td>JSON 格式化</td><td><span class="kbd">Ctrl</span> / <span class="kbd">⌘</span> + <span class="kbd">Enter</span> 一键格式化（2 空格缩进）</td></tr>' +
          '</tbody></table>' +

          '<h2>五、数据与隐私</h2>' +
          '<div class="tip"><b>本地模式</b>数据保存在浏览器 localStorage，不会上传到任何服务器；浏览器上限一般约 5 MB。</div>' +
          '<div class="tip"><b>云端模式</b>登录后数据通过 Supabase 同步，密码由 Supabase Auth 加密处理。</div>' +
          '<div class="tip"><b>图片压缩</b>头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px，上传前自动压缩以节省空间。「表格填入器」的图片仅在当前页面内存中使用。</div>' +
          '<div class="tip"><b>导出格式</b>JSON（完整备份）、CSV（记账）、docx（歌曲、运动记录）、TXT / HTML（小说）、PNG（日历、影视、画布、运动、睡眠曲线、表格填入器）。</div>' +

          '<h2>六、联系与反馈</h2>' +
          '<ul>' +
          '<li><b>微博</b>：@岁窦工作室</li>' +
          '<li><b>邮箱</b>：q13052830801@163.com</li>' +
          '<li><b>版本</b>：3.0.10.1 国庆特别版</li>' +
          '</ul>' +

          '<div class="footer">岁窦工具箱 · 帮助文档（V3.0.10.1 国庆特别版）<br>导出时间：' + dateStr + '　|　2026© 岁窦制作</div>';

        return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">' +
          '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
          '<title>岁窦工具箱 · 帮助文档（V3.0.10.1 国庆特别版）</title><style>' + css + '</style></head><body>' +
          '<div class="doc">' + body + '</div></body></html>';
      }

      /* ============================================================
         五、生成 Markdown 帮助文档
         ============================================================ */
      function buildMd() {
        var d = new Date();
        var dateStr = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
        return [
          '# 岁窦工具箱 · 帮助文档（V3.0.10.1 国庆特别版）', '',
          '> 新手教程 · 常见问题 · 工具小贴士 · 快捷键 · 数据说明  ',
          '> 版本：V3.0.10.1 国庆特别版（2026.10）', '', '---', '',

          '## 一、快速开始', '',
          '1. **找到你要的工具**：首页「热门应用」可直接进入常用工具；进入任意工具页后，**左侧会显示分类侧边栏**，按「健康与运动 / 创作工坊 / 收藏与记录 / 计算与数据 / 时间与生活 / AI 与开发 / 实用工具」七大分类排列，当前工具高亮显示。V3.0 起，全站以中国红 + 金色为主题色，国庆版新增「表格填入器」「幸运转盘」「抛硬币模拟器」「反应速度测试」「中国车牌一览表」「饮水量计算」「倒数日」七款工具。',
          '2. **用搜索框快速定位**：顶部搜索框支持按工具名称和关键词检索。',
          '3. **不登录也能直接使用**：默认是「本地模式」，所有数据保存在你自己的浏览器里。',
          '4. **登录后开启云端同步与 AI**：点击右上角「登录」注册账号后，数据会同步到云端。',
          '5. **养成备份的习惯**：在「设置 → 数据管理」里点「导出全部数据（JSON）」即可下载完整备份。',
          '6. **健康数据仅供参考**：BMI、睡眠时长、心率 / 血糖 / 血压判定、运动热量估算、鞋码推荐等均为参考性质，**不能替代专业医疗意见**。', '',

          '## 二、常见问题', '',
          '### Q1. V3.0.10.1国庆特别版相比 V2.3.2 改了什么？',
          '**V3.0 主要做了两件事**：一是界面全面焕新，二是新增多款实用工具与导航结构调整。',
          '',
          '**界面方面**：① 全站主题色改为中国红 + 金色（国庆版）；② 首页 Hero 换成红金渐变并加了柔光装饰；③ 工具卡、热门卡悬停细节重做；④ 计算器、时钟、代码编辑器三处深色区改为深墨绿；⑤ 表单 focus 光圈、子标签激活态统一换色。',
          '',
          '同时，**所有数据展示色保持不变**：统计图、词云、小说章节类型分布、BMI 分段、体感温度风险条、生命体征状态、音乐平台品牌色等，依然是原来的多色方案。',
          '',
          '**新增工具方面**（共 7 款）：',
          '',
          '- 「创作工坊」新增**表格填入器**：五档填图表格，支持多图拖拽、跨格移动，可自定义标题并勾选是否导出标题，导出 2 倍分辨率 PNG。',
          '- 「实用工具」新增**幸运转盘**：可自定义 2-12 个选项与权重（1-100），六套主题，结果自动记录。',
          '- 「实用工具」新增**抛硬币模拟器**：单次 3D 翻转，批量最多 10000 次，统计正反占比与连续记录。',
          '- 「实用工具」新增**反应速度测试**：6 次取平均，7 档评级，历史自动保存，不支持键盘。',
          '- 「实用工具」新增**中国车牌一览表**：按七大地理大区浏览车牌代码，含特殊车牌，支持实时搜索。',
          '- 「健康与运动」新增**饮水量计算**：按体重、活动量、气温估算每日饮水量，含分时段参考。',
          '- 「实用工具」新增**倒数日**：内置 10 种常见节日，实时显示距下一个节日的天数，可查 2024-2036 年日期。',
          '',
          '**结构与导航方面**：① 面包屑升级为左侧固定侧边栏，按七大分类重新梳理；② 新增「实用工具」分类；③ 首页新增国庆倒计时卡片；④ 顶部新增通知铃铛。',
          '',
          '原有数据、操作方式、其他工具入口均无变化，无需迁移。',
          '',
          '### Q2. 数据保存在哪里？会不会丢？',
          '不登录时，所有数据保存在你浏览器的 localStorage 中（键名以 `suidou-` 开头），刷新或关闭页面都不会丢失。但**清除浏览器缓存、更换设备 / 浏览器、使用无痕模式**都会导致数据丢失，建议定期导出 JSON 备份。', '',
          '### Q3. 换了一台设备，怎么把数据搬过去？',
          '- **方式一（推荐）**：注册并登录账号 → 在设置页点「上传本地数据到云端」→ 另一台设备登录同一账号后点「从云端拉取数据」。',
          '- **方式二**：在旧设备导出 JSON 备份文件，在新设备通过「设置 → 导入数据」恢复。', '',
          '### Q4. 本地模式和云端模式有什么区别？',
          '- **本地模式**：数据只存在你自己的浏览器里，不上传服务器，无需登录。',
          '- **云端模式**：登录后数据同步到 Supabase，多设备共用同一份数据；AI 相关功能也只对登录用户开放。', '',
          '### Q5. 为什么 AI 功能提示「请先登录」？',
          'AI 请求需要通过你的登录凭证转发到服务端进行鉴权和额度统计，因此必须先登录才能使用。', '',
          '### Q6. AI 每天能用多少次？额度什么时候重置？',
          '每个账号每天有固定的免费调用次数，AI 助手聊天页会实时显示今日已用次数。额度按**自然日**重置。', '',
          '### Q7. 忘记密码了怎么办？',
          '在登录页点击「忘记密码？」，输入注册邮箱后我们会发送一封重置密码的邮件。', '',
          '### Q8. 怎么修改用户名和头像？',
          '登录后进入「设置 → 个人资料」，可以上传头像和修改用户名。', '',
          '### Q9. 上传的图片会不会占用很多空间？',
          '所有图片在上传前都会自动压缩：头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px。「表格填入器」的图片只在当前页面内存中使用，导出后不会占用浏览器存储空间。', '',
          '### Q10. V2.3.1 相比 V2.3 改了什么？（历史版本）',
          '**只调整了工具的分类归属，没有新增或删除任何功能。** 分类从四类重组为六类：① 健康与运动、② 创作工坊、③ 收藏与记录、④ 计算与数据、⑤ 时间与生活、⑥ AI 与开发。', '',
          '### Q11. V2.3.2 相比 V2.3.1 改了什么？（历史版本）',
          'V2.3.2 新增了四款工具：时间戳转换、二维码生成、图片压缩、体感温度与运动风险。同时优化了二维码模块，修复了本地文件协议下的导出兼容性。', '',
          '### Q12. 「健康管理」都能做什么？鞋码在哪？',
          '- **BMI 计算**：输入身高、体重得到 BMI 数值、分级与理想体重区间。',
          '- **鞋码计算**：V2.3.1 从数学计算迁入，输入脚长与年龄给出多国鞋码推荐。',
          '- **睡眠记录**：录入入睡 / 起床时间自动算时长，绘制近 30 天睡眠曲线。',
          '- **生命体征**：可录入心率、血糖、血压，可交给 AI 做趋势解读。', '',
          '### Q13. 睡眠记录怎么算跨夜时长？',
          '若起床时间早于入睡时间，系统会判定为跨夜，自动加 24 小时再相减。若入睡与起床完全相同，会视为 0 分钟并拒绝保存。', '',
          '### Q14. 「运动记录」的热量估算准不准？',
          '系统会先基于个人信息做基础估算；勾选「让 AI 辅助估算」后，AI 会结合运动类型、时长、强度给出更细化的参考区间。', '',
          '### Q15. 鞋码计算为什么需要「年龄」？',
          '儿童与青少年的脚部仍在发育，输入年龄后系统会区分成人码表与童鞋码表。', '',
          '### Q16. 「随机灵感」的 AI 生成会消耗额度吗？',
          '会。**本地随机**（点上方卡片）不消耗额度；**AI 批量生成**会调用一次 AI 请求，计入当日额度，且需要登录。', '',
          '### Q17. 「起名器 / 对话生成器 / 时间线 / 灵感速记」为什么不在 AI 助手里了？',
          '因为它们的本质是**创作工具**，只是部分功能借助 AI 实现。从 V2.3.1 起它们归入「创作工坊」。其中时间线、灵感速记和表格填入器**完全不依赖 AI**。', '',
          '### Q18. 歌曲收藏能直接试听吗？',
          '不能。本工具只记录歌曲信息与歌词，并提供四大平台的搜索 / 直链跳转。', '',
          '### Q19. 日历为什么只能查看 2026 年 10 月到 2036 年 12 月？',
          '这是当前版本设定的可查看范围，超出范围的月份在年份 / 月份下拉框中会被禁用。', '',
          '### Q20. 代码编辑器安全吗？支持哪些语言？',
          'JavaScript 模式运行在带有 `sandbox` 属性的 iframe 中，无法访问本页面的数据和存储，相对安全。', '',
          '### Q21. 点了导出按钮却找不到文件？',
          '所有导出都通过浏览器的下载功能保存到默认下载目录。检查浏览器是否拦截了下载。', '',
          '### Q22. 误删或清空的数据还能恢复吗？',
          '不能。工具箱不保存历史版本，已清空且没有备份的数据无法找回。', '',
          '### Q23. 页面显示异常、按钮点不动怎么办？',
          '可以依次尝试：① 刷新页面；② 检查网络；③ 换用 Chrome / Edge / Safari 等现代浏览器。', '',
          '### Q24. 「表格填入器」的图片怎么移动？',
          '表格里的图片可以直接拖到其他单元格；也可以拖回下方素材区，重新分配。点击图片右上角的 × 可以删除。如果先点击下方素材区的某张图，再点击表格单元格，也能直接放入。导出前还可以勾选是否导出标题。', '',

          '## 三、工具小贴士', '',
          '- **健康管理**：BMI 计算 + 鞋码计算 + 睡眠记录 + 生命体征四合一。',
          '- **运动记录**：先填个人信息，再添加运动。状态可选「计划」或「已记录」。',
          '- **体感温度**：结合温湿度风速计算体感温度，自动切换酷热 / 风寒模型。',
          '- **冥想练习**：4-7-8 / 箱式 / 等长 / 深度放松四种呼吸节奏可选，圆形随呼吸节律缩放。',
          '- **饮水量计算**：按体重、活动量、气温估算每日建议饮水量，含分时段参考。',
          '- **数学计算**：计算器（普通 / 专家）+ 单位换算（8 大类）。BMI 与鞋码已迁至健康管理。',
          '- **文章分析**：字数统计按字符计算；词频分析中文按双字组切分。',
          '- **小说助手**：章节分类、字数统计图，可导出 TXT 与 HTML。',
          '- **人物印象表**：支持 AI 生成小传，结果可一键插入表单。',
          '- **表格填入器**：把图片拖进「夯 / 顶级 / 人上人 / NPC / 拉完了」五个档位，支持多图、跨格移动。可自定义标题并勾选是否导出标题，最终导出为高清 PNG。适合做主观评价图、榜单图。',
          '- **时间线**：纯本地工具，按时间顺序记录事件。',
          '- **起名器 / 对话生成器**：需要登录后调用 AI。',
          '- **随机灵感**：本地随机不耗额度；AI 批量生成会一次给 3 / 6 / 10 条。',
          '- **灵感速记**：纯本地工具，支持标签与全文搜索。',
          '- **我的日历**：点击日期格子添加安排，可导出当月图片。',
          '- **我的记账本**：多币种，按币种汇总，可导出 CSV。',
          '- **畅想画布**：支持鼠标与触屏书写，导出 1400 × 900 高清 PNG。',
          '- **代码编辑器**：JavaScript 沙箱运行，Markdown 实时渲染。',
          '- **JSON 格式化**：格式化 / 压缩 / 转义，语法错误定位到行列。',
          '- **图片压缩**：本地浏览器压缩，支持质量滑块、目标大小、格式切换，原图与压缩后并排对比。',
          '- **二维码生成**：文本 / 网址 / 电话 / WiFi 生成二维码，支持 Logo 与参数调节，导出 PNG 与 SVG。',
          '- **幸运转盘**：每个选项可设权重（1-100），权重越大扇区越宽，六套主题可选。',
          '- **抛硬币模拟器**：单次 3D 翻转，批量最多 10000 次，统计正反占比与连续记录。',
          '- **反应速度测试**：6 次取平均，7 档评级，不支持键盘，鼠标 / 触摸均可。',
          '- **中国车牌一览表**：按七大地理大区浏览车牌代码，支持省份 / 城市 / 代码搜索。',
          '- **倒数日**：内置 10 种常见节日，实时显示距下一个节日的天数，可查 2024-2036 年日期。',
          '- **汇率换算**：内置参考汇率，离线可用；可联网更新当日参考值。结果为参考性质。', '',

          '## 四、快捷键速查', '',
          '| 场景 | 按键 |',
          '| --- | --- |',
          '| 数学计算 · 计算器 | `0-9` `+` `-` `*` `/` `(` `)` `.` `%` `^`；`Enter` / `=` 求值；`Backspace` 退格；`Esc` 清空 |',
          '| 代码编辑器 | `Tab` 缩进两个空格；`Ctrl` / `⌘` + `Enter` 立即运行或渲染 |',
          '| AI 聊天 | `Ctrl` / `⌘` + `Enter` 发送消息 |',
          '| 随机灵感 | 关键词输入框中按 `Enter` 直接触发生成 |',
          '| JSON 格式化 | `Ctrl` / `⌘` + `Enter` 一键格式化（2 空格缩进） |', '',

          '## 五、数据与隐私', '',
          '- **本地模式**：数据保存在浏览器 localStorage，不上传服务器，上限约 5 MB。',
          '- **云端模式**：登录后通过 Supabase 同步，密码由 Supabase Auth 加密处理。',
          '- **图片压缩**：头像 180px、人物 400px、小说封面 600px、地点 / 影视 / 运动 800px。「表格填入器」的图片仅在页面内存中使用。',
          '- **导出格式**：JSON、CSV、docx、TXT / HTML、PNG（含表格填入器）。', '',

          '## 六、联系与反馈', '',
          '- 微博：@岁窦工作室',
          '- 邮箱：q13052830801@163.com',
          '- 版本：V3.0.10.1 国庆特别版', '',
          '---', '',
          '*岁窦工具箱 · 帮助文档（V3.0.10.1 国庆特别版）　|　导出时间：' + dateStr + '　|　2026© 岁窦制作*', ''
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
          children: [new D.TextRun({ text: '岁窦工具箱 · 帮助文档（V3.0.10.1 国庆特别版）', bold: true, size: 44, font: FONT, color: '8e0000' })],
          alignment: D.AlignmentType.CENTER,
          spacing: { before: 600, after: 200 }
        }));
        children.push(new D.Paragraph({
          children: [new D.TextRun({ text: '新手教程 · 常见问题 · 工具小贴士 · 快捷键 · 数据说明', size: 22, font: FONT, color: '9a5a3c' })],
          alignment: D.AlignmentType.CENTER,
          spacing: { after: 120 }
        }));
        children.push(new D.Paragraph({
          children: [new D.TextRun({ text: 'V3.0.10.1 国庆特别版（2026.10）', size: 22, font: FONT, color: '8e0000', bold: true })],
          alignment: D.AlignmentType.CENTER,
          spacing: { after: 400 },
          border: { bottom: { color: 'c62828', space: 6, style: D.BorderStyle.SINGLE, size: 12 } }
        }));

        function H1(text) {
          return new D.Paragraph({
            children: [new D.TextRun({ text: text, bold: true, size: 30, font: FONT, color: '8e0000' })],
            spacing: { before: 400, after: 200 },
            border: { left: { color: 'c62828', space: 8, style: D.BorderStyle.SINGLE, size: 24 } },
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
                color: r.color || '374151'
              });
            }),
            spacing: { after: opts.after !== undefined ? opts.after : 120, line: 340 },
            indent: opts.indent
          });
        }

        children.push(H1('一、快速开始'));
        [
          ['找到你要的工具', '首页「热门应用」可直接进入常用工具；进入任意工具页后，左侧会显示分类侧边栏，按「健康与运动 / 创作工坊 / 收藏与记录 / 计算与数据 / 时间与生活 / AI 与开发 / 实用工具」七大分类排列，当前工具高亮显示。V3.0 起，全站以中国红 + 金色为主题色，国庆版新增「表格填入器」「幸运转盘」「抛硬币模拟器」「反应速度测试」「中国车牌一览表」「饮水量计算」「倒数日」七款工具。'],
          ['用搜索框快速定位', '顶部搜索框支持按工具名称和关键词检索。'],
          ['不登录也能直接使用', '默认是「本地模式」，所有数据保存在你自己的浏览器里。'],
          ['登录后开启云端同步与 AI', '点击右上角「登录」注册账号后，数据会同步到云端。'],
          ['养成备份的习惯', '在「设置 → 数据管理」里点「导出全部数据（JSON）」即可下载完整备份。'],
          ['健康数据仅供参考', 'BMI、睡眠时长、心率 / 血糖 / 血压判定、运动热量估算、鞋码推荐等均为参考性质，不能替代专业医疗意见。']
        ].forEach(function (s, i) {
          children.push(Runs([
            { text: (i + 1) + '. ', bold: true, color: '8e0000' },
            { text: s[0] + '：', bold: true, color: '1c1f23' },
            { text: s[1] }
          ]));
        });

        children.push(H1('二、常见问题'));
        var faqs = [
          ['V3.0.10.1国庆特别版相比 V2.3.2 改了什么？', [
            'V3.0 主要做了两件事：一是界面全面焕新，二是新增多款实用工具与导航结构调整。',
            '界面方面：① 全站主题色改为中国红 + 金色（国庆版）；② 首页 Hero 换成红金渐变并加了柔光装饰；③ 工具卡、热门卡悬停细节重做；④ 计算器、时钟、代码编辑器三处深色区改为深墨绿；⑤ 表单 focus 光圈、子标签激活态统一换色。',
            '同时，所有数据展示色保持不变：统计图、词云、小说章节类型分布、BMI 分段、体感温度风险条、生命体征状态、音乐平台品牌色等，依然是原来的多色方案。',
            '新增工具方面（共 7 款）：① 「创作工坊」新增表格填入器；② 「实用工具」新增幸运转盘；③ 「实用工具」新增抛硬币模拟器；④ 「实用工具」新增反应速度测试；⑤ 「实用工具」新增中国车牌一览表；⑥ 「健康与运动」新增饮水量计算；⑦ 「实用工具」新增倒数日。',
            '结构与导航方面：① 面包屑升级为左侧固定侧边栏，按七大分类重新梳理；② 新增「实用工具」分类；③ 首页新增国庆倒计时卡片；④ 顶部新增通知铃铛。'
          ]],
          ['数据保存在哪里？会不会丢？', [
            '不登录时，所有数据保存在你浏览器的 localStorage 中（键名以 suidou- 开头），刷新或关闭页面都不会丢失。',
            '但清除浏览器缓存、更换设备 / 浏览器、使用无痕模式都会导致数据丢失，建议定期导出 JSON 备份。'
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
          ['V2.3.1 相比 V2.3 改了什么？（历史版本）', [
            '只调整了工具的分类归属，没有新增或删除任何功能。分类从四类重组为六类：① 健康与运动、② 创作工坊、③ 收藏与记录、④ 计算与数据、⑤ 时间与生活、⑥ AI 与开发。'
          ]],
          ['V2.3.2 相比 V2.3.1 改了什么？（历史版本）', [
            'V2.3.2 新增了四款工具：时间戳转换、二维码生成、图片压缩、体感温度与运动风险。同时优化了二维码模块，修复了本地文件协议下的导出兼容性。'
          ]],
          ['「健康管理」都能做什么？鞋码在哪？', [
            'BMI 计算：输入身高、体重得到 BMI 数值、分级与理想体重区间。',
            '鞋码计算：V2.3.1 从数学计算迁入，输入脚长与年龄给出多国鞋码推荐。',
            '睡眠记录：录入入睡 / 起床时间自动算时长，绘制近 30 天睡眠曲线。',
            '生命体征：可录入心率、血糖、血压，可交给 AI 做趋势解读。'
          ]],
          ['睡眠记录怎么算跨夜时长？', [
            '若起床时间早于入睡时间，系统会判定为跨夜，自动加 24 小时再相减。若入睡与起床完全相同，会视为 0 分钟并拒绝保存。'
          ]],
          ['「运动记录」的热量估算准不准？', [
            '系统会先基于个人信息做基础估算；勾选「让 AI 辅助估算」后，AI 会结合运动类型、时长、强度给出更细化的参考区间。'
          ]],
          ['鞋码计算为什么需要「年龄」？', [
            '儿童与青少年的脚部仍在发育，输入年龄后系统会区分成人码表与童鞋码表。'
          ]],
          ['「随机灵感」的 AI 生成会消耗额度吗？', [
            '会。本地随机（点上方卡片）不消耗额度；AI 批量生成会调用一次 AI 请求，计入当日额度，且需要登录。'
          ]],
          ['「起名器 / 对话生成器 / 时间线 / 灵感速记」为什么不在 AI 助手里了？', [
            '因为它们的本质是创作工具，只是部分功能借助 AI 实现。从 V2.3.1 起它们归入「创作工坊」。其中时间线、灵感速记和表格填入器完全不依赖 AI。'
          ]],
          ['歌曲收藏能直接试听吗？', [
            '不能。本工具只记录歌曲信息与歌词，并提供四大平台的搜索 / 直链跳转。'
          ]],
          ['日历为什么只能查看 2026 年 10 月到 2036 年 12 月？', [
            '这是当前版本设定的可查看范围，超出范围的月份在年份 / 月份下拉框中会被禁用。'
          ]],
          ['代码编辑器安全吗？支持哪些语言？', [
            'JavaScript 模式运行在带有 sandbox 属性的 iframe 中，无法访问本页面的数据和存储，相对安全。'
          ]],
          ['点了导出按钮却找不到文件？', [
            '所有导出都通过浏览器的下载功能保存到默认下载目录。检查浏览器是否拦截了下载。'
          ]],
          ['误删或清空的数据还能恢复吗？', [
            '不能。工具箱不保存历史版本，已清空且没有备份的数据无法找回。'
          ]],
          ['页面显示异常、按钮点不动怎么办？', [
            '可以依次尝试：① 刷新页面；② 检查网络；③ 换用 Chrome / Edge / Safari 等现代浏览器。'
          ]],
          ['「表格填入器」的图片怎么移动？', [
            '表格里的图片可以直接拖到其他单元格；也可以拖回下方素材区，重新分配。点击图片右上角的 × 可以删除。',
            '如果先点击下方素材区的某张图，再点击表格单元格，也能直接放入。导出前还可以勾选是否导出标题。'
          ]]
        ];
        faqs.forEach(function (f, i) {
          children.push(new D.Paragraph({
            children: [
              new D.TextRun({ text: 'Q' + (i + 1) + '. ', bold: true, size: 24, font: FONT, color: '8e0000' }),
              new D.TextRun({ text: f[0], bold: true, size: 24, font: FONT, color: '1c1f23' })
            ],
            spacing: { before: 200, after: 100 },
            indent: { left: 160 }
          }));
          f[1].forEach(function (line) {
            children.push(new D.Paragraph({
              children: [new D.TextRun({ text: line, size: 22, font: FONT, color: '4b5563' })],
              spacing: { after: 100, line: 340 },
              indent: { left: 360 }
            }));
          });
        });

        children.push(H1('三、工具小贴士'));
        [
          ['健康管理', 'BMI 计算 + 鞋码计算 + 睡眠记录 + 生命体征四合一。'],
          ['运动记录', '先填个人信息，再添加运动。状态可选「计划」或「已记录」。'],
          ['体感温度', '结合温湿度风速计算体感温度，自动切换酷热 / 风寒模型。'],
          ['冥想练习', '4-7-8 / 箱式 / 等长 / 深度放松四种呼吸节奏可选，圆形随呼吸节律缩放。'],
          ['饮水量计算', '按体重、活动量、气温估算每日建议饮水量，含分时段参考。'],
          ['数学计算', '计算器（普通 / 专家）+ 单位换算（8 大类）。BMI 与鞋码已迁至健康管理。'],
          ['文章分析', '字数统计按字符计算；词频分析中文按双字组切分。'],
          ['小说助手', '章节分类、字数统计图，可导出 TXT 与 HTML。'],
          ['人物印象表', '支持 AI 生成小传，结果可一键插入表单。'],
          ['表格填入器', '把图片填入「夯 / 顶级 / 人上人 / NPC / 拉完了」五档表格，支持多图、跨格移动、拖回素材区重新分配。可自定义标题并勾选是否导出标题，最终导出 2 倍分辨率高清 PNG。'],
          ['时间线', '纯本地工具，按时间顺序记录事件。'],
          ['起名器 / 对话生成器', '需要登录后调用 AI。'],
          ['随机灵感', '本地随机不耗额度；AI 批量生成会一次给 3 / 6 / 10 条。'],
          ['灵感速记', '纯本地工具，支持标签与全文搜索。'],
          ['我的日历', '点击日期格子添加安排，可导出当月图片。'],
          ['我的记账本', '多币种，按币种汇总，可导出 CSV。'],
          ['畅想画布', '支持鼠标与触屏书写，导出 1400 × 900 高清 PNG。'],
          ['代码编辑器', 'JavaScript 沙箱运行，Markdown 实时渲染。'],
          ['图片压缩', '本地浏览器压缩，支持质量滑块、目标大小、格式切换，原图与压缩后并排对比。'],
          ['二维码生成', '文本 / 网址 / 电话 / WiFi 生成二维码，支持 Logo 与参数调节，导出 PNG 与 SVG。'],
          ['幸运转盘', '每个选项可设权重（1-100），权重越大扇区越宽，六套主题可选。'],
          ['抛硬币模拟器', '单次 3D 翻转，批量最多 10000 次，统计正反占比与连续记录。'],
          ['反应速度测试', '6 次取平均，7 档评级，不支持键盘，鼠标 / 触摸均可。'],
          ['中国车牌一览表', '按七大地理大区浏览车牌代码，支持省份 / 城市 / 代码搜索。'],
          ['倒数日', '内置 10 种常见节日，实时显示距下一个节日的天数，可查 2024-2036 年日期。'],
          ['汇率换算', '内置参考汇率，离线可用；可联网更新当日参考值。结果为参考性质，实际以银行成交价为准。'],
          ['JSON 格式化', '格式化 / 压缩 / 转义，语法错误定位到行列。']
        ].forEach(function (t) {
          children.push(Runs([
            { text: '• ', color: '8e0000', bold: true, size: 24 },
            { text: t[0] + '：', bold: true, color: '8e0000' },
            { text: t[1] }
          ]));
        });

        children.push(H1('四、快捷键速查'));
        var keyRows = [
          ['数学计算 · 计算器', '0-9   +   -   *   /   (   )   .   %   ^      求值：Enter 或 =　退格：Backspace　清空：Esc'],
          ['代码编辑器', 'Tab 插入两个空格缩进      立即运行 / 渲染：Ctrl / ⌘ + Enter'],
          ['AI 聊天', '发送消息：Ctrl / ⌘ + Enter'],
          ['随机灵感', '关键词输入框中按 Enter 直接触发生成'],
          ['JSON 格式化', 'Ctrl / ⌘ + Enter 一键格式化（2 空格缩进）']
        ];
        children.push(new D.Table({
          width: { size: 100, type: D.WidthType.PERCENTAGE },
          rows: [
            new D.TableRow({
              tableHeader: true,
              children: [
                new D.TableCell({
                  width: { size: 25, type: D.WidthType.PERCENTAGE },
                  shading: { type: D.ShadingType.CLEAR, fill: 'fff0d4', color: 'auto' },
                  children: [new D.Paragraph({
                    children: [new D.TextRun({ text: '场景', bold: true, size: 22, font: FONT, color: '9a5a3c' })]
                  })]
                }),
                new D.TableCell({
                  width: { size: 75, type: D.WidthType.PERCENTAGE },
                  shading: { type: D.ShadingType.CLEAR, fill: 'fff0d4', color: 'auto' },
                  children: [new D.Paragraph({
                    children: [new D.TextRun({ text: '按键', bold: true, size: 22, font: FONT, color: '9a5a3c' })]
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
                    children: [new D.TextRun({ text: row[0], bold: true, size: 22, font: FONT, color: '1c1f23' })]
                  })]
                }),
                new D.TableCell({
                  width: { size: 75, type: D.WidthType.PERCENTAGE },
                  children: [new D.Paragraph({
                    children: [new D.TextRun({ text: row[1], size: 22, font: FONT, color: '4b5563' })]
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
          ['图片压缩', '头像 180px、人物图片 400px、小说封面 600px、地点 / 影视 / 运动图片 800px。「表格填入器」的图片仅在页面内存中使用。'],
          ['导出格式', 'JSON（完整备份）、CSV（记账）、docx（歌曲、运动记录）、TXT / HTML（小说）、PNG（日历、影视、画布、运动、睡眠曲线、表格填入器）。']
        ].forEach(function (t) {
          children.push(Runs([
            { text: '• ', color: '8e0000', bold: true, size: 24 },
            { text: t[0] + '：', bold: true, color: '8e0000' },
            { text: t[1] }
          ]));
        });

        children.push(H1('六、联系与反馈'));
        [
          ['微博', '@岁窦工作室'],
          ['邮箱', 'q13052830801@163.com'],
          ['版本', 'V3.0.10.1 国庆特别版（2026.10）']
        ].forEach(function (t) {
          children.push(Runs([
            { text: '• ', color: '8e0000', bold: true, size: 24 },
            { text: t[0] + '：', bold: true, color: '8e0000' },
            { text: t[1] }
          ]));
        });

        var dd = new Date();
        var dateStr = dd.getFullYear() + '-' +
          String(dd.getMonth() + 1).padStart(2, '0') + '-' +
          String(dd.getDate()).padStart(2, '0');
        children.push(new D.Paragraph({
          children: [new D.TextRun({
            text: '岁窦工具箱 · 帮助文档（V3.0.10.1 国庆特别版）　|　导出时间：' + dateStr + '　|　2026© 岁窦制作',
            size: 20, font: FONT, color: '9ca3af'
          })],
          alignment: D.AlignmentType.CENTER,
          spacing: { before: 600 },
          border: { top: { color: 'f2d8b8', space: 12, style: D.BorderStyle.SINGLE, size: 6 } }
        }));

        try {
          var doc = new D.Document({
            creator: '岁窦工具箱',
            title: '岁窦工具箱 · 帮助文档（V3.0.10.1 国庆特别版）',
            description: '岁窦工具箱 V3.0 焕新版帮助文档',
            styles: {
              default: {
                document: { run: { font: FONT, size: 22 } }
              }
            },
            sections: [{
              properties: {
                page: { margin: { top: 1100, bottom: 1100, left: 1100, right: 1100 } }
              },
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

      console.log('[帮助] 帮助页脚本已加载（V3.0）');
    })();