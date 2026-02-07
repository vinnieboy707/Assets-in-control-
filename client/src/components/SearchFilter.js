import React, { useState } from 'react';
import './SearchFilter.css';

function SearchFilter({ onFilterChange, filterType = 'transactions' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    cryptocurrency: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters({ ...filters, search: value });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters({ ...newFilters, search: searchTerm });
  };

  const applyFilters = (currentFilters) => {
    const activeFilters = { ...currentFilters };
    
    // Remove empty filters
    Object.keys(activeFilters).forEach(key => {
      if (activeFilters[key] === '' || activeFilters[key] === null) {
        delete activeFilters[key];
      }
    });

    onFilterChange(activeFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      status: '',
      cryptocurrency: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    onFilterChange({});
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== '');

  return (
    <div className="search-filter">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={`Search ${filterType}...`}
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button 
          className="toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '🔽' : '🔼'} Advanced Filters
        </button>
        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            ✖ Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-grid">
            {/* Transaction Type Filter */}
            {filterType === 'transactions' && (
              <div className="filter-group">
                <label>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="stake">Stake</option>
                  <option value="unstake">Unstake</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="deposit">Deposit</option>
                  <option value="trade">Trade</option>
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="active">Active</option>
              </select>
            </div>

            {/* Cryptocurrency Filter */}
            <div className="filter-group">
              <label>Cryptocurrency</label>
              <select
                value={filters.cryptocurrency}
                onChange={(e) => handleFilterChange('cryptocurrency', e.target.value)}
              >
                <option value="">All Cryptocurrencies</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="BNB">Binance Coin (BNB)</option>
                <option value="MATIC">Polygon (MATIC)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="ADA">Cardano (ADA)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="USDC">USD Coin (USDC)</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Amount Range Filter */}
            <div className="filter-group">
              <label>Min Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label>Max Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="active-filters">
              <span className="label">Active Filters:</span>
              {searchTerm && (
                <span className="filter-tag">
                  Search: "{searchTerm}"
                  <button onClick={() => handleSearchChange({ target: { value: '' } })}>×</button>
                </span>
              )}
              {Object.entries(filters).map(([key, value]) => {
                if (value) {
                  return (
                    <span key={key} className="filter-tag">
                      {key}: {value}
                      <button onClick={() => handleFilterChange(key, '')}>×</button>
                    </span>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
