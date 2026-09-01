import { Router } from 'express';
import { db } from '../db.js';
import { auth } from '../auth.js';

const router = Router();

/**
 * 商品列表。当前读取本地 db（种子虚拟商品）。
 * 后期对接外部商品 API 时，只需把这里的取数逻辑替换为远程请求并做字段映射。
 */
router.get('/products', (req, res) => {
  const list = db.data.products.map((p) => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    description: p.description,
    price: p.price,
    stock: p.stock,
    onSale: p.onSale !== false,
  }));
  res.json({ list });
});

router.get('/products/:id', (req, res) => {
  const p = db.data.products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: '商品不存在' });
  res.json({
    product: {
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      description: p.description,
      price: p.price,
      stock: p.stock,
      onSale: p.onSale !== false,
    },
  });
});

export default router;
