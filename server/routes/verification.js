const express = require('express');
const router = express.Router();
const blockchain = require('../blockchain');
const onChainVerification = require('../onChainVerification');
const { apiLimiter } = require('../rateLimiter');

/**
 * Get block explorer URL for a transaction
 * GET /api/verification/transaction/:chain/:txHash
 */
router.get('/transaction/:chain/:txHash', apiLimiter, (req, res) => {
  try {
    const { chain, txHash } = req.params;
    const url = onChainVerification.getTransactionUrl(txHash, chain);
    
    res.json({
      success: true,
      chain,
      txHash,
      explorerUrl: url
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate transaction URL' });
  }
});

/**
 * Get block explorer URL for an address
 * GET /api/verification/address/:chain/:address
 */
router.get('/address/:chain/:address', apiLimiter, (req, res) => {
  try {
    const { chain, address } = req.params;
    const url = onChainVerification.getAddressUrl(address, chain);
    
    res.json({
      success: true,
      chain,
      address,
      explorerUrl: url
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate address URL' });
  }
});

/**
 * Verify a transaction on-chain
 * GET /api/verification/verify-transaction/:chain/:txHash
 */
router.get('/verify-transaction/:chain/:txHash', apiLimiter, async (req, res) => {
  try {
    const { chain, txHash } = req.params;
    const provider = blockchain.getProvider ? blockchain.getProvider(chain) : null;
    
    if (!provider) {
      return res.status(400).json({ error: 'Provider not available for this chain' });
    }

    const verification = await onChainVerification.verifyTransaction(txHash, provider);
    
    if (verification.verified) {
      verification.explorerUrl = onChainVerification.getTransactionUrl(txHash, chain);
    }
    
    res.json(verification);
  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({ 
      verified: false,
      error: 'Failed to verify transaction',
      message: error.message 
    });
  }
});

/**
 * Get verifiable balance for an address
 * GET /api/verification/balance/:chain/:address
 */
router.get('/balance/:chain/:address', apiLimiter, async (req, res) => {
  try {
    const { chain, address } = req.params;
    const blockNumber = req.query.blockNumber ? parseInt(req.query.blockNumber) : null;
    
    const provider = blockchain.getProvider ? blockchain.getProvider(chain) : null;
    
    if (!provider) {
      return res.status(400).json({ error: 'Provider not available for this chain' });
    }

    const balance = await onChainVerification.getVerifiableBalance(address, provider, blockNumber);
    
    if (balance.verified) {
      balance.explorerUrl = onChainVerification.getAddressUrl(address, chain);
    }
    
    res.json(balance);
  } catch (error) {
    console.error('Balance verification error:', error);
    res.status(500).json({ 
      verified: false,
      error: 'Failed to get verifiable balance',
      message: error.message 
    });
  }
});

/**
 * Verify if an address is a contract
 * GET /api/verification/contract/:chain/:address
 */
router.get('/contract/:chain/:address', apiLimiter, async (req, res) => {
  try {
    const { chain, address } = req.params;
    const provider = blockchain.getProvider ? blockchain.getProvider(chain) : null;
    
    if (!provider) {
      return res.status(400).json({ error: 'Provider not available for this chain' });
    }

    const contractInfo = await onChainVerification.verifyContract(address, provider);
    
    if (contractInfo.verified) {
      contractInfo.explorerUrl = onChainVerification.getAddressUrl(address, chain);
    }
    
    res.json(contractInfo);
  } catch (error) {
    console.error('Contract verification error:', error);
    res.status(500).json({ 
      verified: false,
      error: 'Failed to verify contract',
      message: error.message 
    });
  }
});

/**
 * Get transaction history for an address
 * GET /api/verification/history/:chain/:address
 */
router.get('/history/:chain/:address', apiLimiter, async (req, res) => {
  try {
    const { chain, address } = req.params;
    const fromBlock = req.query.fromBlock ? parseInt(req.query.fromBlock) : 0;
    const toBlock = req.query.toBlock || 'latest';
    
    const provider = blockchain.getProvider ? blockchain.getProvider(chain) : null;
    
    if (!provider) {
      return res.status(400).json({ error: 'Provider not available for this chain' });
    }

    const history = await onChainVerification.getTransactionHistory(
      address, 
      provider, 
      fromBlock, 
      toBlock
    );
    
    res.json({
      success: true,
      chain,
      address,
      fromBlock,
      toBlock: toBlock === 'latest' ? await provider.getBlockNumber() : toBlock,
      transactionCount: history.length,
      transactions: history,
      explorerUrl: onChainVerification.getAddressUrl(address, chain)
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get transaction history',
      message: error.message 
    });
  }
});

/**
 * Get supported block explorers
 * GET /api/verification/explorers
 */
router.get('/explorers', (req, res) => {
  res.json({
    success: true,
    explorers: onChainVerification.BLOCK_EXPLORERS
  });
});

module.exports = router;
