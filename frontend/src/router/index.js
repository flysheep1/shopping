import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useCartStore } from '../stores/cart';

const routes = [
  { path: '/', redirect: '/shop' },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue'), meta: { guest: true } },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue'), meta: { guest: true } },

  // 商城（登录后使用）
  { path: '/shop', name: 'shop', component: () => import('../views/Shop.vue'), meta: { auth: true } },
  { path: '/cart', name: 'cart', component: () => import('../views/Cart.vue'), meta: { auth: true } },

  // 个人中心（布局 + 子路由）
  {
    path: '/profile',
    component: () => import('../views/ProfileLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', name: 'profile-home', component: () => import('../views/ProfileHome.vue') },
      { path: 'points', name: 'profile-points', component: () => import('../views/PointsLog.vue') },
      { path: 'orders', name: 'profile-orders', component: () => import('../views/Orders.vue') },
      { path: 'settings', name: 'profile-settings', component: () => import('../views/Settings.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const store = useUserStore();
  if (store.isLogin && !store.user) {
    try {
      await store.fetchProfile();
      useCartStore().refresh();
    } catch {
      store.logout();
    }
  }

  if (to.meta.auth && !store.isLogin) {
    // 记录目标页面，登录成功后回跳
    return { name: 'login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } };
  }
  if (to.meta.guest && store.isLogin) {
    return { name: 'shop' };
  }
  return true;
});

export default router;
