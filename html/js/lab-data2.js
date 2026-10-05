/* ============================================================
   数理化实验 · 数据文件 · 岁窦工具箱 V4.2
   30 个高中经典实验，覆盖数学 / 物理 / 化学
   ============================================================ */
window.LAB_EXPERIMENTS = [

/* ============================================================
   ═══════════════════ 数 学（10） ═══════════════════
   ============================================================ */

{
  id: 'math-pi-monte-carlo',
  subject: 'math',
  name: '蒙特卡洛方法估算 π',
  tags: ['概率', '统计', '数值方法'],
  desc: '用随机撒点的方式估算圆周率 π 的近似值。',
  purpose: '理解蒙特卡洛方法的基本思想：用随机采样的频率逼近概率。',
  principle: '在边长为 2 的正方形内均匀随机撒点。落在内切圆（半径 1）内的点数与总点数之比约为 π/4，因此 π ≈ 4M/N。',
  apparatus: '无（纯数值实验）',
  steps: [
    '在 [-1, 1] × [-1, 1] 的正方形内均匀随机生成一个点',
    '判断该点是否落在单位圆 x² + y² ≤ 1 内',
    '重复以上步骤 N 次，记录落在圆内的点数 M',
    '用公式 π ≈ 4M / N 估算 π 的值'
  ],
  phenomenon: '随着撒点数增加，估算值在 3.14 附近波动，逐渐趋近真实值 3.14159...',
  conclusion: '蒙特卡洛方法用随机采样频率逼近确定概率，误差与 √N 成反比。',
  notice: '随机点必须是均匀分布；估算误差约为 0.79/√N。',
  duration: 8,
  params: [
    { key: 'points', label: '总撒点数', min: 200, max: 5000, step: 100, default: 2000 }
  ],
  init: function (state) {
    state.points = [];
    state.total = 0;
    state.inside = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2;
    var R = Math.min(W, H) * 0.38;

    ctx.strokeStyle = '#d9cfa0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - R, cy - R, R * 2, R * 2);

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 2;
    ctx.stroke();

    var target = Math.min(params.points, Math.round(params.points * progress));
    var toAdd = target - state.total;
    for (var i = 0; i < toAdd; i++) {
      var x = Math.random() * 2 - 1;
      var y = Math.random() * 2 - 1;
      var isIn = x * x + y * y <= 1;
      state.points.push({ x: x, y: y, in: isIn });
      state.total++;
      if (isIn) state.inside++;
    }

    for (var j = 0; j < state.points.length; j++) {
      var p = state.points[j];
      ctx.fillStyle = p.in ? 'rgba(245, 179, 1, 0.65)' : 'rgba(74, 127, 181, 0.5)';
      ctx.beginPath();
      ctx.arc(cx + p.x * R, cy + p.y * R, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    var estimate = state.total > 0 ? (4 * state.inside / state.total) : 0;
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('总点数 N = ' + state.total, 20, 28);
    ctx.fillText('圆内点数 M = ' + state.inside, 20, 52);

    ctx.fillStyle = '#b47c00';
    ctx.font = 'bold 22px Consolas, Menlo, monospace';
    ctx.fillText('π ≈ ' + estimate.toFixed(6), 20, 88);

    ctx.fillStyle = '#8a7340';
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('真实值：3.141593', 20, 112);
    var err = state.total > 0 ? Math.abs(estimate - Math.PI) : 0;
    ctx.fillText('误差：' + err.toFixed(6), 20, 132);
  }
},

{
  id: 'math-normal-distribution',
  subject: 'math',
  name: '抛硬币与正态分布',
  tags: ['概率', '统计', '分布'],
  desc: '模拟抛 n 枚硬币，观察正面朝上次数分布向正态分布收敛。',
  purpose: '直观理解二项分布与正态分布的关系，以及中心极限定理。',
  principle: '抛 n 枚均匀硬币，正面朝上次数 X 服从二项分布 B(n, 0.5)。当 n 增大时，X 的分布趋于正态分布。',
  apparatus: '无（数值模拟）',
  steps: [
    '设定每次试验抛的硬币数 n',
    '重复进行 m 次试验，记录每次正面朝上的次数',
    '统计各次数出现的频率，画出频率直方图',
    '观察分布形状随 n 的变化'
  ],
  phenomenon: 'n 较小时分布不对称；n 增大后，直方图呈钟形，趋近正态分布曲线。',
  conclusion: '二项分布在 n 较大时可用正态分布近似，即中心极限定理的体现。',
  notice: '每次抛 n 枚硬币，正面朝上次数 X ~ B(n, 0.5)。',
  duration: 8,
  params: [
    { key: 'n', label: '每次硬币数 n', min: 2, max: 50, step: 1, default: 20 },
    { key: 'm', label: '试验次数 m', min: 200, max: 5000, step: 100, default: 2000 }
  ],
  init: function (state, params) {
    state.counts = new Array(params.n + 1).fill(0);
    state.done = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    var target = Math.round(params.m * progress);
    while (state.done < target) {
      var sum = 0;
      for (var i = 0; i < params.n; i++) {
        if (Math.random() < 0.5) sum++;
      }
      state.counts[sum]++;
      state.done++;
    }

    var n = params.n;
    var m = state.done;

    var padL = 60, padR = 30, padT = 40, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    var maxC = 1;
    for (var j = 0; j <= n; j++) {
      if (state.counts[j] > maxC) maxC = state.counts[j];
    }

    var barW = plotW / (n + 1);
    for (var k = 0; k <= n; k++) {
      var h = plotH * (state.counts[k] / maxC);
      var x = padL + k * barW + 1;
      var y = padT + plotH - h;

      var grad = ctx.createLinearGradient(0, y, 0, padT + plotH);
      grad.addColorStop(0, '#ffd54f');
      grad.addColorStop(1, '#f5b301');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW - 2, h);
    }

    var mean = n / 2;
    var sd = Math.sqrt(n) / 2;
    ctx.beginPath();
    for (var t = 0; t <= n; t += 0.1) {
      var pdf = Math.exp(-((t - mean) * (t - mean)) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
      var pdfMax = 1 / (sd * Math.sqrt(2 * Math.PI));
      var yy = padT + plotH - plotH * (pdf / pdfMax) * 0.95;
      var xx = padL + (t + 0.5) * barW;
      if (t === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('正面朝上次数', padL + plotW / 2, H - 18);
    ctx.textAlign = 'left';
    ctx.fillText('0', padL - 4, padT + plotH + 16);
    ctx.fillText(String(n), padL + plotW - 8, padT + plotH + 16);

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('每次抛 ' + n + ' 枚，已试验 ' + m + ' 次', padL, 24);

    ctx.fillStyle = '#c0524a';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('— 正态拟合曲线', padL + plotW - 140, 24);
  }
},

{
  id: 'math-unit-circle',
  subject: 'math',
  name: '单位圆与三角函数',
  tags: ['三角函数', '单位圆'],
  desc: '单位圆上的动点与正弦曲线同步展开，直观看正弦函数的生成。',
  purpose: '理解正弦、余弦函数与单位圆的几何关系。',
  principle: '单位圆上一点的坐标 (cos θ, sin θ) 随角度 θ 变化。将 θ 从 0 到 2π 展开，纵坐标随 θ 变化即为正弦曲线。',
  apparatus: '无',
  steps: [
    '在单位圆上取一点 P，对应角度 θ',
    '观察 P 的纵坐标 sin θ 随 θ 变化',
    '把 θ 展开到坐标系中，得到 y = sin θ 的曲线',
    '同理可得余弦函数'
  ],
  phenomenon: '随着角度增加，圆上点的纵坐标上下波动，展开后即为正弦曲线。',
  conclusion: '正弦函数是单位圆上点的纵坐标随角度的变化规律，周期为 2π。',
  notice: '角度用弧度制；一个完整周期对应角度增加 2π。',
  duration: 10,
  params: [],
  init: function (state) {
    state.angle = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var circleCx = 150, circleCy = H / 2 - 40;
    var R = 90;
    var theta = progress * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(circleCx, circleCy, R, 0, Math.PI * 2);
    ctx.strokeStyle = '#d9cfa0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(circleCx - R - 10, circleCy);
    ctx.lineTo(circleCx + R + 10, circleCy);
    ctx.moveTo(circleCx, circleCy - R - 10);
    ctx.lineTo(circleCx, circleCy + R + 10);
    ctx.strokeStyle = '#b8a77a';
    ctx.stroke();

    var px2 = circleCx + R * Math.cos(theta);
    var py2 = circleCy - R * Math.sin(theta);

    ctx.beginPath();
    ctx.moveTo(circleCx, circleCy);
    ctx.lineTo(px2, py2);
    ctx.strokeStyle = '#f5b301';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px2, py2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#b47c00';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px2, py2);
    ctx.lineTo(px2, circleCy);
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    var originX = 300, originY = circleCy;
    var plotW = W - originX - 40;
    var amp = R;

    ctx.beginPath();
    for (var t = 0; t <= theta; t += 0.02) {
      var x = originX + plotW * (t / (Math.PI * 2));
      var y = originY - amp * Math.sin(t);
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    var curX = originX + plotW * (theta / (Math.PI * 2));
    var curY = originY - amp * Math.sin(theta);
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#c0524a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px2, py2);
    ctx.lineTo(curX, curY);
    ctx.strokeStyle = 'rgba(245,179,1,.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('θ = ' + (theta).toFixed(2) + ' rad', 20, 24);
    ctx.fillText('sin θ = ' + Math.sin(theta).toFixed(3), 20, 44);

    ctx.fillStyle = '#c0524a';
    ctx.fillText('y = sin θ', originX + 8, originY - amp - 6);
  }
},

{
  id: 'math-function-transform',
  subject: 'math',
  name: '函数图像变换',
  tags: ['函数', '图像变换'],
  desc: '调节 a、b、c 三个参数，观察 y = a·sin(bx + c) 的伸缩与平移。',
  purpose: '理解振幅、周期、相位三个参数对正弦函数图像的影响。',
  principle: 'y = A·sin(ωx + φ) 中，A 控制振幅，ω 控制周期 T = 2π/ω，φ 控制水平位移。',
  apparatus: '无',
  steps: [
    '固定一条基准正弦曲线 y = sin x',
    '逐步调节振幅 A，观察图像上下伸缩',
    '调节 ω，观察周期变化',
    '调节 φ，观察左右平移'
  ],
  phenomenon: '参数 a 变大时，波形上下拉伸；b 变大时波形在水平方向压缩；c 变化时波形左右平移。',
  conclusion: 'y = a·sin(bx + c) 中，a 为振幅，周期为 2π/b，初相为 c。',
  notice: '相位 c 的影响是「左加右减」；负的 a 会让图像上下翻转。',
  duration: 4,
  params: [
    { key: 'a', label: '振幅 a', min: 0.2, max: 3, step: 0.1, default: 1 },
    { key: 'b', label: '角频率 b', min: 0.2, max: 4, step: 0.1, default: 1 },
    { key: 'c', label: '初相 c', min: -3, max: 3, step: 0.1, default: 0 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 50, padR = 40, padT = 40, padB = 50;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var originY = padT + plotH / 2;
    var originX = padL;

    /* 网格 */
    ctx.strokeStyle = 'rgba(245,179,1,.15)';
    ctx.lineWidth = 1;
    for (var i = 1; i <= 8; i++) {
      var y = padT + plotH * i / 8;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }
    for (var j = 1; j <= 12; j++) {
      var x = padL + plotW * j / 12;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
    }

    /* 坐标轴 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, originY);
    ctx.lineTo(padL + plotW, originY);
    ctx.moveTo(padL + plotW / 2, padT);
    ctx.lineTo(padL + plotW / 2, padT + plotH);
    ctx.stroke();

    /* 范围：x ∈ [-2π, 2π] */
    var xMin = -2 * Math.PI, xMax = 2 * Math.PI;

    function toPx(x) {
      return padL + (x - xMin) / (xMax - xMin) * plotW;
    }
    function toPy(y) {
      return originY - y * (plotH / 6); /* y 范围 ±3 */
    }

    /* 基准曲线 y = sin(x) */
    ctx.beginPath();
    for (var t = xMin; t <= xMax; t += 0.02) {
      var v = Math.sin(t);
      var px = toPx(t), py = toPy(v);
      if (t === xMin) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(138,115,64,.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 当前曲线 */
    ctx.beginPath();
    for (var t2 = xMin; t2 <= xMax; t2 += 0.02) {
      var v2 = params.a * Math.sin(params.b * t2 + params.c);
      var px2 = toPx(t2), py2 = toPy(v2);
      if (t2 === xMin) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('y = ' + params.a.toFixed(1) + ' · sin(' + params.b.toFixed(1) + 'x + ' + params.c.toFixed(1) + ')', 20, 26);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('周期 T = ' + (2 * Math.PI / params.b).toFixed(3), 20, 48);
    ctx.fillText('参考：虚线为 y = sin x', 20, 68);
  }
},

{
  id: 'math-sequence-limit',
  subject: 'math',
  name: '数列极限与部分和',
  tags: ['数列', '极限', '级数'],
  desc: '观察等比级数 1 + 1/2 + 1/4 + ... 的部分和逐步逼近 2。',
  purpose: '理解无穷级数的收敛性，以及部分和数列的极限。',
  principle: '等比级数 ∑(1/2)^n 的公比 |q| < 1，收敛于 a₁/(1-q) = 1/(1-1/2) = 2。',
  apparatus: '无',
  steps: [
    '写出级数前 n 项',
    '逐项累加得到部分和 S_n',
    '在数轴上标出 S_n 的位置',
    '观察 S_n 逐步逼近极限值 2'
  ],
  phenomenon: '随着项数增加，部分和逐步逼近 2，但永远不超过 2。',
  conclusion: '公比绝对值小于 1 的等比级数收敛，极限为 a₁/(1-q)。',
  notice: '公比 |q| ≥ 1 时级数发散，没有极限。',
  duration: 8,
  params: [
    { key: 'q', label: '公比 q（0 < q < 1）', min: 0.1, max: 0.95, step: 0.05, default: 0.5 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var q = params.q;
    var limit = 1 / (1 - q);

    var padL = 60, padR = 40, padT = 60, padB = 80;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    /* 数轴 */
    var axisY = padT + plotH / 2;
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, axisY);
    ctx.lineTo(padL + plotW, axisY);
    ctx.stroke();

    /* 刻度 */
    var xMax = limit * 1.15;
    function toPx(v) {
      return padL + (v / xMax) * plotW;
    }

    for (var t = 0; t <= limit + 0.5; t += 0.5) {
      var x = toPx(t);
      ctx.beginPath();
      ctx.moveTo(x, axisY - 5);
      ctx.lineTo(x, axisY + 5);
      ctx.strokeStyle = '#8a7340';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#8a7340';
      ctx.font = '11px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t.toFixed(1), x, axisY + 20);
    }

    /* 极限竖线 */
    var limX = toPx(limit);
    ctx.beginPath();
    ctx.moveTo(limX, padT);
    ctx.lineTo(limX, padT + plotH);
    ctx.strokeStyle = 'rgba(192,82,74,.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#c0524a';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('极限 = ' + limit.toFixed(3), limX, padT - 10);

    /* 部分和 */
    var n = Math.floor(progress * 40);
    var Sn = 0;
    var points = [];
    for (var i = 0; i <= n; i++) {
      var term = Math.pow(q, i);
      Sn += term;
      points.push(Sn);
    }

    /* 画阶梯 */
    for (var k = 0; k < points.length; k++) {
      var y = padT + 40 + (k / 40) * plotH * 0.6;
      var x2 = toPx(points[k]);
      ctx.beginPath();
      ctx.arc(x2, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f5b301';
      ctx.fill();
      ctx.strokeStyle = '#b47c00';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (k > 0) {
        var py = padT + 40 + ((k - 1) / 40) * plotH * 0.6;
        ctx.beginPath();
        ctx.moveTo(toPx(points[k - 1]), py);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(180,124,0,.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    /* 读数 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('项数 n = ' + n, 20, 24);
    ctx.fillText('部分和 S_n = ' + (points[points.length - 1] || 0).toFixed(6), 20, 46);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('与极限的差：' + Math.abs(limit - (points[points.length - 1] || 0)).toFixed(6), 20, 68);
  }
},

{
  id: 'math-fibonacci',
  subject: 'math',
  name: '斐波那契与黄金比例',
  tags: ['数列', '黄金比例', '几何'],
  desc: '用正方形拼接成螺旋，观察相邻斐波那契数之比逼近黄金比例 1.618...',
  purpose: '理解斐波那契数列与黄金比例的关系，以及它在自然界中的体现。',
  principle: '斐波那契数列：F(n) = F(n-1) + F(n-2)，F(1)=1, F(2)=1。相邻项之比趋近 φ = (1+√5)/2 ≈ 1.618。',
  apparatus: '无',
  steps: [
    '写出斐波那契数列 1, 1, 2, 3, 5, 8, 13, 21...',
    '按边长用正方形依次拼接',
    '每个正方形内画 1/4 圆弧，形成螺旋',
    '计算相邻两项之比，观察趋近黄金比例'
  ],
  phenomenon: '正方形拼接形成螺旋曲线；相邻项之比从 1、2、1.5、1.667... 逐渐逼近 1.618。',
  conclusion: '斐波那契数列相邻项之比趋近黄金比例 φ，螺旋结构在自然界广泛存在。',
  notice: '黄金比例 φ = (1+√5)/2 ≈ 1.6180339887。',
  duration: 8,
  params: [],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W * 0.55, cy = H * 0.52;

    /* 生成斐波那契数列 */
    var fib = [1, 1];
    for (var i = 2; i < 12; i++) fib.push(fib[i - 1] + fib[i - 2]);

    /* 当前显示到第几个 */
    var count = Math.floor(progress * 10) + 1;
    if (count > 10) count = 10;

    /* 缩放因子 */
    var total = 0;
    for (var k = 0; k < count; k++) total += fib[k];
    var scale = Math.min(W, H) * 0.7 / total;

    /* 画正方形与螺旋 */
    var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    var pos = { x: 0, y: 0 };
    /* 起始位置：让螺旋居中 */
    var cx0 = 0, cy0 = 0;

    /* 先计算总包围盒 */
    var minX = 0, maxX = 0, minY = 0, maxY = 0;
    var tempPos = { x: 0, y: 0 };
    var corners = [{ x: 0, y: 0 }];
    for (var m = 0; m < count; m++) {
      var size = fib[m];
      var d = dirs[m % 4];
      var nx, ny;
      if (m === 0) { tempPos = { x: 0, y: 0 }; }
      else if (m === 1) { tempPos = { x: fib[0], y: 0 }; }
      /* 简化：用统一绘制路径 */
    }

    /* 手动构造螺旋位置（经典黄金螺旋） */
    var squares = [];
    var px = 0, py = 0;
    /* 用逐次旋转的方式生成 */
    for (var s = 0; s < count; s++) {
      var sz = fib[s];
      var dIdx = s % 4;
      var sq = { x: px, y: py, size: sz, dir: dIdx };
      squares.push(sq);
      if (dIdx === 0) px += sz;
      else if (dIdx === 1) py += sz;
      else if (dIdx === 2) px -= sz;
      else py -= sz;
    }

    /* 计算包围盒 */
    var bMinX = Infinity, bMinY = Infinity, bMaxX = -Infinity, bMaxY = -Infinity;
    squares.forEach(function (sq) {
      var x1 = sq.x, y1 = sq.y;
      var x2 = sq.x + (sq.dir === 0 ? sq.size : (sq.dir === 2 ? -sq.size : sq.size));
      var y2 = sq.y + sq.size;
      /* 简化：直接按方向累计 */
    });
    /* 重新计算：用 span */
    var minPX = 0, maxPX = 0, minPY = 0, maxPY = 0;
    var cpx = 0, cpy = 0;
    for (var q = 0; q < count; q++) {
      var dq = q % 4;
      if (dq === 0) cpx += fib[q];
      else if (dq === 1) cpy += fib[q];
      else if (dq === 2) cpx -= fib[q];
      else cpy -= fib[q];
      if (cpx < minPX) minPX = cpx;
      if (cpx > maxPX) maxPX = cpx;
      if (cpy < minPY) minPY = cpy;
      if (cpy > maxPY) maxPY = cpy;
    }
    var spanX = maxPX - minPX;
    var spanY = maxPY - minPY;
    var offsetX = (W - spanX * scale) / 2 - minPX * scale;
    var offsetY = (H - spanY * scale) / 2 - minPY * scale;

    /* 画正方形 */
    var cpx2 = 0, cpy2 = 0;
    var arcs = [];
    for (var r = 0; r < count; r++) {
      var sz2 = fib[r];
      var dIdx2 = r % 4;
      var sx = cpx2, sy = cpy2;
      var x1 = offsetX + sx * scale, y1 = offsetY + sy * scale;

      /* 每个方向画对应的正方形 */
      var x2, y2, w2, h2;
      if (dIdx2 === 0) { x2 = x1; y2 = y1 - sz2 * scale; w2 = sz2 * scale; h2 = sz2 * scale; }
      else if (dIdx2 === 1) { x2 = x1 - sz2 * scale; y2 = y1; w2 = sz2 * scale; h2 = sz2 * scale; }
      else if (dIdx2 === 2) { x2 = x1 - sz2 * scale; y2 = y1 - sz2 * scale; w2 = sz2 * scale; h2 = sz2 * scale; }
      else { x2 = x1; y2 = y1 - sz2 * scale; w2 = sz2 * scale; h2 = sz2 * scale; }

      ctx.strokeStyle = '#b47c00';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(Math.min(x2, x2 + w2), Math.min(y2, y2 + h2), Math.abs(w2), Math.abs(h2));

      /* 记录圆弧参数 */
      var arcCx, arcCy, arcR, arcStart, arcEnd;
      var rr = sz2 * scale;
      if (dIdx2 === 0) {
        /* 向下，从右下到左下，圆心在左上 */
        arcCx = x1; arcCy = y1 - rr;
        arcStart = 0; arcEnd = Math.PI / 2;
      } else if (dIdx2 === 1) {
        arcCx = x1 - rr; arcCy = y1;
        arcStart = Math.PI / 2; arcEnd = Math.PI;
      } else if (dIdx2 === 2) {
        arcCx = x1 - rr; arcCy = y1 - rr;
        arcStart = Math.PI; arcEnd = Math.PI * 1.5;
      } else {
        arcCx = x1; arcCy = y1 - rr;
        arcStart = Math.PI * 1.5; arcEnd = Math.PI * 2;
      }
      arcs.push({ cx: arcCx, cy: arcCy, r: rr, s: arcStart, e: arcEnd });

      if (dIdx2 === 0) cpx2 += sz2;
      else if (dIdx2 === 1) cpy2 += sz2;
      else if (dIdx2 === 2) cpx2 -= sz2;
      else cpy2 -= sz2;
    }

    /* 画螺旋 */
    ctx.beginPath();
    arcs.forEach(function (a) {
      ctx.moveTo(a.cx + a.r * Math.cos(a.s), a.cy + a.r * Math.sin(a.s));
      ctx.arc(a.cx, a.cy, a.r, a.s, a.e);
    });
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 斐波那契数列与比例 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('斐波那契：', 20, 24);
    ctx.font = '12px Consolas, monospace';
    ctx.fillText(fib.slice(0, count).join(', '), 20, 44);

    if (count >= 2) {
      var ratio = fib[count - 1] / fib[count - 2];
      ctx.fillStyle = '#c0524a';
      ctx.font = 'bold 14px Consolas, monospace';
      ctx.fillText('F(' + count + ') / F(' + (count - 1) + ') = ' + ratio.toFixed(6), 20, 72);
      ctx.fillStyle = '#8a7340';
      ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText('黄金比例 φ ≈ 1.618034', 20, 94);
    }
  }
},

{
  id: 'math-pascal-triangle',
  subject: 'math',
  name: '杨辉三角与二项式',
  tags: ['组合数学', '二项式定理'],
  desc: '逐行生成杨辉三角，点击任意数字可看二项式展开系数。',
  purpose: '理解杨辉三角的构造规律，以及它与二项式展开式的关系。',
  principle: '杨辉三角每行两端为 1，中间每个数等于它上方两数之和。第 n 行第 k 个数为 C(n-1, k-1)。',
  apparatus: '无',
  steps: [
    '第一行写 1',
    '第二行写 1, 1',
    '之后每行两端为 1，中间数等于上方两数之和',
    '观察第 n 行就是 (a+b)^(n-1) 的展开系数'
  ],
  phenomenon: '三角逐行生成，数字逐渐增大；行内数字对称，每行和为 2^(n-1)。',
  conclusion: '杨辉三角的第 n 行是二项式 (a+b)^(n-1) 展开式的系数。',
  notice: '第 n 行（从 0 开始计数）对应 (a+b)^n 的展开。',
  duration: 6,
  params: [
    { key: 'rows', label: '生成行数', min: 3, max: 12, step: 1, default: 9 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var rows = params.rows;
    var showRows = Math.min(rows, Math.floor(progress * rows) + 1);

    /* 计算三角 */
    var triangle = [];
    for (var i = 0; i < rows; i++) {
      var row = [1];
      for (var j = 1; j < i; j++) {
        row.push(triangle[i - 1][j - 1] + triangle[i - 1][j]);
      }
      if (i > 0) row.push(1);
      triangle.push(row);
    }

    var cellW = Math.min(W / (rows * 1.6), 44);
    var cellH = Math.min(H / (rows * 1.5), 36);
    var startY = H / 2 - rows * cellH / 2;
    var midX = W / 2;

    for (var r = 0; r < showRows; r++) {
      var rowArr = triangle[r];
      var rowW = rowArr.length * cellW;
      var startX = midX - rowW / 2;

      for (var c = 0; c < rowArr.length; c++) {
        var x = startX + c * cellW + cellW / 2;
        var y = startY + r * cellH + cellH / 2;

        /* 圆角矩形 */
        var rx = x - cellW / 2 + 2;
        var ry = y - cellH / 2 + 2;
        var rw = cellW - 4;
        var rh = cellH - 4;
        var rad = 5;

        var grad = ctx.createLinearGradient(rx, ry, rx, ry + rh);
        grad.addColorStop(0, '#fff4cc');
        grad.addColorStop(1, '#ffe9a8');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(rx + rad, ry);
        ctx.lineTo(rx + rw - rad, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
        ctx.lineTo(rx + rw, ry + rh - rad);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
        ctx.lineTo(rx + rad, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
        ctx.lineTo(rx, ry + rad);
        ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(180,124,0,.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        /* 数字 */
        var num = rowArr[c];
        var fontSize = num > 999 ? 10 : (num > 99 ? 12 : 14);
        ctx.fillStyle = '#8d5a00';
        ctx.font = 'bold ' + fontSize + 'px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(num), x, y);
      }
    }
    ctx.textBaseline = 'alphabetic';

    /* 顶部说明 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('杨辉三角（前 ' + showRows + ' 行）', 20, 26);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('第 n 行对应 (a+b)^(n-1) 的展开系数', 20, 48);
  }
},

{
  id: 'math-law-large-numbers',
  subject: 'math',
  name: '大数定律（频率稳定性）',
  tags: ['概率', '大数定律'],
  desc: '重复抛硬币，观察正面频率随试验次数增加逐步稳定在 0.5 附近。',
  purpose: '直观理解大数定律：随机事件的频率随试验次数增加趋于稳定。',
  principle: '伯努利大数定律：当试验次数 n → ∞ 时，事件发生的频率依概率收敛于其概率。',
  apparatus: '无',
  steps: [
    '重复进行抛硬币试验',
    '记录累计正面次数与频率',
    '绘制频率随试验次数变化的曲线',
    '观察频率逐步稳定于 0.5'
  ],
  phenomenon: '开始频率波动大；随试验次数增加，波动逐渐减小，曲线越来越贴近 0.5 这条水平线。',
  conclusion: '随机事件的频率在大量重复试验后趋于稳定，即大数定律的体现。',
  notice: '频率是试验值的近似；概率是理论值。试验次数越多，频率越接近概率。',
  duration: 8,
  params: [
    { key: 'total', label: '总试验次数', min: 100, max: 10000, step: 100, default: 3000 }
  ],
  init: function (state) {
    state.heads = 0;
    state.trials = 0;
    state.points = [];
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 60, padR = 40, padT = 60, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var target = Math.round(params.total * progress);
    while (state.trials < target) {
      if (Math.random() < 0.5) state.heads++;
      state.trials++;
      if (state.trials % Math.max(1, Math.floor(params.total / 300)) === 0 || state.trials < 20) {
        state.points.push({
          n: state.trials,
          freq: state.heads / state.trials
        });
      }
    }

    /* 坐标轴 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    /* 0.5 参考线 */
    var refY = padT + plotH * 0.5;
    ctx.beginPath();
    ctx.moveTo(padL, refY);
    ctx.lineTo(padL + plotW, refY);
    ctx.strokeStyle = 'rgba(192,82,74,.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#c0524a';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('0.5', padL - 6, refY + 4);

    ctx.textAlign = 'left';
    ctx.fillText('1.0', padL - 8, padT + 4);
    ctx.fillText('0.0', padL - 8, padT + plotH + 4);

    /* 频率曲线 */
    if (state.points.length > 1) {
      ctx.beginPath();
      state.points.forEach(function (p, i) {
        var x = padL + (p.n / params.total) * plotW;
        var y = padT + plotH - p.freq * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#b47c00';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      /* 当前点 */
      var last = state.points[state.points.length - 1];
      var lx = padL + (last.n / params.total) * plotW;
      var ly = padT + plotH - last.freq * plotH;
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#c0524a';
      ctx.fill();
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('已试验 ' + state.trials + ' 次', 20, 26);
    ctx.fillText('正面次数 ' + state.heads + '，频率 ' + (state.trials ? (state.heads / state.trials).toFixed(5) : '—'), 20, 48);

    /* 横轴标签 */
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('试验次数', padL + plotW / 2, H - 22);
  }
},

{
  id: 'math-linear-regression',
  subject: 'math',
  name: '线性回归与最小二乘',
  tags: ['统计', '回归', '拟合'],
  desc: '用最小二乘法对散点数据进行线性拟合，显示残差。',
  purpose: '理解最小二乘法的基本原理：使残差平方和最小。',
  principle: '对数据点 (xi, yi)，最小二乘拟合直线 y = bx + a 的斜率和截距由公式给出，使 ∑(yi - ŷi)² 最小。',
  apparatus: '无',
  steps: [
    '生成或输入一组数据点',
    '用最小二乘法计算拟合直线的斜率和截距',
    '画出拟合直线',
    '观察残差（点到直线的竖直距离）'
  ],
  phenomenon: '拟合直线穿过数据中心，残差正负相消；相关系数 R² 接近 1 时拟合越好。',
  conclusion: '最小二乘法通过最小化残差平方和，得到最优拟合直线。',
  notice: 'R² 越接近 1，说明拟合越好；接近 0 说明几乎无线性关系。',
  duration: 6,
  params: [
    { key: 'slope', label: '真实斜率', min: -2, max: 2, step: 0.1, default: 0.8 },
    { key: 'noise', label: '噪声幅度', min: 0, max: 30, step: 1, default: 10 }
  ],
  init: function (state, params) {
    state.points = [];
    for (var i = 0; i < 30; i++) {
      var x = i / 30;
      var noise = (Math.random() - 0.5) * (params.noise / 100) * 2;
      var y = params.slope * x + 0.2 + noise;
      state.points.push({ x: x, y: y });
    }
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 60, padR = 40, padT = 60, padB = 60;
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

    function toPx(x) { return padL + x * plotW; }
    function toPy(y) { return padT + plotH - y * plotH; }

    /* 计算回归 */
    var n = state.points.length;
    var sx = 0, sy = 0, sxx = 0, sxy = 0;
    state.points.forEach(function (p) {
      sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y;
    });
    var b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    var a = (sy - b * sx) / n;

    /* 残差平方和与 R² */
    var ssRes = 0, ssTot = 0;
    var meanY = sy / n;
    state.points.forEach(function (p) {
      var pred = a + b * p.x;
      ssRes += (p.y - pred) * (p.y - pred);
      ssTot += (p.y - meanY) * (p.y - meanY);
    });
    var r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    /* 逐点绘制（按进度） */
    var showCount = Math.max(1, Math.round(progress * n));
    if (progress < 1) {
      for (var i = 0; i < showCount; i++) {
        var p = state.points[i];
        var px = toPx(p.x), py = toPy(p.y);
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#4a7fb5';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else {
      /* 全部显示 */
      state.points.forEach(function (p) {
        var px = toPx(p.x), py = toPy(p.y);
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#4a7fb5';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      /* 拟合直线 */
      ctx.beginPath();
      ctx.moveTo(toPx(0), toPy(a));
      ctx.lineTo(toPx(1), toPy(a + b));
      ctx.strokeStyle = '#c0524a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      /* 残差线 */
      state.points.forEach(function (p) {
        var pred = a + b * p.x;
        var px = toPx(p.x);
        ctx.beginPath();
        ctx.moveTo(px, toPy(p.y));
        ctx.lineTo(px, toPy(pred));
        ctx.strokeStyle = 'rgba(192,82,74,.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('拟合直线：y = ' + b.toFixed(4) + 'x + ' + a.toFixed(4), 20, 26);
    ctx.fillStyle = '#8a7340';
    ctx.fillText('R² = ' + r2.toFixed(5) + '（越接近 1 拟合越好）', 20, 48);
    ctx.fillText('残差平方和 = ' + ssRes.toFixed(5), 20, 68);
  }
},

{
  id: 'math-koch-snowflake',
  subject: 'math',
  name: '科赫雪花与分形',
  tags: ['分形', '几何', '迭代'],
  desc: '用迭代方式生成科赫雪花曲线，观察每层周长趋于无穷但面积有限。',
  purpose: '理解分形的自相似性与「有限面积、无限周长」的反直觉结论。',
  principle: '科赫雪花从等边三角形出发，每边三等分，中间一段向外凸出成新的等边三角形。反复迭代，边数每次 ×4，边长每次 ×1/3，周长趋于无穷；但面积收敛于有限值。',
  apparatus: '无',
  steps: [
    '画一个等边三角形',
    '每条边三等分，中间段替换为向外凸出的小三角形',
    '对每一条新边重复步骤 2',
    '迭代若干次后观察雪花轮廓'
  ],
  phenomenon: '随着迭代次数增加，曲线越来越精细；周长越来越大，但面积始终小于某个上界。',
  conclusion: '科赫雪花是典型的分形，具有自相似性，周长为无穷而面积为有限。',
  notice: '分形维数 D ≈ 1.2618（介于直线 1 和平面 2 之间）。',
  duration: 6,
  params: [
    { key: 'levels', label: '迭代层数', min: 0, max: 5, step: 1, default: 4 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2 + 30;
    var R = Math.min(W, H) * 0.35;

    /* 初始三角形顶点 */
    function triangle(cx, cy, R) {
      var pts = [];
      for (var i = 0; i < 3; i++) {
        var ang = -Math.PI / 2 + i * 2 * Math.PI / 3;
        pts.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
      }
      pts.push(pts[0]);
      return pts;
    }

    function kochPoint(a, b, sign) {
      var dx = b[0] - a[0];
      var dy = b[1] - a[1];
      var p1 = [a[0] + dx / 3, a[1] + dy / 3];
      var p3 = [a[0] + 2 * dx / 3, a[1] + 2 * dy / 3];
      /* 旋转 -60°（向外） */
      var angle = sign * (-Math.PI / 3);
      var mdx = p3[0] - p1[0];
      var mdy = p3[1] - p1[1];
      var p2 = [
        p1[0] + mdx * Math.cos(angle) - mdy * Math.sin(angle),
        p1[1] + mdx * Math.sin(angle) + mdy * Math.cos(angle)
      ];
      return [p1, p2, p3];
    }

    function kochIterate(pts, sign) {
      var out = [];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1];
        var mid = kochPoint(a, b, sign);
        out.push(a, mid[0], mid[1], mid[2]);
      }
      out.push(pts[pts.length - 1]);
      return out;
    }

    var pts = triangle(cx, cy, R);
    var levels = params.levels;
    var showLevels = Math.min(levels, Math.floor(progress * levels) + 1);

    for (var i = 0; i < showLevels; i++) {
      pts = kochIterate(pts, 1);
    }

    /* 绘制 */
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var j = 1; j < pts.length; j++) {
      ctx.lineTo(pts[j][0], pts[j][1]);
    }
    ctx.closePath();

    var grad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    grad.addColorStop(0, 'rgba(255,213,79,.25)');
    grad.addColorStop(1, 'rgba(245,179,1,.35)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    /* 文字 */
    var perim = 3 * Math.pow(4 / 3, showLevels);
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('迭代层数：' + showLevels, 20, 26);
    ctx.fillText('边数：3 × 4^' + showLevels + ' = ' + (3 * Math.pow(4, showLevels)), 20, 48);
    ctx.fillText('相对周长（初始为 1）：' + perim.toFixed(4), 20, 70);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('周长趋于无穷，面积收敛于有限值', 20, 94);
  }
},

/* ============================================================
   ═══════════════════ 物 理（10） ═══════════════════
   ============================================================ */

{
  id: 'physics-free-fall',
  subject: 'physics',
  name: '自由落体运动',
  tags: ['运动学', '自由落体'],
  desc: '观察小球在重力作用下下落，位置、速度、加速度实时变化。',
  purpose: '验证自由落体运动是初速度为零、加速度为 g 的匀加速直线运动。',
  principle: '自由落体：初速 v₀ = 0，加速度 a = g。位移 h = ½gt²，速度 v = gt。',
  apparatus: '打点计时器、纸带、重锤、刻度尺',
  steps: [
    '将打点计时器固定在铁架台上',
    '纸带穿过计时器，一端固定重锤',
    '接通电源，释放重锤',
    '分析纸带，测量相邻点间距'
  ],
  phenomenon: '重锤加速下落，纸带上的点间距逐渐增大，相邻间距之比接近 1:3:5:7...',
  conclusion: '自由落体是初速度为零、加速度为 g 的匀加速直线运动。',
  notice: '实际实验需考虑空气阻力；g 约为 9.8 m/s²，与纬度、海拔有关。',
  duration: 5,
  params: [
    { key: 'g', label: '重力加速度 g', min: 1, max: 20, step: 0.1, default: 9.8 },
    { key: 'h', label: '初始高度 h（米）', min: 5, max: 100, step: 5, default: 45 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var g = params.g;
    var h0 = params.h;

    var padT = 60, padB = 60;
    var plotH = H - padT - padB;
    var ballX = W * 0.4;

    /* 落地时间 */
    var tFall = Math.sqrt(2 * h0 / g);
    var t = progress * tFall;
    var h = h0 - 0.5 * g * t * t;
    var v = g * t;

    /* 竖直参照系 */
    var pxPerM = plotH / h0;
    var ballY = padT + (h0 - h) * pxPerM;

    /* 画竖向轨道 */
    ctx.strokeStyle = '#d9cfa0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(ballX, padT);
    ctx.lineTo(ballX, padT + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 高度刻度 */
    ctx.fillStyle = '#8a7340';
    ctx.font = '11px Consolas, monospace';
    ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var hMark = h0 * i / 5;
      var yMark = padT + (h0 - hMark) * pxPerM;
      ctx.fillText(hMark.toFixed(0) + ' m', ballX - 15, yMark + 3);
      ctx.beginPath();
      ctx.moveTo(ballX - 8, yMark);
      ctx.lineTo(ballX - 4, yMark);
      ctx.strokeStyle = '#8a7340';
      ctx.stroke();
    }

    /* 小球 */
    ctx.beginPath();
    ctx.arc(ballX, ballY, 16, 0, Math.PI * 2);
    var grad = ctx.createRadialGradient(ballX - 5, ballY - 5, 3, ballX, ballY, 16);
    grad.addColorStop(0, '#ffe9a8');
    grad.addColorStop(1, '#b47c00');
    ctx.fillStyle = grad;
    ctx.fill();

    /* 位移、速度矢量 */
    var vPx = v * 3;
    ctx.beginPath();
    ctx.moveTo(ballX + 30, ballY);
    ctx.lineTo(ballX + 30, ballY + Math.min(vPx, plotH * 0.6));
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 3;
    ctx.stroke();
    /* 箭头 */
    ctx.beginPath();
    ctx.moveTo(ballX + 30, ballY + Math.min(vPx, plotH * 0.6));
    ctx.lineTo(ballX + 24, ballY + Math.min(vPx, plotH * 0.6) - 8);
    ctx.lineTo(ballX + 36, ballY + Math.min(vPx, plotH * 0.6) - 8);
    ctx.closePath();
    ctx.fillStyle = '#4a7fb5';
    ctx.fill();

    /* 读数面板 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('下落时间 t = ' + t.toFixed(3) + ' s', 20, 26);
    ctx.fillText('下落高度 h = ' + (h0 - h).toFixed(3) + ' m', 20, 48);
    ctx.fillText('当前高度 = ' + h.toFixed(3) + ' m', 20, 70);
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('瞬时速度 v = ' + v.toFixed(3) + ' m/s', 20, 96);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('加速度 a = ' + g.toFixed(1) + ' m/s²（恒定）', 20, 118);

    /* 右下角辅助信息 */
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px Consolas, monospace';
    ctx.fillText('v = gt', 20, 146);
    ctx.fillText('h = ½gt²', 20, 164);
  }
},

{
  id: 'physics-projectile',
  subject: 'physics',
  name: '平抛运动',
  tags: ['运动学', '抛体运动'],
  desc: '水平抛出的小球同时做匀速直线运动和自由落体运动。',
  purpose: '验证平抛运动可以分解为水平方向匀速直线运动和竖直方向自由落体运动。',
  principle: '水平方向不受力，x = v₀t；竖直方向只受重力，y = ½gt²。',
  apparatus: '平抛运动演示仪、小球、刻度尺、频闪相机',
  steps: [
    '调整平抛仪使轨道末端水平',
    '让小球从轨道同一位置释放',
    '用频闪照片记录小球每隔相等时间的位置',
    '测量水平位移与竖直位移，分析规律'
  ],
  phenomenon: '小球沿抛物线轨迹运动。水平方向相邻位置间距相等；竖直方向相邻间距逐渐增大（1:3:5:7...）。',
  conclusion: '平抛运动 = 水平匀速直线 + 竖直自由落体。',
  notice: '轨道末端必须水平；每次从同一位置释放；忽略空气阻力。',
  duration: 6,
  params: [
    { key: 'v0', label: '初速度 v₀', min: 2, max: 12, step: 0.5, default: 6 },
    { key: 'g', label: '重力加速度 g', min: 1, max: 20, step: 0.1, default: 9.8 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 60, padR = 60, padT = 40, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var v0 = params.v0;
    var g = params.g;
    var duration = 1.8;
    var Lx = v0 * duration;
    var Ly = 0.5 * g * duration * duration;

    function toPx(x, y) {
      return {
        px: padL + (x / Lx) * plotW,
        py: padT + (y / Ly) * plotH
      };
    }

    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245,179,1,.12)';
    ctx.lineWidth = 1;
    for (var i = 1; i <= 10; i++) {
      var y = padT + plotH * i / 10;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }
    for (var j = 1; j <= 10; j++) {
      var x = padL + plotW * j / 10;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
    }

    var physT = progress * duration;

    ctx.beginPath();
    for (var t = 0; t <= physT; t += 0.01) {
      var px_ = v0 * t;
      var py_ = 0.5 * g * t * t;
      var pos = toPx(px_, py_);
      if (t === 0) ctx.moveTo(pos.px, pos.py);
      else ctx.lineTo(pos.px, pos.py);
    }
    ctx.strokeStyle = 'rgba(245,179,1,.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    var x = v0 * physT;
    var y = 0.5 * g * physT * physT;
    var cur = toPx(x, y);

    ctx.beginPath();
    ctx.moveTo(padL, cur.py);
    ctx.lineTo(cur.px, cur.py);
    ctx.strokeStyle = 'rgba(74,127,181,.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(cur.px, padT);
    ctx.lineTo(cur.px, cur.py);
    ctx.strokeStyle = 'rgba(192,82,74,.6)';
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(cur.px, cur.py, 12, 0, Math.PI * 2);
    var grad = ctx.createRadialGradient(cur.px - 4, cur.py - 4, 2, cur.px, cur.py, 12);
    grad.addColorStop(0, '#ffe9a8');
    grad.addColorStop(1, '#b47c00');
    ctx.fillStyle = grad;
    ctx.fill();

    var vx = v0;
    var vy = g * physT;
    var vScale = 12;
    ctx.beginPath();
    ctx.moveTo(cur.px, cur.py);
    ctx.lineTo(cur.px + vx * vScale * (plotW / Lx) / 15, cur.py);
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cur.px, cur.py);
    ctx.lineTo(cur.px, cur.py + vy * vScale * (plotH / Ly) / 15);
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cur.px, cur.py);
    ctx.lineTo(cur.px + vx * vScale * (plotW / Lx) / 15, cur.py + vy * vScale * (plotH / Ly) / 15);
    ctx.strokeStyle = '#3a2a00';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('t = ' + physT.toFixed(2) + ' s', 20, 24);
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('x = ' + x.toFixed(2) + ' m', 20, 46);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('y = ' + y.toFixed(2) + ' m', 20, 68);
    ctx.fillStyle = '#3a2a00';
    ctx.fillText('vx = ' + vx.toFixed(2) + ' m/s（不变）', 20, 90);
    ctx.fillText('vy = ' + vy.toFixed(2) + ' m/s', 20, 112);
  }
},

{
  id: 'physics-pendulum',
  subject: 'physics',
  name: '单摆的简谐运动',
  tags: ['力学', '简谐运动', '振动'],
  desc: '小角度下，单摆的摆动可视为简谐运动。',
  purpose: '观察单摆在小角度下的简谐运动，验证周期公式 T = 2π√(L/g)。',
  principle: '单摆在小角度（< 5°）下，回复力与位移成正比，做简谐运动。周期 T = 2π√(L/g)。',
  apparatus: '细线、摆球、支架、秒表、刻度尺',
  steps: [
    '将细线一端固定，另一端挂摆球',
    '测量摆长 L（到摆球重心）',
    '将摆球拉开小角度后释放',
    '用秒表测量 30 次全振动的时间，求平均周期'
  ],
  phenomenon: '摆球在平衡位置两侧往复摆动，位移随时间按正弦规律变化。',
  conclusion: '小角度下单摆做简谐运动；周期只与摆长和重力加速度有关。',
  notice: '摆角应小于 5°；摆长算到摆球重心；从平衡位置开始计时误差最小。',
  duration: 8,
  params: [
    { key: 'L', label: '摆长 L（米）', min: 0.2, max: 1.5, step: 0.05, default: 0.8 },
    { key: 'g', label: '重力加速度', min: 1, max: 20, step: 0.1, default: 9.8 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var pivotX = W / 2;
    var pivotY = 60;
    var L = params.L;
    var g = params.g;

    var maxL = 1.5;
    var Lpx = (L / maxL) * (H - 160);
    var T = 2 * Math.PI * Math.sqrt(L / g);
    var omega = 2 * Math.PI / T;
    var amp = 0.12;

    var theta = amp * Math.cos(omega * elapsed);
    var bobX = pivotX + Lpx * Math.sin(theta);
    var bobY = pivotY + Lpx * Math.cos(theta);

    ctx.fillStyle = '#8a7340';
    ctx.fillRect(pivotX - 60, pivotY - 20, 120, 8);

    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#4a3800';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + Lpx);
    ctx.strokeStyle = 'rgba(138,115,64,.35)';
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
    var grad = ctx.createRadialGradient(bobX - 6, bobY - 6, 3, bobX, bobY, 18);
    grad.addColorStop(0, '#ffe9a8');
    grad.addColorStop(1, '#b47c00');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    var rArc = 40;
    if (theta >= 0) ctx.arc(pivotX, pivotY, rArc, Math.PI / 2 - theta, Math.PI / 2);
    else ctx.arc(pivotX, pivotY, rArc, Math.PI / 2, Math.PI / 2 - theta);
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('摆长 L = ' + L.toFixed(2) + ' m', 20, 28);
    ctx.fillText('重力加速度 g = ' + g.toFixed(1) + ' m/s²', 20, 50);
    ctx.fillText('周期 T = ' + T.toFixed(3) + ' s', 20, 72);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('摆角 θ = ' + (theta * 180 / Math.PI).toFixed(1) + '°', 20, 100);
  }
},

{
  id: 'physics-circular-motion',
  subject: 'physics',
  name: '匀速圆周运动',
  tags: ['力学', '圆周运动'],
  desc: '小球做匀速圆周运动，速度方向沿切线，向心加速度指向圆心。',
  purpose: '理解匀速圆周运动的速度、加速度、周期的关系。',
  principle: '匀速圆周运动中，速度大小不变但方向不断变化，加速度始终指向圆心，大小 a = v²/r = ω²r。',
  apparatus: '细绳、小球、转盘、秒表',
  steps: [
    '让小球做圆周运动',
    '观察速度方向始终沿切线',
    '观察向心加速度始终指向圆心',
    '测量周期与半径，计算速度'
  ],
  phenomenon: '小球沿圆周匀速运动；速度矢量不断改变方向但大小不变；加速度始终指向圆心。',
  conclusion: '匀速圆周运动是变加速运动，向心加速度指向圆心，大小 a = v²/r = ω²r。',
  notice: '速度方向沿切线；向心力由合外力提供；半径越小，加速度越大。',
  duration: 6,
  params: [
    { key: 'r', label: '半径 r', min: 0.5, max: 2.5, step: 0.1, default: 1.2 },
    { key: 'v', label: '线速度 v', min: 0.5, max: 5, step: 0.1, default: 2 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2 + 20;
    var r = params.r;
    var v = params.v;

    /* 半径映射 */
    var rPx = r * 70;
    var omega = v / r;
    var period = 2 * Math.PI / omega;

    var theta = -Math.PI / 2 + omega * elapsed;
    var px = cx + rPx * Math.cos(theta);
    var py = cy + rPx * Math.sin(theta);

    /* 圆形轨迹 */
    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245,179,1,.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 半径 */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = 'rgba(138,115,64,.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 速度矢量（切线方向） */
    var vtanX = -Math.sin(theta);
    var vtanY = Math.cos(theta);
    var vLen = v * 25;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + vtanX * vLen, py + vtanY * vLen);
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 3;
    ctx.stroke();
    /* 箭头 */
    var arrowX = px + vtanX * vLen;
    var arrowY = py + vtanY * vLen;
    ctx.beginPath();
    ctx.arc(arrowX, arrowY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#4a7fb5';
    ctx.fill();

    /* 向心加速度（指向圆心） */
    var aLen = (v * v / r) * 6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + (cx - px) / rPx * Math.min(aLen, rPx), py + (cy - py) / rPx * Math.min(aLen, rPx));
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* 小球 */
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    var grad = ctx.createRadialGradient(px - 4, py - 4, 2, px, py, 14);
    grad.addColorStop(0, '#ffe9a8');
    grad.addColorStop(1, '#b47c00');
    ctx.fillStyle = grad;
    ctx.fill();

    /* 圆心 */
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#3a2a00';
    ctx.fill();

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('半径 r = ' + r.toFixed(2) + ' m', 20, 26);
    ctx.fillText('线速度 v = ' + v.toFixed(2) + ' m/s', 20, 48);
    ctx.fillText('角速度 ω = ' + omega.toFixed(3) + ' rad/s', 20, 70);
    ctx.fillText('周期 T = ' + period.toFixed(3) + ' s', 20, 92);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('向心加速度 a = v²/r = ' + (v * v / r).toFixed(3) + ' m/s²', 20, 116);
  }
},

{
  id: 'physics-refraction',
  subject: 'physics',
  name: '光的折射与全反射',
  tags: ['光学', '折射', '全反射'],
  desc: '光从光密介质射向光疏介质，入射角增大到临界角时发生全反射。',
  purpose: '理解折射定律，观察全反射现象，计算临界角。',
  principle: '折射定律：n₁sinθ₁ = n₂sinθ₂。当光从光密介质射向光疏介质，入射角大于临界角 C 时发生全反射，sinC = n₂/n₁。',
  apparatus: '激光笔、半圆形玻璃砖、量角器、光屏',
  steps: [
    '让激光从玻璃砖的弧形面垂直射入',
    '改变入射角，观察折射光线',
    '增大入射角到临界角，折射光消失',
    '记录并验证临界角公式'
  ],
  phenomenon: '入射角增大，折射角也增大；达到临界角后，折射光消失，只剩反射光。',
  conclusion: '光疏介质中无折射光时发生全反射；临界角满足 sinC = n₂/n₁。',
  notice: '全反射必须从光密介质射向光疏介质；临界角只与两种介质的折射率有关。',
  duration: 6,
  params: [
    { key: 'n1', label: '介质 1 折射率（光密）', min: 1.2, max: 2.5, step: 0.05, default: 1.5 },
    { key: 'n2', label: '介质 2 折射率（光疏）', min: 1, max: 1.5, step: 0.05, default: 1 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cx = W / 2;
    var cy = H / 2;

    var n1 = params.n1;
    var n2 = params.n2;

    /* 临界角 */
    var sinC = n2 / n1;
    var critical = sinC >= 1 ? null : Math.asin(sinC);

    /* 入射角（从 0° 到 85°） */
    var incAngle = progress * (85 * Math.PI / 180);

    /* 界面 */
    ctx.fillStyle = 'rgba(200, 230, 240, .35)';
    ctx.fillRect(0, cy, W, H - cy);

    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 法线 */
    ctx.beginPath();
    ctx.moveTo(cx, cy - 160);
    ctx.lineTo(cx, cy + 160);
    ctx.strokeStyle = 'rgba(138,115,64,.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 入射光线（从左上方到中心） */
    var inLen = 200;
    var inStartX = cx - Math.sin(incAngle) * inLen;
    var inStartY = cy - Math.cos(incAngle) * inLen;

    ctx.beginPath();
    ctx.moveTo(inStartX, inStartY);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* 入射角弧线 */
    ctx.beginPath();
    ctx.arc(cx, cy, 50, -Math.PI / 2 - incAngle, -Math.PI / 2);
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#c0524a';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('i', cx + 40 * Math.sin(-incAngle / 2 - Math.PI / 2) * 0 + 40 * Math.sin(incAngle / 2) + 5, cy - 40 * Math.cos(incAngle / 2) - 5);

    /* 折射光 */
    if (critical === null || incAngle < critical) {
      var sinRef = (n1 / n2) * Math.sin(incAngle);
      if (sinRef <= 1) {
        var refAngle = Math.asin(sinRef);
        var refLen = 200;
        var refEndX = cx + Math.sin(refAngle) * refLen;
        var refEndY = cy + Math.cos(refAngle) * refLen;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(refEndX, refEndY);
        ctx.strokeStyle = '#4a7fb5';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    /* 反射光 */
    var reflLen = 200;
    var reflEndX = cx + Math.sin(incAngle) * reflLen;
    var reflEndY = cy - Math.cos(incAngle) * reflLen;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(reflEndX, reflEndY);
    ctx.strokeStyle = critical !== null && incAngle >= critical ? '#f5b301' : 'rgba(180,124,0,.35)';
    ctx.lineWidth = critical !== null && incAngle >= critical ? 3.5 : 2;
    ctx.stroke();

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('介质 1：n₁ = ' + n1.toFixed(2), 20, 26);
    ctx.fillText('介质 2：n₂ = ' + n2.toFixed(2), 20, 48);

    ctx.fillStyle = '#c0524a';
    ctx.fillText('入射角 i = ' + (incAngle * 180 / Math.PI).toFixed(1) + '°', 20, 76);

    if (critical !== null) {
      ctx.fillStyle = '#8a7340';
      ctx.fillText('临界角 C = ' + (critical * 180 / Math.PI).toFixed(2) + '°', 20, 100);
      if (incAngle >= critical) {
        ctx.fillStyle = '#b47c00';
        ctx.font = 'bold 16px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText('★ 发生全反射', 20, 130);
      }
    }
  }
},

{
  id: 'physics-lens',
  subject: 'physics',
  name: '凸透镜成像',
  tags: ['光学', '凸透镜', '成像'],
  desc: '拖动物距，观察像距、放大率与成像性质的变化。',
  purpose: '理解凸透镜成像规律：物距、像距、焦距三者关系。',
  principle: '成像公式：1/f = 1/u + 1/v，放大率 m = -v/u。物距大于 2f 时成缩小倒立实像；在 f 与 2f 之间成放大倒立实像；小于 f 时成放大正立虚像。',
  apparatus: '凸透镜、光具座、蜡烛、光屏',
  steps: [
    '将凸透镜固定在光具座中央',
    '调整蜡烛、光屏高度与透镜中心同高',
    '移动蜡烛到不同物距位置',
    '移动光屏直到成像清晰，记录物距和像距'
  ],
  phenomenon: '物距不同，像的大小、正倒、虚实都会变化；u = 2f 时成等大倒立实像。',
  conclusion: '凸透镜成像遵循 1/f = 1/u + 1/v，不同物距范围成像性质不同。',
  notice: '平行光经凸透镜会聚于焦点；f 为焦距；u 为物距，v 为像距。',
  duration: 6,
  params: [
    { key: 'f', label: '焦距 f（格）', min: 1, max: 4, step: 0.5, default: 2 },
    { key: 'u', label: '物距 u（格）', min: 0.5, max: 10, step: 0.1, default: 6 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var axisY = H / 2;
    var cx = W / 2;

    var f = params.f;
    var u = params.u;
    var v = 1 / (1 / f - 1 / u);
    var m = -v / u;

    var scale = Math.min(W / 24, 40);

    function toPx(x) { return cx + x * scale; }

    /* 光轴 */
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(W, axisY);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 凸透镜 */
    ctx.beginPath();
    var lensH = 140;
    ctx.moveTo(cx, axisY - lensH / 2);
    ctx.quadraticCurveTo(cx + 20, axisY, cx, axisY + lensH / 2);
    ctx.quadraticCurveTo(cx - 20, axisY, cx, axisY - lensH / 2);
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(168, 200, 239, .25)';
    ctx.fill();
    ctx.stroke();

    /* 焦点标记 */
    [-f, f].forEach(function (x) {
      ctx.beginPath();
      ctx.arc(toPx(x), axisY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#c0524a';
      ctx.fill();
      ctx.fillStyle = '#c0524a';
      ctx.font = '11px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('F', toPx(x), axisY + 20);
    });

    /* 物体 */
    var objX = toPx(-u);
    var objH = 50;
    ctx.beginPath();
    ctx.moveTo(objX, axisY);
    ctx.lineTo(objX, axisY - objH);
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 3;
    ctx.stroke();
    /* 箭头 */
    ctx.beginPath();
    ctx.moveTo(objX, axisY - objH);
    ctx.lineTo(objX - 6, axisY - objH + 10);
    ctx.lineTo(objX + 6, axisY - objH + 10);
    ctx.closePath();
    ctx.fillStyle = '#b47c00';
    ctx.fill();

    /* 三条特殊光线 */
    /* 光线 1：平行光轴 → 过焦点 */
    ctx.beginPath();
    ctx.moveTo(objX, axisY - objH);
    ctx.lineTo(cx, axisY - objH);
    /* 从透镜到像点（或反向延长） */
    if (isFinite(v)) {
      var imgX = toPx(v);
      var imgH = -objH * m / (m < 0 ? -m : 1) * (v > 0 ? 1 : 1);
      var realImgH = -objH * (v / u);
      ctx.lineTo(imgX, axisY + realImgH);
    }
    ctx.strokeStyle = 'rgba(192,82,74,.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 光线 2：过光心 */
    ctx.beginPath();
    ctx.moveTo(objX, axisY - objH);
    ctx.lineTo(cx, axisY);
    if (isFinite(v)) {
      var imgX2 = toPx(v);
      var realImgH2 = -objH * (v / u);
      ctx.lineTo(imgX2, axisY + realImgH2);
    }
    ctx.strokeStyle = 'rgba(74,127,181,.7)';
    ctx.stroke();

    /* 光线 3：过焦点 */
    ctx.beginPath();
    ctx.moveTo(objX, axisY - objH);
    if (isFinite(v)) {
      var dx = f - (-u);
      var slope = -objH / dx;
      /* 到透镜 x=0 */
      ctx.lineTo(cx, axisY + slope * f);
      ctx.lineTo(toPx(v), axisY + realImgH2);
    }
    ctx.strokeStyle = 'rgba(245,179,1,.7)';
    ctx.stroke();

    /* 像 */
    if (isFinite(v) && Math.abs(v) < 20) {
      var imgX3 = toPx(v);
      var realImgH3 = -objH * (v / u);
      ctx.beginPath();
      ctx.moveTo(imgX3, axisY);
      ctx.lineTo(imgX3, axisY + realImgH3);
      if (realImgH3 > 0) {
        /* 正立 */
        ctx.strokeStyle = '#22c55e';
      } else {
        ctx.strokeStyle = '#22c55e';
      }
      ctx.lineWidth = 3;
      ctx.stroke();

      /* 箭头 */
      var arrowDir = realImgH3 > 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(imgX3, axisY + realImgH3);
      ctx.lineTo(imgX3 - 6, axisY + realImgH3 + arrowDir * 10);
      ctx.lineTo(imgX3 + 6, axisY + realImgH3 + arrowDir * 10);
      ctx.closePath();
      ctx.fillStyle = '#22c55e';
      ctx.fill();
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('焦距 f = ' + f + ' 格', 20, 26);
    ctx.fillText('物距 u = ' + u.toFixed(1) + ' 格', 20, 48);
    if (isFinite(v)) {
      ctx.fillText('像距 v = ' + v.toFixed(2) + ' 格', 20, 70);
      ctx.fillText('放大率 m = ' + Math.abs(m).toFixed(3) + '×', 20, 92);
      var nature = v > 0 ? (m < 0 ? '倒立实像' : '正立实像') : '正立虚像';
      var size = Math.abs(m) > 1 ? '放大' : (Math.abs(m) < 1 ? '缩小' : '等大');
      ctx.fillStyle = '#22c55e';
      ctx.fillText('成像：' + size + ' · ' + nature, 20, 116);
    } else {
      ctx.fillText('成像：不成像（平行光）', 20, 70);
    }
  }
},

{
  id: 'physics-circuit',
  subject: 'physics',
  name: '串并联电路',
  tags: ['电学', '串并联', '欧姆定律'],
  desc: '拖动电阻，观察串联与并联电路中电流、电压的分布。',
  purpose: '理解串并联电路的基本规律：串联电流处处相等、电压按电阻分配；并联电压处处相等、电流按电阻分配。',
  principle: '串联：I₁ = I₂ = I，U₁/U₂ = R₁/R₂，R总 = R₁ + R₂。并联：U₁ = U₂ = U，I₁/I₂ = R₂/R₁，1/R总 = 1/R₁ + 1/R₂。',
  apparatus: '电源、电阻、开关、电流表、电压表、导线',
  steps: [
    '按图连接串联（或并联）电路',
    '闭合开关，读取电流与电压',
    '改变电阻值，观察电流变化',
    '计算各电阻两端电压，验证分压 / 分流规律'
  ],
  phenomenon: '串联电路中，电阻大的分到的电压大；并联电路中，电阻小的分到的电流大。',
  conclusion: '串联电流相等，电压按电阻分配；并联电压相等，电流按电阻反比分配。',
  notice: '实验前检查电路；电流表串联、电压表并联；连接时开关断开。',
  duration: 6,
  params: [
    { key: 'U', label: '电源电压 U（V）', min: 3, max: 24, step: 1, default: 12 },
    { key: 'R1', label: '电阻 R₁（Ω）', min: 1, max: 100, step: 1, default: 20 },
    { key: 'R2', label: '电阻 R₂（Ω）', min: 1, max: 100, step: 1, default: 40 },
    { key: 'mode', label: '模式（0=串联, 1=并联）', min: 0, max: 1, step: 1, default: 0 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var U = params.U;
    var R1 = params.R1;
    var R2 = params.R2;
    var isParallel = params.mode >= 0.5;

    var I1, I2, U1, U2, Rtotal, Itotal;
    if (!isParallel) {
      Rtotal = R1 + R2;
      Itotal = U / Rtotal;
      I1 = I2 = Itotal;
      U1 = I1 * R1;
      U2 = I2 * R2;
    } else {
      U1 = U2 = U;
      I1 = U / R1;
      I2 = U / R2;
      Itotal = I1 + I2;
      Rtotal = U / Itotal;
    }

    /* 画电路 */
    var padX = 60;
    var padY = 70;
    var rectW = W - padX * 2;
    var rectH = H - padY * 2 - 40;

    /* 外框 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(padX, padY + rectH);
    ctx.lineTo(padX, padY);
    ctx.lineTo(padX + rectW, padY);
    ctx.lineTo(padX + rectW, padY + rectH);
    ctx.lineTo(padX, padY + rectH);
    ctx.stroke();

    /* 电源（底部） */
    var batX = padX + rectW / 2;
    var batY = padY + rectH;
    ctx.fillStyle = '#fff';
    ctx.fillRect(batX - 30, batY - 15, 60, 30);
    ctx.strokeStyle = '#8a7340';
    ctx.strokeRect(batX - 30, batY - 15, 60, 30);
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 13px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('U=' + U + 'V', batX, batY + 5);

    if (!isParallel) {
      /* 串联：两个电阻分居上边左右 */
      var r1X = padX + rectW * 0.3;
      var r2X = padX + rectW * 0.7;
      var rY = padY;

      drawResistor(ctx, r1X, rY, 'R₁=' + R1 + 'Ω', U1, I1);
      drawResistor(ctx, r2X, rY, 'R₂=' + R2 + 'Ω', U2, I2);

      /* 电流箭头 */
      drawCurrent(ctx, padX + rectW * 0.15, rY, 'right', Itotal);
      drawCurrent(ctx, padX + rectW * 0.5, rY, 'right', Itotal);
      drawCurrent(ctx, padX + rectW * 0.9, rY, 'right', Itotal);

      ctx.fillStyle = '#3a2a00';
      ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('串联电路', 20, 26);
      ctx.fillText('总电阻 R = R₁ + R₂ = ' + Rtotal.toFixed(2) + ' Ω', 20, 48);
      ctx.fillText('总电流 I = ' + Itotal.toFixed(3) + ' A（处处相等）', 20, 70);
      ctx.fillStyle = '#4a7fb5';
      ctx.fillText('U₁ = I·R₁ = ' + U1.toFixed(3) + ' V', 20, 96);
      ctx.fillStyle = '#c0524a';
      ctx.fillText('U₂ = I·R₂ = ' + U2.toFixed(3) + ' V', 20, 118);
      ctx.fillStyle = '#8a7340';
      ctx.fillText('U₁ + U₂ = ' + (U1 + U2).toFixed(3) + ' V = U', 20, 140);
    } else {
      /* 并联：两个电阻并排在上方左右 */
      var r1X2 = padX + rectW * 0.35;
      var r2X2 = padX + rectW * 0.65;
      var rY2 = padY + 20;
      var rH2 = rectH - 40;

      /* 两条支路 */
      ctx.beginPath();
      ctx.moveTo(r1X2, padY);
      ctx.lineTo(r1X2, padY + rectH);
      ctx.moveTo(r2X2, padY);
      ctx.lineTo(r2X2, padY + rectH);
      ctx.strokeStyle = '#8a7340';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      drawResistorV(ctx, r1X2, padY + rectH * 0.4, 'R₁=' + R1 + 'Ω', I1);
      drawResistorV(ctx, r2X2, padY + rectH * 0.4, 'R₂=' + R2 + 'Ω', I2);

      ctx.fillStyle = '#3a2a00';
      ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('并联电路', 20, 26);
      ctx.fillText('1/R = 1/R₁ + 1/R₂，R = ' + Rtotal.toFixed(2) + ' Ω', 20, 48);
      ctx.fillText('总电流 I = ' + Itotal.toFixed(3) + ' A', 20, 70);
      ctx.fillStyle = '#4a7fb5';
      ctx.fillText('I₁ = U/R₁ = ' + I1.toFixed(3) + ' A', 20, 96);
      ctx.fillStyle = '#c0524a';
      ctx.fillText('I₂ = U/R₂ = ' + I2.toFixed(3) + ' A', 20, 118);
      ctx.fillStyle = '#8a7340';
      ctx.fillText('I₁ + I₂ = ' + (I1 + I2).toFixed(3) + ' A = I', 20, 140);
    }

    function drawResistor(ctx, x, y, label, u, i) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 30, y - 12, 60, 24);
      ctx.strokeStyle = '#8a7340';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 30, y - 12, 60, 24);
      /* 锯齿 */
      ctx.beginPath();
      for (var k = 0; k <= 8; k++) {
        var xx = x - 24 + k * 6;
        var yy = y + (k % 2 === 0 ? -5 : 5);
        if (k === 0) ctx.moveTo(xx, y);
        else ctx.lineTo(xx, yy);
      }
      ctx.strokeStyle = '#b47c00';
      ctx.stroke();

      ctx.fillStyle = '#3a2a00';
      ctx.font = 'bold 11px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 22);
      ctx.fillStyle = '#4a7fb5';
      ctx.fillText(u.toFixed(2) + 'V', x, y + 30);
    }

    function drawResistorV(ctx, x, y, label, i) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 12, y - 30, 24, 60);
      ctx.strokeStyle = '#8a7340';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 12, y - 30, 24, 60);
      ctx.beginPath();
      for (var k = 0; k <= 8; k++) {
        var yy = y - 24 + k * 6;
        var xx = x + (k % 2 === 0 ? -5 : 5);
        if (k === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.strokeStyle = '#b47c00';
      ctx.stroke();

      ctx.fillStyle = '#3a2a00';
      ctx.font = 'bold 11px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 46);
      ctx.fillStyle = '#c0524a';
      ctx.fillText(i.toFixed(3) + 'A', x, y + 52);
    }

    function drawCurrent(ctx, x, y, dir, i) {
      var s = Math.min(1, i);
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74,127,181,' + (0.4 + s * 0.5) + ')';
      ctx.fill();
    }
  }
},

{
  id: 'physics-induction',
  subject: 'physics',
  name: '电磁感应（楞次定律）',
  tags: ['电磁学', '感应电流', '楞次定律'],
  desc: '磁体进出线圈，观察感应电流方向与楞次定律。',
  purpose: '理解电磁感应现象与楞次定律：感应电流的磁场总要阻碍引起感应电流的磁通量的变化。',
  principle: '磁体插入线圈时磁通量增大，感应电流的磁场方向与原磁场相反（阻碍增大）；拔出时磁通量减小，感应电流的磁场方向与原磁场相同（阻碍减小）。',
  apparatus: '条形磁体、螺线管、灵敏电流计、导线',
  steps: [
    '将螺线管与灵敏电流计连成闭合回路',
    '把条形磁体的 N 极插入线圈',
    '观察电流计指针偏转方向',
    '改变磁体插入 / 拔出方向与速度，重复观察'
  ],
  phenomenon: '磁体插入或拔出时，电流计指针偏转；插入与拔出时偏转方向相反；磁体静止时指针不偏转。',
  conclusion: '只要穿过闭合回路的磁通量发生变化，就会产生感应电流，方向遵循楞次定律。',
  notice: '磁通量变化是产生感应电流的条件；感应电流的方向总是阻碍磁通量的变化。',
  duration: 6,
  params: [
    { key: 'speed', label: '磁体速度', min: 0.3, max: 3, step: 0.1, default: 1 }
  ],
  init: function (state) {
    state.magnetY = -80;
    state.direction = 1;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var coilX = W * 0.6;
    var coilY = H / 2 + 30;

    /* 磁体位置：从上进入线圈，再从下离开，然后反向 */
    var cycle = 2;
    var phase = (elapsed / 3) % cycle;
    var magnetY;
    var dir = 1;
    if (phase < 1) {
      magnetY = -120 + phase * 360;
      dir = 1;
    } else {
      magnetY = 240 - (phase - 1) * 360;
      dir = -1;
    }

    /* 画线圈 */
    var coilR = 70;
    var coilTurns = 6;
    var coilSpacing = 8;
    for (var i = 0; i < coilTurns; i++) {
      var y = coilY - (coilTurns - 1) * coilSpacing / 2 + i * coilSpacing;
      ctx.beginPath();
      ctx.ellipse(coilX, y, coilR, 16, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#b47c00';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    /* 线圈两端引线 */
    ctx.beginPath();
    ctx.moveTo(coilX - coilR, coilY - (coilTurns - 1) * coilSpacing / 2);
    ctx.lineTo(120, coilY - (coilTurns - 1) * coilSpacing / 2);
    ctx.lineTo(120, coilY + 80);
    ctx.moveTo(coilX + coilR, coilY + (coilTurns - 1) * coilSpacing / 2);
    ctx.lineTo(140, coilY + 80);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 电流计 */
    ctx.fillStyle = '#fff';
    ctx.fillRect(100, coilY + 80, 80, 60);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, coilY + 80, 80, 60);
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 11px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('电流计', 140, coilY + 96);

    /* 指针（根据磁体运动方向偏转） */
    var deflection = 0;
    if (Math.abs(magnetY - coilY) < 60 || (Math.abs(magnetY - coilY) < 80)) {
      deflection = dir * Math.min(1, params.speed / 2) * 0.9;
    }
    var pointerAngle = deflection * 0.7;
    ctx.save();
    ctx.translate(140, coilY + 122);
    ctx.rotate(pointerAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -22);
    ctx.strokeStyle = deflection !== 0 ? '#c0524a' : '#3a2a00';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#8a7340';
    ctx.font = '9px Consolas, monospace';
    ctx.fillText('−', 116, coilY + 122);
    ctx.fillText('+', 164, coilY + 122);

    /* 磁体 */
    var magnetW = 40;
    var magnetH = 100;
    var magnetX = coilX - magnetW / 2;
    /* 上红下蓝（N 极红，S 极蓝） */
    ctx.fillStyle = '#c0524a';
    ctx.fillRect(magnetX, magnetY - magnetH / 2, magnetW, magnetH / 2);
    ctx.fillStyle = '#4a7fb5';
    ctx.fillRect(magnetX, magnetY, magnetW, magnetH / 2);
    ctx.strokeStyle = '#3a2a00';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(magnetX, magnetY - magnetH / 2, magnetW, magnetH);

    /* 磁极标注 */
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', coilX, magnetY - magnetH / 2 + 26);
    ctx.fillText('S', coilX, magnetY + magnetH / 2 - 12);

    /* 磁感线（少量） */
    ctx.strokeStyle = 'rgba(192,82,74,.35)';
    ctx.lineWidth = 1;
    for (var k = -1; k <= 1; k++) {
      ctx.beginPath();
      ctx.moveTo(coilX + k * 30, magnetY - magnetH / 2 - 30);
      ctx.quadraticCurveTo(coilX + k * 70, magnetY, coilX + k * 30, magnetY + magnetH / 2 + 30);
      ctx.stroke();
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('条形磁体 + 螺线管', 20, 26);
    ctx.fillText('磁体方向：' + (dir > 0 ? '向下插入' : '向上拔出'), 20, 48);
    ctx.fillStyle = dir > 0 ? '#c0524a' : '#4a7fb5';
    ctx.fillText('感应电流方向：' + (dir > 0 ? '逆时针（阻碍磁通增大）' : '顺时针（阻碍磁通减小）'), 20, 74);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('楞次定律：感应电流的磁场总要阻碍磁通量的变化', 20, 102);
  }
},

{
  id: 'physics-interference',
  subject: 'physics',
  name: '波的干涉',
  tags: ['波动', '干涉', '叠加'],
  desc: '两个同频率、同相位的波源在水面叠加，形成稳定的干涉图样。',
  purpose: '理解波的叠加原理，观察加强区与减弱区的分布。',
  principle: '两列频率相同、相位差恒定的波叠加，某些位置振动始终加强（波程差为波长整数倍），某些位置始终减弱（波程差为半波长奇数倍），形成稳定的干涉图样。',
  apparatus: '水波演示槽、两个振源、频闪光源',
  steps: [
    '在水槽中安装两个同频振源',
    '调节两振源频率相同',
    '启动振源，观察水波干涉图样',
    '观察加强区（亮）与减弱区（暗）的分布'
  ],
  phenomenon: '水面上出现稳定的明暗相间条纹。加强区振动剧烈，减弱区几乎不动。',
  conclusion: '两列频率相同、相位差恒定的波叠加，形成稳定的干涉图样。',
  notice: '只有频率相同、相位差恒定的波才能产生稳定的干涉；相干条件是干涉的前提。',
  duration: 8,
  params: [
    { key: 'freq', label: '波源频率', min: 0.5, max: 3, step: 0.1, default: 1.5 },
    { key: 'dist', label: '波源距离', min: 40, max: 160, step: 10, default: 100 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cxs = W / 2;
    var cys = H / 2;
    var d = params.dist;
    var src1 = { x: cxs - d / 2, y: cys };
    var src2 = { x: cxs + d / 2, y: cys };

    var omega = params.freq * 2 * Math.PI;
    var wavelength = 60;
    var k = 2 * Math.PI / wavelength;
    var speed = omega / k;

    /* 用像素块绘制干涉图样：分辨率不宜过高，否则慢 */
    var stepSize = 4;
    var imgData = ctx.getImageData(0, 0, W, H);
    var data = imgData.data;

    for (var y = 0; y < H; y += stepSize) {
      for (var x = 0; x < W; x += stepSize) {
        var r1 = Math.sqrt((x - src1.x) * (x - src1.x) + (y - src1.y) * (y - src1.y));
        var r2 = Math.sqrt((x - src2.x) * (x - src2.x) + (y - src2.y) * (y - src2.y));
        var amp1 = 1 / (1 + r1 * 0.008);
        var amp2 = 1 / (1 + r2 * 0.008);
        var phase1 = k * r1 - omega * elapsed;
        var phase2 = k * r2 - omega * elapsed;
        var disp = amp1 * Math.sin(phase1) + amp2 * Math.sin(phase2);
        /* 颜色映射：正为暖色，负为冷色，零为白 */
        var norm = (disp + 2) / 4; /* 0-1 */
        var rC = Math.round(255 * Math.min(1, 0.6 + norm * 0.4));
        var gC = Math.round(255 * Math.min(1, 0.7 + norm * 0.3));
        var bC = Math.round(255 * Math.min(1, 0.9 - norm * 0.3));
        /* 写到像素块 */
        for (var dy = 0; dy < stepSize && y + dy < H; dy++) {
          for (var dx = 0; dx < stepSize && x + dx < W; dx++) {
            var idx = ((y + dy) * W + (x + dx)) * 4;
            data[idx] = rC;
            data[idx + 1] = gC;
            data[idx + 2] = bC;
            data[idx + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    /* 波源 */
    [src1, src2].forEach(function (s, i) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#c0524a' : '#4a7fb5';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    /* 中垂线（加强线） */
    ctx.beginPath();
    ctx.moveTo(cxs, 0);
    ctx.lineTo(cxs, H);
    ctx.strokeStyle = 'rgba(255,255,255,.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('波源频率：' + params.freq.toFixed(1) + ' Hz', 20, 26);
    ctx.fillText('波源间距：' + d + ' px', 20, 48);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('S₁', src1.x - 8, src1.y - 18);
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('S₂', src2.x - 8, src2.y - 18);
  }
},

{
  id: 'physics-collision',
  subject: 'physics',
  name: '弹性碰撞与动量守恒',
  tags: ['力学', '动量', '碰撞'],
  desc: '两个小球发生弹性碰撞，观察动量与动能的守恒情况。',
  purpose: '验证一维弹性碰撞中动量守恒与动能守恒。',
  principle: '弹性碰撞满足动量守恒 m₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'，同时动能守恒。质量相等时两球速度交换。',
  apparatus: '气垫导轨、两个滑块、光电门',
  steps: [
    '在气垫导轨上放置两个滑块',
    '给一侧滑块一个初速度，使其撞向另一个',
    '记录碰撞前后两滑块的速度',
    '计算动量与动能，验证守恒'
  ],
  phenomenon: '质量相等时两球速度交换；质量不等时，重球减速、轻球获得较大速度。',
  conclusion: '弹性碰撞同时满足动量守恒和动能守恒。',
  notice: '碰撞必须是弹性的（动能守恒）；一维碰撞才可用简单公式。',
  duration: 8,
  params: [
    { key: 'm1', label: 'm₁ 质量（kg）', min: 0.5, max: 5, step: 0.1, default: 1 },
    { key: 'm2', label: 'm₂ 质量（kg）', min: 0.5, max: 5, step: 0.1, default: 2 },
    { key: 'v1', label: 'v₁ 初速度（m/s）', min: 0.5, max: 5, step: 0.1, default: 2 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var m1 = params.m1;
    var m2 = params.m2;
    var v1_0 = params.v1;
    var v2_0 = 0;

    /* 弹性碰撞公式 */
    var v1_1 = ((m1 - m2) * v1_0) / (m1 + m2);
    var v2_1 = (2 * m1 * v1_0) / (m1 + m2);

    /* 位置：以时间物理建模，duration 内完成 */
    var trackY = H / 2 + 20;
    var scale = 60;

    /* 碰撞时刻（根据位置推算） */
    var ballR1 = 20 + m1 * 6;
    var ballR2 = 20 + m2 * 6;
    var gap = 200;
    var tCollide = (gap - ballR1 - ballR2) / (v1_0 * scale) * 1;

    var physT = progress * 4;

    /* 计算位置 */
    var x1, x2;
    if (physT < tCollide) {
      x1 = -gap / 2 + v1_0 * scale * physT;
      x2 = gap / 2;
    } else {
      var tAfter = physT - tCollide;
      x1 = (-gap / 2 + v1_0 * scale * tCollide) + v1_1 * scale * tAfter;
      x2 = gap / 2 + v2_1 * scale * tAfter;
    }

    /* 世界坐标转屏幕 */
    var cx = W / 2;
    var sx1 = cx + x1;
    var sx2 = cx + x2;

    /* 轨道 */
    ctx.fillStyle = 'rgba(138,115,64,.15)';
    ctx.fillRect(0, trackY + ballR1, W, 20);
    ctx.beginPath();
    ctx.moveTo(0, trackY + ballR1);
    ctx.lineTo(W, trackY + ballR1);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 碰撞前速度 */
    var curV1 = physT < tCollide ? v1_0 : v1_1;
    var curV2 = physT < tCollide ? 0 : v2_1;

    /* 画球 */
    function drawBall(sx, sy, r, m, v, color1, color2) {
      var grad = ctx.createRadialGradient(sx - r * 0.3, sy - r * 0.3, 3, sx, sy, r);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(m.toFixed(1) + 'kg', sx, sy + 4);
    }

    drawBall(sx1, trackY, ballR1, m1, curV1, '#ffe9a8', '#b47c00');
    drawBall(sx2, trackY, ballR2, m2, curV2, '#d4ecd5', '#3f6b52');

    /* 速度箭头 */
    function drawVelArrow(sx, sy, r, v, color) {
      if (v === 0) return;
      var len = Math.min(80, Math.abs(v) * 20);
      var dir = v > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(sx + r * dir, sy - r - 20);
      ctx.lineTo(sx + r * dir + len * dir, sy - r - 20);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx + r * dir + len * dir, sy - r - 20);
      ctx.lineTo(sx + r * dir + len * dir - 8 * dir, sy - r - 25);
      ctx.lineTo(sx + r * dir + len * dir - 8 * dir, sy - r - 15);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    drawVelArrow(sx1, trackY, ballR1, curV1, '#b47c00');
    drawVelArrow(sx2, trackY, ballR2, curV2, '#3f6b52');

    /* 动量与动能 */
    var p1i = m1 * v1_0 + m2 * v2_0;
    var p1f = m1 * v1_1 + m2 * v2_1;
    var k1i = 0.5 * m1 * v1_0 * v1_0;
    var k1f = 0.5 * m1 * v1_1 * v1_1 + 0.5 * m2 * v2_1 * v2_1;

    /* 读数 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('碰撞前：', 20, 26);
    ctx.font = '12px Consolas, monospace';
    ctx.fillText('v₁ = ' + v1_0.toFixed(2) + ' m/s，v₂ = 0', 20, 46);

    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('碰撞后：', 20, 76);
    ctx.font = '12px Consolas, monospace';
    ctx.fillText("v₁' = " + v1_1.toFixed(3) + " m/s，v₂' = " + v2_1.toFixed(3) + " m/s", 20, 96);

    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('动量守恒：p前 = ' + p1i.toFixed(4) + ' kg·m/s', 20, 126);
    ctx.fillText('          p后 = ' + p1f.toFixed(4) + ' kg·m/s', 20, 148);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('动能守恒：E前 = ' + k1i.toFixed(4) + ' J', 20, 178);
    ctx.fillText('          E后 = ' + k1f.toFixed(4) + ' J', 20, 200);
  }
},

/* ============================================================
   ═══════════════════ 化 学（10） ═══════════════════
   ============================================================ */

{
  id: 'chem-titration',
  subject: 'chemistry',
  name: '酸碱中和滴定',
  tags: ['酸碱反应', '定量分析', 'pH'],
  desc: '用标准 NaOH 溶液滴定未知浓度的盐酸，绘制 pH 变化曲线。',
  purpose: '掌握中和滴定的原理与操作，理解滴定过程中 pH 的突变。',
  principle: 'HCl + NaOH → NaCl + H₂O。滴定终点时 n(HCl) = n(NaOH)。',
  apparatus: '酸式滴定管、碱式滴定管、锥形瓶、pH 计',
  steps: [
    '用标准 NaOH 溶液润洗碱式滴定管，装入标准液',
    '移取一定体积待测盐酸于锥形瓶',
    '边滴边振荡，记录 pH 随 NaOH 体积的变化',
    '以 pH 为纵轴、体积为横轴作图，找滴定终点'
  ],
  phenomenon: '开始 pH 上升缓慢；接近化学计量点时 pH 急剧上升；之后趋于平缓。',
  conclusion: '强酸强碱滴定的 pH 突跃范围约为 4-10，可用酚酞或甲基橙作指示剂。',
  notice: '滴定管使用前要润洗；读数视线与凹液面最低点相平；接近终点要半滴半滴加。',
  duration: 8,
  params: [
    { key: 'cHCl', label: '盐酸浓度 (mol/L)', min: 0.05, max: 0.5, step: 0.01, default: 0.1 },
    { key: 'cNaOH', label: 'NaOH 浓度 (mol/L)', min: 0.05, max: 0.5, step: 0.01, default: 0.1 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var cHCl = params.cHCl, cNaOH = params.cNaOH;
    var VHCl = 20;
    var V_eq = cHCl * VHCl / cNaOH;
    var V_max = V_eq * 2;

    var padL = 60, padR = 40, padT = 40, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245,179,1,.1)';
    ctx.lineWidth = 1;
    for (var i = 1; i <= 14; i++) {
      var y = padT + plotH * i / 14;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }

    function calcPH(V) {
      var nH = cHCl * VHCl / 1000;
      var nOH = cNaOH * V / 1000;
      if (Math.abs(nH - nOH) < 1e-10) return 7;
      if (nH > nOH) {
        var cH = (nH - nOH) / ((VHCl + V) / 1000);
        return -Math.log10(cH);
      } else {
        var cOH = (nOH - nH) / ((VHCl + V) / 1000);
        return 14 + Math.log10(cOH);
      }
    }

    var curV = progress * V_max;

    ctx.beginPath();
    for (var v = 0; v <= curV; v += V_max / 300) {
      var pH = calcPH(v);
      var x = padL + (v / V_max) * plotW;
      var y = padT + plotH - (pH / 14) * plotH;
      if (v === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#b47c00';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    var xEq = padL + (V_eq / V_max) * plotW;
    ctx.beginPath();
    ctx.moveTo(xEq, padT);
    ctx.lineTo(xEq, padT + plotH);
    ctx.strokeStyle = 'rgba(192,82,74,.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    var curPH = calcPH(curV);
    var curX = padL + (curV / V_max) * plotW;
    var curY = padT + plotH - (curPH / 14) * plotH;

    ctx.beginPath();
    ctx.arc(curX, curY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#c0524a';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 滴定管 */
    var tubeX = W - 90, tubeY = 60, tubeW = 20, tubeH = 120;
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillRect(tubeX, tubeY, tubeW, tubeH);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tubeX, tubeY, tubeW, tubeH);
    var liquidH = tubeH * (1 - progress);
    ctx.fillStyle = 'rgba(139,166,192,.7)';
    ctx.fillRect(tubeX + 2, tubeY + 2 + (tubeH - 4 - liquidH), tubeW - 4, liquidH);

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('已滴加 NaOH：' + curV.toFixed(1) + ' mL', 20, 24);
    ctx.fillText('化学计量点：' + V_eq.toFixed(1) + ' mL', 20, 46);
    ctx.fillStyle = '#b47c00';
    ctx.font = 'bold 18px Consolas, Menlo, monospace';
    ctx.fillText('pH = ' + curPH.toFixed(2), 20, 78);

    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('V(NaOH) / mL', padL + plotW / 2, H - 18);
    ctx.save();
    ctx.translate(20, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('pH', 0, 0);
    ctx.restore();
  }
},

{
  id: 'chem-sodium-water',
  subject: 'chemistry',
  name: '钠与水的反应',
  tags: ['金属', '钠', '置换反应'],
  desc: '钠浮在水面上，熔成小球，四处游动，发出嘶嘶声，溶液变红。',
  purpose: '观察钠的物理与化学性质，理解「浮熔游响红」五字口诀。',
  principle: '2Na + 2H₂O → 2NaOH + H₂↑。钠是活泼金属，与水剧烈反应。',
  apparatus: '烧杯、镊子、滤纸、小刀、钠块、蒸馏水、酚酞',
  steps: [
    '在烧杯中加入蒸馏水，滴入酚酞试液',
    '用镊子取钠，用滤纸吸干表面煤油',
    '用小刀切下绿豆大小的一块钠',
    '把钠投入水中，观察现象'
  ],
  phenomenon: '浮（浮在水面）、熔（熔成小球）、游（四处游动）、响（发出嘶嘶声）、红（溶液变红）。',
  conclusion: '钠与水剧烈反应生成 NaOH 和 H₂。',
  notice: '不可用手接触钠；取出的钠块不宜过大，否则可能爆炸；实验要在通风处进行。',
  duration: 6,
  params: [],
  init: function (state) {
    state.bubbles = [];
    state.t = 0;
    state.timer = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var waterY = H * 0.42;

    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, W, H);

    /* 烧杯 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.15, 50);
    ctx.lineTo(W * 0.15, H - 40);
    ctx.lineTo(W * 0.85, H - 40);
    ctx.lineTo(W * 0.85, 50);
    ctx.stroke();

    /* 水 */
    var waterGrad = ctx.createLinearGradient(0, waterY, 0, H - 40);
    waterGrad.addColorStop(0, 'rgba(200, 230, 240, .55)');
    waterGrad.addColorStop(1, 'rgba(140, 190, 210, .75)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(W * 0.15 + 2, waterY, W * 0.7 - 4, H - 40 - waterY - 2);

    /* 水面波纹 */
    ctx.beginPath();
    ctx.moveTo(W * 0.15, waterY);
    for (var x = W * 0.15; x <= W * 0.85; x += 5) {
      var y = waterY + Math.sin((x + elapsed * 100) / 25) * 2;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(120, 180, 200, .8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 变红 */
    var pinkness = Math.min(0.5, progress * 0.85);
    ctx.fillStyle = 'rgba(230, 120, 160, ' + pinkness + ')';
    ctx.fillRect(W * 0.15 + 2, waterY, W * 0.7 - 4, H - 40 - waterY - 2);

    /* 钠球 */
    state.t += dt;
    var ballX, ballY, ballR;
    if (state.t < 0.5) {
      ballY = waterY - 40 + state.t * 80;
      ballX = W / 2;
      ballR = 18;
    } else {
      var localT = state.t - 0.5;
      ballR = Math.max(8, 18 - localT * 3);
      ballX = W / 2 + Math.sin(localT * 3.5) * 60 + Math.sin(localT * 7.2) * 20;
      ballY = waterY - 4 + Math.sin(localT * 4) * 3;
    }

    if (progress < 0.98) {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
      var grad = ctx.createRadialGradient(ballX - ballR * 0.3, ballY - ballR * 0.3, 2, ballX, ballY, ballR);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, '#d8d8d8');
      grad.addColorStop(1, '#8a8a8a');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#5a5a5a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* 气泡 */
    state.timer += dt;
    if (state.timer > 0.05 && progress < 0.95) {
      state.timer = 0;
      state.bubbles.push({
        x: ballX + (Math.random() - 0.5) * ballR * 1.5,
        y: ballY,
        r: 2 + Math.random() * 3,
        vy: -30 - Math.random() * 40,
        life: 1
      });
    }

    for (var i = state.bubbles.length - 1; i >= 0; i--) {
      var b = state.bubbles[i];
      b.y += b.vy * dt;
      b.life -= dt * 0.8;
      if (b.life <= 0 || b.y < waterY - 10) {
        state.bubbles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (b.life * 0.7) + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(150, 180, 200, ' + b.life + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* 火焰 */
    if (progress > 0.7 && progress < 0.95) {
      var fa = Math.min(1, (progress - 0.7) / 0.1) * Math.min(1, (0.95 - progress) / 0.1);
      var fx = ballX, fy = ballY - ballR - 8;
      ctx.beginPath();
      ctx.moveTo(fx, fy - 25);
      ctx.quadraticCurveTo(fx - 12, fy - 5, fx, fy + 5);
      ctx.quadraticCurveTo(fx + 12, fy - 5, fx, fy - 25);
      var fgrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 20);
      fgrad.addColorStop(0, 'rgba(255, 240, 150, ' + fa + ')');
      fgrad.addColorStop(0.5, 'rgba(255, 180, 60, ' + (fa * 0.8) + ')');
      fgrad.addColorStop(1, 'rgba(255, 100, 20, 0)');
      ctx.fillStyle = fgrad;
      ctx.fill();
    }

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('2Na + 2H₂O → 2NaOH + H₂↑', 20, 28);
    ctx.fillStyle = '#c0524a';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('现象口诀：浮 · 熔 · 游 · 响 · 红', 20, H - 20);
  }
},

{
  id: 'chem-iron-copper',
  subject: 'chemistry',
  name: '铁与硫酸铜溶液反应',
  tags: ['金属', '置换反应'],
  desc: '铁钉浸入蓝色硫酸铜溶液，表面析出红色铜，溶液由蓝变浅绿。',
  purpose: '观察铁置换铜的置换反应，理解金属活动性顺序。',
  principle: 'Fe + CuSO₄ → FeSO₄ + Cu。铁比铜活泼，能从铜盐溶液中置换出铜。',
  apparatus: '试管、铁钉、硫酸铜溶液、砂纸',
  steps: [
    '用砂纸打磨铁钉，除去表面氧化膜',
    '向试管中加入约 5 mL 硫酸铜溶液',
    '把铁钉浸入溶液中，静置观察',
    '一段时间后取出铁钉，观察现象'
  ],
  phenomenon: '铁钉表面覆盖一层红色的铜；溶液由蓝色逐渐变为浅绿色（Fe²⁺ 颜色）。',
  conclusion: '铁能置换出硫酸铜中的铜，说明铁的金属活动性比铜强。',
  notice: '铁钉要先用砂纸打磨；溶液要新配；实验后要把铁钉洗净。',
  duration: 8,
  params: [],
  init: function (state) {
    state.copper = []; /* 铜析出点 */
    state.timer = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    /* 试管 */
    var tubeX = W / 2 - 60;
    var tubeW = 120;
    var tubeTop = 60;
    var tubeBottom = H - 40;
    var liquidTop = tubeTop + 80;

    /* 液体背景 */
    /* 蓝色 → 浅绿色 */
    var colorFrom = { r: 70, g: 130, b: 200 };
    var colorTo = { r: 150, g: 200, b: 140 };
    var r = Math.round(colorFrom.r + (colorTo.r - colorFrom.r) * progress);
    var g = Math.round(colorFrom.g + (colorTo.g - colorFrom.g) * progress);
    var b = Math.round(colorFrom.b + (colorTo.b - colorFrom.b) * progress);

    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.75)';
    ctx.fillRect(tubeX + 3, liquidTop, tubeW - 6, tubeBottom - liquidTop - 3);

    /* 试管轮廓 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tubeX, tubeTop);
    ctx.lineTo(tubeX, tubeBottom - 30);
    ctx.quadraticCurveTo(tubeX, tubeBottom, tubeX + 30, tubeBottom);
    ctx.lineTo(tubeX + tubeW - 30, tubeBottom);
    ctx.quadraticCurveTo(tubeX + tubeW, tubeBottom, tubeX + tubeW, tubeBottom - 30);
    ctx.lineTo(tubeX + tubeW, tubeTop);
    ctx.stroke();

    /* 液面 */
    ctx.beginPath();
    ctx.moveTo(tubeX + 3, liquidTop);
    ctx.lineTo(tubeX + tubeW - 3, liquidTop);
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 铁钉 */
    var nailX = W / 2;
    var nailTop = tubeTop + 30;
    var nailBottom = tubeBottom - 30;
    var nailW = 12;

    /* 铁钉主体（灰色） */
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(nailX - nailW / 2, nailTop, nailW, nailBottom - nailTop);
    /* 钉头 */
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(nailX - nailW, nailTop - 8, nailW * 2, 8);
    /* 钉尖 */
    ctx.beginPath();
    ctx.moveTo(nailX - nailW / 2, nailBottom);
    ctx.lineTo(nailX, nailBottom + 15);
    ctx.lineTo(nailX + nailW / 2, nailBottom);
    ctx.closePath();
    ctx.fillStyle = '#7a7a7a';
    ctx.fill();

    /* 铜析出 */
    state.timer += dt;
    if (state.timer > 0.15 && progress < 1) {
      state.timer = 0;
      for (var i = 0; i < 2; i++) {
        state.copper.push({
          x: nailX - nailW / 2 + Math.random() * nailW,
          y: nailTop + 30 + Math.random() * (nailBottom - nailTop - 40),
          r: 2 + Math.random() * 2,
          life: 1
        });
      }
    }

    /* 绘制铜 */
    for (var j = 0; j < state.copper.length; j++) {
      var cu = state.copper[j];
      cu.life = Math.min(1, cu.life + dt * 0.4);
      ctx.beginPath();
      ctx.arc(cu.x, cu.y, cu.r * cu.life, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(184, 115, 51, ' + (0.6 + cu.life * 0.4) + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Fe + CuSO₄ → FeSO₄ + Cu', 20, 28);
    ctx.fillText('时间：' + elapsed.toFixed(1) + ' s', 20, 50);
    ctx.fillStyle = '#8a7340';
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('现象：铁钉表面覆盖红色铜', 20, 76);
    ctx.fillText('溶液由蓝色变为浅绿色', 20, 96);
  }
},

{
  id: 'chem-electrolysis-water',
  subject: 'chemistry',
  name: '电解水',
  tags: ['电解', '水', '电极反应'],
  desc: '通电后两极产生气泡，负极氢气和正极氧气的体积比约为 2:1。',
  purpose: '验证水的组成，理解电解的原理。',
  principle: '2H₂O --通电--> 2H₂↑ + O₂↑。阴极（负极）产生 H₂，阳极（正极）产生 O₂，体积比 2:1。',
  apparatus: '电解水装置、直流电源、导线、水（加硫酸钠）',
  steps: [
    '向电解器中加入蒸馏水，滴入少量硫酸钠',
    '连接直流电源，打开开关',
    '观察两个电极上的现象',
    '用燃着的木条检验两种气体'
  ],
  phenomenon: '两极都有气泡产生，负极气体体积约为正极的两倍。',
  conclusion: '水由氢、氧两种元素组成；电解水产生 H₂ 和 O₂，体积比 2:1。',
  notice: '纯水导电性差，需加电解质；必须用直流电；氢氧混合可能爆炸。',
  duration: 8,
  params: [],
  init: function (state) {
    state.hBubbles = [];
    state.oBubbles = [];
    state.timer = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var centerX = W / 2;
    var tubeTop = 80;
    var tubeBottom = H - 100;
    var tubeW = 70;
    var gap = 30;

    ctx.fillStyle = '#8a7340';
    ctx.fillRect(W * 0.15, H - 60, W * 0.7, 30);

    var midX = centerX - tubeW / 2;
    ctx.fillStyle = 'rgba(200, 230, 240, .5)';
    ctx.fillRect(midX, tubeTop - 30, tubeW, tubeBottom - tubeTop + 30);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.strokeRect(midX, tubeTop - 30, tubeW, tubeBottom - tubeTop + 30);

    var leftX = centerX - tubeW - gap - 20;
    ctx.fillStyle = 'rgba(200, 230, 240, .5)';
    ctx.fillRect(leftX, tubeTop, tubeW, tubeBottom - tubeTop);
    ctx.strokeRect(leftX, tubeTop, tubeW, tubeBottom - tubeTop);

    var rightX = centerX + gap + 20;
    ctx.fillStyle = 'rgba(200, 230, 240, .5)';
    ctx.fillRect(rightX, tubeTop, tubeW, tubeBottom - tubeTop);
    ctx.strokeRect(rightX, tubeTop, tubeW, tubeBottom - tubeTop);

    /* 电极 */
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(leftX + tubeW / 2 - 3, tubeTop, 6, 40);
    ctx.fillRect(rightX + tubeW / 2 - 3, tubeTop, 6, 40);

    /* 电源 */
    var batX = W / 2 - 60;
    var batY = 20;
    ctx.fillStyle = '#fff';
    ctx.fillRect(batX, batY, 120, 40);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.strokeRect(batX, batY, 120, 40);
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('直流电源', W / 2, batY + 26);

    /* 导线 */
    ctx.beginPath();
    ctx.moveTo(batX, batY + 20);
    ctx.lineTo(leftX + tubeW / 2, batY + 20);
    ctx.lineTo(leftX + tubeW / 2, tubeTop);
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(batX + 120, batY + 20);
    ctx.lineTo(rightX + tubeW / 2, batY + 20);
    ctx.lineTo(rightX + tubeW / 2, tubeTop);
    ctx.strokeStyle = '#4a7fb5';
    ctx.stroke();

    /* 气泡 */
    state.timer += dt;
    if (state.timer > 0.1 && progress < 1) {
      state.timer = 0;
      for (var i = 0; i < 2; i++) {
        state.hBubbles.push({
          x: leftX + tubeW / 2 + (Math.random() - 0.5) * 30,
          y: tubeBottom - 20,
          r: 3 + Math.random() * 2,
          vy: -40 - Math.random() * 30
        });
      }
      state.oBubbles.push({
        x: rightX + tubeW / 2 + (Math.random() - 0.5) * 30,
        y: tubeBottom - 20,
        r: 3 + Math.random() * 2,
        vy: -40 - Math.random() * 30
      });
    }

    function updateBubbles(arr) {
      for (var i = arr.length - 1; i >= 0; i--) {
        var b = arr[i];
        b.y += b.vy * dt;
        if (b.y < tubeTop + 10) {
          arr.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, .85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(150, 180, 200, .9)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    updateBubbles(state.hBubbles);
    updateBubbles(state.oBubbles);

    /* 气体液面 */
    var hGasH = (tubeBottom - tubeTop - 30) * progress * 0.8;
    var oGasH = hGasH / 2;

    ctx.fillStyle = 'rgba(200, 230, 240, .7)';
    ctx.fillRect(leftX + 2, tubeTop + 30, tubeW - 4, hGasH);
    ctx.fillStyle = 'rgba(240, 200, 200, .7)';
    ctx.fillRect(rightX + 2, tubeTop + 30, tubeW - 4, oGasH);

    ctx.fillStyle = '#4a7fb5';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('负极 (阴极)', leftX + tubeW / 2, H - 30);
    ctx.fillText('正极 (阳极)', rightX + tubeW / 2, H - 30);

    ctx.fillStyle = '#c0524a';
    ctx.font = 'bold 16px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('H₂', leftX + tubeW / 2, H - 8);
    ctx.fillText('O₂', rightX + tubeW / 2, H - 8);

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('2H₂O --通电--> 2H₂↑ + O₂↑', 20, 28);
    ctx.fillText('体积比 H₂ : O₂ = 2 : 1', 20, 50);
  }
},

{
  id: 'chem-equilibrium',
  subject: 'chemistry',
  name: '化学平衡移动（勒夏特列原理）',
  tags: ['化学平衡', '勒夏特列原理'],
  desc: '改变温度或浓度，观察平衡向减弱这种改变的方向移动。',
  purpose: '理解勒夏特列原理：改变影响平衡的一个条件，平衡向减弱这种改变的方向移动。',
  principle: '以 N₂ + 3H₂ ⇌ 2NH₃ 为例。增大压强，平衡正向移动（气体分子数减少的方向）；升高温度，平衡向吸热方向移动；增大反应物浓度，平衡正向移动。',
  apparatus: '（演示动画）',
  steps: [
    '观察平衡状态下正逆反应速率相等',
    '改变一个条件（浓度、温度、压强）',
    '观察正逆反应速率的变化',
    '等待新平衡建立，观察平衡移动方向'
  ],
  phenomenon: '改变条件后，正逆速率暂时不相等，体系重新调整直到新平衡。',
  conclusion: '平衡移动方向遵循勒夏特列原理：向减弱这种改变的方向移动。',
  notice: '催化剂只改变反应速率，不影响平衡位置。',
  duration: 10,
  params: [
    { key: 'changeType', label: '改变条件（0=加大反应物, 1=升温, 2=加压）', min: 0, max: 2, step: 1, default: 0 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var changeT = progress * elapsed;

    /* 平衡建立过程：正逆速率曲线 */
    var padL = 60, padR = 40, padT = 60, padB = 60;
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

    /* 改变条件的时间点 */
    var changeAt = 0.5;
    var changed = progress > changeAt;

    /* 正逆反应速率模型 */
    function vForward(t) {
      var base = 1 - Math.exp(-t * 1.5);
      if (params.changeType === 0) {
        /* 加大反应物：正速率突增 */
        if (t > changeAt * 6) base += 0.6 * Math.exp(-(t - changeAt * 6) * 1.5);
      }
      return base;
    }
    function vReverse(t) {
      var base = 1 - Math.exp(-t * 1.5);
      if (params.changeType === 0 && t > changeAt * 6) {
        base += 0.3 * Math.exp(-(t - changeAt * 6) * 1);
      } else if (params.changeType === 1) {
        /* 升温：双向都加快，逆反应吸热加快更多 */
        if (t > changeAt * 6) base += 0.7 * Math.exp(-(t - changeAt * 6) * 1);
      } else if (params.changeType === 2) {
        /* 加压：正向移动（气体分子数减少） */
        if (t > changeAt * 6) base += 0.3 * Math.exp(-(t - changeAt * 6) * 1.5);
      }
      return base;
    }

    var T = 3;
    var nowT = progress * 6;
    var vF = vForward(nowT);
    var vR = vReverse(nowT);

    /* 绘制曲线 */
    var range = 2.2;
    var px = function (t) { return padL + (t / 6) * plotW; };
    var py = function (v) { return padT + plotH - (v / range) * plotH; };

    /* 正反应速率 */
    ctx.beginPath();
    for (var t = 0; t <= nowT; t += 0.05) {
      var v = vForward(t);
      if (t === 0) ctx.moveTo(px(t), py(v));
      else ctx.lineTo(px(t), py(v));
    }
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 逆反应速率 */
    ctx.beginPath();
    for (var t2 = 0; t2 <= nowT; t2 += 0.05) {
      var v2 = vReverse(t2);
      if (t2 === 0) ctx.moveTo(px(t2), py(v2));
      else ctx.lineTo(px(t2), py(v2));
    }
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 平衡线 */
    ctx.beginPath();
    ctx.moveTo(px(0), py(1));
    ctx.lineTo(px(6), py(1));
    ctx.strokeStyle = 'rgba(138,115,64,.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* 改变条件竖线 */
    ctx.beginPath();
    ctx.moveTo(px(changeAt * 6), padT);
    ctx.lineTo(px(changeAt * 6), padT + plotH);
    ctx.strokeStyle = 'rgba(245,179,1,.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#b47c00';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('改变条件', px(changeAt * 6), padT - 10);

    /* 图例 */
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('—— v(正)', padL + 10, padT + 20);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('—— v(逆)', padL + 110, padT + 20);

    /* 文字说明 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('N₂ + 3H₂ ⇌ 2NH₃（放热反应）', 20, 26);

    var msg = '';
    if (params.changeType === 0) msg = '改变条件：增大反应物浓度 → 平衡正向移动';
    else if (params.changeType === 1) msg = '改变条件：升高温度 → 平衡向吸热方向（逆向）移动';
    else msg = '改变条件：增大压强 → 平衡向气体分子数减少的方向（正向）移动';

    ctx.fillStyle = '#8a7340';
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(msg, 20, 50);

    ctx.fillStyle = '#b47c00';
    ctx.fillText('勒夏特列原理：平衡向减弱这种改变的方向移动', 20, 74);
  }
},

{
  id: 'chem-galvanic',
  subject: 'chemistry',
  name: '原电池原理',
  tags: ['电化学', '原电池', '氧化还原'],
  desc: '铜锌原电池中，锌失电子、铜离子得电子，电子从锌经外电路流向铜。',
  purpose: '理解原电池的工作原理：化学能转化为电能。',
  principle: '负极（Zn）：Zn - 2e⁻ → Zn²⁺（氧化）；正极（Cu）：2H⁺ + 2e⁻ → H₂↑（还原）。电子从负极经外电路到正极。',
  apparatus: '锌片、铜片、稀硫酸、导线、电流计、烧杯',
  steps: [
    '在烧杯中加入稀硫酸',
    '插入锌片和铜片，用导线连接',
    '导线中间接入电流计',
    '观察电流计偏转和两极现象'
  ],
  phenomenon: '电流计指针偏转；锌片逐渐溶解；铜片表面产生气泡（H₂）。',
  conclusion: '原电池将化学能转化为电能；电子从负极经外电路流向正极。',
  notice: '必须有两个活动性不同的电极、电解质溶液、闭合回路；锌片是负极，铜片是正极。',
  duration: 8,
  params: [],
  init: function (state) {
    state.electrons = [];
    state.bubbles = [];
    state.timer = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var beakerY = H * 0.35;
    var beakerBottom = H - 60;

    /* 烧杯 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, beakerY);
    ctx.lineTo(W * 0.2, beakerBottom);
    ctx.lineTo(W * 0.8, beakerBottom);
    ctx.lineTo(W * 0.8, beakerY);
    ctx.stroke();

    /* 溶液 */
    var solGrad = ctx.createLinearGradient(0, beakerY + 20, 0, beakerBottom);
    solGrad.addColorStop(0, 'rgba(200, 230, 240, .5)');
    solGrad.addColorStop(1, 'rgba(160, 210, 230, .7)');
    ctx.fillStyle = solGrad;
    ctx.fillRect(W * 0.2 + 3, beakerY + 20, W * 0.6 - 6, beakerBottom - beakerY - 23);

    /* 电极位置 */
    var znX = W * 0.35;
    var cuX = W * 0.65;
    var electrodeTop = beakerY - 80;
    var electrodeBottom = beakerBottom - 20;

    /* 锌片 */
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(znX - 12, electrodeTop, 24, electrodeBottom - electrodeTop);
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(znX - 12, electrodeTop, 24, electrodeBottom - electrodeTop);

    /* 铜片 */
    ctx.fillStyle = '#b87333';
    ctx.fillRect(cuX - 12, electrodeTop, 24, electrodeBottom - electrodeTop);
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cuX - 12, electrodeTop, 24, electrodeBottom - electrodeTop);

    /* 导线 */
    ctx.beginPath();
    ctx.moveTo(znX, electrodeTop);
    ctx.lineTo(znX, 40);
    ctx.lineTo(cuX, 40);
    ctx.lineTo(cuX, electrodeTop);
    ctx.strokeStyle = '#3a2a00';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 电流计 */
    var meterX = (znX + cuX) / 2;
    ctx.fillStyle = '#fff';
    ctx.fillRect(meterX - 25, 20, 50, 40);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX - 25, 20, 50, 40);
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', meterX, 46);

    /* 指针 */
    var needleAngle = Math.sin(elapsed * 3) * 0.15 + 0.3;
    ctx.save();
    ctx.translate(meterX, 56);
    ctx.rotate(needleAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -18);
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    /* 电子流动 */
    state.timer += dt;
    if (state.timer > 0.05 && progress < 1) {
      state.timer = 0;
      state.electrons.push({
        t: 0,
        path: [
          { x: znX, y: electrodeTop },
          { x: znX, y: 40 },
          { x: cuX, y: 40 },
          { x: cuX, y: electrodeTop }
        ]
      });
    }

    /* 绘制电子 */
    for (var i = state.electrons.length - 1; i >= 0; i--) {
      var e = state.electrons[i];
      e.t += dt * 0.6;
      if (e.t > 1) {
        state.electrons.splice(i, 1);
        continue;
      }
      /* 沿路径插值 */
      var p = e.t * (e.path.length - 1);
      var idx = Math.floor(p);
      var frac = p - idx;
      if (idx >= e.path.length - 1) idx = e.path.length - 2;
      var p1 = e.path[idx];
      var p2 = e.path[idx + 1];
      var ex = p1.x + (p2.x - p1.x) * frac;
      var ey = p1.y + (p2.y - p1.y) * frac;

      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f5b301';
      ctx.fill();
      ctx.strokeStyle = '#b47c00';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* 氢气气泡（铜片表面） */
    if (state.timer === 0 && Math.random() < 0.5 && progress < 1) {
      state.bubbles.push({
        x: cuX + (Math.random() - 0.5) * 20,
        y: electrodeBottom - 30,
        r: 3 + Math.random() * 2,
        vy: -30 - Math.random() * 20,
        life: 1
      });
    }

    for (var j = state.bubbles.length - 1; j >= 0; j--) {
      var b = state.bubbles[j];
      b.y += b.vy * dt;
      b.life -= dt * 0.4;
      if (b.life <= 0 || b.y < beakerY + 30) {
        state.bubbles.splice(j, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + b.life + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(150, 180, 200, ' + b.life + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* 标签 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Zn（负极）', znX, beakerBottom + 30);
    ctx.fillText('Cu（正极）', cuX, beakerBottom + 30);

    ctx.fillStyle = '#c0524a';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('氧化：Zn - 2e⁻ → Zn²⁺', znX, beakerY - 100);
    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('还原：2H⁺ + 2e⁻ → H₂↑', cuX, beakerY - 100);

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('电子从 Zn 经外电路流向 Cu', 20, H - 18);
  }
},

{
  id: 'chem-reaction-rate',
  subject: 'chemistry',
  name: '化学反应速率',
  tags: ['反应速率', '催化剂', '温度'],
  desc: '比较不同温度、浓度、催化剂条件下的反应速率。',
  purpose: '理解影响化学反应速率的因素：浓度、温度、催化剂、表面积。',
  principle: '温度升高、浓度增大、使用催化剂、增大接触面积，都会加快反应速率。',
  apparatus: '试管、稀盐酸、镁条、二氧化锰、过氧化氢',
  steps: [
    '在不同温度下进行同一反应，比较快慢',
    '改变反应物浓度，比较快慢',
    '加入催化剂，比较快慢',
    '记录反应时间，绘制速率曲线'
  ],
  phenomenon: '温度越高、浓度越大、有催化剂时，反应越快，产生的气体越多。',
  conclusion: '温度、浓度、催化剂、表面积都会影响反应速率。',
  notice: '催化剂参与反应但反应前后质量和性质不变；温度每升高 10℃ 速率约加快 2-4 倍。',
  duration: 8,
  params: [
    { key: 'temp', label: '温度（℃）', min: 0, max: 80, step: 5, default: 25 },
    { key: 'conc', label: '浓度（相对值）', min: 0.2, max: 2, step: 0.1, default: 1 },
    { key: 'catalyst', label: '催化剂（0=无, 1=有）', min: 0, max: 1, step: 1, default: 0 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 60, padR = 40, padT = 60, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    /* 速率常数（简化模型） */
    var rateConstant = Math.pow(2, (params.temp - 25) / 10) * params.conc;
    if (params.catalyst) rateConstant *= 5;

    /* 反应物浓度随时间递减 */
    function concAt(t) {
      return Math.exp(-rateConstant * t);
    }
    function productAt(t) {
      return 1 - concAt(t);
    }

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
    for (var i = 1; i <= 8; i++) {
      var y = padT + plotH * i / 8;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }

    var T = 6;
    var nowT = progress * T;

    /* 反应物曲线 */
    var px = function (t) { return padL + (t / T) * plotW; };
    var py = function (c) { return padT + plotH - c * plotH; };

    ctx.beginPath();
    for (var t = 0; t <= nowT; t += 0.05) {
      var c = concAt(t);
      if (t === 0) ctx.moveTo(px(t), py(c));
      else ctx.lineTo(px(t), py(c));
    }
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 生成物曲线 */
    ctx.beginPath();
    for (var t2 = 0; t2 <= nowT; t2 += 0.05) {
      var c2 = productAt(t2);
      if (t2 === 0) ctx.moveTo(px(t2), py(c2));
      else ctx.lineTo(px(t2), py(c2));
    }
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 图例 */
    ctx.fillStyle = '#4a7fb5';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('—— 反应物浓度', padL + 10, padT + 20);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('—— 生成物浓度', padL + 170, padT + 20);

    /* 读数 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('温度：' + params.temp + ' ℃', 20, 26);
    ctx.fillText('浓度：' + params.conc.toFixed(1), 20, 48);
    ctx.fillText('催化剂：' + (params.catalyst ? '有（速率 ×5）' : '无'), 20, 70);

    ctx.fillStyle = '#b47c00';
    ctx.fillText('相对速率常数 k = ' + rateConstant.toFixed(3), 20, 100);
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('温度每升 10℃，速率约加快 2 倍', 20, 124);

    /* 坐标轴标签 */
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('时间 / s', padL + plotW / 2, H - 18);
    ctx.save();
    ctx.translate(20, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('相对浓度', 0, 0);
    ctx.restore();
  }
},

{
  id: 'chem-precipitation',
  subject: 'chemistry',
  name: '沉淀溶解平衡',
  tags: ['沉淀', '溶解平衡', '溶度积'],
  desc: 'AgCl 在溶液中同时存在沉淀和溶解过程，最终达到动态平衡。',
  purpose: '理解沉淀溶解平衡的动态性和溶度积 Ksp 的含义。',
  principle: 'AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)。达到平衡时，沉淀速率等于溶解速率，Ksp = [Ag⁺][Cl⁻]。',
  apparatus: '试管、AgNO₃ 溶液、NaCl 溶液',
  steps: [
    '在试管中加入 AgNO₃ 溶液',
    '滴加 NaCl 溶液，生成白色 AgCl 沉淀',
    '静置一段时间，观察沉淀量不再变化',
    '加 Na₂S 溶液，观察 AgCl 转化为黑色 Ag₂S'
  ],
  phenomenon: '加入 NaCl 立即生成白色 AgCl 沉淀；加入 Na₂S 后，白色沉淀转变为黑色 Ag₂S。',
  conclusion: '沉淀溶解平衡是动态平衡；溶解度大的沉淀可转化为溶解度更小的沉淀。',
  notice: 'Ksp(AgCl) > Ksp(Ag₂S)，所以 AgCl 能转化为 Ag₂S。',
  duration: 8,
  params: [],
  init: function (state) {
    state.particles = [];
    state.timer = 0;
    state.phase = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var beakerX = W * 0.2;
    var beakerY = 60;
    var beakerW = W * 0.6;
    var beakerH = H - 120;

    /* 烧杯 */
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY);
    ctx.stroke();

    /* 溶液 */
    var liquidTop = beakerY + 100;
    ctx.fillStyle = 'rgba(200, 230, 240, .5)';
    ctx.fillRect(beakerX + 3, liquidTop, beakerW - 6, beakerY + beakerH - liquidTop - 3);

    /* 沉淀（AgCl 白色，后期变黑 Ag₂S） */
    var sedHeight = Math.min(60, progress * 80);

    /* 判断阶段：0-0.6 生成 AgCl，0.6-1.0 转化为 Ag₂S */
    var isBlack = progress > 0.65;
    var blackProgress = isBlack ? Math.min(1, (progress - 0.65) / 0.35) : 0;

    var sedBaseY = beakerY + beakerH - 3;
    for (var i = 0; i < 60; i++) {
      var sx = beakerX + 20 + Math.random() * (beakerW - 40);
      var sy = sedBaseY - Math.random() * sedHeight;
      if (sy < liquidTop + 20) sy = liquidTop + 20;

      var isBlackParticle = Math.random() < blackProgress;
      ctx.fillStyle = isBlackParticle ? 'rgba(40, 40, 40, 0.85)' : 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isBlackParticle ? 'rgba(0,0,0,.5)' : 'rgba(180, 180, 180, .7)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    /* 离子动画 */
    state.timer += dt;
    if (state.timer > 0.15 && progress < 1) {
      state.timer = 0;
      state.particles.push({
        x: beakerX + 20 + Math.random() * (beakerW - 40),
        y: sedBaseY - 20,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 40,
        life: 1,
        type: Math.random() < 0.5 ? 'Ag' : 'Cl'
      });
    }

    for (var j = state.particles.length - 1; j >= 0; j--) {
      var p = state.particles[j];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 0.5;
      if (p.life <= 0 || p.y < liquidTop) {
        state.particles.splice(j, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 'Ag' ? 'rgba(180, 180, 200, ' + p.life + ')' : 'rgba(150, 200, 160, ' + p.life + ')';
      ctx.fill();
    }

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)', 20, 26);

    var msg = progress < 0.3 ? '加入 NaCl，生成白色 AgCl 沉淀'
      : progress < 0.65 ? '静置中，沉淀与溶解速率相等（动态平衡）'
      : '加入 Na₂S，AgCl 转化为更小的 Ag₂S（黑色）';

    ctx.fillStyle = '#8a7340';
    ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(msg, 20, 50);

    if (progress > 0.65) {
      ctx.fillStyle = '#3a2a00';
      ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText('2AgCl + S²⁻ → Ag₂S↓ + 2Cl⁻', 20, 76);
      ctx.fillStyle = '#8a7340';
      ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText('Ksp(AgCl) = 1.8×10⁻¹⁰ > Ksp(Ag₂S) = 6.3×10⁻⁵⁰', 20, 96);
    }
  }
},

{
  id: 'chem-flame-test',
  subject: 'chemistry',
  name: '焰色反应',
  tags: ['元素性质', '焰色', '定性分析'],
  desc: '不同金属离子在火焰中呈现不同颜色，用于元素定性分析。',
  purpose: '记住常见金属离子的焰色，理解焰色反应的原理。',
  principle: '金属元素的原子在火焰中受热激发，电子跃迁回到低能级时释放特定波长的光，形成特征焰色。',
  apparatus: '铂丝（或镍铬丝）、酒精灯、盐酸、待测盐溶液',
  steps: [
    '用稀盐酸洗涤铂丝，在火焰上灼烧至无色',
    '蘸取待测溶液，在酒精灯外焰上灼烧',
    '观察火焰颜色，记录',
    '每次实验前重新用盐酸洗涤铂丝'
  ],
  phenomenon: 'Na 黄色、K 紫色（需透过蓝色钴玻璃）、Cu 绿色、Ca 砖红色、Ba 黄绿色。',
  conclusion: '焰色反应是元素的物理性质，可用于碱金属、碱土金属的定性分析。',
  notice: '焰色反应是物理变化；钾的紫色需透过蓝色钴玻璃观察，滤去钠的黄光。',
  duration: 8,
  params: [
    { key: 'metal', label: '金属离子（0=Na, 1=K, 2=Cu, 3=Ca, 4=Ba）', min: 0, max: 4, step: 1, default: 0 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    var FLAME_COLORS = [
      { name: 'Na⁺', color: 'rgba(255, 220, 80, 0.85)', inner: 'rgba(255, 250, 200, 0.9)', glow: 'rgba(255, 220, 80, 0.4)' },
      { name: 'K⁺', color: 'rgba(200, 140, 220, 0.85)', inner: 'rgba(240, 200, 255, 0.9)', glow: 'rgba(200, 140, 220, 0.4)' },
      { name: 'Cu²⁺', color: 'rgba(80, 200, 120, 0.85)', inner: 'rgba(180, 240, 200, 0.9)', glow: 'rgba(80, 200, 120, 0.4)' },
      { name: 'Ca²⁺', color: 'rgba(220, 80, 60, 0.85)', inner: 'rgba(255, 160, 140, 0.9)', glow: 'rgba(220, 80, 60, 0.4)' },
      { name: 'Ba²⁺', color: 'rgba(180, 220, 100, 0.85)', inner: 'rgba(220, 240, 180, 0.9)', glow: 'rgba(180, 220, 100, 0.4)' }
    ];

    var metal = FLAME_COLORS[Math.floor(params.metal)];

    /* 酒精灯 */
    var lampX = W / 2;
    var lampY = H - 80;
    var lampW = 100;
    var lampH = 60;

    /* 灯身 */
    var lampGrad = ctx.createLinearGradient(lampX - lampW / 2, lampY - lampH, lampX + lampW / 2, lampY);
    lampGrad.addColorStop(0, '#a8c8ef');
    lampGrad.addColorStop(1, '#7aa6bf');
    ctx.fillStyle = lampGrad;
    ctx.beginPath();
    ctx.moveTo(lampX - lampW / 2, lampY);
    ctx.lineTo(lampX - lampW / 3, lampY - lampH);
    ctx.lineTo(lampX + lampW / 3, lampY - lampH);
    ctx.lineTo(lampX + lampW / 2, lampY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 灯芯 */
    ctx.fillStyle = '#8a7340';
    ctx.fillRect(lampX - 8, lampY - lampH - 15, 16, 20);

    /* 火焰 */
    var flameHeight = 120 * (0.4 + progress * 0.6);
    var flameBaseY = lampY - lampH - 15;

    /* 外层光晕 */
    var glowGrad = ctx.createRadialGradient(lampX, flameBaseY - flameHeight / 2, 10, lampX, flameBaseY - flameHeight / 2, 100);
    glowGrad.addColorStop(0, metal.glow);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(lampX, flameBaseY - flameHeight / 2, 100, 0, Math.PI * 2);
    ctx.fill();

    /* 外焰 */
    ctx.beginPath();
    ctx.moveTo(lampX - 30, flameBaseY);
    ctx.quadraticCurveTo(lampX - 40, flameBaseY - flameHeight * 0.5, lampX, flameBaseY - flameHeight);
    ctx.quadraticCurveTo(lampX + 40, flameBaseY - flameHeight * 0.5, lampX + 30, flameBaseY);
    ctx.closePath();
    ctx.fillStyle = metal.color;
    ctx.fill();

    /* 内焰 */
    ctx.beginPath();
    ctx.moveTo(lampX - 15, flameBaseY);
    ctx.quadraticCurveTo(lampX - 20, flameBaseY - flameHeight * 0.4, lampX, flameBaseY - flameHeight * 0.65);
    ctx.quadraticCurveTo(lampX + 20, flameBaseY - flameHeight * 0.4, lampX + 15, flameBaseY);
    ctx.closePath();
    ctx.fillStyle = metal.inner;
    ctx.fill();

    /* 焰心 */
    var coreGrad = ctx.createRadialGradient(lampX, flameBaseY - 15, 2, lampX, flameBaseY - 15, 15);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, .9)');
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(lampX, flameBaseY - 15, 15, 0, Math.PI * 2);
    ctx.fill();

    /* 铂丝 */
    ctx.beginPath();
    ctx.moveTo(W * 0.15, 100);
    ctx.quadraticCurveTo(W * 0.3, 150, lampX, flameBaseY - 40);
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(lampX, flameBaseY - 40, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#d0d0d0';
    ctx.fill();
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;
    ctx.stroke();

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 16px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('金属离子：' + metal.name, 20, 30);

    var colorName = ['黄色', '紫色', '绿色', '砖红色', '黄绿色'][params.metal];
    ctx.fillStyle = '#b47c00';
    ctx.font = 'bold 15px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('焰色：' + colorName, 20, 56);

    if (params.metal === 1) {
      ctx.fillStyle = '#8a7340';
      ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText('（钾的紫色需透过蓝色钴玻璃观察）', 20, 80);
    }
  }
},

{
  id: 'chem-chlorine',
  subject: 'chemistry',
  name: '氯气的实验室制取',
  tags: ['气体制备', '氯气', '实验装置'],
  desc: '用 MnO₂ 与浓盐酸加热制取氯气，经净化、收集、尾气处理。',
  purpose: '掌握实验室制取气体的典型装置：发生、净化、收集、尾气处理。',
  principle: 'MnO₂ + 4HCl(浓) --Δ--> MnCl₂ + Cl₂↑ + 2H₂O。Cl₂ 密度比空气大、有毒，需向上排空气收集，尾气用 NaOH 吸收。',
  apparatus: '圆底烧瓶、分液漏斗、酒精灯、洗气瓶、集气瓶、NaOH 溶液',
  steps: [
    '在烧瓶中加入 MnO₂，分液漏斗中加入浓盐酸',
    '缓缓滴加浓盐酸，点燃酒精灯加热',
    '气体经饱和食盐水（除 HCl）、浓硫酸（干燥）',
    '用向上排空气法收集氯气',
    '尾气用 NaOH 溶液吸收'
  ],
  phenomenon: '烧瓶内产生黄绿色气体；集气瓶中充满黄绿色气体。',
  conclusion: '实验室制氯气需加热；收集用向上排空气法；尾气必须处理，防止污染。',
  notice: '氯气有毒，实验须在通风橱中进行；尾气用 NaOH 吸收；多余的氯气不可直接排放。',
  duration: 8,
  params: [],
  init: function (state) {
    state.gasParticles = [];
    state.timer = 0;
  },
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;

    /* 装置从左到右：烧瓶 → 洗气瓶1（饱和食盐水）→ 洗气瓶2（浓硫酸）→ 集气瓶 → 尾气吸收 */
    var yBase = H / 2 + 20;
    var unitW = W / 5.5;

    /* 1. 圆底烧瓶（发生装置） */
    var flaskX = unitW * 0.9;
    var flaskY = yBase;
    var flaskR = 45;

    /* 烧瓶 */
    ctx.beginPath();
    ctx.arc(flaskX, flaskY, flaskR, 0, Math.PI * 2);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(200, 230, 240, .4)';
    ctx.fill();
    ctx.stroke();

    /* 液体 */
    ctx.beginPath();
    ctx.arc(flaskX, flaskY, flaskR - 4, Math.PI * 0.15, Math.PI * 0.85);
    ctx.closePath();
    ctx.fillStyle = 'rgba(180, 200, 220, .6)';
    ctx.fill();

    /* 烧瓶口 */
    ctx.strokeStyle = '#8a7340';
    ctx.beginPath();
    ctx.moveTo(flaskX - 12, flaskY - flaskR);
    ctx.lineTo(flaskX - 12, flaskY - flaskR - 40);
    ctx.moveTo(flaskX + 12, flaskY - flaskR);
    ctx.lineTo(flaskX + 12, flaskY - flaskR - 40);
    ctx.stroke();

    /* 分液漏斗 */
    ctx.beginPath();
    ctx.moveTo(flaskX - 10, flaskY - flaskR - 40);
    ctx.lineTo(flaskX - 10, flaskY - flaskR - 80);
    ctx.lineTo(flaskX + 10, flaskY - flaskR - 80);
    ctx.lineTo(flaskX + 10, flaskY - flaskR - 40);
    ctx.stroke();
    ctx.fillStyle = 'rgba(245, 179, 1, .4)';
    ctx.fillRect(flaskX - 10, flaskY - flaskR - 80, 20, 30);

    /* 酒精灯 */
    ctx.fillStyle = '#a8c8ef';
    ctx.beginPath();
    ctx.moveTo(flaskX - 15, flaskY + flaskR + 30);
    ctx.lineTo(flaskX - 10, flaskY + flaskR + 10);
    ctx.lineTo(flaskX + 10, flaskY + flaskR + 10);
    ctx.lineTo(flaskX + 15, flaskY + flaskR + 30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a7fb5';
    ctx.stroke();

    /* 火焰 */
    ctx.beginPath();
    ctx.moveTo(flaskX - 8, flaskY + flaskR + 10);
    ctx.quadraticCurveTo(flaskX, flaskY + flaskR - 15, flaskX + 8, flaskY + flaskR + 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 180, 60, .8)';
    ctx.fill();

    /* 气体（黄绿色）产生 */
    state.timer += dt;
    if (state.timer > 0.15 && progress < 0.9) {
      state.timer = 0;
      state.gasParticles.push({
        x: flaskX,
        y: flaskY - flaskR - 10,
        stage: 0,
        t: 0,
        r: 3 + Math.random() * 2
      });
    }

    /* 管道 */
    var pipeY = flaskY - flaskR - 60;

    ctx.beginPath();
    ctx.moveTo(flaskX + 12, flaskY - flaskR - 30);
    ctx.lineTo(flaskX + 12, pipeY);
    ctx.lineTo(unitW * 2, pipeY);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 洗气瓶 1（饱和食盐水，除 HCl） */
    var wb1X = unitW * 2.3;
    var wb1Y = yBase;
    var wb1W = 60;
    var wb1H = 80;

    ctx.fillStyle = 'rgba(200, 230, 240, .5)';
    ctx.fillRect(wb1X - wb1W / 2, wb1Y - wb1H / 2, wb1W, wb1H);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.strokeRect(wb1X - wb1W / 2, wb1Y - wb1H / 2, wb1W, wb1H);

    /* 导管进入洗气瓶 */
    ctx.beginPath();
    ctx.moveTo(unitW * 2, pipeY);
    ctx.lineTo(wb1X - wb1W / 2, pipeY);
    ctx.lineTo(wb1X - wb1W / 2, wb1Y + wb1H / 2 - 10);
    ctx.stroke();

    /* 洗气瓶 2（浓硫酸） */
    var wb2X = unitW * 3.5;
    var wb2Y = yBase;

    ctx.fillStyle = 'rgba(255, 230, 200, .5)';
    ctx.fillRect(wb2X - wb1W / 2, wb2Y - wb1H / 2, wb1W, wb1H);
    ctx.strokeRect(wb2X - wb1W / 2, wb2Y - wb1H / 2, wb1W, wb1H);

    /* 连接管 */
    ctx.beginPath();
    ctx.moveTo(wb1X + wb1W / 2, wb1Y - wb1H / 2 + 15);
    ctx.lineTo(wb1X + wb1W / 2, pipeY);
    ctx.lineTo(wb2X - wb1W / 2, pipeY);
    ctx.lineTo(wb2X - wb1W / 2, wb2Y + wb1H / 2 - 10);
    ctx.stroke();

    /* 集气瓶 */
    var colX = unitW * 4.6;
    var colY = yBase;
    var colW = 70;
    var colH = 100;

    /* 收集到的氯气量 */
    var fillH = colH * Math.min(1, progress * 1.2);
    var gasGrad = ctx.createLinearGradient(0, colY + colH / 2, 0, colY - colH / 2);
    gasGrad.addColorStop(0, 'rgba(180, 220, 120, .0)');
    gasGrad.addColorStop(1, 'rgba(180, 220, 100, .7)');

    /* 集气瓶填充 */
    ctx.fillStyle = 'rgba(180, 220, 100, 0)';
    ctx.fillRect(colX - colW / 2, colY - colH / 2, colW, colH);
    ctx.fillStyle = gasGrad;
    ctx.fillRect(colX - colW / 2, colY + colH / 2 - fillH, colW, fillH);

    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.strokeRect(colX - colW / 2, colY - colH / 2, colW, colH);

    /* 连接管到集气瓶 */
    ctx.beginPath();
    ctx.moveTo(wb2X + wb1W / 2, wb2Y - wb1H / 2 + 15);
    ctx.lineTo(wb2X + wb1W / 2, pipeY);
    ctx.lineTo(colX - colW / 2, pipeY);
    ctx.lineTo(colX - colW / 2, colY - colH / 2 + 10);
    ctx.stroke();

    /* 气体粒子 */
    for (var i = state.gasParticles.length - 1; i >= 0; i--) {
      var p = state.gasParticles[i];
      p.t += dt * 0.5;
      if (p.t > 1) {
        state.gasParticles.splice(i, 1);
        continue;
      }
      /* 沿路径移动 */
      var pt = p.t;
      var pos;
      if (pt < 0.25) {
        /* 烧瓶 → 洗气瓶1 */
        var f = pt / 0.25;
        pos = {
          x: flaskX + (wb1X - flaskX) * f,
          y: pipeY + Math.sin(f * Math.PI) * (-20)
        };
      } else if (pt < 0.5) {
        var f2 = (pt - 0.25) / 0.25;
        pos = {
          x: wb1X + (wb2X - wb1X) * f2,
          y: pipeY
        };
      } else if (pt < 0.75) {
        var f3 = (pt - 0.5) / 0.25;
        pos = {
          x: wb2X + (colX - wb2X) * f3,
          y: pipeY
        };
      } else {
        var f4 = (pt - 0.75) / 0.25;
        pos = {
          x: colX,
          y: colY + colH / 2 - fillH * f4
        };
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180, 220, 100, 0.7)';
      ctx.fill();
    }

    /* 尾气处理（右侧小烧杯） */
    var wb3X = W - 60;
    var wb3Y = yBase;
    var wb3W = 60;
    var wb3H = 90;

    ctx.fillStyle = 'rgba(200, 220, 240, .5)';
    ctx.fillRect(wb3X - wb3W / 2, wb3Y - wb3H / 2, wb3W, wb3H);
    ctx.strokeStyle = '#8a7340';
    ctx.strokeRect(wb3X - wb3W / 2, wb3Y - wb3H / 2, wb3W, wb3H);

    /* 连接管 */
    ctx.beginPath();
    ctx.moveTo(colX + colW / 2, colY - colH / 2 + 10);
    ctx.lineTo(colX + colW / 2, pipeY);
    ctx.lineTo(wb3X - wb3W / 2, pipeY);
    ctx.lineTo(wb3X - wb3W / 2, wb3Y + wb3H / 2 - 10);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('发生', flaskX, H - 25);
    ctx.fillText('洗气 1', wb1X, H - 25);
    ctx.fillText('洗气 2', wb2X, H - 25);
    ctx.fillText('收集', colX, H - 25);
    ctx.fillText('尾气', wb3X, H - 25);

    ctx.fillStyle = '#8a7340';
    ctx.font = '11px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('MnO₂+浓HCl', flaskX, H - 10);
    ctx.fillText('饱和食盐水', wb1X, H - 10);
    ctx.fillText('浓硫酸', wb2X, H - 10);
    ctx.fillText('向上排空气', colX, H - 10);
    ctx.fillText('NaOH', wb3X, H - 10);

    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MnO₂ + 4HCl(浓) --Δ--> MnCl₂ + Cl₂↑ + 2H₂O', 20, 26);

    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('提示：Cl₂ 有毒，实验须在通风橱中进行，尾气用 NaOH 吸收', 20, 50);
  }
},

{
  id: 'chem-chemical-equilibrium-advanced',
  subject: 'chemistry',
  name: '化学平衡常数与转化率',
  tags: ['化学平衡', '平衡常数', '转化率'],
  desc: '通过改变初始浓度，观察平衡常数不变、转化率变化的规律。',
  purpose: '理解平衡常数只与温度有关，与浓度无关；而转化率会随条件改变。',
  principle: '对反应 aA + bB ⇌ cC + dD，K = [C]^c·[D]^d / ([A]^a·[B]^b)。K 只与温度有关。',
  apparatus: '（模拟实验）',
  steps: [
    '固定温度，改变反应物初始浓度',
    '计算平衡时的各物质浓度',
    '验证 K 不变',
    '观察转化率随初始浓度的变化'
  ],
  phenomenon: 'K 在相同温度下保持不变；增大某反应物浓度，平衡正向移动，其他反应物转化率增大。',
  conclusion: 'K 是温度的函数；浓度改变，K 不变，转化率改变。',
  notice: '平衡常数与温度有关；固体和纯液体不写入平衡常数表达式中。',
  duration: 8,
  params: [
    { key: 'c0', label: '初始浓度 c₀ (mol/L)', min: 0.5, max: 4, step: 0.1, default: 2 },
    { key: 'T', label: '温度（℃）', min: 200, max: 600, step: 20, default: 300 }
  ],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 60, padR = 40, padT = 60, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    /* 简化模型：A ⇌ 2B */
    /* K = [B]² / [A]，随温度变化 */
    var K = 0.1 * Math.exp((params.T - 300) / 200);
    var c0 = params.c0;

    /* 平衡求解：[A] = c0 - x, [B] = 2x；K = (2x)² / (c0 - x) */
    /* 4x² = K(c0 - x) => 4x² + Kx - K·c0 = 0 */
    var a = 4, b = K, c = -K * c0;
    var disc = b * b - 4 * a * c;
    var x = (-b + Math.sqrt(disc)) / (2 * a);

    var cA = c0 - x;
    var cB = 2 * x;
    var conversion = x / c0;

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
    for (var i = 1; i <= 10; i++) {
      var y = padT + plotH * i / 10;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }

    /* 浓度柱状图 */
    var maxC = Math.max(c0, cB) * 1.2;
    var barY = padT + plotH;
    var barW = 80;

    /* A 浓度 */
    var aH = cA / maxC * plotH;
    ctx.fillStyle = 'rgba(74, 127, 181, .7)';
    ctx.fillRect(padL + 100, barY - aH, barW, aH);
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2;
    ctx.strokeRect(padL + 100, barY - aH, barW, aH);

    /* B 浓度 */
    var bH = cB / maxC * plotH;
    ctx.fillStyle = 'rgba(245, 179, 1, .7)';
    ctx.fillRect(padL + 240, barY - bH, barW, bH);
    ctx.strokeStyle = '#b47c00';
    ctx.strokeRect(padL + 240, barY - bH, barW, bH);

    /* 标签 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', padL + 100 + barW / 2, barY + 20);
    ctx.fillText('B', padL + 240 + barW / 2, barY + 20);

    ctx.fillStyle = '#4a7fb5';
    ctx.fillText(cA.toFixed(3), padL + 100 + barW / 2, barY - aH - 8);
    ctx.fillStyle = '#b47c00';
    ctx.fillText(cB.toFixed(3), padL + 240 + barW / 2, barY - bH - 8);

    /* 文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('反应：A ⇌ 2B', 20, 26);
    ctx.fillText('初始浓度 c₀ = ' + c0.toFixed(2) + ' mol/L', 20, 48);
    ctx.fillText('温度 T = ' + params.T + ' ℃', 20, 70);

    ctx.fillStyle = '#c0524a';
    ctx.fillText('平衡常数 K = ' + K.toFixed(4), 20, 100);

    ctx.fillStyle = '#4a7fb5';
    ctx.fillText('平衡 [A] = ' + cA.toFixed(4) + ' mol/L', 20, 126);
    ctx.fillStyle = '#b47c00';
    ctx.fillText('平衡 [B] = ' + cB.toFixed(4) + ' mol/L', 20, 148);

    ctx.fillStyle = '#3a2a00';
    ctx.fillText('A 的转化率 = ' + (conversion * 100).toFixed(2) + '%', 20, 178);

    /* 图例 */
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('温度升高，K 增大（正向吸热）', 20, H - 40);
    ctx.fillText('K 只与温度有关，与浓度无关', 20, H - 20);
  }
},

{
  id: 'chem-rate-catalyst',
  subject: 'chemistry',
  name: '催化剂对反应速率的影响',
  tags: ['催化剂', '反应速率', '活化能'],
  desc: '有催化剂和无催化剂时，反应速率曲线对比。',
  purpose: '理解催化剂降低活化能、加快反应速率，但不改变平衡位置。',
  principle: '催化剂通过降低反应的活化能，使更多分子成为活化分子，从而加快反应速率。它不改变反应的平衡常数和转化率。',
  apparatus: '（模拟实验）',
  steps: [
    '在相同条件下进行两组实验：一组有催化剂，一组无',
    '记录浓度随时间的变化',
    '绘制浓度-时间曲线',
    '比较两组反应达到平衡的时间'
  ],
  phenomenon: '有催化剂时反应更快，但最终平衡浓度相同。',
  conclusion: '催化剂加快反应速率但不影响平衡，因为正逆反应速率同倍加快。',
  notice: '催化剂参与反应但反应前后质量和化学性质不变；催化剂具有选择性。',
  duration: 8,
  params: [],
  init: function () {},
  step: function (ctx, canvas, state, params, dt, elapsed, progress) {
    var W = canvas.width, H = canvas.height;
    var padL = 60, padR = 40, padT = 60, padB = 60;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    /* 两条曲线：无催化剂 k=0.3，有催化剂 k=1.5 */
    var kNo = 0.3;
    var kYes = 1.5;

    var px = function (t) { return padL + (t / 10) * plotW; };
    var py = function (c) { return padT + plotH - c * plotH; };

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
    for (var i = 1; i <= 8; i++) {
      var y = padT + plotH * i / 8;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }

    var nowT = progress * 10;

    /* 无催化剂曲线 */
    ctx.beginPath();
    for (var t = 0; t <= nowT; t += 0.05) {
      var c = Math.exp(-kNo * t);
      if (t === 0) ctx.moveTo(px(t), py(c));
      else ctx.lineTo(px(t), py(c));
    }
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 有催化剂曲线 */
    ctx.beginPath();
    for (var t2 = 0; t2 <= nowT; t2 += 0.05) {
      var c2 = Math.exp(-kYes * t2);
      if (t2 === 0) ctx.moveTo(px(t2), py(c2));
      else ctx.lineTo(px(t2), py(c2));
    }
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* 图例 */
    ctx.fillStyle = '#4a7fb5';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('—— 无催化剂（k=0.3）', padL + 10, padT + 20);
    ctx.fillStyle = '#c0524a';
    ctx.fillText('—— 有催化剂（k=1.5）', padL + 10, padT + 44);

    /* 能量对比图（右上角小图） */
    var eX = W - 260, eY = 20, eW = 240, eH = 120;

    ctx.fillStyle = 'rgba(255, 255, 255, .9)';
    ctx.fillRect(eX, eY, eW, eH);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1;
    ctx.strokeRect(eX, eY, eW, eH);

    /* 反应进程 */
    ctx.beginPath();
    ctx.moveTo(eX + 20, eY + eH - 30);
    ctx.lineTo(eX + eW - 20, eY + eH - 30);
    ctx.strokeStyle = '#8a7340';
    ctx.lineWidth = 1;
    ctx.stroke();

    /* 无催化剂能量曲线（高活化能） */
    ctx.beginPath();
    ctx.moveTo(eX + 20, eY + eH - 30);
    ctx.quadraticCurveTo(eX + eW / 2, eY + 20, eX + eW - 20, eY + eH - 30);
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 有催化剂能量曲线（低活化能） */
    ctx.beginPath();
    ctx.moveTo(eX + 20, eY + eH - 30);
    ctx.quadraticCurveTo(eX + eW / 2, eY + 50, eX + eW - 20, eY + eH - 30);
    ctx.strokeStyle = '#c0524a';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 活化能标注 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 11px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('能量', eX + 4, eY + 14);
    ctx.fillText('活化能', eX + eW - 55, eY + 44);

    /* 主图文字 */
    ctx.fillStyle = '#3a2a00';
    ctx.font = 'bold 14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('催化剂对反应速率的影响', 20, 26);
    ctx.fillText('反应物浓度随时间变化', 20, 48);

    /* 坐标轴标签 */
    ctx.fillStyle = '#8a7340';
    ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('时间 / s', padL + plotW / 2, H - 18);
    ctx.save();
    ctx.translate(20, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('反应物相对浓度', 0, 0);
    ctx.restore();
  }
}

/* ============================================================
   全部 30 个实验已填完。
   数学 10 个：pi-monte-carlo / normal-distribution / unit-circle /
              function-transform / sequence-limit / fibonacci /
              pascal-triangle / law-large-numbers / linear-regression /
              koch-snowflake
   物理 10 个：free-fall / projectile / pendulum / circular-motion /
              refraction / lens / circuit / induction /
              interference / collision
   化学 10 个：titration / sodium-water / iron-copper / electrolysis-water /
              equilibrium / galvanic / reaction-rate / precipitation /
              flame-test / chlorine / equilibrium-advanced / rate-catalyst
   ============================================================ */

];