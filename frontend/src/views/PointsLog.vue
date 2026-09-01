<script setup>
import { ref, onMounted } from 'vue';
import * as api from '../api';

const list = ref([]);
const loading = ref(true);
const error = ref('');

const TYPE_MAP = {
  register: { label: '注册赠送', icon: '🎁' },
  checkin: { label: '每日签到', icon: '📅' },
  task: { label: '每日任务', icon: '🎯' },
  purchase: { label: '商城消费', icon: '🛍️' },
};

onMounted(async () => {
  try {
    const data = await api.getPointsLog();
    list.value = data.list;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

function fmtDate(s) {
  return new Date(s).toLocaleString('zh-CN');
}
function typeInfo(t) {
  return TYPE_MAP[t] || { label: t, icon: '•' };
}
</script>

<template>
  <div class="card log-card">
    <div v-if="loading" class="empty">加载中...</div>
    <div v-else-if="error" class="empty">{{ error }}</div>
    <div v-else-if="list.length === 0" class="empty">暂无积分记录，先去 <router-link to="/profile">签到</router-link> 赚积分吧</div>

    <template v-else>
      <div class="log-header">
        <span class="col-type">类型</span>
        <span class="col-note">说明</span>
        <span class="col-amount">变动</span>
        <span class="col-balance">余额</span>
        <span class="col-time">时间</span>
      </div>
      <div v-for="l in list" :key="l.id" class="log-row">
        <span class="col-type">
          {{ typeInfo(l.type).icon }} {{ typeInfo(l.type).label }}
        </span>
        <span class="col-note">{{ l.note }}</span>
        <span class="col-amount" :class="l.amount > 0 ? 'up' : 'down'">
          {{ l.amount > 0 ? '+' : '' }}{{ l.amount }}
        </span>
        <span class="col-balance">🪙 {{ l.balance }}</span>
        <span class="col-time">{{ fmtDate(l.createdAt) }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.log-card { padding: 8px 24px 16px; }
.empty { text-align: center; color: var(--muted); padding: 48px 0; }

.log-header, .log-row {
  display: grid;
  grid-template-columns: 110px 1fr 80px 100px 170px;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
}
.log-header {
  font-size: 13px;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--card);
}
.log-row {
  font-size: 14px;
  border-bottom: 1px solid var(--border);
}
.log-row:last-child { border-bottom: none; }

.col-note { color: var(--muted); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-amount { font-weight: 700; text-align: right; }
.col-amount.up { color: var(--danger); }   /* 收入 → 红（涨红） */
.col-amount.down { color: var(--success); } /* 支出 → 绿 */
.col-balance { color: var(--muted); font-size: 13px; text-align: right; }
.col-time { color: var(--muted); font-size: 12px; text-align: right; }

@media (max-width: 760px) {
  .log-header { display: none; }
  .log-row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'type amount'
      'note note'
      'time balance';
  }
  .col-type { grid-area: type; }
  .col-note { grid-area: note; white-space: normal; }
  .col-amount { grid-area: amount; }
  .col-balance { grid-area: balance; }
  .col-time { grid-area: time; text-align: left; }
}
</style>
