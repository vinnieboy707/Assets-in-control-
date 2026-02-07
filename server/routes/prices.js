const express = require('express');
const router = express.Router();
const priceService = require('../priceService');

/**
 * Get current price for a cryptocurrency
 * GET /api/prices/:symbol?currency=usd
 */
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const currency = req.query.currency || 'usd';

    const priceData = await priceService.getCurrentPrice(symbol, currency);
    res.json(priceData);
  } catch (error) {
    console.error('Error getting price:', error);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

/**
 * Get prices for multiple cryptocurrencies
 * POST /api/prices/multiple
 * Body: { symbols: ['ETH', 'BTC'], currency: 'usd' }
 */
router.post('/multiple', async (req, res) => {
  try {
    const { symbols, currency = 'usd' } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'symbols array is required' });
    }

    const prices = await priceService.getMultiplePrices(symbols, currency);
    res.json(prices);
  } catch (error) {
    console.error('Error getting multiple prices:', error);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

/**
 * Get historical price data
 * GET /api/prices/:symbol/history?days=7&currency=usd
 */
router.get('/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days) || 7;
    const currency = req.query.currency || 'usd';

    const history = await priceService.getHistoricalPrices(symbol, currency, days);
    res.json(history);
  } catch (error) {
    console.error('Error getting historical prices:', error);
    res.status(500).json({ error: 'Failed to fetch historical price data' });
  }
});

/**
 * Get trending cryptocurrencies
 * GET /api/prices/trending/coins
 */
router.get('/trending/coins', async (req, res) => {
  try {
    const trending = await priceService.getTrendingCoins();
    res.json(trending);
  } catch (error) {
    console.error('Error getting trending coins:', error);
    res.status(500).json({ error: 'Failed to fetch trending coins' });
  }
});

/**
 * Calculate portfolio value
 * POST /api/prices/portfolio/value
 * Body: { holdings: [{symbol: 'ETH', amount: 1.5}], currency: 'usd' }
 */
router.post('/portfolio/value', async (req, res) => {
  try {
    const { holdings, currency = 'usd' } = req.body;

    if (!holdings || !Array.isArray(holdings)) {
      return res.status(400).json({ error: 'holdings array is required' });
    }

    const portfolioValue = await priceService.calculatePortfolioValue(holdings, currency);
    res.json(portfolioValue);
  } catch (error) {
    console.error('Error calculating portfolio value:', error);
    res.status(500).json({ error: 'Failed to calculate portfolio value' });
  }
});

module.exports = router;
