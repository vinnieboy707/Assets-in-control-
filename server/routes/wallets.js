const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

// Get all wallets
router.get('/', (req, res) => {
  db.all('SELECT * FROM wallets ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ wallets: rows });
  });
});

// Get wallet by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM wallets WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json({ wallet: row });
  });
});

// Add new wallet
// Add new wallet
router.post('/', (req, res) => {
  const { name, address, type, location } = req.body;
  
  if (!name || !address || !type) {
    return res.status(400).json({ error: 'Name, address, and type are required' });
  }

  const id = uuidv4();
  const balance = Math.random() * 10000; // Simulated balance for demo
  
  db.run(
    'INSERT INTO wallets (id, name, address, type, balance, verified, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, address, type, balance, 0, location || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Wallet added successfully',
        wallet: { id, name, address, type, balance, verified: 0, location: location || null }
      });
    }
  );
});

// Verify wallet
router.put('/:id/verify', (req, res) => {
  db.run(
    'UPDATE wallets SET verified = 1 WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      res.json({ message: 'Wallet verified successfully' });
    }
  );
});

// Update wallet balance
router.put('/:id/balance', (req, res) => {
  const { balance } = req.body;
  
  if (balance === undefined) {
    return res.status(400).json({ error: 'Balance is required' });
  }

  db.run(
    'UPDATE wallets SET balance = ? WHERE id = ?',
    [balance, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      res.json({ message: 'Balance updated successfully' });
    }
  );
});

// Delete wallet
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM wallets WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json({ message: 'Wallet deleted successfully' });
  });
});

module.exports = router;
