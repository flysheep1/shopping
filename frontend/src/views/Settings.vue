<script setup>
import { reactive, ref } from 'vue';
import { useUserStore } from '../stores/user';
import * as api from '../api';

const store = useUserStore();

// —— 基本资料 ——
const profileForm = reactive({
  nickname: store.user?.nickname || '',
  email: store.user?.email || '',
});
const profileMsg = ref('');
const profileErr = ref('');
const savingProfile = ref(false);

async function saveProfile() {
  profileMsg.value = '';
  profileErr.value = '';
  savingProfile.value = true;
  try {
    const data = await api.updateProfile({
      nickname: profileForm.nickname,
      email: profileForm.email,
    });
    store.syncUser(data.user);
    profileMsg.value = '资料已更新';
  } catch (e) {
    profileErr.value = e.message;
  } finally {
    savingProfile.value = false;
  }
}

// —— 修改密码 ——
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirm: '' });
const pwdMsg = ref('');
const pwdErr = ref('');
const savingPwd = ref(false);

async function savePassword() {
  pwdMsg.value = '';
  pwdErr.value = '';
  if (pwdForm.newPassword !== pwdForm.confirm) {
    pwdErr.value = '两次输入的新密码不一致';
    return;
  }
  savingPwd.value = true;
  try {
    await api.changePassword({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    });
    pwdMsg.value = '密码修改成功，请牢记新密码';
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
    pwdForm.confirm = '';
  } catch (e) {
    pwdErr.value = e.message;
  } finally {
    savingPwd.value = false;
  }
}
</script>

<template>
  <div class="settings">
    <!-- 基本资料 -->
    <section class="card">
      <h2 class="section-title">基本资料</h2>
      <form class="settings-form" @submit.prevent="saveProfile">
        <div class="field">
          <label>用户名（不可修改）</label>
          <input :value="store.user?.username" type="text" disabled class="disabled" />
        </div>
        <div class="field">
          <label>昵称</label>
          <input v-model="profileForm.nickname" type="text" placeholder="最多 20 个字符" maxlength="20" />
        </div>
        <div class="field">
          <label>邮箱</label>
          <input v-model="profileForm.email" type="email" placeholder="选填" />
        </div>
        <div class="error-msg">{{ profileErr }}</div>
        <div class="ok-msg">{{ profileMsg }}</div>
        <button type="submit" :disabled="savingProfile">
          {{ savingProfile ? '保存中...' : '保存资料' }}
        </button>
      </form>
    </section>

    <!-- 修改密码 -->
    <section class="card">
      <h2 class="section-title">修改密码</h2>
      <form class="settings-form" @submit.prevent="savePassword">
        <div class="field">
          <label>原密码</label>
          <input v-model="pwdForm.oldPassword" type="password" autocomplete="current-password" required />
        </div>
        <div class="field">
          <label>新密码</label>
          <input v-model="pwdForm.newPassword" type="password" placeholder="至少 6 位" autocomplete="new-password" required />
        </div>
        <div class="field">
          <label>确认新密码</label>
          <input v-model="pwdForm.confirm" type="password" autocomplete="new-password" required />
        </div>
        <div class="error-msg">{{ pwdErr }}</div>
        <div class="ok-msg">{{ pwdMsg }}</div>
        <button type="submit" :disabled="savingPwd" class="btn-danger">
          {{ savingPwd ? '提交中...' : '修改密码' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) {
  .settings { grid-template-columns: 1fr; }
}

.section-title {
  font-size: 17px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.settings-form { max-width: 420px; }
.settings-form button { margin-top: 8px; }
input.disabled { background: var(--bg); color: var(--muted); cursor: not-allowed; }

.btn-danger { background: var(--danger); }
.btn-danger:hover { background: #dc2626; }

.ok-msg {
  color: var(--success);
  font-size: 13px;
  margin-top: 8px;
  min-height: 18px;
}
</style>
