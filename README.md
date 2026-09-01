# 购物商城 - 积分商城 Demo

技术栈：Vue 3 + Vite + Pinia + Vue Router + Axios（前端） / Node.js + Express + JWT + lowdb（后端）。

## 目录结构

```
shopping/
├── backend/                  # Express 后端
│   ├── server.js             # 入口（挂载各路由模块）
│   ├── src/
│   │   ├── db.js             # lowdb 初始化 + 种子商品 + 积分流水工具
│   │   ├── auth.js           # JWT 签发/校验 + 简单限流中间件
│   │   └── routes/
│   │       ├── auth.js       # 注册 / 登录（输入校验、统一错误提示、限流）
│   │       ├── profile.js    # 资料查看 / 修改昵称邮箱 / 改密码
│   │       ├── points.js     # 每日签到 / 每日任务 / 积分明细
│   │       ├── products.js   # 商品列表（后期可替换为外部商品 API）
│   │       ├── cart.js       # 购物车增删改查
│   │       └── orders.js     # 下单结算 / 订单列表（虚拟商品自动发兑换码）
│   └── db.json               # 运行后自动生成的本地数据（含旧数据自动迁移）
└── frontend/                 # Vue 3 前端
    ├── vite.config.js        # base=/shopping/（gh-pages 用），/api 代理到后端 3000
    └── src/
        ├── api/              # axios 封装 + 全部接口
        ├── stores/           # Pinia：user（用户/积分）、cart（购物车数量）
        ├── router/           # 路由 + 鉴权守卫（支持登录后回跳原页面）
        └── views/
            ├── Shop.vue      # 积分商城（商品列表）
            ├── Cart.vue      # 购物车 + 结算
            ├── ProfileLayout.vue  # 个人中心布局（侧边栏 + 子路由）
            ├── ProfileHome.vue    # 积分卡（签到/任务）+ 基本信息
            ├── PointsLog.vue      # 积分明细
            ├── Orders.vue         # 我的订单（含兑换码）
            └── Settings.vue       # 账户设置（改资料/改密码）
```

## 启动方式

打开两个终端：

**1) 启动后端**

```bash
cd backend
npm install
npm run dev
# 监听 http://localhost:3000
```

> 生产部署请设置环境变量 `JWT_SECRET=<随机长字符串>`，否则启动时会输出警告并使用开发默认密钥。

**2) 启动前端**

```bash
cd frontend
npm install
npm run dev
# 打开 http://localhost:5173/shopping/
```

## 功能说明

- **注册/登录**：注册送 100 积分；登录错误统一提示"用户名或密码错误"（防账号枚举）；注册/登录接口带简单限流。
- **积分商城**：虚拟商品列表，购物车增删改数量（每件限 10 件、校验库存）。
- **下单结算**：服务端校验库存与积分 → 扣积分 → 减库存 → 生成订单并即时发放兑换码（不信任前端价格）。
- **我的订单**：订单列表，展开可查看每件商品的兑换码。
- **积分系统**：每日签到 +10（后端限制每天一次，连续 7 天额外 +20）、每日任务 +50（每天一次）、完整积分流水明细。
- **账户设置**：修改昵称/邮箱、修改密码。
- **鉴权**：JWT 存 localStorage，axios 拦截器自动附带；401 自动跳回登录页并记录来源，登录后回跳原页面。
- **数据存储**：lowdb 写入 `backend/db.json`，重启保留；旧版数据结构自动迁移。

## 后端接口一览

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/register | 注册（送 100 积分） | 否 |
| POST | /api/login | 登录 | 否 |
| GET | /api/profile | 获取当前用户信息 | 是 |
| PATCH | /api/profile | 修改昵称/邮箱 | 是 |
| POST | /api/profile/password | 修改密码 | 是 |
| GET | /api/points/status | 签到/任务今日状态 | 是 |
| POST | /api/points/checkin | 每日签到（每天一次，连续有奖励） | 是 |
| POST | /api/points/task | 每日任务（每天一次） | 是 |
| GET | /api/points/log | 积分明细（时间倒序） | 是 |
| GET | /api/products | 商品列表 | 否 |
| GET | /api/products/:id | 商品详情 | 否 |
| GET | /api/cart | 购物车 | 是 |
| POST | /api/cart | 加入购物车 { productId, qty } | 是 |
| PUT | /api/cart/:productId | 修改数量 { qty }（0=移除） | 是 |
| DELETE | /api/cart/:productId | 移除商品 | 是 |
| DELETE | /api/cart | 清空购物车 | 是 |
| POST | /api/orders/checkout | 下单结算（扣积分+发兑换码） | 是 |
| GET | /api/orders | 我的订单 | 是 |
| GET | /api/orders/:id | 订单详情 | 是 |
