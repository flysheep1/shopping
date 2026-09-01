import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, findUserById } from '../db.js';
import { auth } from '../auth.js';
import { publicUser } from './auth.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/profile', auth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  res.json({ user: publicUser(user) });
});

// 修改昵称 / 邮箱
router.patch('/profile', auth, async (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  const { nickname, email } = req.body || {};
  if (nickname !== undefined) {
    const n = String(nickname).trim();
    if (!n) return res.status(400).json({ message: '昵称不能为空' });
    if (n.length > 20) return res.status(400).json({ message: '昵称最多 20 个字符' });
    user.nickname = n;
  }
  if (email !== undefined) {
    const e = String(email).trim();
    if (e && !EMAIL_RE.test(e)) {
      return res.status(400).json({ message: '邮箱格式不正确' });
    }
    user.email = e;
  }
  await db.write();
  res.json({ user: publicUser(user) });
});

// 修改密码
router.post('/profile/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: '原密码和新密码必填' });
  }
  if (newPassword.length < 6 || newPassword.length > 72) {
    return res.status(400).json({ message: '新密码长度需为 6-72 位' });
  }

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) return res.status(401).json({ message: '原密码错误' });

  user.password = await bcrypt.hash(newPassword, 10);
  await db.write();
  res.json({ message: '密码修改成功' });
});

export default router;
