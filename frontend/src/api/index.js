import http from './http';

export const register = (data) => http.post('/register', data);
export const login = (data) => http.post('/login', data);
export const getProfile = () => http.get('/profile');
export const addPoints = (amount) => http.post('/points/add', { amount });
