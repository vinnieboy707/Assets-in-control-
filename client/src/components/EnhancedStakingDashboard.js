import React, { useState, useEffect } from 'react';
import { stakingAPI } from '../services/api';

function EnhancedStakingDashboard() {
  const [stakedAssets, setStakedAssets] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => {
    loadData();
    // Refresh data every 30 seconds to update countdowns
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [assetsRes, summaryRes] = await Promise.all([
        stakingAPI.getAll(),
        stakingAPI.getSummary()
      ]);
      setStakedAssets(assetsRes.data.staked_assets);
      setSummary(summaryRes.data.summary);
    } catch (err) {
      console.error('Failed to load staking data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async (id) => {
    if (window.confirm('Are you sure you want to unstake this asset? 🤔')) {
      try {
        await stakingAPI.unstake(id);
        loadData();
        celebrateAction('Unstaking initiated! 🎉');
      } catch (err) {
        alert('Failed to unstake asset 😢');
      }
    }
  };

  const handleUpdateDeadline = async (id) => {
    if (!newDeadline) return;
    
    try {
      await stakingAPI.updateDeadline(id, newDeadline);
      setEditingDeadline(null);
      setNewDeadline('');
      loadData();
      celebrateAction('Deadline updated! ✨');
    } catch (err) {
      alert('Failed to update deadline 😢');
    }
  };

  const celebrateAction = (message) => {
    const celebration = document.createElement('div');
    celebration.className = 'celebration-toast';
    celebration.textContent = message;
    celebration.style.cssText = `
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
    document.body.appendChild(celebration);
    setTimeout(() => celebration.remove(), 3000);
  };

  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff < 0) return { expired: true, text: 'Expired ⏰' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { 
        urgent: days < 3, 
        text: `${days}d ${hours}h remaining ⏳` 
      };
    } else if (hours > 0) {
      return { 
        urgent: true, 
        text: `${hours}h ${minutes}m remaining ⚡` 
      };
    } else {
      return { 
        urgent: true, 
        text: `${minutes}m remaining 🔥` 
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalValue = () => {
    return summary.reduce((total, item) => total + (item.total_amount || 0), 0);
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      'active': '🟢',
      'unstaking': '🟡',
      'completed': '✅',
      'pending': '⏳'
    };
    return emojis[status] || '⚪';
  };

  if (loading) {
    return (
      <div className="loading">
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏳</div>
        Loading your awesome staking data...
      </div>
    );
  }

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-card" style={{'--index': 0}}>
          <div className="label">💎 Total Staked</div>
          <div className="value">{summary.length}</div>
          <div className="label">Cryptocurrencies</div>
        </div>
        <div className="summary-card" style={{'--index': 1}}>
          <div className="label">💰 Total Value</div>
          <div className="value">${calculateTotalValue().toFixed(2)}</div>
        </div>
        <div className="summary-card" style={{'--index': 2}}>
          <div className="label">🔥 Active Stakes</div>
          <div className="value">{stakedAssets.filter(a => a.status === 'active').length}</div>
        </div>
      </div>

      <div className="card" style={{'--index': 0}}>
        <h2>🏦 Staked Assets</h2>
        {stakedAssets.length === 0 ? (
          <div className="empty-state">
            <p>No staked assets found! Time to start staking? 🚀</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Wallet</th>
                  <th>Crypto</th>
                  <th>Amount</th>
                  <th>APY</th>
                  <th>Staked At</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stakedAssets.map((asset, index) => {
                  const timeRemaining = calculateTimeRemaining(asset.unstake_deadline);
                  return (
                    <tr key={asset.id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <td>
                        <strong>{asset.wallet_name}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '1.2rem' }}>
                          {asset.cryptocurrency}
                        </span>
                      </td>
                      <td>
                        <strong>{asset.amount}</strong>
                      </td>
                      <td>
                        <span className="badge success" style={{ fontSize: '0.9rem' }}>
                          {asset.apy}% 📈
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {formatDate(asset.staked_at)}
                        </div>
                      </td>
                      <td>
                        {editingDeadline === asset.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="datetime-local"
                              value={newDeadline}
                              onChange={(e) => setNewDeadline(e.target.value)}
                              style={{ 
                                padding: '6px',
                                borderRadius: '6px',
                                border: '2px solid var(--primary)',
                                fontSize: '0.85rem'
                              }}
                            />
                            <button
                              className="button success"
                              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                              onClick={() => handleUpdateDeadline(asset.id)}
                            >
                              ✓
                            </button>
                            <button
                              className="button secondary"
                              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                              onClick={() => {
                                setEditingDeadline(null);
                                setNewDeadline('');
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                              {formatDate(asset.unstake_deadline)}
                            </div>
                            {timeRemaining && (
                              <div className={`countdown ${timeRemaining.urgent ? 'urgent' : ''}`}>
                                {timeRemaining.text}
                              </div>
                            )}
                            <button
                              className="button secondary"
                              style={{ 
                                padding: '4px 10px', 
                                fontSize: '0.75rem',
                                marginTop: '6px'
                              }}
                              onClick={() => {
                                setEditingDeadline(asset.id);
                                setNewDeadline(asset.unstake_deadline ? 
                                  new Date(asset.unstake_deadline).toISOString().slice(0, 16) : 
                                  new Date().toISOString().slice(0, 16)
                                );
                              }}
                            >
                              📅 Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${asset.status}`}>
                          {getStatusEmoji(asset.status)} {asset.status}
                        </span>
                      </td>
                      <td>
                        {asset.status === 'active' && (
                          <button 
                            className="button danger" 
                            onClick={() => handleUnstake(asset.id)}
                            style={{ fontSize: '0.9rem' }}
                          >
                            Unstake 💸
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{'--index': 1}}>
        <h2>📊 Staking Summary by Cryptocurrency</h2>
        {summary.length === 0 ? (
          <div className="empty-state">
            <p>No staking summary available 📭</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Cryptocurrency</th>
                <th>Total Amount</th>
                <th>Count</th>
                <th>Average APY</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong style={{ fontSize: '1.1rem' }}>
                      {item.cryptocurrency}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                      {item.total_amount}
                    </span>
                  </td>
                  <td>{item.count}</td>
                  <td>
                    <span className="badge success">
                      {item.avg_apy?.toFixed(2)}% 📈
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EnhancedStakingDashboard;
