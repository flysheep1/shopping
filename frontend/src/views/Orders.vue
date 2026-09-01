<script setup>
import { ref, onMounted } from 'vue';
import * as api from '../api';

const list = ref([]);
const loading = ref(true);
const error = ref('');
const expandedId = ref(null);

onMounted(async () => {
  try {
    const data = await api.getOrders();
    list.value = data.list;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

function fmtDate(s) {
  return new Date(s).toLocaleString('zh-CN');
}
function shortId(id) {
  return id.slice(0, 8).toUpperCase();
}
</script>

<template>
  <div class="orders">
    <div v-if="loading" class="empty">加载中...</div>
    <div v-else-if="error" class="empty">{{ error }}</div>
    <div v-else-if="list.length === 0" class="card empty-card">
      <p>📦 还没有订单</p>
      <router-link to="/shop"><button>去商城逛逛</button></router-link>
    </div>

    <template v-else>
      <div v-for="o in list" :key="o.id" class="card order-card">
        <div class="order-head" @click="toggle(o.id)">
          <div class="order-info">
            <span class="order-id">订单 {{ shortId(o.id) }}</span>
            <span class="order-date">{{ fmtDate(o.createdAt) }}</span>
          </div>
          <div class="order-right">
            <span class="order-total">🪙 {{ o.total }} 积分</span>
            <span class="order-status done">{{ o.status === 'completed' ? '已完成' : o.status }}</span>
            <span class="expand-arrow" :class="{ open: expandedId === o.id }">▾</span>
          </div>
        </div>

        <div v-if="expandedId === o.id" class="order-body">
          <div v-for="it in o.items" :key="it.productId" class="order-item">
            <div class="item-line">
              <span class="item-name">{{ it.emoji }} {{ it.name }} × {{ it.qty }}</span>
              <span class="item-subtotal">🪙 {{ it.subtotal }}</span>
            </div>
            <div class="item-codes">
              <span class="code-label">兑换码：</span>
              <code v-for="c in it.codes" :key="c">{{ c }}</code>
            </div>
          </div>
        </div>
        <div v-else class="order-summary">
          {{ o.items.map((i) => `${i.emoji} ${i.name}×${i.qty}`).join('　') }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.empty { text-align: center; color: var(--muted); padding: 60px 0; }
.empty-card { text-align: center; padding: 60px 28px; }
.empty-card p { margin-bottom: 16px; color: var(--muted); }

.order-card { padding: 18px 24px; margin-bottom: 14px; }

.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 12px;
}
.order-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.order-id { font-weight: 600; font-size: 14px; font-family: ui-monospace, monospace; }
.order-date { color: var(--muted); font-size: 13px; }

.order-right { display: flex; align-items: center; gap: 12px; }
.order-total { font-weight: 700; color: #b45309; }
.order-status {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
}
.order-status.done {
  background: #d1fae5;
  color: #065f46;
}
.expand-arrow {
  color: var(--muted);
  transition: transform 0.2s;
  font-size: 12px;
}
.expand-arrow.open { transform: rotate(180deg); }

.order-summary {
  margin-top: 10px;
  color: var(--muted);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-body { margin-top: 14px; border-top: 1px dashed var(--border); padding-top: 14px; }
.order-item { margin-bottom: 14px; }
.order-item:last-child { margin-bottom: 0; }
.item-line {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
}
.item-name { font-weight: 600; }
.item-subtotal { color: #b45309; }

.item-codes { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.code-label { font-size: 12px; color: var(--muted); }
.item-codes code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--primary);
  font-weight: 600;
}
</style>
