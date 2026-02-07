const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');

// Get all airdrops
router.get('/', (req, res) => {
  const query = `
    SELECT a.*, w.name as wallet_name, w.address as wallet_address
    FROM airdrops a
    JOIN wallets w ON a.wallet_id = w.id
    ORDER BY a.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ airdrops: rows });
  });
});

// Get airdrops by wallet
router.get('/wallet/:walletId', (req, res) => {
  db.all(
    'SELECT * FROM airdrops WHERE wallet_id = ? ORDER BY created_at DESC',
    [req.params.walletId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ airdrops: rows });
    }
  );
});

// Get upcoming airdrops (not claimed and deadline not passed)
router.get('/upcoming', (req, res) => {
  const query = `
    SELECT a.*, w.name as wallet_name
    FROM airdrops a
    JOIN wallets w ON a.wallet_id = w.id
    WHERE a.claimed = 0 
    AND (a.claim_deadline IS NULL OR a.claim_deadline > datetime('now'))
    ORDER BY a.claim_deadline ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ airdrops: rows });
  });
});

// Add new airdrop
router.post('/', (req, res) => {
  const { wallet_id, name, cryptocurrency, amount, eligibility_criteria, claim_deadline } = req.body;
  
  if (!wallet_id || !name || !cryptocurrency) {
    return res.status(400).json({ 
      error: 'Wallet ID, name, and cryptocurrency are required' 
    });
  }

  const id = uuidv4();
  
  db.run(
    `INSERT INTO airdrops (id, wallet_id, name, cryptocurrency, amount, eligibility_criteria, claim_deadline, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, wallet_id, name, cryptocurrency, amount || 0, eligibility_criteria, claim_deadline, 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'Airdrop added successfully',
        airdrop: { id, wallet_id, name, cryptocurrency, amount: amount || 0, status: 'pending' }
      });
    }
  );
});

// Claim airdrop
router.put('/:id/claim', (req, res) => {
  const { amount } = req.body;
  
  db.run(
    `UPDATE airdrops SET claimed = 1, claimed_at = datetime('now'), amount = ?, status = 'claimed' 
     WHERE id = ?`,
    [amount || 0, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Airdrop not found' });
      }
      res.json({ message: 'Airdrop claimed successfully' });
    }
  );
});

// Update airdrop
router.put('/:id', (req, res) => {
  const { name, amount, eligibility_criteria, claim_deadline, status } = req.body;
  
  db.run(
    `UPDATE airdrops 
     SET name = COALESCE(?, name),
         amount = COALESCE(?, amount),
         eligibility_criteria = COALESCE(?, eligibility_criteria),
         claim_deadline = COALESCE(?, claim_deadline),
         status = COALESCE(?, status)
     WHERE id = ?`,
    [name, amount, eligibility_criteria, claim_deadline, status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Airdrop not found' });
      }
      res.json({ message: 'Airdrop updated successfully' });
    }
  );
});

// Delete airdrop
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM airdrops WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Airdrop not found' });
    }
    res.json({ message: 'Airdrop deleted successfully' });
  });
});

module.exports = router;
