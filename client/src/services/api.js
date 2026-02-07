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
  updateDeadline: (id, deadline) => api.put(`/staking/${id}/deadline`, { unstake_deadline: deadline }),
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

// Airdrop API
export const airdropAPI = {
  getAll: () => api.get('/airdrops'),
  getByWallet: (walletId) => api.get(`/airdrops/wallet/${walletId}`),
  getUpcoming: () => api.get('/airdrops/upcoming'),
  create: (data) => api.post('/airdrops', data),
  claim: (id, amount) => api.put(`/airdrops/${id}/claim`, { amount }),
  update: (id, data) => api.put(`/airdrops/${id}`, data),
  delete: (id) => api.delete(`/airdrops/${id}`),
};

export default api;
