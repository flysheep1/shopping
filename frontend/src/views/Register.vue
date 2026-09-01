<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const store = useUserStore();

const form = reactive({
  username: '',
  password: '',
  confirm: '',
  nickname: '',
  email: '',
});
const error = ref('');
const loading = ref(false);

async function onSubmit() {
  error.value = '';
  if (!form.username || !form.password) {
    error.value = '用户名和密码必填';
    return;
  }
  if (form.password.length < 6) {
    error.value = '密码至少 6 位';
    return;
  }
  if (form.password !== form.confirm) {
    error.value = '两次输入的密码不一致';
    return;
  }
  loading.value = true;
  try {
    await store.doRegister({
      username: form.username,
      password: form.password,
      nickname: form.nickname,
      email: form.email,
    });
    router.push('/shop');
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
      <h1 class="title">创建账号</h1>
      <p class="subtitle">注册即送 100 积分</p>

      <form @submit.prevent="onSubmit">
        <div class="field">
          <label>用户名 *</label>
          <input v-model="form.username" type="text" placeholder="用于登录" autocomplete="username" />
        </div>
        <div class="field">
          <label>昵称</label>
          <input v-model="form.nickname" type="text" placeholder="留空则使用用户名" />
        </div>
        <div class="field">
          <label>邮箱</label>
          <input v-model="form.email" type="email" placeholder="可选" autocomplete="email" />
        </div>
        <div class="field">
          <label>密码 *</label>
          <input v-model="form.password" type="password" placeholder="至少 6 位" autocomplete="new-password" />
        </div>
        <div class="field">
          <label>确认密码 *</label>
          <input v-model="form.confirm" type="password" placeholder="再次输入密码" autocomplete="new-password" />
        </div>

        <div class="error-msg">{{ error }}</div>

        <button class="btn-block" type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="link-row">
        已有账号？<router-link to="/login">去登录</router-link>
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
