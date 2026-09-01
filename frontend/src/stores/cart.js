import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as api from '../api';

export const useCartStore = defineStore('cart', () => {
  const count = ref(0);

  async function refresh() {
    if (!localStorage.getItem('token')) {
      count.value = 0;
      return;
    }
    try {
      const data = await api.getCart();
      count.value = data.count || 0;
    } catch {
      // 未登录/token 失效由 http 拦截器统一处理
    }
  }

  function setCount(n) {
    count.value = n || 0;
  }

  function reset() {
    count.value = 0;
  }

  return { count, refresh, setCount, reset };
});
