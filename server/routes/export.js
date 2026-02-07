const express = require('express');
const router = express.Router();
const db = require('../database');
const { optionalAuth } = require('../auth');

/**
 * Export transactions as CSV
 * GET /api/export/transactions/csv?walletId=xxx
 */
router.get('/transactions/csv', optionalAuth, async (req, res) => {
  try {
    const { walletId, startDate, endDate } = req.query;
    const userId = req.user ? req.user.userId : null;

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    // Filter by user if authenticated
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    // Filter by wallet
    if (walletId) {
      query += ' AND wallet_id = ?';
      params.push(walletId);
    }

    // Filter by date range
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC';

    const transactions = await new Promise((resolve, reject) => {
      db.get().all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Convert to CSV
    const headers = ['ID', 'Wallet ID', 'Type', 'Cryptocurrency', 'Amount', 'Status', 'Date'];
    const csv = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.id,
        tx.wallet_id,
        tx.type,
        tx.cryptocurrency,
        tx.amount,
        tx.status,
        tx.created_at
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting transactions to CSV:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

/**
 * Export transactions as JSON
 * GET /api/export/transactions/json?walletId=xxx
 */
router.get('/transactions/json', optionalAuth, async (req, res) => {
  try {
    const { walletId, startDate, endDate } = req.query;
    const userId = req.user ? req.user.userId : null;

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    // Filter by user if authenticated
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    // Filter by wallet
    if (walletId) {
      query += ' AND wallet_id = ?';
      params.push(walletId);
    }

    // Filter by date range
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC';

    const transactions = await new Promise((resolve, reject) => {
      db.get().all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.json');
    res.json({
      exportDate: new Date().toISOString(),
      totalTransactions: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Error exporting transactions to JSON:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

/**
 * Export wallet data
 * GET /api/export/wallets/json
 */
router.get('/wallets/json', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;

    let query = 'SELECT * FROM wallets';
    const params = [];

    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }

    const wallets = await new Promise((resolve, reject) => {
      db.get().all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=wallets.json');
    res.json({
      exportDate: new Date().toISOString(),
      totalWallets: wallets.length,
      wallets
    });
  } catch (error) {
    console.error('Error exporting wallets:', error);
    res.status(500).json({ error: 'Failed to export wallets' });
  }
});

/**
 * Export staking data
 * GET /api/export/staking/json
 */
router.get('/staking/json', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;

    let query = `
      SELECT s.*, w.name as wallet_name, w.address as wallet_address
      FROM staked_assets s
      LEFT JOIN wallets w ON s.wallet_id = w.id
    `;
    const params = [];

    if (userId) {
      query += ' WHERE w.user_id = ?';
      params.push(userId);
    }

    const stakingData = await new Promise((resolve, reject) => {
      db.get().all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=staking.json');
    res.json({
      exportDate: new Date().toISOString(),
      totalStakes: stakingData.length,
      stakingData
    });
  } catch (error) {
    console.error('Error exporting staking data:', error);
    res.status(500).json({ error: 'Failed to export staking data' });
  }
});

module.exports = router;
