/* ============================================================
   岁窦工具箱 · V2.3.2 铂金版
   主脚本（结构调整版，无新功能）
   ============================================================ */

/* ===================== 配置 ===================== */
const SUPABASE_URL      = 'https://gsyyaxmqtrxdxuiamkcr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeXlheG1xdHJ4ZHh1aWFta2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMDEwOTcsImV4cCI6MjEwNTg3NzA5N30.06OY_P37nhhXaKNc2-kB29qx16GGKjvUgICQQY3YGt8';
const AI_PROXY_URL      = SUPABASE_URL + '/functions/v1/ai-proxy';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const RECIPE_KEY = 'suidou-recipes-v1';

/* ===================== 通用工具 ===================== */
const toastEl = document.getElementById('toast');
let toastTimer = null;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}
function esc(s){
  return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function pad2(n){ return String(n).padStart(2,'0'); }
function timeStamp(d){
  return d.getFullYear() + pad2(d.getMonth()+1) + pad2(d.getDate()) + '_' + pad2(d.getHours()) + pad2(d.getMinutes());
}

let currentUser = null;
let appMode = 'local';

/* ===================== 存储 key ===================== */
const PEOPLE_KEY   = 'suidou-people-v2';
const SONGS_KEY    = 'suidou-songs-v1';
const PLACES_KEY   = 'suidou-places-v1';
const MEDIA_KEY    = 'suidou-medias-v1';
const CAL_KEY      = 'suidou-schedules-v1';
const NOTES_KEY    = 'suidou-notes-v1';
const TL_KEY       = 'suidou-timeline-v1';
const NOVELS_KEY   = 'suidou-novels-v1';
const CHAPTERS_KEY = 'suidou-chapters-v1';
const LEDGER_KEY   = 'suidou-ledger-v1';
const SLEEP_KEY    = 'suidou-sleep-v1';
const VITAL_KEY    = 'suidou-vitals-v1';
const EXER_KEY     = 'suidou-exercise-v1';
const EXER_PROFILE_KEY = 'suidou-exer-profile-v1';

/* ===================== 页面切换 ===================== */
const pages = document.querySelectorAll('.page');

function navFor(name){
  if (name === 'home') return 'home';
  if (name === 'help') return 'help';
  if (name === 'settings') return 'settings';
  if (name === 'login' || name === 'reset') return 'home';
  return 'apps';
}

function go(name){
  pages.forEach(p => p.classList.toggle('active', p.id === 'page-' + name));
  const target = navFor(name);
  document.querySelectorAll('nav button[data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === target);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  /* 按页面懒加载 / 重绘 */
  if (name === 'chart')        setTimeout(renderChart, 60);
  if (name === 'calendar')     setTimeout(renderCalendar, 60);
  if (name === 'code')         setTimeout(runCodeEditor, 60);
  if (name === 'ai')           setTimeout(() => { updateQuota(); chatInput.focus(); }, 60);
  if (name === 'novel')        setTimeout(renderNovelList, 60);
  if (name === 'ledger')       setTimeout(renderLedger, 60);
  if (name === 'textanalysis') setTimeout(() => { updateWC(); updateWordFreq(); }, 60);
  if (name === 'calc')         setTimeout(() => { updateUnitConvert(); }, 60);
  if (name === 'health')       setTimeout(() => { updateBmi(); updateShoeCalc(); renderShoeTable(); renderSleepChart(); renderSleepList(); renderVitalList(); }, 60);
  if (name === 'exercise')     setTimeout(() => { loadExerProfile(); renderExerciseList(); }, 60);
  if (name === 'timeline')     setTimeout(() => { loadTimeline(); }, 60);
  if (name === 'notes')        setTimeout(() => { loadNotes(); }, 60);
  if (name === 'qrcode')       setTimeout(() => {
    if (typeof window.__qrRender === 'function'){
      try { window.__qrRender(); }
      catch(e){ console.error('[二维码] 切页重绘失败：', e); }
    }
  }, 100);
}

document.querySelectorAll('nav button[data-page], .logo[data-page]').forEach(el => {
  el.addEventListener('click', () => go(el.dataset.page));
});
document.querySelectorAll('.tool-card, .hot-card, .cat-list li').forEach(card => {
  card.addEventListener('click', () => go(card.dataset.target));
});
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => go('home'));
});

/* ===================== 全局搜索 ===================== */
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  const isSearching = !!q;
  let any = false;

  document.querySelectorAll('#page-apps .tool-card').forEach(card => {
    const hay = ((card.dataset.keywords || '') + ' ' + card.textContent).toLowerCase();
    const show = !q || hay.includes(q);
    card.style.display = show ? '' : 'none';
    if (show) any = true;
  });

  // 处理拼音分组标题：所在组全部隐藏时，标题也隐藏
  document.querySelectorAll('#page-apps .pinyin-head').forEach(head => {
    let next = head.nextElementSibling;
    let groupHasVisible = false;
    while (next && !next.classList.contains('pinyin-head')) {
      if (next.classList.contains('tool-card') && next.style.display !== 'none') {
        groupHasVisible = true;
        break;
      }
      next = next.nextElementSibling;
    }
    head.style.display = (isSearching && !groupHasVisible) ? 'none' : '';
  });

  const toggle = (id, show) => { const el = document.getElementById(id); if (el) el.style.display = show ? '' : 'none'; };
  toggle('appsCategoryTitle', !isSearching);
  toggle('categorySection',   !isSearching);
  const noRes = document.getElementById('noResult');
  if (noRes) noRes.style.display = (any || !q) ? 'none' : 'block';
  if (isSearching && !document.getElementById('page-apps').classList.contains('active')) go('apps');
});

/* ===================== 认证 ===================== */
const loginBtn  = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const modeBadge = document.getElementById('modeBadge');

function setMode(mode){
  appMode = mode;
  modeBadge.textContent = mode === 'cloud' ? '云端模式' : '本地模式';
  modeBadge.className = 'mode-badge ' + (mode === 'cloud' ? 'cloud' : 'local');
  const up = document.getElementById('uploadLocalBtn');
  const pu = document.getElementById('pullCloudBtn');
  if (up) up.style.display = mode === 'cloud' ? '' : 'none';
  if (pu) pu.style.display = mode === 'cloud' ? '' : 'none';
  const tip = document.getElementById('accountTip');
  if (tip){
    tip.innerHTML = mode === 'cloud'
      ? '当前为<strong>云端模式</strong>：数据已同步到 Supabase，可在多设备登录同一账号访问。'
      : '当前为<strong>本地模式</strong>：数据保存在浏览器 localStorage，登录后可上传到云端并在多设备间同步。';
  }
}

function updateAuthUI(){
  const unameInput  = document.getElementById('usernameInput');
  const unameSave   = document.getElementById('usernameSave');
  const unameTip    = document.getElementById('usernameTip');
  const avatarInput = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const userAvatar  = document.getElementById('userAvatar');

  if (currentUser){
    loginBtn.style.display = 'none';
    logoutBtn.style.display = '';
    userEmail.style.display = '';
    const uname  = currentUser.user_metadata?.username;
    const avatar = currentUser.user_metadata?.avatar;
    userEmail.textContent = uname ? uname : currentUser.email;

    if (avatar){
      userAvatar.src = avatar;
      userAvatar.classList.add('show');
      if (avatarPreview) avatarPreview.innerHTML = '<img src="' + avatar + '" alt="">';
    } else {
      userAvatar.classList.remove('show');
      userAvatar.src = '';
      if (avatarPreview) avatarPreview.textContent = '未设置';
    }

    setMode('cloud');

    if (unameInput){
      unameInput.value = uname || '';
      unameInput.disabled = false;
      unameSave.disabled = false;
      unameTip.textContent = '用户名只用于主页显示，不影响登录邮箱。建议 2-20 字。';
    }
    if (avatarInput) avatarInput.disabled = false;
  } else {
    loginBtn.style.display = '';
    logoutBtn.style.display = 'none';
    userEmail.style.display = 'none';
    userAvatar.classList.remove('show');
    userAvatar.src = '';
    setMode('local');

    if (unameInput){
      unameInput.value = '';
      unameInput.disabled = true;
      unameSave.disabled = true;
      unameTip.textContent = '未登录时无法修改用户名，请先登录。';
    }
    if (avatarPreview) avatarPreview.textContent = '未设置';
    if (avatarInput){
      avatarInput.disabled = true;
      avatarInput.value = '';
    }
  }
}

loginBtn.addEventListener('click', () => go('login'));
logoutBtn.addEventListener('click', async () => {
  await sb.auth.signOut();
  currentUser = null;
  updateAuthUI();
  showToast('已退出登录，切回本地模式');
  go('home');
});

let authMode = 'login';
const tabLogin    = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const authTitle   = document.getElementById('authTitle');
const authSub     = document.getElementById('authSub');
const authSubmit  = document.getElementById('authSubmit');
const authMsg     = document.getElementById('authMsg');

function setAuthMode(m){
  authMode = m;
  tabLogin.classList.toggle('active', m === 'login');
  tabRegister.classList.toggle('active', m === 'register');
  authTitle.textContent  = m === 'login' ? '登录岁窦工具箱' : '注册新账号';
  authSub.textContent    = m === 'login' ? '登录后数据将同步到云端，换设备也能继续使用。' : '注册后即可在云端保存所有数据。';
  authSubmit.textContent = m === 'login' ? '登录' : '注册';
  document.getElementById('authPassword').placeholder = m === 'login' ? '' : '至少 6 位';
  authMsg.className = 'auth-msg';
}
tabLogin.addEventListener('click', () => setAuthMode('login'));
tabRegister.addEventListener('click', () => setAuthMode('register'));

function showAuthMsg(text, ok){
  authMsg.textContent = text;
  authMsg.className = 'auth-msg ' + (ok ? 'ok' : 'err');
}

authSubmit.addEventListener('click', async () => {
  const email = document.getElementById('authEmail').value.trim();
  const pwd   = document.getElementById('authPassword').value;
  if (!email || !pwd) { showAuthMsg('请填写邮箱和密码', false); return; }
  if (authMode === 'register' && pwd.length < 6) { showAuthMsg('密码至少 6 位', false); return; }
  authSubmit.disabled = true;
  const oldText = authSubmit.textContent;
  authSubmit.textContent = '处理中…';
  try {
    if (authMode === 'login'){
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pwd });
      if (error) throw error;
      currentUser = data.user;
      updateAuthUI();
      showAuthMsg('登录成功，正在检查本地数据…', true);
      await maybeUploadLocalData();
      setTimeout(() => { go('home'); showToast('欢迎回来，' + email); }, 700);
    } else {
      const { data, error } = await sb.auth.signUp({
        email, password: pwd,
        options: { emailRedirectTo: location.origin + location.pathname }
      });
      if (error) throw error;
      if (data.session){
        currentUser = data.user;
        updateAuthUI();
        showAuthMsg('注册成功，已自动登录', true);
        setTimeout(() => go('home'), 700);
      } else {
        showAuthMsg('注册成功！请到邮箱点击确认链接后再登录。', true);
        setAuthMode('login');
      }
    }
  } catch (err){
    showAuthMsg(err.message || '操作失败，请重试', false);
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = oldText;
  }
});
document.getElementById('authBack').addEventListener('click', () => go('home'));

/* ===================== 用户名修改 ===================== */
const usernameInput = document.getElementById('usernameInput');
const usernameSave  = document.getElementById('usernameSave');
const usernameTip   = document.getElementById('usernameTip');

usernameSave.addEventListener('click', async () => {
  if (!currentUser){ showToast('请先登录'); return; }
  const uname = usernameInput.value.trim();
  if (!uname){ alert('请填写用户名～'); return; }
  if (uname.length < 2 || uname.length > 20){ alert('用户名长度 2-20 字'); return; }
  usernameSave.disabled = true;
  const oldText = usernameSave.textContent;
  usernameSave.textContent = '保存中…';
  try {
    const { data, error } = await sb.auth.updateUser({ data: { username: uname } });
    if (error) throw error;
    if (data && data.user) currentUser = data.user;
    userEmail.textContent = uname;
    usernameTip.textContent = '已保存，下次登录也会显示这个名字。';
    showToast('用户名已更新为「' + uname + '」');
  } catch (err){
    alert('保存失败：' + (err.message || err));
  } finally {
    usernameSave.disabled = false;
    usernameSave.textContent = oldText;
  }
});

/* ===================== 头像上传 ===================== */
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
if (avatarInput){
  avatarInput.addEventListener('change', async e => {
    if (!currentUser){ showToast('请先登录'); return; }
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }

    avatarPreview.textContent = '处理中…';
    compressImage(file, 180, 0.8, async dataUrl => {
      try {
        const { data, error } = await sb.auth.updateUser({ data: { avatar: dataUrl } });
        if (error) throw error;
        if (data && data.user) currentUser = data.user;

        avatarPreview.innerHTML = '<img src="' + dataUrl + '" alt="">';
        updateAuthUI();
        showToast('头像已更新');
      } catch (err){
        alert('保存失败：' + (err.message || err));
        avatarPreview.textContent = '未设置';
      }
    });
  });
}

/* ===================== 忘记密码 / 重置密码 ===================== */
const forgotPwdBtn = document.getElementById('forgotPwdBtn');
const resetTitle   = document.getElementById('resetTitle');
const resetSub     = document.getElementById('resetSub');
const resetEmailField = document.getElementById('resetEmailField');
const resetPwdField   = document.getElementById('resetPwdField');
const resetEmail   = document.getElementById('resetEmail');
const resetNewPwd  = document.getElementById('resetNewPwd');
const resetSubmit  = document.getElementById('resetSubmit');
const resetMsg     = document.getElementById('resetMsg');

let resetMode = 'send';

function showResetMsg(text, ok){
  resetMsg.textContent = text;
  resetMsg.className = 'auth-msg ' + (ok ? 'ok' : 'err');
}

forgotPwdBtn.addEventListener('click', () => {
  resetMode = 'send';
  resetTitle.textContent = '重置密码';
  resetSub.textContent   = '输入你的注册邮箱，我们会发送一封重置密码的邮件。';
  resetEmailField.style.display = '';
  resetPwdField.style.display = 'none';
  resetSubmit.textContent = '发送重置邮件';
  resetMsg.className = 'auth-msg';
  const curEmail = document.getElementById('authEmail').value.trim();
  if (curEmail) resetEmail.value = curEmail;
  go('reset');
});

document.getElementById('resetBack').addEventListener('click', () => go('login'));

resetSubmit.addEventListener('click', async () => {
  if (resetMode === 'send'){
    const email = resetEmail.value.trim();
    if (!email){ showResetMsg('请填写邮箱', false); return; }
    resetSubmit.disabled = true;
    resetSubmit.textContent = '发送中…';
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + location.pathname
      });
      if (error) throw error;
      showResetMsg('重置邮件已发送，请到邮箱点击链接（若未收到，请检查垃圾邮件）。', true);
      resetSubmit.textContent = '重新发送';
    } catch (err){
      showResetMsg(err.message || '发送失败，请重试', false);
      resetSubmit.textContent = '发送重置邮件';
    } finally {
      resetSubmit.disabled = false;
    }
  } else {
    const pwd = resetNewPwd.value;
    if (!pwd || pwd.length < 6){ showResetMsg('密码至少 6 位', false); return; }
    resetSubmit.disabled = true;
    resetSubmit.textContent = '保存中…';
    try {
      const { error } = await sb.auth.updateUser({ password: pwd });
      if (error) throw error;
      showResetMsg('密码已更新！请返回登录页使用新密码登录。', true);
      resetSubmit.textContent = '已完成';
      setTimeout(() => {
        history.replaceState(null, '', location.pathname);
        go('login');
      }, 1600);
    } catch (err){
      showResetMsg(err.message || '修改失败，请重新获取重置链接', false);
      resetSubmit.disabled = false;
      resetSubmit.textContent = '保存新密码';
    }
  }
});

(function checkResetToken(){
  const hash = location.hash || '';
  const search = location.search || '';
  const hasRecovery = /type=recovery/.test(hash) || /type=recovery/.test(search);
  if (hasRecovery){
    resetMode = 'update';
    resetTitle.textContent = '设置新密码';
    resetSub.textContent   = '请输入你的新密码，提交后即可使用新密码登录。';
    resetEmailField.style.display = 'none';
    resetPwdField.style.display = '';
    resetSubmit.textContent = '保存新密码';
    resetMsg.className = 'auth-msg';
    go('reset');
  }
})();

/* ===================== 云同步 ===================== */
async function maybeUploadLocalData(){
  if (!currentUser) return;

  const keys = [
    PEOPLE_KEY, SONGS_KEY, PLACES_KEY, MEDIA_KEY, CAL_KEY, LEDGER_KEY,
    NOTES_KEY, TL_KEY, NOVELS_KEY, SLEEP_KEY, VITAL_KEY, EXER_KEY
  ];
  let localCount = 0;
  keys.forEach(k => {
    try { localCount += (JSON.parse(localStorage.getItem(k) || '[]').length); } catch(e){}
  });

  const tables = [
    'people','songs','places','medias','schedules','ledger',
    'notes','timeline_events','novels','sleep_records','vitals','exercises'
  ];
  let cloudCount = 0;
  for (const t of tables){
    const { count, error } = await sb
      .from(t)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);
    if (error){
      console.warn('[云同步] 探测 ' + t + ' 失败：', error);
      continue;
    }
    if (count) cloudCount += count;
  }

  if (localCount === 0 && cloudCount === 0){
    return;
  }

  if (localCount === 0){
    await loadAllFromCloud();
    showToast('已从云端拉取 ' + cloudCount + ' 条数据');
    return;
  }

  if (cloudCount === 0){
    await uploadLocalToCloud();
    showToast('本地 ' + localCount + ' 条数据已上传到云端');
    return;
  }

  const choice = confirm(
    '检测到本地与云端都有数据：\n\n' +
    '· 本地 ' + localCount + ' 条\n' +
    '· 云端 ' + cloudCount + ' 条\n\n' +
    '点【确定】→ 以【本地】为准，覆盖云端\n' +
    '点【取消】→ 以【云端】为准，覆盖本地\n\n' +
    '若这台设备不是你的主力设备，建议点【取消】。'
  );

  if (choice){
    await uploadLocalToCloud();
    showToast('已用本地数据覆盖云端');
  } else {
    await loadAllFromCloud();
    showToast('已用云端数据覆盖本地');
  }
}

async function loadAllFromCloud(){
  if (!currentUser) return;
  const uid = currentUser.id;

  const map = [
    ['people',          PEOPLE_KEY],
    ['songs',           SONGS_KEY],
    ['places',          PLACES_KEY],
    ['medias',          MEDIA_KEY],
    ['schedules',       CAL_KEY],
    ['ledger',          LEDGER_KEY],
    ['notes',           NOTES_KEY],
    ['timeline_events', TL_KEY],
    ['novels',          NOVELS_KEY],
    ['sleep_records',   SLEEP_KEY],
    ['vitals',          VITAL_KEY],
    ['exercises',       EXER_KEY],
  ];

  for (const [table, key] of map){
    const { data, error } = await sb
      .from(table)
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });

    if (error){
      console.warn('[拉取] ' + table + ' 失败：', error);
      continue;
    }
    if (!data) continue;

    const arr = data.map(r => {
      const o = { ...r };
      if (table === 'places'){
        o.desc = o.desc_text; delete o.desc_text;
      }
      if (table === 'medias'){
        o.desc = o.desc_text;
        o.cast = o.cast_text;
        delete o.desc_text;
        delete o.cast_text;
      }
      return o;
    });

    localStorage.setItem(key, JSON.stringify(arr));
  }

  const novelsArr = JSON.parse(localStorage.getItem(NOVELS_KEY) || '[]');
  if (novelsArr.length){
    const novelIds = novelsArr.map(n => n.id).filter(Boolean);
    const { data: chData, error: chErr } = await sb
      .from('novel_chapters')
      .select('*')
      .in('novel_id', novelIds)
      .order('order_index', { ascending: true });

    if (!chErr && chData){
      const localCh = loadChaptersLocal();
      const cloudNovelIds = new Set(novelIds.map(String));
      const keptLocal = localCh.filter(c => !cloudNovelIds.has(String(c.novel_id)));
      const merged = keptLocal.concat(chData);
      saveChaptersLocal(merged);
    }
  }

  loadPeople();     renderPeople();
  loadSongs();      renderSongs();
  loadPlaces();     renderPlaces();
  loadMedias();     renderMedias();
  loadSchedules();  renderCalendar();
  loadLedger();     renderLedger();
  loadNotes();      renderNotes();
  loadTimeline();
  loadNovels();     renderNovelList();

  loadSleep();      renderSleepList(); renderSleepChart();
  loadVitals();     renderVitalList();
  loadExercise();   renderExerciseList();

  updateStorageUsage();
}

async function uploadLocalToCloud(){
  if (!currentUser) return;
  const uid = currentUser.id;

  const map = [
    ['people',          PEOPLE_KEY],
    ['songs',           SONGS_KEY],
    ['places',          PLACES_KEY],
    ['medias',          MEDIA_KEY],
    ['schedules',       CAL_KEY],
    ['ledger',          LEDGER_KEY],
    ['notes',           NOTES_KEY],
    ['timeline_events', TL_KEY],
    ['novels',          NOVELS_KEY],
    ['sleep_records',   SLEEP_KEY],
    ['vitals',          VITAL_KEY],
    ['exercises',       EXER_KEY],
  ];

  for (const [table, key] of map){
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ arr = []; }

    if (!arr.length) continue;

    const { error: delErr } = await sb.from(table).delete().eq('user_id', uid);
    if (delErr){
      console.error('[上传] 清空 ' + table + ' 失败，已跳过本表：', delErr);
      showToast('⚠️ ' + table + ' 云端清空失败，请检查 RLS 删除策略');
      continue;
    }

    const rows = arr.map(x => {
      const { id, ...rest } = x;
      if (table === 'places'){
        rest.desc_text = rest.desc; delete rest.desc;
      }
      if (table === 'medias'){
        rest.desc_text = rest.desc;
        rest.cast_text = rest.cast;
        delete rest.desc;
        delete rest.cast;
      }
      return { ...rest, user_id: uid };
    });

    const { error: insErr } = await sb.from(table).insert(rows);
    if (insErr){
      console.error('[上传] 写入 ' + table + ' 失败：', insErr);
      showToast('⚠️ ' + table + ' 写入失败');
    }
  }

  const localChapters = loadChaptersLocal();
  if (localChapters.length){
    const { error: chDelErr } = await sb.from('novel_chapters').delete().eq('user_id', uid);
    if (chDelErr){
      console.error('[上传] 清空 novel_chapters 失败：', chDelErr);
    } else {
      const { data: cloudNovels } = await sb
        .from('novels')
        .select('id, title')
        .eq('user_id', uid);

      const titleToCloudId = {};
      (cloudNovels || []).forEach(n => { titleToCloudId[n.title] = n.id; });

      const localNovels = JSON.parse(localStorage.getItem(NOVELS_KEY) || '[]');
      const localIdToTitle = {};
      localNovels.forEach(n => { localIdToTitle[String(n.id)] = n.title; });

      const chRows = localChapters.map(c => {
        const localNovelId = String(c.novel_id);
        const title = localIdToTitle[localNovelId];
        const cloudNovelId = titleToCloudId[title];
        if (!cloudNovelId) return null;

        const { id, novel_id, ...rest } = c;
        return { ...rest, novel_id: cloudNovelId, user_id: uid };
      }).filter(Boolean);

      if (chRows.length){
        const { error: chInsErr } = await sb.from('novel_chapters').insert(chRows);
        if (chInsErr) console.error('[上传] 写入 novel_chapters 失败：', chInsErr);
      }
    }
  }

  await loadAllFromCloud();
}

document.getElementById('uploadLocalBtn').addEventListener('click', async () => {
  if (!currentUser){ showToast('请先登录'); return; }
  if (!confirm(
    '将用【本地数据】覆盖云端：\n\n' +
    '· 云端同类数据会被先删除，再写入本地数据\n' +
    '· 本地为空的表不会动云端\n\n' +
    '确定继续吗？'
  )) return;
  await uploadLocalToCloud();
  showToast('已用本地数据覆盖云端');
});

document.getElementById('pullCloudBtn').addEventListener('click', async () => {
  if (!currentUser){ showToast('请先登录'); return; }
  if (!confirm(
    '将用【云端数据】覆盖本地：\n\n' +
    '· 本地缓存会被云端数据替换\n' +
    '· 未上传到云端的本地改动会丢失\n\n' +
    '确定继续吗？'
  )) return;
  await loadAllFromCloud();
  showToast('已从云端拉取');
});

sb.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null;
  updateAuthUI();
  if (currentUser && typeof loadExerProfile === 'function') loadExerProfile();
});
sb.auth.getSession().then(({ data }) => {
  currentUser = data.session?.user || null;
  updateAuthUI();
  if (currentUser && typeof loadExerProfile === 'function') loadExerProfile();
});

/* ===================== 存储用量 & 图片压缩 ===================== */
function updateStorageUsage(){
  let total = 0;
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('suidou-')) {
        total += (localStorage.getItem(k) || '').length * 2 + k.length * 2;
      }
    });
  } catch(e){}
  const kb = total/1024;
  const el = document.getElementById('storageUsage');
  const bar = document.getElementById('storageBar');
  if (el) el.textContent = kb < 1024 ? kb.toFixed(1) + ' KB' : (kb/1024).toFixed(2) + ' MB';
  if (bar) bar.style.width = Math.min(100, (kb/5120)*100) + '%';
}
function compressImage(file, maxSize, quality, cb){
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > h && w > maxSize) { h = Math.round(h*maxSize/w); w = maxSize; }
      else if (h > maxSize)     { w = Math.round(w*maxSize/h); h = maxSize; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
      ctx.drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => cb(e.target.result);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
async function cloudInsert(table, row){
  if (!currentUser) throw new Error('未登录');
  const { data, error } = await sb.from(table).insert({ ...row, user_id: currentUser.id }).select().single();
  if (error) throw error;
  return data;
}
async function cloudDelete(table, id){
  if (!currentUser) throw new Error('未登录');
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) throw error;
}
async function cloudUpdate(table, id, patch){
  if (!currentUser) throw new Error('未登录');
  const { error } = await sb.from(table).update(patch).eq('id', id);
  if (error) throw error;
}

updateStorageUsage();

/* ============================================================
   文章分析
   ============================================================ */
document.querySelectorAll('#page-textanalysis .ta-subtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#page-textanalysis .ta-subtab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.ta;
    document.querySelectorAll('#page-textanalysis .ta-subpage').forEach(p => p.classList.toggle('active', p.dataset.taPage === target));
    if (target === 'wordcount') updateWC();
    if (target === 'wordfreq')  updateWordFreq();
  });
});

const wcText = document.getElementById('wcText');
const SAMPLE_TEXT = `夜色像一块被浸透的墨玉，沉沉地压在长街尽头。
她提着灯笼走过石桥，脚下是碎了一地的月光。

"你终于来了。"桥那头的人开口，声音比晚风还轻。
她没有回答，只是把灯笼举高了些，让光落在他脸上——
那是一张她描摹过千百遍，却从未真正看清的脸。`;

function updateWC(){
  if (!wcText) return;
  const t = wcText.value;
  const total   = t.length;
  const noSpace = t.replace(/\s/g,'').length;
  const chinese = (t.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g) || []).length;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  const digits  = (t.match(/[0-9]/g) || []).length;
  const punct   = Math.max(0, noSpace - chinese - letters - digits);
  const lines   = t ? t.split('\n').length : 0;
  const paras   = t.split('\n').filter(s => s.trim().length > 0).length;
  const readMin = Math.ceil((chinese + letters + digits) / 400);
  document.getElementById('wc-total').textContent   = total;
  document.getElementById('wc-nospace').textContent = noSpace;
  document.getElementById('wc-chinese').textContent = chinese;
  document.getElementById('wc-letter').textContent  = letters + digits;
  document.getElementById('wc-punct').textContent   = punct;
  document.getElementById('wc-para').textContent    = paras;
  document.getElementById('wc-line').textContent    = lines;
  document.getElementById('wc-read').textContent    = readMin;
}
wcText.addEventListener('input', () => { updateWC(); updateWordFreq(); });
document.getElementById('wcClear').addEventListener('click', () => { wcText.value=''; updateWC(); updateWordFreq(); });
document.getElementById('wcSample').addEventListener('click', () => { wcText.value = SAMPLE_TEXT; updateWC(); updateWordFreq(); });
updateWC();

const wfText = document.getElementById('wfText');
const wfRanking = document.getElementById('wfRanking');
const wfCloud = document.getElementById('wfCloud');
const wfTotalEl = document.getElementById('wfTotal');
const wfTopEl = document.getElementById('wfTop');
const wfStopEl = document.getElementById('wfStop');

const STOP_WORDS = new Set(('的 了 是 在 我 有 和 就 不 人 都 一 一个 上 也 很 到 说 要 去 你 会 着 没有 看 好 自己 这 那 他 她 它 我们 你们 他们 这个 那个 之 与其 因为 所以 但是 而且 如果 虽然 然而 于是 因此 可以 一个 一些 什么 怎么 为什么 时候 现在 已经 还没有 就是 还是 只是 不是 这样 那样 一样 那些 这些 这里 那里 起来 出来 过来 下来 上来 里面 外面 上面 下面 前面 后面 左右 东西 事情 问题 方法 地方 时间 样子 感觉 觉得 知道 认为 希望 想要 需要 应该 必须 可能 也许 大概 差不多 几乎 非常 特别 十分 有点 一点 一下 一直 从来 曾经 未来 过去 之后 之前 以后 以前 今天 明天 昨天 早上 中午 晚上 深夜 凌晨 '
).split(/\s+/).filter(Boolean));

function extractWords(text){
  const words = [];
  const cn = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  cn.forEach(seg => {
    for (let i = 0; i < seg.length - 1; i++){
      const w = seg.slice(i, i + 2);
      if (!STOP_WORDS.has(w)) words.push(w);
    }
    for (let i = 0; i < seg.length - 2; i++){
      const w = seg.slice(i, i + 3);
      if (!STOP_WORDS.has(w)) words.push(w);
    }
  });
  const en = text.toLowerCase().match(/[a-z][a-z0-9]{2,}/g) || [];
  en.forEach(w => { if (!STOP_WORDS.has(w)) words.push(w); });
  return words;
}

function updateWordFreq(){
  if (!wfText) return;
  const raw = wfText.value.trim();
  if (!raw){
    wfRanking.innerHTML = '<p class="empty">还没有分析结果，请在上方输入文字～</p>';
    wfCloud.innerHTML = '';
    wfTotalEl.textContent = '0';
    return;
  }
  const filterStop = wfStopEl.checked;
  let words = extractWords(raw);
  if (!filterStop){
    const cn = raw.match(/[\u4e00-\u9fa5]/g) || [];
    cn.forEach(c => words.push(c));
  }
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const arr = Object.entries(freq).map(([word, count]) => ({ word, count }))
    .sort((a,b) => b.count - a.count);

  wfTotalEl.textContent = arr.length;

  const topN = Math.max(5, Math.min(100, parseInt(wfTopEl.value) || 20));
  const top = arr.slice(0, topN);
  const maxCount = top.length ? top[0].count : 1;

  if (!top.length){
    wfRanking.innerHTML = '<p class="empty">没有可统计的词。</p>';
    wfCloud.innerHTML = '';
    return;
  }

  wfRanking.innerHTML = top.map(d => {
    const pct = Math.max(2, (d.count / maxCount) * 100);
    return '<div class="wf-bar-row">' +
      '<div class="wf-bar-word" title="' + esc(d.word) + '">' + esc(d.word) + '</div>' +
      '<div class="wf-bar-track"><div class="wf-bar-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="wf-bar-count">' + d.count + '</div>' +
    '</div>';
  }).join('');

  const colors = ['#737b84','#8ba6c0','#8fb59a','#c8a468','#c17878','#a69bbf','#c996ad','#5f676f','#9aa2ab','#6f7680'];
  const cloudTop = arr.slice(0, 60);
  const cloudMax = cloudTop.length ? cloudTop[0].count : 1;
  wfCloud.innerHTML = cloudTop.map((d, i) => {
    const size = 12 + Math.round((d.count / cloudMax) * 22);
    const color = colors[i % colors.length];
    return '<span style="font-size:' + size + 'px;font-weight:700;color:' + color + ';cursor:pointer;transition:.15s;" ' +
      'title="' + d.count + ' 次" data-wfword="' + esc(d.word) + '">' + esc(d.word) + '</span>';
  }).join('');
}

wfText.addEventListener('input', updateWordFreq);
wfTopEl.addEventListener('change', updateWordFreq);
wfStopEl.addEventListener('change', updateWordFreq);
document.getElementById('wfClear').addEventListener('click', () => {
  wfText.value = ''; updateWordFreq();
});
document.getElementById('wfSample').addEventListener('click', () => {
  wfText.value = SAMPLE_TEXT;
  wfText.value += '\n\n' + SAMPLE_TEXT;
  wfText.value += '\n\n月光下，长街尽头，石桥上，灯笼的光落在那张脸上，她描摹过千百遍，却从未真正看清。';
  updateWordFreq();
});

