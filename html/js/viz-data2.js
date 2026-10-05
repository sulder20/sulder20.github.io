/* ============================================================
   生活可视化 · 数据文件 · 岁窦工具箱 V4.2
   category: 'biology' | 'geography' | 'others'
   ============================================================ */
window.LIFE_VISUALS = [

/* ============================================================
   ═══════════════ 生物可视化（7） ═══════════════
   ============================================================ */


{
  id: 'bio-blood-circulation',
  category: 'biology',
  name: '血液循环',
  tags: ['心脏', '体循环', '肺循环'],
  desc: '心脏搏动推动血液在体循环和肺循环中流动，完成氧气和养料的运输。',
  detail: '体循环：左心室 → 主动脉 → 全身毛细血管 → 上下腔静脉 → 右心房。肺循环：右心室 → 肺动脉 → 肺部毛细血管 → 肺静脉 → 左心房。含氧血呈鲜红色，缺氧血呈暗红色。',
  duration: 12,
  params: [],
  init: function (state) {
    state.cells = [];
    state.emitTimer = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    /* 颜色 */
    var RED = '#d63a3a';       /* 含氧血（鲜红） */
    var RED_LIGHT = 'rgba(214, 58, 58, .35)';
    var BLUE = '#6d5a8c';      /* 缺氧血（暗紫） */
    var BLUE_LIGHT = 'rgba(109, 90, 140, .35)';

    /* ---------- 心脏 ---------- */
    var heartCx = 360, heartCy = 260;
    var heartRx = 90, heartRy = 105;

    /* 心脏外形 */
    ctx.beginPath();
    ctx.ellipse(heartCx, heartCy, heartRx, heartRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f5d0d0';
    ctx.fill();
    ctx.strokeStyle = '#a84a4a';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* 十字分隔线 */
    ctx.beginPath();
    ctx.moveTo(heartCx, heartCy - heartRy + 5);
    ctx.lineTo(heartCx, heartCy + heartRy - 5);
    ctx.moveTo(heartCx - heartRx + 5, heartCy);
    ctx.lineTo(heartCx + heartRx - 5, heartCy);
    ctx.strokeStyle = 'rgba(168, 74, 74, .5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 四个腔（用圆角矩形/圆表示） */
    function drawChamber(cx, cy, r, fill, stroke, label, textColor) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy);
      ctx.textBaseline = 'alphabetic';
    }

    /* 从观察者角度看：左边是右心房右心室（缺氧血），右边是左心房左心室（含氧血） */
    /* 右上：右心房 */
    drawChamber(325, 225, 26, 'rgba(109, 90, 140, .85)', '#4a3a6a', '右房', '#fff');
    /* 右下：右心室 */
    drawChamber(325, 295, 26, 'rgba(109, 90, 140, .85)', '#4a3a6a', '右室', '#fff');
    /* 左上：左心房 */
    drawChamber(395, 225, 26, 'rgba(214, 58, 58, .85)', '#8f2a2a', '左房', '#fff');
    /* 左下：左心室 */
    drawChamber(395, 295, 26, 'rgba(214, 58, 58, .85)', '#8f2a2a', '左室', '#fff');

    /* 心脏内部的箭头：右房 → 右室，左房 → 左室 */
    function arrowDown(x, y1, y2, color) {
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4, y2 - 6);
      ctx.lineTo(x + 4, y2 - 6);
      ctx.lineTo(x, y2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
    arrowDown(325, 250, 270, '#4a3a6a');
    arrowDown(395, 250, 270, '#8f2a2a');

    /* 心脏搏动动画 */
    var beat = Math.sin(elapsed * Math.PI * 2 * 1.2);
    var beatAlpha = 0.15 + Math.max(0, beat) * 0.25;
    ctx.beginPath();
    ctx.ellipse(heartCx, heartCy, heartRx + 8, heartRy + 8, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(214, 58, 58, ' + beatAlpha + ')';
    ctx.lineWidth = 4;
    ctx.stroke();

    /* ---------- 全身毛细血管网（上方） ---------- */
    var bodyNetX = 360, bodyNetY = 75;
    /* 画一个波浪线环绕的矩形表示毛细血管网 */
    ctx.beginPath();
    ctx.ellipse(bodyNetX, bodyNetY, 70, 32, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 224, 224, .7)';
    ctx.fill();
    ctx.strokeStyle = '#d68a8a';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 网纹 */
    ctx.strokeStyle = 'rgba(214, 58, 58, .35)';
    ctx.lineWidth = 1;
    for (var wi = 0; wi < 5; wi++) {
      var wy = bodyNetY - 20 + wi * 10;
      ctx.beginPath();
      for (var wx = -60; wx <= 60; wx += 6) {
        var wyy = wy + Math.sin(wx / 8 + wi) * 3;
        if (wx === -60) ctx.moveTo(bodyNetX + wx, wyy);
        else ctx.lineTo(bodyNetX + wx, wyy);
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#8f2a2a';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('全身毛细血管网', bodyNetX, bodyNetY + 50);

    /* ---------- 肺部毛细血管网（下方） ---------- */
    var lungNetX = 360, lungNetY = 430;
    ctx.beginPath();
    ctx.ellipse(lungNetX, lungNetY, 70, 32, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(224, 224, 255, .7)';
    ctx.fill();
    ctx.strokeStyle = '#8a8acc';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(109, 90, 140, .35)';
    ctx.lineWidth = 1;
    for (var wi2 = 0; wi2 < 5; wi2++) {
      var wy2 = lungNetY - 20 + wi2 * 10;
      ctx.beginPath();
      for (var wx2 = -60; wx2 <= 60; wx2 += 6) {
        var wyy2 = wy2 + Math.sin(wx2 / 8 + wi2) * 3;
        if (wx2 === -60) ctx.moveTo(lungNetX + wx2, wyy2);
        else ctx.lineTo(lungNetX + wx2, wyy2);
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#4a3a6a';
    ctx.fillText('肺部毛细血管网', lungNetX, lungNetY + 50);

    /* ---------- 体循环路径（红） ---------- */
    /* 从左心室出发 → 主动脉向上 → 全身毛细血管网 → 上下腔静脉 → 右心房 */
    var bodyPath = {
      p0: { x: 420, y: 280 },   /* 左心室出口 */
      c1: { x: 590, y: 180 },   /* 主动脉曲线控制点 */
      p1: { x: 360, y: 75 },    /* 全身网入口（从右下进入） */
      c2: { x: 130, y: 180 },   /* 上下腔静脉控制点 */
      p2: { x: 300, y: 240 }    /* 右心房入口 */
    };
    /* 用两段二次贝塞尔 */
    function bodyPoint(t) {
      if (t < 0.5) {
        var tt = t * 2;
        var mt = 1 - tt;
        return {
          x: mt * mt * bodyPath.p0.x + 2 * mt * tt * bodyPath.c1.x + tt * tt * bodyPath.p1.x,
          y: mt * mt * bodyPath.p0.y + 2 * mt * tt * bodyPath.c1.y + tt * tt * bodyPath.p1.y
        };
      } else {
        var tt2 = (t - 0.5) * 2;
        var mt2 = 1 - tt2;
        return {
          x: mt2 * mt2 * bodyPath.p1.x + 2 * mt2 * tt2 * bodyPath.c2.x + tt2 * tt2 * bodyPath.p2.x,
          y: mt2 * mt2 * bodyPath.p1.y + 2 * mt2 * tt2 * bodyPath.c2.y + tt2 * tt2 * bodyPath.p2.y
        };
      }
    }

    /* 画体循环路径 */
    ctx.beginPath();
    for (var bt = 0; bt <= 1; bt += 0.01) {
      var bp = bodyPoint(bt);
      if (bt === 0) ctx.moveTo(bp.x, bp.y);
      else ctx.lineTo(bp.x, bp.y);
    }
    ctx.strokeStyle = RED_LIGHT;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    for (var bt2 = 0; bt2 <= 1; bt2 += 0.01) {
      var bp2 = bodyPoint(bt2);
      if (bt2 === 0) ctx.moveTo(bp2.x, bp2.y);
      else ctx.lineTo(bp2.x, bp2.y);
    }
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 主动脉方向箭头 */
    function drawPathArrow(t, color) {
      var p1 = bodyPoint(t);
      var p2 = bodyPoint(Math.min(1, t + 0.01));
      var ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      ctx.save();
      ctx.translate(p1.x, p1.y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }
    drawPathArrow(0.15, RED);
    drawPathArrow(0.4, RED);
    drawPathArrow(0.65, RED);
    drawPathArrow(0.85, RED);

    /* 文字标注：体循环 */
    ctx.fillStyle = RED;
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('体循环', 500, 40);

    /* ---------- 肺循环路径（紫） ---------- */
    var lungPath = {
      p0: { x: 300, y: 320 },   /* 右心室出口 */
      c1: { x: 130, y: 400 },   /* 肺动脉曲线控制点 */
      p1: { x: 360, y: 430 },   /* 肺部网入口（从左进入） */
      c2: { x: 590, y: 400 },   /* 肺静脉控制点 */
      p2: { x: 420, y: 240 }    /* 左心房入口 */
    };
    function lungPoint(t) {
      if (t < 0.5) {
        var tt = t * 2;
        var mt = 1 - tt;
        return {
          x: mt * mt * lungPath.p0.x + 2 * mt * tt * lungPath.c1.x + tt * tt * lungPath.p1.x,
          y: mt * mt * lungPath.p0.y + 2 * mt * tt * lungPath.c1.y + tt * tt * lungPath.p1.y
        };
      } else {
        var tt2 = (t - 0.5) * 2;
        var mt2 = 1 - tt2;
        return {
          x: mt2 * mt2 * lungPath.p1.x + 2 * mt2 * tt2 * lungPath.c2.x + tt2 * tt2 * lungPath.p2.x,
          y: mt2 * mt2 * lungPath.p1.y + 2 * mt2 * tt2 * lungPath.c2.y + tt2 * tt2 * lungPath.p2.y
        };
      }
    }

    /* 画肺循环路径 */
    ctx.beginPath();
    for (var lt = 0; lt <= 1; lt += 0.01) {
      var lp = lungPoint(lt);
      if (lt === 0) ctx.moveTo(lp.x, lp.y);
      else ctx.lineTo(lp.x, lp.y);
    }
    ctx.strokeStyle = BLUE_LIGHT;
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.beginPath();
    for (var lt2 = 0; lt2 <= 1; lt2 += 0.01) {
      var lp2 = lungPoint(lt2);
      if (lt2 === 0) ctx.moveTo(lp2.x, lp2.y);
      else ctx.lineTo(lp2.x, lp2.y);
    }
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 肺循环箭头 */
    function drawLungArrow(t, color) {
      var p1 = lungPoint(t);
      var p2 = lungPoint(Math.min(1, t + 0.01));
      var ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      ctx.save();
      ctx.translate(p1.x, p1.y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }
    drawLungArrow(0.15, BLUE);
    drawLungArrow(0.4, BLUE);
    drawLungArrow(0.65, BLUE);
    drawLungArrow(0.85, BLUE);

    /* 文字标注：肺循环 */
    ctx.fillStyle = BLUE;
    ctx.textAlign = 'left';
    ctx.fillText('肺循环', 200, 40);

    /* ---------- 血细胞沿路径流动 ---------- */
    state.emitTimer += dt;
    if (state.emitTimer > 0.3 && progress < 1) {
      state.emitTimer = 0;
      state.cells.push({ t: 0, type: 'body' });
      state.cells.push({ t: 0, type: 'lung' });
    }

    for (var ci = state.cells.length - 1; ci >= 0; ci--) {
      var c = state.cells[ci];
      c.t += dt * 0.12;
      if (c.t > 1) { state.cells.splice(ci, 1); continue; }

      var pos = c.type === 'body' ? bodyPoint(c.t) : lungPoint(c.t);
      var color = c.type === 'body' ? RED : BLUE;

      /* 血细胞：椭圆 + 中心凹陷（红细胞特征） */
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 7, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      /* 红细胞中心凹陷 */
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fill();
    }

    /* ---------- 左上角信息卡 ---------- */
    /* 半透明背景 */
    ctx.fillStyle = 'rgba(255, 253, 245, .92)';
    ctx.strokeStyle = 'rgba(180, 124, 0, .3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(20, 20, 260, 80, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('血液循环', 36, 48);

    ctx.font = '12.5px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = RED;
    ctx.fillText('● 体循环：含氧血（左心室 → 全身 → 右心房）', 36, 72);
    ctx.fillStyle = BLUE;
    ctx.fillText('● 肺循环：缺氧血（右心室 → 肺 → 左心房）', 36, 90);
  }
},

{
  id: 'bio-respiration',
  category: 'biology',
  name: '呼吸过程',
  tags: ['肺', '膈肌', '气体交换'],
  desc: '膈肌下降时胸腔扩大吸气，上升时胸腔缩小呼气。',
  detail: '吸气：肋间外肌和膈肌收缩 → 胸廓扩大 → 肺内压减小 → 空气进入肺。呼气：肋间外肌和膈肌舒张 → 胸廓缩小 → 肺内压增大 → 气体排出。肺泡与毛细血管之间通过扩散完成氧气和二氧化碳交换。',
  duration: 8,
  params: [
    { key: 'rate', label: '呼吸频率（次/分）', min: 6, max: 30, step: 1, default: 12 }
  ],
  init: function (state) { state.t = 0; },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;

    /* 呼吸节律 */
    var rate = params.rate;
    var breath = Math.sin(elapsed * rate / 60 * Math.PI * 2);
    var inhale = (breath + 1) / 2; /* 0-1，1 为吸气最大 */

    /* 胸腔轮廓 */
    var chestW = 180 + inhale * 40;
    var chestH = 220;

    /* 肺 */
    var lungW = 60 + inhale * 30;
    var lungH = 140 + inhale * 30;

    /* 左肺 */
    ctx.beginPath();
    ctx.ellipse(cx - 50, cy - 20, lungW * 0.6, lungH * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232, 168, 168, .75)';
    ctx.fill();
    ctx.strokeStyle = '#c17878';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 右肺 */
    ctx.beginPath();
    ctx.ellipse(cx + 50, cy - 20, lungW * 0.6, lungH * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* 气管 */
    ctx.beginPath();
    ctx.moveTo(cx, cy - 140);
    ctx.lineTo(cx, cy - 80);
    ctx.strokeStyle = '#8ba6c0';
    ctx.lineWidth = 8;
    ctx.stroke();
    /* 支气管 */
    ctx.beginPath();
    ctx.moveTo(cx, cy - 80);
    ctx.lineTo(cx - 40, cy - 40);
    ctx.moveTo(cx, cy - 80);
    ctx.lineTo(cx + 40, cy - 40);
    ctx.lineWidth = 5;
    ctx.stroke();

    /* 膈肌 */
    var diaY = cy + 110 - inhale * 30;
    var diaCurve = 30 - inhale * 20;
    ctx.beginPath();
    ctx.moveTo(cx - 110, diaY);
    ctx.quadraticCurveTo(cx, diaY + diaCurve, cx + 110, diaY);
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* 肋骨（简化） */
    ctx.strokeStyle = 'rgba(180, 124, 0, .35)';
    ctx.lineWidth = 1.5;
    for (var i = 0; i < 5; i++) {
      var y = cy - 90 + i * 32;
      var ribW = 130 + inhale * 15;
      ctx.beginPath();
      ctx.moveTo(cx - ribW, y);
      ctx.quadraticCurveTo(cx, y + 8, cx + ribW, y);
      ctx.stroke();
    }

    /* 气流箭头 */
    var flowSpeed = Math.abs(breath);
    var flowDir = breath > 0 ? 1 : -1;
    var numArrows = 4;
    for (var k = 0; k < numArrows; k++) {
      var offset = ((elapsed * 2 * flowDir + k * 0.25) % 1 + 1) % 1;
      var arrowY = cy - 160 + offset * 120;
      ctx.beginPath();
      ctx.moveTo(cx, arrowY);
      ctx.lineTo(cx, arrowY + 10 * flowDir);
      ctx.strokeStyle = 'rgba(74, 127, 181, ' + (0.3 + flowSpeed * 0.7) + ')';
      ctx.lineWidth = 3;
      ctx.stroke();
      /* 箭头头部 */
      ctx.beginPath();
      ctx.moveTo(cx - 5, arrowY + 10 * flowDir - 4 * flowDir);
      ctx.lineTo(cx + 5, arrowY + 10 * flowDir - 4 * flowDir);
      ctx.lineTo(cx, arrowY + 14 * flowDir);
      ctx.closePath();
      ctx.fillStyle = 'rgba(74, 127, 181, ' + (0.3 + flowSpeed * 0.7) + ')';
      ctx.fill();
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('呼吸过程', 20, 26);
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = breath > 0 ? '#4a7fb5' : '#c0524a';
    ctx.fillText(breath > 0 ? '▶ 吸气中（膈肌收缩、下降）' : '◀ 呼气中（膈肌舒张、上升）', 20, 50);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('呼吸频率：' + rate + ' 次/分', 20, 74);
  }
},

{
  id: 'bio-digestion',
  category: 'biology',
  name: '消化过程',
  tags: ['消化道', '消化腺', '吸收'],
  desc: '食物从口腔进入消化道，经过消化腺分泌的消化液分解，最终在小肠被吸收。',
  detail: '口腔：牙齿咀嚼 + 唾液淀粉酶分解淀粉。胃：胃酸 + 胃蛋白酶初步消化蛋白质。小肠：胰液、肠液、胆汁共同作用，是消化和吸收的主要场所。大肠：吸收水分，形成粪便。',
  duration: 10,
  params: [],
  init: function (state) { state.foodPos = 0; },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    /* 简化人体轮廓 */
    var cx = W / 2;
    ctx.beginPath();
    ctx.ellipse(cx, 80, 40, 50, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180, 124, 0, .25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 消化道路径 */
    var path = [
      { x: cx, y: 100, name: '口腔' },
      { x: cx, y: 140, name: '食管' },
      { x: cx - 20, y: 200, name: '胃' },
      { x: cx, y: 260, name: '小肠上' },
      { x: cx + 30, y: 320, name: '小肠下' },
      { x: cx + 10, y: 370, name: '大肠' },
      { x: cx, y: 420, name: '排出' }
    ];

    /* 绘制消化道 */
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (var i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = 'rgba(192, 82, 74, .4)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    /* 器官节点 */
    path.forEach(function (p, i) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 179, 1, .5)';
      ctx.fill();
      ctx.strokeStyle = '#b47c00';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#3a2a00';
      ctx.font = 'bold 11px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, p.x, p.y + 4);
    });

    /* 食物小球沿路径移动 */
    var t = progress * (path.length - 1);
    var idx = Math.floor(t);
    var f = t - idx;
    if (idx >= path.length - 1) idx = path.length - 2;
    var px = path[idx].x + (path[idx + 1].x - path[idx].x) * f;
    var py = path[idx].y + (path[idx + 1].y - path[idx].y) * f;

    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    var grad = ctx.createRadialGradient(px - 3, py - 3, 2, px, py, 9);
    grad.addColorStop(0, '#ffe9a8');
    grad.addColorStop(1, '#b47c00');
    ctx.fillStyle = grad;
    ctx.fill();

    /* 文字说明 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('食物消化路径', 20, 26);

    var stage = Math.min(path.length - 1, Math.floor(progress * path.length));
    var stageName = path[Math.min(stage, path.length - 1)].name;
    ctx.fillStyle = '#c0524a';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('当前位置：' + stageName, 20, 52);

    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('口腔 → 食管 → 胃 → 小肠 → 大肠', 20, 78);
  }
},

{
  id: 'bio-neuron',
  category: 'biology',
  name: '神经元与神经冲动',
  tags: ['神经元', '突触', '动作电位'],
  desc: '神经冲动沿轴突传导，通过突触传递到下一个神经元。',
  detail: '神经元由胞体、树突、轴突组成。静息状态细胞膜外正内负，兴奋时钠离子内流引起去极化形成动作电位。冲动到达突触前膜时释放神经递质，作用于突触后膜引起下一个神经元兴奋或抑制。',
  duration: 8,
  params: [],
  init: function (state) { state.pulse = -0.2; },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var y = H / 2;

    /* 神经元 1 */
    var n1x = 100;
    ctx.beginPath();
    ctx.arc(n1x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 179, 1, .6)';
    ctx.fill();
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 树突 */
    for (var i = 0; i < 5; i++) {
      var ang = -Math.PI / 2 + i * (Math.PI / 2) / 4 - Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(n1x + Math.cos(ang) * 30, y + Math.sin(ang) * 30);
      ctx.lineTo(n1x + Math.cos(ang) * 55, y + Math.sin(ang) * 55);
      ctx.strokeStyle = '#b47c00';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    /* 轴突 */
    var axStart = n1x + 30;
    var axEnd = W - 220;
    ctx.beginPath();
    ctx.moveTo(axStart, y);
    ctx.lineTo(axEnd, y);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* 髓鞘 */
    for (var k = 0; k < 8; k++) {
      var mx = axStart + (axEnd - axStart) * (k + 0.5) / 8;
      ctx.fillStyle = 'rgba(255, 244, 204, .9)';
      ctx.fillRect(mx - 12, y - 12, 24, 24);
      ctx.strokeStyle = '#c9a02b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(mx - 12, y - 12, 24, 24);
    }

    /* 神经元 2 */
    var n2x = W - 160;
    ctx.beginPath();
    ctx.arc(n2x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 179, 1, .6)';
    ctx.fill();
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 突触间隙 */
    ctx.fillStyle = 'rgba(168, 200, 239, .4)';
    ctx.fillRect(axEnd, y - 15, n2x - 30 - axEnd, 30);

    /* 神经冲动动画 */
    var pulseX = axStart + (axEnd - axStart) * progress;
    if (progress < 1) {
      var pulseGrad = ctx.createRadialGradient(pulseX, y, 5, pulseX, y, 40);
      pulseGrad.addColorStop(0, 'rgba(192, 82, 74, .9)');
      pulseGrad.addColorStop(1, 'rgba(192, 82, 74, 0)');
      ctx.fillStyle = pulseGrad;
      ctx.beginPath();
      ctx.arc(pulseX, y, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    /* 神经递质（突触后） */
    if (progress > 0.85) {
      var alpha = Math.min(1, (progress - 0.85) / 0.15);
      for (var m = 0; m < 6; m++) {
        var ang2 = m * Math.PI / 3;
        var dx = n2x + Math.cos(ang2) * 40;
        var dy = y + Math.sin(ang2) * 40;
        ctx.beginPath();
        ctx.arc(dx, dy, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(192, 82, 74, ' + alpha + ')';
        ctx.fill();
      }
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('神经元与神经冲动传导', 20, 26);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('胞体 → 轴突 → 突触 → 下一个神经元', 20, 50);
    ctx.fillText('进度：' + Math.round(progress * 100) + '%', 20, 72);
  }
},

{
  id: 'bio-mitosis',
  category: 'biology',
  name: '有丝分裂',
  tags: ['细胞分裂', '染色体'],
  desc: '一个细胞经过有丝分裂形成两个染色体数目相同的子细胞。',
  detail: '有丝分裂包括间期、前期、中期、后期、末期五个阶段。间期染色体复制；前期核膜解体、纺锤体形成；中期染色体排列在赤道板上；后期着丝点分裂、姐妹染色单体分离移向两极；末期形成两个子细胞。',
  duration: 10,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;

    /* 阶段 */
    var stage = Math.floor(progress * 5);
    var stageNames = ['间期', '前期', '中期', '后期', '末期'];

    /* 细胞膜 */
    var cellR = 100;
    ctx.beginPath();
    ctx.arc(cx, cy, cellR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180, 124, 0, .8)';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(255, 244, 204, .4)';
    ctx.fill();
    ctx.stroke();

    /* 核膜 */
    if (stage < 1 || stage === 4) {
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(138, 115, 64, .6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* 染色体位置 */
    function drawChromosome(x, y, angle, color) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      /* 两条姐妹染色单体 */
      ctx.beginPath();
      ctx.moveTo(-3, -15);
      ctx.lineTo(-3, 15);
      ctx.moveTo(3, -15);
      ctx.lineTo(3, 15);
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    var chrs = [];
    var numChr = 4;

    if (stage === 0) {
      /* 间期：染色体散乱 */
      for (var i = 0; i < numChr; i++) {
        var ang = i * Math.PI / 2 + 0.3;
        chrs.push({
          x: cx + Math.cos(ang) * 25,
          y: cy + Math.sin(ang) * 25,
          angle: ang * 2
        });
      }
    } else if (stage === 1) {
      /* 前期：染色体凝集、散乱 */
      var f1 = (progress - 0.2) / 0.2;
      for (var i = 0; i < numChr; i++) {
        var ang = i * Math.PI / 2 + 0.3;
        chrs.push({
          x: cx + Math.cos(ang) * (25 + f1 * 20),
          y: cy + Math.sin(ang) * (25 + f1 * 20),
          angle: ang * 2 + f1 * Math.PI / 4
        });
      }
    } else if (stage === 2) {
      /* 中期：排列在赤道板上 */
      for (var i = 0; i < numChr; i++) {
        var y = cy - 45 + i * 30;
        chrs.push({ x: cx, y: y, angle: 0 });
      }
    } else if (stage === 3) {
      /* 后期：着丝点分裂，移向两极 */
      var f3 = (progress - 0.6) / 0.2;
      for (var i = 0; i < numChr; i++) {
        var baseY = cy - 45 + i * 30;
        var move = f3 * 40;
        chrs.push({ x: cx - move, y: baseY, angle: -Math.PI / 2, color: '#c0524a' });
        chrs.push({ x: cx + move, y: baseY, angle: -Math.PI / 2, color: '#c0524a' });
      }
    } else {
      /* 末期：形成两个子细胞 */
      var f4 = (progress - 0.8) / 0.2;
      /* 细胞拉长 */
      ctx.beginPath();
      ctx.ellipse(cx, cy, cellR + f4 * 40, cellR - f4 * 15, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(180, 124, 0, .8)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(255, 244, 204, .4)';
      ctx.fill();
      ctx.stroke();

      /* 中间收窄 */
      if (f4 > 0.3) {
        var pinch = (f4 - 0.3) / 0.7;
        ctx.beginPath();
        ctx.moveTo(cx, cy - cellR + pinch * 20);
        ctx.lineTo(cx, cy + cellR - pinch * 20);
        ctx.strokeStyle = 'rgba(180, 124, 0, .5)';
        ctx.lineWidth = 2 + pinch * 2;
        ctx.stroke();
      }

      for (var i = 0; i < numChr; i++) {
        var baseY = cy - 45 + i * 30;
        chrs.push({ x: cx - 60, y: baseY, angle: -Math.PI / 2, color: '#c0524a' });
        chrs.push({ x: cx + 60, y: baseY, angle: -Math.PI / 2, color: '#c0524a' });
      }
    }

    chrs.forEach(function (c, i) {
      drawChromosome(c.x, c.y, c.angle, c.color || (i % 2 === 0 ? '#c0524a' : '#4a7fb5'));
    });

    /* 纺锤丝（中期、后期） */
    if (stage === 2 || stage === 3) {
      ctx.strokeStyle = 'rgba(74, 127, 181, .3)';
      ctx.lineWidth = 1;
      for (var i = 0; i < 6; i++) {
        var ang = i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(ang) * 80, cy - Math.sin(ang) * 80);
        ctx.lineTo(cx + Math.cos(ang) * 80, cy + Math.sin(ang) * 80);
        ctx.stroke();
      }
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('有丝分裂 · ' + stageNames[Math.min(stage, 4)], 20, 26);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('间期 → 前期 → 中期 → 后期 → 末期', 20, 50);
  }
},

{
  id: 'bio-dna',
  category: 'biology',
  name: 'DNA 双螺旋结构',
  tags: ['DNA', '双螺旋', '碱基配对'],
  desc: 'DNA 是双螺旋结构，两条链通过 A-T、G-C 碱基配对连接。',
  detail: 'DNA 由两条反向平行的脱氧核苷酸链盘绕成双螺旋。外侧是磷酸和脱氧核糖交替连接构成的基本骨架，内侧是碱基对。碱基互补配对原则：A 与 T 配对，G 与 C 配对。',
  duration: 10,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2;
    var cy = H / 2;
    var amplitude = 80;
    var turns = 3;

    /* 双螺旋两条链 */
    var points1 = [];
    var points2 = [];

    for (var y = -H / 2 + 40; y <= H / 2 - 40; y += 4) {
      var t = y / H;
      var phase = t * turns * Math.PI * 2 + elapsed * 1.5;
      var x1 = cx + Math.sin(phase) * amplitude;
      var x2 = cx + Math.sin(phase + Math.PI) * amplitude;
      points1.push({ x: x1, y: cy + y, phase: phase });
      points2.push({ x: x2, y: cy + y, phase: phase + Math.PI });
    }

    /* 碱基对（横线） */
    for (var i = 0; i < points1.length; i += 10) {
      var p1 = points1[i];
      var p2 = points2[i];

      /* 类型：A-T 或 G-C */
      var isAT = Math.floor(i / 10) % 2 === 0;
      var c1 = isAT ? '#c0524a' : '#4a7fb5';
      var c2 = isAT ? '#4a7fb5' : '#c0524a';

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = isAT ? 'rgba(192, 82, 74, .35)' : 'rgba(74, 127, 181, .35)';
      ctx.lineWidth = 3;
      ctx.stroke();

      /* 碱基小球 */
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = c1;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = c2;
      ctx.fill();
    }

    /* 两条主链 */
    [points1, points2].forEach(function (pts, idx) {
      ctx.beginPath();
      pts.forEach(function (p, i) {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = idx === 0 ? '#b47c00' : '#8a7340';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DNA 双螺旋结构', 20, 26);
    ctx.fillStyle = '#c0524a';
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('● A-T 碱基对', 20, 52);
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('● G-C 碱基对', 20, 74);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('两条链反向平行，通过碱基互补配对连接', 20, 98);
  }
},

{
  id: 'bio-photosynthesis',
  category: 'biology',
  name: '光合作用',
  tags: ['叶绿体', '光反应', '暗反应'],
  desc: '叶绿体吸收光能，把 CO₂ 和 H₂O 转化为有机物和 O₂。',
  detail: '光反应：在类囊体薄膜上进行，水光解产生 O₂ 和 [H]，同时生成 ATP。暗反应：在叶绿体基质中进行，CO₂ 被 C₅ 固定形成 C₃，再由 ATP 和 [H] 还原成糖类。总反应：6CO₂ + 6H₂O --光/叶绿体--> C₆H₁₂O₆ + 6O₂。',
  duration: 10,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;

    /* 叶绿体 */
    ctx.beginPath();
    ctx.ellipse(cx, cy, 200, 140, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(168, 212, 171, .45)';
    ctx.fill();
    ctx.strokeStyle = '#3f8f6b';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* 类囊体堆叠（基粒） */
    var granaPositions = [[-100, -40], [-40, 20], [40, -30], [100, 30], [0, -70]];
    granaPositions.forEach(function (pos) {
      for (var i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(cx + pos[0], cy + pos[1] + i * 10, 25, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(143, 181, 154, .8)';
        ctx.fill();
        ctx.strokeStyle = '#3f6b52';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    /* 光能箭头 */
    var sunX = W - 60, sunY = 40;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    var sunGrad = ctx.createRadialGradient(sunX - 5, sunY - 5, 3, sunX, sunY, 22);
    sunGrad.addColorStop(0, '#ffe9a8');
    sunGrad.addColorStop(1, '#f5b301');
    ctx.fillStyle = sunGrad;
    ctx.fill();

    /* 光能 -->
    var lightAlpha = 0.5 + Math.sin(elapsed * 3) * 0.3;
    for (var i = 0; i < 5; i++) {
      var ly = 40 + i * 25;
      ctx.beginPath();
      ctx.moveTo(sunX - 30, ly);
      ctx.lineTo(cx + 180, ly + 20);
      ctx.strokeStyle = 'rgba(245, 179, 1, ' + lightAlpha + ')';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* 输入：CO₂、H₂O */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CO₂', 60, cy);
    ctx.fillText('H₂O', 60, cy + 30);

    /* 输出：O₂、有机物 */
    ctx.fillText('O₂', W - 60, cy);
    ctx.fillText('糖类', W - 60, cy + 30);

    /* 输入箭头 */
    for (var j = 0; j < 3; j++) {
      var arrowT = (elapsed * 2 + j * 0.3) % 1;
      var startX = 90;
      var endX = cx - 200;
      var ax = startX + (endX - startX) * arrowT;
      ctx.beginPath();
      ctx.arc(ax, cy - 20, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#8ba6c0';
      ctx.fill();
    }

    /* 输出箭头 */
    for (var k = 0; k < 3; k++) {
      var arrowT2 = (elapsed * 2 + k * 0.3) % 1;
      var startX2 = cx + 200;
      var endX2 = W - 90;
      var ax2 = startX2 + (endX2 - startX2) * arrowT2;
      ctx.beginPath();
      ctx.arc(ax2, cy - 20, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f5b301';
      ctx.fill();
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('光合作用', 20, 26);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('6CO₂ + 6H₂O --光/叶绿体--> C₆H₁₂O₆ + 6O₂', 20, 50);
    ctx.fillStyle = '#3f6b52';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('光反应（类囊体）+ 暗反应（基质）', 20, 74);
  }
},

/* ============================================================
   ═══════════════ 地理可视化（6） ═══════════════
   ============================================================ */

{
  id: 'geo-water-cycle',
  category: 'geography',
  name: '水循环',
  tags: ['蒸发', '降水', '径流'],
  desc: '水在海洋、大气、陆地之间不断循环，包括蒸发、水汽输送、降水、径流等环节。',
  detail: '水循环有三种类型：海陆间循环（大循环）、陆地内循环、海上内循环。海陆间循环是最重要的循环，使陆地淡水得到补充。',
  duration: 10,
  params: [],
  init: function (state) { state.drops = []; state.timer = 0; },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    /* 天空 */
    var skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    skyGrad.addColorStop(0, '#a8c8ef');
    skyGrad.addColorStop(1, '#e0ecf5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.6);

    /* 海洋（左侧） */
    var seaGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
    seaGrad.addColorStop(0, '#4a7fb5');
    seaGrad.addColorStop(1, '#2c5282');
    ctx.fillStyle = seaGrad;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.7);
    ctx.lineTo(W * 0.5, H * 0.7);
    ctx.lineTo(W * 0.5, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    /* 山脉（右侧） */
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.7);
    ctx.lineTo(W * 0.7, H * 0.4);
    ctx.lineTo(W * 0.85, H * 0.65);
    ctx.lineTo(W, H * 0.5);
    ctx.lineTo(W, H);
    ctx.lineTo(W * 0.5, H);
    ctx.closePath();
    ctx.fillStyle = '#a8d4ab';
    ctx.fill();
    ctx.strokeStyle = '#3f6b52';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 云 */
    var cloudX = W * 0.5;
    var cloudY = H * 0.25;
    ctx.beginPath();
    ctx.arc(cloudX - 40, cloudY, 25, 0, Math.PI * 2);
    ctx.arc(cloudX, cloudY - 10, 32, 0, Math.PI * 2);
    ctx.arc(cloudX + 40, cloudY, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, .9)';
    ctx.fill();

    /* 蒸发（海洋 → 云） */
    state.timer += dt;
    if (state.timer > 0.15 && progress < 0.9) {
      state.timer = 0;
      state.drops.push({
        x: W * 0.25 + (Math.random() - 0.5) * 100,
        y: H * 0.7,
        type: 'evap',
        t: 0
      });
    }

    /* 降水（云 → 山脉） */
    if (state.timer === 0 && Math.random() < 0.6 && progress > 0.3 && progress < 0.95) {
      state.drops.push({
        x: cloudX + (Math.random() - 0.5) * 60,
        y: cloudY + 20,
        type: 'rain',
        t: 0
      });
    }

    /* 更新水滴 */
    for (var i = state.drops.length - 1; i >= 0; i--) {
      var d = state.drops[i];
      d.t += dt * 0.5;
      if (d.t > 1) { state.drops.splice(i, 1); continue; }

      var px, py;
      if (d.type === 'evap') {
        /* 从海洋上升到云 */
        px = d.x + (cloudX - d.x) * d.t * 0.6;
        py = d.y + (cloudY + 20 - d.y) * d.t;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(74, 127, 181, ' + (1 - d.t) + ')';
        ctx.fill();
      } else {
        /* 从云落到山脉 */
        px = d.x + (W * 0.7 - d.x) * d.t * 0.5;
        py = d.y + (H * 0.55 - d.y) * d.t;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + 6);
        ctx.strokeStyle = 'rgba(74, 127, 181, ' + (1 - d.t) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    /* 径流（山脉 → 海洋） */
    var flowOffset = (elapsed * 0.5) % 1;
    for (var j = 0; j < 5; j++) {
      var t = (flowOffset + j * 0.2) % 1;
      var fpx = W * 0.75 - (W * 0.75 - W * 0.4) * t;
      var fpy = H * 0.75 + Math.sin(t * Math.PI) * 20;
      ctx.beginPath();
      ctx.arc(fpx, fpy, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 127, 181, .7)';
      ctx.fill();
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('水循环', 20, 26);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('蒸发 → 水汽输送 → 降水 → 径流', 20, 50);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('海陆间循环 · 陆地内循环 · 海上内循环', 20, 74);
  }
},

{
  id: 'geo-atmospheric-circulation',
  category: 'geography',
  name: '大气环流',
  tags: ['三圈环流', '气压带', '风带'],
  desc: '地球表面形成七个气压带和六个风带，构成三圈环流。',
  detail: '赤道受热气流上升形成赤道低压带；30° 附近空气下沉形成副热带高压带；60° 附近冷暖气流交汇上升形成副极地低压带；极地冷空气下沉形成极地高压带。风从高压吹向低压，受地转偏向力影响形成信风、西风、极地东风。',
  duration: 10,
  params: [],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2 - 40;
    var cy = H / 2;
    var R = 180;

    /* ---------- 地球侧视图 ---------- */
    /* 用一组水平带表示纬度 */
    var bands = [
      { y: -1.00, lat: '90°N', type: 'H', name: '极地高压', color: '#c0524a' },
      { y: -0.75, lat: '60°N', type: 'L', name: '副极地低压', color: '#4a7fb5' },
      { y: -0.33, lat: '30°N', type: 'H', name: '副热带高压', color: '#c0524a' },
      { y: 0.00,  lat: '0°',   type: 'L', name: '赤道低压', color: '#4a7fb5' },
      { y: 0.33,  lat: '30°S', type: 'H', name: '副热带高压', color: '#c0524a' },
      { y: 0.75,  lat: '60°S', type: 'L', name: '副极地低压', color: '#4a7fb5' },
      { y: 1.00,  lat: '90°S', type: 'H', name: '极地高压', color: '#c0524a' }
    ];

    /* 地球背景圆 */
    ctx.beginPath();
    ctx.arc(cx, cy, R + 20, 0, Math.PI * 2);
    var earthGrad = ctx.createRadialGradient(cx - 60, cy - 60, 20, cx, cy, R + 20);
    earthGrad.addColorStop(0, 'rgba(232, 240, 250, .5)');
    earthGrad.addColorStop(1, 'rgba(200, 220, 240, .35)');
    ctx.fillStyle = earthGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(138, 115, 64, .5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 画气压带 */
    bands.forEach(function (b, i) {
      var bandY = cy + b.y * (R - 20);
      var bandW = R * 2 - 30;
      var bandH = 26;

      /* 气压带色块 */
      ctx.beginPath();
      ctx.rect(cx - bandW / 2, bandY - bandH / 2, bandW, bandH);
      var bandGrad = ctx.createLinearGradient(cx - bandW / 2, 0, cx + bandW / 2, 0);
      if (b.type === 'H') {
        bandGrad.addColorStop(0, 'rgba(192, 82, 74, .18)');
        bandGrad.addColorStop(1, 'rgba(192, 82, 74, .35)');
      } else {
        bandGrad.addColorStop(0, 'rgba(74, 127, 181, .18)');
        bandGrad.addColorStop(1, 'rgba(74, 127, 181, .35)');
      }
      ctx.fillStyle = bandGrad;
      ctx.fill();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      /* 标签 */
      ctx.fillStyle = b.color;
      ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.type + ' · ' + b.name, cx, bandY);

      /* 纬度 */
      ctx.fillStyle = '#8a7340';
      ctx.font = '11px Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(b.lat, cx + bandW / 2 + 8, bandY);
      ctx.textBaseline = 'alphabetic';
    });

    /* ---------- 三圈环流箭头 ---------- */
    /* 在气压带之间的空隙里画垂直气流和水平风 */
    var cellGap = R - 20;

    /* 三个环流圈：每个圈是一个闭合的循环 */
    /* 垂直气流（上升/下沉） */
    var verticalFlows = [
      { latFrom: -0.33, latTo: -0.15, direction: 'down' },  /* 30°N 副高下沉 */
      { latFrom: 0, latTo: -0.15, direction: 'up' },        /* 赤道上升 */
      { latFrom: -0.75, latTo: -0.55, direction: 'up' },    /* 60°N 副极地上升 */
      { latFrom: -1.0, latTo: -0.85, direction: 'down' },   /* 极地下沉 */
      { latFrom: 0.33, latTo: 0.15, direction: 'down' },
      { latFrom: 0, latTo: 0.15, direction: 'up' },
      { latFrom: 0.75, latTo: 0.55, direction: 'up' },
      { latFrom: 1.0, latTo: 0.85, direction: 'down' }
    ];

    verticalFlows.forEach(function (f, i) {
      /* 每个气压带间隙左右各画一个箭头（除赤道只有一个） */
      var xPositions = Math.abs(f.latFrom) < 0.1 ? [cx] : [cx - 60, cx + 60];
      xPositions.forEach(function (xx) {
        /* 动画偏移 */
        var offset = (elapsed * 1.2 + i * 0.3) % 1;
        if (f.direction === 'down') offset = 1 - offset;

        var y1 = cy + f.latFrom * cellGap;
        var y2 = cy + f.latTo * cellGap;
        var yMid = y1 + (y2 - y1) * offset;

        /* 淡色竖线 */
        ctx.beginPath();
        ctx.moveTo(xx, y1);
        ctx.lineTo(xx, y2);
        ctx.strokeStyle = 'rgba(180, 124, 0, .18)';
        ctx.lineWidth = 2;
        ctx.stroke();

        /* 箭头 */
        var dir = f.direction === 'down' ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(xx, yMid + dir * 6);
        ctx.lineTo(xx - 5, yMid - dir * 2);
        ctx.lineTo(xx + 5, yMid - dir * 2);
        ctx.closePath();
        ctx.fillStyle = '#b47c00';
        ctx.fill();
      });
    });

    /* ---------- 六个风带（水平箭头） ---------- */
    /* 在北半球，风向向右偏；南半球向左偏。我们用倾斜箭头表示 */
    var windBelts = [
      { y: -0.15, dir: 'right', name: '盛行西风' },     /* 30°N-60°N */
      { y: -0.55, dir: 'left', name: '东北信风' },       /* 0-30°N */
      { y: 0.15, dir: 'left', name: '东南信风' },        /* 0-30°S */
      { y: 0.55, dir: 'right', name: '盛行西风' },       /* 30°S-60°S */
      { y: -0.88, dir: 'left', name: '极地东风' },
      { y: 0.88, dir: 'left', name: '极地东风' }
    ];

    windBelts.forEach(function (w, i) {
      var y = cy + w.y * cellGap;
      var dir = w.dir === 'right' ? 1 : -1;
      var offset = (elapsed * 0.8 + i * 0.4) % 1;

      /* 3 个箭头横向排列 */
      for (var k = 0; k < 3; k++) {
        var baseX = cx - 100 + k * 100;
        var animX = baseX + dir * offset * 30;
        var animY = y + (k % 2 === 0 ? -2 : 2);

        /* 风向箭头（略倾斜，表示风的偏转） */
        ctx.beginPath();
        ctx.moveTo(animX - dir * 12, animY - 3);
        ctx.lineTo(animX + dir * 12, animY - 3);
        ctx.lineTo(animX + dir * 12, animY - 7);
        ctx.lineTo(animX + dir * 18, animY);
        ctx.lineTo(animX + dir * 12, animY + 7);
        ctx.lineTo(animX + dir * 12, animY + 3);
        ctx.lineTo(animX - dir * 12, animY + 3);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 179, 1, ' + (0.5 + offset * 0.4) + ')';
        ctx.fill();
      }
    });

    /* ---------- 图例 ---------- */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('大气环流（三圈环流）', 20, 28);

    ctx.fillStyle = '#c0524a';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('■ H 高压带（气流下沉）', 20, 52);
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('■ L 低压带（气流上升）', 20, 72);
    ctx.fillStyle = '#b47c00';
    ctx.fillText('▶ 风带方向（信风 / 西风 / 极地东风）', 20, 92);
  }
},

{
  id: 'geo-plate-tectonics',
  category: 'geography',
  name: '板块漂移',
  tags: ['大陆漂移', '板块构造', '泛大陆'],
  desc: '点击「播放」，看两亿年前的泛大陆如何一步步分裂、漂移成今天的七大洲。',
  detail: '1912 年魏格纳提出大陆漂移说。约 2 亿年前，地球上的大陆连成一片称为「泛大陆」，之后逐渐分裂、漂移，形成今天七大洲四大洋的格局。板块构造学说进一步解释了漂移的动力来源。',
  duration: 12,
  params: [],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2 + 10;

    /* progress：0 = 泛大陆（200 Ma），1 = 现代（0 Ma） */
    /* t 用于坐标插值：t=1 是泛大陆位置，t=0 是现代位置 */
    var t = 1 - progress;
    var year = Math.round(200 * t);

    /* ---------- 海洋背景 ---------- */
    var oceanGrad = ctx.createRadialGradient(cx - 80, cy - 80, 40, cx, cy, 260);
    oceanGrad.addColorStop(0, '#9bc9e8');
    oceanGrad.addColorStop(1, '#4a7fb5');
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fillStyle = oceanGrad;
    ctx.fill();

    /* 海洋上的细微波纹（静态装饰） */
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = 1;
    for (var wi = 0; wi < 4; wi++) {
      var wy = cy - 180 + wi * 120;
      ctx.beginPath();
      for (var wx = -180; wx <= 180; wx += 8) {
        var wyy = wy + Math.sin(wx / 30) * 4;
        if (wx === -180) ctx.moveTo(cx + wx, wyy);
        else ctx.lineTo(cx + wx, wyy);
      }
      ctx.stroke();
    }

    /* ---------- 大陆数据 ---------- */
    /* 每个大陆有 now（现代位置）和 past（泛大陆位置）两套顶点 */
    var continents = [
      {
        name: '北美',
        now: [[-140, -90], [-95, -110], [-60, -95], [-50, -55], [-70, -20], [-110, -30], [-135, -55]],
        past: [[-50, -100], [-10, -115], [20, -100], [25, -65], [5, -35], [-30, -45], [-55, -70]]
      },
      {
        name: '南美',
        now: [[-70, 40], [-35, 20], [-20, 55], [-25, 100], [-50, 130], [-70, 105], [-75, 70]],
        past: [[-30, 20], [10, 5], [25, 40], [20, 85], [-5, 115], [-25, 90], [-30, 55]]
      },
      {
        name: '欧洲',
        now: [[-10, -90], [30, -100], [55, -80], [50, -50], [30, -40], [0, -55]],
        past: [[-5, -95], [35, -105], [60, -85], [55, -55], [35, -45], [5, -60]]
      },
      {
        name: '非洲',
        now: [[0, -30], [45, -40], [60, -5], [55, 40], [30, 75], [5, 60], [-5, 15]],
        past: [[5, -20], [50, -30], [65, 5], [60, 50], [35, 85], [10, 70], [0, 25]]
      },
      {
        name: '亚洲',
        now: [[55, -100], [130, -95], [160, -60], [150, -15], [120, 10], [80, -10], [55, -45]],
        past: [[60, -105], [135, -100], [165, -65], [155, -20], [125, 5], [85, -15], [60, -50]]
      },
      {
        name: '大洋洲',
        now: [[125, 55], [165, 45], [175, 85], [140, 100], [120, 85]],
        past: [[130, 55], [170, 45], [180, 85], [145, 100], [125, 85]]
      },
      {
        name: '印度',
        now: [[75, -20], [95, -25], [100, -5], [90, 15], [72, 10]],
        past: [[35, -25], [55, -30], [60, -10], [50, 10], [32, 5]]
      },
      {
        name: '南极洲',
        now: [[-130, 130], [-40, 130], [50, 130], [80, 155], [20, 175], [-80, 170]],
        past: [[-60, 110], [20, 110], [70, 115], [80, 140], [20, 155], [-40, 150]]
      }
    ];

    /* ---------- 绘制大陆 ---------- */
    continents.forEach(function (c) {
      var pts = c.now.map(function (p, i) {
        var past = c.past[i];
        return [
          p[0] + (past[0] - p[0]) * t,
          p[1] + (past[1] - p[1]) * t
        ];
      });

      /* 大陆投影（海洋上的模糊倒影，增加层次感） */
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      pts.forEach(function (p, i) {
        var x = cx + p[0] * 1.15 + 6;
        var y = cy + p[1] * 1.15 + 8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = '#1a3a2a';
      ctx.fill();
      ctx.restore();

      /* 大陆主体 */
      ctx.beginPath();
      pts.forEach(function (p, i) {
        var x = cx + p[0] * 1.15;
        var y = cy + p[1] * 1.15;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      var landGrad = ctx.createLinearGradient(cx - 200, cy - 200, cx + 200, cy + 200);
      landGrad.addColorStop(0, '#b8d8a8');
      landGrad.addColorStop(1, '#8fb59a');
      ctx.fillStyle = landGrad;
      ctx.fill();
      ctx.strokeStyle = '#3f6b52';
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.stroke();

      /* 大陆名称（居中显示） */
      var centerX = 0, centerY = 0;
      pts.forEach(function (p) { centerX += p[0]; centerY += p[1]; });
      centerX = cx + (centerX / pts.length) * 1.15;
      centerY = cy + (centerY / pts.length) * 1.15;

      ctx.fillStyle = '#2a4a30';
      ctx.font = 'bold 11px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.name, centerX, centerY);
      ctx.textBaseline = 'alphabetic';
    });

    /* ---------- 左上角信息卡 ---------- */
    ctx.fillStyle = 'rgba(255, 253, 245, .93)';
    ctx.strokeStyle = 'rgba(180, 124, 0, .3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(20, 20, 280, 110, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('板块漂移', 36, 48);

    ctx.fillStyle = '#b47c00';
    ctx.font = 'bold 14px Consolas, monospace';
    ctx.fillText('距今 ' + year + ' 百万年前', 36, 72);

    /* 状态说明 */
    var status, statusColor;
    if (year >= 190) {
      status = '★ 泛大陆时期';
      statusColor = '#c0524a';
    } else if (year >= 120) {
      status = '★ 大陆开始分裂';
      statusColor = '#c47a2b';
    } else if (year >= 40) {
      status = '★ 大陆持续漂移';
      statusColor = '#3f8f6b';
    } else {
      status = '★ 接近现代格局';
      statusColor = '#4a7fb5';
    }
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(status, 36, 96);

    ctx.fillStyle = '#8a7340';
    ctx.font = '11.5px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('点「播放」看完整漂移过程', 36, 116);

    /* ---------- 底部时间轴刻度 ---------- */
    var timelineY = H - 32;
    var timelineX1 = 40;
    var timelineX2 = W - 40;

    ctx.beginPath();
    ctx.moveTo(timelineX1, timelineY);
    ctx.lineTo(timelineX2, timelineY);
    ctx.strokeStyle = 'rgba(138, 115, 64, .35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 刻度点：200 / 150 / 100 / 50 / 0 */
    [200, 150, 100, 50, 0].forEach(function (ma) {
      var x = timelineX2 - (ma / 200) * (timelineX2 - timelineX1);
      ctx.beginPath();
      ctx.arc(x, timelineY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#8a7340';
      ctx.fill();

      ctx.fillStyle = '#8a7340';
      ctx.font = '10px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ma + ' Ma', x, timelineY + 16);
    });

    /* 当前进度指示 */
    var curX = timelineX2 - ((1 - progress) * 0 + progress * (timelineX2 - timelineX1) * 0);
    /* progress 0 时是泛大陆（200 Ma），progress 1 时是现代（0 Ma） */
    var curX2 = timelineX2 - progress * (timelineX2 - timelineX1);
    ctx.beginPath();
    ctx.arc(curX2, timelineY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f5b301';
    ctx.fill();
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
},

{
  id: 'geo-moon-phases',
  category: 'geography',
  name: '月相变化',
  tags: ['月相', '月球', '朔望'],
  desc: '月球绕地球公转，太阳、地球、月球三者相对位置变化形成不同月相。',
  detail: '月相变化周期约 29.53 天（朔望月）。从朔（新月）到望（满月）再到朔，经历新月、蛾眉月、上弦月、盈凸月、满月、亏凸月、下弦月、残月八个阶段。',
  duration: 12,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;
    var R = 80;

    /* 月球绕地球位置（俯视） */
    var angle = progress * Math.PI * 2 - Math.PI / 2;
    var moonX = cx + Math.cos(angle) * 150;
    var moonY = cy + Math.sin(angle) * 150;

    /* 太阳光方向：从右向左 */
    /* 太阳在右侧，用箭头示意 */
    for (var i = 0; i < 6; i++) {
      var arrowY = cy - 120 + i * 48;
      ctx.beginPath();
      ctx.moveTo(W - 60, arrowY);
      ctx.lineTo(W - 150, arrowY);
      ctx.strokeStyle = 'rgba(245, 179, 1, .6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W - 150, arrowY);
      ctx.lineTo(W - 160, arrowY - 5);
      ctx.lineTo(W - 160, arrowY + 5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(245, 179, 1, .6)';
      ctx.fill();
    }

    /* 地球 */
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    var earthGrad = ctx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, 40);
    earthGrad.addColorStop(0, '#8bbce4');
    earthGrad.addColorStop(1, '#4a7fb5');
    ctx.fillStyle = earthGrad;
    ctx.fill();

    /* 月球轨道 */
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(138, 115, 64, .3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 月球（俯视图，显示被照亮的一面） */
    ctx.beginPath();
    ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#4a4a4a';
    ctx.fill();

    /* 计算月球被照亮的部分（朝向太阳的一面） */
    var sunAngle = Math.atan2(cy - moonY, W - moonX);
    ctx.beginPath();
    ctx.arc(moonX, moonY, 18, sunAngle - Math.PI / 2, sunAngle + Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = '#f5f5f5';
    ctx.fill();

    /* 从地球看到的月相（右下角大图） */
    var phaseCX = W - 100;
    var phaseCY = H - 100;
    var phaseR = 45;

    /* 计算月相角 */
    var phaseAngle = angle + Math.PI / 2; /* 月球相对于太阳的角度 */
    var illum = (1 - Math.cos(phaseAngle)) / 2; /* 照亮比例 0-1 */

    /* 月相圆 */
    ctx.beginPath();
    ctx.arc(phaseCX, phaseCY, phaseR, 0, Math.PI * 2);
    ctx.fillStyle = '#3a3a3a';
    ctx.fill();

    /* 绘制明亮部分 */
    var sinPhase = Math.sin(phaseAngle);
    if (illum > 0.01) {
      ctx.beginPath();
      if (sinPhase >= 0) {
        /* 右侧亮 */
        ctx.arc(phaseCX, phaseCY, phaseR, -Math.PI / 2, Math.PI / 2);
        ctx.ellipse(phaseCX, phaseCY, phaseR * Math.abs(Math.cos(phaseAngle)), phaseR, 0, Math.PI / 2, -Math.PI / 2, sinPhase > 0);
      } else {
        /* 左侧亮 */
        ctx.arc(phaseCX, phaseCY, phaseR, Math.PI / 2, -Math.PI / 2);
        ctx.ellipse(phaseCX, phaseCY, phaseR * Math.abs(Math.cos(phaseAngle)), phaseR, 0, -Math.PI / 2, Math.PI / 2, sinPhase > 0);
      }
      ctx.fillStyle = '#f5f5f5';
      ctx.fill();
    }

    /* 月相名称 */
    var day = Math.round(progress * 29.5);
    var phaseName = '';
    if (day < 2) phaseName = '新月（朔）';
    else if (day < 6) phaseName = '蛾眉月';
    else if (day < 9) phaseName = '上弦月';
    else if (day < 13) phaseName = '盈凸月';
    else if (day < 17) phaseName = '满月（望）';
    else if (day < 21) phaseName = '亏凸月';
    else if (day < 24) phaseName = '下弦月';
    else if (day < 28) phaseName = '残月';
    else phaseName = '新月（朔）';

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('月相变化 · 第 ' + day + ' 天', 20, 26);
    ctx.fillStyle = '#8a7340';
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('当前月相：' + phaseName, 20, 50);
    ctx.fillText('日照比例：' + Math.round(illum * 100) + '%', 20, 72);

    /* 图例 */
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('→ 太阳光方向', W - 20, 26);
  }
},

{
  id: 'geo-tides',
  category: 'geography',
  name: '潮汐',
  tags: ['月球', '太阳', '大潮小潮'],
  desc: '月球和太阳对海水的引力作用形成潮汐，初一十五大潮，初八廿三小潮。',
  detail: '潮汐是海水在天体引力作用下产生的周期性涨落。月球引起的引潮力是太阳的两倍多。朔望时（农历初一、十五）日月地几乎在一直线，引潮力叠加形成大潮；上下弦时（农历初八、廿三）日月地成直角，引潮力相互抵消形成小潮。',
  duration: 10,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2 + 30;

    /* 地球 */
    var earthR = 70;
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    var earthGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, earthR);
    earthGrad.addColorStop(0, '#8bbce4');
    earthGrad.addColorStop(1, '#4a7fb5');
    ctx.fillStyle = earthGrad;
    ctx.fill();

    /* 海水（椭圆包裹地球，随潮汐涨落） */
    var tideAngle = progress * Math.PI * 2;
    /* 月球位置 */
    var moonAngle = tideAngle;
    var moonX = cx + Math.cos(moonAngle) * 200;
    var moonY = cy + Math.sin(moonAngle) * 200;

    /* 太阳位置（固定在右侧） */
    var sunX = W - 50;
    var sunY = cy;

    /* 潮汐高度取决于日月相对位置 */
    var phase = moonAngle; /* 月球角度 */
    var sunEffect = Math.cos(phase); /* 太阳与月球夹角的影响 */
    var springTide = Math.abs(sunEffect); /* 0=小潮，1=大潮 */

    /* 潮汐椭圆 */
    var tideR = earthR + 15 + springTide * 12;
    var tideR2 = earthR + 15 + (1 - springTide) * 12;

    /* 沿日月方向拉长（大潮）或垂直方向拉长（小潮） */
    var ellipseAngle = sunEffect > 0 ? 0 : Math.PI / 2;
    if (springTide < 0.3) ellipseAngle = 0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ellipseAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, tideR + 20, tideR - 10, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(74, 127, 181, .7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'rgba(74, 127, 181, .2)';
    ctx.fill();
    ctx.restore();

    /* 月球 */
    ctx.beginPath();
    ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#d0d0d0';
    ctx.fill();
    ctx.strokeStyle = '#8a8a8a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 太阳 */
    var sunGrad = ctx.createRadialGradient(sunX - 8, sunY - 8, 5, sunX, sunY, 40);
    sunGrad.addColorStop(0, '#ffe9a8');
    sunGrad.addColorStop(1, '#f5b301');
    ctx.beginPath();
    ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    /* 文字 */
    var day = Math.round(progress * 30) + 1;
    var tideType = springTide > 0.7 ? '大潮' : (springTide < 0.3 ? '小潮' : '中潮');
    var tideColor = springTide > 0.7 ? '#c0524a' : (springTide < 0.3 ? '#4a7fb5' : '#8a7340');

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('潮汐', 20, 26);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('农历第 ' + day + ' 天', 20, 50);
    ctx.fillStyle = tideColor;
    ctx.font = 'bold 16px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(tideType, 20, 78);

    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('初一十五大潮', 20, 106);
    ctx.fillText('初八廿三小潮', 20, 128);
  }
},

{
  id: 'geo-volcano',
  category: 'geography',
  name: '火山喷发',
  tags: ['火山', '岩浆', '板块'],
  desc: '地下岩浆沿地壳裂隙上升，从火山口喷出形成火山喷发。',
  detail: '火山喷发的能量来自地球内部。岩浆因密度小于周围岩石而上升，遇到地壳薄弱处喷发。喷发物包括岩浆、火山灰、火山气体等。火山多分布在板块交界处（如环太平洋火山地震带、地中海—喜马拉雅火山地震带）。',
  duration: 8,
  params: [],
  init: function (state) {
    state.particles = [];
    state.timer = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2;
    var groundY = H * 0.55;
    var volcX = cx;
    var volcY = H * 0.3;

    /* 天空（夜晚） */
    var skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#1a1a3a');
    skyGrad.addColorStop(1, '#4a3a5a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);

    /* 地面 */
    var groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, '#5a4a20');
    groundGrad.addColorStop(1, '#3a2a10');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);

    /* 火山锥 */
    ctx.beginPath();
    ctx.moveTo(volcX - 180, groundY);
    ctx.lineTo(volcX - 30, volcY);
    ctx.lineTo(volcX - 20, volcY);
    ctx.lineTo(volcX + 20, volcY);
    ctx.lineTo(volcX + 30, volcY);
    ctx.lineTo(volcX + 180, groundY);
    ctx.closePath();
    ctx.fillStyle = '#3a2a20';
    ctx.fill();
    ctx.strokeStyle = '#1a0a00';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 火山口 */
    ctx.beginPath();
    ctx.ellipse(volcX, volcY, 20, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#c0524a';
    ctx.fill();
    ctx.strokeStyle = '#8f3a3a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 喷发粒子 */
    state.timer += dt;
    if (state.timer > 0.05 && progress < 0.95) {
      state.timer = 0;
      var count = 3 + Math.floor(Math.random() * 3);
      for (var i = 0; i < count; i++) {
        var angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
        var speed = 80 + Math.random() * 120;
        state.particles.push({
          x: volcX + (Math.random() - 0.5) * 15,
          y: volcY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 3 + Math.random() * 4,
          life: 1,
          type: Math.random() < 0.7 ? 'lava' : 'ash'
        });
      }
    }

    /* 更新与绘制粒子 */
    for (var j = state.particles.length - 1; j >= 0; j--) {
      var p = state.particles[j];
      p.vy += 100 * dt; /* 重力 */
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 0.5;
      if (p.life <= 0 || p.y > groundY + 50) {
        state.particles.splice(j, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (p.type === 'lava') {
        var lavaGrad = ctx.createRadialGradient(p.x - 1, p.y - 1, 1, p.x, p.y, p.r);
        lavaGrad.addColorStop(0, 'rgba(255, 240, 150, ' + p.life + ')');
        lavaGrad.addColorStop(0.5, 'rgba(255, 140, 60, ' + p.life + ')');
        lavaGrad.addColorStop(1, 'rgba(192, 60, 40, ' + (p.life * 0.5) + ')');
        ctx.fillStyle = lavaGrad;
      } else {
        ctx.fillStyle = 'rgba(150, 150, 150, ' + (p.life * 0.5) + ')';
      }
      ctx.fill();
    }

    /* 火山口发光 */
    var glow = ctx.createRadialGradient(volcX, volcY, 5, volcX, volcY, 80);
    glow.addColorStop(0, 'rgba(255, 200, 100, .6)');
    glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(volcX, volcY, 80, 0, Math.PI * 2);
    ctx.fill();

    /* 文字 */
    ctx.fillStyle = '#fff8e1';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('火山喷发', 20, 26);
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = 'rgba(255, 244, 204, .8)';
    ctx.fillText('岩浆沿地壳裂隙上升，从火山口喷出', 20, 50);
    ctx.fillText('喷发物：岩浆 · 火山灰 · 火山气体', 20, 72);
  }
},

/* ============================================================
   ═══════════════ 其它可视化（5） ═══════════════
   ============================================================ */

{
  id: 'others-sound-wave',
  category: 'others',
  name: '声音波形与频率',
  tags: ['声音', '频率', '振幅'],
  desc: '不同频率、振幅的声音对应不同的波形。',
  detail: '声音是物体的振动在介质中传播形成的波。频率决定音调（频率越高，音调越高）；振幅决定响度（振幅越大，声音越响）；波形的形状决定音色。人耳能听到的频率范围约 20 Hz 到 20000 Hz。',
  duration: 6,
  params: [
    { key: 'freq', label: '频率（Hz）', min: 1, max: 8, step: 0.1, default: 2 },
    { key: 'amp', label: '振幅', min: 0.2, max: 1, step: 0.05, default: 0.8 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 40, padR = 40, padT = 80, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var axisY = padT + plotH / 2;

    /* 坐标轴 */
    ctx.strokeStyle = 'rgba(138, 115, 64, .3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, axisY);
    ctx.lineTo(padL + plotW, axisY);
    ctx.stroke();

    /* 波形 */
    ctx.beginPath();
    for (var x = 0; x <= plotW; x += 2) {
      var t = x / plotW * 10;
      var y = axisY - Math.sin((t - elapsed * 2) * params.freq * Math.PI * 2 / 10 * 5) * params.amp * plotH * 0.4;
      if (x === 0) ctx.moveTo(padL + x, y);
      else ctx.lineTo(padL + x, y);
    }
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* 波长标注 */
    var wavelengthPx = plotW / (params.freq * 0.5);
    if (wavelengthPx > 20 && wavelengthPx < plotW) {
      ctx.beginPath();
      ctx.moveTo(padL + 20, axisY + 50);
      ctx.lineTo(padL + 20 + wavelengthPx, axisY + 50);
      ctx.strokeStyle = '#c0524a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      /* 箭头 */
      ctx.beginPath();
      ctx.moveTo(padL + 20, axisY + 50);
      ctx.lineTo(padL + 26, axisY + 46);
      ctx.moveTo(padL + 20, axisY + 50);
      ctx.lineTo(padL + 26, axisY + 54);
      ctx.moveTo(padL + 20 + wavelengthPx, axisY + 50);
      ctx.lineTo(padL + 14 + wavelengthPx, axisY + 46);
      ctx.moveTo(padL + 20 + wavelengthPx, axisY + 50);
      ctx.lineTo(padL + 14 + wavelengthPx, axisY + 54);
      ctx.stroke();

      ctx.fillStyle = '#c0524a';
      ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('波长 λ', padL + 20 + wavelengthPx / 2, axisY + 68);
    }

    /* 振幅标注 */
    ctx.beginPath();
    ctx.moveTo(padL + plotW - 30, axisY);
    ctx.lineTo(padL + plotW - 30, axisY - params.amp * plotH * 0.4);
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#4a7fb5';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('振幅 A', padL + plotW - 35, axisY - params.amp * plotH * 0.2);

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('声音波形', 20, 26);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('频率：' + params.freq.toFixed(1) + ' （相对值）', 20, 52);
    ctx.fillText('振幅：' + params.amp.toFixed(2), 20, 74);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('频率决定音调，振幅决定响度', 20, H - 20);
  }
},

{
  id: 'others-dispersion',
  category: 'others',
  name: '光的色散',
  tags: ['三棱镜', '白光', '光谱'],
  desc: '白光通过三棱镜后分解为红橙黄绿蓝靛紫七色光。',
  detail: '牛顿在 1666 年发现白光通过三棱镜后分解成七色光，称为光的色散。原因是不同颜色的光在同一种介质中的折射率不同，紫光折射率最大，红光最小，因此通过棱镜后分开。',
  duration: 6,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;

    /* 三棱镜 */
    var size = 130;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 0.866, cy + size * 0.5);
    ctx.lineTo(cx - size * 0.866, cy + size * 0.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200, 230, 240, .35)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(138, 115, 64, .8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 入射白光 */
    var entryX = cx - size * 0.3;
    var entryY = cy - size * 0.4;

    ctx.beginPath();
    ctx.moveTo(80, cy - 100);
    ctx.lineTo(entryX, entryY);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    /* 七色光 */
    var colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#4400ff', '#8800ff'];
    var exitX = cx + size * 0.3;
    var exitY = cy - size * 0.4;

    colors.forEach(function (c, i) {
      var offset = (i - 3) * 8;
      var endX = W - 60;
      var endY = cy + 40 + offset * 1.6;
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = c;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    /* 白光标签 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('白光', 80, cy - 110);

    /* 七色标签 */
    var labels = ['红', '橙', '黄', '绿', '蓝', '靛', '紫'];
    labels.forEach(function (l, i) {
      var endX = W - 40;
      var endY = cy + 40 + (i - 3) * 8 * 1.6;
      ctx.fillStyle = colors[i];
      ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(l, endX, endY + 4);
    });

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('光的色散', 20, 26);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('白光经三棱镜分解为七色光', 20, 50);
    ctx.fillText('紫光偏折最大，红光偏折最小', 20, 72);
  }
},

{
  id: 'others-doppler',
  category: 'others',
  name: '多普勒效应',
  tags: ['波源', '频率变化', '声波'],
  desc: '波源靠近观察者时频率升高，远离时频率降低。',
  detail: '多普勒效应：当波源与观察者相对运动时，观察者接收到的频率与波源发出的频率不同。靠近时频率升高（波被压缩），远离时频率降低（波被拉长）。用于测速雷达、医学彩超、天文红移等。',
  duration: 8,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2;
    var cy = H / 2;

    /* 波源位置：从左到右穿过中心 */
    var t = progress * 2 - 1; /* -1 到 1 */
    var sourceX = cx + t * 250;
    var sourceY = cy;

    /* 观察者（固定在右侧） */
    var observerX = W - 80;
    var observerY = cy;

    /* 波源发出的波（同心圆） */
    var waveSpeed = 200;
    for (var i = 0; i < 8; i++) {
      var emitTime = elapsed - i * 0.25;
      if (emitTime < 0) continue;
      var radius = emitTime * waveSpeed;
      if (radius > 400) continue;

      /* 波源发出波时的位置 */
      var emitProgress = Math.max(0, Math.min(1, (emitTime / 8) * 2 - 1 + 1));
      var emitT = (emitTime / 8) * 2 - 1;
      var emitX = cx + emitT * 250;

      var alpha = Math.max(0, 1 - radius / 400);
      ctx.beginPath();
      ctx.arc(emitX, sourceY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 179, 1, ' + alpha * 0.7 + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /* 波源 */
    ctx.beginPath();
    ctx.arc(sourceX, sourceY, 15, 0, Math.PI * 2);
    var srcGrad = ctx.createRadialGradient(sourceX - 3, sourceY - 3, 2, sourceX, sourceY, 15);
    srcGrad.addColorStop(0, '#ffd54f');
    srcGrad.addColorStop(1, '#b47c00');
    ctx.fillStyle = srcGrad;
    ctx.fill();
    ctx.strokeStyle = '#8d5a00';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 观察者 */
    ctx.beginPath();
    ctx.arc(observerX, observerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(74, 127, 181, .6)';
    ctx.fill();
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 观察者眼睛 */
    ctx.beginPath();
    ctx.arc(observerX - 5, observerY - 5, 3, 0, Math.PI * 2);
    ctx.arc(observerX + 5, observerY - 5, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(observerX - 5, observerY - 5, 1.5, 0, Math.PI * 2);
    ctx.arc(observerX + 5, observerY - 5, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#3a2a00';
    ctx.fill();

    /* 观察者接收到的频率指示 */
    var approaching = sourceX < observerX;
    var freqShift = approaching ? '频率升高（波被压缩）' : '频率降低（波被拉长）';
    var colorShift = approaching ? '#c0524a' : '#4a7fb5';

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('多普勒效应', 20, 26);
    ctx.fillStyle = colorShift;
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(approaching ? '波源正在靠近观察者' : '波源正在远离观察者', 20, 52);
    ctx.fillStyle = '#8a7340';
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(freqShift, 20, 76);
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('用于测速雷达、医学彩超、天文红移', 20, 100);
  }
},

{
  id: 'others-beat',
  category: 'others',
  name: '声波拍频',
  tags: ['拍频', '干涉', '声波'],
  desc: '两个频率相近的声波叠加时，会周期性地出现声音强弱的起伏，称为拍。',
  detail: '两列频率相近的声波叠加后，合成波的振幅会周期性地变化。拍频 f = |f₁ - f₂|。调钢琴时利用拍音来判断音准，拍音越慢越接近准确音高。',
  duration: 8,
  params: [
    { key: 'diff', label: '频率差（Hz）', min: 0.5, max: 5, step: 0.1, default: 1.5 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 40, padR = 40;
    var plotW = W - padL - padR;
    var f1 = 5;
    var f2 = 5 + params.diff;

    /* 第一条波 */
    var axisY1 = H * 0.25;
    ctx.beginPath();
    for (var x = 0; x <= plotW; x += 2) {
      var t = (x / plotW) * 5 + elapsed * 2;
      var y = axisY1 - Math.sin(t * f1) * 25;
      if (x === 0) ctx.moveTo(padL + x, y);
      else ctx.lineTo(padL + x, y);
    }
    ctx.strokeStyle = 'rgba(74, 127, 181, .7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 第二条波 */
    var axisY2 = H * 0.5;
    ctx.beginPath();
    for (var x2 = 0; x2 <= plotW; x2 += 2) {
      var t2 = (x2 / plotW) * 5 + elapsed * 2;
      var y2 = axisY2 - Math.sin(t2 * f2) * 25;
      if (x2 === 0) ctx.moveTo(padL + x2, y2);
      else ctx.lineTo(padL + x2, y2);
    }
    ctx.strokeStyle = 'rgba(192, 82, 74, .7)';
    ctx.stroke();

    /* 合成波 */
    var axisY3 = H * 0.78;
    ctx.beginPath();
    for (var x3 = 0; x3 <= plotW; x3 += 2) {
      var t3 = (x3 / plotW) * 5 + elapsed * 2;
      var y3 = axisY3 - (Math.sin(t3 * f1) + Math.sin(t3 * f2)) * 20;
      if (x3 === 0) ctx.moveTo(padL + x3, y3);
      else ctx.lineTo(padL + x3, y3);
    }
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 拍频包络线 */
    var beatFreq = params.diff;
    ctx.beginPath();
    for (var x4 = 0; x4 <= plotW; x4 += 4) {
      var t4 = (x4 / plotW) * 5 + elapsed * 2;
      var envelope = Math.abs(2 * Math.cos(t4 * beatFreq / 2)) * 20;
      var y4 = axisY3 - envelope;
      if (x4 === 0) ctx.moveTo(padL + x4, y4);
      else ctx.lineTo(padL + x4, y4);
    }
    ctx.strokeStyle = 'rgba(192, 82, 74, .4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 标签 */
    ctx.fillStyle = '#4a7fb5';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('波 1', padL - 8, axisY1 + 4);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('波 2', padL - 8, axisY2 + 4);
    ctx.fillStyle = '#b47c00';
    ctx.fillText('合成', padL - 8, axisY3 + 4);

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('声波拍频', 20, 26);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('频率差：' + params.diff.toFixed(1) + ' Hz', 20, 52);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('拍频 f = |f₁ - f₂|', 20, 76);
  }
},

{
  id: 'others-fourier',
  category: 'others',
  name: '傅里叶分解',
  tags: ['傅里叶', '谐波', '合成'],
  desc: '任何周期波都可以分解为一系列正弦波之和。',
  detail: '傅里叶级数：任何周期函数都可以表示为一系列不同频率、不同振幅的正弦和余弦函数的叠加。方波可以分解为基频和奇次谐波的叠加，谐波越多，合成波形越接近方波。',
  duration: 8,
  params: [
    { key: 'n', label: '谐波数量', min: 1, max: 15, step: 1, default: 5 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 40, padR = 40;
    var plotW = W - padL - padR;

    /* 各次谐波 */
    var harmonics = Math.floor(params.n);

    /* 目标波形（方波） */
    var axisY1 = H * 0.3;
    ctx.beginPath();
    for (var x = 0; x <= plotW; x += 2) {
      var t = (x / plotW) * 4 + elapsed * 0.5;
      var sq = Math.sin(t * Math.PI * 2) > 0 ? 1 : -1;
      var y = axisY1 - sq * 30;
      if (x === 0) ctx.moveTo(padL + x, y);
      else ctx.lineTo(padL + x, y);
    }
    ctx.strokeStyle = 'rgba(138, 115, 64, .4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 各次谐波叠加 */
    var axisY2 = H * 0.75;
    ctx.beginPath();
    for (var x2 = 0; x2 <= plotW; x2 += 2) {
      var t2 = (x2 / plotW) * 4 + elapsed * 0.5;
      var sum = 0;
      for (var k = 1; k <= harmonics; k += 2) {
        sum += Math.sin(t2 * k * Math.PI * 2) / k;
      }
      sum *= 4 / Math.PI;
      var y2 = axisY2 - sum * 25;
      if (x2 === 0) ctx.moveTo(padL + x2, y2);
      else ctx.lineTo(padL + x2, y2);
    }
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 标签 */
    ctx.fillStyle = '#8a7340';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('目标方波', padL - 8, axisY1 + 4);
    ctx.fillStyle = '#b47c00';
    ctx.fillText('合成波形', padL - 8, axisY2 + 4);

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('傅里叶分解', 20, 26);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('谐波数量：' + harmonics, 20, 52);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('谐波越多，合成波形越接近方波', 20, 76);
  }
},

{
  id: 'others-sunset',
  category: 'others',
  name: '日落与瑞利散射',
  tags: ['散射', '大气', '颜色'],
  desc: '日落时太阳光穿过更厚的大气层，蓝光被散射，剩下红光到达地面。',
  detail: '瑞利散射：大气中的分子对短波长（蓝紫光）的散射比对长波长（红光）强。日落时太阳光斜射穿过更厚的大气层，蓝光几乎被完全散射，剩下红光和橙光到达观察者，形成红色的晚霞。',
  duration: 8,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var sunAngle = Math.PI * (0.5 + progress * 0.45); /* 从高到低 */
    var sunX = W / 2 + Math.cos(sunAngle) * 300;
    var sunY = H / 2 - Math.sin(sunAngle) * 180;

    /* 天空渐变：随日落变红 */
    var rGrad = 100 + progress * 155;
    var gGrad = 150 - progress * 100;
    var bGrad = 220 - progress * 180;
    var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, 'rgb(' + Math.round(rGrad * 0.5) + ',' + Math.round(gGrad * 0.5) + ',' + Math.round(bGrad * 0.7) + ')');
    skyGrad.addColorStop(1, 'rgb(' + Math.round(rGrad) + ',' + Math.round(gGrad) + ',' + Math.round(bGrad) + ')');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    /* 太阳 */
    var sunR = 40;
    var sunGrad = ctx.createRadialGradient(sunX - 10, sunY - 10, 5, sunX, sunY, sunR);
    var sunColor = progress < 0.5 ? '#fff5b0' : '#ffb060';
    sunGrad.addColorStop(0, sunColor);
    sunGrad.addColorStop(1, 'rgba(255, 150, 60, 0.8)');
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    /* 大气层（弧线） */
    ctx.beginPath();
    ctx.arc(W / 2, H + 300, 400, -Math.PI * 0.7, -Math.PI * 0.3);
    ctx.strokeStyle = 'rgba(255, 244, 204, .3)';
    ctx.lineWidth = 60;
    ctx.stroke();

    /* 蓝光散射粒子 */
    var blueCount = Math.round((1 - progress) * 20);
    for (var i = 0; i < blueCount; i++) {
      var t = (elapsed * 0.5 + i * 0.1) % 1;
      var px = W / 2 + Math.cos(sunAngle) * (300 - t * 300);
      var py = H / 2 - Math.sin(sunAngle) * (180 - t * 180);
      ctx.beginPath();
      ctx.arc(px + (Math.random() - 0.5) * 40, py + (Math.random() - 0.5) * 40, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 180, 255, .7)';
      ctx.fill();
    }

    /* 红光粒子（到达地面） */
    for (var j = 0; j < 8; j++) {
      var t2 = (elapsed * 0.6 + j * 0.15) % 1;
      var px2 = sunX + Math.cos(Math.PI / 2) * t2 * 200 + (j - 4) * 15;
      var py2 = sunY + Math.sin(Math.PI / 2) * t2 * (H - sunY) * 0.9;
      ctx.beginPath();
      ctx.arc(px2, py2, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 140, 60, ' + (1 - t2) + ')';
      ctx.fill();
    }

    /* 文字 */
    ctx.fillStyle = 'rgba(255, 244, 204, .95)';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('日落与瑞利散射', 20, 26);
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('太阳高度：' + Math.round((1 - progress) * 90) + '°', 20, 52);
    ctx.fillStyle = progress < 0.5 ? 'rgba(180, 220, 255, .9)' : 'rgba(255, 180, 100, .95)';
    ctx.fillText(progress < 0.5 ? '蓝光散射较多，天空呈蓝色' : '蓝光几乎散尽，晚霞呈红色', 20, 76);
  }
},

/* ============================================================
   数据结束：共 18 个可视化
   生物 7：血液循环、呼吸过程、消化过程、神经元、有丝分裂、DNA、光合作用
   地理 6：水循环、大气环流、板块漂移、月相、潮汐、火山喷发
   其它 5：声音波形、光的色散、多普勒效应、声波拍频、傅里叶分解
   ============================================================ */


/* ============================================================
   ═══════════════ 新增（V4.2 第二批）═══════════════
   ============================================================ */

{
  id: 'geo-carbon-cycle',
  category: 'geography',
  name: '碳循环',
  tags: ['碳', '循环', '生态'],
  desc: '碳在大气、海洋、陆地生态和岩石圈之间不断交换，构成全球碳循环。',
  detail: '碳循环包括快循环和慢循环。快循环：光合作用固定 CO₂、呼吸作用释放 CO₂、海气交换。慢循环：化石燃料燃烧、岩石风化、火山活动。人类活动加剧了化石燃料燃烧，打破了原有平衡，导致大气 CO₂ 浓度上升。',
  duration: 12,
  params: [],
  init: function (state) {
    state.arrows = [];
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    /* 五个碳库 */
    var pools = [
      { x: W / 2, y: 80, w: 200, h: 60, name: '大气 CO₂', color: '#8ba6c0' },
      { x: 150, y: 240, w: 160, h: 60, name: '陆地生态', color: '#8fb59a' },
      { x: W - 150, y: 240, w: 160, h: 60, name: '海洋', color: '#4a7fb5' },
      { x: 150, y: 400, w: 160, h: 60, name: '土壤 / 有机物', color: '#8a7340' },
      { x: W - 150, y: 400, w: 160, h: 60, name: '化石燃料', color: '#3a2a10' }
    ];

    /* 画碳库 */
    pools.forEach(function (p) {
      ctx.beginPath();
      ctx.roundRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, 12);
      var grad = ctx.createLinearGradient(p.x - p.w / 2, p.y - p.h / 2, p.x + p.w / 2, p.y + p.h / 2);
      grad.addColorStop(0, p.color + 'dd');
      grad.addColorStop(1, p.color + '99');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.name, p.x, p.y);
      ctx.textBaseline = 'alphabetic';
    });

    /* 碳流（箭头） */
    var flows = [
      { from: 0, to: 1, label: '光合作用', color: '#3f8f6b', curve: -0.15 },
      { from: 1, to: 0, label: '呼吸作用', color: '#c0524a', curve: 0.15 },
      { from: 0, to: 2, label: '溶解', color: '#4a7fb5', curve: -0.15 },
      { from: 2, to: 0, label: '释放', color: '#8ba6c0', curve: 0.15 },
      { from: 1, to: 3, label: '枯落', color: '#8a7340', curve: -0.1 },
      { from: 3, to: 0, label: '分解', color: '#c0524a', curve: 0.1 },
      { from: 4, to: 0, label: '燃烧', color: '#dc2626', curve: 0 }
    ];

    function curveArrow(p1, p2, curveOffset, color, label, offset) {
      var mx = (p1.x + p2.x) / 2 + curveOffset * 100;
      var my = (p1.y + p2.y) / 2 - curveOffset * 80;

      /* 起点终点（从池边缘出发） */
      var dx = p2.x - p1.x, dy = p2.y - p1.y;
      var len = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / len, uy = dy / len;
      var startX = p1.x + ux * 80;
      var startY = p1.y + uy * 40;
      var endX = p2.x - ux * 80;
      var endY = p2.y - uy * 40;

      /* 二次贝塞尔 */
      function bez(t) {
        var mt = 1 - t;
        return {
          x: mt * mt * startX + 2 * mt * t * mx + t * t * endX,
          y: mt * mt * startY + 2 * mt * t * my + t * t * endY
        };
      }

      /* 画曲线 */
      ctx.beginPath();
      for (var t = 0; t <= 1; t += 0.02) {
        var p = bez(t);
        if (t === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.globalAlpha = 1;

      /* 动画粒子 */
      var pos = bez(offset);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* 箭头方向 */
      var pos2 = bez(Math.min(1, offset + 0.02));
      var ang = Math.atan2(pos2.y - pos.y, pos2.x - pos.x);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      /* 标签 */
      var midP = bez(0.5);
      ctx.fillStyle = color;
      ctx.font = 'bold 11px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, midP.x, midP.y - 8);
    }

    flows.forEach(function (f, i) {
      var offset = (elapsed * 0.4 + i * 0.2) % 1;
      curveArrow(pools[f.from], pools[f.to], f.curve, f.color, f.label, offset);
    });

    /* 标题 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('碳循环', 20, 26);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('碳在大气、陆地、海洋、岩石圈之间不断交换', 20, 50);
  }
},

{
  id: 'geo-greenhouse-effect',
  category: 'geography',
  name: '温室效应',
  tags: ['温室气体', '气候', '辐射'],
  desc: '大气中的温室气体吸收地表长波辐射，使地表温度升高。',
  detail: '太阳短波辐射穿过大气到达地表，地表吸收后升温并向外辐射长波（红外线）。温室气体（CO₂、H₂O、CH₄ 等）吸收长波辐射并再辐射，一部分返回地表，使地表温度升高。这就是自然的温室效应，人类活动加剧了这一过程。',
  duration: 8,
  params: [],
  init: function (state) {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    /* 天空 */
    var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#c8d8e8');
    skyGrad.addColorStop(1, '#e8eef5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    /* 大气层 */
    var atmosY = 100;
    ctx.fillStyle = 'rgba(180, 200, 220, .35)';
    ctx.fillRect(0, atmosY, W, H - atmosY);

    /* 温室气体分子 */
    var moleculePositions = [
      [80, 130], [180, 150], [300, 120], [420, 160],
      [540, 130], [640, 155], [130, 180], [250, 200],
      [370, 175], [490, 195], [590, 185], [680, 200],
      [220, 230], [350, 245], [500, 225], [620, 250]
    ];
    moleculePositions.forEach(function (p, i) {
      var wobble = Math.sin(elapsed * 2 + i) * 3;
      /* 画一个小分子符号 */
      ctx.beginPath();
      ctx.arc(p[0], p[1] + wobble, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(192, 82, 74, .6)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p[0] - 8, p[1] + wobble, 5, 0, Math.PI * 2);
      ctx.arc(p[0] + 8, p[1] + wobble, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(192, 82, 74, .5)';
      ctx.fill();

      /* 标签 CO₂ */
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = 'bold 9px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CO₂', p[0], p[1] + wobble);
      ctx.textBaseline = 'alphabetic';
    });

    /* 太阳 */
    var sunX = 60, sunY = 50;
    var sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 40);
    sunGrad.addColorStop(0, '#fff5b0');
    sunGrad.addColorStop(1, '#f5b301');
    ctx.beginPath();
    ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    /* 太阳短波辐射（黄色向下） */
    var shortWave = [
      [120, 90], [200, 90], [280, 90], [360, 90], [440, 90], [520, 90], [600, 90]
    ];
    shortWave.forEach(function (p, i) {
      var yOffset = (elapsed * 80 + i * 30) % 300;
      var y = p[0] ? 90 + yOffset : 90;
      if (y > H - 80) return;
      /* 画虚线箭头 */
      ctx.beginPath();
      ctx.moveTo(p[0], y - 20);
      ctx.lineTo(p[0] + 30, y);
      ctx.strokeStyle = 'rgba(245, 179, 1, .7)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p[0] + 30, y);
      ctx.lineTo(p[0] + 22, y - 5);
      ctx.lineTo(p[0] + 22, y + 5);
      ctx.closePath();
      ctx.fillStyle = '#f5b301';
      ctx.fill();
    });

    /* 地表 */
    ctx.fillStyle = '#8a7340';
    ctx.beginPath();
    ctx.moveTo(0, H - 80);
    for (var x = 0; x <= W; x += 40) {
      ctx.lineTo(x, H - 80 + Math.sin(x / 60) * 5);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = '#8fb59a';
    ctx.fill();
    ctx.strokeStyle = '#3f6b52';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 地表长波辐射（红色向上） */
    var longWave = [
      [140, H - 80], [240, H - 80], [340, H - 80],
      [440, H - 80], [540, H - 80], [640, H - 80]
    ];
    longWave.forEach(function (p, i) {
      var yOffset = (elapsed * 60 + i * 40) % 250;
      var y = p[1] - yOffset;
      if (y < 150) return;

      /* 长波箭头（向上） */
      ctx.beginPath();
      ctx.moveTo(p[0], y + 20);
      ctx.lineTo(p[0], y);
      ctx.strokeStyle = 'rgba(192, 82, 74, .8)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p[0], y);
      ctx.lineTo(p[0] - 5, y + 8);
      ctx.lineTo(p[0] + 5, y + 8);
      ctx.closePath();
      ctx.fillStyle = '#c0524a';
      ctx.fill();
    });

    /* 大气逆辐射（红色向下） */
    var backRadiation = [
      [180, 220], [320, 240], [460, 230], [600, 245]
    ];
    backRadiation.forEach(function (p, i) {
      var offset = (elapsed * 50 + i * 40) % 120;
      var y = p[1] + offset;
      if (y > H - 90) return;

      ctx.beginPath();
      ctx.moveTo(p[0], y - 15);
      ctx.lineTo(p[0], y);
      ctx.strokeStyle = 'rgba(192, 82, 74, .5)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(p[0], y);
      ctx.lineTo(p[0] - 4, y - 7);
      ctx.lineTo(p[0] + 4, y - 7);
      ctx.closePath();
      ctx.fillStyle = 'rgba(192, 82, 74, .5)';
      ctx.fill();
    });

    /* 反射的短波（大气反射回太空） */
    for (var r = 0; r < 3; r++) {
      var rx = 400 + r * 100;
      var ry = 130 + ((elapsed * 60 + r * 40) % 80);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 15, ry - 30);
      ctx.strokeStyle = 'rgba(245, 179, 1, .4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx + 15, ry - 30);
      ctx.lineTo(rx + 10, ry - 22);
      ctx.lineTo(rx + 20, ry - 22);
      ctx.closePath();
      ctx.fillStyle = 'rgba(245, 179, 1, .4)';
      ctx.fill();
    }

    /* 温度计（右上角） */
    var thermoX = W - 60, thermoY = 60;
    ctx.beginPath();
    ctx.arc(thermoX, thermoY + 100, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#c0524a';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(thermoX - 5, thermoY, 10, 100);
    ctx.fillStyle = 'rgba(200, 200, 200, .8)';
    ctx.fill();
    ctx.strokeStyle = '#8a7340';
    ctx.stroke();
    var tempLevel = 0.4 + progress * 0.5;
    ctx.beginPath();
    ctx.rect(thermoX - 4, thermoY + 100 - 100 * tempLevel, 8, 100 * tempLevel);
    ctx.fillStyle = '#c0524a';
    ctx.fill();
    ctx.fillStyle = '#c0524a';
    ctx.font = 'bold 11px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('温度上升', thermoX, thermoY - 8);

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('温室效应', 20, 26);
    ctx.fillStyle = '#f5b301';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('● 太阳短波辐射（黄色）', 20, H - 40);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('● 地表长波辐射 / 大气逆辐射（红色）', 20, H - 20);
  }
},

{
  id: 'others-memory-curve',
  category: 'others',
  name: '记忆曲线（艾宾浩斯）',
  tags: ['心理学', '记忆', '遗忘'],
  desc: '遗忘随时间先快后慢，及时复习能显著提高记忆保持率。',
  detail: '艾宾浩斯遗忘曲线表明：不复习时，20 分钟记住的内容只能保留约 58%，1 小时后约 44%，1 天后约 33%，1 周后约 25%。如果在遗忘发生前及时复习，记忆保持率会大幅提高，并延长下一次遗忘的开始时间。',
  duration: 10,
  params: [
    { key: 'review', label: '复习次数（0 = 不复习）', min: 0, max: 4, step: 1, default: 2 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 70, padR = 40, padT = 60, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - plotB(); /* 见下方函数 */
    function plotB() { return 60; }
    plotH = H - padT - 60;

    /* 坐标轴 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    /* 网格 */
    ctx.strokeStyle = 'rgba(245,179,1,.1)';
    for (var gi = 1; gi <= 5; gi++) {
      var gy = padT + plotH * gi / 5;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();
    }

    /* 纵轴刻度 */
    ctx.fillStyle = '#8a7340';
    ctx.font = '11px Consolas, monospace';
    ctx.textAlign = 'right';
    for (var yi = 0; yi <= 5; yi++) {
      var yy = padT + plotH * yi / 5;
      ctx.fillText((100 - yi * 20) + '%', padL - 6, yy + 4);
    }

    /* 横轴刻度 */
    ctx.textAlign = 'center';
    var days = [0, 1, 2, 3, 4, 5, 6, 7];
    days.forEach(function (d, i) {
      var x = padL + plotW * i / 7;
      ctx.fillText(d + '天', x, padT + plotH + 20);
    });

    var T = 7;
    function toPx(t) { return padL + (t / T) * plotW; }
    function toPy(r) { return padT + plotH - r * plotH; }

    /* ---------- 分段动画 ---------- */
    /* 0.00 - 0.45：画无复习曲线 */
    /* 0.45 - 0.95：画有复习曲线 */
    /* 0.95 - 1.00：显示图例 */

    /* 无复习曲线 */
    var noReviewProgress = Math.min(1, progress / 0.45);
    if (noReviewProgress > 0) {
      ctx.beginPath();
      var noEndT = T * noReviewProgress;
      for (var t = 0; t <= noEndT; t += 0.05) {
        var r = Math.exp(-t / 1.2);
        var px = toPx(t), py = toPy(r);
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(192, 82, 74, .55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      /* 当前点 */
      if (noReviewProgress < 1) {
        var curT = noEndT;
        var curR = Math.exp(-curT / 1.2);
        ctx.beginPath();
        ctx.arc(toPx(curT), toPy(curR), 6, 0, Math.PI * 2);
        ctx.fillStyle = '#c0524a';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    /* 有复习曲线 */
    if (progress > 0.45) {
      var reviewProgress = Math.min(1, (progress - 0.45) / 0.5);
      var reviews = [0.5, 1.5, 3, 5];
      var numReviews = Math.floor(params.review);
      var activeReviews = reviews.slice(0, numReviews);

      var memory = 1.0;
      var lastReview = 0;
      var reviewIndex = 0;

      ctx.beginPath();
      var endT2 = T * reviewProgress;
      for (var t2 = 0; t2 <= endT2; t2 += 0.02) {
        while (reviewIndex < activeReviews.length && t2 >= activeReviews[reviewIndex]) {
          memory = Math.min(1.0, memory + (1 - memory) * 0.9);
          lastReview = t2;
          reviewIndex++;
        }
        var decayTime = t2 - lastReview;
        var currentR = memory * Math.exp(-decayTime / 2.5);
        var px2 = toPx(t2), py2 = toPy(currentR);
        if (t2 === 0) ctx.moveTo(px2, py2);
        else ctx.lineTo(px2, py2);
      }
      ctx.strokeStyle = '#3f8f6b';
      ctx.lineWidth = 3;
      ctx.stroke();

      /* 当前点 */
      if (reviewProgress < 1) {
        var lastT = endT2;
        var m2 = 1.0, lr = 0, ri = 0;
        for (var t3 = 0; t3 <= lastT; t3 += 0.02) {
          while (ri < activeReviews.length && t3 >= activeReviews[ri]) {
            m2 = Math.min(1.0, m2 + (1 - m2) * 0.9);
            lr = t3;
            ri++;
          }
        }
        var cr = m2 * Math.exp(-(lastT - lr) / 2.5);
        ctx.beginPath();
        ctx.arc(toPx(lastT), toPy(cr), 6, 0, Math.PI * 2);
        ctx.fillStyle = '#3f8f6b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      /* 复习点标记（已经画到的才显示） */
      activeReviews.forEach(function (rt) {
        if (rt > endT2) return;
        var x = toPx(rt);
        /* 脉冲效果 */
        var pulsePhase = (elapsed * 1.5 + rt) % 1;
        var pulseAlpha = 0.3 + pulsePhase * 0.7;

        ctx.beginPath();
        ctx.arc(x, padT + plotH, 10 + pulsePhase * 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(63, 143, 107, ' + (0.6 - pulsePhase * 0.6) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, padT + plotH, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#3f8f6b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        /* 向上箭头 */
        ctx.beginPath();
        ctx.moveTo(x, padT + plotH - 20);
        ctx.lineTo(x, padT + plotH - 40);
        ctx.strokeStyle = '#3f8f6b';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 5, padT + plotH - 36);
        ctx.lineTo(x + 5, padT + plotH - 36);
        ctx.lineTo(x, padT + plotH - 44);
        ctx.closePath();
        ctx.fillStyle = '#3f8f6b';
        ctx.fill();

        ctx.fillStyle = '#3f8f6b';
        ctx.font = 'bold 11px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('复习', x, padT + plotH - 52);
      });
    }

    /* 图例 */
    ctx.fillStyle = 'rgba(255, 253, 245, .92)';
    ctx.strokeStyle = 'rgba(180, 124, 0, .3)';
    ctx.beginPath();
    ctx.roundRect(20, 20, 280, 90, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('记忆曲线（艾宾浩斯）', 36, 46);

    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = '#c0524a';
    ctx.fillText('— 不复习：遗忘快', 36, 68);
    ctx.fillStyle = '#3f8f6b';
    ctx.fillText('— 有复习：保持率显著提高', 36, 88);
    ctx.fillStyle = '#8a7340';
    ctx.font = '11px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('复习次数：' + Math.floor(params.review) + ' 次', 36, 104);
  }
},

{
  id: 'others-supply-demand',
  category: 'others',
  name: '供需曲线与均衡',
  tags: ['经济学', '供需', '均衡'],
  desc: '供给曲线与需求曲线的交点决定均衡价格与均衡数量。',
  detail: '需求曲线向右下方倾斜：价格越低，需求量越大。供给曲线向右上方倾斜：价格越高，供给量越大。两线交点即市场均衡点，对应的价格是均衡价格，数量是均衡数量。当供给或需求变化时，曲线移动，均衡点也随之移动。',
  duration: 8,
  params: [
    { key: 'shift', label: '需求变动（-1 减少，+1 增加）', min: -1, max: 1, step: 0.1, default: 0 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 70, padR = 40, padT = 60, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    /* 坐标轴 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    /* 轴标签 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('数量 Q', padL + plotW / 2, padT + plotH + 40);
    ctx.save();
    ctx.translate(24, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('价格 P', 0, 0);
    ctx.restore();

    function toPx(q) { return padL + q * plotW; }
    function toPy(p) { return padT + plotH - p * plotH; }

    var demandShift = params.shift * 0.3;

    /* 分段动画 */
    /* 0.00 - 0.30：画需求曲线 */
    /* 0.30 - 0.60：画供给曲线 */
    /* 0.60 - 0.85：均衡点出现 */
    /* 0.85 - 1.00：虚线投影 + 标签 */

    /* --- 需求曲线（蓝） --- */
    var demandProgress = Math.min(1, progress / 0.3);
    if (demandProgress > 0) {
      ctx.beginPath();
      var qMax = demandProgress * 1;
      for (var q = 0; q <= qMax; q += 0.01) {
        var p = 1 - q - demandShift;
        if (p < 0) break;
        var px = toPx(q);
        var py = toPy(p);
        if (q === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = '#4a7fb5';
      ctx.lineWidth = 3;
      ctx.stroke();

      /* 标签 */
      if (demandProgress > 0.3) {
        ctx.fillStyle = '#4a7fb5';
        ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('D（需求）', toPx(0.05) + 5, toPy(Math.max(0.05, 0.95 - demandShift)) - 8);
      }
    }

    /* --- 供给曲线（红） --- */
    var supplyProgress = Math.min(1, Math.max(0, (progress - 0.3) / 0.3));
    if (supplyProgress > 0) {
      ctx.beginPath();
      var qMax2 = supplyProgress * 1;
      for (var q2 = 0; q2 <= qMax2; q2 += 0.01) {
        var p2 = q2;
        if (p2 > 1) break;
        var px2 = toPx(q2);
        var py2 = toPy(p2);
        if (q2 === 0) ctx.moveTo(px2, py2);
        else ctx.lineTo(px2, py2);
      }
      ctx.strokeStyle = '#c0524a';
      ctx.lineWidth = 3;
      ctx.stroke();

      /* 标签 */
      if (supplyProgress > 0.3) {
        ctx.fillStyle = '#c0524a';
        ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('S（供给）', toPx(0.75) + 5, toPy(0.78) - 8);
      }
    }

    /* --- 均衡点 --- */
    var eqQ = (1 - demandShift) / 2;
    var eqP = eqQ;
    var eqProgress = Math.min(1, Math.max(0, (progress - 0.6) / 0.25));
    if (eqProgress > 0 && eqQ >= 0 && eqQ <= 1) {
      var eqX = toPx(eqQ);
      var eqY = toPy(eqP);

      /* 交叉虚线（动画画入） */
      var dashProgress = Math.min(1, Math.max(0, (progress - 0.85) / 0.15));
      if (dashProgress > 0) {
        ctx.beginPath();
        ctx.moveTo(eqX, padT + plotH);
        ctx.lineTo(eqX, eqY);
        ctx.moveTo(padL, eqY);
        ctx.lineTo(eqX, eqY);
        ctx.strokeStyle = 'rgba(245, 179, 1, .8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5 * dashProgress, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      /* 均衡点（脉冲） */
      var pulse = 0.8 + Math.sin(elapsed * 6) * 0.2;
      var pointR = 8 * eqProgress * pulse;
      ctx.beginPath();
      ctx.arc(eqX, eqY, pointR + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 179, 1, ' + (0.3 * eqProgress) + ')';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(eqX, eqY, pointR, 0, Math.PI * 2);
      ctx.fillStyle = '#b47c00';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      /* 标签 */
      if (progress > 0.9) {
        ctx.fillStyle = '#3a2a00';
        ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('P* = ' + eqP.toFixed(2), padL - 8, eqY + 4);
        ctx.textAlign = 'center';
        ctx.fillText('Q* = ' + eqQ.toFixed(2), eqX, padT + plotH + 22);

        ctx.fillStyle = '#b47c00';
        ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('均衡点 (P*, Q*)', eqX + 15, eqY - 10);
      }
    }

    /* 图例 */
    ctx.fillStyle = 'rgba(255, 253, 245, .92)';
    ctx.strokeStyle = 'rgba(180, 124, 0, .3)';
    ctx.beginPath();
    ctx.roundRect(20, 20, 240, 80, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('供需曲线与均衡', 36, 46);

    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('— 需求曲线 D（右下倾斜）', 36, 68);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('— 供给曲线 S（右上倾斜）', 36, 88);
  }
},

{
  id: 'others-lorenz-curve',
  category: 'others',
  name: '洛伦兹曲线与基尼系数',
  tags: ['经济学', '收入分配', '基尼'],
  desc: '洛伦兹曲线描述收入分配的不平等程度，基尼系数是量化指标。',
  detail: '横轴为人口累计百分比，纵轴为收入累计百分比。45° 对角线代表收入完全平等，越向下弯曲说明收入分配越不平等。基尼系数 = 洛伦兹曲线与对角线围成的面积 / 对角线以下三角形面积，取值 0-1，越小越平等（0.4 以上通常被认为差距较大）。',
  duration: 8,
  params: [
    { key: 'gini', label: '基尼系数（0.1 - 0.7）', min: 0.1, max: 0.7, step: 0.05, default: 0.4 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 70, padR = 40, padT = 60, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    /* 坐标轴 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    /* 轴标签 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('人口累计百分比', padL + plotW / 2, padT + plotH + 40);
    ctx.save();
    ctx.translate(24, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('收入累计百分比', 0, 0);
    ctx.restore();

    /* 刻度 */
    ctx.fillStyle = '#8a7340';
    ctx.font = '11px Consolas, monospace';
    ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var y = padT + plotH * i / 5;
      ctx.fillText((100 - i * 20) + '%', padL - 8, y + 4);
    }
    ctx.textAlign = 'center';
    for (var i2 = 0; i2 <= 5; i2++) {
      var x = padL + plotW * i2 / 5;
      ctx.fillText((i2 * 20) + '%', x, padT + plotH + 20);
    }

    var gini = params.gini;
    var alpha = 1 + gini * 3;

    function lorenz(x) {
      return Math.pow(x, alpha);
    }

    /* 分段动画 */
    /* 0.00 - 0.25：画 45° 平等线 */
    /* 0.25 - 0.75：画洛伦兹曲线 */
    /* 0.75 - 1.00：面积高亮 + 基尼系数显现 */

    /* --- 45° 平等线 --- */
    var diagProgress = Math.min(1, progress / 0.25);
    if (diagProgress > 0) {
      var diagEnd = diagProgress;
      ctx.beginPath();
      ctx.moveTo(padL, padT + plotH);
      ctx.lineTo(padL + plotW * diagEnd, padT + plotH - plotH * diagEnd);
      ctx.strokeStyle = 'rgba(74, 127, 181, .7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      /* 标签 */
      if (diagProgress > 0.5) {
        ctx.fillStyle = '#4a7fb5';
        ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('完全平等线', padL + plotW * 0.55, padT + plotH * 0.5 - 10);
      }
    }

    /* --- 洛伦兹曲线 --- */
    var curveProgress = Math.min(1, Math.max(0, (progress - 0.25) / 0.5));
    if (curveProgress > 0) {
      var curveEnd = curveProgress;

      /* 曲线下方填充 */
      ctx.beginPath();
      ctx.moveTo(padL, padT + plotH);
      for (var x3 = 0; x3 <= curveEnd; x3 += 0.01) {
        var px3 = padL + x3 * plotW;
        var py3 = padT + plotH - lorenz(x3) * plotH;
        ctx.lineTo(px3, py3);
      }
      ctx.lineTo(padL + curveEnd * plotW, padT + plotH);
      ctx.closePath();
      var fillGrad = ctx.createLinearGradient(padL, padT, padL + plotW, padT + plotH);
      fillGrad.addColorStop(0, 'rgba(245, 179, 1, .25)');
      fillGrad.addColorStop(1, 'rgba(180, 124, 0, .15)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      /* 曲线 */
      ctx.beginPath();
      for (var x4 = 0; x4 <= curveEnd; x4 += 0.01) {
        var px4 = padL + x4 * plotW;
        var py4 = padT + plotH - lorenz(x4) * plotH;
        if (x4 === 0) ctx.moveTo(px4, py4);
        else ctx.lineTo(px4, py4);
      }
      ctx.strokeStyle = '#c0524a';
      ctx.lineWidth = 3;
      ctx.stroke();

      /* 当前点 */
      if (curveProgress < 1) {
        var curX = padL + curveEnd * plotW;
        var curY = padT + plotH - lorenz(curveEnd) * plotH;
        ctx.beginPath();
        ctx.arc(curX, curY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#c0524a';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      /* 曲线标签 */
      if (curveProgress > 0.4) {
        ctx.fillStyle = '#c0524a';
        ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('洛伦兹曲线', padL + plotW * 0.55, padT + plotH * 0.6);
      }
    }

    /* --- 面积 A 高亮 --- */
    var areaProgress = Math.min(1, Math.max(0, (progress - 0.75) / 0.25));
    if (areaProgress > 0) {
      ctx.strokeStyle = 'rgba(74, 127, 181, ' + (0.4 * areaProgress) + ')';
      ctx.lineWidth = 1;
      for (var x5 = 0; x5 <= 1; x5 += 0.02) {
        var px5 = padL + x5 * plotW;
        var pyDiag = padT + plotH - x5 * plotH;
        var pyCurve = padT + plotH - lorenz(x5) * plotH;
        if (pyDiag < pyCurve) continue;
        ctx.beginPath();
        ctx.moveTo(px5, pyDiag);
        ctx.lineTo(px5, pyCurve);
        ctx.stroke();
      }

      /* 面积 A 标签 */
      ctx.fillStyle = 'rgba(74, 127, 181, ' + areaProgress + ')';
      ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('面积 A', padL + plotW * 0.55, padT + plotH * 0.35);
    }

    /* --- 基尼系数 --- */
    var giniProgress = Math.min(1, Math.max(0, (progress - 0.85) / 0.15));
    if (giniProgress > 0) {
      var giniDisplay = gini.toFixed(2);
      var giniLabel = gini < 0.3 ? '较平等' : gini < 0.4 ? '相对合理' : gini < 0.5 ? '差距较大' : '差距悬殊';
      var giniColor = gini < 0.3 ? '#3f8f6b' : gini < 0.4 ? '#8a7340' : gini < 0.5 ? '#c47a2b' : '#c0524a';

      /* 半透明底板 */
      ctx.fillStyle = 'rgba(255, 253, 245, ' + (0.95 * giniProgress) + ')';
      ctx.strokeStyle = giniColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(padL + plotW / 2 - 110, padT + plotH / 2 - 45, 220, 90, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = giniColor;
      ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('基尼系数', padL + plotW / 2, padT + plotH / 2 - 20);

      ctx.font = 'bold 26px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(giniDisplay, padL + plotW / 2, padT + plotH / 2 + 8);

      ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(giniLabel, padL + plotW / 2, padT + plotH / 2 + 32);
    }

    /* 图例 */
    ctx.fillStyle = 'rgba(255, 253, 245, .92)';
    ctx.strokeStyle = 'rgba(180, 124, 0, .3)';
    ctx.beginPath();
    ctx.roundRect(20, 20, 240, 40, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('洛伦兹曲线与基尼系数', 36, 46);
  }
},
];