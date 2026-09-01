import { Router } from 'express';
import crypto from 'node:crypto';
import { db, findUserById, addPointsLog, newId } from '../db.js';
import { auth } from '../auth.js';
import { publicUser } from './auth.js';

const router = Router();

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function redeemCode() {
  const seg = () =>
    Array.from(crypto.randomBytes(4))
      .map((b) => CODE_CHARS[b % CODE_CHARS.length])
      .join('');
  return `${seg()}-${seg()}-${seg()}`;
}

/** 下单结算：校验库存与积分 → 扣积分 → 减库存 → 生成订单与兑换码 → 清空购物车 */
router.post('/orders/checkout', auth, async (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  const cart = db.data.carts[req.user.id] || [];
  if (cart.length === 0) {
    return res.status(400).json({ message: '购物车是空的' });
  }

  // 服务端逐项校验并计算总价（不信任前端传来的价格）
  const items = [];
  for (const it of cart) {
    const p = db.data.products.find((x) => x.id === it.productId);
    if (!p || p.onSale === false) {
      return res.status(400).json({ message: '部分商品已下架，请刷新购物车' });
    }
    if (it.qty > p.stock) {
      return res.status(400).json({ message: `「${p.name}」库存不足，仅剩 ${p.stock} 件` });
    }
    items.push({
      productId: p.id,
      name: p.name,
      emoji: p.emoji,
      price: p.price,
      qty: it.qty,
      subtotal: p.price * it.qty,
      codes: Array.from({ length: it.qty }, redeemCode), // 虚拟商品：发货即生成兑换码
    });
  }

  const total = items.reduce((s, it) => s + it.subtotal, 0);
  if (user.points < total) {
    return res.status(400).json({ message: `积分不足，还差 ${total - user.points} 分` });
  }

  // 扣积分、记流水
  user.points -= total;
  addPointsLog(user, -total, 'purchase', `商城消费（${items.length} 种商品，共 ${items.reduce((s, i) => s + i.qty, 0)} 件）`);

  // 减库存
  for (const it of items) {
    const p = db.data.products.find((x) => x.id === it.productId);
    p.stock -= it.qty;
  }

  // 生成订单（虚拟商品自动发货，直接完成）
  const order = {
    id: newId(),
    userId: user.id,
    items,
    total,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  db.data.orders.push(order);

  // 清空购物车
  db.data.carts[req.user.id] = [];
  await db.write();

  res.json({ order, user: publicUser(user) });
});

// 我的订单（时间倒序）
router.get('/orders', auth, (req, res) => {
  const list = db.data.orders
    .filter((o) => o.userId === req.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ list });
});

router.get('/orders/:id', auth, (req, res) => {
  const order = db.data.orders.find((o) => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ message: '订单不存在' });
  res.json({ order });
});

export default router;