/* ============================================================
   我的记账本
   ============================================================ */
let ledger = [];
const CURRENCY_SYMBOLS = {
  CNY:'¥', USD:'$', EUR:'€', GBP:'£', JPY:'¥', HKD:'HK$', KRW:'₩',
  RUB:'₽', AUD:'A$', CAD:'C$', CHF:'Fr', SGD:'S$', TWD:'NT$'
};

function saveLedger(){ try { localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadLedger(){
  try { const raw = localStorage.getItem(LEDGER_KEY); if (raw) ledger = JSON.parse(raw) || []; } catch(e){ ledger = []; }
  renderLedger();
}

document.getElementById('ldTodayBtn').addEventListener('click', () => {
  const d = new Date();
  document.getElementById('ldDate').value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
});
(function fillLedgerDate(){
  const d = new Date();
  const el = document.getElementById('ldDate');
  if (el) el.value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
})();

function fmtMoney(amount, currency){
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  const num = Number(amount);
  if (!isFinite(num)) return sym + ' ' + amount;
  return sym + ' ' + num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

document.getElementById('ldAdd').addEventListener('click', async () => {
  const date = document.getElementById('ldDate').value.trim();
  const content = document.getElementById('ldContent').value.trim();
  const amountRaw = document.getElementById('ldAmount').value.trim();
  const currency = document.getElementById('ldCurrency').value;
  if (!date){ alert('请填写日期～'); return; }
  if (!content){ alert('请填写消费内容～'); return; }
  if (!amountRaw){ alert('请填写金额～'); return; }
  const amount = parseFloat(amountRaw);
  if (!isFinite(amount)){ alert('金额必须是数字'); return; }

  const data = { date, content, amount, currency };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('ledger', data);
      ledger.push(row);
    } else {
      ledger.push({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() });
      if (!saveLedger()){ ledger.pop(); return; }
    }
    document.getElementById('ldContent').value = '';
    document.getElementById('ldAmount').value = '';
    renderLedger();
    showToast('已记录：' + content + ' ' + fmtMoney(amount, currency));
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('ldReset').addEventListener('click', () => {
  document.getElementById('ldContent').value = '';
  document.getElementById('ldAmount').value = '';
  document.getElementById('ldCurrency').value = 'CNY';
  const d = new Date();
  document.getElementById('ldDate').value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
});

document.getElementById('ldClearAll').addEventListener('click', async () => {
  if (ledger.length === 0) return;
  if (!confirm('确定清空全部记账记录吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('ledger').delete().eq('user_id', currentUser.id);
    ledger = [];
    try { localStorage.removeItem(LEDGER_KEY); } catch(e){}
    renderLedger(); showToast('记账数据已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

document.getElementById('ldExportCsv').addEventListener('click', () => {
  if (ledger.length === 0){ showToast('还没有记账记录'); return; }
  const sorted = ledger.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  const header = '日期,消费内容,金额,货币\n';
  const rows = sorted.map(r => {
    const content = String(r.content || '').replace(/,/g, '，').replace(/\n/g, ' ');
    return [r.date || '', content, r.amount || 0, r.currency || 'CNY'].join(',');
  }).join('\n');
  const csv = '\ufeff' + header + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '我的记账本_' + timeStamp(new Date()) + '.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
  showToast('已导出 CSV（可用 Excel 打开）');
});

function renderLedger(){
  const list = document.getElementById('ldList');
  const countEl = document.getElementById('ldCount');
  if (!list) return;

  const sorted = ledger.slice().sort((a, b) => {
    const d = String(b.date || '').localeCompare(String(a.date || ''));
    if (d !== 0) return d;
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });

  if (countEl) countEl.textContent = sorted.length;

  const now = new Date();
  const thisMonthPrefix = now.getFullYear() + '-' + pad2(now.getMonth()+1);
  const todayStr = now.getFullYear() + '-' + pad2(now.getMonth()+1) + '-' + pad2(now.getDate());
  const monthByCur = {};
  const todayByCur = {};
  sorted.forEach(r => {
    const cur = r.currency || 'CNY';
    const amt = Number(r.amount) || 0;
    if ((r.date || '').startsWith(thisMonthPrefix)){
      monthByCur[cur] = (monthByCur[cur] || 0) + amt;
    }
    if ((r.date || '') === todayStr){
      todayByCur[cur] = (todayByCur[cur] || 0) + amt;
    }
  });
  const monthText = Object.keys(monthByCur).length
    ? Object.entries(monthByCur).map(([c, v]) => fmtMoney(v, c)).join('  ·  ')
    : '暂无';
  const todayText = Object.keys(todayByCur).length
    ? Object.entries(todayByCur).map(([c, v]) => fmtMoney(v, c)).join('  ·  ')
    : '暂无';
  document.getElementById('ldThisMonth').textContent = monthText;
  document.getElementById('ldToday').textContent = todayText;
  document.getElementById('ldTotalCount').textContent = sorted.length;

  if (sorted.length === 0){
    list.innerHTML = '<p class="empty">还没有记账记录，先在上方添加一笔吧～</p>';
    return;
  }

  let html = '';
  let lastMonth = '';
  sorted.forEach(r => {
    const monthKey = (r.date || '').slice(0, 7);
    if (monthKey && monthKey !== lastMonth){
      const monthSum = {};
      sorted.filter(x => (x.date || '').startsWith(monthKey)).forEach(x => {
        const c = x.currency || 'CNY';
        monthSum[c] = (monthSum[c] || 0) + (Number(x.amount) || 0);
      });
      const sumText = Object.entries(monthSum).map(([c, v]) => fmtMoney(v, c)).join(' · ');
      html += '<div class="ld-month-head">' + monthKey + '　合计：' + sumText + '</div>';
      lastMonth = monthKey;
    }
    html += '<div class="ld-item">' +
      '<span class="ld-item-date">' + esc(r.date || '—') + '</span>' +
      '<span class="ld-item-content">' + esc(r.content || '') + '</span>' +
      '<span class="ld-item-amount">' + fmtMoney(r.amount, r.currency || 'CNY') + '</span>' +
      '<button class="ld-item-del" data-ldel="' + r.id + '" title="删除">✕</button>' +
    '</div>';
  });
  list.innerHTML = html;

  list.querySelectorAll('[data-ldel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.ldel;
      const t = ledger.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除「' + t.content + ' ' + fmtMoney(t.amount, t.currency || 'CNY') + '」吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('ledger', id);
        ledger = ledger.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveLedger();
        renderLedger();
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}

/* ============================================================
   数学计算（计算器 + 单位换算；鞋码已迁至健康管理）
   ============================================================ */
document.querySelectorAll('#page-calc .ta-subtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#page-calc .ta-subtab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.mc;
    document.querySelectorAll('#page-calc .ta-subpage').forEach(p => p.classList.toggle('active', p.dataset.mcPage === target));
    if (target === 'unit') updateUnitConvert();
  });
});

let calcExpr = '', calcError = false, calcExpert = false, calcDeg = true;
const calcDisplay = document.getElementById('calcDisplay');
const gridNormal  = document.getElementById('calcGridNormal');
const gridExpert  = document.getElementById('calcGridExpert');
const modeLabel   = document.getElementById('calcModeLabel');
const modeToggle  = document.getElementById('calcModeToggle');
const degBtn      = document.getElementById('degBtn');

function updateCalcDisplay(){ calcDisplay.textContent = calcExpr === '' ? '0' : calcExpr; }
function updateDegBtn(){ if (degBtn) degBtn.textContent = calcDeg ? 'DEG' : 'RAD'; }

modeToggle.addEventListener('click', () => {
  calcExpert = !calcExpert;
  gridNormal.style.display = calcExpert ? 'none' : 'grid';
  gridExpert.style.display = calcExpert ? 'grid' : 'none';
  modeLabel.textContent = calcExpert ? '当前：专家模式' : '当前：普通模式';
  modeToggle.textContent = calcExpert ? '切换到普通模式' : '切换到专家模式';
  calcExpr = ''; calcError = false; updateCalcDisplay();
});

function toJsExpr(s){
  return s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')
    .replace(/π/g,'PI').replace(/√\(/g,'SQRT(')
    .replace(/asin\(/g,'ASIN(').replace(/acos\(/g,'ACOS(').replace(/atan\(/g,'ATAN(')
    .replace(/sin\(/g,'SIN(').replace(/cos\(/g,'COS(').replace(/tan\(/g,'TAN(')
    .replace(/\^/g,'**').replace(/%/g,'/100');
}
function buildScope(){
  const d = calcDeg;
  return {
    PI: Math.PI,
    SIN: x => Math.sin(d ? x*Math.PI/180 : x),
    COS: x => Math.cos(d ? x*Math.PI/180 : x),
    TAN: x => Math.tan(d ? x*Math.PI/180 : x),
    ASIN: x => d ? Math.asin(x)*180/Math.PI : Math.asin(x),
    ACOS: x => d ? Math.acos(x)*180/Math.PI : Math.acos(x),
    ATAN: x => d ? Math.atan(x)*180/Math.PI : Math.atan(x),
    SQRT: Math.sqrt, LOG: Math.log10, LN: Math.log
  };
}
function doEval(){
  const raw = calcExpr.trim();
  if (!raw) return;
  const e = toJsExpr(raw);
  if (!/^[0-9+\-*/(). A-Za-z]*$/.test(e)) { calcDisplay.textContent = '格式错误'; calcError = true; calcExpr = ''; return; }
  try {
    const scope = buildScope();
    const names = Object.keys(scope);
    const fn = new Function(...names, '"use strict";return (' + e + ');');
    const val = fn(...names.map(n => scope[n]));
    if (typeof val !== 'number' || !isFinite(val)) throw new Error('bad');
    calcExpr = String(parseFloat(val.toPrecision(12)));
    calcError = false;
  } catch (err) { calcDisplay.textContent = '计算错误'; calcError = true; calcExpr = ''; return; }
  updateCalcDisplay();
}
function handleCalc(v){
  if (calcError && v !== 'C' && v !== 'back') { calcExpr = ''; calcError = false; }
  if (v === 'C') calcExpr = '';
  else if (v === 'back') calcExpr = calcExpr.slice(0,-1);
  else if (v === 'DEG') { calcDeg = !calcDeg; updateDegBtn(); return; }
  else if (v === '=') { doEval(); return; }
  else calcExpr += v;
  updateCalcDisplay();
}
document.querySelectorAll('.calc-btn').forEach(btn => {
  btn.addEventListener('click', () => handleCalc(btn.dataset.value));
});
document.addEventListener('keydown', e => {
  const calcPage = document.getElementById('page-calc');
  if (!calcPage || !calcPage.classList.contains('active')) return;
  const calcSub = document.querySelector('#page-calc .ta-subpage[data-mc-page="calc"]');
  if (!calcSub || !calcSub.classList.contains('active')) return;
  const tag = (e.target && e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  const k = e.key;
  if (/^[0-9]$/.test(k)) handleCalc(k);
  else if (k === '+') handleCalc('+');
  else if (k === '-') handleCalc('−');
  else if (k === '*') handleCalc('×');
  else if (k === '/') { e.preventDefault(); handleCalc('÷'); }
  else if (k === '(' || k === ')' || k === '.' || k === '%') handleCalc(k);
  else if (k === '^') handleCalc('^');
  else if (k === 'Enter' || k === '=') { e.preventDefault(); handleCalc('='); }
  else if (k === 'Backspace') { e.preventDefault(); handleCalc('back'); }
  else if (k === 'Escape') handleCalc('C');
});
updateCalcDisplay(); updateDegBtn();

/* 单位换算 */
const UNIT_TABLE = {
  length: { units: { '米':1, '千米':1000, '分米':0.1, '厘米':0.01, '毫米':0.001, '微米':1e-6, '英里':1609.344, '英尺':0.3048, '英寸':0.0254, '码':0.9144, '海里':1852, '市里':500, '市尺':1/3, '市寸':1/30 } },
  weight: { units: { '千克':1, '克':0.001, '毫克':1e-6, '吨':1000, '磅':0.45359237, '盎司':0.028349523125, '斤':0.5, '两':0.05, '钱':0.005, '英石':6.35029318 } },
  area:   { units: { '平方米':1, '平方千米':1e6, '公顷':10000, '平方分米':0.01, '平方厘米':1e-4, '平方毫米':1e-6, '亩':2000/3, '平方英尺':0.09290304, '平方英寸':0.00064516, '英亩':4046.8564224, '平方英里':2589988.110336 } },
  volume: { units: { '升':1, '毫升':0.001, '立方米':1000, '立方分米':1, '立方厘米':0.001, '加仑(美)':3.785411784, '加仑(英)':4.54609, '品脱(美)':0.473176473, '液量盎司(美)':0.0295735295625, '立方英尺':28.316846592, '立方英寸':0.016387064 } },
  temperature: { units: { '摄氏度(°C)':1, '华氏度(°F)':1, '开尔文(K)':1 } },
  time:   { units: { '秒':1, '毫秒':0.001, '微秒':1e-6, '分钟':60, '小时':3600, '天':86400, '周':604800, '月(30天)':2592000, '年(365天)':31536000 } },
  speed:  { units: { '米/秒':1, '千米/时':1/3.6, '英里/时':0.44704, '节':0.514444444, '英尺/秒':0.3048, '马赫(海平面)':340.29 } },
  data:   { units: { '比特(bit)':0.125, '字节(B)':1, '千字节(KB)':1024, '兆字节(MB)':1048576, '吉字节(GB)':1073741824, '太字节(TB)':1099511627776, '拍字节(PB)':1125899906842624 } }
};

const ucCategory = document.getElementById('ucCategory');
const ucFrom     = document.getElementById('ucFrom');
const ucTo       = document.getElementById('ucTo');
const ucValue    = document.getElementById('ucValue');
const ucResult   = document.getElementById('ucResult');

function fmtNum(n){
  if (typeof n !== 'number' || !isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-9) return n.toExponential(6);
  return String(parseFloat(n.toPrecision(12)));
}

function convertTemp(v, from, to){
  let c;
  if (from === '摄氏度(°C)') c = v;
  else if (from === '华氏度(°F)') c = (v - 32) * 5 / 9;
  else c = v - 273.15;
  if (to === '摄氏度(°C)') return c;
  if (to === '华氏度(°F)') return c * 9 / 5 + 32;
  return c + 273.15;
}

function convertUnit(v, cat, from, to){
  if (cat === 'temperature') return convertTemp(v, from, to);
  const units = UNIT_TABLE[cat].units;
  return (v * units[from]) / units[to];
}

function fillUnitSelects(){
  const cat = ucCategory.value;
  const units = Object.keys(UNIT_TABLE[cat].units);
  const prevFrom = ucFrom.value, prevTo = ucTo.value;
  ucFrom.innerHTML = units.map(u => '<option value="' + u + '">' + u + '</option>').join('');
  ucTo.innerHTML   = units.map(u => '<option value="' + u + '">' + u + '</option>').join('');
  ucFrom.value = units.includes(prevFrom) ? prevFrom : units[0];
  ucTo.value   = units.includes(prevTo)   ? prevTo   : (units[1] || units[0]);
  updateUnitConvert();
}

function updateUnitConvert(){
  if (!ucResult) return;
  const cat = ucCategory.value;
  const raw = ucValue.value.trim();
  const v = parseFloat(raw);
  if (raw === '' || !isFinite(v)){
    ucResult.innerHTML =
      '<div class="mc-res-label">换算结果</div>' +
      '<div class="mc-res-value">—</div>' +
      '<div class="mc-res-sub">请输入要换算的数值</div>';
    return;
  }
  const from = ucFrom.value, to = ucTo.value;
  const out = convertUnit(v, cat, from, to);
  ucResult.innerHTML =
    '<div class="mc-res-label">' + esc(from) + ' → ' + esc(to) + '</div>' +
    '<div class="mc-res-value">' + esc(fmtNum(out)) +
      ' <span style="font-size:17px;font-weight:600;opacity:.9;">' + esc(to) + '</span></div>' +
    '<div class="mc-res-sub">' + esc(fmtNum(v)) + ' ' + esc(from) + ' = ' + esc(fmtNum(out)) + ' ' + esc(to) + '</div>';
}

ucCategory.addEventListener('change', fillUnitSelects);
ucFrom.addEventListener('change', updateUnitConvert);
ucTo.addEventListener('change', updateUnitConvert);
ucValue.addEventListener('input', updateUnitConvert);
document.getElementById('ucSwap').addEventListener('click', () => {
  const a = ucFrom.value;
  ucFrom.value = ucTo.value;
  ucTo.value = a;
  updateUnitConvert();
});
document.getElementById('ucReset').addEventListener('click', () => {
  ucValue.value = '1';
  ucCategory.value = 'length';
  fillUnitSelects();
});
fillUnitSelects();

/* ============================================================
   常见统计图生成
   ============================================================ */
const COLORS = ['#737b84','#8ba6c0','#8fb59a','#c8a468','#c17878','#a69bbf'];
let chartType = 'bar';
const chartDataEl = document.getElementById('chartData');
const chartCanvas = document.getElementById('chartCanvas');

document.querySelectorAll('.chart-type').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.chart-type').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); chartType = b.dataset.type; renderChart();
  });
});
document.getElementById('chartClear').addEventListener('click', () => { chartDataEl.value=''; renderChart(); });
chartDataEl.addEventListener('input', renderChart);

function parseChartData(text){
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  const out = [];
  lines.forEach((line, i) => {
    const m = line.match(/^(.*?)[\s,，、\t]+(-?\d+(?:\.\d+)?)$/);
    if (m) out.push({ label: m[1].trim() || ('项目'+(i+1)), value: parseFloat(m[2]) });
    else { const n = parseFloat(line); if (!isNaN(n)) out.push({ label:'项目'+(i+1), value:n }); }
  });
  return out;
}
function niceMax(v){
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v)), base = Math.pow(10, exp), n = v/base;
  let m; if (n<=1) m=1; else if (n<=2) m=2; else if (n<=2.5) m=2.5; else if (n<=5) m=5; else m=10;
  return m*base;
}
function formatNum(v){ return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/,'').replace(/\.$/,''); }
function shade(hex, amt){
  amt = amt===undefined?0.18:amt;
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=Math.round(r*(1-amt)); g=Math.round(g*(1-amt)); b=Math.round(b*(1-amt));
  return 'rgb('+r+','+g+','+b+')';
}
function roundRect(ctx,x,y,w,h,r){
  r=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function drawAxisLabels(ctx,text,cx,y,slot){
  ctx.save(); ctx.font='12px sans-serif'; ctx.fillStyle='#6f7680';
  const maxW = slot-8;
  if (ctx.measureText(text).width > maxW){
    ctx.translate(cx,y+4); ctx.rotate(-Math.PI/6);
    ctx.textAlign='right'; ctx.textBaseline='middle'; ctx.fillText(text,0,0);
  } else { ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText(text,cx,y); }
  ctx.restore();
}
function setupCanvas(wrap,height){
  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max(280, wrap.clientWidth-20), cssH = height;
  chartCanvas.style.width = cssW+'px'; chartCanvas.style.height = cssH+'px';
  chartCanvas.width = Math.round(cssW*dpr); chartCanvas.height = Math.round(cssH*dpr);
  const ctx = chartCanvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,cssW,cssH);
  return { ctx, w:cssW, h:cssH };
}
function renderChart(){
  const data = parseChartData(chartDataEl.value);
  const wrap = document.getElementById('chartWrap');
  if (!wrap.offsetWidth) return;
  const { ctx, w, h } = setupCanvas(wrap,420);
  if (data.length === 0){
    ctx.fillStyle='#b0b6c4'; ctx.font='15px sans-serif'; ctx.textAlign='center';
    ctx.fillText('请输入数据，例如：第一章,3200', w/2, h/2); return;
  }
  if (chartType==='bar') drawBar(ctx,w,h,data);
  else if (chartType==='line') drawLine(ctx,w,h,data);
  else drawPie(ctx,w,h,data);
}
function drawBar(ctx,w,h,data){
  const pad={l:58,r:24,t:34,b:76}, pw=w-pad.l-pad.r, ph=h-pad.t-pad.b;
  const vals=data.map(d=>d.value), maxV=Math.max(...vals,0), minV=Math.min(...vals,0);
  const axisMax=niceMax(maxV||1), axisMin=minV<0?-niceMax(-minV):0;
  const range=(axisMax-axisMin)||1, y=v=>pad.t+ph-(v-axisMin)/range*ph;
  const ticks=5; ctx.font='12px sans-serif'; ctx.textAlign='right'; ctx.textBaseline='middle';
  for(let i=0;i<=ticks;i++){
    const v=axisMin+range*i/ticks, yy=y(v);
    ctx.strokeStyle='#eef0f5'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad.l,yy); ctx.lineTo(pad.l+pw,yy); ctx.stroke();
    ctx.fillStyle='#9aa1b1'; ctx.fillText(formatNum(Math.round(v*100)/100), pad.l-8, yy);
  }
  const slot=pw/data.length, bw=Math.min(slot*0.58,72);
  data.forEach((d,i)=>{
    const cx=pad.l+slot*i+slot/2, yTop=y(Math.max(d.value,0)), yBottom=y(Math.min(d.value,0));
    const bh=Math.max(2,yBottom-yTop), c=COLORS[i%COLORS.length];
    ctx.fillStyle=c; roundRect(ctx,cx-bw/2,yTop,bw,bh,6); ctx.fill();
    ctx.fillStyle=shade(c,0.06); roundRect(ctx,cx-bw/2,yTop,bw,Math.min(bh,4),3); ctx.fill();
    ctx.fillStyle='#4b5563'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(formatNum(d.value), cx, yTop-5);
    drawAxisLabels(ctx,d.label,cx,pad.t+ph+14,slot);
  });
  ctx.strokeStyle='#d9dce6'; ctx.lineWidth=1; ctx.beginPath();
  ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+ph); ctx.lineTo(pad.l+pw,pad.t+ph); ctx.stroke();
}
function drawLine(ctx,w,h,data){
  const pad={l:58,r:24,t:34,b:76}, pw=w-pad.l-pad.r, ph=h-pad.t-pad.b;
  const vals=data.map(d=>d.value), maxV=Math.max(...vals,0), minV=Math.min(...vals,0);
  const axisMax=niceMax(maxV||1), axisMin=minV<0?-niceMax(-minV):0;
  const range=(axisMax-axisMin)||1, y=v=>pad.t+ph-(v-axisMin)/range*ph;
  const slot=pw/Math.max(data.length,1);
  const x=i=>pad.l+(data.length===1?pw/2:slot*i+slot/2);
  const ticks=5; ctx.font='12px sans-serif'; ctx.textAlign='right'; ctx.textBaseline='middle';
  for(let i=0;i<=ticks;i++){
    const v=axisMin+range*i/ticks, yy=y(v);
    ctx.strokeStyle='#eef0f5'; ctx.beginPath(); ctx.moveTo(pad.l,yy); ctx.lineTo(pad.l+pw,yy); ctx.stroke();
    ctx.fillStyle='#9aa1b1'; ctx.fillText(formatNum(Math.round(v*100)/100), pad.l-8, yy);
  }
  ctx.beginPath();
  data.forEach((d,i)=>{ const px=x(i),py=y(d.value); if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); });
  ctx.strokeStyle='#737b84'; ctx.lineWidth=2.4; ctx.lineJoin='round'; ctx.stroke();
  ctx.lineTo(x(data.length-1), y(axisMin)); ctx.lineTo(x(0), y(axisMin)); ctx.closePath();
  ctx.fillStyle='rgba(115,123,132,.12)'; ctx.fill();
  data.forEach((d,i)=>{
    const px=x(i), py=y(d.value);
    ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
    ctx.lineWidth=2.4; ctx.strokeStyle='#737b84'; ctx.stroke();
    ctx.fillStyle='#4b5563'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(formatNum(d.value), px, py-10);
    drawAxisLabels(ctx,d.label,px,pad.t+ph+14,slot);
  });
  ctx.strokeStyle='#d9dce6'; ctx.lineWidth=1; ctx.beginPath();
  ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+ph); ctx.lineTo(pad.l+pw,pad.t+ph); ctx.stroke();
}
function drawPie(ctx,w,h,data){
  const positives=data.map(d=>Math.max(d.value,0)), total=positives.reduce((a,b)=>a+b,0);
  if (total<=0){ ctx.fillStyle='#b0b6c4'; ctx.font='15px sans-serif'; ctx.textAlign='center'; ctx.fillText('饼图需要正数数据', w/2, h/2); return; }
  const cx = w<620 ? w/2 : w*0.32, cy=h/2;
  const R = Math.max(60, Math.min(w<620?w*0.34:w*0.26, h/2-50));
  let start=-Math.PI/2;
  data.forEach((d,i)=>{
    const val=Math.max(d.value,0), ang=val/total*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,start,start+ang); ctx.closePath();
    ctx.fillStyle=COLORS[i%COLORS.length]; ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    const pct=val/total*100;
    if (pct>5){
      const mid=start+ang/2;
      ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(pct.toFixed(1)+'%', cx+Math.cos(mid)*R*0.66, cy+Math.sin(mid)*R*0.66);
    }
    start+=ang;
  });
  const lx = w<620 ? 24 : w*0.62;
  let ly = w<620 ? cy+R+34 : cy-(data.length*24)/2+12;
  ctx.textBaseline='middle';
  data.forEach((d,i)=>{
    ctx.fillStyle=COLORS[i%COLORS.length]; roundRect(ctx,lx,ly-7,14,14,3); ctx.fill();
    ctx.fillStyle='#4b5563'; ctx.font='13px sans-serif'; ctx.textAlign='left';
    ctx.fillText(d.label+'  '+formatNum(d.value), lx+22, ly); ly+=24;
  });
}
let resizeTimer=null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (document.getElementById('page-chart').classList.contains('active')) renderChart();
    if (document.getElementById('page-novel').classList.contains('active')) refreshChapterList();
    if (document.getElementById('page-health').classList.contains('active')) renderSleepChart();
  }, 160);
});

/* ============================================================
   人物印象表
   ============================================================ */
