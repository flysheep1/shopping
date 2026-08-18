import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JSONFilePreset } from 'lowdb/node';

const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'shopping_demo_secret_change_me';
const TOKEN_EXPIRES_IN = '7d';

const defaultData = { users: [] };
const db = await JSONFilePreset('db.json', defaultData);
await db.read();

const app = express();
app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: '未登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'token 无效或已过期' });
  }
}

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    nickname: u.nickname,
    email: u.email,
    points: u.points,
    createdAt: u.createdAt,
  };
}

app.post('/api/register', async (req, res) => {
  const { username, password, nickname, email } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码必填' });
  }
  const exists = db.data.users.find((u) => u.username === username);
  if (exists) return res.status(409).json({ message: '用户名已存在' });

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    username,
    password: hashed,
    nickname: nickname || username,
    email: email || '',
    points: 100,
    createdAt: new Date().toISOString(),
  };
  db.data.users.push(user);
  await db.write();

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
  res.json({ token, user: publicUser(user) });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码必填' });
  }
  const user = db.data.users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: '密码错误' });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
  res.json({ token, user: publicUser(user) });
});

app.get('/api/profile', auth, (req, res) => {
  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  res.json({ user: publicUser(user) });
});

app.post('/api/points/add', auth, async (req, res) => {
  const { amount } = req.body || {};
  const n = Number(amount);
  if (!Number.isFinite(n)) return res.status(400).json({ message: 'amount 必须是数字' });

  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  user.points = Math.max(0, user.points + n);
  await db.write();
  res.json({ user: publicUser(user) });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
