 (function () {
    'use strict';

    const tempInput = document.getElementById('heatTemp');
    const humidityInput = document.getElementById('heatHumidity');
    const windInput = document.getElementById('heatWind');
    const intensitySelect = document.getElementById('heatIntensity');
    const calcBtn = document.getElementById('heatCalcBtn');
    const resetBtn = document.getElementById('heatResetBtn');
    const feelsLikeEl = document.getElementById('heatFeelsLike');
    const riskTagEl = document.getElementById('heatRiskTag');
    const suggestList = document.getElementById('heatSuggestList');
    const resultBox = document.getElementById('heatResultBox');
    const riskArrow = document.getElementById('heatRiskArrow');

    // 摄氏转华氏
    function c2f(c) { return c * 9 / 5 + 32; }
    // 华氏转摄氏
    function f2c(f) { return (f - 32) * 5 / 9; }

    // 酷热指数 Heat Index
    function heatIndex(tempC, rh) {
      const T = c2f(tempC);
      const R = rh;
      if (T < 80) return tempC;
      const HI = 
        -42.379 +
        2.04901523 * T +
        10.14333127 * R -
        0.22475541 * T * R -
        6.83783e-3 * T * T -
        5.481717e-2 * R * R +
        1.22874e-3 * T * T * R +
        8.5282e-4 * T * R * R -
        1.99e-6 * T * T * R * R;
      return f2c(HI);
    }

    // 风寒指数 Wind Chill
    function windChill(tempC, windMs) {
      const V = windMs * 3.6;
      if (tempC > 10 || V < 4.8) return tempC;
      const WCT = 
        13.12 +
        0.6215 * tempC -
        11.37 * Math.pow(V, 0.16) +
        0.3965 * tempC * Math.pow(V, 0.16);
      return WCT;
    }

    // 计算体感温度
    function calcFeelsLike(tempC, rh, windMs) {
      if (tempC >= 27) {
        return heatIndex(tempC, rh);
      } else if (tempC <= 10 && windMs >= 1.3) {
        return windChill(tempC, windMs);
      } else {
        const humAdj = -0.35 * (rh / 100) * (tempC - 20);
        const windAdj = -0.2 * windMs;
        return tempC + humAdj + windAdj;
      }
    }

    // 获取风险等级与建议
    function getRiskInfo(feelsLike, intensity) {
      let level, tag, color, suggestions = [];

      if (feelsLike < -5) {
        level = 'extreme-cold';
        tag = '极高风险 · 冻伤危险';
        color = '#8ba6c0';
        suggestions = [
          '不建议长时间户外运动，极易发生冻伤',
          '必须穿戴防风保暖装备，覆盖头面手足',
          '每20-30分钟进入室内取暖一次',
          '避免出汗，衣物潮湿会大幅加速失温'
        ];
      } else if (feelsLike < 0) {
        level = 'high-cold';
        tag = '高度风险 · 注意保暖';
        color = '#8ba6c0';
        suggestions = [
          '户外运动需做好充分保暖，佩戴帽子手套',
          '控制运动时长，避免长时间静止',
          '注意补充温热饮品，避免生冷'
        ];
      } else if (feelsLike < 10) {
        level = 'mid-cold';
        tag = '中度风险 · 偏凉';
        color = '#9fb3c9';
        suggestions = [
          '运动前充分热身，避免肌肉拉伤',
          '穿着分层衣物，运动后及时添衣',
          '高强度运动可正常进行，低强度注意保暖'
        ];
      } else if (feelsLike < 28) {
        level = 'ok';
        tag = '适宜 · 运动舒适';
        color = '#8fb59a';
        suggestions = [
          '体感舒适，非常适合户外运动',
          '正常补水即可，每小时约300-500ml',
          '可安排中高强度训练，表现最佳'
        ];
      } else if (feelsLike < 32) {
        level = 'low';
        tag = '轻度风险 · 注意补水';
        color = '#c8a468';
        suggestions = [
          '体感偏热，中等强度运动需注意补水',
          '每15-20分钟补充一次水分，每次约100-150ml',
          '尽量避开正午时段，选择早晚运动',
          '佩戴遮阳帽，涂抹防晒霜'
        ];
      } else if (feelsLike < 38) {
        level = 'mid';
        tag = '中度风险 · 降低强度';
        color = '#d18a4a';
        suggestions = [
          '建议降低运动强度，缩短运动时间',
          '大量补水并适当补充电解质',
          '每10分钟休息一次，到阴凉处降温',
          '如果出现头晕、心慌立即停止运动'
        ];
      } else if (feelsLike < 41) {
        level = 'high';
        tag = '高度风险 · 谨慎运动';
        color = '#c17878';
        suggestions = [
          '不建议进行中高强度户外运动',
          '如必须运动，仅限短时间低强度活动',
          '全程持续补水，携带降温用品',
          '有人陪同运动，随时观察身体状态'
        ];
      } else {
        level = 'extreme';
        tag = '极高风险 · 危险';
        color = '#b91c1c';
        suggestions = [
          '禁止一切户外运动，极易发生热射病',
          '待在阴凉通风室内，避免外出',
          '大量补充电解质水，少量多次',
          '如出现体温升高、意识模糊立即就医'
        ];
      }

      if (intensity === 'high' && (feelsLike >= 28 || feelsLike < 5)) {
        suggestions.unshift('当前为高强度运动，风险等级上调一级，请特别注意');
      }
      if (intensity === 'light' && feelsLike >= 28 && feelsLike < 38) {
        suggestions.push('低强度运动风险相对较低，但仍需定时补水');
      }

      return { level, tag, color, suggestions };
    }

    // 渲染建议列表
    function renderSuggestions(list) {
      suggestList.innerHTML = '';
      list.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        suggestList.appendChild(li);
      });
    }

    // 风险箭头定位
    function updateArrow(feelsLike) {
      if (!riskArrow) return; // 容错：找不到箭头直接跳过
      const ranges = [
        { min: -Infinity, max: 10,   index: 0 },
        { min: 10,        max: 28,   index: 1 },
        { min: 28,        max: 32,   index: 2 },
        { min: 32,        max: 38,   index: 3 },
        { min: 38,        max: 41,   index: 4 },
        { min: 41,        max: Infinity, index: 5 }
      ];

      let range = ranges[0];
      for (let i = 0; i < ranges.length; i++) {
        if (feelsLike >= ranges[i].min && feelsLike < ranges[i].max) {
          range = ranges[i];
          break;
        }
        if (feelsLike >= 41) range = ranges[5];
      }

      const segFlex = [10, 18, 4, 6, 3, 6];
      const totalFlex = segFlex.reduce((a, b) => a + b, 0);
      let blockStart = 0;
      for (let i = 0; i < range.index; i++) blockStart += segFlex[i] / totalFlex * 100;
      const blockWidth = segFlex[range.index] / totalFlex * 100;

      let innerPercent = 0.5;
      if (isFinite(range.min) && isFinite(range.max)) {
        innerPercent = (feelsLike - range.min) / (range.max - range.min);
        innerPercent = Math.max(0.1, Math.min(0.9, innerPercent));
      } else if (feelsLike < 10) {
        innerPercent = Math.max(0.1, (feelsLike + 10) / 20);
      }

      const finalLeft = blockStart + innerPercent * blockWidth;
      riskArrow.style.left = finalLeft + '%';
    }

    // 主计算
    function calculate() {
      const temp = parseFloat(tempInput.value);
      const rh = parseFloat(humidityInput.value);
      const wind = parseFloat(windInput.value) || 0;
      const intensity = intensitySelect.value;

      if (isNaN(temp) || isNaN(rh)) {
        alert('请输入有效的气温和湿度');
        return;
      }
      if (rh < 0 || rh > 100) {
        alert('相对湿度请输入 0-100 之间的数值');
        return;
      }

      const feelsLike = calcFeelsLike(temp, rh, wind);
      const info = getRiskInfo(feelsLike, intensity);

      // 先渲染核心内容
      feelsLikeEl.textContent = feelsLike.toFixed(1) + ' ℃';
      riskTagEl.textContent = info.tag;

      // 结果卡片背景
      if (feelsLike < 10) {
        resultBox.style.background = 'linear-gradient(135deg,#7a93ac,#4a6785)';
      } else if (feelsLike < 28) {
        resultBox.style.background = 'linear-gradient(135deg,#7ea68a,#527d5f)';
      } else if (feelsLike < 35) {
        resultBox.style.background = 'linear-gradient(135deg,#c9a060,#a67a36)';
      } else {
        resultBox.style.background = 'linear-gradient(135deg,#c17272,#943939)';
      }

      renderSuggestions(info.suggestions);

      // 最后处理箭头，不影响核心功能
      updateArrow(feelsLike);
    }

    // 事件绑定
    calcBtn.addEventListener('click', calculate);
    resetBtn.addEventListener('click', function () {
      tempInput.value = '25';
      humidityInput.value = '60';
      windInput.value = '2';
      intensitySelect.value = 'moderate';
      feelsLikeEl.textContent = '—';
      riskTagEl.textContent = '请输入参数后计算';
      resultBox.style.background = 'linear-gradient(135deg,#8b939c,#565d65)';
      suggestList.innerHTML = '<li>输入环境参数后，自动生成对应运动建议</li>';
      if (riskArrow) riskArrow.style.left = '50%';
    });

    // 回车计算
    [tempInput, humidityInput, windInput].forEach(el => {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') calculate();
      });
    });

    // 默认计算一次
    calculate();
    console.log('[体感温度] 模块已加载');
  })();