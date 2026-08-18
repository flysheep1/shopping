import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  { path: '/', redirect: '/profile' },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue'), meta: { guest: true } },
  { path: '/register', name: 'register', component: () => import('../views/Register.vue'), meta: { guest: true } },
  { path: '/profile', name: 'profile', component: () => import('../views/Profile.vue'), meta: { auth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const store = useUserStore();
  if (store.isLogin && !store.user) {
    try {
      await store.fetchProfile();
    } catch {
      store.logout();
    }
  }

  if (to.meta.auth && !store.isLogin) {
    return { name: 'login' };
  }
  if (to.meta.guest && store.isLogin) {
    return { name: 'profile' };
  }
  return true;
});

export default router;
