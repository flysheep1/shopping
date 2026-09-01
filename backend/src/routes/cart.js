import { Router } from 'express';
import { db, findUserById } from '../db.js';
import { auth } from '../auth.js';

const router = Router();
const MAX_QTY_PER_ITEM = 10;

function getCart(userId) {
  return db.data.carts[userId] || [];
}

function cartView(userId) {
  const items = getCart(userId)
    .map((it) => {
      const p = db.data.products.find((x) => x.id === it.productId);
      if (!p) return null;
      return {
        productId: p.id,
        name: p.name,
        emoji: p.emoji,
        price: p.price,
        qty: it.qty,
        stock: p.stock,
        subtotal: p.price * it.qty,
      };
    })
    .filter(Boolean);
  const total = items.reduce((s, it) => s + it.subtotal, 0);
  const count = items.reduce((s, it) => s + it.qty, 0);
  return { items, total, count };
}

router.get('/cart', auth, (req, res) => {
  res.json(cartView(req.user.id));
});

// 加入购物车（已有则累加数量）
router.post('/cart', auth, async (req, res) => {
  const { productId, qty } = req.body || {};
  const n = Number(qty ?? 1);
  if (!productId) return res.status(400).json({ message: 'productId 必填' });
  if (!Number.isInteger(n) || n < 1 || n > MAX_QTY_PER_ITEM) {
    return res.status(400).json({ message: `数量需为 1-${MAX_QTY_PER_ITEM} 的整数` });
  }

  const product = db.data.products.find((x) => x.id === productId);
  if (!product) return res.status(404).json({ message: '商品不存在' });
  if (product.onSale === false) return res.status(400).json({ message: '商品已下架' });

  const cart = db.data.carts[req.user.id] || (db.data.carts[req.user.id] = []);
  const item = cart.find((it) => it.productId === productId);
  const newQty = (item ? item.qty : 0) + n;
  if (newQty > product.stock) {
    return res.status(400).json({ message: `库存不足，当前仅剩 ${product.stock} 件` });
  }
  if (newQty > MAX_QTY_PER_ITEM) {
    return res.status(400).json({ message: `每件商品最多购买 ${MAX_QTY_PER_ITEM} 件` });
  }
  if (item) item.qty = newQty;
  else cart.push({ productId, qty: n });
  await db.write();

  res.json(cartView(req.user.id));
});

// 修改数量（qty=0 表示移除）
router.put('/cart/:productId', auth, async (req, res) => {
  const { qty } = req.body || {};
  const n = Number(qty);
  if (!Number.isInteger(n) || n < 0 || n > MAX_QTY_PER_ITEM) {
    return res.status(400).json({ message: `数量需为 0-${MAX_QTY_PER_ITEM} 的整数` });
  }

  const cart = db.data.carts[req.user.id] || [];
  const item = cart.find((it) => it.productId === req.params.productId);
  if (!item) return res.status(404).json({ message: '购物车中没有该商品' });

  const product = db.data.products.find((x) => x.id === item.productId);
  if (n > 0 && product && n > product.stock) {
    return res.status(400).json({ message: `库存不足，当前仅剩 ${product.stock} 件` });
  }

  if (n === 0) {
    db.data.carts[req.user.id] = cart.filter((it) => it !== item);
  } else {
    item.qty = n;
  }
  await db.write();
  res.json(cartView(req.user.id));
});

router.delete('/cart/:productId', auth, async (req, res) => {
  const cart = db.data.carts[req.user.id] || [];
  db.data.carts[req.user.id] = cart.filter((it) => it.productId !== req.params.productId);
  await db.write();
  res.json(cartView(req.user.id));
});

router.delete('/cart', auth, async (req, res) => {
  db.data.carts[req.user.id] = [];
  await db.write();
  res.json(cartView(req.user.id));
});

export default router;
