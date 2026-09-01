import { Router } from 'express';
import { db, findUserById, addPointsLog, todayStr, yesterdayStr } from '../db.js';
import { auth } from '../auth.js';
import { publicUser } from './auth.js';

const router = Router();

const CHECKIN_BASE = 10;      // 每日签到基础分
const STREAK_BONUS = 20;      // 连续签到每满 7 天额外奖励
const STREAK_CYCLE = 7;
const TASK_REWARD = 50;       // 每日任务奖励

/** 签到/任务状态，前端据此禁用按钮 */
router.get('/points/status', auth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  const today = todayStr();
  res.json({
    canCheckin: user.lastCheckinDate !== today,
    checkinStreak: user.checkinStreak || 0,
    canDoTask: user.lastTaskDate !== today,
    rules: {
      checkinBase: CHECKIN_BASE,
      streakBonus: STREAK_BONUS,
      streakCycle: STREAK_CYCLE,
      taskReward: TASK_REWARD,
    },
  });
});

// 每日签到（后端限制每天一次，连续签到有额外奖励）
router.post('/points/checkin', auth, async (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  const today = todayStr();
  if (user.lastCheckinDate === today) {
    return res.status(409).json({ message: '今日已签到，明天再来吧' });
  }

  const streak = user.lastCheckinDate === yesterdayStr() ? (user.checkinStreak || 0) + 1 : 1;
  let gained = CHECKIN_BASE;
  const notes = [`每日签到 +${CHECKIN_BASE}`];
  if (streak % STREAK_CYCLE === 0) {
    gained += STREAK_BONUS;
    notes.push(`连续签到 ${streak} 天额外 +${STREAK_BONUS}`);
  }

  user.lastCheckinDate = today;
  user.checkinStreak = streak;
  user.points += gained;
  addPointsLog(user, gained, 'checkin', notes.join('，'));
  await db.write();

  res.json({ user: publicUser(user), gained, streak });
});

// 每日任务（每天一次）
router.post('/points/task', auth, async (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  const today = todayStr();
  if (user.lastTaskDate === today) {
    return res.status(409).json({ message: '今日任务已完成' });
  }

  user.lastTaskDate = today;
  user.points += TASK_REWARD;
  addPointsLog(user, TASK_REWARD, 'task', '完成每日任务');
  await db.write();

  res.json({ user: publicUser(user), gained: TASK_REWARD });
});

// 积分明细（当前用户，时间倒序）
router.get('/points/log', auth, (req, res) => {
  const list = db.data.pointsLog
    .filter((l) => l.userId === req.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ list });
});

export default router;
