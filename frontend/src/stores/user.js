import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '../api';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref(null);

  const isLogin = computed(() => !!token.value);
  const points = computed(() => user.value?.points ?? 0);

  function setToken(t) {
    token.value = t;
    localStorage.setItem('token', t);
  }

  function clearToken() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  }

  function setUser(u) {
    user.value = u;
  }

  async function doLogin(payload) {
    const data = await api.login(payload);
    setToken(data.token);
    user.value = data.user;
    return data.user;
  }

  async function doRegister(payload) {
    const data = await api.register(payload);
    setToken(data.token);
    user.value = data.user;
    return data.user;
  }

  async function fetchProfile() {
    if (!token.value) return null;
    const data = await api.getProfile();
    user.value = data.user;
    return data.user;
  }

  // 用接口返回的最新用户对象同步本地状态（签到/下单等操作后调用）
  function syncUser(u) {
    if (u) user.value = u;
  }

  function logout() {
    clearToken();
  }

  return {
    token,
    user,
    isLogin,
    points,
    doLogin,
    doRegister,
    fetchProfile,
    syncUser,
    setUser,
    logout,
  };
});
