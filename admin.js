/**
 * Nv-Pu-Sa (X-Archive) v2 - Admin Console & Vault Controller
 * Reactive Session Gate · X Credentials · Smart Sync Engine · JSON Backup
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== 1. Canvas Starfield Particles Background ====================
  function initCanvasParticles() {
    const canvas = document.getElementById('bg-particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const numParticles = Math.min(Math.floor((width * height) / 24000), 45);
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 100) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(render);
    }

    render();
  }

  initCanvasParticles();

  // ==================== 2. DOM Elements ====================
  const authGateScreen = document.getElementById('auth-gate-screen');
  const authCardBox = document.getElementById('auth-card-box');
  const adminDashboardScreen = document.getElementById('admin-dashboard-screen');
  const adminLoginForm = document.getElementById('admin-login-form');
  const loginUser = document.getElementById('login-user');
  const loginPass = document.getElementById('login-pass');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  const btnAdminLogout = document.getElementById('btn-admin-logout');

  // X Account Card & Form & Loading Skeleton
  const credLoadingSkeleton = document.getElementById('cred-loading-skeleton');
  const xCookieAccountBox = document.getElementById('x-cookie-account-box');
  const xAccountAvatar = document.getElementById('x-account-avatar');
  const xAccountName = document.getElementById('x-account-name');
  const xAccountHandle = document.getElementById('x-account-handle');
  const btnLogoutXAccount = document.getElementById('btn-logout-x-account');

  const cookieFormWrapper = document.getElementById('cookie-form-wrapper');
  const inputCt0 = document.getElementById('input-ct0');
  const inputAuthToken = document.getElementById('input-auth-token');
  const chkRememberCred = document.getElementById('chk-remember-cred');
  const credStatusIndicator = document.getElementById('cred-status-indicator');
  const credStatusText = document.getElementById('cred-status-text');
  const btnClearCred = document.getElementById('btn-clear-cred');
  const btnSaveCred = document.getElementById('btn-save-cred');
  const credFormMsg = document.getElementById('cred-form-msg');

  // Sync Engine
  const btnTriggerSync = document.getElementById('btn-trigger-sync');
  const syncProgressBox = document.getElementById('sync-progress-box');
  const syncProgressStatusText = document.getElementById('sync-progress-status-text');
  const syncProgressCountText = document.getElementById('sync-progress-count-text');
  const syncProgressFill = document.getElementById('sync-progress-fill');
  const terminalLogContainer = document.getElementById('terminal-log-container');
  const terminalLogOutput = document.getElementById('terminal-log-output');

  // GitHub Actions & Cloud Tasks
  const btnTriggerGhFullSync = document.getElementById('btn-trigger-gh-full-sync');

  // Backup & Restore
  const btnExportJson = document.getElementById('btn-export-json');
  const btnImportJson = document.getElementById('btn-import-json');
  const btnResetD1 = document.getElementById('btn-reset-d1');
  const fileInputBackup = document.getElementById('file-input-backup');
  const toastContainer = document.getElementById('toast-container');

  // Top HUD Ribbon Elements
  const hudValCred = document.getElementById('hud-val-cred');
  const hudDotCred = document.getElementById('hud-dot-cred');
  const hudValCount = document.getElementById('hud-val-count');
  const hudR2Status = document.getElementById('hud-r2-status');
  const hudD1Latency = document.getElementById('hud-d1-latency');

  // Top Tabs Elements
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  const adminTabPanes = document.querySelectorAll('.admin-tab-pane');
  const tabNavBloggerBadge = document.getElementById('tab-nav-blogger-badge');

  let adminSessionToken = localStorage.getItem('x_archive_admin_token') || '';
  let syncPollingInterval = null;
  let currentActiveTab = 'overview';

  // ==================== 2.5 Admin Tabs Manager ====================
  function switchAdminTab(tabName, updateHash = true) {
    if (!tabName) tabName = 'overview';
    currentActiveTab = tabName;

    adminTabBtns.forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', String(match));
    });

    adminTabPanes.forEach(pane => {
      const match = pane.id === `tab-pane-${tabName}`;
      pane.classList.toggle('hidden', !match);
      if (match) pane.classList.add('active');
    });

    if (updateHash && window.location.hash !== `#${tabName}`) {
      window.history.replaceState(null, '', `#${tabName}`);
    }

    if (tabName === 'bloggers') {
      loadBloggerVault();
    } else if (tabName === 'analytics') {
      loadAnalyticsDashboard();
    } else {
      updateHudArchiveCount();
    }
  }

  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      triggerClickSpark(e);
      const targetTab = btn.getAttribute('data-tab');
      switchAdminTab(targetTab, true);
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'bloggers', 'analytics'].includes(hash)) {
      switchAdminTab(hash, false);
    }
  });

  async function updateHudArchiveCount() {
    const startTime = performance.now();
    try {
      let totalBloggerCount = null;
      let r2Bound = false;
      let r2Count = 0;

      if (adminSessionToken) {
        try {
          const adminRes = await fetch('/api/admin/bloggers?limit=1', {
            headers: { 'x-admin-token': adminSessionToken }
          });
          const adminJson = await adminRes.json();
          if (adminJson.success && adminJson.stats && typeof adminJson.stats.total === 'number') {
            totalBloggerCount = adminJson.stats.total;
            r2Bound = !!adminJson.r2_bound;
            r2Count = adminJson.r2_count || 0;
          }
        } catch (e) {
          console.warn('Failed to fetch admin stats for HUD:', e);
        }
      }

      // 仅在未能从轻量 admin 接口拿到统计时，才降级请求 /api/archive
      if (totalBloggerCount === null) {
        const res = await fetch('/api/archive');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          totalBloggerCount = json.data.length;
          r2Bound = !!json.r2_bound;
          r2Count = json.r2_count || 0;
        }
      }

      const latencyMs = Math.round(performance.now() - startTime);

      if (totalBloggerCount !== null) {
        if (hudValCount) hudValCount.textContent = `${totalBloggerCount} 位博主`;
        if (tabNavBloggerBadge) tabNavBloggerBadge.textContent = totalBloggerCount.toLocaleString();
      }

      if (hudR2Status) {
        if (r2Bound) {
          hudR2Status.className = 'hud-latency-pill fast';
          hudR2Status.textContent = r2Count > 0 ? `${r2Count} 图已归档` : '10GB 就绪';
        } else {
          hudR2Status.className = 'hud-latency-pill normal';
          hudR2Status.textContent = '待绑定';
        }
      }

      if (hudD1Latency) {
        if (latencyMs < 120) {
          hudD1Latency.className = 'hud-latency-pill fast';
        } else if (latencyMs < 350) {
          hudD1Latency.className = 'hud-latency-pill normal';
        } else {
          hudD1Latency.className = 'hud-latency-pill slow';
        }
        hudD1Latency.textContent = `${latencyMs}ms`;
      }
    } catch (e) {
      if (hudD1Latency) {
        hudD1Latency.className = 'hud-latency-pill error';
        hudD1Latency.textContent = '离线';
      }
    }
  }

  // ==================== 3. Admin Auth & Session Gate ====================
  async function checkAdminSession() {
    if (!adminSessionToken) {
      showGate(true);
      return;
    }

    // 乐观渲染：token 存在时先直接显示 dashboard，避免登录界面闪烁
    showGate(false);
    btnAdminLogout.classList.remove('hidden');
    updateHudArchiveCount();

    try {
      const res = await fetch('/api/admin/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSessionToken
        }
      });
      const json = await res.json();
      if (json.authenticated) {
        initCredentials();
        checkActiveWorkflowOnLoad();
        const initHash = window.location.hash.replace('#', '');
        if (initHash && ['overview', 'bloggers', 'analytics'].includes(initHash)) {
          switchAdminTab(initHash, false);
        } else {
          switchAdminTab('overview', false);
        }
      } else {
        performLogout();
      }
    } catch (e) {
      performLogout();
    }
  }

  function showGate(isLocked) {
    if (isLocked) {
      authGateScreen.classList.remove('hidden');
      adminDashboardScreen.classList.add('hidden');
      btnAdminLogout?.classList.add('hidden');
    } else {
      authGateScreen.classList.add('hidden');
      adminDashboardScreen.classList.remove('hidden');
      btnAdminLogout?.classList.remove('hidden');
      updateHudArchiveCount();
    }
  }

  adminLoginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUser.value.trim();
    const password = loginPass.value.trim();

    if (!username || !password) return;

    btnSubmitLogin.disabled = true;
    btnSubmitLogin.querySelector('span').textContent = '正在解密...';
    loginErrorMsg.classList.add('hidden');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();

      if (json.success && json.token) {
        adminSessionToken = json.token;
        localStorage.setItem('x_archive_admin_token', adminSessionToken);
        showGate(false);
        btnAdminLogout.classList.remove('hidden');
        showToast('通行鉴权成功，已进入控制台');
        initCredentials();
        checkActiveWorkflowOnLoad();
        updateHudArchiveCount();
        const initHash = window.location.hash.replace('#', '');
        if (initHash && ['overview', 'bloggers', 'analytics'].includes(initHash)) {
          switchAdminTab(initHash, false);
        } else {
          switchAdminTab('overview', false);
        }
      } else {
        authCardBox.classList.add('shake-error');
        setTimeout(() => authCardBox.classList.remove('shake-error'), 500);
        loginErrorMsg.textContent = json.error || '账号或通行密码错误';
        loginErrorMsg.classList.remove('hidden');
      }
    } catch (err) {
      loginErrorMsg.textContent = '网络错误，请稍后重试';
      loginErrorMsg.classList.remove('hidden');
    } finally {
      btnSubmitLogin.disabled = false;
      btnSubmitLogin.querySelector('span').textContent = '解密并进入控制台';
    }
  });

  function performLogout() {
    adminSessionToken = '';
    localStorage.removeItem('x_archive_admin_token');
    showGate(true);
    showToast('已安全退出管理控制台');
  }

  btnAdminLogout?.addEventListener('click', performLogout);

  // ==================== 4. X Cookie Credentials Management ====================
  async function initCredentials() {
    // 隐藏状态和表单，展示质感加载骨架屏遮罩
    credLoadingSkeleton?.classList.remove('hidden');
    xCookieAccountBox?.classList.add('hidden');
    cookieFormWrapper?.classList.add('hidden');

    try {
      const res = await fetch('/api/admin/credentials', {
        headers: { 'x-admin-token': adminSessionToken }
      });
      const json = await res.json();

      if (json.success && json.hasCredentials) {
        inputCt0.value = json.ct0 || '';
        inputAuthToken.value = json.authToken || '';
        setCredStatus(true, '已保存登录凭据');
        await verifyAndShowUser(json.ct0, json.authToken, false);
      } else {
        // Fallback to local storage if remembered
        const localCt0 = localStorage.getItem('x_archive_ct0');
        const localAuth = localStorage.getItem('x_archive_auth_token');
        if (localCt0 && localAuth) {
          inputCt0.value = localCt0;
          inputAuthToken.value = localAuth;
          await verifyAndShowUser(localCt0, localAuth, false);
        } else {
          setCredStatus(false, '未登录 X 账号');
          credLoadingSkeleton?.classList.add('hidden');
          cookieFormWrapper?.classList.remove('hidden');
        }
      }
    } catch (e) {
      console.warn('获取已存凭据错误:', e);
      credLoadingSkeleton?.classList.add('hidden');
      cookieFormWrapper?.classList.remove('hidden');
    }
  }

  function setCredStatus(isActive, text, handle = '') {
    if (credStatusIndicator) {
      credStatusIndicator.className = `status-tag ${isActive ? 'active' : 'inactive'}`;
    }
    if (credStatusText) credStatusText.textContent = text;

    if (hudValCred) {
      hudValCred.textContent = isActive ? (handle ? `@${handle} · 凭据就绪` : '已连接 X 账号') : '未登录 X 账号';
    }
    if (hudDotCred) {
      hudDotCred.className = `hud-badge-dot ${isActive ? 'active' : 'inactive'}`;
    }
  }

  let R2_CDN_BASE = (function() {
    try {
      const cached = sessionStorage.getItem('x_archive_r2_domain');
      if (cached !== null) return cached;
    } catch (e) {}
    return '';
  })();

  function setR2CdnDomain(domain) {
    if (domain === null || domain === undefined) return;
    const clean = String(domain).trim().replace(/\/+$/, '');
    if (clean === 'none' || clean === 'false' || clean === '') {
      R2_CDN_BASE = '';
    } else {
      R2_CDN_BASE = clean;
    }
    try {
      sessionStorage.setItem('x_archive_r2_domain', R2_CDN_BASE);
    } catch (e) {}
  }

  // 异步获取服务端配置
  (async function() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.r2_public_domain !== undefined) setR2CdnDomain(cfg.r2_public_domain);
      }
    } catch (e) {}
  })();

  function resolveMediaUrl(url) {
    if (!url) return '';
    if (R2_CDN_BASE && url.includes('/api/media') && url.includes('key=')) {
      try {
        const dummyUrl = new URL(url, window.location.origin);
        const key = dummyUrl.searchParams.get('key');
        if (key) {
          return `${R2_CDN_BASE}/${key.replace(/^\/+/, '')}`;
        }
      } catch (e) {}
    }
    if (R2_CDN_BASE && url.includes('twimg.com')) {
      try {
        const parsed = new URL(url);
        const cleanPath = parsed.pathname.replace(/^\/+/, '').replace(/\//g, '_');
        if (url.includes('profile_images')) {
          return `${R2_CDN_BASE}/avatars/${cleanPath}`;
        } else if (url.includes('profile_banners')) {
          return `${R2_CDN_BASE}/covers/${cleanPath}`;
        } else {
          return `${R2_CDN_BASE}/media/${cleanPath}`;
        }
      } catch (e) {}
    }
    if (url.startsWith('/api/media') || url.startsWith('data:') || url.startsWith('/')) {
      return url;
    }
    if (url.includes('twimg.com')) {
      return `/api/media?url=${encodeURIComponent(url)}`;
    }
    return url;
  }

  async function verifyAndShowUser(ct0, authToken, showNotification = true) {
    try {
      const res = await fetch('/api/verify-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSessionToken
        },
        body: JSON.stringify({ ct0, authToken })
      });
      const json = await res.json();

      credLoadingSkeleton?.classList.add('hidden');

      if (json.success && json.user) {
        setCredStatus(true, 'X 账号验证成功', json.user.screen_name);
        xAccountName.textContent = json.user.name || '已登录 X 账号';
        xAccountHandle.textContent = `@${json.user.screen_name || 'user'}`;
        if (json.user.avatar_url) {
          xAccountAvatar.src = resolveMediaUrl(json.user.avatar_url);
        }

        xCookieAccountBox.classList.remove('hidden');
        cookieFormWrapper.classList.add('hidden');

        if (chkRememberCred.checked) {
          localStorage.setItem('x_archive_ct0', ct0);
          localStorage.setItem('x_archive_auth_token', authToken);
        }

        if (showNotification) {
          showToast(`成功连接 X 账号: @${json.user.screen_name}`);
        }
      } else {
        setCredStatus(false, 'Cookie 已失效');
        xCookieAccountBox.classList.add('hidden');
        cookieFormWrapper.classList.remove('hidden');
        if (showNotification) {
          showToast('Cookie 凭据无效或已过期');
        }
      }
    } catch (err) {
      credLoadingSkeleton?.classList.add('hidden');
      setCredStatus(false, '验证失败');
      cookieFormWrapper.classList.remove('hidden');
    }
  }

  btnSaveCred?.addEventListener('click', async () => {
    const ct0 = inputCt0.value.trim();
    const authToken = inputAuthToken.value.trim();

    if (!ct0 || !authToken) {
      showCredError('请填写完整 ct0 与 auth_token');
      return;
    }

    btnSaveCred.disabled = true;
    btnSaveCred.textContent = '校验中...';
    credFormMsg.classList.add('hidden');

    await verifyAndShowUser(ct0, authToken, true);

    btnSaveCred.disabled = false;
    btnSaveCred.textContent = '校验并登录 X';
  });

  function showCredError(msg) {
    credFormMsg.textContent = msg;
    credFormMsg.classList.remove('hidden');
  }

  btnLogoutXAccount?.addEventListener('click', () => {
    inputCt0.value = '';
    inputAuthToken.value = '';
    localStorage.removeItem('x_archive_ct0');
    localStorage.removeItem('x_archive_auth_token');
    xCookieAccountBox.classList.add('hidden');
    cookieFormWrapper.classList.remove('hidden');
    setCredStatus(false, '未登录 X 账号');
    showToast('已登出 X 账号凭据');
  });

  btnClearCred?.addEventListener('click', () => {
    inputCt0.value = '';
    inputAuthToken.value = '';
    localStorage.removeItem('x_archive_ct0');
    localStorage.removeItem('x_archive_auth_token');
    credFormMsg.classList.add('hidden');
    showToast('已清空凭据表单');
  });

  // ==================== 5. Smart Sync Engine ====================
  btnTriggerSync?.addEventListener('click', async () => {
    const ct0 = inputCt0.value.trim() || localStorage.getItem('x_archive_ct0');
    const authToken = inputAuthToken.value.trim() || localStorage.getItem('x_archive_auth_token');

    if (!ct0 || !authToken) {
      showToast('请先配置并登录 X Cookie 凭据');
      return;
    }

    btnTriggerSync.disabled = true;
    syncProgressStatusText.textContent = '正在连接 X 接口并增量同步...';
    syncProgressCountText.textContent = '请求中';
    syncProgressFill.style.width = '35%';
    terminalLogOutput.innerHTML = `> [${new Date().toLocaleTimeString()}] 启动智能增量同步任务...\n`;

    try {
      const res = await fetch('/api/sync-following', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSessionToken
        },
        body: JSON.stringify({ ct0, authToken })
      });
      const json = await res.json();

      if (json.success) {
        // 模式 A: Cloudflare Pages Edge 模式 (直接返回抓取到的关注博主数组)
        if (Array.isArray(json.following)) {
          btnTriggerSync.disabled = false;
          syncProgressFill.style.width = '100%';

          const totalDbCount = json.total_db_count || json.count || 0;
          const newCount = typeof json.new_count === 'number' ? json.new_count : (json.new_users ? json.new_users.length : 0);

          if (json.is_incremental_stop && newCount === 0) {
            const checkedNames = json.following.slice(0, 3).map(u => `@${u.screen_name}`).join(', ');
            logTerminal(`[CHECK] 触发智能增量中断：已扫描核对连续 3 位在库博主 (${checkedNames})`);
            logTerminal(`[SUCCESS] 增量核对完成：无新增关注博主，D1 数据库数据已是最新！(库中总计 ${totalDbCount} 人)`);
            syncProgressStatusText.textContent = `增量核对完成！数据已最新，库中总计 ${totalDbCount} 人`;
            syncProgressCountText.textContent = `新增 0 人`;
            showToast(`智能增量核对完成，无新增博主 (库中总计 ${totalDbCount} 人)`);
          } else {
            const newUsers = json.new_users || json.following;
            if (newUsers.length > 0) {
              newUsers.forEach(u => {
                const isR2Stored = u.avatar_url && u.avatar_url.includes('/api/media');
                const r2Tag = isR2Stored ? ' [R2 头像+封面已落库]' : '';
                logTerminal(`[NEW] 抓取到新增博主: @${u.screen_name} (${u.name}) · 粉丝: ${u.followers_count}${r2Tag}`);
              });
            }
            if (json.r2_bound) {
              logTerminal(`[R2] Cloudflare R2 对象存储已成功同步归档 ${json.r2_uploaded_count || (newUsers.length * 2)} 张高清图片 (avatars/ 与 covers/)`);
            } else {
              logTerminal(`[WARN] 未检测到 R2 存储桶绑定 (BUCKET)，图片链接已写入 D1。如需永久冷备请在 Pages 后台添加 R2 绑定: BUCKET`);
            }
            if (json.is_incremental_stop) {
              logTerminal(`[CHECK] 遇到已在库中的博主，已安全触发智能增量中断。`);
            }
            logTerminal(`[SUCCESS] Cloudflare D1 & R2 双轨同步完成！本次新增 ${newUsers.length} 人 (R2 图片 ${json.r2_uploaded_count || 0} 张)，数据库当前总计 ${totalDbCount} 人。`);
            syncProgressStatusText.textContent = `同步完成！本次新增 ${newUsers.length} 位关注博主 (R2 图片 ${json.r2_uploaded_count || 0} 张)`;
            syncProgressCountText.textContent = `新增 ${newUsers.length} 人`;
            showToast(`同步完成！新增 ${newUsers.length} 位博主 (总计 ${totalDbCount} 人)`);
          }
          updateHudArchiveCount();
          return;
        }

        // 模式 B: Node.js 本地后台长轮询任务模式
        showToast('增量同步任务已在后台启动');
        startPollingSyncStatus();
      } else {
        btnTriggerSync.disabled = false;
        showToast(`同步失败: ${json.error}`);
        logTerminal(`[ERROR] ${json.error}`);
      }
    } catch (err) {
      btnTriggerSync.disabled = false;
      showToast('网络异常，无法连接同步服务');
    }
  });

  function startPollingSyncStatus() {
    if (syncPollingInterval) clearInterval(syncPollingInterval);

    syncPollingInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync-status', {
          headers: { 'x-admin-token': adminSessionToken }
        });
        const status = await res.json();

        if (status.running) {
          syncProgressStatusText.textContent = '抓取中 (遇到已存博主自动智能停止)...';
          syncProgressCountText.textContent = `${status.current} 已抓取`;
          syncProgressFill.style.width = '65%';

          if (status.lastItem) {
            logTerminal(`[FETCH] 抓取到: @${status.lastItem.screen_name} (${status.lastItem.name}) · 粉丝: ${status.lastItem.followers_count}`);
          }
        } else {
          clearInterval(syncPollingInterval);
          btnTriggerSync.disabled = false;
          syncProgressFill.style.width = '100%';

          if (status.error) {
            syncProgressStatusText.textContent = `同步异常中断: ${status.error}`;
            logTerminal(`[ERROR] 任务失败: ${status.error}`);
            showToast(`同步中断: ${status.error}`);
          } else {
            syncProgressStatusText.textContent = `同步完成！新增 ${status.newFetched || 0} 位博主，当前总计 ${status.total || 0} 位`;
            syncProgressCountText.textContent = `${status.total || 0} 总数`;
            logTerminal(`[SUCCESS] 增量同步结束！本次抓取新增 ${status.newFetched || 0} 人，数据库总计 ${status.total || 0} 人。`);
            showToast(`同步完成！新增 ${status.newFetched || 0} 位博主`);
            updateHudArchiveCount();
            loadBloggerVault();
          }
        }
      } catch (err) {
        clearInterval(syncPollingInterval);
        btnTriggerSync.disabled = false;
      }
    }, 1500);
  }

  function logTerminal(msg) {
    if (!msg) return;
    const safe = escapeHtml(msg);
    let lineHtml = safe;
    if (safe.includes('[SUCCESS]') || safe.includes('[ALL DONE]') || safe.includes('✅') || safe.includes('🎉')) {
      lineHtml = `<span class="terminal-line-success">${safe}</span>`;
    } else if (safe.includes('[ERROR]') || safe.includes('[RESET ERROR]')) {
      lineHtml = `<span class="terminal-line-error">${safe}</span>`;
    } else if (safe.includes('[WARN]') || safe.includes('⚠️')) {
      lineHtml = `<span class="terminal-line-warn">${safe}</span>`;
    } else if (safe.includes('[R2]')) {
      lineHtml = `<span class="terminal-line-r2">${safe}</span>`;
    } else if (safe.includes('[NEW]') || safe.includes('[CHECK]') || safe.includes('[PAGE') || safe.includes('[PROGRESS]') || safe.includes('[CONFIG]') || safe.includes('[POLICY]') || safe.includes('📄') || safe.includes('📊')) {
      lineHtml = `<span class="terminal-line-info">${safe}</span>`;
    } else if (safe.includes('[FETCH]')) {
      lineHtml = `<span class="terminal-line-fetch">${safe}</span>`;
    } else if (safe.includes('简介变更') || safe.includes('资料变更') || safe.includes('[MUTATION]') || safe.includes('昵称更名') || safe.includes('🔄') || safe.includes('🏷️')) {
      lineHtml = `<span class="terminal-line-mutation">${safe}</span>`;
    } else if (safe.includes('头像更新') || safe.includes('封面更新') || safe.includes('[AVATAR]') || safe.includes('🖼️')) {
      lineHtml = `<span class="terminal-line-avatar">${safe}</span>`;
    } else if (safe.includes('封号') || safe.includes('[SUSPENDED]') || safe.includes('🚫')) {
      lineHtml = `<span class="terminal-line-suspended">${safe}</span>`;
    } else if (safe.includes('注销') || safe.includes('[DELETED]')) {
      lineHtml = `<span class="terminal-line-deleted">${safe}</span>`;
    } else if (safe.includes('主动取关') || safe.includes('取关') || safe.includes('👋')) {
      lineHtml = `<span class="terminal-line-warn">${safe}</span>`;
    } else if (safe.includes('差额') || safe.includes('🔍') || safe.includes('❓')) {
      lineHtml = `<span class="terminal-line-cooldown">${safe}</span>`;
    } else if (safe.includes('[COOLDOWN]') || safe.includes('[RATE LIMIT]') || safe.includes('[WAIT]') || safe.includes('[RETRY]') || safe.includes('❄️') || safe.includes('⏳') || safe.includes('🔥')) {
      lineHtml = `<span class="terminal-line-cooldown">${safe}</span>`;
    }

    if (terminalLogOutput) {
      const current = terminalLogOutput.innerHTML;
      if (current && !current.endsWith('\n')) {
        terminalLogOutput.innerHTML += '\n';
      }
      terminalLogOutput.innerHTML += `> ${lineHtml}\n`;
      terminalLogOutput.scrollTop = terminalLogOutput.scrollHeight;
    }
  }

  // ==================== 6. Backup Export, Restore & Reset ====================
  btnExportJson?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/archive');
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json.data, null, 2));
        const downloadAnchor = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `x_archive_backup_${timestamp}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast(`已导出 ${json.data.length} 条博主归档数据`);
      }
    } catch (e) {
      showToast('导出备份失败');
    }
  });

  btnImportJson?.addEventListener('click', () => {
    fileInputBackup.click();
  });

  fileInputBackup?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data)) {
          showToast('备份文件格式错误，需为 JSON 数组');
          return;
        }

        const confirmRestore = confirm(`确认从备份文件导入 ${data.length} 位博主数据并覆盖当前数据库吗？`);
        if (!confirmRestore) return;

        const res = await fetch('/api/archive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminSessionToken
          },
          body: JSON.stringify({ data })
        });
        const resJson = await res.json();

        if (resJson.success) {
          showToast(`成功导入并还原 ${data.length} 条博主数据`);
          updateHudArchiveCount();
          loadBloggerVault();
        } else {
          showToast(`导入失败: ${resJson.error}`);
        }
      } catch (err) {
        showToast('解析备份 JSON 失败');
      }
    };
    reader.readAsText(file);
  });

  // 清空博主归档数据（双重安全防护：二次确认 + 管理员密码强制校验）
  btnResetD1?.addEventListener('click', async () => {
    const confirmed = confirm('⚠️ 高危操作警告：\n\n确认清空所有已归档的博主数据与 R2 图片桶吗？\n（此操作不可逆，但会保留您保存的 X 账号登录凭据）');
    if (!confirmed) return;

    const passwordInput = prompt('🔒 安全身份验证：\n\n请输入您的管理员通行密码以确认执行此高危清空操作：');
    if (passwordInput === null) return;
    if (!passwordInput.trim()) {
      showToast('未输入管理员密码，操作已取消');
      return;
    }

    try {
      logTerminal('[RESET] 正在验证管理员密码并清理博主归档数据...');
      const res = await fetch('/api/admin/reset-d1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSessionToken
        },
        body: JSON.stringify({
          password: passwordInput.trim(),
          clearCredentials: false
        })
      });
      const json = await res.json();

      if (json.success) {
        logTerminal('[RESET] 博主归档数据与 R2 图片桶已安全清空');
        showToast('博主归档数据与 R2 图片桶已成功清空！');
        updateHudArchiveCount();
        loadBloggerVault();
      } else {
        logTerminal(`[RESET ERROR] 操作被拒绝: ${json.error}`);
        showToast(json.error || '清空失败');
      }
    } catch (e) {
      logTerminal(`[RESET ERROR] 请求异常: ${e.message}`);
      showToast(`清空请求异常: ${e.message}`);
    }
  });

  // ==================== 6.3 GitHub Actions Cloud Dispatch & Realtime Log Watcher ====================
  let ghWorkflowPollTimer = null;
  let ghCurrentRunId = null;
  const btnTriggerGhFullSyncDefaultHtml = btnTriggerGhFullSync ? btnTriggerGhFullSync.innerHTML : '';
  const knownLogLines = new Set();

  function setGhButtonState(state, info = {}) {
    if (!btnTriggerGhFullSync) return;
    if (state === 'running') {
      btnTriggerGhFullSync.disabled = true;
      btnTriggerGhFullSync.classList.add('is-running');
      const runTag = info.run_id ? `#${info.run_id}` : '';
      btnTriggerGhFullSync.innerHTML = `
        <div class="btn-task-content">
          <div class="btn-task-title-row" style="justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg class="icon-spin-smooth" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>全量数据深度刷新中</span>
              <span style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-muted); font-weight: 500;">${runTag}</span>
            </div>
            <div class="badge-status-pill running">
              <span class="tag-dot-pulse"></span>
              <span>运行中</span>
            </div>
          </div>
          <span class="btn-task-desc">云端正在逐页安全巡检 · 离开或刷新页面不影响进度</span>
        </div>
      `;
    } else if (state === 'dispatching') {
      btnTriggerGhFullSync.disabled = true;
      btnTriggerGhFullSync.classList.remove('is-running');
      btnTriggerGhFullSync.innerHTML = `
        <div class="btn-task-content">
          <div class="btn-task-title-row">
            <svg class="icon-spin-smooth" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span>正在向 GitHub 派发云端任务...</span>
          </div>
          <span class="btn-task-desc">正在验证 PAT 凭据并创建 Workflow Run</span>
        </div>
      `;
    } else {
      btnTriggerGhFullSync.disabled = false;
      btnTriggerGhFullSync.classList.remove('is-running');
      btnTriggerGhFullSync.innerHTML = btnTriggerGhFullSyncDefaultHtml;
    }
  }

  function parseAndFormatWorkflowLog(rawLine) {
    if (!rawLine) return '';
    // 去除 GitHub Actions 默认前置时间戳 (如 2026-08-25T02:35:12.1234567Z)
    let clean = rawLine.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s*/, '').trim();
    if (!clean) return '';
    return clean;
  }

  function startWatchingWorkflow(runId) {
    if (ghWorkflowPollTimer) clearInterval(ghWorkflowPollTimer);
    ghCurrentRunId = runId ? String(runId) : null;
    knownLogLines.clear();
    setGhButtonState('running', { run_id: runId });

    let isFirstPoll = true;

    const poll = async () => {
      if (!adminSessionToken) {
        clearInterval(ghWorkflowPollTimer);
        ghWorkflowPollTimer = null;
        return;
      }

      try {
        const queryUrl = ghCurrentRunId 
          ? `/api/admin/workflow-status?run_id=${encodeURIComponent(ghCurrentRunId)}`
          : `/api/admin/workflow-status`;
        
        const res = await fetch(queryUrl, {
          headers: { 'x-admin-token': adminSessionToken }
        });

        if (res.status === 401) {
          performLogout();
          return;
        }

        const data = await res.json();

        if (!data.success) {
          if (isFirstPoll) {
            logTerminal(`[WARN] 状态监听中转提示: ${data.error || '暂无可用状态'}`);
            isFirstPoll = false;
          }
          return;
        }

        if (!ghCurrentRunId && data.run_id) {
          ghCurrentRunId = String(data.run_id);
          knownLogLines.clear();
          setGhButtonState('running', { run_id: data.run_id });
        }

        // 处理新日志行
        if (data.logs && typeof data.logs === 'string') {
          const rawLines = data.logs.split('\n');

          for (let i = 0; i < rawLines.length; i++) {
            const rawLine = rawLines[i];
            const clean = parseAndFormatWorkflowLog(rawLine);
            if (!clean) continue;

            // 过滤无意义的 runner 内部初始化日志
            const isRunnerNoise = clean.startsWith('::') || 
                                  clean.startsWith('##[') ||
                                  clean.startsWith('Post ') ||
                                  clean.startsWith('Run actions/') ||
                                  clean.startsWith('with: ') ||
                                  clean.startsWith('env: ') ||
                                  clean.startsWith('npm ') ||
                                  clean === 'Run node -e "' ||
                                  clean === '"';

            const lineKey = clean;
            if (!isRunnerNoise && !knownLogLines.has(lineKey)) {
              knownLogLines.add(lineKey);
              logTerminal(clean);

              // 智能驱动顶部进度条状态
              if (clean.includes('PROGRESS') || clean.includes('已累计深度巡检')) {
                const match = clean.match(/已累计深度巡检:\s*(\d+)\s*人\s*\|\s*库中总博主数:\s*(\d+)\s*人/);
                if (match) {
                  const currentScanned = parseInt(match[1], 10) || 0;
                  const totalDb = parseInt(match[2], 10) || 1;
                  const pct = Math.min(Math.round((currentScanned / Math.max(totalDb, currentScanned)) * 100), 98);
                  syncProgressFill.style.width = `${pct}%`;
                  syncProgressCountText.textContent = `${currentScanned} / ${totalDb} 人 (${pct}%)`;
                  syncProgressStatusText.textContent = `全量巡检进行中 (${currentScanned} 人已核对)...`;
                }
              } else if (clean.includes('COOLDOWN') || clean.includes('冷却保护中') || clean.includes('冷却期') || clean.includes('15 分钟')) {
                const minMatch = clean.match(/剩余\s*(\d+)\s*分钟/);
                const minText = minMatch ? ` (剩余 ${minMatch[1]} 分钟)` : '';
                syncProgressStatusText.textContent = `🛡️ 已触发 15 分钟安全冷却${minText}，正在重置 X 频控桶...`;
                syncProgressCountText.textContent = `冷却中${minText}`;
              } else if (clean.includes('WAIT') || clean.includes('拟人安全间隔')) {
                const secMatch = clean.match(/休眠\s*([\d\.]+)\s*秒/);
                const secText = secMatch ? ` (休眠 ${secMatch[1]}s)` : '';
                syncProgressStatusText.textContent = `⏳ 拟人安全间隔中${secText}...`;
              } else if (clean.includes('PAGE') || clean.includes('正在深度刷新')) {
                syncProgressStatusText.textContent = clean;
              }
            }
          }
        }

        // 动态状态机响应
        if (data.status === 'completed') {
          clearInterval(ghWorkflowPollTimer);
          ghWorkflowPollTimer = null;
          ghCurrentRunId = null;
          setGhButtonState('ready');
          syncProgressFill.style.width = '100%';

          if (data.conclusion === 'success') {
            syncProgressStatusText.textContent = `云端全量数据深度刷新已圆满完成！(Run #${data.run_id})`;
            syncProgressCountText.textContent = '100% 已完成';
            logTerminal(`[SUCCESS] GitHub Actions 工作流执行成功 (Run #${data.run_id})`);
            showToast('全量数据深度刷新已圆满完成！');
          } else {
            syncProgressStatusText.textContent = `云端任务结束: ${data.conclusion || '异常'}`;
            syncProgressCountText.textContent = '异常中断';
            logTerminal(`[WARN] GitHub Actions 工作流结束状态: ${data.conclusion || '异常'}`);
            showToast(`全量刷新任务结束: ${data.conclusion || '异常'}`);
          }
          updateHudArchiveCount();
          loadBloggerVault();
        } else {
          // 运行中动态响应 (状态不锁死)
          if (isFirstPoll) {
            isFirstPoll = false;
            if (syncProgressFill.style.width === '0%' || !syncProgressFill.style.width) {
              syncProgressFill.style.width = '15%';
            }
          }
          
          if (!syncProgressStatusText.textContent || syncProgressStatusText.textContent.includes('排队中') || syncProgressStatusText.textContent.includes('已调度')) {
            syncProgressStatusText.textContent = `云端全量任务运行中 (Run #${data.run_id || '已调度'})...`;
          }
          
          if (syncProgressCountText.textContent === '排队中' && data.status === 'in_progress') {
            syncProgressCountText.textContent = '执行中';
          }
        }

      } catch (err) {
        console.error('Workflow poll error:', err);
      }
    };

    poll();
    ghWorkflowPollTimer = setInterval(poll, 3000);
  }

  async function checkActiveWorkflowOnLoad() {
    if (!adminSessionToken) return;
    try {
      const res = await fetch('/api/admin/workflow-status', {
        headers: { 'x-admin-token': adminSessionToken }
      });
      const data = await res.json();
      if (data.success && data.run_id) {
        if (data.is_active) {
          knownLogLines.clear();
          logTerminal(`[RECONNECT] 发现云端正在执行全量深度刷新工作流 (Run #${data.run_id} · ${data.status})，已自动恢复日志监听与按钮锁定...`);
          startWatchingWorkflow(data.run_id);
        }
      }
    } catch (e) {}
  }

  async function triggerGhAction(btnEl) {
    if (!adminSessionToken) {
      showToast('请先登录 Admin 授权');
      return;
    }

    if (ghWorkflowPollTimer || btnEl.classList.contains('is-running')) {
      showToast('云端全量任务正在运行中，请勿重复点击');
      return;
    }

    knownLogLines.clear();
    setGhButtonState('dispatching');
    syncProgressFill.style.width = '8%';
    syncProgressStatusText.textContent = '正在向 GitHub 派发全量刷新工作流...';
    syncProgressCountText.textContent = '派发中';
    logTerminal(`\n======================================================`);
    logTerminal(`[GITHUB ACTIONS] 正在向 GitHub 发起【全量数据深度刷新】工作流调度请求...`);

    try {
      const res = await fetch('/api/admin/trigger-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSessionToken
        },
        body: JSON.stringify({ action: 'full_sync' })
      });
      const json = await res.json();

      if (json.success) {
        logTerminal(`[SUCCESS] ${json.message}`);
        const targetRunId = json.run_id || null;
        logTerminal(`[GITHUB ACTIONS] 离线任务已成功进入云端执行序列 (Run: ${targetRunId ? '#' + targetRunId : '已就绪'})`);
        logTerminal(`[GITHUB ACTIONS] 实时运行日志: ${json.actions_url}`);
        showToast(json.message);

        // 启动实时监听与按钮锁定
        startWatchingWorkflow(targetRunId);
      } else {
        setGhButtonState('ready');
        logTerminal(`[ERROR] 派发失败: ${json.error}`);
        showToast(`派发失败: ${json.error}`);
      }
    } catch (err) {
      setGhButtonState('ready');
      logTerminal(`[ERROR] 派发异常: ${err.message}`);
      showToast('网络请求异常');
    }
  }

  btnTriggerGhFullSync?.addEventListener('click', (e) => {
    triggerClickSpark(e);
    triggerGhAction(btnTriggerGhFullSync);
  });

  // ==================== 6.5 Blogger Vault Management & Shield Controller (React Bits Motion) ====================
  const panelBloggers = document.getElementById('panel-bloggers');
  const bloggerSearchInput = document.getElementById('blogger-search-input');
  const btnClearBloggerSearch = document.getElementById('btn-clear-blogger-search');
  const filterTabBtns = document.querySelectorAll('.filter-tab-btn');
  const tabCountAll = document.getElementById('tab-count-all');
  const tabCountActive = document.getElementById('tab-count-active');
  const tabCountBlocked = document.getElementById('tab-count-blocked');
  const bloggerSortTriggerBtn = document.getElementById('blogger-sort-trigger-btn');
  const bloggerSortMenu = document.getElementById('blogger-sort-menu');
  const bloggerSortCurrentText = document.getElementById('blogger-sort-current-text');
  const bloggerSortMenuItems = document.querySelectorAll('#blogger-sort-menu .menu-item');
  const bloggerListContainer = document.getElementById('blogger-list-container');
  const bloggerPaginationInfo = document.getElementById('blogger-pagination-info');
  const bloggerPageIndicator = document.getElementById('blogger-page-indicator');
  const btnPagePrev = document.getElementById('btn-page-prev');
  const btnPageNext = document.getElementById('btn-page-next');
  const btnRefreshBloggers = document.getElementById('btn-refresh-bloggers');
  const btnExportHandles = document.getElementById('btn-export-handles');
  const modalExportHandles = document.getElementById('modal-export-handles');
  const exportHandlesTextarea = document.getElementById('export-handles-textarea');
  const btnCopyExportHandles = document.getElementById('btn-copy-export-handles');

  let bvCurrentKeyword = '';
  let bvCurrentStatus = 'all';
  let bvCurrentSort = 'backed_up_at_desc';
  let bvCurrentPage = 1;
  let bvCurrentLimit = 30;
  let bvTotalPages = 1;
  let bvSearchDebounceTimer = null;
  let bvIsLoading = false;

  // React Bits SpotlightCard Pointer Motion
  panelBloggers?.addEventListener('mousemove', (e) => {
    const rect = panelBloggers.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    panelBloggers.style.setProperty('--spotlight-x', `${x}px`);
    panelBloggers.style.setProperty('--spotlight-y', `${y}px`);
    panelBloggers.classList.add('spotlight-active');
  });

  panelBloggers?.addEventListener('mouseleave', () => {
    panelBloggers.classList.remove('spotlight-active');
  });

  // React Bits CountUp Animation (EaseOutExpo)
  function animateCountUp(element, targetVal, duration = 400) {
    if (!element) return;
    const startVal = parseInt(element.textContent.replace(/,/g, '') || '0', 10) || 0;
    if (startVal === targetVal) {
      element.textContent = targetVal.toLocaleString();
      return;
    }
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + (targetVal - startVal) * easeProgress);
      element.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetVal.toLocaleString();
      }
    }
    requestAnimationFrame(update);
  }

  // React Bits ClickSpark Particle Burst
  function triggerClickSpark(e) {
    const x = e.clientX;
    const y = e.clientY;
    const colors = ['#38bdf8', '#f59e0b', '#10b981', '#a855f7', '#ec4899'];
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('div');
      spark.className = 'click-spark-particle';
      const angle = (Math.PI * 2 / 6) * i + (Math.random() - 0.5);
      const distance = 18 + Math.random() * 16;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      spark.style.setProperty('--dx', `${dx}px`);
      spark.style.setProperty('--dy', `${dy}px`);
      spark.style.background = colors[i % colors.length];
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 400);
    }
  }

  function formatFollowersCount(num) {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return String(num);
  }

  function resolveMediaUrl(url) {
    if (!url) return '';
    if (R2_CDN_BASE && url.includes('/api/media') && url.includes('key=')) {
      try {
        const dummyUrl = new URL(url, window.location.origin);
        const key = dummyUrl.searchParams.get('key');
        if (key) {
          return `${R2_CDN_BASE}/${key.replace(/^\/+/, '')}`;
        }
      } catch (e) {}
    }
    if (R2_CDN_BASE && url.includes('twimg.com')) {
      try {
        const parsed = new URL(url);
        const cleanPath = parsed.pathname.replace(/^\/+/, '').replace(/\//g, '_');
        if (url.includes('profile_images')) {
          return `${R2_CDN_BASE}/avatars/${cleanPath}`;
        } else if (url.includes('profile_banners')) {
          return `${R2_CDN_BASE}/covers/${cleanPath}`;
        } else {
          return `${R2_CDN_BASE}/media/${cleanPath}`;
        }
      } catch (e) {}
    }
    if (url.startsWith('/api/media') || url.startsWith('data:') || url.startsWith('/')) {
      return url;
    }
    if (url.includes('twimg.com')) {
      return `/api/media?url=${encodeURIComponent(url)}`;
    }
    return url;
  }

  async function loadBloggerVault() {
    if (!adminSessionToken || bvIsLoading) return;
    bvIsLoading = true;

    if (bloggerListContainer) {
      bloggerListContainer.innerHTML = `
        <div class="blogger-list-loading">
          <div class="skeleton-spinner"></div>
          <span>正在检索博主资产数据...</span>
        </div>
      `;
    }

    try {
      const params = new URLSearchParams({
        keyword: bvCurrentKeyword,
        status: bvCurrentStatus,
        sort: bvCurrentSort,
        page: bvCurrentPage,
        limit: bvCurrentLimit
      });
      if (bvCurrentPage === 1 && !bvCurrentKeyword) {
        params.set('with_stats', '1');
      }

      const res = await fetch(`/api/admin/bloggers?${params.toString()}`, {
        headers: { 'x-admin-token': adminSessionToken }
      });
      const json = await res.json();

      if (json.success) {
        // 更新统计计数（React Bits CountUp - 仅当返回了 stats 时才触发更新）
        if (json.stats) {
          animateCountUp(tabCountAll, json.stats.total);
          animateCountUp(tabCountActive, json.stats.active);
          animateCountUp(tabCountBlocked, json.stats.blocked);
          if (tabNavBloggerBadge) {
            tabNavBloggerBadge.textContent = json.stats.total.toLocaleString();
          }
          if (hudValCount) {
            hudValCount.textContent = `${json.stats.total} 位博主`;
          }
        }

        bvTotalPages = json.totalPages || 1;
        renderBloggerRows(json.data || []);
        renderPagination(json.total || 0, json.page, json.limit);
      } else {
        bloggerListContainer.innerHTML = `
          <div class="blogger-list-empty">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>加载失败: ${escapeHtml(json.error)}</span>
          </div>
        `;
      }
    } catch (e) {
      console.error('loadBloggerVault error:', e);
      bloggerListContainer.innerHTML = `
        <div class="blogger-list-empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>网络请求异常，请刷新重试</span>
        </div>
      `;
    } finally {
      bvIsLoading = false;
    }
  }

  function renderBloggerRows(users) {
    if (!bloggerListContainer) return;
    if (!Array.isArray(users) || users.length === 0) {
      bloggerListContainer.innerHTML = `
        <div class="blogger-list-empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>未检索到匹配的博主档案</span>
        </div>
      `;
      return;
    }

    const defaultFallbackAvatar = '/api/media?url=' + encodeURIComponent('https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png');

    bloggerListContainer.innerHTML = users.map((u, idx) => {
      const isBlocked = u.is_blocked === 1;
      const avatarSrc = resolveMediaUrl(u.avatar_url) || defaultFallbackAvatar;
      const backupDate = u.backed_up_at ? new Date(u.backed_up_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '未记录';
      const staggerDelay = (idx * 0.02).toFixed(2);

      return `
        <div class="blogger-row ${isBlocked ? 'is-blocked' : ''}" id="blogger-row-${escapeHtml(u.screen_name)}" style="animation-delay: ${staggerDelay}s;">
          <div class="blogger-row-left">
            <div class="blogger-row-avatar-box">
              <img class="blogger-row-avatar" src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(u.name)}" loading="lazy" onerror="this.onerror=null; this.src='${escapeHtml(defaultFallbackAvatar)}'">
            </div>
            <div class="blogger-row-info">
              <div class="blogger-name-line">
                <span class="blogger-row-name">${escapeHtml(u.name)}</span>
                ${u.verified ? `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" title="X 官方认证"><path d="M12 2l2.4 2.4 3.4-.4 1.2 3.2 3 1.6-1 3.2 1 3.2-3 1.6-1.2 3.2-3.4-.4L12 22l-2.4-2.4-3.4.4-1.2-3.2-3-1.6 1-3.2-1-3.2 3-1.6 1.2-3.2 3.4.4L12 2z"/><path d="m9 12 2 2 4-4"/></svg>
                ` : ''}
                <span class="blogger-row-handle">@${escapeHtml(u.screen_name)}</span>
                ${u.is_suspended === 1 ? `
                  <span class="badge-status-pill suspended" style="font-size: 10.5px; padding: 1px 6px;">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    <span>已封号</span>
                  </span>
                ` : ''}
                ${u.is_suspended === 2 ? `
                  <span class="badge-status-pill deleted" style="font-size: 10.5px; padding: 1px 6px;">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>已注销</span>
                  </span>
                ` : ''}
                ${isBlocked ? `
                  <span class="badge-blocked-tag">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    <span>已在画廊屏蔽</span>
                  </span>
                ` : ''}
              </div>
              <div class="blogger-row-bio" title="${escapeHtml(u.description || '')}">${escapeHtml(u.description || '暂无个人简介')}</div>
            </div>
          </div>

          <div class="blogger-row-right">
            <div class="blogger-row-meta">
              <span class="blogger-followers-pill">${formatFollowersCount(u.followers_count)} 粉丝</span>
              <span class="blogger-backup-date">归档于 ${backupDate}</span>
            </div>

            <div class="blogger-row-actions">
              <a href="https://x.com/${escapeHtml(u.screen_name)}" target="_blank" rel="noopener noreferrer" class="btn-action-icon" title="在 X 中打开个人主页">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>

              <button type="button" class="btn-action-icon btn-copy-handle" data-handle="${escapeHtml(u.screen_name)}" title="复制 @${escapeHtml(u.screen_name)}">
                <svg class="icon-copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <svg class="icon-check hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </button>

              <button type="button" class="btn-action-suspend ${u.is_suspended > 0 ? 'to-unsuspend' : 'to-suspend'}" data-handle="${escapeHtml(u.screen_name)}" data-suspended="${u.is_suspended || 0}" title="${u.is_suspended > 0 ? '解除封号/注销标记，恢复为正常博主' : '手动标记为封号（移入赛博坟场留档）'}">
                ${u.is_suspended > 0 ? `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  <span>恢复正常</span>
                ` : `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
                  <span>标记封号</span>
                `}
              </button>

              <button type="button" class="btn-action-block ${isBlocked ? 'to-unblock' : 'to-block'}" data-handle="${escapeHtml(u.screen_name)}" data-blocked="${isBlocked ? '1' : '0'}" title="${isBlocked ? '恢复在公开画廊中展示' : '在公开画廊中屏蔽此博主'}">
                ${isBlocked ? `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span>恢复展示</span>
                ` : `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  <span>屏蔽</span>
                `}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 绑定行内按钮事件
    bloggerListContainer.querySelectorAll('.btn-action-suspend').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const handle = btn.getAttribute('data-handle');
        const currentSuspended = parseInt(btn.getAttribute('data-suspended') || '0', 10);
        const targetSuspended = currentSuspended > 0 ? 0 : 1;
        const targetRow = document.getElementById(`blogger-row-${handle}`);

        triggerClickSpark(e);
        btn.disabled = true;

        const nameLine = targetRow?.querySelector('.blogger-name-line');
        let suspendedTag = nameLine?.querySelector('.badge-status-pill.suspended') || nameLine?.querySelector('.badge-status-pill.deleted');

        try {
          const res = await fetch('/api/admin/bloggers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': adminSessionToken
            },
            body: JSON.stringify({
              screen_name: handle,
              is_suspended: targetSuspended
            })
          });

          const json = await res.json();
          if (res.ok && json.success) {
            if (targetSuspended === 1) {
              btn.className = 'btn-action-suspend to-unsuspend';
              btn.setAttribute('data-suspended', '1');
              btn.setAttribute('title', '解除封号/注销标记，恢复为正常博主');
              btn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <span>恢复正常</span>
              `;
              if (!suspendedTag && nameLine) {
                suspendedTag = document.createElement('span');
                suspendedTag.className = 'badge-status-pill suspended';
                suspendedTag.style.cssText = 'font-size: 10.5px; padding: 1px 6px;';
                suspendedTag.innerHTML = `
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  <span>已封号</span>
                `;
                nameLine.appendChild(suspendedTag);
              }
              showToast(`已标记 @${handle} 为封号（已移入赛博坟场并同步更新 R2 档案）`);
            } else {
              btn.className = 'btn-action-suspend to-suspend';
              btn.setAttribute('data-suspended', '0');
              btn.setAttribute('title', '手动标记为封号（移入赛博坟场留档）');
              btn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
                <span>标记封号</span>
              `;
              suspendedTag?.remove();
              showToast(`已恢复 @${handle} 为正常状态（已同步更新 R2 档案）`);
            }
            updateHudArchiveCount();
          } else {
            showToast(json.error || '操作失败');
          }
        } catch (err) {
          showToast(`网络异常: ${err.message}`);
        } finally {
          btn.disabled = false;
        }
      });
    });
    bloggerListContainer.querySelectorAll('.btn-copy-handle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const handle = btn.getAttribute('data-handle');
        if (!handle) return;
        navigator.clipboard.writeText(`@${handle}`);
        triggerClickSpark(e);

        const iconCopy = btn.querySelector('.icon-copy');
        const iconCheck = btn.querySelector('.icon-check');
        iconCopy?.classList.add('hidden');
        iconCheck?.classList.remove('hidden');

        showToast(`已复制 @${handle} 到剪贴板`);
        setTimeout(() => {
          iconCopy?.classList.remove('hidden');
          iconCheck?.classList.add('hidden');
        }, 1800);
      });
    });

    bloggerListContainer.querySelectorAll('.btn-action-block').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const handle = btn.getAttribute('data-handle');
        const currentBlocked = btn.getAttribute('data-blocked') === '1';
        const targetBlocked = !currentBlocked;
        const targetRow = document.getElementById(`blogger-row-${handle}`);

        triggerClickSpark(e);
        btn.disabled = true;

        // 1. 乐观就地更新行 DOM 状态（避免全量刷新列表导致的屏幕闪烁与滚动位置丢失）
        const nameLine = targetRow?.querySelector('.blogger-name-line');
        let blockedTag = nameLine?.querySelector('.badge-blocked-tag');

        if (targetBlocked) {
          targetRow?.classList.add('is-blocked');
          btn.className = 'btn-action-block to-unblock';
          btn.setAttribute('data-blocked', '1');
          btn.setAttribute('title', '恢复在公开画廊中展示');
          btn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>恢复展示</span>
          `;
          if (!blockedTag && nameLine) {
            blockedTag = document.createElement('span');
            blockedTag.className = 'badge-blocked-tag';
            blockedTag.innerHTML = `
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <span>已在画廊屏蔽</span>
            `;
            nameLine.appendChild(blockedTag);
          }
        } else {
          targetRow?.classList.remove('is-blocked');
          btn.className = 'btn-action-block to-block';
          btn.setAttribute('data-blocked', '0');
          btn.setAttribute('title', '在公开画廊中屏蔽此博主');
          btn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            <span>屏蔽</span>
          `;
          blockedTag?.remove();
        }

        // 2. 如果在「展示中」或「已屏蔽」专属过滤 Tab 下，平滑淡出并移除该行
        if (targetRow && ((bvCurrentStatus === 'active' && targetBlocked) || (bvCurrentStatus === 'blocked' && !targetBlocked))) {
          targetRow.classList.add('is-collapsing');
          setTimeout(() => {
            targetRow.remove();
            if (bloggerListContainer.querySelectorAll('.blogger-row:not(.is-collapsing)').length === 0) {
              bloggerListContainer.innerHTML = `
                <div class="blogger-list-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span>当前筛选下暂无博主档案</span>
                </div>
              `;
            }
          }, 280);
        }

        // 3. 乐观更新 Tab 角标计数
        const curActive = parseInt(tabCountActive?.textContent?.replace(/,/g, '') || '0', 10);
        const curBlocked = parseInt(tabCountBlocked?.textContent?.replace(/,/g, '') || '0', 10);
        if (targetBlocked) {
          animateCountUp(tabCountActive, Math.max(0, curActive - 1));
          animateCountUp(tabCountBlocked, curBlocked + 1);
        } else {
          animateCountUp(tabCountActive, curActive + 1);
          animateCountUp(tabCountBlocked, Math.max(0, curBlocked - 1));
        }

        try {
          const res = await fetch('/api/admin/bloggers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': adminSessionToken
            },
            body: JSON.stringify({
              screen_name: handle,
              is_blocked: targetBlocked ? 1 : 0
            })
          });
          const json = await res.json();

          if (json.success) {
            showToast(json.message || (targetBlocked ? `已屏蔽 @${handle}` : `已恢复 @${handle}`));
          } else {
            showToast(`操作失败: ${json.error}`);
            loadBloggerVault();
          }
        } catch (err) {
          showToast(`请求异常: ${err.message}`);
          loadBloggerVault();
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  function renderPagination(total, page, limit) {
    if (!bloggerPaginationInfo || !bloggerPageIndicator) return;
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    bloggerPaginationInfo.textContent = `显示 ${start} - ${end} / 共 ${total} 位博主`;
    bloggerPageIndicator.textContent = `第 ${page} / ${bvTotalPages} 页`;

    if (btnPagePrev) btnPagePrev.disabled = page <= 1;
    if (btnPageNext) btnPageNext.disabled = page >= bvTotalPages;
  }

  // 搜索防抖监听 (500ms 友好防抖，避免键入过程中高频穿透)
  bloggerSearchInput?.addEventListener('input', (e) => {
    bvCurrentKeyword = e.target.value.trim();
    if (bvCurrentKeyword) {
      btnClearBloggerSearch?.classList.remove('hidden');
    } else {
      btnClearBloggerSearch?.classList.add('hidden');
    }

    clearTimeout(bvSearchDebounceTimer);
    bvSearchDebounceTimer = setTimeout(() => {
      bvCurrentPage = 1;
      loadBloggerVault();
    }, 500);
  });

  btnClearBloggerSearch?.addEventListener('click', () => {
    if (bloggerSearchInput) bloggerSearchInput.value = '';
    bvCurrentKeyword = '';
    btnClearBloggerSearch.classList.add('hidden');
    bvCurrentPage = 1;
    loadBloggerVault();
  });

  // 状态筛选 Tab 切换
  filterTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bvCurrentStatus = btn.getAttribute('data-status') || 'all';
      bvCurrentPage = 1;
      loadBloggerVault();
    });
  });

  function setBloggerSortSelection(sortVal, sortText) {
    bvCurrentSort = sortVal;
    if (bloggerSortCurrentText) bloggerSortCurrentText.textContent = sortText;
    bloggerSortMenuItems.forEach(item => {
      const match = item.getAttribute('data-val') === sortVal;
      item.classList.toggle('active', match);
      const check = item.querySelector('.check-icon');
      if (check) check.classList.toggle('hidden', !match);
    });
  }

  // 排序下拉切换展开/收起
  bloggerSortTriggerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = bloggerSortMenu?.classList.toggle('hidden');
    bloggerSortTriggerBtn.setAttribute('aria-expanded', String(!isClosed));
  });

  // 排序项选中
  bloggerSortMenuItems.forEach(item => {
    item.addEventListener('click', () => {
      const val = item.getAttribute('data-val');
      const txt = item.querySelector('span')?.textContent || '';
      setBloggerSortSelection(val, txt);
      bloggerSortMenu?.classList.add('hidden');
      bloggerSortTriggerBtn?.setAttribute('aria-expanded', 'false');
      bvCurrentPage = 1;
      loadBloggerVault();
    });
  });

  // 点击外部收起排序下拉菜单
  document.addEventListener('click', (e) => {
    if (!bloggerSortMenu?.contains(e.target) && !bloggerSortTriggerBtn?.contains(e.target)) {
      bloggerSortMenu?.classList.add('hidden');
      bloggerSortTriggerBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  // 分页按钮
  btnPagePrev?.addEventListener('click', () => {
    if (bvCurrentPage > 1) {
      bvCurrentPage--;
      loadBloggerVault();
    }
  });

  btnPageNext?.addEventListener('click', () => {
    if (bvCurrentPage < bvTotalPages) {
      bvCurrentPage++;
      loadBloggerVault();
    }
  });

  btnRefreshBloggers?.addEventListener('click', (e) => {
    triggerClickSpark(e);
    loadBloggerVault();
    updateHudArchiveCount();
    showToast('已刷新博主档案列表');
  });

  // 导出 Handle 清单 Modal
  btnExportHandles?.addEventListener('click', async (e) => {
    triggerClickSpark(e);
    if (!modalExportHandles || !exportHandlesTextarea) return;

    exportHandlesTextarea.value = '正在提取博主 Handle 列表...';
    modalExportHandles.classList.remove('hidden');

    try {
      // 提取全部满足当前筛选条件的 handle
      const params = new URLSearchParams({
        keyword: bvCurrentKeyword,
        status: bvCurrentStatus,
        sort: bvCurrentSort,
        page: 1,
        limit: 1000
      });
      const res = await fetch(`/api/admin/bloggers?${params.toString()}`, {
        headers: { 'x-admin-token': adminSessionToken }
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const handles = json.data.map(u => u.screen_name).filter(Boolean);
        exportHandlesTextarea.value = handles.join('\n');
      } else {
        exportHandlesTextarea.value = '提取失败：' + (json.error || '未知错误');
      }
    } catch (err) {
      exportHandlesTextarea.value = '提取异常：' + err.message;
    }
  });

  btnCopyExportHandles?.addEventListener('click', (e) => {
    if (!exportHandlesTextarea) return;
    triggerClickSpark(e);
    navigator.clipboard.writeText(exportHandlesTextarea.value);
    showToast('已复制全部 Handle 清单到剪贴板');
  });

  // Modal Universal Close Handler
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      modalExportHandles?.classList.add('hidden');
    });
  });

  // ==================== 7.5 Data Analytics & Popularity Insights Engine (Chart.js + React-Bits) ====================
  let chartClickSourcesInstance = null;
  let chartFollowerTiersInstance = null;
  let chartAccountHealthInstance = null;
  let chartDailyTrendInstance = null;
  let chartHourlyActivityInstance = null;

  // 今日实时指标 DOM 节点
  const kpiValTodayClicks = document.getElementById('kpi-val-today-clicks');
  const kpiSubTodayGrowth = document.getElementById('kpi-sub-today-growth');
  const kpiValTodayCreators = document.getElementById('kpi-val-today-creators');
  const kpiValTodayChampion = document.getElementById('kpi-val-today-champion');
  const kpiSubTodayChampion = document.getElementById('kpi-sub-today-champion');
  const subValTodayCard = document.getElementById('sub-val-today-card');
  const subValTodayTimeline = document.getElementById('sub-val-today-timeline');
  const subValTodayRoulette = document.getElementById('sub-val-today-roulette');
  const analyticsTodayTopList = document.getElementById('analytics-today-top-list');
  const analyticsRouletteTopList = document.getElementById('analytics-roulette-top-list');

  // 全周期指标 DOM 节点
  const kpiValClicks = document.getElementById('kpi-val-clicks');
  const kpiValTotal = document.getElementById('kpi-val-total');
  const kpiValFollowers = document.getElementById('kpi-val-followers');
  const kpiValActiveCreators = document.getElementById('kpi-val-active-creators');
  const kpiValVerifiedRate = document.getElementById('kpi-val-verified-rate');
  const kpiValR2Count = document.getElementById('kpi-val-r2-count');

  const analyticsClickTopList = document.getElementById('analytics-click-top-list');
  const analyticsFollowersTopList = document.getElementById('analytics-followers-top-list');

  const legValCard = document.getElementById('leg-val-card');
  const legValTimeline = document.getElementById('leg-val-timeline');
  const legValRoulette = document.getElementById('leg-val-roulette');

  const healthValActive = document.getElementById('health-val-active');
  const healthValBlocked = document.getElementById('health-val-blocked');
  const healthValSuspended = document.getElementById('health-val-suspended');
  const healthValVerified = document.getElementById('health-val-verified');

  async function loadAnalyticsDashboard() {
    if (!adminSessionToken) return;

    try {
      // 优先从新建立的专用聚合接口拉取全量与当日分析数据
      const res = await fetch('/api/admin/analytics', {
        headers: { 'x-admin-token': adminSessionToken }
      });
      const json = await res.json();
      if (!json.success) return;

      const {
        today_summary = {},
        trend_14d = [],
        today_top_5 = [],
        all_time_summary = {},
        all_time_top_10 = [],
        followers_top_10 = [],
        follower_tiers = {},
        roulette_top_8 = json.roulette_top_8 || json.roulette_top_5 || [],
        hourly_activity = [],
        peak_hour = 21
      } = json;

      // 1. 渲染今日实时指标 (Today Live Pulse)
      if (kpiValTodayClicks) {
        animateCountUp(kpiValTodayClicks, today_summary.today_clicks || 0);
      }
      if (kpiSubTodayGrowth) {
        const growth = today_summary.day_over_day_growth || 0;
        if (today_summary.yesterday_clicks > 0) {
          const sign = growth >= 0 ? '+' : '';
          kpiSubTodayGrowth.textContent = `较昨日 ${sign}${growth}%`;
          kpiSubTodayGrowth.className = `kpi-trend-pill ${growth >= 0 ? 'positive' : 'negative'}`;
        } else {
          kpiSubTodayGrowth.textContent = (today_summary.today_clicks || 0) > 0 ? '今日初增' : '--';
          kpiSubTodayGrowth.className = 'kpi-trend-pill';
        }
      }

      if (kpiValTodayCreators) {
        animateCountUp(kpiValTodayCreators, today_summary.today_creators || 0);
      }

      if (kpiValTodayChampion) {
        const topOne = today_summary.top_creator;
        if (topOne && topOne.total_clicks > 0) {
          kpiValTodayChampion.textContent = topOne.name || topOne.screen_name;
          kpiValTodayChampion.title = `@${topOne.screen_name} (今日 ${topOne.total_clicks} 次跳转)`;
          if (kpiSubTodayChampion) {
            kpiSubTodayChampion.textContent = `今日斩获 ${topOne.total_clicks} 次跳转`;
          }
        } else {
          kpiValTodayChampion.textContent = '暂无点击';
          if (kpiSubTodayChampion) {
            kpiSubTodayChampion.textContent = '今日首位领跑者等待中';
          }
        }
      }

      if (subValTodayCard) subValTodayCard.textContent = String(today_summary.today_card || 0);
      if (subValTodayTimeline) subValTodayTimeline.textContent = String(today_summary.today_timeline || 0);
      if (subValTodayRoulette) subValTodayRoulette.textContent = String(today_summary.today_roulette || 0);

      // 2. 渲染近 14 天日点击趋势平滑折线图
      renderDailyTrendChart(trend_14d);

      // 3. 渲染今日热门飙升 TOP 5 榜单
      renderTodayTopLeaderboard(today_top_5, today_summary.today_clicks || 0);

      // 4. 渲染全周期累计指标卡片
      animateCountUp(kpiValClicks, all_time_summary.all_time_clicks || 0);
      animateCountUp(kpiValTotal, all_time_summary.total_bloggers || 0);
      animateCountUp(kpiValActiveCreators, all_time_summary.active_interacted_count || 0);
      if (tabNavBloggerBadge) {
        tabNavBloggerBadge.textContent = (all_time_summary.total_bloggers || 0).toLocaleString();
      }
      if (hudValCount) {
        hudValCount.textContent = `${all_time_summary.total_bloggers || 0} 位博主`;
      }
      if (kpiValFollowers) {
        kpiValFollowers.textContent = formatFollowersCount(all_time_summary.all_time_followers || 0);
      }
      if (kpiValVerifiedRate) {
        kpiValVerifiedRate.textContent = `${all_time_summary.verified_rate || 0}%`;
      }
      if (kpiValR2Count) {
        animateCountUp(kpiValR2Count, all_time_summary.r2_media_count || 0);
      }

      // 5. 渲染全站历史点击总榜 TOP 10
      renderClickTopLeaderboard(all_time_top_10, all_time_summary.all_time_clicks || 0);

      // 6. 渲染全网粉丝总榜 TOP 10
      renderFollowersTopLeaderboard(followers_top_10);

      // 7. 渲染全场景渠道分布饼图
      renderClickSourcesChart(
        all_time_summary.all_time_card || 0,
        all_time_summary.all_time_timeline || 0,
        all_time_summary.all_time_roulette || 0,
        all_time_summary.all_time_clicks || 0
      );

      // 8. 渲染粉丝梯队梯度分层
      renderFollowerTiersChart(follower_tiers);

      // 9. 渲染博主资产健康度
      renderAccountHealthChart(
        all_time_summary.active_display_count || 0,
        all_time_summary.blocked_count || 0,
        all_time_summary.suspended_count || 0,
        all_time_summary.verified_count || 0
      );

      // 10. 渲染抽卡翻牌天命榜 TOP 8
      renderRouletteTopLeaderboard(roulette_top_8);

      // 11. 渲染 24 小时访问热力时序图
      renderHourlyActivityChart(hourly_activity, peak_hour);

    } catch (err) {
      console.error('loadAnalyticsDashboard error:', err);
    }
  }

  function renderDailyTrendChart(trend14d) {
    const ctx = document.getElementById('chart-daily-trend');
    if (!ctx || typeof Chart === 'undefined') return;

    if (chartDailyTrendInstance) {
      chartDailyTrendInstance.destroy();
    }

    const labels = trend14d.map(item => item.label);
    const totals = trend14d.map(item => item.total_clicks);
    const cards = trend14d.map(item => item.clicks_card);
    const timelines = trend14d.map(item => item.clicks_timeline);
    const roulettes = trend14d.map(item => item.clicks_roulette);

    const pointRadii = trend14d.map(item => item.is_today ? 6 : 3.5);
    const pointHoverRadii = trend14d.map(item => item.is_today ? 8 : 5.5);
    const pointBorderColors = trend14d.map(item => item.is_today ? '#ffffff' : '#10b981');
    const pointBorderWidths = trend14d.map(item => item.is_today ? 2 : 1);

    const chartContext = ctx.getContext('2d');
    let gradientFill = 'rgba(16, 185, 129, 0.12)';
    try {
      gradientFill = chartContext.createLinearGradient(0, 0, 0, 260);
      gradientFill.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      gradientFill.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
    } catch (e) {}

    chartDailyTrendInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '全场景总点击',
            data: totals,
            borderColor: '#10b981',
            backgroundColor: gradientFill,
            borderWidth: 2.4,
            tension: 0.38,
            fill: true,
            pointRadius: pointRadii,
            pointHoverRadius: pointHoverRadii,
            pointBackgroundColor: '#10b981',
            pointBorderColor: pointBorderColors,
            pointBorderWidth: pointBorderWidths
          },
          {
            label: '画廊卡片',
            data: cards,
            borderColor: '#38bdf8',
            borderWidth: 1.6,
            borderDash: [3, 3],
            tension: 0.35,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            hidden: false
          },
          {
            label: '时光抽屉',
            data: timelines,
            borderColor: '#a855f7',
            borderWidth: 1.6,
            borderDash: [3, 3],
            tension: 0.35,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            hidden: false
          },
          {
            label: '抽卡探索',
            data: roulettes,
            borderColor: '#ec4899',
            borderWidth: 1.6,
            borderDash: [3, 3],
            tension: 0.35,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 4,
            hidden: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              boxHeight: 2,
              color: '#94a3b8',
              font: { size: 11, weight: '600' },
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: function(items) {
                const idx = items[0]?.dataIndex;
                const raw = trend14d[idx];
                return raw ? `${raw.date} ${raw.is_today ? '(今日实时)' : ''}` : '';
              },
              label: function(item) {
                const val = item.raw || 0;
                return ` ${item.dataset.label}: ${val} 次`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: function(c) {
                return trend14d[c.index]?.is_today ? '#10b981' : '#64748b';
              },
              font: { family: "'JetBrains Mono', monospace", size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#64748b',
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              precision: 0
            }
          }
        }
      }
    });
  }

  function renderTodayTopLeaderboard(top5, todayClicks) {
    if (!analyticsTodayTopList) return;

    const defaultFallbackAvatar = '/api/media?url=' + encodeURIComponent('https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png');

    if (!Array.isArray(top5) || top5.length === 0 || todayClicks === 0) {
      analyticsTodayTopList.innerHTML = `
        <div class="blogger-list-empty" style="padding: 36px 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-spark)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style="color: var(--text-main); font-weight: 600; font-size: 13.5px;">今日互动等待中</span>
          <span style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">今日访客产生跳转后，实时飙升榜将自动在此呈现。</span>
        </div>
      `;
      return;
    }

    analyticsTodayTopList.innerHTML = top5.map((u, idx) => {
      const rank = idx + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const avatarSrc = resolveMediaUrl(u.avatar_url) || defaultFallbackAvatar;
      const uTotal = u.total_clicks || 0;

      const cardC = u.clicks_card || 0;
      const timeC = u.clicks_timeline || 0;
      const roulC = u.clicks_roulette || 0;
      const cardPct = uTotal > 0 ? Math.round((cardC / uTotal) * 100) : 0;
      const timePct = uTotal > 0 ? Math.round((timeC / uTotal) * 100) : 0;
      const roulPct = uTotal > 0 ? Math.max(0, 100 - cardPct - timePct) : 0;

      return `
        <div class="leaderboard-row ${rankClass}">
          <div class="leaderboard-left">
            <span class="leaderboard-rank">${rank}</span>
            <div class="leaderboard-avatar-box">
              <img class="leaderboard-avatar" src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(u.name)}" loading="lazy" onerror="this.onerror=null; this.src='${escapeHtml(defaultFallbackAvatar)}'">
            </div>
            <div class="leaderboard-info">
              <div class="leaderboard-name-row">
                <span class="leaderboard-name" title="${escapeHtml(u.name)}">${escapeHtml(u.name)}</span>
                ${u.verified ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><path d="M12 2l2.4 2.4 3.4-.4 1.2 3.2 3 1.6-1 3.2 1 3.2-3 1.6-1.2 3.2-3.4-.4L12 22l-2.4-2.4-3.4.4-1.2-3.2-3-1.6 1-3.2-1-3.2 3-1.6 1.2-3.2 3.4.4L12 2z"/><path d="m9 12 2 2 4-4"/></svg>` : ''}
              </div>
              <span class="leaderboard-handle">@${escapeHtml(u.screen_name)}</span>
            </div>
          </div>

          <div class="leaderboard-right">
            <div class="leaderboard-source-bar-wrap" title="今日卡片: ${cardC} | 时光: ${timeC} | 抽卡: ${roulC}">
              <div class="leaderboard-source-seg seg-card" style="width: ${cardPct}%;"></div>
              <div class="leaderboard-source-seg seg-timeline" style="width: ${timePct}%;"></div>
              <div class="leaderboard-source-seg seg-roulette" style="width: ${roulPct}%;"></div>
            </div>

            <span class="leaderboard-click-badge" style="border-color: rgba(16, 185, 129, 0.35); background: rgba(16, 185, 129, 0.1); color: #10b981;" title="今日点击 ${uTotal} 次">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>${uTotal}</span>
            </span>

            <a href="https://x.com/${escapeHtml(u.screen_name)}" target="_blank" rel="noopener noreferrer" class="btn-action-icon" title="前往 X 主页">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderClickTopLeaderboard(bloggers, totalClicks) {
    if (!analyticsClickTopList) return;

    const defaultFallbackAvatar = '/api/media?url=' + encodeURIComponent('https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png');
    const sortedByClicks = [...bloggers].sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0));
    const topClicked = sortedByClicks.slice(0, 10);
    const maxClick = topClicked[0]?.total_clicks || 0;

    if (totalClicks === 0 || maxClick === 0) {
      analyticsClickTopList.innerHTML = `
        <div class="blogger-list-empty" style="padding: 36px 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-spark)" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <span style="color: var(--text-main); font-weight: 600; font-size: 13.5px;">本站点击热度正在累积中</span>
          <span style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">访客在画廊卡片、时光档案与抽卡探索中跳转 X 主页后，将在此实时自动生成热度排行榜。</span>
        </div>
      `;
      return;
    }

    analyticsClickTopList.innerHTML = topClicked.map((u, idx) => {
      const rank = idx + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const avatarSrc = resolveMediaUrl(u.avatar_url) || defaultFallbackAvatar;
      const uTotal = u.total_clicks || 0;

      const cardC = u.clicks_card || 0;
      const timeC = u.clicks_timeline || 0;
      const roulC = u.clicks_roulette || 0;
      const cardPct = uTotal > 0 ? Math.round((cardC / uTotal) * 100) : 0;
      const timePct = uTotal > 0 ? Math.round((timeC / uTotal) * 100) : 0;
      const roulPct = uTotal > 0 ? Math.max(0, 100 - cardPct - timePct) : 0;

      return `
        <div class="leaderboard-row ${rankClass}">
          <div class="leaderboard-left">
            <span class="leaderboard-rank">${rank}</span>
            <div class="leaderboard-avatar-box">
              <img class="leaderboard-avatar" src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(u.name)}" loading="lazy" onerror="this.onerror=null; this.src='${escapeHtml(defaultFallbackAvatar)}'">
            </div>
            <div class="leaderboard-info">
              <div class="leaderboard-name-row">
                <span class="leaderboard-name" title="${escapeHtml(u.name)}">${escapeHtml(u.name)}</span>
                ${u.verified ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><path d="M12 2l2.4 2.4 3.4-.4 1.2 3.2 3 1.6-1 3.2 1 3.2-3 1.6-1.2 3.2-3.4-.4L12 22l-2.4-2.4-3.4.4-1.2-3.2-3-1.6 1-3.2-1-3.2 3-1.6 1.2-3.2 3.4.4L12 2z"/><path d="m9 12 2 2 4-4"/></svg>` : ''}
              </div>
              <span class="leaderboard-handle">@${escapeHtml(u.screen_name)}</span>
            </div>
          </div>

          <div class="leaderboard-right">
            <div class="leaderboard-source-bar-wrap" title="卡片跳转: ${cardPct}% | 时光抽屉: ${timePct}% | 抽卡探索: ${roulPct}%">
              <div class="leaderboard-source-seg seg-card" style="width: ${cardPct}%;"></div>
              <div class="leaderboard-source-seg seg-timeline" style="width: ${timePct}%;"></div>
              <div class="leaderboard-source-seg seg-roulette" style="width: ${roulPct}%;"></div>
            </div>

            <span class="leaderboard-click-badge" title="累计点击 ${uTotal} 次">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              <span>${uTotal}</span>
            </span>

            <a href="https://x.com/${escapeHtml(u.screen_name)}" target="_blank" rel="noopener noreferrer" class="btn-action-icon" title="前往 X 主页">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderFollowersTopLeaderboard(bloggers) {
    if (!analyticsFollowersTopList) return;

    const defaultFallbackAvatar = '/api/media?url=' + encodeURIComponent('https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png');
    const sortedByFollowers = [...bloggers].sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0));
    const topFollowers = sortedByFollowers.slice(0, 10);
    const maxFollower = topFollowers[0]?.followers_count || 1;

    if (topFollowers.length === 0) {
      analyticsFollowersTopList.innerHTML = `<div class="blogger-list-empty"><span>暂无博主数据</span></div>`;
      return;
    }

    analyticsFollowersTopList.innerHTML = topFollowers.map((u, idx) => {
      const rank = idx + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const avatarSrc = resolveMediaUrl(u.avatar_url) || defaultFallbackAvatar;
      const percentOfMax = Math.round(((u.followers_count || 0) / maxFollower) * 100);

      return `
        <div class="leaderboard-row ${rankClass}">
          <div class="leaderboard-left">
            <span class="leaderboard-rank">${rank}</span>
            <div class="leaderboard-avatar-box">
              <img class="leaderboard-avatar" src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(u.name)}" loading="lazy" onerror="this.onerror=null; this.src='${escapeHtml(defaultFallbackAvatar)}'">
            </div>
            <div class="leaderboard-info">
              <div class="leaderboard-name-row">
                <span class="leaderboard-name" title="${escapeHtml(u.name)}">${escapeHtml(u.name)}</span>
                ${u.verified ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><path d="M12 2l2.4 2.4 3.4-.4 1.2 3.2 3 1.6-1 3.2 1 3.2-3 1.6-1.2 3.2-3.4-.4L12 22l-2.4-2.4-3.4.4-1.2-3.2-3-1.6 1-3.2-1-3.2 3-1.6 1.2-3.2 3.4.4L12 2z"/><path d="m9 12 2 2 4-4"/></svg>` : ''}
              </div>
              <span class="leaderboard-handle">@${escapeHtml(u.screen_name)}</span>
            </div>
          </div>

          <div class="leaderboard-right">
            <div class="leaderboard-source-bar-wrap" style="width: 90px;" title="占头部最高粉丝比: ${percentOfMax}%">
              <div class="leaderboard-source-seg" style="width: ${percentOfMax}%; background: var(--accent-gold);"></div>
            </div>

            <span class="leaderboard-followers-badge">
              ${formatFollowersCount(u.followers_count)}
            </span>

            <a href="https://x.com/${escapeHtml(u.screen_name)}" target="_blank" rel="noopener noreferrer" class="btn-action-icon" title="前往 X 主页">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderClickSourcesChart(clicksCard, clicksTimeline, clicksRoulette, totalClicks) {
    const ctx = document.getElementById('chart-click-sources');
    if (!ctx || typeof Chart === 'undefined') return;

    if (totalClicks > 0) {
      if (legValCard) legValCard.textContent = `${Math.round((clicksCard / totalClicks) * 100)}% (${clicksCard})`;
      if (legValTimeline) legValTimeline.textContent = `${Math.round((clicksTimeline / totalClicks) * 100)}% (${clicksTimeline})`;
      if (legValRoulette) legValRoulette.textContent = `${Math.round((clicksRoulette / totalClicks) * 100)}% (${clicksRoulette})`;
    } else {
      if (legValCard) legValCard.textContent = `0%`;
      if (legValTimeline) legValTimeline.textContent = `0%`;
      if (legValRoulette) legValRoulette.textContent = `0%`;
    }

    const dataValues = totalClicks > 0 ? [clicksCard, clicksTimeline, clicksRoulette] : [1, 1, 1];
    const bgColors = totalClicks > 0 ? ['#38bdf8', '#a855f7', '#ec4899'] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.03)'];

    if (chartClickSourcesInstance) {
      chartClickSourcesInstance.destroy();
    }

    chartClickSourcesInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['画廊主页卡片', '时光档案抽屉', '抽卡随机探索'],
        datasets: [{
          data: dataValues,
          backgroundColor: bgColors,
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(item) {
                if (totalClicks === 0) return ' 暂无点击记录';
                const val = item.raw || 0;
                const pct = Math.round((val / totalClicks) * 100);
                return ` ${item.label}: ${val} 次 (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  function renderFollowerTiersChart(data) {
    const ctx = document.getElementById('chart-follower-tiers');
    if (!ctx || typeof Chart === 'undefined') return;

    let tier1M = 0;
    let tier500K = 0;
    let tier100K = 0;
    let tier10K = 0;
    let tierLow = 0;

    if (Array.isArray(data)) {
      data.forEach(u => {
        const f = u.followers_count || 0;
        if (f >= 1000000) tier1M++;
        else if (f >= 500000) tier500K++;
        else if (f >= 100000) tier100K++;
        else if (f >= 10000) tier10K++;
        else tierLow++;
      });
    } else if (data && typeof data === 'object') {
      tier1M = data.tier_1m || 0;
      tier500K = data.tier_500k || 0;
      tier100K = data.tier_100k || 0;
      tier10K = data.tier_10k || 0;
      tierLow = data.tier_below_10k || 0;
    }

    if (chartFollowerTiersInstance) {
      chartFollowerTiersInstance.destroy();
    }

    chartFollowerTiersInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['≥1M 超头部', '500K-1M 大V', '100K-500K 骨干', '10K-100K 进阶', '<10K 潜力'],
        datasets: [{
          data: [tier1M, tier500K, tier100K, tier10K, tierLow],
          backgroundColor: ['#f59e0b', '#ec4899', '#38bdf8', '#10b981', '#64748b'],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(item) {
                return ` 博主数量: ${item.raw} 位`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace", size: 11 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 12, weight: '600' } }
          }
        }
      }
    });
  }

  function renderAccountHealthChart(activeCount, blockedCount, suspendedCount, verifiedCount) {
    if (healthValActive) healthValActive.textContent = `${activeCount} 人`;
    if (healthValBlocked) healthValBlocked.textContent = `${blockedCount} 人`;
    if (healthValSuspended) healthValSuspended.textContent = `${suspendedCount} 人`;
    if (healthValVerified) healthValVerified.textContent = `${verifiedCount} 人`;

    const ctx = document.getElementById('chart-account-health');
    if (!ctx || typeof Chart === 'undefined') return;

    if (chartAccountHealthInstance) {
      chartAccountHealthInstance.destroy();
    }

    const totalHealthData = activeCount + blockedCount + suspendedCount;
    const values = totalHealthData > 0 ? [activeCount, blockedCount, suspendedCount, verifiedCount] : [1, 0, 0, 0];

    chartAccountHealthInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['正常展示中', '已屏蔽', '官方封号/注销', '蓝标认证'],
        datasets: [{
          data: values,
          backgroundColor: ['#10b981', '#f43f5e', '#f59e0b', '#38bdf8'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(item) {
                return ` ${item.label}: ${item.raw} 位`;
              }
            }
          }
        }
      }
    });
  }

  function renderRouletteTopLeaderboard(rouletteTop5) {
    if (!analyticsRouletteTopList) return;

    const defaultFallbackAvatar = '/api/media?url=' + encodeURIComponent('https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png');

    if (!Array.isArray(rouletteTop5) || rouletteTop5.length === 0) {
      analyticsRouletteTopList.innerHTML = `
        <div class="blogger-list-empty" style="padding: 20px 14px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-spark)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="12 8 8 12 12 16 16 12 12 8"/></svg>
          <span style="color: var(--text-main); font-weight: 600; font-size: 13px;">暂无抽卡翻牌记录</span>
        </div>
      `;
      return;
    }

    analyticsRouletteTopList.innerHTML = rouletteTop5.map((u, idx) => {
      const rank = idx + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const avatarSrc = resolveMediaUrl(u.avatar_url) || defaultFallbackAvatar;
      const pulls = u.clicks_roulette || 0;

      return `
        <div class="leaderboard-row ${rankClass} mini-row">
          <div class="leaderboard-left">
            <span class="leaderboard-rank">${rank}</span>
            <div class="leaderboard-avatar-box mini-avatar-box">
              <img class="leaderboard-avatar" src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(u.name)}" loading="lazy" onerror="this.onerror=null; this.src='${escapeHtml(defaultFallbackAvatar)}'">
            </div>
            <div class="leaderboard-info">
              <div class="leaderboard-name-row">
                <span class="leaderboard-name" title="${escapeHtml(u.name)}">${escapeHtml(u.name)}</span>
                ${u.verified ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><path d="M12 2l2.4 2.4 3.4-.4 1.2 3.2 3 1.6-1 3.2 1 3.2-3 1.6-1.2 3.2-3.4-.4L12 22l-2.4-2.4-3.4.4-1.2-3.2-3-1.6 1-3.2-1-3.2 3-1.6 1.2-3.2 3.4.4L12 2z"/><path d="m9 12 2 2 4-4"/></svg>` : ''}
              </div>
              <span class="leaderboard-handle">@${escapeHtml(u.screen_name)}</span>
            </div>
          </div>

          <div class="leaderboard-right">
            <span class="leaderboard-click-badge spark" title="大转盘翻牌 ${pulls} 次">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="12 8 8 12 12 16 16 12 12 8"/></svg>
              <span>${pulls} 次</span>
            </span>

            <a href="https://x.com/${escapeHtml(u.screen_name)}" target="_blank" rel="noopener noreferrer" class="btn-action-icon" title="前往 X 主页">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderHourlyActivityChart(hourlyActivity, peakHour = 21) {
    const ctx = document.getElementById('chart-hourly-activity');
    if (!ctx || typeof Chart === 'undefined') return;

    if (chartHourlyActivityInstance) {
      chartHourlyActivityInstance.destroy();
    }

    if (!Array.isArray(hourlyActivity) || hourlyActivity.length === 0) return;

    const labels = hourlyActivity.map(item => item.label);
    const data = hourlyActivity.map(item => item.clicks);

    const chartContext = ctx.getContext('2d');
    let gradientFill = 'rgba(56, 189, 248, 0.12)';
    try {
      gradientFill = chartContext.createLinearGradient(0, 0, 0, 140);
      gradientFill.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
      gradientFill.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
      gradientFill.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
    } catch (e) {}

    const pointColors = hourlyActivity.map(item => item.hour === peakHour ? '#ec4899' : '#38bdf8');
    const pointRadii = hourlyActivity.map(item => item.hour === peakHour ? 4.5 : 0);
    const pointHoverRadii = hourlyActivity.map(item => item.hour === peakHour ? 6.5 : 4);

    chartHourlyActivityInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '访问点击波形',
          data: data,
          borderColor: '#38bdf8',
          backgroundColor: gradientFill,
          borderWidth: 2,
          tension: 0.42,
          fill: true,
          pointRadius: pointRadii,
          pointHoverRadius: pointHoverRadii,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#09090b',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              title: function(items) {
                const idx = items[0]?.dataIndex;
                const isPeak = idx === peakHour;
                return `${items[0]?.label}${isPeak ? ' (访问峰值)' : ''}`;
              },
              label: function(item) {
                return ` 访问热度: ${item.raw} 次`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: function(c) {
                return c.index === peakHour ? '#ec4899' : '#64748b';
              },
              font: { family: "'JetBrains Mono', monospace", size: 9 },
              maxTicksLimit: 8
            }
          },
          y: {
            display: false,
            beginAtZero: true
          }
        }
      }
    });
  }

  // ==================== 8. Toast Notifications ====================
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <span class="toast-svg-icon" style="display: flex; align-items: center; color: var(--accent-primary);">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      </span>
      <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 220);
    }, 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  // Initialize Admin Session & Realtime Latency Heartbeat (60s 间隔，页面不可见时自动休眠)
  checkAdminSession();
  setInterval(() => {
    if (document.visibilityState === 'visible' && adminSessionToken && !adminDashboardScreen.classList.contains('hidden')) {
      updateHudArchiveCount();
    }
  }, 60000);

});
