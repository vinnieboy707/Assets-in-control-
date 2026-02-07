import React, { useState, useEffect } from 'react';
import { transactionAPI, walletAPI, stakingAPI } from '../services/api';

function TransactionsPanel() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [formData, setFormData] = useState({
    wallet_id: '',
    cryptocurrency: '',
    amount: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transRes, walletRes] = await Promise.all([
        transactionAPI.getAll(),
        walletAPI.getAll()
      ]);
      setTransactions(transRes.data.transactions);
      setWallets(walletRes.data.wallets);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const handleOpenModal = (type) => {
    setTransactionType(type);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (transactionType === 'withdraw') {
        await transactionAPI.withdraw(formData);
      } else if (transactionType === 'trade') {
        await transactionAPI.trade(formData);
      } else if (transactionType === 'deposit') {
        await transactionAPI.deposit(formData);
      } else if (transactionType === 'stake') {
        await stakingAPI.stake({ ...formData, apy: 5.0 });
      }
      
      setShowModal(false);
      setFormData({ wallet_id: '', cryptocurrency: '', amount: '' });
      loadData();
      alert('Transaction submitted successfully!');
    } catch (err) {
      alert('Transaction failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="card">
        <h2>Quick Actions</h2>
        <div>
          <button className="button" onClick={() => handleOpenModal('stake')}>
            Stake Assets
          </button>
          <button className="button" onClick={() => handleOpenModal('withdraw')}>
            Withdraw
          </button>
          <button className="button" onClick={() => handleOpenModal('trade')}>
            Trade for Cash
          </button>
          <button className="button" onClick={() => handleOpenModal('deposit')}>
            Deposit
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Wallet</th>
                <th>Cryptocurrency</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td style={{ textTransform: 'capitalize' }}>{transaction.type}</td>
                  <td>{transaction.wallet_name}</td>
                  <td>{transaction.cryptocurrency}</td>
                  <td>{transaction.amount}</td>
                  <td>
                    <span className={`badge ${transaction.status === 'completed' ? 'active' : ''}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>{new Date(transaction.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Select Wallet</label>
                <select 
                  name="wallet_id" 
                  value={formData.wallet_id} 
                  onChange={handleChange}
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
                <label>Cryptocurrency</label>
                <select
                  name="cryptocurrency"
                  value={formData.cryptocurrency}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose cryptocurrency...</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                  <option value="MATIC">Polygon (MATIC)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="ADA">Cardano (ADA)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="button secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPanel;
