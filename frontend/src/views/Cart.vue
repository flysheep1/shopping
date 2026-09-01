<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '../api';
import { useUserStore } from '../stores/user';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const store = useUserStore();
const cartStore = useCartStore();

const cart = ref({ items: [], total: 0, count: 0 });
const loading = ref(true);
const error = ref('');
const message = ref('');
const busy = ref(false);
const lastOrder = ref(null); // 结算成功后展示兑换码

onMounted(load);

async function load() {
  loading.value = true;
  try {
    cart.value = await api.getCart();
    cartStore.setCount(cart.value.count);
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

const notEnough = computed(() => store.points < cart.value.total);

async function changeQty(item, delta) {
  error.value = '';
  try {
    const qty = Math.min(Math.max(item.qty + delta, 1), 10);
    if (qty === item.qty) return;
    cart.value = await api.updateCartQty(item.productId, qty);
    cartStore.setCount(cart.value.count);
  } catch (e) {
    error.value = e.message;
  }
}

async function remove(item) {
  error.value = '';
  try {
    cart.value = await api.removeFromCart(item.productId);
    cartStore.setCount(cart.value.count);
  } catch (e) {
    error.value = e.message;
  }
}

async function clear() {
  error.value = '';
  try {
    cart.value = await api.clearCart();
    cartStore.setCount(0);
  } catch (e) {
    error.value = e.message;
  }
}

async function doCheckout() {
  error.value = '';
  message.value = '';
  busy.value = true;
  try {
    const data = await api.checkout();
    lastOrder.value = data.order;
    store.syncUser(data.user);
    cartStore.setCount(0);
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

function fmtDate(s) {
  return new Date(s).toLocaleString('zh-CN');
}
</script>

<template>
  <div class="cart-page">
    <div class="page-head">
      <h1>购物车</h1>
      <button v-if="cart.items.length > 0 && !lastOrder" class="btn-text-danger" @click="clear">清空购物车</button>
    </div>

    <!-- 结算成功卡片 -->
    <div v-if="lastOrder" class="card success-card">
      <div class="success-title">🎉 兑换成功！积分已扣除 {{ lastOrder.total }} 分</div>
      <div class="order-meta">订单号：{{ lastOrder.id.slice(0, 8).toUpperCase() }} · {{ fmtDate(lastOrder.createdAt) }}</div>
      <div class="code-list">
        <div v-for="it in lastOrder.items" :key="it.productId" class="code-item">
          <span class="code-name">{{ it.emoji }} {{ it.name }} × {{ it.qty }}</span>
          <div class="codes">
            <code v-for="c in it.codes" :key="c">{{ c }}</code>
          </div>
        </div>
      </div>
      <div class="success-actions">
        <router-link to="/orders"><button>查看我的订单</button></router-link>
        <router-link to="/shop"><button class="btn-outline">继续逛逛</button></router-link>
      </div>
    </div>

    <template v-else>
      <div v-if="loading" class="empty">加载中...</div>
      <div v-else-if="error && cart.items.length === 0" class="empty">{{ error }}</div>
      <div v-else-if="cart.items.length === 0" class="card empty-card">
        <p>🛒 购物车空空如也</p>
        <router-link to="/shop"><button>去商城逛逛</button></router-link>
      </div>

      <div v-else class="cart-body">
        <div class="card cart-list">
          <div v-for="it in cart.items" :key="it.productId" class="cart-item">
            <div class="item-emoji">{{ it.emoji }}</div>
            <div class="item-info">
              <div class="item-name">{{ it.name }}</div>
              <div class="item-price">🪙 {{ it.price }} 积分/件</div>
            </div>
            <div class="qty-ctrl">
              <button class="qty-btn" :disabled="it.qty <= 1" @click="changeQty(it, -1)">−</button>
              <span class="qty-num">{{ it.qty }}</span>
              <button class="qty-btn" :disabled="it.qty >= Math.min(it.stock, 10)" @click="changeQty(it, 1)">＋</button>
            </div>
            <div class="item-subtotal">🪙 {{ it.subtotal }}</div>
            <button class="remove-btn" title="移除" @click="remove(it)">✕</button>
          </div>
          <div v-if="error" class="error-msg">{{ error }}</div>
        </div>

        <div class="card settle-card">
          <h2 class="section-title">结算</h2>
          <div class="settle-row"><span>商品件数</span><span>{{ cart.count }} 件</span></div>
          <div class="settle-row total"><span>合计</span><span class="total-num">🪙 {{ cart.total }}</span></div>
          <div class="settle-row"><span>当前积分</span><span :class="{ 'not-enough': notEnough }">🪙 {{ store.points }}</span></div>
          <button class="btn-block checkout-btn" :disabled="busy || notEnough" @click="doCheckout">
            {{ notEnough ? `积分不足（差 ${cart.total - store.points} 分）` : busy ? '结算中...' : '立即兑换' }}
          </button>
          <p class="tip">虚拟商品兑换后立即发放兑换码，积分概不退换</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-head h1 { font-size: 22px; }
.btn-text-danger {
  background: transparent;
  color: var(--danger);
  padding: 6px 10px;
  font-size: 13px;
}
.btn-text-danger:hover { background: #fee2e2; }

.empty { text-align: center; color: var(--muted); padding: 60px 0; }
.empty-card { text-align: center; padding: 60px 28px; }
.empty-card p { margin-bottom: 16px; color: var(--muted); }

.cart-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: flex-start;
}
@media (max-width: 820px) {
  .cart-body { grid-template-columns: 1fr; }
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 4px;
  border-bottom: 1px solid var(--border);
}
.cart-item:last-child { border-bottom: none; }
.item-emoji { font-size: 32px; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-weight: 600; margin-bottom: 2px; }
.item-price { font-size: 13px; color: var(--muted); }

.qty-ctrl { display: flex; align-items: center; gap: 8px; }
.qty-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 15px;
}
.qty-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); background: #eef2ff; }
.qty-num { min-width: 24px; text-align: center; font-weight: 600; }

.item-subtotal { font-weight: 700; color: #b45309; min-width: 70px; text-align: right; }
.remove-btn {
  background: transparent;
  color: var(--muted);
  padding: 4px 8px;
  font-size: 14px;
}
.remove-btn:hover { color: var(--danger); background: #fee2e2; }

.settle-card { position: sticky; top: 76px; }
.section-title { font-size: 16px; margin-bottom: 16px; }
.settle-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 12px;
}
.settle-row.total {
  font-size: 16px;
  color: var(--text);
  font-weight: 600;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.total-num { color: #b45309; font-size: 20px; }
.not-enough { color: var(--danger); font-weight: 600; }
.checkout-btn { margin-top: 8px; }
.tip { font-size: 12px; color: var(--muted); margin-top: 12px; text-align: center; }

/* 成功卡片 */
.success-card { text-align: center; padding: 40px 28px; }
.success-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.order-meta { color: var(--muted); font-size: 13px; margin-bottom: 24px; }
.code-list { text-align: left; max-width: 480px; margin: 0 auto 24px; }
.code-item { padding: 12px 0; border-bottom: 1px dashed var(--border); }
.code-item:last-child { border-bottom: none; }
.code-name { font-weight: 600; font-size: 14px; display: block; margin-bottom: 8px; }
.codes { display: flex; flex-wrap: wrap; gap: 8px; }
.codes code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 14px;
  letter-spacing: 1px;
  color: var(--primary);
  font-weight: 600;
}
.success-actions { display: flex; gap: 12px; justify-content: center; }
.btn-outline {
  background: #fff;
  color: var(--primary);
  border: 1px solid var(--primary);
}
.btn-outline:hover { background: #eef2ff; }
</style>
