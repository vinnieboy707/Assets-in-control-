const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

// Get all transactions
router.get('/', (req, res) => {
  const query = `
    SELECT t.*, w.name as wallet_name, w.address as wallet_address
    FROM transactions t
    JOIN wallets w ON t.wallet_id = w.id
    ORDER BY t.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ transactions: rows });
  });
});

// Get transactions by wallet
router.get('/wallet/:walletId', (req, res) => {
  db.all(
    'SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC',
    [req.params.walletId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ transactions: rows });
    }
  );
});

// Create withdrawal transaction
router.post('/withdraw', (req, res) => {
  const { wallet_id, cryptocurrency, amount } = req.body;
  
  if (!wallet_id || !cryptocurrency || !amount) {
    return res.status(400).json({ 
      error: 'Wallet ID, cryptocurrency, and amount are required' 
    });
  }

  const id = uuidv4();
  
  // First check if wallet has sufficient balance
  db.get('SELECT balance FROM wallets WHERE id = ?', [wallet_id], (err, wallet) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    db.run(
      'INSERT INTO transactions (id, wallet_id, type, cryptocurrency, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, wallet_id, 'withdraw', cryptocurrency, amount, 'pending'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Update wallet balance
        db.run(
          'UPDATE wallets SET balance = balance - ? WHERE id = ?',
          [amount, wallet_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update balance' });
            }
            
            res.status(201).json({
              message: 'Withdrawal initiated successfully',
              transaction: { id, wallet_id, type: 'withdraw', cryptocurrency, amount, status: 'pending' }
            });
          }
        );
      }
    );
  });
});

// Create trade transaction
router.post('/trade', (req, res) => {
  const { wallet_id, cryptocurrency, amount } = req.body;
  
  if (!wallet_id || !cryptocurrency || !amount) {
    return res.status(400).json({ 
      error: 'Wallet ID, cryptocurrency, and amount are required' 
    });
  }

  const id = uuidv4();
  
  db.run(
    'INSERT INTO transactions (id, wallet_id, type, cryptocurrency, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, wallet_id, 'trade', cryptocurrency, amount, 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Trade initiated successfully',
        transaction: { id, wallet_id, type: 'trade', cryptocurrency, amount, status: 'pending' }
      });
    }
  );
});

// Create deposit transaction
router.post('/deposit', (req, res) => {
  const { wallet_id, cryptocurrency, amount } = req.body;
  
  if (!wallet_id || !cryptocurrency || !amount) {
    return res.status(400).json({ 
      error: 'Wallet ID, cryptocurrency, and amount are required' 
    });
  }

  const id = uuidv4();
  
  db.run(
    'INSERT INTO transactions (id, wallet_id, type, cryptocurrency, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, wallet_id, 'deposit', cryptocurrency, amount, 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Update wallet balance
      db.run(
        'UPDATE wallets SET balance = balance + ? WHERE id = ?',
        [amount, wallet_id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update balance' });
          }
          
          res.status(201).json({
            message: 'Deposit initiated successfully',
            transaction: { id, wallet_id, type: 'deposit', cryptocurrency, amount, status: 'pending' }
          });
        }
      );
    }
  );
});

// Update transaction status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  db.run(
    'UPDATE transactions SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ message: 'Transaction status updated successfully' });
    }
  );
});

module.exports = router;
