<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from './stores/user';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const showHeader = computed(() => !['login', 'register'].includes(route.name));

async function handleLogout() {
  store.logout();
  router.push('/login');
}
</script>

<template>
  <header v-if="showHeader" class="app-header">
    <div class="header-inner">
      <div class="brand" @click="router.push('/profile')">
        <span class="logo">🛒</span>
        <span>购物商城</span>
      </div>

      <div class="header-right">
        <template v-if="store.isLogin">
          <div class="points-badge" title="我的积分">
            <span class="coin">🪙</span>
            <span class="num">{{ store.points }}</span>
            <span class="label">积分</span>
          </div>
          <span class="welcome">Hi, {{ store.user?.nickname }}</span>
          <button class="btn-text" @click="handleLogout">退出</button>
        </template>
        <template v-else>
          <router-link to="/login">登录</router-link>
          <router-link to="/register">注册</router-link>
        </template>
      </div>
    </div>
  </header>

  <main class="app-main">
    <router-view />
  </main>
</template>

<style scoped>
.app-header {
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}
.logo { font-size: 20px; }
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.points-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  font-weight: 600;
  font-size: 14px;
}
.points-badge .coin { font-size: 16px; }
.points-badge .num { font-size: 15px; }
.points-badge .label { font-size: 12px; opacity: 0.8; }

.welcome { color: var(--muted); font-size: 14px; }
.btn-text {
  background: transparent;
  color: var(--danger);
  padding: 4px 8px;
}
.btn-text:hover { background: #fee2e2; }

.app-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px;
}
</style>
