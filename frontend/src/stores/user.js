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

  async function addPoints(amount) {
    const data = await api.addPoints(amount);
    user.value = data.user;
    return data.user;
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
    addPoints,
    logout,
  };
});
