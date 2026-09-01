import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, newId, addPointsLog } from '../db.js';
import { signToken, rateLimit } from '../auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60_000,
  maxCount: 10,
  keyFn: (req) => `login:${req.ip}:${req.body?.username || ''}`,
});

const registerLimiter = rateLimit({
  windowMs: 60_000,
  maxCount: 5,
  keyFn: (req) => `register:${req.ip}`,
});

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

router.post('/register', registerLimiter, async (req, res) => {
  const { username, password, nickname, email } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码必填' });
  }
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ message: '用户名需为 3-20 位字母、数字或下划线' });
  }
  if (password.length < 6 || password.length > 72) {
    return res.status(400).json({ message: '密码长度需为 6-72 位' });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: '邮箱格式不正确' });
  }

  const exists = db.data.users.find((u) => u.username === username);
  if (exists) return res.status(409).json({ message: '用户名已存在' });

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: newId(),
    username,
    password: hashed,
    nickname: (nickname || '').trim() || username,
    email: email || '',
    points: 100,
    lastCheckinDate: null,
    checkinStreak: 0,
    lastTaskDate: null,
    createdAt: new Date().toISOString(),
  };
  db.data.users.push(user);
  addPointsLog(user, 10000, 'register', '注册赠送');
  await db.write();

  res.json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码必填' });
  }
  const user = db.data.users.find((u) => u.username === username);
  const ok = user && (await bcrypt.compare(password, user.password));
  // 统一错误信息，避免账号枚举
  if (!ok) return res.status(401).json({ message: '用户名或密码错误' });

  res.json({ token: signToken(user), user: publicUser(user) });
});

export { publicUser };
export default router;
