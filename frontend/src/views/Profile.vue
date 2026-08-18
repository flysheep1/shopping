<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

const store = useUserStore();
const router = useRouter();
const busy = ref(false);
const message = ref('');

const collapsed = ref(localStorage.getItem('sidebar_collapsed') === '1');
function toggleSidebar() {
  collapsed.value = !collapsed.value;
  localStorage.setItem('sidebar_collapsed', collapsed.value ? '1' : '0');
}

const menus = [
  { key: 'profile', icon: '👤', label: '个人中心' },
  { key: 'orders', icon: '📦', label: '我的订单' },
  { key: 'points', icon: '🪙', label: '积分明细' },
  { key: 'address', icon: '📍', label: '收货地址' },
  { key: 'messages', icon: '✉️', label: '消息中心' },
  { key: 'settings', icon: '⚙️', label: '账户设置' },
];
const activeKey = ref('profile');
const activeMenu = computed(() => menus.find((m) => m.key === activeKey.value));

async function earn(amount) {
  message.value = '';
  busy.value = true;
  try {
    const u = await store.addPoints(amount);
    message.value = `${amount > 0 ? '增加' : '消耗'} ${Math.abs(amount)} 积分成功，当前 ${u.points} 分`;
  } catch (e) {
    message.value = e.message;
  } finally {
    busy.value = false;
  }
}

function fmtDate(s) {
  if (!s) return '-';
  return new Date(s).toLocaleString('zh-CN');
}

function handleLogout() {
  store.logout();
  router.push('/login');
}
</script>

<template>
  <div class="profile-layout" :class="{ collapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <span v-if="!collapsed" class="brand-text">我的账户</span>
        <span v-else class="brand-text">🛒</span>
        <button class="collapse-btn" :title="collapsed ? '展开' : '收起'" @click="toggleSidebar">
          <span class="arrow">{{ collapsed ? '▸' : '◂' }}</span>
        </button>
      </div>

      <nav class="menu">
        <button
          v-for="m in menus"
          :key="m.key"
          class="menu-item"
          :class="{ active: activeKey === m.key }"
          :title="m.label"
          @click="activeKey = m.key"
        >
          <span class="menu-icon">{{ m.icon }}</span>
          <span v-if="!collapsed" class="menu-label">{{ m.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="menu-item danger" :title="'退出登录'" @click="handleLogout">
          <span class="menu-icon">🚪</span>
          <span v-if="!collapsed" class="menu-label">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="profile-main">
      <div class="page-title">
        <h1>{{ activeMenu?.label }}</h1>
        <p class="hint">欢迎回来，{{ store.user?.nickname }}</p>
      </div>

      <div class="profile-grid">
        <!-- 积分卡片 -->
        <section class="card points-card">
          <div class="points-label">我的积分</div>
          <div class="points-value">
            <span class="coin">🪙</span>
            <span class="num">{{ store.points }}</span>
          </div>
          <div class="points-actions">
            <button :disabled="busy" @click="earn(10)">+10 签到</button>
            <button :disabled="busy" class="btn-outline" @click="earn(50)">+50 任务</button>
            <button :disabled="busy || store.points < 100" class="btn-outline danger" @click="earn(-100)">
              -100 兑换
            </button>
          </div>
          <div v-if="message" class="msg">{{ message }}</div>
        </section>

        <!-- 用户信息 -->
        <section class="card info-card">
          <h2 class="section-title">基本信息</h2>
          <dl class="info-list">
            <div class="info-row"><dt>用户名</dt><dd>{{ store.user?.username }}</dd></div>
            <div class="info-row"><dt>昵称</dt><dd>{{ store.user?.nickname }}</dd></div>
            <div class="info-row"><dt>邮箱</dt><dd>{{ store.user?.email || '-' }}</dd></div>
            <div class="info-row"><dt>注册时间</dt><dd>{{ fmtDate(store.user?.createdAt) }}</dd></div>
            <div class="info-row"><dt>用户ID</dt><dd>{{ store.user?.id }}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 420px;
  position: sticky;
  top: 76px;
  transition: width 0.2s ease;
}
.profile-layout.collapsed .sidebar { width: 64px; }

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
  min-height: 40px;
}
.profile-layout.collapsed .sidebar-header {
  justify-content: center;
  padding: 6px 0 12px;
}
.brand-text { font-weight: 600; font-size: 15px; }

.collapse-btn {
  background: transparent;
  color: var(--muted);
  padding: 2px 6px;
  font-size: 14px;
  line-height: 1;
  border-radius: 6px;
}
.collapse-btn:hover { background: var(--bg); color: var(--text); }
.profile-layout.collapsed .collapse-btn { display: none; }

.menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  color: var(--text);
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  width: 100%;
  transition: background 0.15s;
}
.profile-layout.collapsed .menu-item {
  justify-content: center;
  padding: 10px 0;
}
.menu-item:hover { background: var(--bg); }
.menu-item.active {
  background: #eef2ff;
  color: var(--primary);
  font-weight: 600;
}
.menu-item.danger { color: var(--danger); }
.menu-item.danger:hover { background: #fee2e2; }
.menu-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
.menu-label { white-space: nowrap; overflow: hidden; }

.sidebar-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

/* 主内容 */
.profile-main { flex: 1; min-width: 0; }

.page-title {
  margin-bottom: 20px;
}
.page-title h1 { font-size: 22px; margin-bottom: 4px; }
.page-title .hint { color: var(--muted); font-size: 14px; }

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 20px;
}
@media (max-width: 900px) {
  .profile-layout { flex-direction: column; }
  .sidebar {
    width: 100%;
    position: static;
    min-height: auto;
  }
  .profile-layout.collapsed .sidebar { width: 100%; }
  .sidebar-header { justify-content: space-between; }
  .profile-layout.collapsed .collapse-btn { display: block; }
  .menu { flex-direction: row; flex-wrap: wrap; }
  .menu-item { width: auto; }
  .profile-grid { grid-template-columns: 1fr; }
}

/* 积分卡 */
.points-card {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  text-align: center;
}
.points-label { font-size: 14px; opacity: 0.85; }
.points-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 24px;
}
.points-value .coin { font-size: 36px; }
.points-value .num { font-size: 48px; font-weight: 700; }

.points-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.points-actions button {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.points-actions button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}
.points-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.msg {
  margin-top: 16px;
  font-size: 13px;
  opacity: 0.9;
}

/* 用户信息卡 */
.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.info-list { display: flex; flex-direction: column; gap: 14px; }
.info-row { display: flex; align-items: center; }
.info-row dt { width: 100px; color: var(--muted); font-size: 14px; }
.info-row dd { font-size: 14px; }
</style>
