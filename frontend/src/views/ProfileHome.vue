<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import * as api from '../api';

const store = useUserStore();
const busy = ref(false);
const message = ref('');
const error = ref('');
const status = ref({ canCheckin: true, canDoTask: true, checkinStreak: 0, rules: {} });

onMounted(async () => {
  try {
    status.value = await api.getPointsStatus();
  } catch {
    // 静默失败，按钮状态默认可用
  }
});

async function checkin() {
  error.value = '';
  message.value = '';
  busy.value = true;
  try {
    const data = await api.checkin();
    store.syncUser(data.user);
    status.value.canCheckin = false;
    status.value.checkinStreak = data.streak;
    message.value = `签到成功 +${data.gained} 积分${data.streak % 7 === 0 ? '（连续签到奖励！）' : ''}`;
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function doTask() {
  error.value = '';
  message.value = '';
  busy.value = true;
  try {
    const data = await api.doTask();
    store.syncUser(data.user);
    status.value.canDoTask = false;
    message.value = `任务完成 +${data.gained} 积分`;
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

function fmtDate(s) {
  if (!s) return '-';
  return new Date(s).toLocaleString('zh-CN');
}
</script>

<template>
  <div class="profile-grid">
    <!-- 积分卡片 -->
    <section class="card points-card">
      <div class="points-label">我的积分</div>
      <div class="points-value">
        <span class="coin">🪙</span>
        <span class="num">{{ store.points }}</span>
      </div>

      <div class="streak" v-if="status.checkinStreak > 0">
        已连续签到 <b>{{ status.checkinStreak }}</b> 天，每满 {{ status.rules.streakCycle || 7 }} 天有额外奖励
      </div>

      <div class="points-actions">
        <button :disabled="busy || !status.canCheckin" @click="checkin">
          {{ status.canCheckin ? `每日签到 +${status.rules.checkinBase || 10}` : '今日已签到 ✓' }}
        </button>
        <button :disabled="busy || !status.canDoTask" class="btn-outline-light" @click="doTask">
          {{ status.canDoTask ? `每日任务 +${status.rules.taskReward || 50}` : '今日任务已完成 ✓' }}
        </button>
      </div>

      <div v-if="message" class="msg ok">{{ message }}</div>
      <div v-if="error" class="msg err">{{ error }}</div>

      <router-link to="/shop" class="go-shop">积分没处花？去商城兑换好礼 →</router-link>
    </section>

    <!-- 用户信息 -->
    <section class="card info-card">
      <h2 class="section-title">基本信息</h2>
      <dl class="info-list">
        <div class="info-row"><dt>用户名</dt><dd>{{ store.user?.username }}</dd></div>
        <div class="info-row"><dt>昵称</dt><dd>{{ store.user?.nickname }}</dd></div>
        <div class="info-row"><dt>邮箱</dt><dd>{{ store.user?.email || '-' }}</dd></div>
        <div class="info-row"><dt>注册时间</dt><dd>{{ fmtDate(store.user?.createdAt) }}</dd></div>
        <div class="info-row"><dt>用户ID</dt><dd class="mono">{{ store.user?.id }}</dd></div>
      </dl>
      <div class="info-actions">
        <router-link to="/profile/settings"><button class="btn-outline">编辑资料</button></router-link>
        <router-link to="/profile/points"><button class="btn-outline">积分明细</button></router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) {
  .profile-grid { grid-template-columns: 1fr; }
}

/* 积分卡 */
.points-card {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  text-align: center;
}
.points-label { font-size: 14px; opacity: 0.85; }
.points-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 12px;
}
.points-value .coin { font-size: 36px; }
.points-value .num { font-size: 48px; font-weight: 700; }

.streak {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.points-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.points-actions button {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.points-actions button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}
.points-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.12);
}
.btn-outline-light { border: 1px solid rgba(255, 255, 255, 0.3); }

.msg { margin-top: 14px; font-size: 13px; }
.msg.ok { opacity: 0.95; }
.msg.err { opacity: 1; font-weight: 600; }

.go-shop {
  display: inline-block;
  margin-top: 18px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}
.go-shop:hover { color: #fff; text-decoration: underline; }

/* 用户信息卡 */
.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.info-list { display: flex; flex-direction: column; gap: 14px; }
.info-row { display: flex; align-items: center; }
.info-row dt { width: 100px; color: var(--muted); font-size: 14px; flex-shrink: 0; }
.info-row dd { font-size: 14px; word-break: break-all; }
.info-row dd.mono { font-family: ui-monospace, monospace; font-size: 12px; color: var(--muted); }

.info-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.btn-outline {
  background: #fff;
  color: var(--primary);
  border: 1px solid var(--primary);
}
.btn-outline:hover { background: #eef2ff; }
</style>
