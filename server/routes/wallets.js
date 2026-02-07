const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const blockchain = require('../blockchain');

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

// Add new wallet - with real blockchain balance
router.post('/', async (req, res) => {
  const { name, address, type, location } = req.body;
  
  if (!name || !address || !type) {
    return res.status(400).json({ error: 'Name, address, and type are required' });
  }

  // Validate address format for the blockchain
  if (!blockchain.isValidAddress(address, type)) {
    return res.status(400).json({ error: `Invalid ${type} address format` });
  }

  const id = uuidv4();
  
  try {
    // Fetch REAL balance from blockchain
    let balance = 0;
    
    // For EVM-compatible chains (Ethereum, Polygon, BSC)
    if (['ethereum', 'polygon', 'binance'].includes(type.toLowerCase())) {
      balance = await blockchain.getNativeBalance(address, type);
    } else {
      // For other chains, start with 0 and user can refresh manually
      // This avoids blocking wallet creation if chain is not yet supported
      console.log(`Balance fetch not yet implemented for ${type}, starting with 0`);
      balance = 0;
    }
    
    db.run(
      'INSERT INTO wallets (id, name, address, type, balance, verified, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, address, type, balance, 0, location || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: 'Wallet added successfully with real on-chain balance',
          wallet: { id, name, address, type, balance, verified: 0, location: location || null }
        });
      }
    );
  } catch (error) {
    console.error('Error fetching blockchain balance:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch balance from blockchain',
      details: error.message 
    });
  }
});

// Verify wallet via signature verification
router.put('/:id/verify', async (req, res) => {
  const { message, signature } = req.body;
  
  if (!message || !signature) {
    return res.status(400).json({ 
      error: 'Message and signature are required for verification' 
    });
  }
  
  try {
    // Get wallet from database
    db.get('SELECT * FROM wallets WHERE id = ?', [req.params.id], async (err, wallet) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      
      // Verify signature matches wallet address
      const isValid = blockchain.verifySignature(wallet.address, message, signature);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature - wallet ownership not verified' });
      }
      
      // Update wallet as verified
      db.run(
        'UPDATE wallets SET verified = 1 WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ 
            message: 'Wallet verified successfully via cryptographic signature',
            verified: true 
          });
        }
      );
    });
  } catch (error) {
    console.error('Error verifying wallet:', error);
    return res.status(500).json({ error: 'Verification failed', details: error.message });
  }
});

// Refresh wallet balance from blockchain
router.put('/:id/refresh', async (req, res) => {
  try {
    db.get('SELECT * FROM wallets WHERE id = ?', [req.params.id], async (err, wallet) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      
      try {
        // Fetch fresh balance from blockchain
        let balance = 0;
        
        if (['ethereum', 'polygon', 'binance'].includes(wallet.type.toLowerCase())) {
          // Clear cache for this wallet
          blockchain.clearCache(wallet.address);
          
          // Get fresh balance
          balance = await blockchain.getNativeBalance(wallet.address, wallet.type);
        } else {
          return res.status(400).json({ 
            error: `Balance refresh not yet supported for ${wallet.type}` 
          });
        }
        
        // Update database with new balance
        db.run(
          'UPDATE wallets SET balance = ? WHERE id = ?',
          [balance, req.params.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ 
              message: 'Balance refreshed from blockchain',
              balance,
              timestamp: new Date().toISOString()
            });
          }
        );
      } catch (error) {
        console.error('Error refreshing balance:', error);
        return res.status(500).json({ 
          error: 'Failed to refresh balance from blockchain',
          details: error.message 
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update wallet balance (kept for backward compatibility but should use refresh)
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
