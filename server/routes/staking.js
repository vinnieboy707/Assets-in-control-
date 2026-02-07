const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

// Get all staked assets
router.get('/', (req, res) => {
  const query = `
    SELECT s.*, w.name as wallet_name, w.address as wallet_address
    FROM staked_assets s
    JOIN wallets w ON s.wallet_id = w.id
    ORDER BY s.staked_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ staked_assets: rows });
  });
});

// Get staked assets by wallet
router.get('/wallet/:walletId', (req, res) => {
  db.all(
    'SELECT * FROM staked_assets WHERE wallet_id = ? ORDER BY staked_at DESC',
    [req.params.walletId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ staked_assets: rows });
    }
  );
});

// Get total staked amount summary
router.get('/summary', (req, res) => {
  const query = `
    SELECT 
      cryptocurrency,
      SUM(amount) as total_amount,
      COUNT(*) as count,
      AVG(apy) as avg_apy
    FROM staked_assets
    WHERE status = 'active'
    GROUP BY cryptocurrency
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ summary: rows });
  });
});

// Stake cryptocurrency
router.post('/', (req, res) => {
  const { wallet_id, cryptocurrency, amount, apy } = req.body;
  
  if (!wallet_id || !cryptocurrency || !amount) {
    return res.status(400).json({ 
      error: 'Wallet ID, cryptocurrency, and amount are required' 
    });
  }

  const id = uuidv4();
  const apyValue = apy || 5.0; // Default APY
  
  db.run(
    'INSERT INTO staked_assets (id, wallet_id, cryptocurrency, amount, apy, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, wallet_id, cryptocurrency, amount, apyValue, 'active'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Asset staked successfully',
        staked_asset: { id, wallet_id, cryptocurrency, amount, apy: apyValue, status: 'active' }
      });
    }
  );
});

// Unstake cryptocurrency
router.put('/:id/unstake', (req, res) => {
  db.run(
    'UPDATE staked_assets SET status = ? WHERE id = ?',
    ['unstaking', req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Staked asset not found' });
      }
      
      // Create a transaction record for the unstaking
      const transactionId = uuidv4();
      db.get('SELECT * FROM staked_assets WHERE id = ?', [req.params.id], (err, asset) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch asset details' });
        }
        if (!asset) {
          return res.status(404).json({ error: 'Staked asset not found' });
        }
        
        db.run(
          'INSERT INTO transactions (id, wallet_id, type, cryptocurrency, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
          [transactionId, asset.wallet_id, 'unstake', asset.cryptocurrency, asset.amount, 'completed'],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create transaction record' });
            }
            
            res.json({ message: 'Asset unstaked successfully' });
          }
        );
      });
    }
  );
});

// Complete unstaking (remove from staked assets)
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM staked_assets WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Staked asset not found' });
    }
    res.json({ message: 'Staked asset removed successfully' });
  });
});

module.exports = router;
