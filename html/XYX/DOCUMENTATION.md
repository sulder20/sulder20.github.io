# Pixel Arcade 开发文档

> 像素复古风网页小游戏合集
> 版本 v1.0 · 最后更新 2025

---

## 目录

1. [项目概览](#1-项目概览)
2. [技术栈](#2-技术栈)
3. [目录结构](#3-目录结构)
4. [设计系统](#4-设计系统)
5. [核心模块 API](#5-核心模块-api)
6. [游戏开发规范](#6-游戏开发规范)
7. [9 款游戏详解](#7-9-款游戏详解)
8. [扩展指南：添加新游戏](#8-扩展指南添加新游戏)
9. [数据存储](#9-数据存储)
10. [音效系统](#10-音效系统)
11. [响应式与移动端](#11-响应式与移动端)
12. [PWA 与离线](#12-pwa-与离线)
13. [性能优化](#13-性能优化)
14. [常见问题排查](#14-常见问题排查)
15. [构建 / 部署](#15-构建--部署)
16. [版本规划](#16-版本规划)

---

## 1. 项目概览

### 1.1 是什么

Pixel Arcade 是一个纯前端、无依赖、像素复古风的网页小游戏合集。共 9 款游戏，5 款经典复刻 + 4 款原创玩法，全部运行在浏览器里，支持电脑键盘 + 手机触摸，可以离线玩。

### 1.2 设计目标

| 目标 | 说明 |
|---|---|
| **零依赖** | 不需要 npm、不需要构建工具、不需要框架 |
| **零素材** | 不加载任何图片 / 音频文件，图标用 Canvas 绘制，音效用 Web Audio 合成 |
| **单入口** | 打开 `games.html` 就能玩全部 |
| **跨设备** | 电脑、平板、手机都能玩 |
| **可离线** | Service Worker 缓存，断网也能玩 |
| **易扩展** | 加新游戏只需要 3 个文件 + 1 处注册 |

### 1.3 运行方式

**方式一（最简单）**
双击 `games.html`，浏览器直接打开。注意：这种 `file://` 协议下 Service Worker 不生效，但游戏都能玩。

**方式二（推荐）**
本地起一个静态服务：

```bash
python3 -m http.server 8000
# 或
npx serve
```

然后访问 `http://localhost:8000/games.html`。

---

## 2. 技术栈

| 层级 | 选型 | 理由 |
|---|---|---|
| 结构 | 原生 HTML5 | 语义清晰，无模板引擎依赖 |
| 样式 | 原生 CSS3（CSS 变量 + Flex/Grid） | 无需预处理器 |
| 逻辑 | 原生 ES5+ JavaScript | 兼容性好，无构建步骤 |
| 渲染 | Canvas 2D | 游戏画面统一管理 |
| 音效 | Web Audio API | 实时合成 8-bit 音效，无需音频文件 |
| 存储 | localStorage + sessionStorage | 最高分、游玩记录、开场动画标记 |
| 离线 | Service Worker + Manifest | PWA 标准 |
| 字体 | Press Start 2P（Google Fonts CDN） | 像素风字体，加载失败自动回退等宽字体 |

### 2.1 浏览器兼容性

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

**不支持**：IE 全系列。

---

## 3. 目录结构

```
pixel-arcade/
│
├── games.html                    # 主菜单（唯一入口）
├── manifest.json                 # PWA 清单
├── service-worker.js             # 离线缓存
├── README.md                     # 面向玩家的说明
├── DOCUMENTATION.md              # 本文档
│
├── css/
│   ├── base.css                  # 全局基础：调色板、按钮、弹窗、动画、音量面板
│   ├── menu.css                  # 主菜单专用：网格、卡片、统计、筛选
│   └── game.css                  # 游戏页专用：HUD、屏幕框、虚拟按键、底部提示
│
├── js/
│   ├── storage.js                # localStorage 封装（最高分、游玩次数、说明已读）
│   ├── audio.js                  # Web Audio 音效引擎
│   ├── common.js                 # 游戏页通用逻辑（弹窗、暂停、滑动、音量、全屏）
│   ├── menu.js                   # 主菜单逻辑
│   │
│   └── games/                    # 每个游戏的独立逻辑
│       ├── snake.js
│       ├── tetris.js
│       ├── breakout.js
│       ├── 2048.js
│       ├── memory.js
│       ├── dodge.js
│       ├── color-trap.js
│       ├── rhythm.js
│       └── merge.js
│
└── games/                        # 每个游戏的 HTML 页面
    ├── snake.html
    ├── tetris.html
    ├── breakout.html
    ├── 2048.html
    ├── memory.html
    ├── dodge.html
    ├── color-trap.html
    ├── rhythm.html
    └── merge.html
```

### 3.1 命名约定

| 类型 | 规则 | 示例 |
|---|---|---|
| 文件夹 | 小写，多个单词用 `-` 连接 | `games/`、`css/` |
| CSS 文件 | 小写，按页面 / 模块 | `base.css`、`menu.css` |
| JS 文件 | 小驼峰 | `common.js`、`colorTrap.js` |
| 游戏 key | 小写，多单词 `-` 连接 | `color-trap`、`snake` |
| CSS 类 | 小写 `-` 连接 | `.game-card`、`.menu-recent` |
| CSS 变量 | `--` 前缀 | `--gb-0`、`--t-fast` |
| JS 全局 | 大驼峰前缀 `PA` | `PA`、`PAStore`、`PAAudio` |

### 3.2 为什么 games 有两处

- `games/` 存 **HTML 页面**（玩家访问的入口）
- `js/games/` 存 **JS 逻辑**（被 HTML 引用的脚本）

它们通过 `<script src="../js/games/xxx.js">` 关联。

---

## 4. 设计系统

### 4.1 调色板（GameBoy 绿）

全局定义在 `css/base.css` 的 `:root`：

```css
:root {
  --gb-0: #0f380f;   /* 最深，用作背景、文字 */
  --gb-1: #306230;   /* 深，用作次级背景、按钮 */
  --gb-2: #8bac0f;   /* 浅，用作边框、高亮 */
  --gb-3: #9bbc0f;   /* 最亮，用作主体亮色、屏幕背景 */
}
```

**使用建议**：

| 场景 | 使用 |
|---|---|
| 页面背景 | `--gb-0` |
| 卡片 / 按钮背景 | `--gb-1` |
| 边框 / 次级文字 | `--gb-2` |
| 主体文字 / 屏幕背景 | `--gb-3` |
| 游戏内深色块 | `--gb-0` |
| 游戏内浅色块 | `--gb-3` |

### 4.2 字体

```css
--font-pixel: 'Press Start 2P', 'Courier New', Courier, monospace;
```

- 首选 `Press Start 2P`（通过 Google Fonts CDN 加载）
- 加载失败或离线时回退到等宽字体
- **注意**：这个字体不含中文、不含 `♪`、`🔊` 等符号，会自动回退系统字体

### 4.3 动效时长

```css
--t-fast: 90ms;    /* 按钮按下 */
--t-mid: 180ms;    /* 弹窗出现 */
--t-slow: 360ms;   /* 主菜单入场 */
```

### 4.4 关键动画

| 名称 | 用途 |
|---|---|
| `pa-fade-in` | 淡入 + 上移 6px |
| `pa-pop` | 放大回弹，数值跳动 |
| `pa-shake` | 抖动，错误反馈 |
| `pa-blink` | 闪烁，提示按 start |
| `pa-slide-up` | 弹窗从下方滑入 |

### 4.5 CRT 质感

在 `body::before` 和 `body::after` 上叠加：

- `::after` 为**扫描线**（水平重复条纹）
- `::before` 为**暗角**（径向渐变）

游戏页的 `.screen-wrap::after` 有更密的扫描线。

> 低帧率模式（`body.low-fps`）会自动关闭这些效果。

### 4.6 按钮

```html
<button class="btn">普通</button>
<button class="btn btn-primary">强调</button>
<button class="btn btn-icon">图标</button>
<button class="btn muted">禁用/关闭态</button>
```

- 默认带 3px 右下实心阴影，形成像素立体感
- 按下时 `translate(3px, 3px)` 且阴影消失，模拟「陷下去」
- 触摸设备会触发一次 12ms 震动（`navigator.vibrate`）

---

## 5. 核心模块 API

### 5.1 `PAStore`（`js/storage.js`）

封装 localStorage，所有 key 都带 `pa_` 前缀。

| 方法 | 说明 | 返回 |
|---|---|---|
| `PAStore.getHigh(key)` | 取某游戏最高分 | `number`，无记录返回 `0` |
| `PAStore.setHigh(key, score)` | 若破纪录则写入 | `boolean`，破了返回 `true` |
| `PAStore.hasSeenHelp(key)` | 是否看过说明 | `boolean` |
| `PAStore.markHelpSeen(key)` | 标记已看说明 | — |
| `PAStore.incVisit(key)` | 游玩次数 +1 | — |
| `PAStore.getVisits(key)` | 取某游戏游玩次数 | `number` |
| `PAStore.getAllVisits()` | 全部游戏的次数 | `{ key: count }` |
| `PAStore.resetVisits()` | 清空所有游玩次数 | — |
| `PAStore.resetAll()` | 清空所有本地数据 | — |

**存储 key 约定**：

| 前缀 | 用途 |
|---|---|
| `pa_high_<key>` | 最高分 |
| `pa_visits_<key>` | 游玩次数 |
| `pa_help_<key>` | 说明已读标记（值为 `'1'`） |
| `pa_muted` | 全局静音（`'1'` / `'0'`） |
| `pa_volume` | 全局音量（`'0'` ~ `'1'`） |
| `pa_recent` | 最近游玩（JSON 数组，最多 4 个 key） |

### 5.2 `PAAudio`（`js/audio.js`）

Web Audio 实时合成，全部是方波 / 三角波短音。

| 方法 | 音效 |
|---|---|
| `PAAudio.click()` | 通用点击 |
| `PAAudio.move()` | 轻移动 |
| `PAAudio.eat()` | 吃到 / 得小分 |
| `PAAudio.score()` | 得分 / 升级 |
| `PAAudio.start()` | 开始游戏 |
| `PAAudio.fail()` | 失败 |
| `PAAudio.win()` | 新纪录 |
| `PAAudio.flip()` | 翻牌 |
| `PAAudio.match()` | 配对成功 |
| `PAAudio.unlock()` | 首次交互解锁音频上下文 |
| `PAAudio.isMuted()` | 是否静音 |
| `PAAudio.toggleMute()` | 切换静音 |
| `PAAudio.getVolume()` | 取音量（0~1） |
| `PAAudio.setVolume(v)` | 设置音量 |

**注意**：`unlock()` 必须在用户第一次交互（点击 / 按键）时调用，否则浏览器会阻止声音。

### 5.3 `PA`（`js/common.js`）

游戏页的公共工具箱。

#### 弹窗

```js
PA.showModal({
  title: '标题',
  body: 'HTML 内容',
  button: '按钮文字',
  onClose: function () { /* 关闭回调 */ }
});

PA.hideModal();
PA.isModalOpen();  // boolean
```

#### 玩法说明

```js
PA.showHelp('snake', '贪吃蛇说明', '<ul>...</ul>');  // 手动弹
PA.autoHelp('snake', '贪吃蛇说明', '<ul>...</ul>', onClose);  // 首次自动弹
```

#### HUD 数值

```js
PA.setValue(el, 100);   // 设置并跳动
PA.bump(el);            // 只跳动
```

#### 音效 / 音量按钮

```js
PA.bindMuteButton(document.getElementById('btn-mute'));
PA.bindVolumeButton(document.getElementById('btn-volume'));
```

#### 触摸滑动

```js
PA.onSwipe(canvas, {
  onUp:    function () {},
  onDown:  function () {},
  onLeft:  function () {},
  onRight: function () {},
  onTap:   function () {}
});
```

滑动阈值 22px，低于阈值视为 `onTap`。

#### 退出确认

```js
PA.shouldConfirmExit = function () {
  return state === 'playing' || state === 'paused';
};
```

返回 `true` 时会先弹确认框。

#### 帧率监测

```js
PA.fps.start();
PA.fps.onLow(function (isLow, fps) {
  document.body.classList.toggle('low-fps', isLow);
});
```

低于 45 FPS 时触发 `isLow = true`。

#### 开场动画

```js
PA.showSplash(function () { /* 动画结束回调 */ });
```

每次会话只显示一次（`sessionStorage` 记录）。

#### 游戏页初始化

```js
PA.setupGamePage({
  key: 'snake',
  helpTitle: '贪吃蛇 · 玩法说明',
  helpHtml: '<ul>...</ul>',
  hint: '<b>← →</b> 移动 · <b>空格</b> 暂停'
});
```

一次性完成：

- 绑定音效按钮
- 绑定音量按钮
- 绑定说明按钮
- 底部提示填充
- 首次交互解锁音频
- 按钮按压反馈
- HUD 数字滚动
- 横屏提示注入
- 全屏按钮注入
- 返回确认挂载
- 游玩次数 +1
- 帧率监测启动

---

## 6. 游戏开发规范

### 6.1 一个游戏必须包含

| 文件 | 作用 |
|---|---|
| `games/<key>.html` | 页面骨架 |
| `js/games/<key>.js` | 游戏逻辑 |

### 6.2 HTML 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0f380f">
<title>游戏名 · Pixel Arcade</title>
<link rel="icon" href="data:image/svg+xml,...">
<link rel="manifest" href="../manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/game.css">
</head>
<body class="game-page">

<header class="game-bar">
  <a class="btn btn-icon" href="../games.html" aria-label="返回菜单">←</a>
  <h1 class="game-title">游戏名</h1>
  <div class="game-bar-right">
    <button class="btn btn-icon" id="btn-volume">🔊</button>
    <button class="btn btn-icon" id="btn-mute">♪</button>
    <button class="btn btn-icon" id="btn-help">?</button>
  </div>
</header>

<div class="hud">
  <div class="hud-item">
    <span class="hud-label">SCORE</span>
    <span class="hud-value" id="score">0</span>
  </div>
  <div class="hud-item">
    <span class="hud-label">BEST</span>
    <span class="hud-value" id="best">0</span>
  </div>
</div>

<main class="stage">
  <div class="screen-wrap">
    <canvas id="canvas" width="320" height="320"></canvas>
    <div class="overlay" id="overlay">
      <div class="overlay-title" id="ov-title">游戏名</div>
      <div class="overlay-text" id="ov-text">操作说明</div>
      <button class="btn btn-primary" id="ov-btn">开始</button>
    </div>
  </div>
</main>

<footer class="game-actions">
  <button class="btn" id="btn-pause">暂停</button>
  <button class="btn" id="btn-restart">重开</button>
</footer>

<div class="game-hint" id="game-hint"></div>

<script src="../js/storage.js"></script>
<script src="../js/audio.js"></script>
<script src="../js/common.js"></script>
<script src="../js/games/游戏名.js"></script>

<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      if (location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('../service-worker.js').catch(function () {});
      }
    });
  }
</script>
</body>
</html>
```

### 6.3 JS 骨架

```js
/* ===== 游戏名 ===== */
(function () {
  'use strict';

  const GAME_KEY = 'game-key';

  /* ---------- DOM ---------- */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  // ... 其它 DOM

  /* ---------- 说明 ---------- */
  const HELP_HTML = '<ul><li>...</li></ul>';

  /* ---------- 状态 ---------- */
  let state = 'idle';   // idle | playing | paused | over
  let score = 0;
  let best = PAStore.getHigh(GAME_KEY);
  let lastTime = 0;

  bestEl.textContent = best;

  /* ---------- 绘制 ---------- */
  function draw() { /* ... */ }

  /* ---------- 逻辑 ---------- */
  function update(dt) { /* ... */ }

  /* ---------- 主循环 ---------- */
  function loop(t) {
    if (state !== 'playing') return;
    if (!lastTime) lastTime = t;
    let dt = (t - lastTime) / 1000;
    lastTime = t;
    if (dt > 0.05) dt = 0.05;   // 切后台防跳帧

    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  /* ---------- 流程 ---------- */
  function start() { /* 重置状态 → playing → 启动 loop */ }
  function gameOver() { /* 写最高分 → over → 显示结算 */ }
  function togglePause() { /* 暂停 / 恢复 */ }
  function resume() { /* 恢复 */ }
  function showOverlay(title, text, btn) { /* 显示遮罩 */ }
  function hideOverlay() { /* 隐藏遮罩 */ }

  /* ---------- 输入 ---------- */
  document.addEventListener('keydown', function (e) {
    if (PA.isModalOpen()) return;
    // 处理键盘
  });

  PA.onSwipe(canvas, {
    onUp: function () {},
    onDown: function () {},
    onLeft: function () {},
    onRight: function () {}
  });

  canvas.addEventListener('pointerdown', function (e) { /* 触摸/点击 */ });

  /* ---------- 按钮 ---------- */
  document.getElementById('ov-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'paused') resume(); else start();
  });

  document.getElementById('btn-pause').addEventListener('click', function () {
    if (state === 'idle' || state === 'over') return;
    togglePause();
  });

  document.getElementById('btn-restart').addEventListener('click', function () {
    PAAudio.click();
    start();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') togglePause();
  });

  /* ---------- 启动 ---------- */
  PA.setupGamePage({
    key: GAME_KEY,
    helpTitle: '游戏名 · 玩法说明',
    helpHtml: HELP_HTML,
    hint: '<b>操作提示</b>'
  });

  PA.shouldConfirmExit = function () {
    return state === 'playing' || state === 'paused';
  };

  PA.autoHelp(GAME_KEY, '游戏名 · 玩法说明', HELP_HTML, function () {
    if (state === 'idle') {
      showOverlay('游戏名', '操作说明', '开始');
    }
  });

  // 空闲态先渲染一版
  draw();
})();
```

### 6.4 状态机约定

所有游戏统一使用 4 个状态：

| 状态 | 含义 |
|---|---|
| `idle` | 未开始，显示开始遮罩 |
| `playing` | 进行中，主循环运行 |
| `paused` | 暂停，遮罩显示，`loop` 停止 |
| `over` | 结束，写最高分，显示结算 |

切换规则：

```
idle ──start()──► playing
playing ──togglePause()──► paused
paused ──resume()──► playing
playing ──gameOver()──► over
over ──start()──► playing
```

### 6.5 主循环规范

```js
function loop(t) {
  if (state !== 'playing') return;

  if (!lastTime) lastTime = t;
  let dt = (t - lastTime) / 1000;
  lastTime = t;
  if (dt > 0.05) dt = 0.05;   // 关键：切后台回来防大跳

  update(dt);
  draw();

  if (state === 'playing') requestAnimationFrame(loop);
}
```

**要点**：

- `dt` 用**秒**为单位，便于物理计算
- `dt` 上限 0.05 秒（约 50ms），防止切标签页回来时大跳
- 暂停时不要继续 `requestAnimationFrame`，直接 `return`
- 恢复时把 `lastTime = 0`，让下一帧重新计时

### 6.6 响应式画布

游戏画布逻辑尺寸固定（多为 `320×320`），通过 CSS 缩放：

```css
.screen-wrap {
  width: min(90vw, 360px);
  aspect-ratio: 1 / 1;
}
.screen-wrap canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
```

触摸 / 鼠标坐标转画布坐标：

```js
function canvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / rect.width * canvas.width,
    y: (e.clientY - rect.top) / rect.height * canvas.height
  };
}
```

### 6.7 音效使用节奏

| 事件 | 调用 |
|---|---|
| 按钮点击 | `PAAudio.click()` |
| 玩家移动 | `PAAudio.move()`（低音量） |
| 吃到 / 得小分 | `PAAudio.eat()` |
| 合并 / 得大分 | `PAAudio.score()` |
| 翻牌 | `PAAudio.flip()` |
| 配对成功 | `PAAudio.match()` |
| 开始游戏 | `PAAudio.start()` |
| 失败 | `PAAudio.fail()` |
| 破纪录 | `PAAudio.win()` |

**注意**：

- `fail()` 和 `win()` 不要同时调用，一般 `fail()` 先，`win()` 延迟 400ms 触发
- 高频事件（移动）用 `move()`，别用 `click()` 避免吵

---

## 7. 9 款游戏详解

### 7.1 贪吃蛇 `snake`

| 项 | 值 |
|---|---|
| 画布 | 320×320，20×20 网格，单元格 16px |
| 状态 | 蛇身数组，方向，方向队列，食物坐标 |
| 计时 | 步进式（非 dt 物理），初始 140ms/步，最低 72ms |
| 得分 | 每个食物 +10 |
| 难度 | 每吃一个加速 3ms |
| 操作 | ← → ↑ ↓ / WASD 转向，空格暂停；手机滑动 |
| 结束 | 撞墙 / 撞自己 |

**关键实现**：

- `dirQueue` 缓存最多 2 个转向，防止一帧内连转 180°
- 每步先 `dirQueue.shift()` 取方向，再计算新头
- 判断撞自己时**排除最后一节**（它会移动）
- `requestAnimationFrame` 里用累加器 `acc` 控制步进节奏

### 7.2 俄罗斯方块 `tetris`

| 项 | 值 |
|---|---|
| 画布 | 300×400，10×20 网格，单元格 20px |
| 布局 | 左侧棋盘 200px 宽，右侧 NEXT 面板 100px |
| 状态 | board 二维数组，当前方块、下一个方块、7-bag |
| 计分 | 1/2/3/4 行 = 100/300/500/800 × 等级 |
| 等级 | 每消 10 行升 1 级 |
| 操作 | ← → 移动，↓ 软降，↑/X 顺旋，Z 逆旋，空格硬降 |
| 结束 | 新方块出生位置被占用 |

**关键实现**：

- 7-bag 算法：把 7 种方块洗牌后依次取，保证不会连续 3 次同一形状
- 旋转采用简易 wall kick：`[0, -1, 1, -2, 2]` 依次尝试
- 幽灵方块（落点预览）用空心描边
- 锁定延迟 `LOCK_DELAY = 480ms`，落地后还有时间微调
- 消行用 `splice` + `unshift` 组合，先找满行再统一删

### 7.3 打砖块 `breakout`

| 项 | 值 |
|---|---|
| 画布 | 320×320 |
| 挡板 | 64×10，位置 y=292 |
| 球 | 半径 4，基础速度 220px/s，上限 420px/s |
| 砖块 | 6 列 × 5 行，每块 48×20 |
| 计分 | 顶行 50，往下 40/30/20/10 |
| 命 | 3 条 |
| 操作 | ← → / AD 移动挡板，鼠标 / 触摸拖动 |
| 结束 | 命用光 |

**关键实现**：

- 球速高时用分步移动防穿透：把 `dist` 拆成每步最多 4px
- 撞砖判定用 AABB，通过比较 x/y 重叠量判断从哪一侧撞入
- 挡板反弹角度根据撞击位置：`-π/2 + (rel - 0.5) × 0.7π`
- 每次撞砖速度 +1.2%，上限 1.7 倍
- 打光全部砖块 → 重置 + 100 分 + 速度归一

### 7.4 2048 `2048`

| 项 | 值 |
|---|---|
| 画布 | 320×320，4×4 网格 |
| 单元格 | 70px，间距 8px |
| 生成 | 90% 概率 2，10% 概率 4 |
| 胜利 | 出现 2048 |
| 操作 | 方向键 / WASD；手机滑动 |
| 结束 | 棋盘填满且无相邻相同 |

**关键实现**：

- 移动逻辑：把每行（按方向取）先过滤 0，再相邻合并
- 用 `JSON.stringify` 前后对比判断是否有效移动
- 无效移动不生成新数字
- 到达 2048 弹「你赢了」但不结束，玩家可继续
- 数字颜色按大小分档（6 档），字号按位数分档

### 7.5 记忆翻牌 `memory`

| 项 | 值 |
|---|---|
| 画布 | 320×320，4×4 网格 |
| 图案 | 8 种自定义像素图案（心形、星、方块...） |
| 配对 | 相同图案成对 |
| 得分 | 配对 +100，失败 -10，通关 +200+时间奖励 |
| 操作 | 点击 / 触摸 |
| 计时 | 全程计时，暂停时冻结 |
| 结束 | 8 对全配完 |

**关键实现**：

- 图案用字符串数组表示（`'X'` 表示填充），逐格绘制
- 配对失败延迟 780ms 再翻回，期间 `lock = true` 防连点
- 计时用 `performance.now()` 累加，暂停时保存已累计值

### 7.6 闪避方块 `dodge`（原创）

| 项 | 值 |
|---|---|
| 画布 | 320×320 |
| 玩家 | 20×20，位置 y=290 |
| 障碍 | 宽 24~64，从顶部下落 |
| 计分 | 每躲过一个 +10 |
| 难度 | 随时间增大：方块变大、下落变快、出现更频繁 |
| 操作 | ← → / AD 移动；手机拖动 |
| 结束 | 被撞 |

**关键实现**：

- 难度曲线：`elapsed / 14` 作为系数，上限 3.2
- 生成间隔：`max(0.36, 0.95 - 系数 × 0.16)`
- 下落速度：`105 + 系数 × 55`
- 鼠标 / 触摸：`pointerTargetX` 平滑趋近
- 死亡时屏幕抖 + 玩家闪烁

### 7.7 颜色陷阱 `color-trap`（原创）

| 项 | 值 |
|---|---|
| 画布 | 320×320 |
| 目标色块 | 100×80，居中上方 |
| 选项 | 4 个（2×2 排列） |
| 色系 | 8 组，每组 4 个相近颜色 |
| 计分 | 答对 +10 |
| 命 | 3 条 |
| 操作 | 点击 / 触摸 |
| 结束 | 命用光 |

**关键实现**：

- 出题时从随机一组色系里挑 4 个颜色，目标色从这 4 个里随机取一个，选项打乱
- 颜色相近但有区别，考验眼力
- 答对：绿色描边闪烁 + 换题；答错：全屏红闪 + 扣命

### 7.8 节奏点击 `rhythm`（原创）

| 项 | 值 |
|---|---|
| 画布 | 320×320 |
| 轨道 | 3 条，每条宽 106.67px |
| 判定线 | y=260 |
| 音符 | 60×24 |
| 判定 | PERFECT（±10px）+30，GOOD（±22px）+10，MISS 扣命 |
| Combo | 每 5 连击额外加分（上限 +50） |
| 命 | 3 条 |
| 操作 | A/S/D 对应三轨；手机点击对应轨道 |
| 结束 | 命用光 |

**关键实现**：

- 音符下落速度 200px/s
- 点击时找该轨最接近判定线的未命中音符
- 判定距离用音符中心到判定线的距离
- 空击只断连，不扣命
- 每 15 秒生成间隔加快
- 命中后音符加速下落淡出

### 7.9 数字合成 `merge`（原创）

| 项 | 值 |
|---|---|
| 画布 | 320×320，4×4 网格 |
| 初始 | 8 个数字（4 个 2 + 4 个 4），保证至少一对相邻相同 |
| 生成 | 每次「移动」或「合并」都生成一个新数字 |
| 计分 | 每次合并 = 合并后的数字值 |
| 操作 | 点数字选中 → 点相邻空格移动 / 点相邻相同合并 |
| 结束 | 棋盘满且无相邻相同 |

**关键实现**：

- 移动 +1（棋盘更满），合并 0（合一 + 生成），有紧张感
- 开局循环尝试 120 次，保证有相邻相同
- 选中态用四角标记，空格选中只画边框
- 点不相邻空格时轻微抖动提示

---

## 8. 扩展指南：添加新游戏

假设要加一个 **「扫雷」**（key: `minesweeper`）。

### 8.1 三个文件

**① `games/minesweeper.html`**

复制 `games/snake.html` 的结构，改标题、HUD 标签、脚本引用。

**② `js/games/minesweeper.js`**

按第 6.3 节骨架写。

**③ `css/`**：如果不需要新样式，不用动。

### 8.2 在主菜单注册

打开 `js/menu.js`，找到 `GAMES` 数组，追加一条：

```js
{
  key: 'minesweeper', name: '扫雷', href: 'games/minesweeper.html', tag: '经典',
  icon: [
    '........',
    '..XXXX..',
    '.X....X.',
    '.X.XX.X.',
    '.X.XX.X.',
    '.X....X.',
    '..XXXX..',
    '........'
  ]
}
```

- `key` 必须唯一
- `tag` 是 `'经典'` 或 `'原创'`
- `icon` 是 8×8 字符串数组，`'X'` 表示填充

### 8.3 加入离线缓存

打开 `service-worker.js`，找到 `CORE_ASSETS` 数组，加上：

```js
'./games/minesweeper.html',
'./js/games/minesweeper.js',
```

然后把顶部的 `CACHE_NAME` 版本号递增（如 `pixel-arcade-v2`），让旧缓存自动清理。

### 8.4 完成

刷新主菜单 → 扫雷卡片出现 → 点进去就能玩。

---

## 9. 数据存储

### 9.1 存储位置

全部在 **localStorage**，key 前缀 `pa_`。

### 9.2 数据结构

| Key | 类型 | 说明 |
|---|---|---|
| `pa_high_snake` | `string(number)` | 贪吃蛇最高分 |
| `pa_visits_snake` | `string(number)` | 贪吃蛇游玩次数 |
| `pa_help_snake` | `'1'` | 说明已读 |
| `pa_muted` | `'1'` / `'0'` | 静音 |
| `pa_volume` | `'0.7'` | 音量 |
| `pa_recent` | `JSON string` | `["snake","tetris",...]` |

### 9.3 清空数据

主菜单底部的 `RESET DATA` 按钮会调用 `PAStore.resetAll()`，清空所有 `pa_` 开头的 key。

### 9.4 注意事项

- localStorage 是**同步**的，写入大对象会卡顿，本项目都是小数据，无影响
- `file://` 协议下部分浏览器会限制 localStorage，建议用本地服务
- 无痕模式下 localStorage 关闭即清空

---

## 10. 音效系统

### 10.1 原理

用 **OscillatorNode**（振荡器）生成方波 / 三角波，通过 **GainNode**（增益节点）控制音量包络，直接输出到 **AudioDestination**。

不需要任何音频文件，音色是经典的 8-bit 芯片音乐风格。

### 10.2 单音生成

```js
function beep(freq, dur, opts) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = opts.type || 'square';
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slideTo) {
    osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
  }

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}
```

**要点**：

- `setValueAtTime` + `exponentialRampToValueAtTime` 让音量平滑
- 起始值用 `0.0001` 而不是 `0`，因为指数曲线不能到 0
- 结束时间多加 `0.03s` 防止截断

### 10.3 序列音

```js
function seq(notes) {
  notes.forEach(n => beep(n[0], n[1], n[2] || {}));
}
```

`notes` 是 `[频率, 时长, 选项]` 的数组，`options.delay` 控制延迟。

### 10.4 AudioContext 解锁

浏览器要求音频必须在用户交互后才能播放。第一次 `pointerdown` 或 `keydown` 时调用 `PAAudio.unlock()` 恢复上下文。

`PA.setupGamePage` 已自动处理。

### 10.5 音量与静音

- `pa_volume` 存 0~1
- `pa_muted` 存 `'0'` / `'1'`
- 实际输出音量 = `基础音量 × 全局音量`
- 静音时直接短路，不创建节点

---

## 11. 响应式与移动端

### 11.1 断点

| 断点 | 变化 |
|---|---|
| `max-width: 620px` | 主菜单网格 3 列 → 2 列，字号略缩 |
| `max-width: 380px` | HUD 缩窄，按钮变小 |
| `max-width: 340px` | 主菜单 1 列 |
| `max-height: 720px` | 画布变小 |
| `max-height: 460px` 且横屏 | 显示「请竖屏游戏」遮罩 |

### 11.2 触摸优化

- 所有按钮 `touch-action: manipulation`，禁止双击缩放
- Canvas `touch-action: none`，禁止默认滚动
- 关键滑动用 `PA.onSwipe()`，阈值 22px
- `pointerdown` 代替 `mousedown`，同时兼容鼠标和触摸
- 视口 meta 加 `user-scalable=no` 禁双指缩放

### 11.3 移动端虚拟按键

俄罗斯方块底部有虚拟方向键，使用 `pointerdown` + 长按连发：

```js
function bindHold(btn, fn, initialDelay, repeatDelay) {
  let t1 = null, t2 = null;
  btn.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    fn();
    t1 = setTimeout(function () {
      t2 = setInterval(fn, repeatDelay);
    }, initialDelay);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
    btn.addEventListener(evt, stop);
  });
}
```

### 11.4 安全区适配

`viewport-fit=cover` + `env(safe-area-inset-*)` 让刘海屏 / 挖孔屏不遮挡内容。

---

## 12. PWA 与离线

### 12.1 Manifest

`manifest.json` 定义应用名、图标、启动路径、显示模式（`standalone`）。

图标用的是内联 SVG（data URI），不需要额外图片文件。

### 12.2 Service Worker 策略

| 资源类型 | 策略 |
|---|---|
| 核心资源（HTML/CSS/JS） | 缓存优先 + 后台更新 |
| 字体（Google Fonts） | 缓存优先 + 后台更新 |
| 其他 | 缓存优先，失败走网络 |

**首次加载**：`install` 事件里 `cache.addAll(CORE_ASSETS)`。

**更新**：改 `CACHE_NAME` 版本号，`activate` 时自动清旧缓存。

### 12.3 添加新游戏到缓存

在 `service-worker.js` 的 `CORE_ASSETS` 里加两条：

```js
'./games/minesweeper.html',
'./js/games/minesweeper.js',
```

并递增 `CACHE_NAME`。

### 12.4 添加到主屏幕

移动端浏览器打开后，浏览器菜单里会有「添加到主屏幕」，桌面端 Chrome 地址栏右侧会出现安装图标。

---

## 13. 性能优化

### 13.1 帧率自适应

`PA.fps` 每秒统计帧数，低于 45 FPS 时给 `body` 加 `low-fps` 类，触发 CSS 关闭：

- CRT 扫描线
- 暗角
- 所有过渡动画

游戏逻辑本身不需要感知，只减少视觉开销。

### 13.2 Canvas 优化

- 用 `image-rendering: pixelated` 让缩放不模糊
- 只重绘变化的区域（大游戏可以只 `clearRect` 脏区，本项目画布小，全清即可）
- 避免每帧创建新对象（如 `new Path2D`），复用变量

### 13.3 事件节流

- `pointermove` 在打砖块里节流到每帧一次
- 音量拖动播放点击音时节流到 120ms

### 13.4 主循环退化

切后台时 `document.hidden` 为真，自动 `togglePause()`，避免后台空跑。

恢复时 `lastTime = 0` 让 `dt` 从零开始。

### 13.5 首屏加载

- 所有 CSS 内联在 `<head>`（无额外请求）
- 无图片，Favicon 用 data URI
- 字体用 `preconnect` 提前建立连接
- 主菜单图标在 JS 里生成，不阻塞首屏

---

## 14. 常见问题排查

### 14.1 主菜单卡片是空的

1. 看 Console 有没有报错
2. 检查 `js/menu.js` 是否存在、是否被 `<script>` 引用
3. 检查 `games.html` 里 `<script>` 顺序：`storage → audio → common → menu`

### 14.2 声音不响

1. 用户是否与页面交互过（浏览器要求交互后才能播）
2. `PAAudio.isMuted()` 是否返回 `true`
3. `pa_volume` 是否为 0
4. 浏览器是否禁用了自动播放

### 14.3 `Cannot access 'kbIndex' before initialization`

`let` / `const` 声明的变量在声明之前访问会报错。把变量声明移到使用位置之前。

### 14.4 音量面板堆叠

原因：每次点击都新建 DOM。修法：改成单例，用 `hidden` 类控制显隐。

### 14.5 弹窗跑到页面下方

原因：`.modal-backdrop` 的样式没被当前页面引入。所有弹窗样式应放在 `base.css`（全局）。

### 14.6 返回主菜单时游戏进度还在

游戏页需要实现 `PA.shouldConfirmExit`：

```js
PA.shouldConfirmExit = function () {
  return state === 'playing' || state === 'paused';
};
```

### 14.7 游戏结束后最高分没更新

1. 检查 `PAStore.setHigh(GAME_KEY, score)` 是否被调用
2. 检查 `PAStore.getHigh(GAME_KEY)` 是否读到了旧值
3. 主菜单会重新读取，如果没更新，试试 `location.reload()`

### 14.8 触屏按钮按了没反应

原因：`pointerdown` 后 `pointerup` 没绑定，或者 `touch-action` 没设置。

解决：在按钮上确保 `touch-action: manipulation`，用 `pointerdown` 而不是 `click`。

### 14.9 手机上画面太小 / 太大

调整 `css/game.css` 里 `.screen-wrap` 的 `width`：

```css
.screen-wrap {
  width: min(90vw, 360px);
}
```

`90vw` 是屏幕宽度的 90%，`360px` 是桌面端上限。手机窄屏时取小值，桌面宽屏时取 360px。

### 14.10 修改 CSS / JS 后浏览器还显示旧的

- 强制刷新：`Ctrl + Shift + R` / `Cmd + Shift + R`
- DevTools → Network → 勾选 `Disable cache`
- Service Worker：DevTools → Application → Service Workers → Unregister

---

## 15. 构建 / 部署

### 15.1 不需要构建

本项目没有构建步骤，源码即部署物。

### 15.2 部署到静态托管

**GitHub Pages**

```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin git@github.com:user/pixel-arcade.git
git push -u origin main
```

在 GitHub 仓库 Settings → Pages 里选 `main` 分支。

**Netlify / Vercel / Cloudflare Pages**

直接把整个文件夹拖进去，或连接 Git 仓库。无需配置构建命令。

**自建服务器**

把整个文件夹丢到 Nginx / Apache 静态目录，确保 `.js` 返回 `Content-Type: application/javascript`，`.json` 返回 `application/json`。

### 15.3 HTTPS 要求

Service Worker 只在 **HTTPS** 或 **localhost** 下工作。部署到生产环境必须用 HTTPS。

### 15.4 缓存策略建议

- HTML：`Cache-Control: no-cache`（让 Service Worker 接管）
- CSS / JS：`Cache-Control: max-age=31536000, immutable`（文件名带 hash 时）
- Service Worker：`Cache-Control: no-cache`

如果文件名不带 hash，建议全部用 `no-cache`，让 Service Worker 处理。

---

## 16. 版本规划

### 已完成（v1.0）

- 9 款游戏
- 主菜单 + 分类筛选 + 最近游玩
- 最高分 / 游玩次数本地存储
- 音效引擎 + 音量控制
- 键盘导航 + 触摸支持
- PWA 离线
- 帧率自适应
- CRT 视觉质感
- 开场动画
- 全屏按钮
- 返回确认

### 可以做的（v2.0 候选）

**游戏侧**

- 每日挑战（每天固定种子）
- 难度选择（简单 / 普通 / 困难）
- 成就系统
- 本地排行榜（历史前 10 名）
- 更多游戏（扫雷、连连看、五子棋、围棋...）

**系统侧**

- 主题切换（经典 GameBoy 绿、红白机红白、暗黑霓虹）
- 背景音乐（可选，需要音频文件或合成旋律）
- 云端同步最高分（需要后端）
- 分享成绩（复制到剪贴板 / Web Share API）
- 本地多人对战（同设备双人）

**技术侧**

- 用 Vite 打包（如果游戏数量继续增长）
- TypeScript 类型化
- 单元测试（Jest）
- E2E 测试（Playwright）

### 不做

- 用户系统 / 登录
- 内购 / 广告
- 服务端渲染
- 复杂后端

---

## 附录 A：术语表

| 术语 | 含义 |
|---|---|
| **GameBoy 绿** | 本项目的主色调，源自任天堂 GameBoy 掌机 |
| **8-bit 音效** | 早期游戏机的芯片音乐风格，方波 / 三角波 |
| **7-bag** | 俄罗斯方块中一种随机算法，保证 7 种形状均匀出现 |
| **幽灵方块** | 显示当前方块落地位置的半透明预览 |
| **Wall Kick** | 俄罗斯方块旋转时撞墙的位移补偿 |
| **CRT** | 老式显像管显示器，有扫描线和暗角效果 |
| **PWA** | Progressive Web App，可安装、可离线的网页应用 |
| **Service Worker** | 浏览器后台脚本，用于拦截请求、缓存资源 |
| **状态机** | 用有限个状态描述游戏状态，本项目是 `idle / playing / paused / over` |

## 附录 B：快速命令

```bash
# 起本地服务（推荐）
python3 -m http.server 8000

# 或
npx serve

# 或
php -S localhost:8000

# 访问
http://localhost:8000/games.html

# 检查 JS 语法
node --check js/menu.js
node --check js/common.js
node --check js/audio.js
node --check js/storage.js

# 批量检查
for f in js/*.js js/games/*.js; do node --check "$f" && echo "✓ $f"; done
```

## 附录 C：文件清单核对

上线前核对，确保每个文件都存在：

```
□ games.html
□ manifest.json
□ service-worker.js
□ README.md
□ DOCUMENTATION.md
□ css/base.css
□ css/menu.css
□ css/game.css
□ js/storage.js
□ js/audio.js
□ js/common.js
□ js/menu.js
□ js/games/snake.js
□ js/games/tetris.js
□ js/games/breakout.js
□ js/games/2048.js
□ js/games/memory.js
□ js/games/dodge.js
□ js/games/color-trap.js
□ js/games/rhythm.js
□ js/games/merge.js
□ games/snake.html
□ games/tetris.html
□ games/breakout.html
□ games/2048.html
□ games/memory.html
□ games/dodge.html
□ games/color-trap.html
□ games/rhythm.html
□ games/merge.html
```

---

**文档结束**

有任何游戏设计、实现细节、扩展方向的问题，可以对照本文档相应章节查找。