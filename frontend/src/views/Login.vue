<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const store = useUserStore();

const form = reactive({ username: '', password: '' });
const error = ref('');
const loading = ref(false);

async function onSubmit() {
  error.value = '';
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码';
    return;
  }
  loading.value = true;
  try {
    await store.doLogin({ ...form });
    router.push('/profile');
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-wrap">
    <div class="card auth-card">
      <h1 class="title">欢迎回来</h1>
      <p class="subtitle">登录后查看你的积分和订单</p>

      <form @submit.prevent="onSubmit">
        <div class="field">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" autocomplete="username" />
        </div>
        <div class="field">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="current-password" />
        </div>

        <div class="error-msg">{{ error }}</div>

        <button class="btn-block" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="link-row">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
}
.auth-card { width: 100%; max-width: 400px; }
.title { font-size: 22px; margin-bottom: 4px; }
.subtitle { color: var(--muted); font-size: 14px; margin-bottom: 24px; }
</style>
