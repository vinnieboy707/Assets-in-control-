import React, { useState } from 'react';
import { walletAPI } from '../services/api';

function AddWalletModal({ onClose, onWalletAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'ethereum',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await walletAPI.create(formData);
      onWalletAdded(response.data.wallet);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>💰 Add New Wallet</h2>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Wallet Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="My Awesome Crypto Wallet"
              required
            />
          </div>

          <div className="input-group">
            <label>Wallet Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="0x..."
              required
            />
          </div>

          <div className="input-group">
            <label>Wallet Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="ethereum">🔷 Ethereum</option>
              <option value="bitcoin">₿ Bitcoin</option>
              <option value="binance">🟡 Binance Smart Chain</option>
              <option value="polygon">🟣 Polygon</option>
              <option value="solana">🌊 Solana</option>
              <option value="cardano">🔵 Cardano</option>
            </select>
          </div>

          <div className="input-group">
            <label>Location / Exchange (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Coinbase, Binance, MetaMask, Ledger"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Adding... ⏳' : 'Add Wallet 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWalletModal;
