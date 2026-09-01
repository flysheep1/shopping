<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import { useCartStore } from './stores/cart';

const route = useRoute();
const router = useRouter();
const store = useUserStore();
const cartStore = useCartStore();

const showHeader = computed(() => !['login', 'register'].includes(route.name));

onMounted(() => {
  if (store.isLogin) cartStore.refresh();
});

async function handleLogout() {
  store.logout();
  cartStore.reset();
  router.push('/login');
}
</script>

<template>
  <header v-if="showHeader" class="app-header">
    <div class="header-inner">
      <div class="brand" @click="router.push('/shop')">
        <span class="logo">🛒</span>
        <span>购物商城</span>
      </div>

      <nav v-if="store.isLogin" class="header-nav">
        <router-link to="/shop" class="nav-link" :class="{ active: route.name === 'shop' }">商城</router-link>
        <router-link to="/cart" class="nav-link cart-link" :class="{ active: route.name === 'cart' }">
          购物车
          <span v-if="cartStore.count > 0" class="cart-badge">{{ cartStore.count > 99 ? '99+' : cartStore.count }}</span>
        </router-link>
      </nav>

      <div class="header-right">
        <template v-if="store.isLogin">
          <div class="points-badge" title="我的积分">
            <span class="coin">🪙</span>
            <span class="num">{{ store.points }}</span>
            <span class="label">积分</span>
          </div>
          <span class="welcome" @click="router.push('/profile')" title="个人中心">
            Hi, {{ store.user?.nickname }}
          </span>
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
  gap: 16px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
}
.logo { font-size: 20px; }

.header-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: auto;
  margin-left: 24px;
}
.nav-link {
  position: relative;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
}
.nav-link:hover { background: var(--bg); color: var(--text); }
.nav-link.active {
  background: #eef2ff;
  color: var(--primary);
  font-weight: 600;
}
.cart-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 4px;
  border-radius: 999px;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

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

.welcome { color: var(--muted); font-size: 14px; cursor: pointer; }
.welcome:hover { color: var(--primary); }
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

@media (max-width: 640px) {
  .header-nav { display: none; }
}
</style>
