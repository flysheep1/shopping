import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || '请求失败';
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        // 记录当前页（去掉 base 前缀，与路由 fullPath 一致），登录后回跳
        const base = import.meta.env.BASE_URL || '/';
        const relPath = location.pathname.startsWith(base)
          ? location.pathname.slice(base.endsWith('/') ? base.length - 1 : base.length)
          : location.pathname;
        location.href = `${base}login?redirect=${encodeURIComponent(relPath + location.search)}`;
      }
    }
    return Promise.reject(new Error(msg));
  }
);

export default http;
