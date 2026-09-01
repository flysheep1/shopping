import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_secret_change_me';
if (!process.env.JWT_SECRET) {
  console.warn('[warn] 未设置 JWT_SECRET 环境变量，当前使用开发默认密钥，请勿用于生产');
}
export { JWT_SECRET };

export const TOKEN_EXPIRES_IN = '7d';

export function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export function auth(req, res, next) {
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

/**
 * 简单内存限流：同一 key 在 windowMs 内最多 maxCount 次
 * （demo 够用；多实例部署需换 Redis 等共享存储）
 */
export function rateLimit({ windowMs = 60_000, maxCount = 10, keyFn }) {
  const hits = new Map();
  // 定期清理，防止内存无限增长
  setInterval(() => {
    const now = Date.now();
    for (const [k, { ts }] of hits) {
      if (now - ts > windowMs) hits.delete(k);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const rec = hits.get(key);
    if (!rec || now - rec.ts > windowMs) {
      hits.set(key, { ts: now, count: 1 });
      return next();
    }
    rec.count += 1;
    if (rec.count > maxCount) {
      return res.status(429).json({ message: '请求过于频繁，请稍后再试' });
    }
    next();
  };
}
