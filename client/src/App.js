import React, { useState } from 'react';
import './styles/ModernTheme.css';
import WalletList from './components/WalletList';
import AddWalletModal from './components/AddWalletModal';
import EnhancedStakingDashboard from './components/EnhancedStakingDashboard';
import TransactionsPanel from './components/TransactionsPanel';
import AirdropsPanel from './components/AirdropsPanel';

function App() {
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [activeTab, setActiveTab] = useState('wallets');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWalletAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleWalletSelect = (wallet) => {
    console.log('Selected wallet:', wallet);
    // Future: Navigate to wallet details
  };

  return (
    <div className="App">
      <div className="header">
        <div className="container">
          <h1>Assets in Control</h1>
          <p>Manage all your cryptocurrency wallets and staked assets in one awesome place ✨</p>
        </div>
      </div>

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'wallets' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallets')}
          >
            💰 Wallets
          </button>
          <button 
            className={`tab ${activeTab === 'staking' ? 'active' : ''}`}
            onClick={() => setActiveTab('staking')}
          >
            🏦 Staking
          </button>
          <button 
            className={`tab ${activeTab === 'airdrops' ? 'active' : ''}`}
            onClick={() => setActiveTab('airdrops')}
          >
            🎁 Airdrops
          </button>
          <button 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            💸 Transactions
          </button>
        </div>

        {activeTab === 'wallets' && (
          <div>
            <div className="card" style={{'--index': 0}}>
              <h2>💼 Your Wallets</h2>
              <button className="button" onClick={() => setShowAddWallet(true)}>
                + Add New Wallet 🚀
              </button>
            </div>
            <WalletList 
              onWalletSelect={handleWalletSelect} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {activeTab === 'staking' && <EnhancedStakingDashboard />}
        
        {activeTab === 'airdrops' && <AirdropsPanel />}
        
        {activeTab === 'transactions' && <TransactionsPanel />}

        {showAddWallet && (
          <AddWalletModal 
            onClose={() => setShowAddWallet(false)}
            onWalletAdded={handleWalletAdded}
          />
        )}
      </div>
    </div>
  );
}

export default App;
