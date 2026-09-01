<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const collapsed = ref(localStorage.getItem('sidebar_collapsed') === '1');
function toggleSidebar() {
  collapsed.value = !collapsed.value;
  localStorage.setItem('sidebar_collapsed', collapsed.value ? '1' : '0');
}

const menus = [
  { key: 'profile-home', icon: '👤', label: '个人中心', to: '/profile' },
  { key: 'profile-points', icon: '🪙', label: '积分明细', to: '/profile/points' },
  { key: 'profile-orders', icon: '📦', label: '我的订单', to: '/profile/orders' },
  { key: 'profile-settings', icon: '⚙️', label: '账户设置', to: '/profile/settings' },
];
const activeKey = computed(() => route.name);

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
        <router-link
          v-for="m in menus"
          :key="m.key"
          class="menu-item"
          :class="{ active: activeKey === m.key }"
          :to="m.to"
          :title="m.label"
        >
          <span class="menu-icon">{{ m.icon }}</span>
          <span v-if="!collapsed" class="menu-label">{{ m.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="menu-item danger" title="退出登录" @click="handleLogout">
          <span class="menu-icon">🚪</span>
          <span v-if="!collapsed" class="menu-label">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区：子路由 -->
    <div class="profile-main">
      <div class="page-title">
        <h1>{{ menus.find((m) => m.key === activeKey)?.label || '个人中心' }}</h1>
        <p class="hint">欢迎回来，{{ store.user?.nickname }}</p>
      </div>
      <router-view />
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

.page-title { margin-bottom: 20px; }
.page-title h1 { font-size: 22px; margin-bottom: 4px; }
.page-title .hint { color: var(--muted); font-size: 14px; }

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
}
</style>
