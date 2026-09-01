import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth.js';
import profileRoutes from './src/routes/profile.js';
import pointsRoutes from './src/routes/points.js';
import productRoutes from './src/routes/products.js';
import cartRoutes from './src/routes/cart.js';
import orderRoutes from './src/routes/orders.js';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);       // 注册 / 登录
app.use('/api', profileRoutes);    // 资料查看 / 修改
app.use('/api', pointsRoutes);     // 签到 / 任务 / 明细
app.use('/api', productRoutes);    // 商品列表
app.use('/api', cartRoutes);       // 购物车
app.use('/api', orderRoutes);      // 下单 / 订单

// 统一 404
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
