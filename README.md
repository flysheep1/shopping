# 购物商城 - 登录注册 & 个人中心 Demo

技术栈：Vue 3 + Vite + Pinia + Vue Router + Axios（前端） / Node.js + Express + JWT + lowdb（后端）。

## 目录结构

```
shopping/
├── backend/              # Express 后端
│   ├── server.js         # 入口（路由 + JWT 鉴权 + 积分接口）
│   ├── package.json
│   └── db.json           # 运行后自动生成的本地数据
└── frontend/             # Vue 3 前端
    ├── index.html
    ├── vite.config.js    # 已配置 /api 代理到后端 3000
    ├── package.json
    └── src/
        ├── api/          # axios 封装 + 接口
        ├── stores/       # Pinia 用户状态
        ├── router/       # 路由 + 鉴权守卫
        ├── views/        # Login / Register / Profile
        ├── App.vue       # 顶部导航（右上角显示积分）
        └── main.js
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

**2) 启动前端**

```bash
cd frontend
npm install
npm run dev
# 打开 http://localhost:5173
```

## 功能说明

- **注册**：`/register`，注册成功即送 100 积分，自动登录并跳转个人中心。
- **登录**：`/login`，登录后跳转个人中心。
- **个人中心**：`/profile`，右上角顶栏始终显示当前用户积分徽章，左侧积分卡支持签到 +10、任务 +50、兑换 -100，右侧展示用户基本信息。
- **鉴权**：JWT 存 localStorage，axios 拦截器自动附带 Authorization；401 自动跳回登录页；路由守卫拦截未登录访问。
- **数据存储**：后端使用 lowdb 写入 `backend/db.json`，重启数据保留。

## 后端接口一览

| 方法 | 路径             | 说明                | 鉴权 |
|------|------------------|---------------------|------|
| POST | /api/register    | 注册（送 100 积分） | 否   |
| POST | /api/login       | 登录                | 否   |
| GET  | /api/profile     | 获取当前用户信息    | 是   |
| POST | /api/points/add  | 增减积分 { amount } | 是   |
