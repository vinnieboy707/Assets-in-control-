import React, { useState, useEffect } from 'react';
import { airdropAPI, walletAPI } from '../services/api';

function AirdropsPanel() {
  const [airdrops, setAirdrops] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    wallet_id: '',
    name: '',
    cryptocurrency: '',
    amount: '',
    eligibility_criteria: '',
    claim_deadline: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [airdropsRes, walletsRes] = await Promise.all([
        airdropAPI.getAll(),
        walletAPI.getAll()
      ]);
      setAirdrops(airdropsRes.data.airdrops);
      setWallets(walletsRes.data.wallets);
    } catch (err) {
      console.error('Failed to load airdrops data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await airdropAPI.create(formData);
      setShowAddModal(false);
      setFormData({
        wallet_id: '',
        name: '',
        cryptocurrency: '',
        amount: '',
        eligibility_criteria: '',
        claim_deadline: ''
      });
      loadData();
      showCelebration('Airdrop tracked! 🎁');
    } catch (err) {
      alert('Failed to add airdrop 😢');
    }
  };

  const handleClaim = async (id, amount) => {
    const claimAmount = prompt('Enter the amount you received:', amount || '0');
    if (claimAmount === null) return;
    
    try {
      await airdropAPI.claim(id, parseFloat(claimAmount));
      loadData();
      showCelebration('Airdrop claimed! 🎉💰');
    } catch (err) {
      alert('Failed to claim airdrop 😢');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this airdrop? 🗑️')) {
      try {
        await airdropAPI.delete(id);
        loadData();
      } catch (err) {
        alert('Failed to delete airdrop 😢');
      }
    }
  };

  const showCelebration = (message) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
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

  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff < 0) return { expired: true, text: 'Expired ⏰' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 7) {
      return { urgent: false, text: `${days} days left ✨` };
    } else if (days > 0) {
      return { urgent: true, text: `${days}d ${hours}h left ⚡` };
    } else {
      return { urgent: true, text: `${hours}h left 🔥` };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const getStatusEmoji = (status, claimed) => {
    if (claimed) return '✅';
    if (status === 'pending') return '⏳';
    return '🎁';
  };

  const upcomingAirdrops = airdrops.filter(a => !a.claimed);
  const claimedAirdrops = airdrops.filter(a => a.claimed);
  const totalClaimed = claimedAirdrops.reduce((sum, a) => sum + (a.amount || 0), 0);

  if (loading) {
    return <div className="loading">Loading airdrops... 🎁</div>;
  }

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-card" style={{'--index': 0}}>
          <div className="label">🎁 Total Airdrops</div>
          <div className="value">{airdrops.length}</div>
        </div>
        <div className="summary-card" style={{'--index': 1}}>
          <div className="label">⏳ Pending</div>
          <div className="value">{upcomingAirdrops.length}</div>
        </div>
        <div className="summary-card" style={{'--index': 2}}>
          <div className="label">✅ Claimed</div>
          <div className="value">{claimedAirdrops.length}</div>
        </div>
        <div className="summary-card" style={{'--index': 3}}>
          <div className="label">💰 Total Claimed Value</div>
          <div className="value">${totalClaimed.toFixed(2)}</div>
        </div>
      </div>

      <div className="card" style={{'--index': 0}}>
        <h2>🎁 Airdrop Tracker</h2>
        <button className="button" onClick={() => setShowAddModal(true)}>
          + Track New Airdrop 🎯
        </button>
      </div>

      {upcomingAirdrops.length > 0 && (
        <div className="card" style={{'--index': 1}}>
          <h2>⏳ Upcoming Airdrops</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Wallet</th>
                  <th>Crypto</th>
                  <th>Eligibility</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAirdrops.map((airdrop) => {
                  const timeRemaining = calculateTimeRemaining(airdrop.claim_deadline);
                  return (
                    <tr key={airdrop.id}>
                      <td>
                        <strong style={{ fontSize: '1.1rem' }}>
                          {getStatusEmoji(airdrop.status, airdrop.claimed)} {airdrop.name}
                        </strong>
                      </td>
                      <td>{airdrop.wallet_name}</td>
                      <td>
                        <span className="badge active">
                          {airdrop.cryptocurrency}
                        </span>
                      </td>
                      <td>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          maxWidth: '200px',
                          color: 'var(--text-secondary)'
                        }}>
                          {airdrop.eligibility_criteria || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>
                          {formatDate(airdrop.claim_deadline)}
                        </div>
                        {timeRemaining && (
                          <div className={`countdown ${timeRemaining.urgent ? 'urgent' : ''}`}>
                            {timeRemaining.text}
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          className="button success"
                          onClick={() => handleClaim(airdrop.id, airdrop.amount)}
                          style={{ fontSize: '0.9rem' }}
                        >
                          Claim 💰
                        </button>
                        <button
                          className="button danger"
                          onClick={() => handleDelete(airdrop.id)}
                          style={{ fontSize: '0.9rem' }}
                        >
                          Delete 🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {claimedAirdrops.length > 0 && (
        <div className="card" style={{'--index': 2}}>
          <h2>✅ Claimed Airdrops</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Wallet</th>
                  <th>Crypto</th>
                  <th>Amount</th>
                  <th>Claimed At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claimedAirdrops.map((airdrop) => (
                  <tr key={airdrop.id}>
                    <td>
                      <strong>✅ {airdrop.name}</strong>
                    </td>
                    <td>{airdrop.wallet_name}</td>
                    <td>
                      <span className="badge success">
                        {airdrop.cryptocurrency}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>
                        ${airdrop.amount?.toFixed(2) || '0.00'}
                      </strong>
                    </td>
                    <td>{formatDate(airdrop.claimed_at)}</td>
                    <td>
                      <button
                        className="button danger"
                        onClick={() => handleDelete(airdrop.id)}
                        style={{ fontSize: '0.85rem' }}
                      >
                        Delete 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {airdrops.length === 0 && (
        <div className="empty-state">
          <p>No airdrops tracked yet! Start tracking to never miss free crypto! 🎁</p>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎁 Track New Airdrop</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Airdrop Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Optimism Retroactive Airdrop"
                  required
                />
              </div>

              <div className="input-group">
                <label>Select Wallet *</label>
                <select
                  value={formData.wallet_id}
                  onChange={(e) => setFormData({...formData, wallet_id: e.target.value})}
                  required
                >
                  <option value="">Choose a wallet...</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} ({wallet.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Cryptocurrency *</label>
                <input
                  type="text"
                  value={formData.cryptocurrency}
                  onChange={(e) => setFormData({...formData, cryptocurrency: e.target.value})}
                  placeholder="e.g., OP, ARB, UNI"
                  required
                />
              </div>

              <div className="input-group">
                <label>Expected Amount (optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="input-group">
                <label>Eligibility Criteria</label>
                <textarea
                  value={formData.eligibility_criteria}
                  onChange={(e) => setFormData({...formData, eligibility_criteria: e.target.value})}
                  placeholder="e.g., Used bridge before snapshot date"
                  rows="3"
                />
              </div>

              <div className="input-group">
                <label>Claim Deadline</label>
                <input
                  type="datetime-local"
                  value={formData.claim_deadline}
                  onChange={(e) => setFormData({...formData, claim_deadline: e.target.value})}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="button secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button">
                  Track Airdrop 🎯
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AirdropsPanel;
