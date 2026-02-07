import React, { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';

function WalletList({ onWalletSelect, refreshTrigger }) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshingId, setRefreshingId] = useState(null);

  useEffect(() => {
    loadWallets();
  }, [refreshTrigger]);

  const loadWallets = async () => {
    try {
      const response = await walletAPI.getAll();
      setWallets(response.data.wallets);
      setError('');
    } catch (err) {
      setError('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBalance = async (id) => {
    setRefreshingId(id);
    try {
      await walletAPI.refreshBalance(id);
      loadWallets();
      showSuccess('Balance refreshed from blockchain! 🔄✨');
    } catch (err) {
      alert('Failed to refresh balance: ' + (err.response?.data?.error || err.message));
    } finally {
      setRefreshingId(null);
    }
  };

  const showSuccess = (message) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
      font-weight: 600;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleVerify = async (id) => {
    try {
      await walletAPI.verify(id);
      loadWallets();
    } catch (err) {
      alert('Failed to verify wallet');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      try {
        await walletAPI.delete(id);
        loadWallets();
      } catch (err) {
        alert('Failed to delete wallet');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading wallets...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (wallets.length === 0) {
    return (
      <div className="empty-state">
        <h3>No wallets connected yet 🤷</h3>
        <p>Add your first wallet to get started! 🚀</p>
      </div>
    );
  }

  return (
    <div className="wallet-list">
      {wallets.map((wallet, index) => (
        <div key={wallet.id} className="wallet-card" style={{'--index': index}}>
          <h3>{wallet.name}</h3>
          <div className="balance">${wallet.balance.toFixed(2)}</div>
          <div className="address">{wallet.address}</div>
          {wallet.location && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📍 {wallet.location}
            </div>
          )}
          <div style={{ marginTop: '10px' }}>
            <span className={`badge ${wallet.verified ? 'verified' : 'unverified'}`}>
              {wallet.verified ? '✓ Verified' : '⚠ Unverified'}
            </span>
            <span className="badge" style={{ background: '#e0e7ff', color: '#667eea' }}>
              {wallet.type}
            </span>
          </div>
          <div style={{ marginTop: '15px' }}>
            <button 
              className="button" 
              onClick={() => handleRefreshBalance(wallet.id)}
              disabled={refreshingId === wallet.id}
              style={{ 
                background: refreshingId === wallet.id ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
              }}
            >
              {refreshingId === wallet.id ? '⏳ Refreshing...' : '🔄 Refresh Balance'}
            </button>
            {!wallet.verified && (
              <button 
                className="button success" 
                onClick={() => handleVerify(wallet.id)}
              >
                Verify ✓
              </button>
            )}
            <button 
              className="button secondary" 
              onClick={() => onWalletSelect(wallet)}
            >
              Manage ⚙️
            </button>
            <button 
              className="button danger" 
              onClick={() => handleDelete(wallet.id)}
            >
              Delete 🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WalletList;
