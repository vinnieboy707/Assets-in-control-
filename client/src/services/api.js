import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Wallet API
export const walletAPI = {
  getAll: () => api.get('/wallets'),
  getById: (id) => api.get(`/wallets/${id}`),
  create: (wallet) => api.post('/wallets', wallet),
  verify: (id) => api.put(`/wallets/${id}/verify`),
  updateBalance: (id, balance) => api.put(`/wallets/${id}/balance`, { balance }),
  delete: (id) => api.delete(`/wallets/${id}`),
};

// Staking API
export const stakingAPI = {
  getAll: () => api.get('/staking'),
  getByWallet: (walletId) => api.get(`/staking/wallet/${walletId}`),
  getSummary: () => api.get('/staking/summary'),
  stake: (data) => api.post('/staking', data),
  unstake: (id) => api.put(`/staking/${id}/unstake`),
  delete: (id) => api.delete(`/staking/${id}`),
};

// Transaction API
export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  getByWallet: (walletId) => api.get(`/transactions/wallet/${walletId}`),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  trade: (data) => api.post('/transactions/trade', data),
  deposit: (data) => api.post('/transactions/deposit', data),
  updateStatus: (id, status) => api.put(`/transactions/${id}/status`, { status }),
};

export default api;
