import React, { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';

function WalletList({ onWalletSelect, refreshTrigger }) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
