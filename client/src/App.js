import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import './styles/ModernTheme.css';
import WalletList from './components/WalletList';
import AddWalletModal from './components/AddWalletModal';
import EnhancedStakingDashboard from './components/EnhancedStakingDashboard';
import TransactionsPanel from './components/TransactionsPanel';
import AirdropsPanel from './components/AirdropsPanel';
import PortfolioAnalytics from './components/PortfolioAnalytics';
import LanguageSwitcher from './components/LanguageSwitcher';
import axios from 'axios';

function App() {
  const { t } = useTranslation();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [activeTab, setActiveTab] = useState('wallets');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [stakingData, setStakingData] = useState([]);

  useEffect(() => {
    fetchWallets();
    fetchStakingData();
  }, [refreshTrigger]);

  const fetchWallets = async () => {
    try {
      const response = await axios.get('/api/wallets');
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const fetchStakingData = async () => {
    try {
      const response = await axios.get('/api/staking');
      setStakingData(response.data);
    } catch (error) {
      console.error('Error fetching staking data:', error);
    }
  };

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
          <div className="header-content">
            <div className="header-text">
              <h1>{t('app.title')}</h1>
              <p>{t('app.subtitle')}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'wallets' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallets')}
          >
            {t('nav.wallets')}
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={`tab ${activeTab === 'staking' ? 'active' : ''}`}
            onClick={() => setActiveTab('staking')}
          >
            {t('nav.staking')}
          </button>
          <button 
            className={`tab ${activeTab === 'airdrops' ? 'active' : ''}`}
            onClick={() => setActiveTab('airdrops')}
          >
            {t('nav.airdrops')}
          </button>
          <button 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            {t('nav.transactions')}
          </button>
        </div>

        {activeTab === 'wallets' && (
          <div>
            <div className="card" style={{'--index': 0}}>
              <h2>{t('wallets.title')}</h2>
              <button className="button" onClick={() => setShowAddWallet(true)}>
                {t('wallets.addNew')}
              </button>
            </div>
            <WalletList 
              onWalletSelect={handleWalletSelect} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <PortfolioAnalytics wallets={wallets} stakingData={stakingData} />
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
