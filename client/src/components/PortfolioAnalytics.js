import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import './PortfolioAnalytics.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function PortfolioAnalytics({ wallets, stakingData }) {
  const [portfolioValue, setPortfolioValue] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  useEffect(() => {
    fetchPortfolioData();
  }, [wallets, stakingData]);

  const fetchPortfolioData = async () => {
    if (!wallets || wallets.length === 0) return;

    setLoading(true);
    try {
      // Calculate portfolio holdings
      const holdings = {};
      
      // Wallet type to crypto symbol mapping
      const walletTypeToCrypto = {
        'ethereum': 'ETH',
        'bitcoin': 'BTC',
        'binance': 'BNB',
        'polygon': 'MATIC',
        'solana': 'SOL',
        'cardano': 'ADA'
      };
      
      // Add wallet balances
      wallets.forEach(wallet => {
        const symbol = walletTypeToCrypto[wallet.type] || 'ETH';
        
        if (!holdings[symbol]) {
          holdings[symbol] = { symbol, amount: 0 };
        }
        holdings[symbol].amount += wallet.balance || 0;
      });

      // Add staked amounts
      if (stakingData && stakingData.length > 0) {
        stakingData.forEach(stake => {
          const symbol = stake.cryptocurrency.toUpperCase();
          if (!holdings[symbol]) {
            holdings[symbol] = { symbol, amount: 0 };
          }
          holdings[symbol].amount += stake.amount || 0;
        });
      }

      const holdingsArray = Object.values(holdings).filter(h => h.amount > 0);

      if (holdingsArray.length > 0) {
        // Fetch portfolio value
        const portfolioResponse = await axios.post('/api/prices/portfolio/value', {
          holdings: holdingsArray,
          currency: 'usd'
        });

        setPortfolioValue(portfolioResponse.data);

        // Fetch historical data for the main holding
        const mainHolding = holdingsArray.reduce((max, h) => 
          h.amount > max.amount ? h : max
        , holdingsArray[0]);

        const historyResponse = await axios.get(`/api/prices/${mainHolding.symbol}/history`, {
          params: { days: selectedPeriod, currency: 'usd' }
        });

        setHistoricalData(historyResponse.data);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (portfolioValue) {
      fetchPortfolioData();
    }
  }, [selectedPeriod]);

  if (loading) {
    return <div className="loading">Loading portfolio analytics...</div>;
  }

  if (!portfolioValue) {
    return (
      <div className="portfolio-analytics">
        <div className="no-data">
          <p>No portfolio data available. Add wallets to see analytics.</p>
        </div>
      </div>
    );
  }

  const pieData = portfolioValue.breakdown.map(item => ({
    name: item.symbol,
    value: item.value
  }));

  const chartData = historicalData.map(point => ({
    date: new Date(point.timestamp).toLocaleDateString(),
    price: point.price
  }));

  return (
    <div className="portfolio-analytics">
      <h2>📊 Portfolio Analytics</h2>

      <div className="analytics-grid">
        {/* Total Value Card */}
        <div className="analytics-card total-value">
          <h3>Total Portfolio Value</h3>
          <div className="value">
            ${portfolioValue.totalValue.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          <div className="currency">{portfolioValue.currency}</div>
        </div>

        {/* Asset Count Card */}
        <div className="analytics-card">
          <h3>Total Assets</h3>
          <div className="value">{portfolioValue.breakdown.length}</div>
          <div className="label">Different Cryptocurrencies</div>
        </div>

        {/* Top Performer Card */}
        <div className="analytics-card">
          <h3>Top Performer (24h)</h3>
          {portfolioValue.breakdown.length > 0 && (() => {
            const topPerformer = portfolioValue.breakdown.reduce((max, item) => 
              item.change24h > max.change24h ? item : max
            );
            return (
              <>
                <div className="value">{topPerformer.symbol}</div>
                <div className={`change ${topPerformer.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {topPerformer.change24h >= 0 ? '↑' : '↓'} {Math.abs(topPerformer.change24h).toFixed(2)}%
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="asset-breakdown">
        <h3>Asset Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Price</th>
                  <th>Value</th>
                  <th>24h Change</th>
                </tr>
              </thead>
              <tbody>
                {portfolioValue.breakdown.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.symbol}</strong></td>
                    <td>{item.amount.toFixed(4)}</td>
                    <td>${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className={item.change24h >= 0 ? 'positive' : 'negative'}>
                      {item.change24h >= 0 ? '↑' : '↓'} {Math.abs(item.change24h).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pie Chart */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Price Chart */}
      {chartData.length > 0 && (
        <div className="price-history">
          <div className="chart-header">
            <h3>Price History</h3>
            <div className="period-selector">
              <button 
                className={selectedPeriod === 1 ? 'active' : ''} 
                onClick={() => setSelectedPeriod(1)}
              >
                24H
              </button>
              <button 
                className={selectedPeriod === 7 ? 'active' : ''} 
                onClick={() => setSelectedPeriod(7)}
              >
                7D
              </button>
              <button 
                className={selectedPeriod === 30 ? 'active' : ''} 
                onClick={() => setSelectedPeriod(30)}
              >
                30D
              </button>
              <button 
                className={selectedPeriod === 90 ? 'active' : ''} 
                onClick={() => setSelectedPeriod(90)}
              >
                90D
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={false}
                name="Price (USD)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default PortfolioAnalytics;
