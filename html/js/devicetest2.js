/* ============================================================
   实用测试 · V4.1 活力版
   ============================================================ */
(function(){
  'use strict';

  const page = document.getElementById('page-devicetest');
  if (!page) return;

  const $ = id => document.getElementById(id);

  /* ============================================================
     标签切换
     ============================================================ */
  let currentTab = 'keyboard';

  document.getElementById('dtTabs').addEventListener('click', e => {
    const btn = e.target.closest('.ta-subtab[data-dt]');
    if (!btn) return;
    const v = btn.dataset.dt;
    document.querySelectorAll('#dtTabs .ta-subtab').forEach(b => b.classList.toggle('active', b === btn));
    page.querySelectorAll('.ta-subpage').forEach(p => p.classList.toggle('active', p.dataset.dtPage === v));
    currentTab = v;
    // 切走麦克风页 → 停止麦克风
    if (v !== 'mic' && mic.running) stopMic();
    // 切走网络页 → 停止测速
    if (v !== 'network' && net.abort) net.abort.abort();
    // 首次进入某些页 → 初始化
    if (v === 'mouse') initMouseCanvas();
    if (v === 'network') refreshNetInfo();
    if (v === 'mic') initMicCanvas();
  });

  /* ============================================================
     键盘测试
     ============================================================ */
  const KB_MAIN = [
    // 第一行
    [['Backquote','`',4],['Digit1','1',4],['Digit2','2',4],['Digit3','3',4],['Digit4','4',4],
     ['Digit5','5',4],['Digit6','6',4],['Digit7','7',4],['Digit8','8',4],['Digit9','9',4],
     ['Digit0','0',4],['Minus','−',4],['Equal','=',4],['Backspace','Backspace',8]],
    // 第二行
    [['Tab','Tab',6],['KeyQ','Q',4],['KeyW','W',4],['KeyE','E',4],['KeyR','R',4],
     ['KeyT','T',4],['KeyY','Y',4],['KeyU','U',4],['KeyI','I',4],['KeyO','O',4],
     ['KeyP','P',4],['BracketLeft','[',4],['BracketRight',']',4],['Backslash','\\',6]],
    // 第三行
    [['CapsLock','Caps',7],['KeyA','A',4],['KeyS','S',4],['KeyD','D',4],['KeyF','F',4],
     ['KeyG','G',4],['KeyH','H',4],['KeyJ','J',4],['KeyK','K',4],['KeyL','L',4],
     ['Semicolon',';',4],['Quote',"'",4],['Enter','Enter',9]],
    // 第四行
    [['ShiftLeft','Shift',9],['KeyZ','Z',4],['KeyX','X',4],['KeyC','C',4],['KeyV','V',4],
     ['KeyB','B',4],['KeyN','N',4],['KeyM','M',4],['Comma',',',4],['Period','.',4],
     ['Slash','/',4],['ShiftRight','Shift',11]],
    // 第五行
    [['ControlLeft','Ctrl',5],['MetaLeft','Win',5],['AltLeft','Alt',5],['Space','Space',25],
     ['AltRight','Alt',5],['MetaRight','Win',5],['ContextMenu','Menu',5],['ControlRight','Ctrl',5]]
  ];

  const KB_FN = [
    ['Escape','Esc'],['F1','F1'],['F2','F2'],['F3','F3'],['F4','F4'],
    ['F5','F5'],['F6','F6'],['F7','F7'],['F8','F8'],['F9','F9'],
    ['F10','F10'],['F11','F11'],['F12','F12']
  ];

  const testedKeys = new Set();

  function renderKeyboard(){
    // F 键行
    $('dtKbFnRow').innerHTML = KB_FN.map(([code, label]) =>
      '<div class="kb-key" data-code="' + code + '">' + label + '</div>'
    ).join('');

    // 主键区
    $('dtKbWrap').innerHTML = KB_MAIN.map(row => {
      return '<div class="dt-kb-row">' +
        row.map(([code, label, w]) =>
          '<div class="kb-key" data-code="' + code + '" style="grid-column:span ' + w + ';">' + label + '</div>'
        ).join('') +
      '</div>';
    }).join('');

    // 统计总数
    const total = $('dtKbFnRow').querySelectorAll('.kb-key').length +
                  $('dtKbWrap').querySelectorAll('.kb-key').length;
    $('dtKbTotal').textContent = total;
    updateTestedCount();
  }

  function updateTestedCount(){
    $('dtKbTested').textContent = testedKeys.size;
  }

  function findKeyEl(code){
    return document.querySelector('.kb-key[data-code="' + code + '"]');
  }

  function handleKeyDown(e){
    if (!page.classList.contains('active')) return;
    const tab = page.querySelector('.ta-subpage[data-dt-page="keyboard"]');
    if (!tab || !tab.classList.contains('active')) return;

    const el = findKeyEl(e.code);
    if (el){
      el.classList.add('pressed');
      if (!testedKeys.has(e.code)){
        testedKeys.add(e.code);
        el.classList.add('tested');
        updateTestedCount();
      }
    }

    // 更新显示
    $('dtKeyMain').textContent = e.key === ' ' ? 'Space' : (e.key.length === 1 ? e.key.toUpperCase() : e.key);
    $('dtKeyKey').textContent = e.key === ' ' ? '(空格)' : e.key;
    $('dtKeyCode').textContent = e.code || '—';
    $('dtKeyNum').textContent = e.keyCode || '—';
    const loc = e.location;
    const locLabel = loc === 0 ? '主键区' : loc === 1 ? '左侧' : loc === 2 ? '右侧' : loc === 3 ? '数字小键盘' : String(loc);
    $('dtKeyLoc').textContent = locLabel;

    // 空格不要滚动页面
    if (e.code === 'Space') e.preventDefault();
  }

  function handleKeyUp(e){
    if (!page.classList.contains('active')) return;
    const tab = page.querySelector('.ta-subpage[data-dt-page="keyboard"]');
    if (!tab || !tab.classList.contains('active')) return;
    const el = findKeyEl(e.code);
    if (el) el.classList.remove('pressed');
  }

  function bindKeyboard(){
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    $('dtKbReset').addEventListener('click', () => {
      testedKeys.clear();
      document.querySelectorAll('.kb-key.tested').forEach(el => el.classList.remove('tested'));
      updateTestedCount();
      $('dtKeyMain').textContent = '—';
      $('dtKeyKey').textContent = '—';
      $('dtKeyCode').textContent = '—';
      $('dtKeyNum').textContent = '—';
      $('dtKeyLoc').textContent = '—';
    });
  }

  /* ============================================================
     鼠标测试
     ============================================================ */
  const mouseStats = { left: 0, mid: 0, right: 0, side: 0, wheelUp: 0, wheelDown: 0, dbl: 0 };
  let mouseCtx = null;
  let mouseInited = false;
  let mouseDrawing = false;
  let mouseLastPt = null;
  let clickTimer = null;
  let lastClickTime = 0;

  function initMouseCanvas(){
    if (mouseInited) return;
    mouseInited = true;

    const canvas = $('dtMouseCanvas');
    const ctx = canvas.getContext('2d');
    mouseCtx = ctx;

    // 逻辑尺寸 800 × 360
    const W = 800, H = 360;
    canvas.width = W;
    canvas.height = H;

    const resetCanvas = () => {
      ctx.fillStyle = '#fffaf0';
      ctx.fillRect(0, 0, W, H);
      // 淡淡网格
      ctx.strokeStyle = 'rgba(245,179,1,.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 40){
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += 40){
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    };
    resetCanvas();

    // 坐标转换
    function getPos(e){
      const rect = canvas.getBoundingClientRect();
      const sx = W / rect.width;
      const sy = H / rect.height;
      return {
        x: Math.round((e.clientX - rect.left) * sx),
        y: Math.round((e.clientY - rect.top) * sy)
      };
    }

    canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      const p = getPos(e);
      // 统计点击
      if (e.button === 0) mouseStats.left++;
      else if (e.button === 1) mouseStats.mid++;
      else if (e.button === 2) mouseStats.right++;
      else if (e.button === 3 || e.button === 4) mouseStats.side++;

      // 双击检测
      const now = Date.now();
      if (e.button === 0 && now - lastClickTime < 350){
        mouseStats.dbl++;
        if (clickTimer){ clearTimeout(clickTimer); clickTimer = null; }
      } else if (e.button === 0){
        if (clickTimer) clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clickTimer = null; }, 400);
      }
      lastClickTime = now;

      renderMouseStats();

      // 左键开始画
      if (e.button === 0){
        mouseDrawing = true;
        mouseLastPt = p;
        try { canvas.setPointerCapture(e.pointerId); } catch(err){}
      }
    });

    canvas.addEventListener('pointermove', e => {
      const p = getPos(e);
      $('dtMouseCoords').textContent = p.x + ', ' + p.y;
      $('dtMouseHint').style.opacity = '0';

      if (mouseDrawing && mouseLastPt){
        ctx.strokeStyle = '#b47c00';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(mouseLastPt.x, mouseLastPt.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        mouseLastPt = p;
      }
    });

    ['pointerup','pointercancel','pointerleave'].forEach(evt => {
      canvas.addEventListener(evt, () => {
        mouseDrawing = false;
        mouseLastPt = null;
        $('dtMouseHint').style.opacity = '1';
      });
    });

    // 右键不弹菜单
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // 滚轮
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (e.deltaY < 0) mouseStats.wheelUp++;
      else if (e.deltaY > 0) mouseStats.wheelDown++;
      renderMouseStats();
    }, { passive: false });

    $('dtMouseClear').addEventListener('click', resetCanvas);
    $('dtMouseReset').addEventListener('click', () => {
      mouseStats.left = mouseStats.mid = mouseStats.right = mouseStats.side = 0;
      mouseStats.wheelUp = mouseStats.wheelDown = mouseStats.dbl = 0;
      renderMouseStats();
      resetCanvas();
    });
  }

  function renderMouseStats(){
    $('dtMLeft').textContent = mouseStats.left;
    $('dtMMid').textContent = mouseStats.mid;
    $('dtMRight').textContent = mouseStats.right;
    $('dtMSide').textContent = mouseStats.side;
    $('dtMWheelUp').textContent = mouseStats.wheelUp;
    $('dtMWheelDown').textContent = mouseStats.wheelDown;
    $('dtMDbl').textContent = mouseStats.dbl;
  }

  /* ============================================================
     网络测速
     ============================================================ */
  const net = {
    abort: null,
    testing: false
  };

  const NET_TYPE_LABEL = {
    'slow-2g': '2G 慢速',
    '2g': '2G',
    '3g': '3G',
    '4g': '4G',
    '5g': '5G'
  };

  function refreshNetInfo(){
    $('dtNetOnline').textContent = navigator.onLine ? '在线' : '离线';

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn){
      $('dtNetType').textContent = NET_TYPE_LABEL[conn.effectiveType] || conn.effectiveType || '未知';
      $('dtNetDownlink').textContent = (typeof conn.downlink === 'number') ? conn.downlink + ' Mbps' : '未知';
      $('dtNetRtt').textContent = (typeof conn.rtt === 'number') ? conn.rtt + ' ms' : '未知';
      $('dtNetSaveData').textContent = conn.saveData ? '已开启' : '未开启';
    } else {
      $('dtNetType').textContent = '浏览器不支持';
      $('dtNetDownlink').textContent = '—';
      $('dtNetRtt').textContent = '—';
      $('dtNetSaveData').textContent = '—';
    }
  }

  async function runSpeedTest(){
    if (net.testing) return;
    net.testing = true;
    net.abort = new AbortController();

    $('dtNetStart').disabled = true;
    $('dtNetStop').disabled = false;
    $('dtSpeedValue').textContent = '0.0';
    $('dtSpeedProgress').style.width = '0%';
    $('dtSpeedDetail').textContent = '正在下载测试文件…';

    const TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB
    const url = 'https://speed.cloudflare.com/__down?bytes=' + TOTAL_BYTES;

    const startTime = performance.now();
    let received = 0;
    let lastUpdate = 0;

    try {
      const res = await fetch(url, { signal: net.abort.signal, cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      if (!res.body){
        // 不支持流式，退化为 blob
        const blob = await res.blob();
        received = blob.size;
        $('dtSpeedProgress').style.width = '100%';
      } else {
        const reader = res.body.getReader();
        while (true){
          const { done, value } = await reader.read();
          if (done) break;
          received += value.length;
          const now = performance.now();
          if (now - lastUpdate > 120){
            lastUpdate = now;
            const pct = Math.min(100, received / TOTAL_BYTES * 100);
            $('dtSpeedProgress').style.width = pct + '%';
            const sec = (now - startTime) / 1000;
            if (sec > 0.2){
              const mbps = (received * 8) / sec / 1e6;
              $('dtSpeedValue').textContent = mbps.toFixed(1);
            }
            $('dtSpeedDetail').textContent = '已下载 ' + (received / 1024 / 1024).toFixed(2) + ' MB / 10 MB';
          }
        }
      }

      const elapsed = (performance.now() - startTime) / 1000;
      const mbps = (received * 8) / elapsed / 1e6;
      $('dtSpeedValue').textContent = mbps.toFixed(2);
      $('dtSpeedProgress').style.width = '100%';
      $('dtSpeedDetail').textContent =
        '下载 ' + (received / 1024 / 1024).toFixed(2) + ' MB，用时 ' + elapsed.toFixed(2) + ' 秒';

    } catch (err){
      if (err && err.name === 'AbortError'){
        $('dtSpeedDetail').textContent = '已停止';
      } else {
        $('dtSpeedDetail').textContent = '测速失败：' + (err && err.message ? err.message : err) + '（请检查网络或跨域限制）';
        $('dtSpeedValue').textContent = '—';
      }
    } finally {
      net.testing = false;
      net.abort = null;
      $('dtNetStart').disabled = false;
      $('dtNetStop').disabled = true;
    }
  }

  function bindNetwork(){
    $('dtNetStart').addEventListener('click', runSpeedTest);
    $('dtNetStop').addEventListener('click', () => {
      if (net.abort) net.abort.abort();
    });
  }

  /* ============================================================
     麦克风测试
     ============================================================ */
  const mic = {
    running: false,
    stream: null,
    audioCtx: null,
    analyser: null,
    raf: null,
    canvasCtx: null,
    canvasInited: false
  };

  function initMicCanvas(){
    if (mic.canvasInited) return;
    mic.canvasInited = true;
    const canvas = $('dtMicCanvas');
    const ctx = canvas.getContext('2d');
    mic.canvasCtx = ctx;
    clearMicCanvas();
  }

  function clearMicCanvas(){
    if (!mic.canvasCtx) return;
    const canvas = $('dtMicCanvas');
    mic.canvasCtx.fillStyle = '#ffffff';
    mic.canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    mic.canvasCtx.strokeStyle = 'rgba(245,179,1,.25)';
    mic.canvasCtx.lineWidth = 1;
    mic.canvasCtx.beginPath();
    mic.canvasCtx.moveTo(0, canvas.height / 2);
    mic.canvasCtx.lineTo(canvas.width, canvas.height / 2);
    mic.canvasCtx.stroke();
  }

  async function startMic(){
    if (mic.running) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      $('dtMicTip').textContent = '当前浏览器不支持麦克风访问';
      $('dtMicTip').className = 'dt-mic-tip error';
      return;
    }
    $('dtMicTip').textContent = '正在请求麦克风权限…';
    $('dtMicTip').className = 'dt-mic-tip';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      mic.running = true;
      mic.stream = stream;
      mic.audioCtx = audioCtx;
      mic.analyser = analyser;

      $('dtMicStart').disabled = true;
      $('dtMicStop').disabled = false;
      $('dtMicTip').textContent = '麦克风已启动，说话时波形与音量条会实时变化';
      $('dtMicTip').className = 'dt-mic-tip ok';

      drawMic();
    } catch (err){
      $('dtMicTip').textContent = '启动失败：' + (err && err.message ? err.message : err);
      $('dtMicTip').className = 'dt-mic-tip error';
    }
  }

  function drawMic(){
    if (!mic.running) return;
    const canvas = $('dtMicCanvas');
    const ctx = mic.canvasCtx;
    const W = canvas.width;
    const H = canvas.height;
    const analyser = mic.analyser;

    const dataArr = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArr);

    // 音量（RMS）
    let sum = 0;
    for (let i = 0; i < dataArr.length; i++){
      const v = (dataArr[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArr.length);
    const level = Math.min(1, rms * 3.2);   // 感知放大，避免条太短
    const pct = Math.round(level * 100);
    $('dtMicLevelBar').style.width = pct + '%';
    $('dtMicLevelText').textContent = pct + '%';

    // 波形
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // 中线
    ctx.strokeStyle = 'rgba(245,179,1,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();

    // 波形曲线
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#b47c00';
    ctx.beginPath();
    const sliceWidth = W / dataArr.length;
    let x = 0;
    for (let i = 0; i < dataArr.length; i++){
      const v = dataArr[i] / 128.0;
      const y = v * H / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();

    mic.raf = requestAnimationFrame(drawMic);
  }

  function stopMic(){
    if (!mic.running) return;
    mic.running = false;
    if (mic.raf){
      cancelAnimationFrame(mic.raf);
      mic.raf = null;
    }
    if (mic.stream){
      mic.stream.getTracks().forEach(t => t.stop());
      mic.stream = null;
    }
    if (mic.audioCtx){
      try { mic.audioCtx.close(); } catch(e){}
      mic.audioCtx = null;
    }
    mic.analyser = null;

    $('dtMicStart').disabled = false;
    $('dtMicStop').disabled = true;
    $('dtMicLevelBar').style.width = '0%';
    $('dtMicLevelText').textContent = '0%';
    $('dtMicTip').textContent = '已停止';
    $('dtMicTip').className = 'dt-mic-tip';
    clearMicCanvas();
  }

  function bindMic(){
    $('dtMicStart').addEventListener('click', startMic);
    $('dtMicStop').addEventListener('click', stopMic);
  }

  /* ============================================================
     切页 / 离开页面时释放
     ============================================================ */
  // 监听 page 的 active class 变化
  const observer = new MutationObserver(() => {
    if (!page.classList.contains('active')){
      if (mic.running) stopMic();
      if (net.abort) net.abort.abort();
    } else {
      // 回到页面，刷新网络信息
      refreshNetInfo();
    }
  });
  observer.observe(page, { attributes: true, attributeFilter: ['class'] });

  /* ============================================================
     初始化
     ============================================================ */
  function initAll(){
    renderKeyboard();
    refreshNetInfo();
  }

  let inited = false;
  window.__devicetestInit = function(){
    if (!inited){
      inited = true;
      bindKeyboard();
      bindNetwork();
      bindMic();
      renderKeyboard();
    }
    refreshNetInfo();
    if (currentTab === 'mouse') initMouseCanvas();
    if (currentTab === 'mic') initMicCanvas();
  };

  // 首屏就是本页时也初始化
  if (page.classList.contains('active')){
    window.__devicetestInit();
  }

  console.log('[实用测试] 已加载');
})();