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
        location.href = '/login';
      }
    }
    return Promise.reject(new Error(msg));
  }
);

export default http;
