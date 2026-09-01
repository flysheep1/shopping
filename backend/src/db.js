import { JSONFilePreset } from 'lowdb/node';
import crypto from 'node:crypto';

/**
 * 虚拟商品种子数据。
 * 后期对接外部商品 API 时，只需替换 products 集合的读取来源（见 routes/products.js）。
 */
const SEED_PRODUCTS = [
  { id: 'p_video_month', name: '视频会员月卡', emoji: '🎬', description: '主流视频平台 30 天会员兑换码', price: 300, stock: 50, onSale: true },
  { id: 'p_music_season', name: '音乐会员季卡', emoji: '🎧', description: '在线音乐 90 天会员兑换码', price: 600, stock: 15, onSale: true },
  { id: 'p_coffee', name: '连锁咖啡券', emoji: '☕', description: '全国门店通兑中杯咖啡券', price: 150, stock: 30, onSale: true },
  { id: 'p_game_point', name: '游戏点卡 100 点', emoji: '🎮', description: '热门游戏平台 100 点充值卡', price: 500, stock: 20, onSale: true },
  { id: 'p_cloud_month', name: '网盘月卡会员', emoji: '☁️', description: '云存储 30 天超级会员', price: 200, stock: 40, onSale: true },
  { id: 'p_phone_10', name: '10 元话费', emoji: '📱', description: '直充 10 元话费（三网通用）', price: 1000, stock: 100, onSale: true },
];

const defaultData = {
  users: [],
  products: SEED_PRODUCTS,
  carts: {},      // { [userId]: [{ productId, qty }] }
  orders: [],     // 订单（虚拟商品，下单即完成并发兑换码）
  pointsLog: [],  // { id, userId, amount, type, note, balance, createdAt }
};

export const db = await JSONFilePreset('db.json', defaultData);
await db.read();

// —— 数据迁移：旧版本 db.json 缺少集合时补齐，保证升级平滑 ——
if (!Array.isArray(db.data.products)) db.data.products = structuredClone(SEED_PRODUCTS);
if (!db.data.carts || typeof db.data.carts !== 'object') db.data.carts = {};
if (!Array.isArray(db.data.orders)) db.data.orders = [];
if (!Array.isArray(db.data.pointsLog)) db.data.pointsLog = [];
await db.write();

export function newId() {
  return crypto.randomUUID();
}

/** 记录积分流水（调用方负责已修改 user.points 并持久化） */
export function addPointsLog(user, amount, type, note) {
  db.data.pointsLog.push({
    id: newId(),
    userId: user.id,
    amount,
    type,
    note,
    balance: user.points,
    createdAt: new Date().toISOString(),
  });
}

/** 本地日期字符串 YYYY-MM-DD（用于每日签到/任务去重） */
export function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function yesterdayStr() {
  const d = new Date(Date.now() - 24 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function findUserById(id) {
  return db.data.users.find((u) => u.id === id);
}