let people = [], pendingImage = '', imageProcessing = false;
function savePeople(){ try { localStorage.setItem(PEOPLE_KEY, JSON.stringify(people)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadPeople(){ try { const raw = localStorage.getItem(PEOPLE_KEY); if (raw) people = JSON.parse(raw) || []; } catch(e){ people = []; } }

document.getElementById('pImg').addEventListener('change', e => {
  const file = e.target.files[0];
  const preview = document.getElementById('pPreview');
  if (!file) { pendingImage=''; preview.textContent='未选择'; return; }
  if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
  imageProcessing = true;
  preview.textContent = '处理中…';
  compressImage(file, 400, 0.72, dataUrl => {
    pendingImage = dataUrl;
    preview.innerHTML = '<img src="' + dataUrl + '" alt="预览">';
    imageProcessing = false;
  });
});
function resetPersonForm(){
  ['pName','pRole','pHeight','pWeight','pAge','pBirth','pLook','pChar','pImp'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pType').value = '现实人物';
  document.getElementById('pImg').value = '';
  document.getElementById('pPreview').textContent = '未选择';
  pendingImage = '';
}
document.getElementById('pReset').addEventListener('click', resetPersonForm);

document.getElementById('pAdd').addEventListener('click', async () => {
  if (imageProcessing) { alert('图片正在处理中，请稍候…'); return; }
  const name = document.getElementById('pName').value.trim();
  if (!name) { alert('请先填写姓名～'); document.getElementById('pName').focus(); return; }
  const personData = {
    name, type: document.getElementById('pType').value,
    role: document.getElementById('pRole').value.trim(),
    height: document.getElementById('pHeight').value.trim(),
    weight: document.getElementById('pWeight').value.trim(),
    age: document.getElementById('pAge').value.trim(),
    birth: document.getElementById('pBirth').value.trim(),
    look: document.getElementById('pLook').value.trim(),
    character: document.getElementById('pChar').value.trim(),
    impression: document.getElementById('pImp').value.trim(),
    img: pendingImage
  };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('people', personData);
      people.push(row);
    } else {
      people.push({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...personData });
      if (!savePeople()){ people.pop(); return; }
    }
    renderPeople(); resetPersonForm();
    showToast('已添加「' + name + '」');
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('pClearAll').addEventListener('click', async () => {
  if (people.length === 0) return;
  if (!confirm('确定要清空全部人物记录吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('people').delete().eq('user_id', currentUser.id);
    people = [];
    try { localStorage.removeItem(PEOPLE_KEY); } catch(e){}
    updateStorageUsage(); renderPeople(); showToast('人物数据已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

function renderPeople(){
  const list = document.getElementById('peopleList');
  document.getElementById('pCount').textContent = people.length;
  if (people.length === 0){ list.innerHTML = '<p class="empty">还没有人物记录，先在上方添加一位吧～</p>'; return; }
  list.innerHTML = people.map(p => {
    const chips = [];
    if (p.height) chips.push('<span class="chip">身高 ' + esc(p.height) + ' cm</span>');
    if (p.weight) chips.push('<span class="chip">体重 ' + esc(p.weight) + ' kg</span>');
    if (p.age)    chips.push('<span class="chip">年龄 ' + esc(p.age) + '</span>');
    if (p.birth)  chips.push('<span class="chip">生日 ' + esc(p.birth) + '</span>');
    return '<div class="person-card">' +
      '<div class="person-head">' +
        '<div class="avatar">' + (p.img ? '<img src="' + p.img + '" alt="">' : esc((p.name||'?').slice(0,1))) + '</div>' +
        '<div><h3>' + esc(p.name) + '</h3>' +
          '<span class="tag">' + esc(p.type || '现实人物') + '</span>' +
          (p.role ? '<span class="tag gray">' + esc(p.role) + '</span>' : '') +
        '</div>' +
        '<button class="del-btn" data-id="' + p.id + '" title="删除">✕</button>' +
      '</div>' +
      (chips.length ? '<div class="chips">' + chips.join('') + '</div>' : '') +
      '<div class="person-body">' +
        (p.look ? '<p><b>外貌：</b>' + esc(p.look) + '</p>' : '') +
        (p.character ? '<p><b>性格：</b>' + esc(p.character) + '</p>' : '') +
        (p.impression ? '<p><b>印象：</b>' + esc(p.impression) + '</p>' : '') +
      '</div></div>';
  }).join('');
  list.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const target = people.find(x => String(x.id) === String(id));
      if (!target || !confirm('确定删除「' + target.name + '」吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('people', id);
        people = people.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') savePeople();
        renderPeople(); showToast('已删除「' + target.name + '」');
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}
loadPeople(); renderPeople();

/* ============================================================
   歌曲收藏
   ============================================================ */
let songs = [];
const PLATFORMS = {
  qq:      { name:'QQ音乐',   base:'https://y.qq.com/n/ryqq/search?w=', suffix:'&t=song&remoteplace=txt.yqq.top' },
  kuwo:    { name:'酷我音乐', base:'https://www.kuwo.cn/search/list?key=', suffix:'' },
  kugou:   { name:'酷狗音乐', base:'https://www.kugou.com/yy/html/search.html#searchType=song&searchKeyWord=', suffix:'' },
  netease: { name:'网易云',   base:'https://music.163.com/#/search/m/?s=', suffix:'&type=1' }
};
function saveSongs(){ try { localStorage.setItem(SONGS_KEY, JSON.stringify(songs)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadSongs(){ try { const raw = localStorage.getItem(SONGS_KEY); if (raw) songs = JSON.parse(raw) || []; } catch(e){ songs = []; } }
function searchUrl(key, title, artist){
  const kw = encodeURIComponent((title + ' ' + artist).trim());
  return PLATFORMS[key].base + kw + PLATFORMS[key].suffix;
}
function renderSongs(){
  const body = document.getElementById('songsBody');
  const empty = document.getElementById('songsEmpty');
  document.getElementById('sCount').textContent = songs.length;
  if (songs.length === 0){ body.innerHTML = ''; empty.style.display='block'; return; }
  empty.style.display = 'none';
  body.innerHTML = songs.map((s,i) => {
    const links = Object.keys(PLATFORMS).map(k => {
      const custom = (s.links && s.links[k]) ? s.links[k] : '';
      const url = custom || searchUrl(k, s.title, s.artist);
      return '<a class="src-btn" data-p="' + k + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + PLATFORMS[k].name + (custom ? ' ·直链' : '') + '</a>';
    }).join('');
    const hasLyric = !!(s.lyrics && s.lyrics.trim());
    return '<tr><td>' + (i+1) + '</td>' +
      '<td><div class="song-title">' + esc(s.title) + '</div>' +
      ((s.lyricist||s.composer) ? '<div class="song-sub">' +
        (s.lyricist ? '词：'+esc(s.lyricist) : '') +
        (s.lyricist && s.composer ? ' · ' : '') +
        (s.composer ? '曲：'+esc(s.composer) : '') + '</div>' : '') + '</td>' +
      '<td>' + esc(s.artist) + '</td>' +
      '<td>' + (s.album ? esc(s.album) : '—') + '</td>' +
      '<td>' + (s.year ? esc(s.year) : '—') + '</td>' +
      '<td>' + (hasLyric ? '<button class="mini-btn" data-lyric="' + s.id + '">查看歌词</button>' : '<span style="color:#b0b6c4;">暂无</span>') + '</td>' +
      '<td>' + links + '</td>' +
      '<td><button class="mini-btn danger" data-del="' + s.id + '">删除</button></td></tr>';
  }).join('');
  body.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.del;
      const t = songs.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除「' + t.title + '」吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('songs', id);
        songs = songs.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveSongs();
        renderSongs(); showToast('已删除「' + t.title + '」');
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
  body.querySelectorAll('[data-lyric]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = songs.find(x => String(x.id) === String(btn.dataset.lyric));
      if (s) openLyric(s);
    });
  });
}
const lyricModal = document.getElementById('lyricModal');
function openLyric(s){
  document.getElementById('modalTitle').textContent = s.title + ' - ' + s.artist;
  let meta = [];
  if (s.album) meta.push('专辑：' + s.album);
  if (s.year) meta.push('发行：' + s.year);
  if (s.lyricist) meta.push('作词：' + s.lyricist);
  if (s.composer) meta.push('作曲：' + s.composer);
  document.getElementById('modalBody').textContent = (meta.length ? meta.join('　|　') + '\n\n' : '') + (s.lyrics || '暂无歌词');
  lyricModal.classList.add('show');
}
document.getElementById('modalClose').addEventListener('click', () => lyricModal.classList.remove('show'));
lyricModal.addEventListener('click', e => { if (e.target === lyricModal) lyricModal.classList.remove('show'); });

function resetSongForm(){
  ['sTitle','sArtist','sAlbum','sLyricist','sComposer','sYear','sLyrics','sQQ','sKuwo','sKugou','sNetease'].forEach(id => document.getElementById(id).value = '');
}
document.getElementById('sReset').addEventListener('click', resetSongForm);

document.getElementById('sAdd').addEventListener('click', async () => {
  const title = document.getElementById('sTitle').value.trim();
  const artist = document.getElementById('sArtist').value.trim();
  if (!title) { alert('请填写歌曲名称～'); document.getElementById('sTitle').focus(); return; }
  if (!artist) { alert('请填写歌手名称～'); document.getElementById('sArtist').focus(); return; }
  const songData = {
    title, artist,
    album: document.getElementById('sAlbum').value.trim(),
    lyricist: document.getElementById('sLyricist').value.trim(),
    composer: document.getElementById('sComposer').value.trim(),
    year: document.getElementById('sYear').value.trim(),
    lyrics: document.getElementById('sLyrics').value,
    links: {
      qq: document.getElementById('sQQ').value.trim(),
      kuwo: document.getElementById('sKuwo').value.trim(),
      kugou: document.getElementById('sKugou').value.trim(),
      netease: document.getElementById('sNetease').value.trim()
    }
  };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('songs', songData);
      songs.push(row);
    } else {
      songs.push({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...songData });
      if (!saveSongs()){ songs.pop(); return; }
    }
    renderSongs(); resetSongForm();
    showToast('已添加「' + title + '」');
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('sClearAll').addEventListener('click', async () => {
  if (songs.length === 0) return;
  if (!confirm('确定要清空全部歌曲记录吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('songs').delete().eq('user_id', currentUser.id);
    songs = [];
    try { localStorage.removeItem(SONGS_KEY); } catch(e){}
    updateStorageUsage(); renderSongs(); showToast('歌曲数据已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

document.getElementById('sExportDocx').addEventListener('click', async () => {
  if (songs.length === 0){ showToast('还没有歌曲记录，先添加一首吧～'); return; }
  if (typeof window.docx === 'undefined'){
    showToast('docx 库未加载，请刷新页面重试');
    return;
  }
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;
  const d = new Date();

  const children = [
    new Paragraph({
      children: [new TextRun({ text: '我的音乐收藏', bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [new TextRun({
        text: '共收录 ' + songs.length + ' 首歌曲 · 导出时间：' +
              d.getFullYear() + ' 年 ' + (d.getMonth()+1) + ' 月 ' + d.getDate() + ' 日',
        size: 20, color: '6f7680'
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  ];

  songs.forEach((s, i) => {
    children.push(new Paragraph({
      children: [new TextRun({ text: (i + 1) + '. ' + (s.title || ''), bold: true, size: 28 })],
      spacing: { before: 300, after: 100 }
    }));
    const meta = [];
    if (s.artist)   meta.push('歌手：' + s.artist);
    if (s.album)    meta.push('专辑：' + s.album);
    if (s.year)     meta.push('年份：' + s.year);
    if (s.lyricist) meta.push('作词：' + s.lyricist);
    if (s.composer) meta.push('作曲：' + s.composer);
    if (meta.length){
      children.push(new Paragraph({
        children: [new TextRun({ text: meta.join('　|　'), size: 20, color: '565d65' })],
        spacing: { after: 150 }
      }));
    }
    if (s.lyrics && s.lyrics.trim()){
      s.lyrics.split('\n').forEach(line => {
        children.push(new Paragraph({
          children: [new TextRun({ text: line || '', size: 22 })],
          spacing: { after: 0 }
        }));
      });
    } else {
      children.push(new Paragraph({
        children: [new TextRun({ text: '（暂无歌词）', size: 20, color: '9ca3af', italics: true })],
        spacing: { after: 0 }
      }));
    }
  });

  try {
    const doc = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的音乐收藏_' + timeStamp(d) + '.docx';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('已导出 docx 文档');
  } catch(err){
    alert('导出失败：' + (err.message || err));
  }
});
loadSongs(); renderSongs();

/* ============================================================
   地点收藏
   ============================================================ */
let places = [], pendingPlaceImage = '', placeImageProcessing = false;
const plRegionEl    = document.getElementById('plRegion');
const plAddressEl   = document.getElementById('plAddress');
const plAddressHint = document.getElementById('plAddressHint');
const plPriceTypeEl = document.getElementById('plPriceType');
const plPriceEl     = document.getElementById('plPrice');

function updateAddressHint(){
  if (plRegionEl.value === '国内'){
    plAddressEl.placeholder = '省 / 市 / 区 + 街道门牌号，如：浙江省杭州市西湖区文三路 100 号';
    plAddressHint.textContent = '国内请填写到具体门牌号或精确位置';
  } else {
    plAddressEl.placeholder = '国家 + 城市 + 地标，如：韩国 · 首尔大学 / 日本 · 富士山';
    plAddressHint.textContent = '国外可模糊处理，写到城市或地标即可';
  }
}
plRegionEl.addEventListener('change', updateAddressHint);
updateAddressHint();

function updatePriceState(){
  const free = plPriceTypeEl.value === '免费';
  plPriceEl.disabled = free;
  if (free) plPriceEl.value = '';
  plPriceEl.placeholder = free ? '免费无需填写' : (plPriceTypeEl.value === '门票' ? '如：60' : '如：120');
}
plPriceTypeEl.addEventListener('change', updatePriceState);
updatePriceState();

function savePlaces(){ try { localStorage.setItem(PLACES_KEY, JSON.stringify(places)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadPlaces(){ try { const raw = localStorage.getItem(PLACES_KEY); if (raw) places = JSON.parse(raw) || []; } catch(e){ places = []; } }

document.getElementById('plImg').addEventListener('change', e => {
  const file = e.target.files[0];
  const preview = document.getElementById('plPreview');
  if (!file) { pendingPlaceImage=''; preview.textContent='未选择'; return; }
  if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
  placeImageProcessing = true;
  preview.textContent = '处理中…';
  compressImage(file, 800, 0.75, dataUrl => {
    pendingPlaceImage = dataUrl;
    preview.innerHTML = '<img src="' + dataUrl + '" alt="预览">';
    placeImageProcessing = false;
  });
});
function resetPlaceForm(){
  ['plName','plAddress','plPrice','plDesc','plBaike'].forEach(id => document.getElementById(id).value = '');
  plRegionEl.value = '国内'; plPriceTypeEl.value = '门票';
  document.getElementById('plImg').value = '';
  document.getElementById('plPreview').textContent = '未选择';
  pendingPlaceImage = '';
  updateAddressHint(); updatePriceState();
}
document.getElementById('plReset').addEventListener('click', resetPlaceForm);

document.getElementById('plAdd').addEventListener('click', async () => {
  if (placeImageProcessing) { alert('图片正在处理中，请稍候…'); return; }
  const name = document.getElementById('plName').value.trim();
  if (!name) { alert('请先填写地点名称～'); document.getElementById('plName').focus(); return; }
  const address = plAddressEl.value.trim();
  if (!address) { alert('请填写详细位置～'); plAddressEl.focus(); return; }
  const placeData = {
    name, region: plRegionEl.value, address,
    price_type: plPriceTypeEl.value,
    price: plPriceTypeEl.value === '免费' ? '' : plPriceEl.value.trim(),
    desc_text: document.getElementById('plDesc').value.trim(),
    baike: document.getElementById('plBaike').value.trim(),
    img: pendingPlaceImage
  };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('places', placeData);
      row.desc = row.desc_text;
      places.push(row);
    } else {
      const local = { id: Date.now() + '-' + Math.floor(Math.random()*1000), ...placeData };
      local.desc = local.desc_text; delete local.desc_text;
      places.push(local);
      if (!savePlaces()){ places.pop(); return; }
    }
    renderPlaces(); resetPlaceForm();
    showToast('已添加「' + name + '」');
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('plClearAll').addEventListener('click', async () => {
  if (places.length === 0) return;
  if (!confirm('确定要清空全部地点记录吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('places').delete().eq('user_id', currentUser.id);
    places = [];
    try { localStorage.removeItem(PLACES_KEY); } catch(e){}
    updateStorageUsage(); renderPlaces(); showToast('地点数据已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

const PIN_ICON  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const COIN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h5M9.5 14.5h5"/></svg>';
const LINK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>';

function renderPlaces(){
  const list = document.getElementById('placesList');
  document.getElementById('plCount').textContent = places.length;
  if (places.length === 0){ list.innerHTML = '<p class="empty">还没有地点记录，先在上方添加一个吧～</p>'; return; }
  list.innerHTML = places.map(p => {
    const isCN = p.region === '国内';
    let priceText = '';
    const pt = p.priceType || p.price_type;
    if (pt === '免费') priceText = '免费';
    else if (p.price) priceText = (pt === '门票' ? '门票 ¥' : '人均 ¥') + esc(p.price);
    else priceText = (pt === '门票' ? '门票价格' : '人均消费') + '未填写';
    const baikeUrl = p.baike || ('https://baike.baidu.com/search?word=' + encodeURIComponent(p.name));
    return '<div class="place-card">' +
      '<div class="place-cover">' + (p.img ? '<img src="' + p.img + '" alt="">' : PIN_ICON) + '</div>' +
      '<div class="place-body">' +
        '<h3 class="place-name">' + esc(p.name) +
          '<span class="region-badge ' + (isCN ? 'region-cn' : 'region-intl') + '">' + (isCN ? '国内 · 精确' : '国外 · 模糊') + '</span>' +
        '</h3>' +
        '<div class="place-line">' + PIN_ICON + '<span>' + esc(p.address) + '</span></div>' +
        '<div class="place-line">' + COIN_ICON + '<span class="place-price">' + priceText + '</span></div>' +
        (p.desc ? '<p class="place-desc">' + esc(p.desc) + '</p>' : '') +
        '<div class="place-actions">' +
          '<a class="baike-btn" href="' + esc(baikeUrl) + '" target="_blank" rel="noopener">' + LINK_ICON + '百度百科</a>' +
          '<button class="del-btn" data-id="' + p.id + '">删除</button>' +
        '</div></div></div>';
  }).join('');
  list.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const t = places.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除「' + t.name + '」吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('places', id);
        places = places.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') savePlaces();
        renderPlaces(); showToast('已删除「' + t.name + '」');
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}
loadPlaces(); renderPlaces();
/* ============================================================
   菜谱收藏
   ============================================================ */
let recipes = [], pendingRecipeImg = '', recipeImageProcessing = false;

function saveRecipes(){ try { localStorage.setItem(RECIPE_KEY, JSON.stringify(recipes)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadRecipes(){ try { const raw = localStorage.getItem(RECIPE_KEY); if (raw) recipes = JSON.parse(raw) || []; } catch(e){ recipes = []; } }

// 图片上传处理
document.getElementById('rcImg').addEventListener('change', e => {
  const file = e.target.files[0];
  const preview = document.getElementById('rcPreview');
  if (!file) { pendingRecipeImg = ''; preview.textContent = '未选择'; return; }
  if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
  recipeImageProcessing = true;
  preview.textContent = '处理中…';
  compressImage(file, 800, 0.75, dataUrl => {
    pendingRecipeImg = dataUrl;
    preview.innerHTML = '<img src="' + dataUrl + '" alt="预览">';
    recipeImageProcessing = false;
  });
});

// 重置表单
function resetRecipeForm(){
  ['rcName','rcTags','rcIngredients','rcSteps'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('rcType').value = '家常菜';
  document.getElementById('rcLevel').value = '简单';
  document.getElementById('rcImg').value = '';
  document.getElementById('rcPreview').textContent = '未选择';
  pendingRecipeImg = '';
}
document.getElementById('rcReset').addEventListener('click', resetRecipeForm);

// 添加菜谱
document.getElementById('rcAdd').addEventListener('click', async () => {
  if (recipeImageProcessing) { alert('图片正在处理中，请稍候…'); return; }
  const name = document.getElementById('rcName').value.trim();
  if (!name) { alert('请先填写菜名～'); document.getElementById('rcName').focus(); return; }
  
  const data = {
    name,
    type: document.getElementById('rcType').value,
    level: document.getElementById('rcLevel').value,
    tags: document.getElementById('rcTags').value.trim(),
    ingredients: document.getElementById('rcIngredients').value.trim(),
    steps: document.getElementById('rcSteps').value.trim(),
    img: pendingRecipeImg
  };

  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('recipes', data); // 注意：云端需要建表
      recipes.push(row);
    } else {
      recipes.push({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data });
      if (!saveRecipes()){ recipes.pop(); return; }
    }
    renderRecipes(); resetRecipeForm();
    showToast('已添加菜谱「' + name + '」');
  } catch(err){ alert('保存失败：' + err.message); }
});

// 清空全部
document.getElementById('rcClearAll').addEventListener('click', async () => {
  if (recipes.length === 0) return;
  if (!confirm('确定要清空全部菜谱吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('recipes').delete().eq('user_id', currentUser.id);
    recipes = [];
    try { localStorage.removeItem(RECIPE_KEY); } catch(e){}
    renderRecipes(); showToast('菜谱数据已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

// 渲染菜谱列表
function renderRecipes(){
  const list = document.getElementById('recipeList');
  document.getElementById('rcCount').textContent = recipes.length;
  if (recipes.length === 0){ 
    list.innerHTML = '<p class="empty" style="grid-column:1/-1;">还没有菜谱，先在上方添加一道吧～</p>'; 
    return; 
  }
  
  list.innerHTML = recipes.map(r => {
    const tags = (r.tags || '').split(/[,，\s]+/).filter(Boolean);
    return '<div class="place-card">' +
      '<div class="place-cover">' + (r.img ? '<img src="' + r.img + '" alt="">' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:34px;height:34px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>') + '</div>' +
      '<div class="place-body">' +
        '<h3 class="place-name">' + esc(r.name) +
          '<span class="region-badge region-cn">' + esc(r.type || '家常菜') + '</span>' +
          '<span class="region-badge region-intl">' + esc(r.level || '简单') + '</span>' +
        '</h3>' +
        (tags.length ? '<div class="chips" style="margin-bottom:0;">' + tags.map(t => '<span class="chip">#' + esc(t) + '</span>').join('') + '</div>' : '') +
        (r.ingredients ? '<div class="place-line"><b>食材：</b>' + esc(r.ingredients) + '</div>' : '') +
        (r.steps ? '<div class="place-line"><b>做法：</b>' + esc(r.steps) + '</div>' : '') +
        '<div class="place-actions">' +
          '<button class="del-btn" data-rcdel="' + r.id + '">删除</button>' +
        '</div>' +
      '</div></div>';
  }).join('');

  list.querySelectorAll('[data-rcdel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.rcdel;
      const t = recipes.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除「' + t.name + '」吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('recipes', id);
        recipes = recipes.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveRecipes();
        renderRecipes(); showToast('已删除「' + t.name + '」');
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}

// 初始化加载
loadRecipes(); renderRecipes();

/* ============================================================
   影视收藏
   ============================================================ */
let medias = [];
let pendingMediaCover = '';
function saveMedias(){ try { localStorage.setItem(MEDIA_KEY, JSON.stringify(medias)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadMedias(){ try { const raw = localStorage.getItem(MEDIA_KEY); if (raw) medias = JSON.parse(raw) || []; } catch(e){ medias = []; } }
function resetMediaForm(){
  ['mTitle','mTypeCustom','mCountry','mYear','mScore','mCast','mDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('mType').value = '电视剧';
  document.getElementById('mStatus').value = '已看完';
  document.getElementById('mCover').value = '';
  document.getElementById('mCoverPreview').textContent = '未选择';
  pendingMediaCover = '';
}
document.getElementById('mCover').addEventListener('change', e => {
  const file = e.target.files[0];
  const preview = document.getElementById('mCoverPreview');
  if (!file){ pendingMediaCover = ''; preview.textContent = '未选择'; return; }
  if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }
  preview.textContent = '处理中…';
  compressImage(file, 800, 0.75, dataUrl => {
    pendingMediaCover = dataUrl;
    preview.innerHTML = '<img src="' + dataUrl + '" alt="">';
  });
});
document.getElementById('mReset').addEventListener('click', resetMediaForm);

document.getElementById('mAdd').addEventListener('click', async () => {
  const title = document.getElementById('mTitle').value.trim();
  if (!title) { alert('请先填写影视名称～'); document.getElementById('mTitle').focus(); return; }
  const customType = document.getElementById('mTypeCustom').value.trim();
  const data = {
    title,
    type: customType || document.getElementById('mType').value,
    country: document.getElementById('mCountry').value.trim(),
    year: document.getElementById('mYear').value.trim(),
    status: document.getElementById('mStatus').value,
    score: document.getElementById('mScore').value.trim(),
    cast_text: document.getElementById('mCast').value.trim(),
    desc_text: document.getElementById('mDesc').value.trim(),
    cover: pendingMediaCover || ''
  };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('medias', data);
      row.cast = row.cast_text; row.desc = row.desc_text;
      medias.push(row);
    } else {
      const local = { id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data };
      local.cast = local.cast_text; local.desc = local.desc_text;
      delete local.cast_text; delete local.desc_text;
      medias.push(local);
      if (!saveMedias()){ medias.pop(); return; }
    }
    renderMedias(); resetMediaForm();
    showToast('已添加「' + title + '」');
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('mClearAll').addEventListener('click', async () => {
  if (medias.length === 0) return;
  if (!confirm('确定要清空全部影视记录吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('medias').delete().eq('user_id', currentUser.id);
    medias = [];
    try { localStorage.removeItem(MEDIA_KEY); } catch(e){}
    updateStorageUsage(); renderMedias(); showToast('影视数据已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

function mediaMetaText(m){
  return [m.type, m.country, m.year, m.status, m.score ? ('★ ' + m.score) : ''].filter(Boolean).join(' · ');
}

function renderMedias(){
  const list = document.getElementById('mediaList');
  document.getElementById('mCount').textContent = medias.length;
  if (medias.length === 0){ list.innerHTML = '<p class="empty">还没有影视记录，先在上方添加一部吧～</p>'; return; }
  list.innerHTML = medias.map(m => {
    const coverHtml = m.cover
      ? '<img src="' + m.cover + '" alt="">'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16"/><path d="M2 9h5M2 15h5M17 9h5M17 15h5"/></svg>';
    return '<div class="media-card" data-mid="' + m.id + '">' +
      '<button class="del-btn" data-id="' + m.id + '" title="删除">✕</button>' +
      '<div class="media-cover">' + coverHtml +
        '<button class="media-cover-edit" data-mcoveredit="' + m.id + '">换封面</button>' +
      '</div>' +
      '<div class="media-head"><div style="flex:1;min-width:0;">' +
        '<h3 class="media-name">' + esc(m.title) + '</h3>' +
        '<div class="media-tags">' +
          '<span class="tag">' + esc(m.type || '影视') + '</span>' +
          (m.country ? '<span class="tag gray">' + esc(m.country) + '</span>' : '') +
          (m.year ? '<span class="tag gray">' + esc(m.year) + '</span>' : '') +
          (m.status ? '<span class="tag gray">' + esc(m.status) + '</span>' : '') +
          (m.score ? '<span class="tag">★ ' + esc(m.score) + '</span>' : '') +
        '</div></div></div>' +
      '<div class="media-body">' +
        (m.cast ? '<p><b>主要角色 / 人物：</b>' + esc(m.cast) + '</p>' : '') +
        (m.desc ? '<p><b>简介：</b>' + esc(m.desc) + '</p>' : '') +
      '</div></div>';
  }).join('');

  list.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const t = medias.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除「' + t.title + '」吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('medias', id);
        medias = medias.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveMedias();
        renderMedias(); showToast('已删除「' + t.title + '」');
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });

  list.querySelectorAll('[data-mcoveredit]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.mcoveredit;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = ev => {
        const file = ev.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }
        compressImage(file, 800, 0.75, async dataUrl => {
          try {
            if (appMode === 'cloud' && currentUser){
              await cloudUpdate('medias', id, { cover: dataUrl });
            } else {
              const i = medias.findIndex(x => String(x.id) === String(id));
              if (i >= 0){ medias[i].cover = dataUrl; saveMedias(); }
            }
            const m = medias.find(x => String(x.id) === String(id));
            if (m) m.cover = dataUrl;
            renderMedias();
            showToast('封面已更新');
          } catch(err){ alert('更新失败：' + err.message); }
        });
      };
      input.click();
    });
  });
}

function exportMediaDoc(){
  if (medias.length === 0){ showToast('还没有影视记录，先添加一部吧～'); return; }
  const d = new Date();
  const dateStr = d.getFullYear() + ' 年 ' + (d.getMonth()+1) + ' 月 ' + d.getDate() + ' 日';
  const items = medias.map((m, i) => {
    const meta = mediaMetaText(m);
    return '<section class="item"><h2>' + (i + 1) + '. ' + esc(m.title) + '</h2>' +
      (meta ? '<p class="meta">' + esc(meta) + '</p>' : '') +
      (m.cast ? '<p><b>主要角色 / 人物：</b>' + esc(m.cast) + '</p>' : '') +
      (m.desc ? '<p><b>简介：</b>' + esc(m.desc) + '</p>' : '') + '</section>';
  }).join('\n');
  const html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>我的追剧信息</title><style>' +
    'body{font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;max-width:820px;margin:0 auto;padding:48px 28px 60px;color:#1c1f23;line-height:1.8;background:#fff;}' +
    'h1{font-size:26px;margin:0 0 8px;}.head-meta{color:#6f7680;font-size:13.5px;margin:0 0 28px;padding-bottom:18px;border-bottom:2px solid #737b84;}' +
    '.item{border:1px solid #e3e6ea;border-radius:12px;padding:18px 20px;margin-bottom:16px;background:#fafbfc;}' +
    '.item h2{font-size:17px;margin:0 0 8px;}.meta{color:#565d65;font-size:13px;margin:0 0 10px;font-weight:600;}' +
    '.item p{margin:0 0 8px;font-size:14px;}.item b{color:#6f7680;font-weight:600;}.foot{margin-top:34px;text-align:center;color:#9ca3af;font-size:12.5px;}' +
    '</style></head><body><h1>我的追剧信息</h1><p class="head-meta">共收录 ' + medias.length + ' 部作品　·　导出时间：' + dateStr + '</p>' +
    items + '<p class="foot">岁窦工具箱 · 影视收藏</p></body></html>';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = '我的追剧信息_' + timeStamp(d) + '.html';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
  showToast('已导出「我的追剧信息」文档');
}

function wrapText(ctx, text, maxW){
  const out = [];
  String(text).split('\n').forEach(seg => {
    if (seg === ''){ out.push(''); return; }
    let cur = '';
    for (const ch of seg){
      if (cur && ctx.measureText(cur + ch).width > maxW){ out.push(cur); cur = ch; }
      else cur += ch;
    }
    out.push(cur);
  });
  return out;
}
function fitText(ctx, text, maxW){
  text = String(text || '');
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

function exportMediaImage(){
  if (medias.length === 0){ showToast('还没有影视记录，先添加一部吧～'); return; }
  const W = 920, PAD = 44, CARD_PAD = 20, GAP = 14;
  const innerW = W - PAD * 2, textW = innerW - CARD_PAD * 2;
  const dpr = 2;
  const FONT = '"PingFang SC","Microsoft YaHei",sans-serif';
  const mc = document.createElement('canvas').getContext('2d');
  const blocks = medias.map(m => {
    const rows = [];
    rows.push({ kind:'title', text: m.title, h: 30 });
    const meta = mediaMetaText(m);
    if (meta) rows.push({ kind:'meta', text: meta, h: 26 });
    if (m.cast){ mc.font = '14px ' + FONT; wrapText(mc, '主要角色 / 人物：' + m.cast, textW).forEach(l => rows.push({ kind:'body', text: l, h: 23 })); }
    if (m.desc){ mc.font = '14px ' + FONT; wrapText(mc, '简介：' + m.desc, textW).forEach(l => rows.push({ kind:'body', text: l, h: 23 })); }
    return rows;
  });
  const HEADER = 118, FOOTER = 58;
  let contentH = 0;
  blocks.forEach(rows => { contentH += CARD_PAD * 2 + rows.reduce((a, r) => a + r.h, 0) + GAP; });
  const H = PAD + HEADER + contentH + FOOTER + PAD;
  const canvas = document.createElement('canvas');
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  ctx.fillStyle = '#1c1f23'; ctx.font = 'bold 30px ' + FONT;
  ctx.fillText('我的追剧信息', PAD, PAD + 4);
  ctx.fillStyle = '#9ca3af'; ctx.font = '14.5px ' + FONT;
  ctx.fillText('共 ' + medias.length + ' 部作品　·　岁窦工具箱 · 影视收藏', PAD, PAD + 52);
  ctx.strokeStyle = '#e3e6ea'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, PAD + 92); ctx.lineTo(W - PAD, PAD + 92); ctx.stroke();
  let y = PAD + HEADER;
  blocks.forEach(rows => {
    const cardH = CARD_PAD * 2 + rows.reduce((a, r) => a + r.h, 0);
    ctx.fillStyle = '#fafbfc'; ctx.strokeStyle = '#e3e6ea'; ctx.lineWidth = 1;
    roundRect(ctx, PAD + 0.5, y + 0.5, innerW - 1, cardH - 1, 12); ctx.fill(); ctx.stroke();
    let ry = y + CARD_PAD;
    rows.forEach(r => {
      if (r.kind === 'title'){ ctx.font = 'bold 17px ' + FONT; ctx.fillStyle = '#1c1f23'; ctx.fillText(fitText(ctx, r.text, textW), PAD + CARD_PAD, ry + 6); }
      else if (r.kind === 'meta'){ ctx.font = '13px ' + FONT; ctx.fillStyle = '#565d65'; ctx.fillText(fitText(ctx, r.text, textW), PAD + CARD_PAD, ry + 4); }
      else { ctx.font = '14px ' + FONT; ctx.fillStyle = '#4b5563'; ctx.fillText(r.text, PAD + CARD_PAD, ry + 2); }
      ry += r.h;
    });
    y += cardH + GAP;
  });
  const d = new Date();
  ctx.textAlign = 'center'; ctx.fillStyle = '#9ca3af'; ctx.font = '12.5px ' + FONT;
  ctx.fillText('导出时间：' + d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + '　|　岁窦工具箱 · 影视收藏', W / 2, y + 22);
  const fileName = '我的追剧信息_' + timeStamp(d) + '.png';
  if (canvas.toBlob){
    canvas.toBlob(blob => {
      if (!blob){ showToast('导出失败，请重试'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast('已导出追剧信息图片');
    }, 'image/png');
  } else {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('已导出追剧信息图片');
  }
}
document.getElementById('mExportDoc').addEventListener('click', exportMediaDoc);
document.getElementById('mExportImg').addEventListener('click', exportMediaImage);
loadMedias(); renderMedias();

/* ============================================================
   时钟工具
   ============================================================ */
(function initClock(){
  const $ = id => document.getElementById(id);
  const HOURS_MAX = 20, TOTAL_MAX = 20 * 3600, TOTAL_MIN = 1;
  document.querySelectorAll('.clock-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.clock-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isCd = tab.dataset.tab === 'countdown';
      $('clockPanelCountdown').style.display = isCd ? '' : 'none';
      $('clockPanelTimer').style.display = isCd ? 'none' : '';
    });
  });
  let cdRemaining = 30, cdTimer = null, cdRunning = false, cdEndTime = 0;
  function formatCd(sec){
    sec = Math.max(0, Math.ceil(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }
  function readCdInput(){
    let h = parseInt($('cdHour').value) || 0, m = parseInt($('cdMin').value) || 0, s = parseInt($('cdSec').value) || 0;
    h = Math.max(0, Math.min(HOURS_MAX, h)); m = Math.max(0, Math.min(59, m)); s = Math.max(0, Math.min(59, s));
    let total = h * 3600 + m * 60 + s;
    if (total > TOTAL_MAX) total = TOTAL_MAX;
    if (total < TOTAL_MIN) total = TOTAL_MIN;
    return total;
  }
  function updateCdDisplay(){ $('cdDisplay').textContent = formatCd(cdRemaining); }
  function stopCd(){ if (cdTimer){ clearInterval(cdTimer); cdTimer = null; } cdRunning = false; }
  function tickCd(){
    cdRemaining = Math.max(0, (cdEndTime - Date.now()) / 1000);
    updateCdDisplay();
    if (cdRemaining <= 0){
      stopCd();
      if (navigator.vibrate){ try { navigator.vibrate([500, 200, 500, 200, 800]); } catch(e){} }
      showToast('倒计时结束！');
    }
  }
  function startCd(){
    if (cdRunning) return;
    if (cdRemaining <= 0) cdRemaining = readCdInput();
    cdRunning = true;
    cdEndTime = Date.now() + cdRemaining * 1000;
    cdTimer = setInterval(tickCd, 100);
    updateCdDisplay();
  }
  function pauseCd(){ if (!cdRunning) return; cdRemaining = Math.max(0, (cdEndTime - Date.now()) / 1000); stopCd(); updateCdDisplay(); }
  function resetCd(){ stopCd(); cdRemaining = readCdInput(); updateCdDisplay(); }
  function syncCdInputs(){
    const h = Math.max(0, Math.min(HOURS_MAX, parseInt($('cdHour').value) || 0));
    const m = Math.max(0, Math.min(59, parseInt($('cdMin').value) || 0));
    const s = Math.max(0, Math.min(59, parseInt($('cdSec').value) || 0));
    $('cdHour').value = h; $('cdMin').value = m; $('cdSec').value = s;
    if (!cdRunning){ cdRemaining = readCdInput(); updateCdDisplay(); }
  }
  ['cdHour','cdMin','cdSec'].forEach(id => {
    $(id).addEventListener('input', syncCdInputs);
    $(id).addEventListener('blur', syncCdInputs);
  });
  $('cdStart').addEventListener('click', startCd);
  $('cdPause').addEventListener('click', pauseCd);
  $('cdReset').addEventListener('click', resetCd);
  updateCdDisplay();

  let tmElapsed = 0, tmTimer = null, tmRunning = false, tmStartTime = 0;
  function formatTm(ms){
    const totalCs = Math.floor(ms / 10);
    const cs = totalCs % 100, totalSec = Math.floor(totalCs / 100), s = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60), m = totalMin % 60, h = Math.floor(totalMin / 60);
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s) + '.' + String(cs).padStart(2, '0');
  }
  function updateTmDisplay(){ $('tmDisplay').textContent = formatTm(tmElapsed); }
  function startTm(){ if (tmRunning) return; tmRunning = true; tmStartTime = Date.now() - tmElapsed; tmTimer = setInterval(() => { tmElapsed = Date.now() - tmStartTime; updateTmDisplay(); }, 33); }
  function pauseTm(){ if (!tmRunning) return; tmRunning = false; if (tmTimer){ clearInterval(tmTimer); tmTimer = null; } tmElapsed = Date.now() - tmStartTime; updateTmDisplay(); }
  function resetTm(){ pauseTm(); tmElapsed = 0; updateTmDisplay(); }
  $('tmStart').addEventListener('click', startTm);
  $('tmPause').addEventListener('click', pauseTm);
  $('tmReset').addEventListener('click', resetTm);
  updateTmDisplay();
})();

/* ============================================================
   我的日历
   ============================================================ */
const CAL_START = { y: 2026, m: 10 };
const CAL_END   = { y: 2036, m: 12 };
const CAL_WEEK  = ['一','二','三','四','五','六','日'];
let schedules = [], calYear = CAL_START.y, calMonth = CAL_START.m, calSelected = null, calEditingId = null;
function calKey(y, m, d){ return y + '-' + pad2(m) + '-' + pad2(d); }
function daysInMonth(y, m){ return new Date(y, m, 0).getDate(); }
function firstWeekdayMon(y, m){ return (new Date(y, m-1, 1).getDay() + 6) % 7; }
function calInRange(y, m){
  if (y < CAL_START.y || y > CAL_END.y) return false;
  if (y === CAL_START.y && m < CAL_START.m) return false;
  if (y === CAL_END.y && m > CAL_END.m) return false;
  return true;
}
function timeToMin(t){
  t = String(t || '').trim();
  if (!t) return 12 * 60;
  if (/全天/.test(t)) return -1;
  const m = t.match(/(\d{1,2})\s*[:：]\s*(\d{1,2})/);
  if (m) return (+m[1]) * 60 + (+m[2]);
  const h = t.match(/(\d{1,2})\s*[点时]/);
  if (h) return (+h[1]) * 60;
  return 23 * 60 + 59;
}
function sortSchedules(a, b){
  const d = timeToMin(a.time) - timeToMin(b.time);
  return d !== 0 ? d : String(a.content || '').localeCompare(String(b.content || ''));
}
function saveSchedules(){ try { localStorage.setItem(CAL_KEY, JSON.stringify(schedules)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadSchedules(){ try { const raw = localStorage.getItem(CAL_KEY); if (raw) schedules = JSON.parse(raw) || []; } catch(e){ schedules = []; } }
(function initCalMonth(){ const now = new Date(); if (calInRange(now.getFullYear(), now.getMonth() + 1)){ calYear = now.getFullYear(); calMonth = now.getMonth() + 1; } })();
function buildCalSelects(){
  const ys = document.getElementById('calYear'), ms = document.getElementById('calMonth');
  ys.innerHTML = ''; for (let y = CAL_START.y; y <= CAL_END.y; y++){ const o = document.createElement('option'); o.value = y; o.textContent = y + ' 年'; ys.appendChild(o); }
  ms.innerHTML = ''; for (let m = 1; m <= 12; m++){ const o = document.createElement('option'); o.value = m; o.textContent = m + ' 月'; ms.appendChild(o); }
  syncCalSelects();
}
function syncCalSelects(){
  const ys = document.getElementById('calYear'), ms = document.getElementById('calMonth');
  ys.value = String(calYear); ms.value = String(calMonth);
  Array.prototype.forEach.call(ms.options, o => {
    const m = +o.value; let ok = true;
    if (calYear === CAL_START.y && m < CAL_START.m) ok = false;
    if (calYear === CAL_END.y && m > CAL_END.m) ok = false;
    o.disabled = !ok;
  });
}
function renderCalGrid(){
  const grid = document.getElementById('calGrid');
  if (!grid) return;
  const y = calYear, m = calMonth;
  const first = firstWeekdayMon(y, m), dim = daysInMonth(y, m);
  const rows = Math.ceil((first + dim) / 7), total = rows * 7;
  const map = {};
  schedules.forEach(s => { if (s.date) (map[s.date] = map[s.date] || []).push(s); });
  Object.keys(map).forEach(k => map[k].sort(sortSchedules));
  const now = new Date();
  const todayKey = calKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
  let html = '';
  for (let i = 0; i < total; i++){
    const dayNum = i - first + 1;
    const inMonth = dayNum >= 1 && dayNum <= dim;
    let cy = y, cm = m, cd = dayNum;
    if (!inMonth){
      if (dayNum < 1){ cm = m - 1; cy = y; if (cm < 1){ cm = 12; cy--; } cd = daysInMonth(cy, cm) + dayNum; }
      else { cm = m + 1; cy = y; if (cm > 12){ cm = 1; cy++; } cd = dayNum - dim; }
    }
    const key = calKey(cy, cm, cd);
    const items = inMonth ? (map[key] || []) : [];
    const cls = ['cal-day'];
    if (!inMonth) cls.push('out');
    if (key === todayKey) cls.push('today');
    if (key === calSelected) cls.push('selected');
    let mini = '';
    if (items.length){
      const show = items.slice(0, 2).map(s => '<div class="cal-mini-item">' + (s.time ? '<b>' + esc(s.time) + '</b> ' : '') + esc(s.content || '') + '</div>').join('');
      mini = '<div class="cal-mini">' + show + (items.length > 2 ? '<div class="cal-more">+' + (items.length - 2) + ' 条</div>' : '') + '</div>';
    }
    html += '<div class="' + cls.join(' ') + '"' + (inMonth ? ' data-key="' + key + '"' : '') + '>' +
      '<div class="cal-day-head"><span class="cal-day-num">' + cd + '</span>' +
      (items.length ? '<span class="cal-count">' + items.length + '</span>' : '') + '</div>' + mini + '</div>';
  }
  grid.innerHTML = html;
  grid.querySelectorAll('.cal-day[data-key]').forEach(el => el.addEventListener('click', () => selectCalDay(el.dataset.key)));
}
function selectCalDay(key){
  calSelected = key; hideCalForm(); renderCalGrid(); renderDayPanel();
  const panel = document.getElementById('calDayPanel');
  if (panel && panel.scrollIntoView){ try { panel.scrollIntoView({ behavior:'smooth', block:'nearest' }); } catch(e){} }
}
function renderDayPanel(){
  const titleEl = document.getElementById('calDayTitle');
  const listEl  = document.getElementById('calDayList');
  const formEl  = document.getElementById('calDayForm');
  if (!calSelected){
    titleEl.textContent = '当天安排';
    listEl.innerHTML = '<p class="empty">点击上方任意日期，查看或添加当天安排～</p>';
    formEl.style.display = 'none'; return;
  }
  const parts = calSelected.split('-').map(Number);
  const y = parts[0], m = parts[1], d = parts[2];
  const wd = CAL_WEEK[(new Date(y, m - 1, d).getDay() + 6) % 7];
  titleEl.textContent = y + ' 年 ' + m + ' 月 ' + d + ' 日 · 星期' + wd;
  const items = schedules.filter(s => s.date === calSelected).sort(sortSchedules);
  if (!items.length){
    listEl.innerHTML = '<p class="empty">这一天还没有安排，在下方添加一条吧～</p>';
  } else {
    listEl.innerHTML = items.map(s => {
      const meta = [];
      if (s.place)  meta.push('地点：' + esc(s.place));
      if (s.people) meta.push('人物：' + esc(s.people));
      return '<div class="cal-item"><div class="cal-item-main">' +
        '<div class="cal-item-top">' + (s.time ? '<span class="cal-item-time">' + esc(s.time) + '</span>' : '') + '<span class="cal-item-content">' + esc(s.content) + '</span></div>' +
        (meta.length ? '<div class="cal-item-meta">' + meta.join('　·　') + '</div>' : '') +
        '</div><div class="cal-item-actions">' +
        '<button class="mini-btn" data-cedit="' + s.id + '">编辑</button>' +
        '<button class="mini-btn danger" data-cdel="' + s.id + '">删除</button></div></div>';
    }).join('');
    listEl.querySelectorAll('[data-cedit]').forEach(btn => btn.addEventListener('click', () => openCalForm(btn.dataset.cedit)));
    listEl.querySelectorAll('[data-cdel]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.cdel;
        const t = schedules.find(x => String(x.id) === String(id));
        if (!t) return;
        const label = (t.time ? t.time + ' ' : '') + t.content;
        if (!confirm('确定删除这条安排吗？\n\n' + label)) return;
        try {
          if (appMode === 'cloud' && currentUser) await cloudDelete('schedules', id);
          schedules = schedules.filter(x => String(x.id) !== String(id));
          if (appMode === 'local') saveSchedules();
          if (calEditingId && String(calEditingId) === String(id)) hideCalForm();
          renderCalGrid(); renderDayPanel(); showToast('已删除该安排');
        } catch(err){ alert('删除失败：' + err.message); }
      });
    });
  }
  formEl.style.display = '';
}
function openCalForm(id){
  const s = schedules.find(x => String(x.id) === String(id));
  if (!s) return;
  calEditingId = id;
  document.getElementById('calTime').value    = s.time || '';
  document.getElementById('calPlace').value   = s.place || '';
  document.getElementById('calPeople').value  = s.people || '';
  document.getElementById('calContent').value = s.content || '';
  document.getElementById('calSave').textContent = '保存修改';
  document.getElementById('calCancelEdit').style.display = '';
  document.getElementById('calDayForm').style.display = '';
  document.getElementById('calContent').focus();
}
function hideCalForm(){
  calEditingId = null;
  ['calTime','calPlace','calPeople','calContent'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('calSave').textContent = '＋ 添加安排';
  document.getElementById('calCancelEdit').style.display = 'none';
}
function shiftMonth(delta){
  let y = calYear, m = calMonth + delta;
  if (m < 1){ m = 12; y--; }
  if (m > 12){ m = 1; y++; }
  if (!calInRange(y, m)) { showToast('已到达可查看范围的边界'); return; }
  calYear = y; calMonth = m; syncCalSelects(); renderCalGrid();
}
function renderCalendar(){ syncCalSelects(); renderCalGrid(); renderDayPanel(); }

function exportCalImage(){
  const y = calYear, m = calMonth;
  const dpr = 2, PAD = 30, HEAD = 92, WEEKH = 36, CELLW = 168, CELLH = 134, GAP = 8, FOOT = 48, cols = 7;
  const first = firstWeekdayMon(y, m), dim = daysInMonth(y, m), rows = Math.ceil((first + dim) / 7);
  const W = PAD * 2 + cols * CELLW + (cols - 1) * GAP;
  const H = PAD + HEAD + WEEKH + rows * CELLH + (rows - 1) * GAP + FOOT + PAD;
  const canvas = document.createElement('canvas');
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top';
  const FONT = '"PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1c1f23'; ctx.font = 'bold 32px ' + FONT;
  ctx.fillText(y + ' 年 ' + m + ' 月', PAD, PAD + 2);
  ctx.fillStyle = '#9ca3af'; ctx.font = '15px ' + FONT;
  ctx.fillText('我的日历 · 岁窦工具箱 V2.3.2', PAD, PAD + 48);
  const weekTop = PAD + HEAD;
  ctx.font = 'bold 14px ' + FONT; ctx.textAlign = 'center';
  for (let c = 0; c < 7; c++){
    ctx.fillStyle = c >= 5 ? '#b91c1c' : '#6f7680';
    ctx.fillText(CAL_WEEK[c], PAD + c * (CELLW + GAP) + CELLW / 2, weekTop + 11);
  }
  const gridTop = weekTop + WEEKH;
  const map = {};
  schedules.forEach(s => { if (s.date) (map[s.date] = map[s.date] || []).push(s); });
  Object.keys(map).forEach(k => map[k].sort(sortSchedules));
  for (let i = 0; i < rows * 7; i++){
    const col = i % 7, row = Math.floor(i / 7);
    const x = PAD + col * (CELLW + GAP), yy = gridTop + row * (CELLH + GAP);
    const dayNum = i - first + 1, inMonth = dayNum >= 1 && dayNum <= dim;
    ctx.fillStyle = inMonth ? '#ffffff' : '#fafbfc';
    ctx.strokeStyle = inMonth ? '#e3e6ea' : '#f1f2f6';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 0.5, yy + 0.5, CELLW - 1, CELLH - 1, 10); ctx.fill(); ctx.stroke();
    if (!inMonth) continue;
    const key = calKey(y, m, dayNum);
    const items = map[key] || [];
    ctx.fillStyle = '#374151'; ctx.font = 'bold 15px ' + FONT; ctx.textAlign = 'left';
    ctx.fillText(String(dayNum), x + 11, yy + 10);
    if (items.length){
      const badge = String(items.length);
      ctx.font = 'bold 11px ' + FONT;
      const bw = ctx.measureText(badge).width + 14;
      ctx.fillStyle = '#737b84';
      roundRect(ctx, x + CELLW - 10 - bw, yy + 8, bw, 19, 9.5); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
      ctx.fillText(badge, x + CELLW - 10 - bw / 2, yy + 12);
      ctx.textAlign = 'left';
    }
    const lineTop = yy + 36, lineH = 21;
    const maxLines = Math.max(1, Math.floor((CELLH - 44) / lineH));
    let shown = items, more = 0;
    if (items.length > maxLines){ shown = items.slice(0, maxLines - 1); more = items.length - shown.length; }
    shown.forEach((s, idx) => {
      const ly = lineTop + idx * lineH;
      ctx.fillStyle = '#eceff2';
      roundRect(ctx, x + 8, ly, CELLW - 16, lineH - 4, 5); ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.rect(x + 12, ly, CELLW - 24, lineH - 4); ctx.clip();
      ctx.fillStyle = '#3d444b'; ctx.font = '11.5px ' + FONT;
      const text = (s.time ? s.time + ' ' : '') + (s.content || '');
      ctx.fillText(fitText(ctx, text, CELLW - 24), x + 12, ly + 4);
      ctx.restore();
    });
    if (more > 0){ ctx.fillStyle = '#9ca3af'; ctx.font = '11px ' + FONT; ctx.fillText('+' + more + ' 条', x + 12, lineTop + shown.length * lineH + 3); }
  }
  const d = new Date();
  const footY = gridTop + rows * CELLH + (rows - 1) * GAP + 20;
  ctx.textAlign = 'center'; ctx.fillStyle = '#9ca3af'; ctx.font = '12.5px ' + FONT;
  ctx.fillText('导出时间：' + d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + '　|　岁窦工具箱 · 我的日历', W / 2, footY);
  const fileName = '我的日历_' + y + '-' + pad2(m) + '.png';
  if (canvas.toBlob){
    canvas.toBlob(blob => {
      if (!blob){ showToast('导出失败，请重试'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast('已导出 ' + y + ' 年 ' + m + ' 月的日历图片');
    }, 'image/png');
  } else {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('已导出 ' + y + ' 年 ' + m + ' 月的日历图片');
  }
}
(function initCalendar(){
  loadSchedules();
  buildCalSelects();
  const ys = document.getElementById('calYear'), ms = document.getElementById('calMonth');
  ys.addEventListener('change', () => {
    const y = +ys.value; let m = +ms.value;
    if (y === CAL_START.y && m < CAL_START.m) m = CAL_START.m;
    if (y === CAL_END.y && m > CAL_END.m) m = CAL_END.m;
    calYear = y; calMonth = m; syncCalSelects(); renderCalGrid();
  });
  ms.addEventListener('change', () => {
    const m = +ms.value;
    if (!calInRange(calYear, m)){ syncCalSelects(); return; }
    calMonth = m; syncCalSelects(); renderCalGrid();
  });
  document.getElementById('calPrev').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('calNext').addEventListener('click', () => shiftMonth(1));
  document.getElementById('calStart').addEventListener('click', () => { calYear = CAL_START.y; calMonth = CAL_START.m; syncCalSelects(); renderCalGrid(); });
  document.getElementById('calExport').addEventListener('click', exportCalImage);
  document.getElementById('calSave').addEventListener('click', async () => {
    if (!calSelected){ showToast('请先点击选择一个日期'); return; }
    const content = document.getElementById('calContent').value.trim();
    if (!content){ alert('请填写安排内容～'); document.getElementById('calContent').focus(); return; }
    const payload = {
      date: calSelected,
      time:   document.getElementById('calTime').value.trim(),
      place:  document.getElementById('calPlace').value.trim(),
      people: document.getElementById('calPeople').value.trim(),
      content: content
    };
    const wasEditing = !!calEditingId;
    try {
      if (appMode === 'cloud' && currentUser){
        if (calEditingId){
          await cloudUpdate('schedules', calEditingId, payload);
          const i = schedules.findIndex(x => String(x.id) === String(calEditingId));
          if (i >= 0) schedules[i] = { ...schedules[i], ...payload };
        } else {
          const row = await cloudInsert('schedules', payload);
          schedules.push(row);
        }
      } else {
        if (calEditingId){
          const i = schedules.findIndex(x => String(x.id) === String(calEditingId));
          if (i < 0){ hideCalForm(); renderDayPanel(); return; }
          schedules[i] = { ...schedules[i], ...payload };
        } else {
          payload.id = Date.now() + '-' + Math.floor(Math.random() * 1000);
          schedules.push(payload);
        }
        if (!saveSchedules()){ return; }
      }
      hideCalForm(); renderCalGrid(); renderDayPanel();
      showToast(wasEditing ? '安排已更新' : '安排已添加');
    } catch(err){ alert('保存失败：' + err.message); }
  });
  document.getElementById('calCancelEdit').addEventListener('click', () => { hideCalForm(); renderDayPanel(); });
  renderCalendar();
})();

/* ============================================================
   代码编辑器
   ============================================================ */
const codeInputEl   = document.getElementById('codeInput');
const codePreviewEl = document.getElementById('codePreview');
const codeHintEl    = document.getElementById('codeHint');
const CODE_SAMPLE_JS = [
  '// 欢迎使用岁窦代码编辑器',
  'const fruits = ["苹果", "香蕉", "橙子", "葡萄"];',
  '',
  'const box = document.createElement("div");',
  'box.innerHTML = "<h2>我的水果清单</h2>";',
  '',
  'const ul = document.createElement("ul");',
  'fruits.forEach((f, i) => {',
  '  const li = document.createElement("li");',
  '  li.textContent = (i + 1) + ". " + f;',
  '  ul.appendChild(li);',
  '});',
  'box.appendChild(ul);',
  '',
  'box.innerHTML += "<p>一共收藏了 <b>" + fruits.length + "</b> 种水果。</p>";',
  'document.body.appendChild(box);',
  '',
  'console.log("运行完成，共 " + fruits.length + " 条数据");'
].join('\n');
const CODE_SAMPLE_MD = [
  '# 岁窦工具箱 · Markdown 示例',
  '',
  '这是一段普通文本，支持 **加粗**、*斜体*、~~删除线~~ 以及 `行内代码`。',
  '',
  '## 二级标题',
  '',
  '- 标题（一至六级）',
  '- 无序列表 / 有序列表',
  '- 引用、分割线、链接',
  '',
  '> 把想法写下来，它就成功了一半。',
  '',
  '```js',
  'function hello(name) {',
  '  return "你好，" + name + "！";',
  '}',
  '```',
  '',
  '[访问百度](https://www.baidu.com)',
  '---'
].join('\n');
let codeMode = 'js';
const codeDrafts = { js: CODE_SAMPLE_JS, md: CODE_SAMPLE_MD };
let codeAutoTimer = null;

function inlineMd(s){
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
function mdToHtml(src){
  let text = esc(src);
  const blocks = [];
  text = text.replace(/```([\s\S]*?)```/g, (m, body) => {
    blocks.push(body.replace(/^\n+/, '').replace(/\n+$/, ''));
    return '\u0000' + (blocks.length - 1) + '\u0000';
  });
  const lines = text.split('\n');
  const out = [];
  let para = [], list = null;
  function flushPara(){ if (para.length){ out.push('<p>' + inlineMd(para.join('<br>')) + '</p>'); para = []; } }
  function closeList(){ if (list){ out.push('</' + list + '>'); list = null; } }
  lines.forEach(line => {
    const raw = line.trim();
    const ph = raw.match(/^\u0000(\d+)\u0000$/);
    if (ph){ flushPara(); closeList(); out.push('<pre class="md-pre"><code>' + blocks[+ph[1]] + '</code></pre>'); return; }
    if (!raw){ flushPara(); closeList(); return; }
    const h = raw.match(/^(#{1,6})\s+(.*)$/);
    if (h){ flushPara(); closeList(); const lv = h[1].length; out.push('<h' + lv + '>' + inlineMd(h[2]) + '</h' + lv + '>'); return; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(raw)){ flushPara(); closeList(); out.push('<hr>'); return; }
    if (/^>\s?/.test(raw)){ flushPara(); closeList(); out.push('<blockquote>' + inlineMd(raw.replace(/^>\s?/, '')) + '</blockquote>'); return; }
    const ul = raw.match(/^[-*+]\s+(.*)$/);
    if (ul){ flushPara(); if (list !== 'ul'){ closeList(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inlineMd(ul[1]) + '</li>'); return; }
    const ol = raw.match(/^\d+[.)]\s+(.*)$/);
    if (ol){ flushPara(); if (list !== 'ol'){ closeList(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inlineMd(ol[1]) + '</li>'); return; }
    closeList(); para.push(raw);
  });
  flushPara(); closeList();
  return out.join('\n');
}
function buildMdDoc(md){
  const body = mdToHtml(md);
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>' +
    'body{margin:0;padding:18px 22px 28px;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;font-size:14.5px;color:#1c1f23;line-height:1.8;}' +
    'h1{font-size:24px;border-bottom:2px solid #eceff2;padding-bottom:8px;margin:0 0 14px;}' +
    'h2{font-size:20px;margin:22px 0 10px;}h3{font-size:17px;margin:18px 0 8px;}' +
    'p{margin:0 0 12px;}ul,ol{margin:0 0 12px;padding-left:24px;}' +
    'blockquote{margin:0 0 12px;padding:8px 14px;border-left:4px solid #cfd4d9;background:#f7f8f9;color:#4b5563;border-radius:0 8px 8px 0;}' +
    'code{background:#f3f4f6;color:#8f3a3a;padding:1px 6px;border-radius:5px;font-family:Consolas,Menlo,monospace;font-size:13px;}' +
    'pre.md-pre{background:#22262b;color:#e2e8f0;padding:12px 14px;border-radius:10px;overflow:auto;font-size:13px;line-height:1.65;}' +
    'pre.md-pre code{background:none;color:inherit;padding:0;}a{color:#565d65;}' +
    'hr{border:none;border-top:1px solid #e3e6ea;margin:18px 0;}del{color:#9ca3af;}' +
    '</style></head><body>' + body + '</body></html>';
}
function buildJsDoc(code){
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>' +
    'body{margin:0;padding:14px 16px 24px;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;font-size:14px;color:#1c1f23;line-height:1.7;}' +
    'pre.out{background:#22262b;color:#cbd5e1;padding:10px 12px;border-radius:8px;font-size:12.5px;overflow:auto;white-space:pre-wrap;margin:14px 0 0;font-family:Consolas,Menlo,monospace;line-height:1.6;}' +
    '.err{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;padding:10px 12px;border-radius:8px;font-size:13px;white-space:pre-wrap;margin-top:14px;}' +
    '</style></head><body><div id="__out"></div><script>\n' +
    'var __logs = [];var __origLog = console.log;\n' +
    'console.log = function(){\n' +
    '  var a = Array.prototype.slice.call(arguments).map(function(x){\n' +
    '    try { return (typeof x === "object" && x !== null) ? JSON.stringify(x) : String(x); }\n' +
    '    catch(e){ return String(x); }\n' +
    '  }).join(" ");\n' +
    '  __logs.push(a); __origLog.apply(console, arguments);\n' +
    '};\n' +
    'function __flush(){\n' +
    '  if (!__logs.length) return;\n' +
    '  var d = document.createElement("pre");\n' +
    '  d.className = "out"; d.textContent = __logs.join("\\n");\n' +
    '  document.body.appendChild(d);\n' +
    '}\n' +
    'try {\n' + code + '\n' +
    '} catch(err) {\n' +
    '  var e = document.createElement("div");\n' +
    '  e.className = "err";\n' +
    '  e.textContent = "运行时错误：" + (err && err.message ? err.message : err);\n' +
    '  document.body.appendChild(e);\n' +
    '}\n' +
    '__flush();\n' +
    '<\/script></body></html>';
}
function runCodeEditor(){
  const code = codeInputEl.value;
  if (codeMode === 'js'){
    codePreviewEl.srcdoc = buildJsDoc(code);
    codeHintEl.textContent = 'JavaScript 已在沙箱中运行；console.log 的输出会显示在预览内容的下方。';
  } else {
    codePreviewEl.srcdoc = buildMdDoc(code);
    codeHintEl.textContent = 'Markdown 已渲染为排版页面。';
  }
}
document.querySelectorAll('.code-mode').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === codeMode) return;
    codeDrafts[codeMode] = codeInputEl.value;
    document.querySelectorAll('.code-mode').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    codeMode = btn.dataset.mode;
    codeInputEl.value = codeDrafts[codeMode] !== undefined ? codeDrafts[codeMode] : '';
    runCodeEditor();
  });
});
document.getElementById('codeRun').addEventListener('click', runCodeEditor);
document.getElementById('codeSample').addEventListener('click', () => {
  codeInputEl.value = codeMode === 'js' ? CODE_SAMPLE_JS : CODE_SAMPLE_MD;
  codeDrafts[codeMode] = codeInputEl.value;
  runCodeEditor();
  showToast('已载入示例' + (codeMode === 'js' ? '代码' : '文档'));
});
document.getElementById('codeClear').addEventListener('click', () => {
  codeInputEl.value = ''; codeDrafts[codeMode] = ''; runCodeEditor();
});
codeInputEl.addEventListener('input', () => {
  codeDrafts[codeMode] = codeInputEl.value;
  clearTimeout(codeAutoTimer);
  codeAutoTimer = setTimeout(runCodeEditor, 700);
});
codeInputEl.addEventListener('keydown', e => {
  if (e.key === 'Tab'){
    e.preventDefault();
    const s = codeInputEl.selectionStart, en = codeInputEl.selectionEnd;
    codeInputEl.value = codeInputEl.value.slice(0, s) + '  ' + codeInputEl.value.slice(en);
    codeInputEl.selectionStart = codeInputEl.selectionEnd = s + 2;
    codeDrafts[codeMode] = codeInputEl.value;
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); runCodeEditor(); showToast('已运行 / 渲染'); }
});
codeInputEl.value = CODE_SAMPLE_JS;
runCodeEditor();

/* ============================================================
   畅想画布
   ============================================================ */
const drawCanvasEl = document.getElementById('drawCanvas');
const drawCtx = drawCanvasEl.getContext('2d');
const brushSizeEl = document.getElementById('brushSize');
const brushSizeValEl = document.getElementById('brushSizeVal');
const eraserBtnEl = document.getElementById('eraserBtn');
let drawColorValue = '#1c1f23', drawSizeValue = 6, drawErasing = false, drawIsDrawing = false, drawLastPt = null, drawHistory = [];

function initBoard(){
  drawCtx.fillStyle = '#ffffff';
  drawCtx.fillRect(0, 0, drawCanvasEl.width, drawCanvasEl.height);
  drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round';
}
function drawPos(e){
  const rect = drawCanvasEl.getBoundingClientRect();
  const scaleX = drawCanvasEl.width  / (rect.width  || 1);
  const scaleY = drawCanvasEl.height / (rect.height || 1);
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}
function pushDrawHistory(){
  try { if (drawHistory.length >= 25) drawHistory.shift(); drawHistory.push(drawCanvasEl.toDataURL('image/png')); } catch(e){}
}
function strokeSegment(from, to){
  drawCtx.strokeStyle = drawErasing ? '#ffffff' : drawColorValue;
  drawCtx.lineWidth = drawErasing ? drawSizeValue * 2 : drawSizeValue;
  drawCtx.beginPath(); drawCtx.moveTo(from.x, from.y); drawCtx.lineTo(to.x, to.y); drawCtx.stroke();
}
function strokeDot(p){
  drawCtx.beginPath();
  drawCtx.arc(p.x, p.y, (drawErasing ? drawSizeValue * 2 : drawSizeValue) / 2, 0, Math.PI * 2);
  drawCtx.fillStyle = drawErasing ? '#ffffff' : drawColorValue;
  drawCtx.fill();
}
drawCanvasEl.addEventListener('pointerdown', e => {
  e.preventDefault();
  try { drawCanvasEl.setPointerCapture(e.pointerId); } catch(err){}
  pushDrawHistory(); drawIsDrawing = true;
  drawLastPt = drawPos(e); strokeDot(drawLastPt);
});
drawCanvasEl.addEventListener('pointermove', e => {
  if (!drawIsDrawing) return;
  e.preventDefault();
  const p = drawPos(e);
  if (drawLastPt) strokeSegment(drawLastPt, p);
  drawLastPt = p;
});
['pointerup','pointercancel'].forEach(evt => drawCanvasEl.addEventListener(evt, () => { drawIsDrawing = false; drawLastPt = null; }));
document.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.color-dot').forEach(x => x.classList.remove('active'));
    dot.classList.add('active'); drawColorValue = dot.dataset.color; drawErasing = false; eraserBtnEl.classList.remove('active');
  });
});
brushSizeEl.addEventListener('input', () => { drawSizeValue = +brushSizeEl.value; brushSizeValEl.textContent = drawSizeValue; });
eraserBtnEl.addEventListener('click', () => {
  drawErasing = !drawErasing;
  eraserBtnEl.classList.toggle('active', drawErasing);
  showToast(drawErasing ? '橡皮擦已开启' : '已切回画笔');
});
document.getElementById('undoDraw').addEventListener('click', () => {
  if (!drawHistory.length){ showToast('没有可以撤销的操作了'); return; }
  const data = drawHistory.pop();
  const img = new Image();
  img.onload = () => { drawCtx.fillStyle = '#ffffff'; drawCtx.fillRect(0, 0, drawCanvasEl.width, drawCanvasEl.height); drawCtx.drawImage(img, 0, 0); };
  img.src = data;
});
document.getElementById('clearDraw').addEventListener('click', () => {
  if (!confirm('确定要清空整块画布吗？（清空后仍可点击撤销恢复）')) return;
  pushDrawHistory();
  drawCtx.fillStyle = '#ffffff';
  drawCtx.fillRect(0, 0, drawCanvasEl.width, drawCanvasEl.height);
  showToast('画布已清空');
});
document.getElementById('exportDraw').addEventListener('click', () => {
  const d = new Date();
  const fileName = '畅想画布_' + timeStamp(d) + '.png';
  if (drawCanvasEl.toBlob){
    drawCanvasEl.toBlob(blob => {
      if (!blob){ showToast('导出失败，请重试'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast('画布已导出为 PNG');
    }, 'image/png');
  } else {
    const a = document.createElement('a');
    a.href = drawCanvasEl.toDataURL('image/png'); a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('画布已导出为 PNG');
  }
});
initBoard();

/* ============================================================
   AI 聊天（仅聊天）
   ============================================================ */
const chatLog   = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');
const chatSend  = document.getElementById('chatSend');
const chatQuota = document.getElementById('chatQuota');
let chatHistory = [{ role: 'system', content: '你是岁窦工具箱的 AI 助手，用简洁、友好的中文回答。' }];

function appendChat(role, text){
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}
async function updateQuota(){
  if (!currentUser){ chatQuota.textContent = '未登录'; return; }
  const today = new Date().toISOString().slice(0,10);
  const { data } = await sb.from('ai_usage').select('count').eq('user_id', currentUser.id).eq('date', today).maybeSingle();
  chatQuota.textContent = '今日已用 ' + (data?.count || 0) + ' / 20 次';
}
async function sendChat(){
  if (!currentUser){ showToast('请先登录再使用 AI 助手'); go('login'); return; }
  const text = chatInput.value.trim();
  if (!text) return;
  appendChat('user', text);
  chatHistory.push({ role: 'user', content: text });
  chatInput.value = '';
  chatSend.disabled = true;
  const aiDiv = appendChat('ai', '思考中…');
  let full = '';
  try {
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({ messages: chatHistory, stream: true })
    });
    if (!res.ok){
      const err = await res.json().catch(() => ({}));
      aiDiv.textContent = '⚠️ ' + (err.error || '请求失败');
      chatSend.disabled = false; return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true){
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines){
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        const payload = t.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content || '';
          if (delta){ full += delta; aiDiv.textContent = full; chatLog.scrollTop = chatLog.scrollHeight; }
        } catch(e){}
      }
    }
    chatHistory.push({ role: 'assistant', content: full });
    updateQuota();
  } catch (err){
    aiDiv.textContent = '⚠️ 网络错误：' + err.message;
  } finally { chatSend.disabled = false; }
}
chatSend.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); sendChat(); }
});
document.getElementById('chatClear').addEventListener('click', () => {
  chatHistory = [{ role: 'system', content: '你是岁窦工具箱的 AI 助手，用简洁、友好的中文回答。' }];
  chatLog.innerHTML = '<div class="chat-msg sys">对话已清空</div>';
});
document.getElementById('chatSample').addEventListener('click', () => {
  chatInput.value = '帮我写一段小说开头：夜色中的江南小镇，主角第一次见到他的师父。';
  chatInput.focus();
});

/* ============================================================
   AI 弹窗辅助
   ============================================================ */
const aiPop      = document.getElementById('aiPop');
const aiPopTitle = document.getElementById('aiPopTitle');
const aiPopBody  = document.getElementById('aiPopBody');
let aiPopInsertHandler = null;

async function openAiPop(title, prompt, onInsert){
  if (!currentUser){ showToast('请先登录再使用 AI'); go('login'); return; }
  aiPopTitle.textContent = title;
  aiPopBody.textContent = '生成中…';
  aiPop.classList.add('show');
  aiPopInsertHandler = onInsert || null;
  try {
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是写作助手，直接输出结果，不要解释。' },
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || data.error || '无结果';
    aiPopBody.textContent = text;
    updateQuota();
  } catch(err){ aiPopBody.textContent = '⚠️ ' + err.message; }
}
document.getElementById('aiPopClose').addEventListener('click', () => aiPop.classList.remove('show'));
document.getElementById('aiPopCopy').addEventListener('click', () => {
  navigator.clipboard.writeText(aiPopBody.textContent).then(() => showToast('已复制'));
});
document.getElementById('aiPopInsert').addEventListener('click', () => {
  if (aiPopInsertHandler) aiPopInsertHandler(aiPopBody.textContent);
  aiPop.classList.remove('show');
});

document.getElementById('pAiBtn').addEventListener('click', () => {
  const name = document.getElementById('pName').value.trim();
  if (!name){ alert('请先填写姓名'); return; }
  const info = ['姓名：' + name, '类型：' + document.getElementById('pType').value,
    '身份：' + document.getElementById('pRole').value,
    '外貌：' + document.getElementById('pLook').value,
    '性格：' + document.getElementById('pChar').value].join('\n');
  openAiPop('AI 生成人物小传', '请根据以下信息写一段 200 字左右的人物小传：\n' + info,
    (text) => { document.getElementById('pImp').value = text; });
});
document.getElementById('mAiBtn').addEventListener('click', () => {
  const title = document.getElementById('mTitle').value.trim();
  if (!title){ alert('请先填写影视名称'); return; }
  const year = document.getElementById('mYear').value.trim();
  const country = document.getElementById('mCountry').value.trim();
  openAiPop('AI 生成影视简介',
    '请为影视作品《' + title + '》写一段 150 字左右的简介。' + (year ? '年份：' + year + '。' : '') + (country ? '国别：' + country + '。' : ''),
    (text) => { document.getElementById('mDesc').value = text; });
});
document.getElementById('wcAiBtn').addEventListener('click', () => {
  const t = wcText.value.trim();
  if (!t){ alert('请先输入内容'); return; }
  openAiPop('AI 润色', '请润色以下文字，保持原意，让语句更流畅：\n\n' + t,
    (text) => { wcText.value = text; updateWC(); updateWordFreq(); });
});
document.getElementById('codeAiBtn').addEventListener('click', () => {
  const c = codeInputEl.value.trim();
  if (!c){ alert('请先输入代码'); return; }
  openAiPop('AI 解释代码', '请用中文解释以下代码的功能，并指出可能的问题：\n\n' + c, null);
});

/* ============================================================
   时间线
   ============================================================ */
let timelineEvents = [];
function saveTimeline(){ try { localStorage.setItem(TL_KEY, JSON.stringify(timelineEvents)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadTimeline(){
  try { const raw = localStorage.getItem(TL_KEY); if (raw) timelineEvents = JSON.parse(raw) || []; } catch(e){ timelineEvents = []; }
  renderTimeline();
}
function renderTimeline(){
  const list = document.getElementById('tlList');
  document.getElementById('tlCount').textContent = timelineEvents.length;
  if (timelineEvents.length === 0){ list.innerHTML = '<p class="empty">还没有事件，先在上方添加一条吧～</p>'; return; }
  list.innerHTML = timelineEvents.map(t => {
    return '<div class="tl-item"><div class="tl-actions"><button class="mini-btn danger" data-tldel="' + t.id + '">删除</button></div>' +
      (t.event_time ? '<span class="tl-time">' + esc(t.event_time) + '</span>' : '') +
      '<h4 class="tl-title">' + esc(t.title) + (t.category ? '<span class="tl-cat">' + esc(t.category) + '</span>' : '') + '</h4>' +
      (t.description ? '<p class="tl-desc">' + esc(t.description) + '</p>' : '') + '</div>';
  }).join('');
  list.querySelectorAll('[data-tldel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.tldel;
      const t = timelineEvents.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除「' + t.title + '」吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('timeline_events', id);
        timelineEvents = timelineEvents.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveTimeline();
        renderTimeline();
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}
document.getElementById('tlAdd').addEventListener('click', async () => {
  const title = document.getElementById('tlTitle').value.trim();
  if (!title){ alert('请填写标题～'); return; }
  const data = {
    title, event_time: document.getElementById('tlTime').value.trim(),
    category: document.getElementById('tlCat').value.trim(),
    description: document.getElementById('tlDesc').value.trim(),
    order_index: timelineEvents.length
  };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('timeline_events', data);
      timelineEvents.push(row);
    } else {
      timelineEvents.push({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data });
      if (!saveTimeline()){ timelineEvents.pop(); return; }
    }
    ['tlTitle','tlTime','tlCat','tlDesc'].forEach(id => document.getElementById(id).value = '');
    renderTimeline(); showToast('已添加事件');
  } catch(err){ alert('保存失败：' + err.message); }
});
document.getElementById('tlReset').addEventListener('click', () => {
  ['tlTitle','tlTime','tlCat','tlDesc'].forEach(id => document.getElementById(id).value = '');
});
document.getElementById('tlSort').addEventListener('click', () => {
  timelineEvents.sort((a,b) => String(a.event_time||'').localeCompare(String(b.event_time||'')));
  renderTimeline(); showToast('已按时间排序');
});

/* ============================================================
   对话生成器
   ============================================================ */
function parseDialogue(text){
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    const m = line.match(/^([^：:]+)[：:]\s*(.+)$/);
    if (m) return { speaker: m[1].trim(), text: m[2].trim() };
    return { speaker: '', text: line };
  });
}
document.getElementById('dlgGen').addEventListener('click', async () => {
  if (!currentUser){ showToast('请先登录再使用 AI'); go('login'); return; }
  const a = document.getElementById('dlgA').value.trim();
  const b = document.getElementById('dlgB').value.trim();
  const scene = document.getElementById('dlgScene').value.trim();
  const rounds = document.getElementById('dlgRounds').value;
  if (!a || !b){ alert('请填写两个角色名称'); return; }
  const log = document.getElementById('dlgLog');
  log.innerHTML = '<p class="empty">生成中…</p>';
  let extra = '';
  const pa = people.find(p => p.name === a);
  const pb = people.find(p => p.name === b);
  if (pa) extra += '\n【' + a + '设定】' + [pa.type, pa.role, pa.character, pa.look].filter(Boolean).join('，');
  if (pb) extra += '\n【' + b + '设定】' + [pb.type, pb.role, pb.character, pb.look].filter(Boolean).join('，');
  const prompt = `请模拟一段 ${a} 和 ${b} 之间的对话，共 ${rounds} 轮（每轮一人一句）。\n场景：${scene || '未指定'}` + extra +
    `\n\n格式要求：每行以「${a}：」或「${b}：」开头，一句一行，不要加旁白，不要解释。`;
  try {
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是小说对白生成器，只输出对话内容。' },
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || data.error || '生成失败';
    const lines = parseDialogue(text);
    if (!lines.length){ log.innerHTML = '<p class="empty">' + esc(text) + '</p>'; return; }
    log.innerHTML = lines.map(l => {
      const isA = l.speaker === a;
      const cls = isA ? 'a' : (l.speaker === b ? 'b' : '');
      return '<div class="dlg-line ' + cls + '">' +
        (l.speaker ? '<div class="dlg-speaker">' + esc(l.speaker) + '</div>' : '') +
        '<div class="dlg-text">' + esc(l.text) + '</div></div>';
    }).join('');
    updateQuota();
  } catch(err){ log.innerHTML = '<p class="empty">⚠️ ' + esc(err.message) + '</p>'; }
});
document.getElementById('dlgClear').addEventListener('click', () => {
  document.getElementById('dlgLog').innerHTML = '<p class="empty">还没有生成对话，点击上方按钮开始～</p>';
});

/* ============================================================
   随机灵感（本地随机 + AI 批量生成）
   ============================================================ */
const RNG_POOLS = {
  name: { pool: ['林清越','苏晚','沈砚','顾承轩','陆时衍','江辞','萧景行','楚言','谢知微','云舒','慕容昭','宋归','叶寒舟','裴书','柳眠'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } },
  place: { pool: ['云隐山','忘川渡','长夜城','碧落海','沧澜关','听雪楼','明月谷','九霄殿','无归岛','落霞坡','寒鸦岭','朱雀街','白鹭洲','烟雨巷','断桥'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } },
  appearance: { pool: ['眉眼清冷，唇角微勾','身姿挺拔，气质沉静','一双桃花眼，笑意不达眼底','短发利落，耳后有一颗小痣','面色苍白，唇色极淡','身形瘦削，指节分明','长发及腰，用一根木簪挽起','右眼下有一颗泪痣'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } },
  personality: { pool: ['外冷内热','嘴硬心软','谨慎多疑','疏离寡言','温和守礼','偏执固执','毒舌腹黑','天真迟钝','温柔坚韧','孤傲清高','八面玲珑','不按常理出牌'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } },
  conflict: { pool: ['昔日挚友反目成仇','为了保护对方而说出伤人的话','一个承诺却注定无法实现','立场不同却动了真心','身份暴露后的信任危机','以为对方已经死去，多年后重逢','因误会而错过','为了大局牺牲一人','复仇与宽恕的抉择'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } },
  opening: { pool: ['雨下了一整夜，他坐在窗边，等一个不会来的人。','剑鸣声在空谷中回荡，她握紧了手中的剑。','「你终于来了。」他抬起头，眼底有光。','那封信在她手里被反复摩挲，字迹已经模糊。','城门在身后缓缓关闭，他头也不回地走了。','这是她第三次梦见那个地方。','桌上那杯茶还温着，人却已经不见了。'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } },
  item: { pool: ['一枚刻着名字的玉佩','一把断剑','半张旧地图','褪色的红绳','一只空了的药瓶','母亲的遗物','刻满符文的古镜','未寄出的信','生锈的钥匙'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } },
  weather: { pool: ['细雨绵绵，空气里都是泥土味','大雪封城，天地一片素白','烈日当空，蝉鸣聒噪','秋风卷叶，满地金黄','浓雾弥漫，五步之内不见人影','月明星稀，夜风微凉','暴雨倾盆，雷声滚滚'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } },
  twist: { pool: ['一直帮助主角的人其实是幕后黑手','救下的陌生人正是要找的仇人','以为死去的角色其实还活着','所谓的敌人和自己有血缘关系','真相是主角自己的记忆被篡改','一直守护的东西其实早就碎了','主角身世另有隐情','预言中的救世主是个孩子'], make(){ return this.pool[Math.floor(Math.random()*this.pool.length)]; } }
};
let lastRngKey = 'name';
let rngAiBusy = false;
let rngHistory = [];

const RNG_META = {
  name:        { label: '人名',     desc: '中文人名，姓 + 名共 2-3 字，像真人的名字，避免网文里烂大街的用字' },
  place:       { label: '地名',     desc: '中文地名，2-4 字，有画面感和地理质感，适合做小说场景' },
  appearance:  { label: '外貌',     desc: '人物外貌特征，一句话 12-25 字，具体、有辨识度，不要空泛形容词' },
  personality: { label: '性格',     desc: '人物性格，2-6 字短语，具体有指向，不要「善良勇敢」这类套话' },
  conflict:    { label: '剧情冲突', desc: '小说剧情冲突，一句话，要有张力、有取舍、有代价' },
  opening:     { label: '开头句',   desc: '小说开篇第一句，15-35 字，有氛围、有留白，不要「很久很久以前」' },
  item:        { label: '道具',     desc: '故事里的关键道具，5-15 字，具体、带来历或故事感' },
  weather:     { label: '天气',     desc: '天气 + 氛围描写，8-20 字，要有感官细节' },
  twist:       { label: '反转',     desc: '剧情反转点，一句话，出人意料但回头看合理' }
};

(function injectRngUI(){
  if (document.getElementById('rngAiBtn')) return;
  const againBtn = document.getElementById('rngAgain');
  if (!againBtn) return;

  if (!document.getElementById('rngAiStyle')){
    const st = document.createElement('style');
    st.id = 'rngAiStyle';
    st.textContent =
      '.rng-ai-item{position:relative;padding:9px 44px 9px 13px;border-radius:9px;background:#fff;' +
      'border:1px solid var(--border);margin-bottom:7px;font-size:14.5px;line-height:1.7;' +
      'color:#3d444b;cursor:pointer;transition:.15s;word-break:break-word;}' +
      '.rng-ai-item:hover{border-color:var(--platinum);background:#f8f9fa;}' +
      '.rng-ai-item:last-child{margin-bottom:0;}' +
      '.rng-ai-item::after{content:"复制";position:absolute;right:12px;top:50%;transform:translateY(-50%);' +
      'font-size:11px;color:#c3c8d3;pointer-events:none;}' +
      '.rng-ai-item:hover::after{color:var(--primary);}';
    document.head.appendChild(st);
  }

  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px;';
  bar.innerHTML =
    '<input type="text" id="rngKeyword" placeholder="风格 / 关键词（选填），如：古风、雪夜、复仇" ' +
      'style="flex:1;min-width:180px;padding:9px 14px;border-radius:9px;border:1px solid var(--border);' +
      'background:#fafbfc;font-size:13.5px;outline:none;transition:.16s;">' +
    '<select id="rngCount" style="padding:9px 12px;border-radius:9px;border:1px solid var(--border);' +
      'background:#fafbfc;font-size:13.5px;cursor:pointer;outline:none;">' +
      '<option value="3">3 条</option>' +
      '<option value="6" selected>6 条</option>' +
      '<option value="10">10 条</option>' +
    '</select>' +
    '<button type="button" class="ai-btn" id="rngAiBtn" style="margin-right:0;">AI 生成一批</button>';

  againBtn.parentNode.insertBefore(bar, againBtn.nextSibling);
})();

function runRng(key){
  lastRngKey = key;
  const pool = RNG_POOLS[key];
  if (!pool) return;
  const box = document.getElementById('rngResult');
  box.textContent = pool.make();
}

async function aiRng(){
  if (rngAiBusy) return;
  if (!currentUser){ showToast('AI 生成需要先登录'); go('login'); return; }

  const key  = lastRngKey;
  const meta = RNG_META[key] || { label: '灵感', desc: '小说创作灵感' };
  const n    = parseInt(document.getElementById('rngCount').value, 10) || 6;
  const kw   = (document.getElementById('rngKeyword').value || '').trim();
  const box  = document.getElementById('rngResult');
  const btn  = document.getElementById('rngAiBtn');

  rngAiBusy = true;
  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = '生成中…';
  box.textContent = 'AI 正在生成 ' + n + ' 条【' + meta.label + '】…';

  const avoid = rngHistory.slice(-24);
  const prompt =
    '请生成 ' + n + ' 条【' + meta.label + '】，用于中文小说创作。\n' +
    '内容要求：' + meta.desc + '。\n' +
    '每条都要不一样，角度分散，不要重复用词。\n' +
    (kw ? '风格 / 关键词：' + kw + '。\n' : '') +
    (avoid.length ? '下面这些已经生成过了，请全部避开：\n' + avoid.join('\n') + '\n' : '') +
    '输出格式：每行一条，不要编号，不要引号，不要空行，不要任何解释。';

  try {
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是中文小说灵感生成器，只输出结果列表，绝不解释。' },
          { role: 'user',   content: prompt }
        ],
        stream: false
      })
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || data.error || '';

    const items = text.split('\n')
      .map(l => l
        .replace(/^\s*(?:\d+[.、)）]|[-*•·])\s*/, '')
        .replace(/^["“「『']+|["”」』']+$/g, '')
        .trim())
      .filter(Boolean)
      .slice(0, n);

    if (!items.length){
      box.textContent = text || '生成失败，请稍后重试';
      return;
    }

    rngHistory = rngHistory.concat(items);
    if (rngHistory.length > 80) rngHistory = rngHistory.slice(-80);

    box.innerHTML = items.map(t =>
      '<div class="rng-ai-item" data-copy="' + esc(t) + '">' + esc(t) + '</div>'
    ).join('');

    box.querySelectorAll('[data-copy]').forEach(el => {
      el.addEventListener('click', () => {
        navigator.clipboard.writeText(el.dataset.copy)
          .then(() => showToast('已复制：' + el.dataset.copy));
      });
    });

    updateQuota();
  } catch (err){
    box.textContent = '⚠️ ' + (err.message || err);
  } finally {
    rngAiBusy = false;
    btn.disabled = false;
    btn.textContent = oldText;
  }
}

document.querySelectorAll('.rng-chip').forEach(chip => {
  chip.addEventListener('click', () => runRng(chip.dataset.rng));
});
document.getElementById('rngAgain').addEventListener('click', () => runRng(lastRngKey));
document.getElementById('rngAiBtn').addEventListener('click', aiRng);
document.getElementById('rngKeyword').addEventListener('keydown', e => {
  if (e.key === 'Enter'){ e.preventDefault(); aiRng(); }
});

/* ============================================================
   起名器
   ============================================================ */
document.getElementById('nmGen').addEventListener('click', async () => {
  if (!currentUser){ showToast('请先登录再使用 AI'); go('login'); return; }
  const type = document.getElementById('nmType').value;
  const style = document.getElementById('nmStyle').value;
  const kw = document.getElementById('nmKeyword').value.trim();
  const list = document.getElementById('nmList');
  list.innerHTML = '<p class="empty">生成中…</p>';
  const prompt = `请生成 10 个${style}风格的${type}，${kw ? '可以关联关键词「' + kw + '」，' : ''}直接列出 10 个，每行一个，不要编号，不要解释。`;
  try {
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是起名助手，只输出名字，不要解释。' },
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || data.error || '生成失败';
    const names = text.split('\n').map(l => l.replace(/^\d+[.、)]\s*/,'').trim()).filter(Boolean).slice(0, 15);
    if (!names.length){ list.innerHTML = '<p class="empty">' + esc(text) + '</p>'; return; }
    list.innerHTML = names.map(n => '<span class="name-item" data-name="' + esc(n) + '">' + esc(n) + '<span class="star">☆</span></span>').join('');
    list.querySelectorAll('.name-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('star')){
          el.classList.toggle('faved');
          el.querySelector('.star').textContent = el.classList.contains('faved') ? '★' : '☆';
          return;
        }
        navigator.clipboard.writeText(el.dataset.name).then(() => showToast('已复制：' + el.dataset.name));
      });
    });
    updateQuota();
  } catch(err){ list.innerHTML = '<p class="empty">⚠️ ' + esc(err.message) + '</p>'; }
});
document.getElementById('nmClear').addEventListener('click', () => { document.getElementById('nmList').innerHTML = ''; });

/* ============================================================
   灵感速记
   ============================================================ */
let notes = [], noteSearchQ = '';
function saveNotes(){ try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadNotes(){
  try { const raw = localStorage.getItem(NOTES_KEY); if (raw) notes = JSON.parse(raw) || []; } catch(e){ notes = []; }
  renderNotes();
}
function renderNotes(){
  const list = document.getElementById('noteList');
  if (!list) return;
  const q = noteSearchQ.toLowerCase();
  let filtered = notes;
  if (q){ filtered = notes.filter(n => (n.content || '').toLowerCase().includes(q) || (n.tags || '').toLowerCase().includes(q)); }
  document.getElementById('noteCount').textContent = filtered.length;
  if (filtered.length === 0){
    list.innerHTML = '<p class="empty" style="grid-column:1/-1;">' + (q ? '没有匹配的灵感～' : '还没有灵感，先在上方写一条吧～') + '</p>';
    return;
  }
  list.innerHTML = filtered.map(n => {
    const tagArr = (n.tags || '').split(/[,，\s]+/).filter(Boolean);
    const dt = n.created_at ? new Date(n.created_at) : null;
    const timeStr = dt ? (dt.getFullYear() + '-' + pad2(dt.getMonth()+1) + '-' + pad2(dt.getDate()) + ' ' + pad2(dt.getHours()) + ':' + pad2(dt.getMinutes())) : '';
    return '<div class="note-card">' +
      '<button class="note-del" data-ndel="' + n.id + '" title="删除">✕</button>' +
      '<div class="note-content">' + esc(n.content) + '</div>' +
      (tagArr.length ? '<div class="note-tags">' + tagArr.map(t => '<span class="note-tag">#' + esc(t) + '</span>').join('') + '</div>' : '') +
      (timeStr ? '<div class="note-time">' + timeStr + '</div>' : '') + '</div>';
  }).join('');
  list.querySelectorAll('[data-ndel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.ndel;
      const t = notes.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除这条灵感吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('notes', id);
        notes = notes.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveNotes();
        renderNotes();
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}
document.getElementById('noteAdd').addEventListener('click', async () => {
  const content = document.getElementById('noteContent').value.trim();
  if (!content){ alert('请写点内容～'); return; }
  const tags = document.getElementById('noteTags').value.trim();
  const data = { content, tags };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('notes', data);
      notes.unshift(row);
    } else {
      notes.unshift({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() });
      if (!saveNotes()){ notes.shift(); return; }
    }
    document.getElementById('noteContent').value = '';
    document.getElementById('noteTags').value = '';
    renderNotes(); showToast('灵感已记录');
  } catch(err){ alert('保存失败：' + err.message); }
});
document.getElementById('noteSearch').addEventListener('input', e => { noteSearchQ = e.target.value.trim(); renderNotes(); });
document.getElementById('noteClearAll').addEventListener('click', async () => {
  if (notes.length === 0) return;
  if (!confirm('确定清空全部灵感吗？')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('notes').delete().eq('user_id', currentUser.id);
    notes = [];
    try { localStorage.removeItem(NOTES_KEY); } catch(e){}
    renderNotes(); showToast('灵感已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

/* ============================================================
   小说助手
   ============================================================ */
let novels = [], currentNovel = null, currentChapter = null;
let pendingNovelCover = '', pendingEditCover = '';
const CHAPTER_TYPES = ['前言','正文','番外','附录','后记','作者的话'];
const TYPE_COLORS = { '前言':'#737b84','正文':'#8ba6c0','番外':'#8fb59a','附录':'#c8a468','后记':'#a69bbf','作者的话':'#c996ad' };

function loadNovels(){
  try { const raw = localStorage.getItem(NOVELS_KEY); if (raw) novels = JSON.parse(raw) || []; } catch(e){ novels = []; }
}
function saveNovelsLocal(){ try { localStorage.setItem(NOVELS_KEY, JSON.stringify(novels)); return true; } catch(e){ return false; } }
function loadChaptersLocal(){
  try { const raw = localStorage.getItem(CHAPTERS_KEY); return raw ? JSON.parse(raw) || [] : []; } catch(e){ return []; }
}
function saveChaptersLocal(arr){ try { localStorage.setItem(CHAPTERS_KEY, JSON.stringify(arr)); return true; } catch(e){ return false; } }

async function fetchChapters(novelId){
  if (appMode === 'cloud' && currentUser){
    const { data, error } = await sb.from('novel_chapters').select('*').eq('novel_id', novelId).order('order_index', { ascending: true });
    if (error){ console.warn(error); return []; }
    return data || [];
  }
  return loadChaptersLocal().filter(c => String(c.novel_id) === String(novelId)).sort((a,b) => (a.order_index||0) - (b.order_index||0));
}
function countChars(text){ if (!text) return 0; return text.replace(/\s/g,'').length; }
function isToday(d){
  if (!d) return false;
  const t = new Date(d); const n = new Date();
  return t.getFullYear() === n.getFullYear() && t.getMonth() === n.getMonth() && t.getDate() === n.getDate();
}

document.getElementById('nvCover').addEventListener('change', e => {
  const file = e.target.files[0];
  const preview = document.getElementById('nvCoverPreview');
  if (!file){ pendingNovelCover = ''; preview.textContent = '未选择'; return; }
  if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }
  preview.textContent = '处理中…';
  compressImage(file, 600, 0.78, dataUrl => {
    pendingNovelCover = dataUrl;
    preview.innerHTML = '<img src="' + dataUrl + '" alt="">';
  });
});

async function renderNovelList(){
  const list = document.getElementById('novelList');
  document.getElementById('nvCount').textContent = novels.length;
  let grandTotal = 0, totalChapters = 0, todayNew = 0;
  const counts = {};
  const gatherChapters = async (novelId) => {
    if (appMode === 'cloud' && currentUser){
      const { data, error } = await sb.from('novel_chapters').select('*').eq('novel_id', novelId);
      if (error) return [];
      return data || [];
    }
    return loadChaptersLocal().filter(c => String(c.novel_id) === String(novelId));
  };
  for (const n of novels){
    const chs = await gatherChapters(n.id);
    const words = chs.reduce((a,c) => a + countChars(c.content), 0);
    counts[n.id] = { chapters: chs.length, words };
    grandTotal += words; totalChapters += chs.length;
    chs.forEach(c => { const when = c.updated_at || c.created_at; if (isToday(when)) todayNew += countChars(c.content); });
  }
  document.getElementById('nvGrandTotal').textContent = grandTotal.toLocaleString();
  document.getElementById('nvGrandSub').textContent = '共 ' + novels.length + ' 本小说 · ' + totalChapters + ' 章';
  document.getElementById('nvStatToday').textContent = todayNew.toLocaleString();
  document.getElementById('nvStatAvg').textContent = novels.length ? Math.round(grandTotal / novels.length).toLocaleString() : '0';
  if (novels.length === 0){
    list.innerHTML = '<p class="empty" style="grid-column:1/-1;">还没有小说，先在上方新建一本吧～</p>';
    return;
  }
  list.innerHTML = novels.map(n => {
    const c = counts[n.id] || { chapters: 0, words: 0 };
    const coverHtml = n.cover
      ? '<img src="' + n.cover + '" alt="">'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    return '<div class="novel-card" data-nvid="' + n.id + '">' +
      '<button class="del-btn" data-nvdel="' + n.id + '" title="删除">✕</button>' +
      '<div class="novel-cover">' + coverHtml + '</div>' +
      '<div class="novel-body">' +
        '<h3>' + esc(n.title) + '</h3>' +
        '<div class="novel-meta"><b>' + c.words.toLocaleString() + '</b> 字 · ' + c.chapters + ' 章</div>' +
        (n.synopsis ? '<p class="novel-syn">' + esc(n.synopsis) + '</p>' : '') +
      '</div></div>';
  }).join('');
  list.querySelectorAll('.novel-card').forEach(card => {
    card.addEventListener('click', e => { if (e.target.classList.contains('del-btn')) return; openNovel(card.dataset.nvid); });
  });
  list.querySelectorAll('[data-nvdel]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = btn.dataset.nvdel;
      const n = novels.find(x => String(x.id) === String(id));
      if (!n || !confirm('确定删除「' + n.title + '」及其所有章节吗？此操作不可恢复。')) return;
      try {
        if (appMode === 'cloud' && currentUser){ await sb.from('novels').delete().eq('id', id); }
        else { saveChaptersLocal(loadChaptersLocal().filter(c => String(c.novel_id) !== String(id))); }
        novels = novels.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveNovelsLocal();
        renderNovelList(); showToast('已删除小说');
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}

document.getElementById('nvCreate').addEventListener('click', async () => {
  const title = document.getElementById('nvTitle').value.trim();
  if (!title){ alert('请填写小说名称～'); return; }
  const synopsis = document.getElementById('nvSyn').value.trim();
  const data = { title, synopsis, cover: pendingNovelCover || '' };
  try {
    if (appMode === 'cloud' && currentUser){
      const { data: row, error } = await sb.from('novels').insert({ ...data, user_id: currentUser.id }).select().single();
      if (error) throw error;
      novels.push(row);
    } else {
      const row = { id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() };
      novels.push(row);
      if (!saveNovelsLocal()){ novels.pop(); return; }
    }
    document.getElementById('nvTitle').value = '';
    document.getElementById('nvSyn').value = '';
    document.getElementById('nvCover').value = '';
    document.getElementById('nvCoverPreview').textContent = '未选择';
    pendingNovelCover = '';
    renderNovelList(); showToast('已新建小说');
  } catch(err){ alert('新建失败：' + err.message); }
});

async function openNovel(id){
  currentNovel = novels.find(n => String(n.id) === String(id));
  if (!currentNovel) return;
  document.getElementById('novelListView').style.display = 'none';
  document.getElementById('novelEditView').style.display = '';
  document.getElementById('nvEditTitle').textContent = currentNovel.title;
  document.getElementById('nvEditSyn').textContent = currentNovel.synopsis || '';
  const coverBox = document.getElementById('nvEditCover');
  if (currentNovel.cover){
    coverBox.innerHTML = '<img src="' + currentNovel.cover + '" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">';
  } else {
    coverBox.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:34px;height:34px;color:#a9afb6;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
  }
  currentChapter = null;
  document.getElementById('chapterTitleInput').value = '';
  document.getElementById('chapterContent').value = '';
  document.getElementById('chWc').textContent = '0';
  await refreshChapterList();
}

document.getElementById('nvEditCoverBtn').addEventListener('click', () => {
  document.getElementById('nvEditCoverInput').click();
});
document.getElementById('nvEditCoverInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file){ return; }
  if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }
  compressImage(file, 600, 0.78, async dataUrl => {
    pendingEditCover = dataUrl;
    try {
      if (appMode === 'cloud' && currentUser){
        await cloudUpdate('novels', currentNovel.id, { cover: dataUrl });
      } else {
        const i = novels.findIndex(n => String(n.id) === String(currentNovel.id));
        if (i >= 0){ novels[i].cover = dataUrl; saveNovelsLocal(); }
      }
      currentNovel.cover = dataUrl;
      const coverBox = document.getElementById('nvEditCover');
      coverBox.innerHTML = '<img src="' + dataUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">';
      showToast('封面已更新');
    } catch(err){ alert('更新失败：' + err.message); }
  });
});

async function refreshChapterList(){
  if (!currentNovel) return;
  const chapters = await fetchChapters(currentNovel.id);
  const list = document.getElementById('chapterList');
  if (chapters.length === 0){
    list.innerHTML = '<p class="empty">还没有章节，点击上方「新章节」创建～</p>';
  } else {
    list.innerHTML = '<div class="chapter-list-head"><span>章节列表</span><span>' + chapters.length + ' 章</span></div>' +
      chapters.map(c => {
        const wc = countChars(c.content);
        const ct = c.chapter_type || '正文';
        const cls = 'chapter-item' + (currentChapter && String(currentChapter.id) === String(c.id) ? ' active' : '');
        return '<div class="' + cls + '" data-chid="' + c.id + '">' +
          '<span class="chapter-title">' + esc(c.title) +
            '<span class="chapter-type-badge">' + esc(ct) + '</span>' +
          '</span>' +
          '<span class="chapter-wc">' + wc + ' 字</span></div>';
      }).join('');
    list.querySelectorAll('.chapter-item').forEach(el => el.addEventListener('click', () => openChapter(el.dataset.chid)));
    renderNovelTypeChart(chapters);
  }
  const total = chapters.reduce((a,c) => a + countChars(c.content), 0);
  document.getElementById('nvEditMeta').textContent = chapters.length + ' 章 · ' + total.toLocaleString() + ' 字';
  document.getElementById('nvWc').textContent = total.toLocaleString();
}

function renderNovelTypeChart(chapters){
  if (!chapters) return;
  const stats = {};
  CHAPTER_TYPES.forEach(t => stats[t] = 0);
  chapters.forEach(c => {
    const t = c.chapter_type || '正文';
    stats[t] = (stats[t] || 0) + countChars(c.content);
  });
  const statsEl = document.getElementById('nvTypeStats');
  statsEl.innerHTML = CHAPTER_TYPES.map(t =>
    '<div class="type-stat-chip"><span class="dot" style="background:' + TYPE_COLORS[t] + '"></span>' +
    esc(t) + ' <b>' + stats[t].toLocaleString() + '</b> 字</div>'
  ).join('');
  const canvas = document.getElementById('nvTypeChart');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const cssW = Math.max(280, wrap.clientWidth - 32);
  const cssH = 200;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  const data = CHAPTER_TYPES.map(t => ({ label: t, value: stats[t], color: TYPE_COLORS[t] }));
  const maxV = Math.max(...data.map(d => d.value), 1);
  const pad = { l: 50, r: 16, t: 20, b: 40 };
  const pw = cssW - pad.l - pad.r;
  const ph = cssH - pad.t - pad.b;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++){
    const v = maxV * i / 4;
    const y = pad.t + ph - (v / maxV) * ph;
    ctx.strokeStyle = '#eef0f5';
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + pw, y); ctx.stroke();
    ctx.fillStyle = '#9aa1b1';
    ctx.fillText(formatNum(Math.round(v)), pad.l - 6, y);
  }
  const slot = pw / data.length;
  const bw = Math.min(slot * 0.55, 56);
  data.forEach((d, i) => {
    const cx = pad.l + slot * i + slot / 2;
    const bh = (d.value / maxV) * ph;
    const yTop = pad.t + ph - bh;
    ctx.fillStyle = d.color;
    roundRect(ctx, cx - bw / 2, yTop, bw, Math.max(bh, 2), 5);
    ctx.fill();
    if (d.value > 0){
      ctx.fillStyle = '#4b5563';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(d.value.toLocaleString(), cx, yTop - 4);
    }
    ctx.fillStyle = '#6f7680';
    ctx.font = '11.5px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(d.label, cx, pad.t + ph + 10);
  });
  ctx.strokeStyle = '#d9dce6';
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph);
  ctx.stroke();
}

async function openChapter(id){
  if (!currentNovel) return;
  const chapters = await fetchChapters(currentNovel.id);
  const ch = chapters.find(c => String(c.id) === String(id));
  if (!ch) return;
  currentChapter = ch;
  document.getElementById('chapterTitleInput').value = ch.title || '';
  document.getElementById('chapterContent').value = ch.content || '';
  document.getElementById('chapterTypeSelect').value = ch.chapter_type || '正文';
  document.getElementById('chWc').textContent = countChars(ch.content);
  await refreshChapterList();
}

document.getElementById('chAdd').addEventListener('click', async () => {
  if (!currentNovel) return;
  const chapters = await fetchChapters(currentNovel.id);
  const title = '第 ' + (chapters.length + 1) + ' 章';
  const data = { novel_id: currentNovel.id, title, content: '', order_index: chapters.length, chapter_type: '正文' };
  try {
    if (appMode === 'cloud' && currentUser){
      const { data: row, error } = await sb.from('novel_chapters').insert({ ...data, user_id: currentUser.id }).select().single();
      if (error) throw error;
      currentChapter = row;
    } else {
      const row = { id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() };
      const all = loadChaptersLocal();
      all.push(row);
      if (!saveChaptersLocal(all)) return;
      currentChapter = row;
    }
    document.getElementById('chapterTitleInput').value = title;
    document.getElementById('chapterContent').value = '';
    document.getElementById('chapterTypeSelect').value = '正文';
    document.getElementById('chWc').textContent = '0';
    await refreshChapterList(); showToast('已新建章节');
  } catch(err){ alert('新建失败：' + err.message); }
});

document.getElementById('chSave').addEventListener('click', async () => {
  if (!currentNovel || !currentChapter){ showToast('请先选择或新建章节'); return; }
  const title = document.getElementById('chapterTitleInput').value.trim() || '未命名';
  const content = document.getElementById('chapterContent').value;
  const chapter_type = document.getElementById('chapterTypeSelect').value;
  try {
    if (appMode === 'cloud' && currentUser){
      const { error } = await sb.from('novel_chapters').update({
        title, content, chapter_type, updated_at: new Date().toISOString()
      }).eq('id', currentChapter.id);
      if (error) throw error;
      currentChapter.title = title; currentChapter.content = content; currentChapter.chapter_type = chapter_type;
    } else {
      const all = loadChaptersLocal();
      const i = all.findIndex(c => String(c.id) === String(currentChapter.id));
      if (i < 0) throw new Error('章节不存在');
      all[i] = { ...all[i], title, content, chapter_type, updated_at: new Date().toISOString() };
      if (!saveChaptersLocal(all)) throw new Error('本地保存失败');
      currentChapter = all[i];
    }
    document.getElementById('chWc').textContent = countChars(content);
    await refreshChapterList(); showToast('已保存');
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('chapterContent').addEventListener('input', e => {
  document.getElementById('chWc').textContent = countChars(e.target.value);
});

document.getElementById('chDelete').addEventListener('click', async () => {
  if (!currentChapter) return;
  if (!confirm('确定删除本章吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser){
      const { error } = await sb.from('novel_chapters').delete().eq('id', currentChapter.id);
      if (error) throw error;
    } else {
      saveChaptersLocal(loadChaptersLocal().filter(c => String(c.id) !== String(currentChapter.id)));
    }
    currentChapter = null;
    document.getElementById('chapterTitleInput').value = '';
    document.getElementById('chapterContent').value = '';
    document.getElementById('chWc').textContent = '0';
    await refreshChapterList(); showToast('已删除章节');
  } catch(err){ alert('删除失败：' + err.message); }
});

document.getElementById('nvBack').addEventListener('click', async () => {
  document.getElementById('novelListView').style.display = '';
  document.getElementById('novelEditView').style.display = 'none';
  currentNovel = null; currentChapter = null;
  await renderNovelList();
});

document.getElementById('nvRename').addEventListener('click', async () => {
  if (!currentNovel) return;
  const newTitle = prompt('新的小说名称：', currentNovel.title);
  if (!newTitle || newTitle.trim() === currentNovel.title) return;
  try {
    if (appMode === 'cloud' && currentUser){
      const { error } = await sb.from('novels').update({ title: newTitle.trim(), updated_at: new Date().toISOString() }).eq('id', currentNovel.id);
      if (error) throw error;
    } else {
      const i = novels.findIndex(n => String(n.id) === String(currentNovel.id));
      if (i >= 0){ novels[i].title = newTitle.trim(); saveNovelsLocal(); }
    }
    currentNovel.title = newTitle.trim();
    document.getElementById('nvEditTitle').textContent = currentNovel.title;
    showToast('已重命名');
  } catch(err){ alert('重命名失败：' + err.message); }
});

document.getElementById('nvDelete').addEventListener('click', async () => {
  if (!currentNovel) return;
  if (!confirm('确定删除「' + currentNovel.title + '」及其所有章节吗？')) return;
  try {
    if (appMode === 'cloud' && currentUser){ await sb.from('novels').delete().eq('id', currentNovel.id); }
    else { saveChaptersLocal(loadChaptersLocal().filter(c => String(c.novel_id) !== String(currentNovel.id))); }
    novels = novels.filter(n => String(n.id) !== String(currentNovel.id));
    if (appMode === 'local') saveNovelsLocal();
    currentNovel = null; currentChapter = null;
    document.getElementById('novelListView').style.display = '';
    document.getElementById('novelEditView').style.display = 'none';
    await renderNovelList(); showToast('已删除小说');
  } catch(err){ alert('删除失败：' + err.message); }
});

document.getElementById('nvExportTxt').addEventListener('click', async () => {
  if (!currentNovel) return;
  const chapters = await fetchChapters(currentNovel.id);
  const lines = [currentNovel.title, ''];
  if (currentNovel.synopsis) lines.push('简介：' + currentNovel.synopsis, '');
  chapters.forEach(c => {
    lines.push('【' + (c.chapter_type || '正文') + '】' + c.title, '', c.content || '', '');
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = currentNovel.title + '_' + timeStamp(new Date()) + '.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
  showToast('已导出 TXT');
});

document.getElementById('nvExportHtml').addEventListener('click', async () => {
  if (!currentNovel) return;
  const chapters = await fetchChapters(currentNovel.id);
  const totalWc = chapters.reduce((a,c) => a + countChars(c.content), 0);
  const body = chapters.map(c => {
    const ct = c.chapter_type || '正文';
    return '<section class="ch"><h2>' + esc(c.title) +
      '<span style="font-size:12px;color:#9ca3af;margin-left:10px;font-weight:400;">[' + esc(ct) + ']</span></h2>' +
      esc(c.content || '').split('\n').map(p => p.trim() ? '<p>' + p + '</p>' : '').join('') + '</section>';
  }).join('\n');
  const html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>' + esc(currentNovel.title) + '</title><style>' +
    'body{font-family:"Songti SC","STSong","PingFang SC",serif;max-width:760px;margin:0 auto;padding:48px 32px 80px;line-height:2;color:#1c1f23;background:#fafaf7;}' +
    'h1{font-size:28px;text-align:center;margin:0 0 12px;letter-spacing:4px;}' +
    '.meta{text-align:center;color:#9ca3af;font-size:13px;margin-bottom:12px;}' +
    '.syn{color:#6f7680;font-size:14px;text-align:center;margin-bottom:38px;padding-bottom:22px;border-bottom:1px solid #e3e6ea;}' +
    '.ch{margin-bottom:44px;}.ch h2{font-size:19px;margin:32px 0 16px;}.ch p{margin:0 0 14px;text-indent:2em;font-size:16px;}' +
    '</style></head><body><h1>' + esc(currentNovel.title) + '</h1>' +
    '<p class="meta">共 ' + chapters.length + ' 章 · ' + totalWc.toLocaleString() + ' 字</p>' +
    (currentNovel.synopsis ? '<p class="syn">' + esc(currentNovel.synopsis) + '</p>' : '') +
    body + '</body></html>';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = currentNovel.title + '_' + timeStamp(new Date()) + '.html';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
  showToast('已导出 HTML');
});

loadNovels();
renderNovelList();

/* ============================================================
   健康管理
   ============================================================ */
document.querySelectorAll('#page-health .ta-subtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#page-health .ta-subtab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.hl;
    document.querySelectorAll('#page-health .ta-subpage').forEach(p => p.classList.toggle('active', p.dataset.hlPage === target));
    if (target === 'bmi')   updateBmi();
    if (target === 'shoe')  { updateShoeCalc(); renderShoeTable(); }
    if (target === 'sleep') { renderSleepList(); renderSleepChart(); }
    if (target === 'vital') renderVitalList();
  });
});

/* ---------- BMI ---------- */
const bmiHeightEl     = document.getElementById('bmiHeight');
const bmiHeightUnitEl = document.getElementById('bmiHeightUnit');
const bmiWeightEl     = document.getElementById('bmiWeight');
const bmiWeightUnitEl = document.getElementById('bmiWeightUnit');
const bmiResultEl     = document.getElementById('bmiResult');

function getHeightM(){
  const v = parseFloat(bmiHeightEl.value);
  if (!isFinite(v) || v <= 0) return 0;
  return bmiHeightUnitEl.value === 'cm' ? v / 100 : v;
}
function getWeightKg(){
  const v = parseFloat(bmiWeightEl.value);
  if (!isFinite(v) || v <= 0) return 0;
  const u = bmiWeightUnitEl.value;
  if (u === '斤') return v * 0.5;
  if (u === 'lb') return v * 0.45359237;
  return v;
}
function updateBmi(){
  if (!bmiResultEl) return;
  const h = getHeightM(), w = getWeightKg();
  if (!h || !w){
    bmiResultEl.innerHTML =
      '<div class="bmi-value" style="color:#9ca3af;">—</div>' +
      '<div style="text-align:center;color:var(--muted);font-size:13.5px;margin-top:8px;">请输入身高与体重</div>';
    return;
  }
  const bmi = w / (h * h);
  let label, color, bg;
  if (bmi < 18.5){ label = '偏瘦'; color = '#5f7ea4'; bg = '#eff3f7'; }
  else if (bmi < 24){ label = '正常'; color = '#3f6b52'; bg = '#ecf3ee'; }
  else if (bmi < 28){ label = '偏胖'; color = '#8a6414'; bg = '#faf3e3'; }
  else { label = '肥胖'; color = '#8f3a3a'; bg = '#fbeaea'; }
  const idealMin = 18.5 * h * h, idealMax = 23.9 * h * h;
  bmiResultEl.innerHTML =
    '<div class="bmi-value" style="color:' + color + '">' + bmi.toFixed(1) + '</div>' +
    '<div style="text-align:center;"><span class="bmi-tag" style="color:' + color + ';background:' + bg + ';">' + label + '</span></div>' +
    '<div class="bmi-ideal">理想体重区间（BMI 18.5 - 23.9）：<b>' + idealMin.toFixed(1) + ' ~ ' + idealMax.toFixed(1) + ' kg</b></div>';
}
[bmiHeightEl, bmiWeightEl].forEach(el => el && el.addEventListener('input', updateBmi));
[bmiHeightUnitEl, bmiWeightUnitEl].forEach(el => el && el.addEventListener('change', updateBmi));
updateBmi();

/* ---------- 鞋码计算 ---------- */
const shoeLengthEl = document.getElementById('shoeLength');
const shoeLengthUnitEl = document.getElementById('shoeLengthUnit');
const shoeAgeEl = document.getElementById('shoeAge');
const shoeGenderEl = document.getElementById('shoeGender');
const shoeResultBox = document.getElementById('shoeResultBox');

const SHOE_ADULT_TABLE = [
  { cm:22.0, cn:220, eu:35,   us_m:3.5,  us_f:5.0,  uk:2.5,  jp:22.0 },
  { cm:22.5, cn:225, eu:36,   us_m:4.0,  us_f:5.5,  uk:3.5,  jp:22.5 },
  { cm:23.0, cn:230, eu:36.5, us_m:4.5,  us_f:6.0,  uk:4.0,  jp:23.0 },
  { cm:23.5, cn:235, eu:37.5, us_m:5.0,  us_f:6.5,  uk:4.5,  jp:23.5 },
  { cm:24.0, cn:240, eu:38,   us_m:5.5,  us_f:7.0,  uk:5.0,  jp:24.0 },
  { cm:24.5, cn:245, eu:39,   us_m:6.5,  us_f:7.5,  uk:6.0,  jp:24.5 },
  { cm:25.0, cn:250, eu:40,   us_m:7.0,  us_f:8.0,  uk:6.5,  jp:25.0 },
  { cm:25.5, cn:255, eu:40.5, us_m:7.5,  us_f:8.5,  uk:7.0,  jp:25.5 },
  { cm:26.0, cn:260, eu:41,   us_m:8.0,  us_f:9.0,  uk:7.5,  jp:26.0 },
  { cm:26.5, cn:265, eu:42,   us_m:8.5,  us_f:9.5,  uk:8.0,  jp:26.5 },
  { cm:27.0, cn:270, eu:42.5, us_m:9.0,  us_f:10.0, uk:8.5,  jp:27.0 },
  { cm:27.5, cn:275, eu:43,   us_m:9.5,  us_f:10.5, uk:9.0,  jp:27.5 },
  { cm:28.0, cn:280, eu:44,   us_m:10.0, us_f:11.0, uk:9.5,  jp:28.0 },
  { cm:28.5, cn:285, eu:44.5, us_m:10.5, us_f:11.5, uk:10.0, jp:28.5 },
  { cm:29.0, cn:290, eu:45,   us_m:11.0, us_f:12.0, uk:10.5, jp:29.0 },
  { cm:29.5, cn:295, eu:45.5, us_m:11.5, us_f:12.5, uk:11.0, jp:29.5 },
  { cm:30.0, cn:300, eu:46,   us_m:12.0, us_f:13.0, uk:11.5, jp:30.0 },
];
const SHOE_KIDS_TABLE = [
  { cm:14.0, cn:140, eu:23, us:7.0,  uk:6.5,  age:'1 - 2 岁' },
  { cm:15.0, cn:150, eu:24, us:8.0,  uk:7.5,  age:'2 - 3 岁' },
  { cm:16.0, cn:160, eu:26, us:9.0,  uk:8.5,  age:'3 - 4 岁' },
  { cm:17.0, cn:170, eu:27, us:10.0, uk:9.5,  age:'4 - 5 岁' },
  { cm:18.0, cn:180, eu:29, us:11.0, uk:10.5, age:'5 - 6 岁' },
  { cm:19.0, cn:190, eu:30, us:12.0, uk:11.5, age:'6 - 7 岁' },
  { cm:20.0, cn:200, eu:31, us:13.0, uk:12.5, age:'7 - 8 岁' },
  { cm:21.0, cn:210, eu:32, us:1.0,  uk:13.0, age:'8 - 10 岁' },
];
function findNearestAdult(cm){
  let best = SHOE_ADULT_TABLE[0], bestDiff = Infinity;
  SHOE_ADULT_TABLE.forEach(r => {
    const diff = Math.abs(r.cm - cm);
    if (diff < bestDiff){ bestDiff = diff; best = r; }
  });
  return best;
}
function findNearestKid(cm){
  let best = SHOE_KIDS_TABLE[0], bestDiff = Infinity;
  SHOE_KIDS_TABLE.forEach(r => {
    const diff = Math.abs(r.cm - cm);
    if (diff < bestDiff){ bestDiff = diff; best = r; }
  });
  return best;
}
function updateShoeCalc(){
  const raw = shoeLengthEl.value.trim();
  const ageRaw = shoeAgeEl.value.trim();
  const unit = shoeLengthUnitEl.value;
  const gender = shoeGenderEl.value;
  let cm = parseFloat(raw);
  if (unit === 'mm') cm = cm / 10;

  if (!raw || !isFinite(cm) || cm <= 0 || !ageRaw){
    shoeResultBox.innerHTML =
      '<div class="mc-res-label">鞋码推荐</div>' +
      '<div class="mc-res-value">—</div>' +
      '<div class="mc-res-sub">请输入脚长与年龄</div>';
    return;
  }
  const age = parseInt(ageRaw, 10);
  if (!isFinite(age) || age < 0){
    shoeResultBox.innerHTML =
      '<div class="mc-res-label">鞋码推荐</div>' +
      '<div class="mc-res-value">—</div>' +
      '<div class="mc-res-sub">年龄请填写正整数</div>';
    return;
  }
  const isKid = age < 14;
  if (isKid){
    const r = findNearestKid(cm);
    shoeResultBox.innerHTML =
      '<div class="mc-res-label">脚长 ' + esc(fmtNum(cm)) + ' cm　·　年龄 ' + esc(age) + ' 岁（童鞋）</div>' +
      '<div class="mc-res-value">中国码 ' + r.cn + '　/　欧码 EU ' + r.eu + '</div>' +
      '<div class="mc-res-sub">美码 US ' + r.us + '　·　英码 UK ' + r.uk + '　·　参考年龄段 ' + r.age + '<br>结果仅供参考，请以实际试穿为准</div>';
  } else {
    const r = findNearestAdult(cm);
    const us = gender === 'male' ? r.us_m : r.us_f;
    shoeResultBox.innerHTML =
      '<div class="mc-res-label">脚长 ' + esc(fmtNum(cm)) + ' cm　·　成人 ' + (gender === 'male' ? '男' : '女') + '</div>' +
      '<div class="mc-res-value">中国码 ' + r.cn + '　/　欧码 EU ' + r.eu + '　/　美码 US ' + us + '</div>' +
      '<div class="mc-res-sub">英码 UK ' + r.uk + '　·　日码 JP ' + r.jp + ' cm<br>不同品牌、鞋型略有差异，结果仅供参考</div>';
  }
}
function renderShoeTable(){
  const tbA = document.querySelector('#shoeTableAdult tbody');
  const tbK = document.querySelector('#shoeTableKids tbody');
  if (tbA){
    tbA.innerHTML = SHOE_ADULT_TABLE.map(r =>
      '<tr><td>' + r.cm.toFixed(1) + '</td><td>' + r.cn + '</td><td>' + r.eu + '</td><td>' + r.us_m + '</td><td>' + r.us_f + '</td><td>' + r.uk + '</td><td>' + r.jp.toFixed(1) + '</td></tr>'
    ).join('');
  }
  if (tbK){
    tbK.innerHTML = SHOE_KIDS_TABLE.map(r =>
      '<tr><td>' + r.cm.toFixed(1) + '</td><td>' + r.cn + '</td><td>' + r.eu + '</td><td>' + r.us + '</td><td>' + r.uk + '</td><td>' + r.age + '</td></tr>'
    ).join('');
  }
}
[shoeLengthEl, shoeAgeEl].forEach(el => el && el.addEventListener('input', updateShoeCalc));
[shoeLengthUnitEl, shoeGenderEl].forEach(el => el && el.addEventListener('change', updateShoeCalc));
renderShoeTable();

/* ---------- 睡眠记录 ---------- */
let sleepRecords = [];
function saveSleep(){ try { localStorage.setItem(SLEEP_KEY, JSON.stringify(sleepRecords)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadSleep(){
  try { const raw = localStorage.getItem(SLEEP_KEY); if (raw) sleepRecords = JSON.parse(raw) || []; } catch(e){ sleepRecords = []; }
}

function calcSleepMinutes(bed, wake){
  function parseT(t){
    const m = String(t || '').trim().match(/^(\d{1,2})\s*[:：]\s*(\d{1,2})$/);
    if (!m) return null;
    const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
    const mi = Math.min(59, Math.max(0, parseInt(m[2], 10)));
    return h * 60 + mi;
  }
  const b = parseT(bed), w = parseT(wake);
  if (b === null || w === null) return null;
  let diff = w - b;
  if (diff === 0) return 0;
  if (diff < 0) diff += 24 * 60;
  return diff;
}
function fmtDuration(min){
  if (min === null || !isFinite(min)) return '—';
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return m + ' 分钟';
  return h + ' 小时 ' + (m ? m + ' 分' : '');
}

(function initSleepDate(){
  const d = new Date();
  const el = document.getElementById('slpDate');
  if (el) el.value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
})();

document.getElementById('slpToday').addEventListener('click', () => {
  const d = new Date();
  document.getElementById('slpDate').value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
});
document.getElementById('slpReset').addEventListener('click', () => {
  ['slpBed','slpWake','slpNote'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('slpQuality').value = '一般';
  const d = new Date();
  document.getElementById('slpDate').value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
});

document.getElementById('slpAdd').addEventListener('click', async () => {
  const date = document.getElementById('slpDate').value.trim();
  const bed  = document.getElementById('slpBed').value.trim();
  const wake = document.getElementById('slpWake').value.trim();
  const quality = document.getElementById('slpQuality').value;
  const note = document.getElementById('slpNote').value.trim();
  if (!date){ alert('请填写日期～'); return; }
  if (!bed || !wake){ alert('请填写入睡与起床时间～'); return; }
  const min = calcSleepMinutes(bed, wake);
  if (min === null){ alert('时间格式有误，请使用 23:30 这样的格式'); return; }
  if (min === 0){ alert('入睡时间与起床时间相同，请检查'); return; }

  const data = { date, bed_time: bed, wake_time: wake, duration_min: min, quality, note };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('sleep_records', data);
      sleepRecords.push(row);
    } else {
      sleepRecords.push({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() });
      if (!saveSleep()){ sleepRecords.pop(); return; }
    }
    document.getElementById('slpBed').value = '';
    document.getElementById('slpWake').value = '';
    document.getElementById('slpNote').value = '';
    renderSleepList(); renderSleepChart();
    showToast('已记录：' + fmtDuration(min));
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('slpClearAll').addEventListener('click', async () => {
  if (sleepRecords.length === 0) return;
  if (!confirm('确定清空全部睡眠记录吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('sleep_records').delete().eq('user_id', currentUser.id);
    sleepRecords = [];
    try { localStorage.removeItem(SLEEP_KEY); } catch(e){}
    renderSleepList(); renderSleepChart(); showToast('睡眠记录已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

function renderSleepList(){
  const list = document.getElementById('slpList');
  if (!list) return;
  document.getElementById('slpCount').textContent = sleepRecords.length;
  if (sleepRecords.length === 0){
    list.innerHTML = '<p class="empty">还没有睡眠记录，先在上方添加一条吧～</p>';
    return;
  }
  const sorted = sleepRecords.slice().sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
  list.innerHTML = sorted.map(r => {
    const min = r.duration_min;
    let badgeCls = 'ok', badgeText = '良好';
    if (min < 360){ badgeCls = 'bad'; badgeText = '偏少'; }
    else if (min < 420){ badgeCls = 'warn'; badgeText = '略少'; }
    else if (min > 600){ badgeCls = 'warn'; badgeText = '偏多'; }
    else { badgeCls = 'ok'; badgeText = '良好'; }
    return '<div class="vital-item">' +
      '<span class="vital-item-date">' + esc(r.date || '—') + '</span>' +
      '<span class="vital-item-main">' +
        '<b>' + esc(r.bed_time || '—') + ' → ' + esc(r.wake_time || '—') + '</b>' +
        '　·　' + fmtDuration(min) +
        (r.quality ? '　·　质量 ' + esc(r.quality) : '') +
        (r.note ? '　·　' + esc(r.note) : '') +
      '</span>' +
      '<span class="vital-item-badge ' + badgeCls + '">' + badgeText + '</span>' +
      '<button class="vital-item-del" data-slpdel="' + r.id + '" title="删除">✕</button>' +
    '</div>';
  }).join('');
  list.querySelectorAll('[data-slpdel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.slpdel;
      const t = sleepRecords.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除 ' + t.date + ' 的睡眠记录吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('sleep_records', id);
        sleepRecords = sleepRecords.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveSleep();
        renderSleepList(); renderSleepChart();
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}

let sleepChartRetry = 0;
function renderSleepChart(){
  const canvas = document.getElementById('sleepChart');
  if (!canvas) return;
  const wrap = canvas.parentElement;

  if (wrap.clientWidth === 0){
    if (sleepChartRetry++ < 10){
      setTimeout(renderSleepChart, 80);
    }
    return;
  }
  sleepChartRetry = 0;

  const cssW = Math.max(280, wrap.clientWidth - 28);
  const cssH = 260;

  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  if (sleepRecords.length === 0){
    ctx.fillStyle = '#b0b6c4'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('还没有数据，添加一条睡眠记录后即可看到曲线', cssW/2, cssH/2);
    return;
  }

  const sorted = sleepRecords.slice().sort((a,b) => String(a.date||'').localeCompare(String(b.date||''))).slice(-30);
  const FONT = '"PingFang SC","Microsoft YaHei",sans-serif';
  const pad = { l: 52, r: 20, t: 24, b: 44 };
  const pw = cssW - pad.l - pad.r;
  const ph = cssH - pad.t - pad.b;

  const maxH = Math.max(10, Math.ceil(Math.max(...sorted.map(r => (r.duration_min||0)/60)) + 1));
  const y = h => pad.t + ph - (h / maxH) * ph;

  ctx.fillStyle = 'rgba(115,123,132,.08)';
  ctx.fillRect(pad.l, y(9), pw, y(7) - y(9));
  ctx.strokeStyle = 'rgba(115,123,132,.28)';
  ctx.setLineDash([4,4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, y(8)); ctx.lineTo(pad.l + pw, y(8)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#9aa1b1'; ctx.font = '11.5px ' + FONT; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('8h 参考', pad.l + pw - 4, y(8) - 8);

  for (let i = 0; i <= 5; i++){
    const hv = maxH * i / 5;
    const yy = y(hv);
    ctx.strokeStyle = '#eef0f5'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(pad.l + pw, yy); ctx.stroke();
    ctx.fillStyle = '#9aa1b1'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(hv.toFixed(1) + 'h', pad.l - 6, yy);
  }

  const slot = pw / Math.max(sorted.length, 1);
  const x = i => pad.l + (sorted.length === 1 ? pw/2 : slot * i + slot/2);
  const bw = Math.min(slot * 0.55, 32);

  sorted.forEach((r, i) => {
    const hv = (r.duration_min || 0) / 60;
    const cx = x(i);
    const yTop = y(hv);
    const bh = pad.t + ph - yTop;
    let col = '#8fb59a';
    if (hv < 6) col = '#c17878';
    else if (hv < 7) col = '#c8a468';
    else if (hv > 10) col = '#c8a468';
    ctx.fillStyle = col;
    roundRect(ctx, cx - bw/2, yTop, bw, Math.max(bh, 2), 5);
    ctx.fill();
  });

  ctx.beginPath();
  sorted.forEach((r, i) => {
    const hv = (r.duration_min || 0) / 60;
    const px = x(i), py = y(hv);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = '#565d65'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.fillStyle = '#9aa1b1'; ctx.font = '10.5px ' + FONT;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const step = Math.max(1, Math.ceil(sorted.length / 8));
  sorted.forEach((r, i) => {
    if (i % step !== 0 && i !== sorted.length - 1) return;
    const d = String(r.date || '');
    const label = d.length >= 10 ? d.slice(5) : d;
    ctx.fillText(label, x(i), pad.t + ph + 10);
  });

  ctx.strokeStyle = '#d9dce6'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph);
  ctx.stroke();
}

document.getElementById('slpExportPng').addEventListener('click', () => {
  const canvas = document.getElementById('sleepChart');
  if (!canvas){ showToast('没有可导出的图表'); return; }
  const d = new Date();
  const fileName = '睡眠曲线_' + timeStamp(d) + '.png';
  if (canvas.toBlob){
    canvas.toBlob(blob => {
      if (!blob){ showToast('导出失败，请重试'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast('已导出睡眠曲线 PNG');
    }, 'image/png');
  } else {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('已导出睡眠曲线 PNG');
  }
});

/* ---------- 生命体征 ---------- */
let vitalRecords = [];
function saveVitals(){ try { localStorage.setItem(VITAL_KEY, JSON.stringify(vitalRecords)); updateStorageUsage(); return true; } catch(e){ return false; } }
function loadVitals(){
  try { const raw = localStorage.getItem(VITAL_KEY); if (raw) vitalRecords = JSON.parse(raw) || []; } catch(e){ vitalRecords = []; }
}

(function initVitalDate(){
  const d = new Date();
  const el = document.getElementById('vtDate');
  if (el) el.value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
})();

document.getElementById('vtReset').addEventListener('click', () => {
  ['vtHeart','vtSugar','vtSys','vtDia','vtNote','vtTime'].forEach(id => document.getElementById(id).value = '');
  const d = new Date();
  document.getElementById('vtDate').value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
});

function judgeHeart(v){
  if (!isFinite(v) || v <= 0) return null;
  if (v < 60) return { cls:'warn', text:'偏慢' };
  if (v <= 100) return { cls:'ok', text:'正常' };
  return { cls:'bad', text:'偏快' };
}
function judgeSugar(v){
  if (!isFinite(v) || v <= 0) return null;
  if (v < 3.9) return { cls:'bad', text:'偏低' };
  if (v <= 6.1) return { cls:'ok', text:'正常' };
  if (v <= 7.0) return { cls:'warn', text:'偏高' };
  return { cls:'bad', text:'高' };
}
function judgeBp(sys, dia){
  if (!isFinite(sys) || !isFinite(dia) || sys <= 0 || dia <= 0) return null;
  if (sys >= 140 || dia >= 90) return { cls:'bad', text:'偏高' };
  if (sys < 90 || dia < 60) return { cls:'bad', text:'偏低' };
  if (sys >= 120 || dia >= 80) return { cls:'warn', text:'略高' };
  return { cls:'ok', text:'理想' };
}

document.getElementById('vtAdd').addEventListener('click', async () => {
  const date  = document.getElementById('vtDate').value.trim();
  const time  = document.getElementById('vtTime').value.trim();
  const heartRaw = document.getElementById('vtHeart').value.trim();
  const sugarRaw = document.getElementById('vtSugar').value.trim();
  const sysRaw   = document.getElementById('vtSys').value.trim();
  const diaRaw   = document.getElementById('vtDia').value.trim();
  const note     = document.getElementById('vtNote').value.trim();

  if (!date){ alert('请填写日期～'); return; }
  if (!heartRaw && !sugarRaw && !sysRaw && !diaRaw){
    alert('至少填写一项指标（心率 / 血糖 / 血压）'); return;
  }
  const heart = heartRaw ? parseFloat(heartRaw) : null;
  const sugar = sugarRaw ? parseFloat(sugarRaw) : null;
  const sys   = sysRaw ? parseFloat(sysRaw) : null;
  const dia   = diaRaw ? parseFloat(diaRaw) : null;
  if (heartRaw && !isFinite(heart)){ alert('心率必须为数字'); return; }
  if (sugarRaw && !isFinite(sugar)){ alert('血糖必须为数字'); return; }
  if (sysRaw && !isFinite(sys)){ alert('收缩压必须为数字'); return; }
  if (diaRaw && !isFinite(dia)){ alert('舒张压必须为数字'); return; }

  const data = {
    date, time,
    heart: heart !== null ? heart : null,
    sugar: sugar !== null ? sugar : null,
    bp_sys: sys !== null ? sys : null,
    bp_dia: dia !== null ? dia : null,
    note
  };
  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('vitals', data);
      vitalRecords.push(row);
    } else {
      vitalRecords.push({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() });
      if (!saveVitals()){ vitalRecords.pop(); return; }
    }
    document.getElementById('vtReset').click();
    renderVitalList(); showToast('已记录生命体征');
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('vtClearAll').addEventListener('click', async () => {
  if (vitalRecords.length === 0) return;
  if (!confirm('确定清空全部生命体征记录吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('vitals').delete().eq('user_id', currentUser.id);
    vitalRecords = [];
    try { localStorage.removeItem(VITAL_KEY); } catch(e){}
    renderVitalList(); showToast('生命体征数据已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

function renderVitalList(){
  const list = document.getElementById('vtList');
  if (!list) return;
  document.getElementById('vtCount').textContent = vitalRecords.length;
  if (vitalRecords.length === 0){
    list.innerHTML = '<p class="empty">还没有记录，先在上方添加一条吧～</p>';
    return;
  }
  const sorted = vitalRecords.slice().sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
  list.innerHTML = sorted.map(r => {
    const parts = [];
    if (r.heart != null && isFinite(r.heart)) parts.push('心率 ' + r.heart + ' 次/分');
    if (r.sugar != null && isFinite(r.sugar)) parts.push('血糖 ' + r.sugar + ' mmol/L');
    if (r.bp_sys != null && r.bp_dia != null && isFinite(r.bp_sys) && isFinite(r.bp_dia)) parts.push('血压 ' + r.bp_sys + '/' + r.bp_dia + ' mmHg');
    const heartJ = judgeHeart(r.heart);
    const sugarJ = judgeSugar(r.sugar);
    const bpJ    = judgeBp(r.bp_sys, r.bp_dia);
    const badges = [];
    if (heartJ) badges.push('心率 ' + heartJ.text);
    if (sugarJ) badges.push('血糖 ' + sugarJ.text);
    if (bpJ)    badges.push('血压 ' + bpJ.text);
    let worstCls = 'ok';
    [heartJ, sugarJ, bpJ].forEach(j => {
      if (!j) return;
      if (j.cls === 'bad') worstCls = 'bad';
      else if (j.cls === 'warn' && worstCls !== 'bad') worstCls = 'warn';
    });
    return '<div class="vital-item">' +
      '<span class="vital-item-date">' + esc(r.date || '—') + (r.time ? ' ' + esc(r.time) : '') + '</span>' +
      '<span class="vital-item-main">' +
        '<b>' + parts.join('　·　') + '</b>' +
        (r.note ? '　·　' + esc(r.note) : '') +
      '</span>' +
      (badges.length ? '<span class="vital-item-badge ' + worstCls + '">' + esc(badges.join(' / ')) + '</span>' : '') +
      '<button class="vital-item-del" data-vtdel="' + r.id + '" title="删除">✕</button>' +
    '</div>';
  }).join('');
  list.querySelectorAll('[data-vtdel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.vtdel;
      const t = vitalRecords.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除 ' + t.date + ' 的记录吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('vitals', id);
        vitalRecords = vitalRecords.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveVitals();
        renderVitalList();
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}

document.getElementById('vtAiBtn').addEventListener('click', async () => {
  if (!currentUser){ showToast('请先登录再使用 AI'); go('login'); return; }
  if (vitalRecords.length === 0){ showToast('请先添加至少一条记录'); return; }
  const box = document.getElementById('vtAiResult');
  box.textContent = '生成中…';
  const sorted = vitalRecords.slice().sort((a,b) => String(a.date||'').localeCompare(String(b.date||''))).slice(-30);
  const lines = sorted.map(r => {
    const p = [];
    if (r.heart != null) p.push('心率' + r.heart);
    if (r.sugar != null) p.push('血糖' + r.sugar);
    if (r.bp_sys != null && r.bp_dia != null) p.push('血压' + r.bp_sys + '/' + r.bp_dia);
    if (r.note) p.push('备注：' + r.note);
    return (r.date || '') + (r.time ? ' ' + r.time : '') + '：' + p.join('，');
  }).join('\n');
  const prompt = '以下是我最近的生命体征记录（含心率、血糖、血压，单位分别为次/分、mmol/L、mmHg）：\n' + lines +
    '\n\n请用简洁的中文帮我分析这些数据的整体趋势，指出是否有需要留意的项目，并给出 3 - 5 条生活建议。语气客观，不要下诊断结论。';
  try {
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是健康数据分析助手，用中文客观分析，不下医学诊断，只给生活建议。' },
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || data.error || '无结果';
    box.textContent = text;
    updateQuota();
  } catch(err){ box.textContent = '⚠️ ' + err.message; }
});

/* ============================================================
   运动记录
   ============================================================ */
let exerciseRecords = [];
let exerProfile = { gender: 'male', age: '', height: '', weight: '' };
let pendingExerImg = '';
let currentExerType = '跑步';

function saveExerProfile(){
  try { localStorage.setItem(EXER_PROFILE_KEY, JSON.stringify(exerProfile)); updateStorageUsage(); return true; } catch(e){ return false; }
}
async function saveExerProfileCloud(){
  saveExerProfile();
  if (currentUser){
    try {
      const { error } = await sb.auth.updateUser({ data: { exer_profile: exerProfile } });
      if (error) console.warn('[个人信息] 云端保存失败：', error);
    } catch(e){ console.warn('[个人信息] 云端保存异常：', e); }
  }
}
function loadExerProfile(){
  try {
    const raw = localStorage.getItem(EXER_PROFILE_KEY);
    if (raw) exerProfile = { ...exerProfile, ...JSON.parse(raw) };
  } catch(e){}

  if (currentUser && currentUser.user_metadata && currentUser.user_metadata.exer_profile){
    exerProfile = { ...exerProfile, ...currentUser.user_metadata.exer_profile };
    try { localStorage.setItem(EXER_PROFILE_KEY, JSON.stringify(exerProfile)); } catch(e){}
  }

  document.getElementById('exerGender').value = exerProfile.gender || 'male';
  document.getElementById('exerAge').value    = exerProfile.age || '';
  document.getElementById('exerHeight').value = exerProfile.height || '';
  document.getElementById('exerWeight').value = exerProfile.weight || '';
  renderExerProfileBar();
}
function renderExerProfileBar(){
  const txt = document.getElementById('exerProfileText');
  const items = [];
  if (exerProfile.gender) items.push(exerProfile.gender === 'male' ? '男' : '女');
  if (exerProfile.age)    items.push(exerProfile.age + ' 岁');
  if (exerProfile.height) items.push(exerProfile.height + ' cm');
  if (exerProfile.weight) items.push(exerProfile.weight + ' kg');
  txt.textContent = items.length
    ? ('当前档案：' + items.join(' · ') + (currentUser ? '（已同步云端）' : ''))
    : '还没有填写个人信息，先点下方「编辑个人信息」补全吧～';
}
document.getElementById('exerProfileSave').addEventListener('click', async () => {
  exerProfile.gender = document.getElementById('exerGender').value;
  exerProfile.age    = document.getElementById('exerAge').value.trim();
  exerProfile.height = document.getElementById('exerHeight').value.trim();
  exerProfile.weight = document.getElementById('exerWeight').value.trim();
  await saveExerProfileCloud();
  renderExerProfileBar();
  showToast('个人信息已保存' + (currentUser ? '（已同步云端）' : '（本地）'));
});
document.getElementById('exerProfileClear').addEventListener('click', async () => {
  if (!confirm('确定清空个人信息吗？')) return;
  exerProfile = { gender: 'male', age: '', height: '', weight: '' };
  document.getElementById('exerGender').value = 'male';
  ['exerAge','exerHeight','exerWeight'].forEach(id => document.getElementById(id).value = '');
  await saveExerProfileCloud();
  renderExerProfileBar(); showToast('个人信息已清空');
});

document.querySelectorAll('.exer-type-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.exer-type-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentExerType = chip.dataset.extype;
  });
});

function saveExercise(){
  try { localStorage.setItem(EXER_KEY, JSON.stringify(exerciseRecords)); updateStorageUsage(); return true; } catch(e){ return false; }
}
function loadExercise(){
  try { const raw = localStorage.getItem(EXER_KEY); if (raw) exerciseRecords = JSON.parse(raw) || []; } catch(e){ exerciseRecords = []; }
}

(function initExerDate(){
  const d = new Date();
  const el = document.getElementById('exerDate');
  if (el) el.value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
})();

document.getElementById('exerImg').addEventListener('change', e => {
  const file = e.target.files[0];
  const preview = document.getElementById('exerImgPreview');
  if (!file){ pendingExerImg = ''; preview.textContent = '未选择'; return; }
  if (!file.type.startsWith('image/')){ alert('请选择图片文件'); return; }
  preview.textContent = '处理中…';
  compressImage(file, 800, 0.75, dataUrl => {
    pendingExerImg = dataUrl;
    preview.innerHTML = '<img src="' + dataUrl + '" alt="">';
  });
});

document.getElementById('exerReset').addEventListener('click', () => {
  ['exerDuration','exerDesc','exerKcal','exerCustomType'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('exerStatus').value = '已记录';
  document.getElementById('exerIntensity').value = '中等强度';
  document.getElementById('exerImg').value = '';
  document.getElementById('exerImgPreview').textContent = '未选择';
  document.getElementById('exerAiKcal').checked = false;
  pendingExerImg = '';
  const d = new Date();
  document.getElementById('exerDate').value = d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
});

const MET_TABLE = {
  '跑步': { '低强度':5.0, '中等强度':8.5, '高强度':12.0 },
  '骑行': { '低强度':4.0, '中等强度':7.0, '高强度':10.0 },
  '游泳': { '低强度':5.0, '中等强度':8.0, '高强度':11.0 },
  '走路': { '低强度':2.5, '中等强度':4.0, '高强度':6.0 },
  '力量训练': { '低强度':3.5, '中等强度':5.5, '高强度':8.0 },
  '瑜伽': { '低强度':2.5, '中等强度':3.5, '高强度':5.0 },
  '球类': { '低强度':4.5, '中等强度':7.0, '高强度':10.0 },
  '其他': { '低强度':3.0, '中等强度':5.0, '高强度':8.0 }
};
function estimateKcal(type, intensity, minutes, weightKg){
  const mets = (MET_TABLE[type] || MET_TABLE['其他'])[intensity] || 5.0;
  const w = parseFloat(weightKg) || 60;
  return Math.round(mets * w * (minutes / 60));
}

async function aiEstimateKcal(type, intensity, minutes, desc, weightKg){
  if (!currentUser) throw new Error('未登录');
  const { data: { session } } = await sb.auth.getSession();
  const info = '性别：' + (exerProfile.gender === 'male' ? '男' : '女') +
               '；年龄：' + (exerProfile.age || '未知') +
               '；身高：' + (exerProfile.height || '未知') + ' cm' +
               '；体重：' + (exerProfile.weight || '未知') + ' kg';
  const prompt = '请根据以下信息估算本次运动的卡路里消耗（kcal），只返回一个数字区间，例如：320-380，不要解释。\n' +
    info + '\n' +
    '运动类型：' + type + '\n' +
    '强度：' + intensity + '\n' +
    '时长：' + minutes + ' 分钟\n' +
    (desc ? '补充描述：' + desc + '\n' : '');
  const res = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: '你是运动消耗估算助手，只输出一个数字区间或单个数字，不要解释。' },
        { role: 'user', content: prompt }
      ],
      stream: false
    })
  });
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

document.getElementById('exerAdd').addEventListener('click', async () => {
  const date = document.getElementById('exerDate').value.trim();
  const durationRaw = document.getElementById('exerDuration').value.trim();
  const intensity = document.getElementById('exerIntensity').value;
  const status = document.getElementById('exerStatus').value;
  const customType = document.getElementById('exerCustomType').value.trim();
  const desc = document.getElementById('exerDesc').value.trim();
  const kcalRaw = document.getElementById('exerKcal').value.trim();
  const aiKcalOn = document.getElementById('exerAiKcal').checked;
  const type = customType || currentExerType;

  if (!date){ alert('请填写日期～'); return; }
  if (!durationRaw){ alert('请填写时长～'); return; }
  const minutes = parseFloat(durationRaw);
  if (!isFinite(minutes) || minutes <= 0){ alert('时长必须为正数'); return; }

  let kcal = kcalRaw ? parseFloat(kcalRaw) : null;
  if (kcalRaw && !isFinite(kcal)){ alert('热量必须为数字'); return; }

  if (aiKcalOn){
    if (!currentUser){ showToast('AI 估算需要先登录'); }
    else {
      try {
        const txt = await aiEstimateKcal(type, intensity, minutes, desc, exerProfile.weight);
        const numMatch = txt.match(/(\d+(?:\.\d+)?)\s*[-~到]\s*(\d+(?:\.\d+)?)/);
        if (numMatch) kcal = Math.round((parseFloat(numMatch[1]) + parseFloat(numMatch[2])) / 2);
        else {
          const single = txt.match(/(\d+(?:\.\d+)?)/);
          if (single) kcal = Math.round(parseFloat(single[1]));
        }
        updateQuota();
      } catch(err){
        console.warn('AI 估算失败，退回本地估算：', err);
      }
    }
  }
  if (kcal === null){
    kcal = estimateKcal(type, intensity, minutes, exerProfile.weight);
  }

  const data = {
    date, type, intensity, status,
    duration_min: minutes,
    kcal: kcal,
    desc_text: desc,
    img: pendingExerImg || '',
    profile_snapshot: {
      gender: exerProfile.gender,
      age: exerProfile.age,
      height: exerProfile.height,
      weight: exerProfile.weight
    }
  };

  try {
    if (appMode === 'cloud' && currentUser){
      const row = await cloudInsert('exercises', data);
      exerciseRecords.push(row);
    } else {
      exerciseRecords.push({ id: Date.now() + '-' + Math.floor(Math.random()*1000), ...data, created_at: new Date().toISOString() });
      if (!saveExercise()){ exerciseRecords.pop(); return; }
    }
    document.getElementById('exerReset').click();
    renderExerciseList(); showToast('已添加运动记录');
  } catch(err){ alert('保存失败：' + err.message); }
});

document.getElementById('exerClearAll').addEventListener('click', async () => {
  if (exerciseRecords.length === 0) return;
  if (!confirm('确定清空全部运动记录吗？此操作不可恢复。')) return;
  try {
    if (appMode === 'cloud' && currentUser) await sb.from('exercises').delete().eq('user_id', currentUser.id);
    exerciseRecords = [];
    try { localStorage.removeItem(EXER_KEY); } catch(e){}
    renderExerciseList(); showToast('运动记录已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

function renderExerciseList(){
  const list = document.getElementById('exerList');
  if (!list) return;
  document.getElementById('exerCount').textContent = exerciseRecords.length;

  const totalCount = exerciseRecords.length;
  const totalMinutes = exerciseRecords.reduce((a, r) => a + (parseFloat(r.duration_min) || 0), 0);
  const totalKcal = exerciseRecords.reduce((a, r) => a + (parseFloat(r.kcal) || 0), 0);
  document.getElementById('exerStatCount').textContent = totalCount;
  document.getElementById('exerStatMinutes').textContent = Math.round(totalMinutes);
  document.getElementById('exerStatKcal').textContent = Math.round(totalKcal);

  if (exerciseRecords.length === 0){
    list.innerHTML = '<p class="empty" style="grid-column:1/-1;">还没有运动记录，先在上方添加一条吧～</p>';
    return;
  }
  const sorted = exerciseRecords.slice().sort((a,b) => {
    const d = String(b.date || '').localeCompare(String(a.date || ''));
    if (d !== 0) return d;
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });
  list.innerHTML = sorted.map(r => {
    const statusTag = r.status === '计划'
      ? '<span class="tag gray">计划</span>'
      : '<span class="tag">已记录</span>';
    const desc = r.desc_text || r.desc || '';
    const img = r.img || '';
    return '<div class="exer-card">' +
      '<button class="del-btn" data-exerdel="' + r.id + '" title="删除">✕</button>' +
      '<div class="exer-card-head">' +
        '<div style="flex:1;min-width:0;">' +
          '<h3 class="exer-card-title">' + esc(r.type || '运动') + '</h3>' +
          '<div class="exer-card-tags">' +
            '<span class="tag">' + esc(r.intensity || '中等强度') + '</span>' +
            statusTag +
            (r.date ? '<span class="tag gray">' + esc(r.date) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="exer-card-body">' +
        '<p><b>时长：</b>' + esc(String(r.duration_min || 0)) + ' 分钟' +
          (r.kcal != null ? '　·　<b class="kcal">≈ ' + esc(String(r.kcal)) + ' kcal</b>' : '') +
        '</p>' +
        (desc ? '<p><b>描述：</b>' + esc(desc) + '</p>' : '') +
      '</div>' +
      (img ? '<div class="exer-cover"><img src="' + img + '" alt=""></div>' : '') +
    '</div>';
  }).join('');
  list.querySelectorAll('[data-exerdel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.exerdel;
      const t = exerciseRecords.find(x => String(x.id) === String(id));
      if (!t || !confirm('确定删除「' + (t.type || '运动') + '」记录吗？')) return;
      try {
        if (appMode === 'cloud' && currentUser) await cloudDelete('exercises', id);
        exerciseRecords = exerciseRecords.filter(x => String(x.id) !== String(id));
        if (appMode === 'local') saveExercise();
        renderExerciseList();
      } catch(err){ alert('删除失败：' + err.message); }
    });
  });
}

document.getElementById('exerExportDoc').addEventListener('click', async () => {
  if (exerciseRecords.length === 0){ showToast('还没有运动记录，先添加一条吧～'); return; }
  if (typeof window.docx === 'undefined'){ showToast('docx 库未加载，请刷新页面重试'); return; }
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;
  const d = new Date();

  const children = [
    new Paragraph({
      children: [new TextRun({ text: '我的运动记录', bold: true, size: 36 })],
      alignment: AlignmentType.CENTER, spacing: { after: 200 }
    }),
    new Paragraph({
      children: [new TextRun({
        text: '共 ' + exerciseRecords.length + ' 条记录 · 导出时间：' +
              d.getFullYear() + ' 年 ' + (d.getMonth()+1) + ' 月 ' + d.getDate() + ' 日',
        size: 20, color: '6f7680'
      })],
      alignment: AlignmentType.CENTER, spacing: { after: 400 }
    })
  ];

  const profileLine = [];
  if (exerProfile.gender) profileLine.push(exerProfile.gender === 'male' ? '男' : '女');
  if (exerProfile.age)    profileLine.push(exerProfile.age + ' 岁');
  if (exerProfile.height) profileLine.push(exerProfile.height + ' cm');
  if (exerProfile.weight) profileLine.push(exerProfile.weight + ' kg');
  if (profileLine.length){
    children.push(new Paragraph({
      children: [new TextRun({ text: '个人档案：' + profileLine.join(' · '), size: 22, color: '565d65' })],
      spacing: { after: 200 }
    }));
  }

  const sorted = exerciseRecords.slice().sort((a,b) => String(a.date||'').localeCompare(String(b.date||'')));
  sorted.forEach((r, i) => {
    children.push(new Paragraph({
      children: [new TextRun({ text: (i + 1) + '. ' + (r.date || '') + '　' + (r.type || '运动'), bold: true, size: 26 })],
      spacing: { before: 240, after: 100 }
    }));
    const meta = [];
    if (r.duration_min) meta.push('时长：' + r.duration_min + ' 分钟');
    if (r.intensity)    meta.push('强度：' + r.intensity);
    if (r.status)       meta.push('状态：' + r.status);
    if (r.kcal != null) meta.push('消耗：≈ ' + r.kcal + ' kcal');
    if (meta.length){
      children.push(new Paragraph({
        children: [new TextRun({ text: meta.join('　|　'), size: 20, color: '565d65' })],
        spacing: { after: 100 }
      }));
    }
    const desc = r.desc_text || r.desc || '';
    if (desc){
      children.push(new Paragraph({
        children: [new TextRun({ text: '描述：' + desc, size: 22 })],
        spacing: { after: 100 }
      }));
    }
  });

  try {
    const doc = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的运动记录_' + timeStamp(d) + '.docx';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('已导出 Word 文档');
  } catch(err){ alert('导出失败：' + (err.message || err)); }
});

document.getElementById('exerExportImg').addEventListener('click', () => {
  if (exerciseRecords.length === 0){ showToast('还没有运动记录，先添加一条吧～'); return; }
  const W = 920, PAD = 44, CARD_PAD = 20, GAP = 14;
  const innerW = W - PAD * 2, textW = innerW - CARD_PAD * 2;
  const dpr = 2;
  const FONT = '"PingFang SC","Microsoft YaHei",sans-serif';
  const mc = document.createElement('canvas').getContext('2d');
  const sorted = exerciseRecords.slice().sort((a,b) => String(b.date||'').localeCompare(String(a.date||'')));
  const blocks = sorted.map(r => {
    const rows = [];
    rows.push({ kind:'title', text: (r.date || '') + '　' + (r.type || '运动'), h: 30 });
    const meta = [];
    if (r.duration_min) meta.push('时长 ' + r.duration_min + ' 分钟');
    if (r.intensity)    meta.push('强度 ' + r.intensity);
    if (r.status)       meta.push('状态 ' + r.status);
    if (r.kcal != null) meta.push('消耗 ≈ ' + r.kcal + ' kcal');
    if (meta.length) rows.push({ kind:'meta', text: meta.join('　·　'), h: 24 });
    const desc = r.desc_text || r.desc || '';
    if (desc){ mc.font = '14px ' + FONT; wrapText(mc, '描述：' + desc, textW).forEach(l => rows.push({ kind:'body', text: l, h: 22 })); }
    return rows;
  });
  const HEADER = 118, FOOTER = 58;
  let contentH = 0;
  blocks.forEach(rows => { contentH += CARD_PAD * 2 + rows.reduce((a, r) => a + r.h, 0) + GAP; });
  const H = PAD + HEADER + contentH + FOOTER + PAD;
  const canvas = document.createElement('canvas');
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  ctx.fillStyle = '#1c1f23'; ctx.font = 'bold 30px ' + FONT;
  ctx.fillText('我的运动记录', PAD, PAD + 4);
  ctx.fillStyle = '#9ca3af'; ctx.font = '14.5px ' + FONT;
  ctx.fillText('共 ' + exerciseRecords.length + ' 条记录　·　岁窦工具箱 · 运动记录', PAD, PAD + 52);
  ctx.strokeStyle = '#e3e6ea'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, PAD + 92); ctx.lineTo(W - PAD, PAD + 92); ctx.stroke();
  let y = PAD + HEADER;
  blocks.forEach(rows => {
    const cardH = CARD_PAD * 2 + rows.reduce((a, r) => a + r.h, 0);
    ctx.fillStyle = '#fafbfc'; ctx.strokeStyle = '#e3e6ea'; ctx.lineWidth = 1;
    roundRect(ctx, PAD + 0.5, y + 0.5, innerW - 1, cardH - 1, 12); ctx.fill(); ctx.stroke();
    let ry = y + CARD_PAD;
    rows.forEach(r => {
      if (r.kind === 'title'){ ctx.font = 'bold 17px ' + FONT; ctx.fillStyle = '#1c1f23'; ctx.fillText(fitText(ctx, r.text, textW), PAD + CARD_PAD, ry + 6); }
      else if (r.kind === 'meta'){ ctx.font = '13px ' + FONT; ctx.fillStyle = '#565d65'; ctx.fillText(fitText(ctx, r.text, textW), PAD + CARD_PAD, ry + 4); }
      else { ctx.font = '14px ' + FONT; ctx.fillStyle = '#4b5563'; ctx.fillText(r.text, PAD + CARD_PAD, ry + 2); }
      ry += r.h;
    });
    y += cardH + GAP;
  });
  const dd = new Date();
  ctx.textAlign = 'center'; ctx.fillStyle = '#9ca3af'; ctx.font = '12.5px ' + FONT;
  ctx.fillText('导出时间：' + dd.getFullYear() + '-' + pad2(dd.getMonth()+1) + '-' + pad2(dd.getDate()) + ' ' + pad2(dd.getHours()) + ':' + pad2(dd.getMinutes()) + '　|　岁窦工具箱 · 运动记录', W / 2, y + 22);
  const fileName = '我的运动记录_' + timeStamp(dd) + '.png';
  if (canvas.toBlob){
    canvas.toBlob(blob => {
      if (!blob){ showToast('导出失败，请重试'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast('已导出运动记录图片');
    }, 'image/png');
  } else {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('已导出运动记录图片');
  }
});
/* ============================================================
   时间戳转换
   ============================================================ */
(function initTimestamp(){
  'use strict';

  /* ---------- 子标签切换 ---------- */
  document.querySelectorAll('#page-timestamp .ta-subtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#page-timestamp .ta-subtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.ts;
      document.querySelectorAll('#page-timestamp .ta-subpage').forEach(p => p.classList.toggle('active', p.dataset.tsPage === target));
    });
  });

  function pad2n(n){ return String(n).padStart(2, '0'); }
  function pad3n(n){ return String(n).padStart(3, '0'); }

  /* ---------- 实时当前时间戳 ---------- */
  function updateNowTS(){
    const now = Date.now();
    const sec = Math.floor(now / 1000);
    const elSec = document.getElementById('tsNowSec');
    const elMs  = document.getElementById('tsNowMs');
    const elBig = document.getElementById('tsNowValue');
    if (elSec) elSec.textContent = sec;
    if (elMs)  elMs.textContent = now;
    if (elBig) {
      const d = new Date(now);
      const p = n => String(n).padStart(2,'0');
      elBig.textContent = d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate())
                        + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }
  }
  updateNowTS();
  setInterval(updateNowTS, 1000);

  /* ---------- 复制工具 ---------- */
  function copyText(text){
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(() => showToast('已复制：' + text))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('已复制：' + text); } catch(e){}
    document.body.removeChild(ta);
  }

  document.getElementById('tsNowCopySec').addEventListener('click', () => {
    copyText(String(Math.floor(Date.now()/1000)));
  });
  document.getElementById('tsNowCopyMs').addEventListener('click', () => {
    copyText(String(Date.now()));
  });

  /* ---------- 把任意输入归一化为毫秒时间戳 ---------- */
  function normalizeToMs(input){
    const raw = String(input).trim();
    if (!raw) return null;
    if (/^-?\d+$/.test(raw)){
      const num = parseInt(raw, 10);
      const abs = Math.abs(num);
      if (abs < 1e11) return num * 1000;
      return num;
    }
    const d = new Date(raw.replace(/-/g, '/'));
    if (!isNaN(d.getTime())) return d.getTime();
    return null;
  }

  /* ---------- 相对时间描述 ---------- */
  const WEEK_CN = ['日','一','二','三','四','五','六'];
  function relTime(diffMs){
    const abs = Math.abs(diffMs);
    const suffix = diffMs >= 0 ? '后' : '前';
    const sec = Math.floor(abs / 1000);
    if (sec < 60) return sec + ' 秒' + suffix;
    const min = Math.floor(sec / 60);
    if (min < 60) return min + ' 分钟' + suffix;
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' 小时' + suffix;
    const day = Math.floor(hr / 24);
    if (day < 30) return day + ' 天' + suffix;
    const mon = Math.floor(day / 30);
    if (mon < 12) return mon + ' 个月' + suffix;
    return Math.floor(mon / 12) + ' 年' + suffix;
  }

  /* ---------- 结果列表渲染 ---------- */
  function renderTSResult(list, items){
    list.innerHTML = items.map(it =>
      '<div class="ts-result-item">' +
        '<span class="ts-result-label">' + esc(it.label) + '</span>' +
        '<span class="ts-result-value">' + esc(it.value) + '</span>' +
        '<button class="ts-result-copy" data-copy="' + esc(it.value) + '">复制</button>' +
      '</div>'
    ).join('');
    list.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => copyText(btn.dataset.copy));
    });
  }

  /* ============================================================
     一、时间戳 → 日期
     ============================================================ */
  const tsInputNum = document.getElementById('tsInputNum');
  const tsResultList = document.getElementById('tsResultList');
  const tsInputHint = document.getElementById('tsInputHint');

  tsInputNum.addEventListener('input', () => {
    const raw = tsInputNum.value.trim();
    if (!raw){
      tsInputHint.textContent = '支持秒级（10 位）和毫秒级（13 位），自动识别。';
      return;
    }
    if (/^-?\d+$/.test(raw)){
      const abs = Math.abs(parseInt(raw, 10));
      if (abs < 1e11){
        tsInputHint.textContent = '识别为：秒级时间戳（' + raw.length + ' 位）';
      } else {
        tsInputHint.textContent = '识别为：毫秒级时间戳（' + raw.length + ' 位）';
      }
    } else {
      tsInputHint.textContent = '看起来不像纯数字时间戳，将尝试按日期解析。';
    }
  });

  function doConvertTS(){
    const raw = tsInputNum.value.trim();
    if (!raw){
      tsResultList.innerHTML = '<p class="empty">请先输入时间戳。</p>';
      return;
    }
    const ms = normalizeToMs(raw);
    if (ms === null || !isFinite(ms)){
      tsResultList.innerHTML = '<p class="empty">无法识别该输入，请检查格式。</p>';
      return;
    }
    const d = new Date(ms);
    const Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
    const h = d.getHours(), mi = d.getMinutes(), s = d.getSeconds(), msPart = d.getMilliseconds();
    const wd = WEEK_CN[d.getDay()];
    const uY = d.getUTCFullYear(), uM = d.getUTCMonth() + 1, uD = d.getUTCDate();
    const uh = d.getUTCHours(), umi = d.getUTCMinutes(), us = d.getUTCSeconds();
    const start = new Date(Y, 0, 1);
    const doy = Math.floor((d - start) / 86400000) + 1;
    const relStr = relTime(ms - Date.now());

    const offsetMin = -d.getTimezoneOffset();
    const offSign = offsetMin >= 0 ? '+' : '-';
    const offAbs = Math.abs(offsetMin);
    const offH = pad2n(Math.floor(offAbs / 60));
    const offM = pad2n(offAbs % 60);
    const iso = Y + '-' + pad2n(M) + '-' + pad2n(D) + 'T' + pad2n(h) + ':' + pad2n(mi) + ':' + pad2n(s) + '.' + pad3n(msPart) + offSign + offH + ':' + offM;

    const MON_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const DAY_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const rfc = DAY_EN[d.getDay()] + ', ' + pad2n(D) + ' ' + MON_EN[M-1] + ' ' + Y + ' ' + pad2n(h) + ':' + pad2n(mi) + ':' + pad2n(s) + ' ' + offSign + offH + offM;

    const items = [
      { label: '本地时区', value: Y + '-' + pad2n(M) + '-' + pad2n(D) + ' ' + pad2n(h) + ':' + pad2n(mi) + ':' + pad2n(s) },
      { label: '本地（含毫秒）', value: Y + '-' + pad2n(M) + '-' + pad2n(D) + ' ' + pad2n(h) + ':' + pad2n(mi) + ':' + pad2n(s) + '.' + pad3n(msPart) },
      { label: 'UTC 时间', value: uY + '-' + pad2n(uM) + '-' + pad2n(uD) + ' ' + pad2n(uh) + ':' + pad2n(umi) + ':' + pad2n(us) },
      { label: 'ISO 8601', value: iso },
      { label: 'RFC 2822', value: rfc },
      { label: '中文格式', value: Y + ' 年 ' + M + ' 月 ' + D + ' 日 星期' + wd + ' ' + pad2n(h) + ':' + pad2n(mi) + ':' + pad2n(s) },
      { label: '日期', value: Y + '-' + pad2n(M) + '-' + pad2n(D) },
      { label: '时间', value: pad2n(h) + ':' + pad2n(mi) + ':' + pad2n(s) },
      { label: '星期', value: '星期' + wd },
      { label: '该年第几天', value: '第 ' + doy + ' 天' },
      { label: '距今', value: relStr },
      { label: '秒级时间戳', value: String(Math.floor(ms / 1000)) },
      { label: '毫秒级时间戳', value: String(ms) }
    ];
    renderTSResult(tsResultList, items);
  }

  document.getElementById('tsConvertBtn').addEventListener('click', doConvertTS);
  tsInputNum.addEventListener('keydown', e => {
    if (e.key === 'Enter'){ e.preventDefault(); doConvertTS(); }
  });

  /* ============================================================
     二、日期 → 时间戳
     ============================================================ */
  const tsDateInput = document.getElementById('tsDateInput');
  const tsTimeInput = document.getElementById('tsTimeInput');
  const tsTimezone = document.getElementById('tsTimezone');
  const tsBackResultList = document.getElementById('tsBackResultList');

  function parseLocalDate(dateStr, timeStr, tzVal){
    const dm = String(dateStr).trim().match(/^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
    if (!dm) return null;
    const Y = parseInt(dm[1], 10);
    const M = parseInt(dm[2], 10) - 1;
    const D = parseInt(dm[3], 10);
    let h = 0, mi = 0, s = 0;
    if (timeStr){
      const tm = String(timeStr).trim().match(/^(\d{1,2})[:：](\d{1,2})(?:[:：](\d{1,2}))?/);
      if (tm){
        h = parseInt(tm[1], 10);
        mi = parseInt(tm[2], 10);
        s = tm[3] ? parseInt(tm[3], 10) : 0;
      }
    }
    if (tzVal === 'local'){
      return new Date(Y, M, D, h, mi, s).getTime();
    }
    let offsetHours;
    if (tzVal === 'UTC') offsetHours = 0;
    else offsetHours = parseFloat(tzVal);
    const utcMs = Date.UTC(Y, M, D, h, mi, s);
    return utcMs - offsetHours * 3600 * 1000;
  }

  function doConvertBack(){
    const dateStr = tsDateInput.value.trim();
    if (!dateStr){
      tsBackResultList.innerHTML = '<p class="empty">请先输入日期。</p>';
      return;
    }
    const tz = tsTimezone.value;
    const ms = parseLocalDate(dateStr, tsTimeInput.value.trim(), tz);
    if (ms === null || !isFinite(ms)){
      tsBackResultList.innerHTML = '<p class="empty">无法识别日期格式，请使用如 2026-10-25 的格式。</p>';
      return;
    }
    const d = new Date(ms);
    const sec = Math.floor(ms / 1000);
    const tzLabel = tsTimezone.options[tsTimezone.selectedIndex].textContent;

    const items = [
      { label: '秒级时间戳', value: String(sec) },
      { label: '毫秒级时间戳', value: String(ms) },
      { label: '使用的时区', value: tzLabel },
      { label: 'UTC 时间', value: d.getUTCFullYear() + '-' + pad2n(d.getUTCMonth()+1) + '-' + pad2n(d.getUTCDate()) + ' ' + pad2n(d.getUTCHours()) + ':' + pad2n(d.getUTCMinutes()) + ':' + pad2n(d.getUTCSeconds()) },
      { label: '本地时间', value: d.getFullYear() + '-' + pad2n(d.getMonth()+1) + '-' + pad2n(d.getDate()) + ' ' + pad2n(d.getHours()) + ':' + pad2n(d.getMinutes()) + ':' + pad2n(d.getSeconds()) },
      { label: '距今', value: relTime(ms - Date.now()) }
    ];
    renderTSResult(tsBackResultList, items);
  }

  document.getElementById('tsConvertBackBtn').addEventListener('click', doConvertBack);
  document.getElementById('tsNowBtn').addEventListener('click', () => {
    const d = new Date();
    tsDateInput.value = d.getFullYear() + '-' + pad2n(d.getMonth()+1) + '-' + pad2n(d.getDate());
    tsTimeInput.value = pad2n(d.getHours()) + ':' + pad2n(d.getMinutes()) + ':' + pad2n(d.getSeconds());
  });

  /* ============================================================
     三、时间差计算
     ============================================================ */
  const tsDiffA = document.getElementById('tsDiffA');
  const tsDiffB = document.getElementById('tsDiffB');
  const tsDiffResultList = document.getElementById('tsDiffResultList');

  function parseAnyTime(str){
    if (!str) return null;
    const s = String(str).trim();
    if (!s) return null;
    if (/^-?\d+$/.test(s)){
      const num = parseInt(s, 10);
      return Math.abs(num) < 1e11 ? num * 1000 : num;
    }
    const m = s.match(/^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})(?:[ T](\d{1,2})[:：](\d{1,2})(?:[:：](\d{1,2}))?)?/);
    if (m){
      const Y = parseInt(m[1], 10), M = parseInt(m[2], 10) - 1, D = parseInt(m[3], 10);
      const h = m[4] ? parseInt(m[4], 10) : 0;
      const mi = m[5] ? parseInt(m[5], 10) : 0;
      const sec = m[6] ? parseInt(m[6], 10) : 0;
      return new Date(Y, M, D, h, mi, sec).getTime();
    }
    const d = new Date(s.replace(/-/g, '/'));
    return isNaN(d.getTime()) ? null : d.getTime();
  }

  function doDiff(){
    const a = parseAnyTime(tsDiffA.value);
    const b = parseAnyTime(tsDiffB.value);
    if (a === null || b === null){
      tsDiffResultList.innerHTML = '<p class="empty">两侧都需要填写有效的时间（时间戳或日期时间）。</p>';
      return;
    }
    const diffMs = b - a;
    const absMs = Math.abs(diffMs);
    const sign = diffMs >= 0 ? '' : '-';
    const totalSec = Math.floor(absMs / 1000);
    const totalMin = Math.floor(totalSec / 60);
    const totalHr  = Math.floor(totalMin / 60);
    const totalDay = Math.floor(totalHr / 24);

    const startDate = new Date(Math.min(a, b));
    const endDate   = new Date(Math.max(a, b));
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    let hours = endDate.getHours() - startDate.getHours();
    let minutes = endDate.getMinutes() - startDate.getMinutes();
    let seconds = endDate.getSeconds() - startDate.getSeconds();
    if (seconds < 0){ seconds += 60; minutes--; }
    if (minutes < 0){ minutes += 60; hours--; }
    if (hours < 0){ hours += 24; days--; }
    if (days < 0){
      const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0){ months += 12; years--; }

    const calParts = [];
    if (years) calParts.push(years + ' 年');
    if (months) calParts.push(months + ' 个月');
    if (days) calParts.push(days + ' 天');
    if (hours) calParts.push(hours + ' 小时');
    if (minutes) calParts.push(minutes + ' 分');
    if (seconds) calParts.push(seconds + ' 秒');
    const calStr = calParts.length ? calParts.join(' ') : '0 秒';

    const items = [
      { label: '日历差', value: sign + calStr },
      { label: '总天数', value: sign + totalDay.toLocaleString() + ' 天' },
      { label: '总小时', value: sign + totalHr.toLocaleString() + ' 小时' },
      { label: '总分钟', value: sign + totalMin.toLocaleString() + ' 分钟' },
      { label: '总秒数', value: sign + totalSec.toLocaleString() + ' 秒' },
      { label: '总毫秒', value: sign + absMs.toLocaleString() + ' 毫秒' },
      { label: '时间 A', value: new Date(a).toLocaleString('zh-CN') + '  (' + Math.floor(a/1000) + ')' },
      { label: '时间 B', value: new Date(b).toLocaleString('zh-CN') + '  (' + Math.floor(b/1000) + ')' }
    ];
    renderTSResult(tsDiffResultList, items);
  }

  document.getElementById('tsDiffBtn').addEventListener('click', doDiff);
  document.getElementById('tsDiffSwap').addEventListener('click', () => {
    const a = tsDiffA.value;
    tsDiffA.value = tsDiffB.value;
    tsDiffB.value = a;
    if (tsDiffResultList.querySelector('.ts-result-item')) doDiff();
  });
  document.querySelectorAll('[data-fill-now]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.fillNow);
      if (target) target.value = String(Math.floor(Date.now()/1000));
    });
  });

  console.log('[时间戳转换] 已加载');
})();



/* ============================================================
   数据管理
   ============================================================ */
function exportAll(){
  let chapters = [];
  try { chapters = loadChaptersLocal(); } catch(e){ chapters = []; }
  const data = {
    app: '岁窦工具箱', version: 'V2.3.2', exportTime: new Date().toISOString(),
    people, songs, places, medias, schedules, notes, timelineEvents, novels, chapters, ledger,
    sleepRecords, vitalRecords, exerciseRecords, exerProfile
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const d = new Date();
  const a = document.createElement('a');
  a.href = url; a.download = '岁窦工具箱备份_' + timeStamp(d) + '.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('已导出全部数据');
}
document.getElementById('exportAll').addEventListener('click', exportAll);
document.getElementById('importAll').addEventListener('click', () => document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!confirm('导入将替换当前全部数据，确定继续吗？')){ e.target.value = ''; return; }
      if (Array.isArray(data.people))    { people    = data.people;    savePeople();    renderPeople();    }
      if (Array.isArray(data.songs))     { songs     = data.songs;     saveSongs();     renderSongs();     }
      if (Array.isArray(data.places))    { places    = data.places;    savePlaces();    renderPlaces();    }
      if (Array.isArray(data.medias))    { medias    = data.medias;    saveMedias();    renderMedias();    }
      if (Array.isArray(data.schedules)) { schedules = data.schedules; saveSchedules(); renderCalendar();  }
      if (Array.isArray(data.notes))     { notes     = data.notes;     saveNotes();     renderNotes();     }
      if (Array.isArray(data.timelineEvents)){ timelineEvents = data.timelineEvents; saveTimeline(); renderTimeline(); }
      if (Array.isArray(data.chapters))  { saveChaptersLocal(data.chapters); }
      if (Array.isArray(data.novels))    { novels    = data.novels;    saveNovelsLocal(); renderNovelList(); }
      if (Array.isArray(data.ledger))    { ledger    = data.ledger;    saveLedger();    renderLedger();    }
      if (Array.isArray(data.sleepRecords))   { sleepRecords    = data.sleepRecords;    saveSleep();    renderSleepList(); renderSleepChart(); }
      if (Array.isArray(data.vitalRecords))   { vitalRecords    = data.vitalRecords;    saveVitals();   renderVitalList(); }
      if (Array.isArray(data.exerciseRecords)){ exerciseRecords = data.exerciseRecords; saveExercise(); renderExerciseList(); }
      if (data.exerProfile && typeof data.exerProfile === 'object'){
        exerProfile = { ...exerProfile, ...data.exerProfile };
        saveExerProfile(); loadExerProfile();
      }
      updateStorageUsage(); showToast('导入成功');
    } catch(err){ alert('导入失败：文件格式不正确'); }
    e.target.value = '';
  };
  reader.readAsText(file);
});
document.getElementById('clearAllData').addEventListener('click', async () => {
  if (!confirm('确定要清空全部数据吗？建议先导出备份！')) return;
  try {
    if (appMode === 'cloud' && currentUser){
      for (const t of ['people','songs','places','medias','schedules','notes','timeline_events','novels','novel_chapters','ledger','sleep_records','vitals','exercises']){
        await sb.from(t).delete().eq('user_id', currentUser.id);
      }
    }
    people = []; songs = []; places = []; medias = []; schedules = [];
    notes = []; timelineEvents = []; novels = []; ledger = [];
    sleepRecords = []; vitalRecords = []; exerciseRecords = [];
    exerProfile = { gender: 'male', age: '', height: '', weight: '' };
    try {
      [PEOPLE_KEY, SONGS_KEY, PLACES_KEY, MEDIA_KEY, CAL_KEY, NOTES_KEY, TL_KEY,
       NOVELS_KEY, CHAPTERS_KEY, LEDGER_KEY, SLEEP_KEY, VITAL_KEY, EXER_KEY, EXER_PROFILE_KEY].forEach(k => localStorage.removeItem(k));
    } catch(e){}
    renderPeople(); renderSongs(); renderPlaces(); renderMedias(); renderCalendar();
    renderNotes(); renderTimeline(); renderNovelList(); renderLedger();
    renderSleepList(); renderSleepChart(); renderVitalList(); renderExerciseList();
    loadExerProfile();
    updateStorageUsage(); showToast('全部数据已清空');
  } catch(err){ alert('清空失败：' + err.message); }
});

/* ============================================================
   主页日期
   ============================================================ */
(function updateHomeDate(){
  const el = document.getElementById('homeDate');
  if (!el) return;
  function render(){
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const weekdays = ['日','一','二','三','四','五','六'];
    const w = weekdays[now.getDay()];
    el.textContent = y + ' 年 ' + m + ' 月 ' + d + ' 日 · 星期' + w;
  }
  render();
  setInterval(render, 60 * 1000);
})();

/* ============================================================
   初始化
   ============================================================ */
updateStorageUsage();
loadLedger();
updateWordFreq();

loadSleep();     renderSleepList(); renderSleepChart();
loadVitals();    renderVitalList();
loadExercise();  loadExerProfile(); renderExerciseList();
loadTimeline();
loadNotes();

/* ============================================================
   V2.3.2 · 工具面包屑导航
   ============================================================ */
const TOOL_REGISTRY = [
  /* ① 健康与运动 */
  { id: 'health',       name: '健康管理' },
  { id: 'exercise',     name: '运动记录' },
  { id: 'heatindex',    name: '体感温度' },
  { id: 'meditation',   name: '冥想练习' },
  /* ② 创作工坊 */
  { id: 'novel',        name: '小说助手' },
  { id: 'textanalysis', name: '文章分析' },
  { id: 'people',       name: '人物印象表' },
  { id: 'timeline',     name: '时间线' },
  { id: 'namer',        name: '起名器' },
  { id: 'dialogue',     name: '对话生成器' },
  { id: 'random',       name: '随机灵感' },
  { id: 'notes',        name: '灵感速记' },
  { id: 'canvas',       name: '畅想画布' },
  { id: 'imagecompress', name: '图片压缩' },
  /* ③ 收藏与记录 */
  { id: 'songs',        name: '歌曲收藏' },
  { id: 'places',       name: '地点收藏' },
  { id: 'media',        name: '影视收藏' },
  { id: 'recipe',       name: '菜谱收藏' },
  /* ④ 计算与数据 */
  { id: 'calc',         name: '数学计算' },
  { id: 'chart',        name: '统计图生成' },
  { id: 'qrcode',       name: '二维码生成' },
  /* ⑤ 时间与生活 */
  { id: 'calendar',     name: '我的日历' },
  { id: 'clock',        name: '时钟工具' },
  { id: 'ledger',       name: '我的记账本' },
  { id: 'timestamp',    name: '时间戳转换' },
  /* ⑥ AI 与开发 */
  { id: 'ai',           name: 'AI 助手' },
  { id: 'code',         name: '代码编辑器' },
  { id: 'json',         name: 'JSON 格式化' }
];

const SVG_HOME =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
  '<path d="M9 22V12h6v10"/></svg>';

const SVG_GRID =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="3" y="3" width="7" height="7" rx="1.5"/>' +
  '<rect x="14" y="3" width="7" height="7" rx="1.5"/>' +
  '<rect x="3" y="14" width="7" height="7" rx="1.5"/>' +
  '<rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';

function injectToolCrumbs(){
  TOOL_REGISTRY.forEach(function(tool){
    var page = document.getElementById('page-' + tool.id);
    if (!page){ console.warn('[面包屑] 找不到 page-' + tool.id); return; }
    if (page.dataset.crumbInjected === '1') return;
    page.dataset.crumbInjected = '1';

    var oldBack = page.querySelector('.back-btn');
    if (oldBack) oldBack.remove();

    var nav = document.createElement('nav');
    nav.className = 'tool-crumb';

    var toolsHtml = TOOL_REGISTRY.map(function(t){
      return '<button type="button" class="crumb-tool' +
        (t.id === tool.id ? ' active' : '') +
        '" data-crumb-nav="' + t.id + '">' + t.name + '</button>';
    }).join('');

    nav.innerHTML =
      '<div class="crumb-path">' +
        '<button type="button" class="crumb-link" data-crumb-nav="home">' + SVG_HOME + '<span>首页</span></button>' +
        '<span class="crumb-sep">/</span>' +
        '<button type="button" class="crumb-link" data-crumb-nav="apps">' + SVG_GRID + '<span>应用中心</span></button>' +
        '<span class="crumb-sep">/</span>' +
        '<span class="crumb-current">' + tool.name + '</span>' +
      '</div>' +
      '<div class="crumb-tools">' +
        '<span class="crumb-tools-label">全部工具</span>' +
        toolsHtml +
      '</div>';

    page.insertBefore(nav, page.firstChild);

    nav.querySelectorAll('[data-crumb-nav]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var target = btn.getAttribute('data-crumb-nav');
        if (!target) return;
        if (typeof go === 'function') go(target);
        else console.warn('[面包屑] go() 未定义');
      });
    });
  });
}

injectToolCrumbs();


/* ============================================================
   冥想练习
   ============================================================ */
(function initMeditation(){
  'use strict';

  const PRESETS = {
    '478': {
      name: '4-7-8 呼吸',
      phases: [
        { label: '吸气', sec: 4, scale: 1.00, tone: 523 },
        { label: '屏息', sec: 7, scale: 1.00, tone: 440 },
        { label: '呼气', sec: 8, scale: 0.55, tone: 392 }
      ]
    },
    'box': {
      name: '箱式呼吸',
      phases: [
        { label: '吸气', sec: 4, scale: 1.00, tone: 523 },
        { label: '屏息', sec: 4, scale: 1.00, tone: 440 },
        { label: '呼气', sec: 4, scale: 0.55, tone: 392 },
        { label: '停留', sec: 4, scale: 0.55, tone: 349 }
      ]
    },
    'equal': {
      name: '等长呼吸',
      phases: [
        { label: '吸气', sec: 4, scale: 1.00, tone: 523 },
        { label: '呼气', sec: 4, scale: 0.55, tone: 392 }
      ]
    },
    'deep': {
      name: '深度放松',
      phases: [
        { label: '吸气', sec: 5, scale: 1.00, tone: 523 },
        { label: '屏息', sec: 2, scale: 1.00, tone: 440 },
        { label: '呼气', sec: 7, scale: 0.55, tone: 392 }
      ]
    }
  };

  const stageEl     = document.getElementById('medStage');
  const circleEl    = document.getElementById('medCircle');
  const phaseEl     = document.getElementById('medPhase');
  const countdownEl = document.getElementById('medCountdown');
  const cyclesEl    = document.getElementById('medCycles');
  const startBtn    = document.getElementById('medStart');
  const pauseBtn    = document.getElementById('medPause');
  const resetBtn    = document.getElementById('medReset');
  const soundEl     = document.getElementById('medSound');
  const presetGrid  = document.getElementById('medPresetGrid');
  if (!stageEl || !circleEl) return;

  let currentPreset = '478';
  let running = false;
  let paused = false;
  let phaseIndex = 0;
  let remaining = 0;
  let cycles = 0;
  let timer = null;
  let audioCtx = null;

  function beep(freq, dur) {
    if (!soundEl || !soundEl.checked) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    } catch(e){}
  }

  function applyPhase() {
    const preset = PRESETS[currentPreset];
    const phase = preset.phases[phaseIndex];
    phaseEl.textContent = phase.label;
    countdownEl.textContent = phase.sec;

    // 圆形动画：transition 时长与 phase.sec 一致
    circleEl.style.transition = 'transform ' + phase.sec + 's ease-in-out';
    // 让 transition 先生效，再改 scale
    requestAnimationFrame(() => {
      circleEl.style.transform = 'scale(' + phase.scale + ')';
    });

    beep(phase.tone, Math.min(0.25, phase.sec * 0.15));
    remaining = phase.sec;
  }

  function nextPhase() {
    const preset = PRESETS[currentPreset];
    phaseIndex++;
    if (phaseIndex >= preset.phases.length) {
      phaseIndex = 0;
      cycles++;
      cyclesEl.textContent = cycles;
    }
    applyPhase();
  }

  function tick() {
    remaining--;
    if (remaining <= 0) {
      nextPhase();
    } else {
      countdownEl.textContent = remaining;
    }
  }

  function start() {
    if (running && !paused) return;
    if (!running) {
      // 全新开始
      running = true;
      paused = false;
      phaseIndex = 0;
      cycles = 0;
      cyclesEl.textContent = 0;
      stageEl.classList.add('running');
      applyPhase();
    } else if (paused) {
      paused = false;
    }
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    startBtn.textContent = '进行中…';
    startBtn.disabled = true;
    pauseBtn.textContent = '暂停';
  }

  function pause() {
    if (!running || paused) return;
    paused = true;
    clearInterval(timer);
    timer = null;
    // 停下圆形动画，保持当前大小
    const cs = getComputedStyle(circleEl).transform;
    circleEl.style.transition = 'none';
    circleEl.style.transform = cs === 'none' ? 'scale(0.55)' : cs;
    pauseBtn.textContent = '继续';
  }

  function reset() {
    clearInterval(timer);
    timer = null;
    running = false;
    paused = false;
    phaseIndex = 0;
    remaining = 0;
    cycles = 0;
    cyclesEl.textContent = 0;
    phaseEl.textContent = '准备开始';
    countdownEl.textContent = '—';
    circleEl.style.transition = 'transform .5s ease';
    circleEl.style.transform = 'scale(0.55)';
    stageEl.classList.remove('running');
    startBtn.textContent = '开始';
    startBtn.disabled = false;
    pauseBtn.textContent = '暂停';
  }

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  resetBtn.addEventListener('click', reset);

  presetGrid.querySelectorAll('.med-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (running) {
        if (!confirm('切换呼吸节奏会重置当前进度，继续吗？')) return;
      }
      presetGrid.querySelectorAll('.med-preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentPreset = chip.dataset.med;
      reset();
    });
  });
})();


/* ============================================================
   JSON 格式化 / 校验
   ============================================================ */
(function initJsonTool(){
  'use strict';

  const inputEl   = document.getElementById('jsonInput');
  const outputEl  = document.getElementById('jsonOutput');
  const statusEl  = document.getElementById('jsonStatus');
  if (!inputEl || !outputEl) return;

  function setStatus(text, kind, extraHtml) {
    statusEl.innerHTML = text + (extraHtml || '');
    statusEl.className = 'json-status' + (kind ? ' ' + kind : '');
  }

  function locateError(msg, src) {
    const m = msg.match(/position (\d+)/i);
    if (!m) return null;
    const pos = parseInt(m[1], 10);
    if (!isFinite(pos)) return null;
    const before = src.slice(0, pos);
    const lines = before.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return { pos, line, col };
  }

  function friendlyError(rawMsg, src) {
    const loc = locateError(rawMsg, src);
    let msg = rawMsg.replace(/^JSON\.parse:\s*/i, '');
    msg = msg.replace(/in JSON at position \d+/i, '').trim();
    const zhMap = {
      'Unexpected token': '出现意外字符',
      'Unexpected end of JSON input': 'JSON 未完整结束',
      'Unexpected number in JSON': '数字格式异常',
      'Unexpected string in JSON': '字符串格式异常'
    };
    for (const k in zhMap) {
      if (msg.indexOf(k) === 0) { msg = zhMap[k] + msg.slice(k.length); break; }
    }
    return { msg, loc };
  }

  function parseInput() {
    const src = inputEl.value;
    if (!src.trim()) {
      return { empty: true };
    }
    try {
      const data = JSON.parse(src);
      return { data };
    } catch(e) {
      const info = friendlyError(e.message || String(e), src);
      return { error: info.msg, loc: info.loc };
    }
  }

  function handleResult(rawResult, successHint) {
    if (rawResult.empty) {
      setStatus('等待输入…', '');
      outputEl.value = '';
      return;
    }
    if (rawResult.error) {
      const locHtml = rawResult.loc
        ? ' <span class="pos">第 ' + rawResult.loc.line + ' 行</span> <span class="pos">第 ' + rawResult.loc.col + ' 列</span>'
        : '';
      setStatus('✗ 语法错误：' + rawResult.error + locHtml, 'err');
      outputEl.value = '';
      return;
    }
    outputEl.value = rawResult.output;
    setStatus('✓ ' + (successHint || '处理成功') + '，共 ' + rawResult.output.length + ' 字符', 'ok');
  }

  function tryFormat(indent) {
    const r = parseInput();
    if (r.empty || r.error) { handleResult(r); return; }
    const out = JSON.stringify(r.data, null, indent);
    handleResult({ output: out }, '格式化完成（' + indent + ' 空格缩进）');
  }

  function tryMinify() {
    const r = parseInput();
    if (r.empty || r.error) { handleResult(r); return; }
    const out = JSON.stringify(r.data);
    handleResult({ output: out }, '已压缩为一行');
  }

  function tryEscape() {
    const src = inputEl.value;
    if (!src) { setStatus('等待输入…', ''); outputEl.value = ''; return; }
    try {
      const out = JSON.stringify(src);
      outputEl.value = out;
      setStatus('✓ 转义完成（把整段输入当成字符串处理）', 'ok');
    } catch(e) {
      setStatus('✗ 转义失败：' + (e.message || e), 'err');
    }
  }

  function tryUnescape() {
    const src = inputEl.value.trim();
    if (!src) { setStatus('等待输入…', ''); outputEl.value = ''; return; }
    // 去掉最外层的引号（如果存在）
    let s = src;
    if ((s[0] === '"' && s[s.length - 1] === '"') ||
        (s[0] === '\'' && s[s.length - 1] === '\'')) {
      s = s.slice(1, -1);
    }
    try {
      const out = JSON.parse('"' + s.replace(/"/g, '\\"') + '"');
      outputEl.value = out;
      setStatus('✓ 去转义完成', 'ok');
    } catch(e) {
      // 退化为手动替换
      try {
        const fallback = s.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        outputEl.value = fallback;
        setStatus('✓ 已去转义（使用宽松模式）', 'ok');
      } catch(err) {
        setStatus('✗ 去转义失败：' + (e.message || e), 'err');
      }
    }
  }

  function tryCopy() {
    if (!outputEl.value) { showToast('没有可复制的内容'); return; }
    navigator.clipboard.writeText(outputEl.value)
      .then(() => showToast('已复制到剪贴板'))
      .catch(() => showToast('复制失败，请手动复制'));
  }

  function tryClear() {
    inputEl.value = '';
    outputEl.value = '';
    setStatus('等待输入…', '');
    inputEl.focus();
  }

  document.getElementById('jsonFormat2').addEventListener('click', () => tryFormat(2));
  document.getElementById('jsonFormat4').addEventListener('click', () => tryFormat(4));
  document.getElementById('jsonMinify').addEventListener('click', tryMinify);
  document.getElementById('jsonEscape').addEventListener('click', tryEscape);
  document.getElementById('jsonUnescape').addEventListener('click', tryUnescape);
  document.getElementById('jsonCopy').addEventListener('click', tryCopy);
  document.getElementById('jsonClear').addEventListener('click', tryClear);

  // 输入时自动校验（不自动格式化）
  let inputDebounce = null;
  inputEl.addEventListener('input', () => {
    clearTimeout(inputDebounce);
    inputDebounce = setTimeout(() => {
      const src = inputEl.value;
      if (!src.trim()) { setStatus('等待输入…', ''); return; }
      try {
        JSON.parse(src);
        setStatus('✓ 语法正确，点击上方按钮格式化', 'ok');
      } catch(e) {
        const info = friendlyError(e.message || String(e), src);
        const locHtml = info.loc
          ? ' <span class="pos">第 ' + info.loc.line + ' 行</span> <span class="pos">第 ' + info.loc.col + ' 列</span>'
          : '';
        setStatus('✗ ' + info.msg + locHtml, 'err');
      }
    }, 300);
  });

  // 快捷键：Ctrl/Cmd + Enter 格式化 2 空格
  inputEl.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      tryFormat(2);
    }
  });
})();

/* ============================================================
   通知系统
   —— 发布通知：在 NOTIFICATIONS 数组里加一条即可
   ============================================================ */
(function initNotifications(){
  'use strict';

  /* =========================================================
     ① 通知数据
     —— 用户发布新通知：往下面数组最前面插一条
     —— id 必须唯一（自己起名字，改过就代表"新通知"）
     —— type 可选：info / success / warning / important
     ========================================================= */
  const NOTIFICATIONS = [
    {
      id: 'v3-0-release',
      type: 'success',
      title: 'V3.0 焕新版上线',
      content: '青柠绿主题全面焕新，界面、按钮、卡片全部升级；新增「冥想练习」与「JSON 格式化」两款工具。',
      time: '2026-10-01'
    },
    {
      id: 'json-tool',
      type: 'info',
      title: '新工具：JSON 格式化',
      content: '「AI 与开发」分类下新增 JSON 格式化 / 校验工具，支持格式化、压缩、转义、错误定位。',
      time: '2026-10-01'
    },
    {
      id: 'meditation-tool',
      type: 'info',
      title: '新工具：冥想练习',
      content: '「健康与运动」分类下新增冥想练习，内置 4-7-8、箱式呼吸等多种节奏，附提示音与循环计数。',
      time: '2026-10-01'
    }
    // 👆 在这里加更多通知：
    // {
    //   id: 'my-notice-1',
    //   type: 'warning',  // info / success / warning / important
    //   title: '通知标题',
    //   content: '通知内容。',
    //   time: '2026-10-02'
    // },
  ];

  const READ_KEY = 'suidou-notif-read-v1';
  const MAX_SHOW = 30;

  const btnEl    = document.getElementById('notifBtn');
  const dotEl    = document.getElementById('notifDot');
  const panelEl  = document.getElementById('notifPanel');
  const listEl   = document.getElementById('notifList');
  const clearEl  = document.getElementById('notifClearAll');
  if (!btnEl || !panelEl || !listEl) return;

  function getReadSet(){
    try {
      const raw = localStorage.getItem(READ_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch(e){ return new Set(); }
  }
  function saveReadSet(set){
    try { localStorage.setItem(READ_KEY, JSON.stringify(Array.from(set))); } catch(e){}
  }

  function getUnreadCount(readSet){
    return NOTIFICATIONS.filter(n => !readSet.has(n.id)).length;
  }

  function updateDot(){
    const readSet = getReadSet();
    const n = getUnreadCount(readSet);
    if (n > 0){
      dotEl.style.display = '';
      dotEl.textContent = n > 99 ? '99+' : String(n);
    } else {
      dotEl.style.display = 'none';
    }
  }

  function esc(str){
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function renderList(){
    const readSet = getReadSet();
    const list = NOTIFICATIONS.slice(0, MAX_SHOW);

    if (!list.length){
      listEl.innerHTML =
        '<div class="notif-empty">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>' +
            '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
          '</svg>' +
          '暂无通知' +
        '</div>';
      return;
    }

    listEl.innerHTML = list.map(n => {
      const unread = !readSet.has(n.id);
      const type = ['info','success','warning','important'].includes(n.type) ? n.type : 'info';
      return '<div class="notif-item ' + (unread ? 'unread ' : '') + 'type-' + type + '" data-nid="' + esc(n.id) + '">' +
        '<p class="notif-item-title">' + esc(n.title || '通知') + '</p>' +
        '<p class="notif-item-content">' + esc(n.content || '') + '</p>' +
        '<div class="notif-item-time">' + esc(n.time || '') + '</div>' +
      '</div>';
    }).join('');

    listEl.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.nid;
        const readSet = getReadSet();
        readSet.add(id);
        saveReadSet(readSet);
        el.classList.remove('unread');
        updateDot();
      });
    });
  }

  function openPanel(){
    renderList();
    positionPanel();
    panelEl.classList.add('show');
    btnEl.classList.add('open');
  }
  function closePanel(){
    panelEl.classList.remove('show');
    btnEl.classList.remove('open');
  }
  function togglePanel(){
    if (panelEl.classList.contains('show')) closePanel();
    else openPanel();
  }

  function positionPanel(){
    const rect = btnEl.getBoundingClientRect();
    if (window.innerWidth <= 520) {
      // 移动端：CSS 里已经用媒体查询定好了位置
      return;
    }
    const panelWidth = 380;
    let left = rect.right - panelWidth;
    if (left < 12) left = 12;
    if (left + panelWidth > window.innerWidth - 12) {
      left = window.innerWidth - 12 - panelWidth;
    }
    panelEl.style.left = left + 'px';
    panelEl.style.right = 'auto';
    panelEl.style.top = (rect.bottom + 8) + 'px';
  }

  btnEl.addEventListener('click', e => {
    e.stopPropagation();
    togglePanel();
  });

  panelEl.addEventListener('click', e => {
    e.stopPropagation();
  });

  clearEl.addEventListener('click', () => {
    const readSet = getReadSet();
    NOTIFICATIONS.forEach(n => readSet.add(n.id));
    saveReadSet(readSet);
    renderList();
    updateDot();
    if (typeof showToast === 'function') showToast('已全部标为已读');
  });

  document.addEventListener('click', () => {
    if (panelEl.classList.contains('show')) closePanel();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panelEl.classList.contains('show')) closePanel();
  });

  window.addEventListener('resize', () => {
    if (panelEl.classList.contains('show')) positionPanel();
  });
  window.addEventListener('scroll', () => {
    if (panelEl.classList.contains('show') && window.innerWidth > 520) positionPanel();
  }, { passive: true });

  updateDot();
})();

/* ============================================================
   全部应用 · 按拼音首字母排序 + 分组
   ============================================================ */
(function initSortAllAppsByPinyin(){
  'use strict';

  var grid = document.getElementById('allApps');
  if (!grid) return;

  /* 工具名 → 首字母。
     以后新增工具，只要在这里加一行就行；不加也不会报错，会归到「#」组。 */
  var PINYIN = {
    'AI 助手': 'A',
    'JSON 格式化': 'J',
    '畅想画布': 'C',
    '常见统计图生成': 'C',
    '菜谱收藏': 'C',
    '代码编辑器': 'D',
    '对话生成器': 'D',
    '地点收藏': 'D',
    '二维码生成': 'E',
    '歌曲收藏': 'G',
    '健康管理': 'J',
    '灵感速记': 'L',
    '冥想练习': 'M',
    '起名器': 'Q',
    '人物印象表': 'R',
    '数学计算': 'S',
    '时间戳转换': 'S',
    '时间线': 'S',
    '时钟工具': 'S',
    '随机灵感': 'S',
    '体感温度与运动风险': 'T',
    '图片压缩': 'T',
    '我的记账本': 'W',
    '我的日历': 'W',
    '文章分析': 'W',
    '小说助手': 'X',
    '影视收藏': 'Y',
    '运动记录': 'Y'
  };

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.tool-card'));
  if (!cards.length) return;

  // 给每张卡打上首字母标记
  cards.forEach(function(card){
    var h3 = card.querySelector('h3');
    var name = h3 ? h3.textContent.trim() : '';
    card.dataset.pname = name;
    card.dataset.letter = PINYIN[name] || '#';
  });

  // 按拼音排序（同组内用 localeCompare 做二次排序）
  cards.sort(function(a, b){
    var la = a.dataset.letter, lb = b.dataset.letter;
    if (la !== lb) return la < lb ? -1 : 1;
    try {
      return a.dataset.pname.localeCompare(b.dataset.pname, 'zh-Hans-CN', { sensitivity: 'base' });
    } catch(e){
      return a.dataset.pname.localeCompare(b.dataset.pname);
    }
  });

  // 按字母分组
  var groups = {};
  cards.forEach(function(card){
    var L = card.dataset.letter;
    (groups[L] = groups[L] || []).push(card);
  });

  // 重新插入 DOM：字母标题 + 该组的所有卡片
  var letters = Object.keys(groups).sort();
  grid.innerHTML = '';
  letters.forEach(function(L){
    var head = document.createElement('div');
    head.className = 'pinyin-head';
    head.setAttribute('data-letter', L);
    head.textContent = L;
    grid.appendChild(head);
    groups[L].forEach(function(card){
      grid.appendChild(card);
    });
  });
})();
console.log('%c岁窦工具箱 · V2.3.2 铂金版 已加载', 'color:#565d65;font-weight:700;font-size:14px;');