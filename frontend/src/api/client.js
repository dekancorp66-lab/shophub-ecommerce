import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect
    }
    return Promise.reject(err);
  }
);

export default client;

// Auth
export const login = (email, password) =>
  client.post('/auth/login/json', { email, password }).then((r) => r.data);

export const register = (data) =>
  client.post('/auth/register', data).then((r) => r.data);

export const getMe = () => client.get('/auth/me').then((r) => r.data);

// Products
export const getProducts = (params) =>
  client.get('/products', { params }).then((r) => r.data);

export const getFeatured = () =>
  client.get('/products/featured').then((r) => r.data);

export const getProduct = (slugOrId) =>
  client.get(`/products/${slugOrId}`).then((r) => r.data);

export const getRelated = (id) =>
  client.get(`/products/${id}/related`).then((r) => r.data);

// Categories
export const getCategories = () =>
  client.get('/categories').then((r) => r.data);

// Cart
export const getCart = () => client.get('/cart').then((r) => r.data);
export const addToCart = (product_id, quantity = 1) =>
  client.post('/cart/items', { product_id, quantity }).then((r) => r.data);
export const updateCartItem = (itemId, quantity) =>
  client.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data);
export const removeCartItem = (itemId) =>
  client.delete(`/cart/items/${itemId}`).then((r) => r.data);
export const clearCart = () => client.delete('/cart').then((r) => r.data);

// Orders
export const checkout = (data) =>
  client.post('/orders/checkout', data).then((r) => r.data);
export const getMyOrders = (params) =>
  client.get('/orders', { params }).then((r) => r.data);
export const getOrder = (id) =>
  client.get(`/orders/${id}`).then((r) => r.data);

// Admin
export const adminGetProducts = (params) =>
  client.get('/admin/products', { params }).then((r) => r.data);
export const adminCreateProduct = (data) =>
  client.post('/admin/products', data).then((r) => r.data);
export const adminUpdateProduct = (id, data) =>
  client.patch(`/admin/products/${id}`, data).then((r) => r.data);
export const adminDeleteProduct = (id) =>
  client.delete(`/admin/products/${id}`).then((r) => r.data);
export const adminGetOrders = (params) =>
  client.get('/admin/orders', { params }).then((r) => r.data);
export const adminUpdateOrderStatus = (id, status) =>
  client.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data);
export const adminGetCategories = () =>
  client.get('/admin/categories').then((r) => r.data);
export const adminCreateCategory = (data) =>
  client.post('/admin/categories', data).then((r) => r.data);
