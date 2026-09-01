<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '../api';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const cartStore = useCartStore();

const products = ref([]);
const loading = ref(true);
const error = ref('');
const addingId = ref(null);

onMounted(async () => {
  try {
    const data = await api.getProducts();
    products.value = data.list;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

async function add(p) {
  addingId.value = p.id;
  error.value = '';
  try {
    const data = await api.addToCart(p.id, 1);
    cartStore.setCount(data.count);
    // 按钮短暂反馈
    p._added = true;
    setTimeout(() => (p._added = false), 1200);
  } catch (e) {
    error.value = e.message;
  } finally {
    addingId.value = null;
  }
}

function goCart() {
  router.push('/cart');
}
</script>

<template>
  <div class="shop">
    <div class="shop-head">
      <div>
        <h1>积分商城</h1>
        <p class="hint">虚拟商品，兑换后即时发放兑换码</p>
      </div>
      <button class="btn-outline" @click="goCart">去购物车结算 🛍️</button>
    </div>

    <div v-if="loading" class="empty">加载中...</div>
    <div v-else-if="error" class="empty">{{ error }}</div>
    <div v-else-if="products.length === 0" class="empty">暂无商品</div>

    <div v-else class="product-grid">
      <div v-for="p in products" :key="p.id" class="card product-card" :class="{ off: !p.onSale || p.stock <= 0 }">
        <div class="product-emoji">{{ p.emoji }}</div>
        <h2 class="product-name">{{ p.name }}</h2>
        <p class="product-desc">{{ p.description }}</p>
        <div class="product-foot">
          <div class="price">🪙 {{ p.price }} <span class="price-unit">积分</span></div>
          <button
            :disabled="!p.onSale || p.stock <= 0 || addingId === p.id"
            class="add-btn"
            @click="add(p)"
          >
            <template v-if="p._added">✓ 已加入</template>
            <template v-else-if="p.stock <= 0">已售罄</template>
            <template v-else-if="addingId === p.id">加入中</template>
            <template v-else>加入购物车</template>
          </button>
        </div>
        <div class="stock">库存 {{ p.stock }} 件</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.shop-head h1 { font-size: 22px; }
.hint { color: var(--muted); font-size: 14px; }

.btn-outline {
  background: #fff;
  color: var(--primary);
  border: 1px solid var(--primary);
}
.btn-outline:hover { background: #eef2ff; }

.empty {
  text-align: center;
  color: var(--muted);
  padding: 60px 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
.product-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
.product-card.off { opacity: 0.7; }

.product-emoji { font-size: 44px; margin-bottom: 12px; }
.product-name { font-size: 17px; margin-bottom: 6px; }
.product-desc {
  color: var(--muted);
  font-size: 13px;
  flex: 1;
  margin-bottom: 16px;
  min-height: 40px;
}

.product-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.price { font-weight: 700; color: #b45309; font-size: 17px; }
.price-unit { font-size: 12px; font-weight: 400; }
.add-btn { padding: 8px 14px; font-size: 13px; }
.stock {
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
}
</style>
