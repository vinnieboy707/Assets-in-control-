import React, { useState, useEffect } from 'react';
import { stakingAPI } from '../services/api';

function StakingDashboard() {
  const [stakedAssets, setStakedAssets] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
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
    if (window.confirm('Are you sure you want to unstake this asset?')) {
      try {
        await stakingAPI.unstake(id);
        loadData();
      } catch (err) {
        alert('Failed to unstake asset');
      }
    }
  };

  const calculateTotalValue = () => {
    return summary.reduce((total, item) => total + (item.total_amount || 0), 0);
  };

  if (loading) {
    return <div className="loading">Loading staking data...</div>;
  }

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="label">Total Staked</div>
          <div className="value">{summary.length}</div>
          <div className="label">Cryptocurrencies</div>
        </div>
        <div className="summary-card">
          <div className="label">Total Value</div>
          <div className="value">${calculateTotalValue().toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Active Stakes</div>
          <div className="value">{stakedAssets.filter(a => a.status === 'active').length}</div>
        </div>
      </div>

      <div className="card">
        <h2>Staked Assets</h2>
        {stakedAssets.length === 0 ? (
          <div className="empty-state">
            <p>No staked assets found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Cryptocurrency</th>
                <th>Amount</th>
                <th>APY</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stakedAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.wallet_name}</td>
                  <td>{asset.cryptocurrency}</td>
                  <td>{asset.amount}</td>
                  <td>{asset.apy}%</td>
                  <td>
                    <span className={`badge ${asset.status}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    {asset.status === 'active' && (
                      <button 
                        className="button danger" 
                        onClick={() => handleUnstake(asset.id)}
                      >
                        Unstake
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Staking Summary by Cryptocurrency</h2>
        {summary.length === 0 ? (
          <div className="empty-state">
            <p>No staking summary available</p>
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
                  <td>{item.cryptocurrency}</td>
                  <td>{item.total_amount}</td>
                  <td>{item.count}</td>
                  <td>{item.avg_apy?.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StakingDashboard;
