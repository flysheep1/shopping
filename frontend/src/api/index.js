import http from './http';

// —— 认证 ——
export const register = (data) => http.post('/register', data);
export const login = (data) => http.post('/login', data);
export const getProfile = () => http.get('/profile');
export const updateProfile = (data) => http.patch('/profile', data);
export const changePassword = (data) => http.post('/profile/password', data);

// —— 积分 ——
export const getPointsStatus = () => http.get('/points/status');
export const checkin = () => http.post('/points/checkin');
export const doTask = () => http.post('/points/task');
export const getPointsLog = () => http.get('/points/log');

// —— 商品 ——
export const getProducts = () => http.get('/products');

// —— 购物车 ——
export const getCart = () => http.get('/cart');
export const addToCart = (productId, qty = 1) => http.post('/cart', { productId, qty });
export const updateCartQty = (productId, qty) => http.put(`/cart/${productId}`, { qty });
export const removeFromCart = (productId) => http.delete(`/cart/${productId}`);
export const clearCart = () => http.delete('/cart');

// —— 订单 ——
export const checkout = () => http.post('/orders/checkout');
export const getOrders = () => http.get('/orders');
export const getOrder = (id) => http.get(`/orders/${id}`);
