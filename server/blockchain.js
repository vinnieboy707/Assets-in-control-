const { ethers } = require('ethers');

/**
 * Blockchain Service - Production-grade on-chain interaction
 * Handles real wallet balance queries, transaction verification, and blockchain state
 */

// RPC Provider Configuration
const RPC_ENDPOINTS = {
  ethereum: process.env.ETHEREUM_RPC_URL || 'https://cloudflare-eth.com',
  polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
  binance: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
  solana: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
};

// Provider instances cache
const providers = {};

// Balance cache to reduce RPC calls
const balanceCache = new Map();
const CACHE_TTL = parseInt(process.env.BALANCE_CACHE_TTL) || 60000; // 60 seconds default

/**
 * Get or create provider for a blockchain
 * @param {string} chain - Chain identifier
 * @returns {ethers.Provider} Ethers provider
 */
function getProvider(chain) {
  const chainLower = chain.toLowerCase();
  
  if (!providers[chainLower]) {
    const rpcUrl = RPC_ENDPOINTS[chainLower];
    
    if (!rpcUrl) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    
    try {
      providers[chainLower] = new ethers.JsonRpcProvider(rpcUrl);
    } catch (error) {
      console.error(`Failed to create provider for ${chain}:`, error);
      throw error;
    }
  }
  
  return providers[chainLower];
}

/**
 * Get native token balance for an address
 * @param {string} address - Wallet address
 * @param {string} chain - Blockchain (ethereum, polygon, binance)
 * @returns {Promise<number>} Balance in native token
 */
async function getNativeBalance(address, chain) {
  // Check cache first
  const cacheKey = `${chain}:${address}`;
  const cached = balanceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.balance;
  }
  
  try {
    // Validate address
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    const provider = getProvider(chain);
    const balanceWei = await provider.getBalance(address);
    const balance = parseFloat(ethers.formatEther(balanceWei));
    
    // Cache the result
    balanceCache.set(cacheKey, {
      balance,
      timestamp: Date.now()
    });
    
    return balance;
  } catch (error) {
    console.error(`Error fetching balance for ${address} on ${chain}:`, error);
    throw error;
  }
}

/**
 * Get ERC20 token balance
 * @param {string} address - Wallet address
 * @param {string} tokenAddress - ERC20 token contract address
 * @param {string} chain - Blockchain
 * @returns {Promise<number>} Token balance
 */
async function getTokenBalance(address, tokenAddress, chain) {
  const cacheKey = `${chain}:${address}:${tokenAddress}`;
  const cached = balanceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.balance;
  }
  
  try {
    if (!ethers.isAddress(address) || !ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid address format');
    }
    
    const provider = getProvider(chain);
    
    // ERC20 ABI for balanceOf function
    const erc20ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    
    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals()
    ]);
    
    const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
    
    // Cache the result
    balanceCache.set(cacheKey, {
      balance: formattedBalance,
      timestamp: Date.now()
    });
    
    return formattedBalance;
  } catch (error) {
    console.error(`Error fetching token balance:`, error);
    throw error;
  }
}

/**
 * Verify wallet ownership via signature
 * @param {string} address - Wallet address
 * @param {string} message - Message that was signed
 * @param {string} signature - Signature from wallet
 * @returns {boolean} True if signature is valid
 */
function verifySignature(address, message, signature) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Get transaction details from blockchain
 * @param {string} txHash - Transaction hash
 * @param {string} chain - Blockchain
 * @returns {Promise<Object>} Transaction details
 */
async function getTransaction(txHash, chain) {
  try {
    const provider = getProvider(chain);
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      return null;
    }
    
    // Get receipt for confirmation status
    const receipt = await provider.getTransactionReceipt(txHash);
    
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasUsed: receipt ? receipt.gasUsed.toString() : null,
      status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
      blockNumber: tx.blockNumber,
      confirmations: receipt ? await tx.confirmations() : 0
    };
  } catch (error) {
    console.error(`Error fetching transaction ${txHash}:`, error);
    throw error;
  }
}

/**
 * Get current gas price
 * @param {string} chain - Blockchain
 * @returns {Promise<Object>} Gas price information
 */
async function getGasPrice(chain) {
  try {
    const provider = getProvider(chain);
    const feeData = await provider.getFeeData();
    
    return {
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    };
  } catch (error) {
    console.error(`Error fetching gas price for ${chain}:`, error);
    throw error;
  }
}

/**
 * Validate wallet address format
 * @param {string} address - Address to validate
 * @param {string} chain - Blockchain type
 * @returns {boolean} True if valid
 */
function isValidAddress(address, chain) {
  const chainLower = chain.toLowerCase();
  
  // For EVM chains (Ethereum, Polygon, BSC)
  if (['ethereum', 'polygon', 'binance'].includes(chainLower)) {
    return ethers.isAddress(address);
  }
  
  // For Solana
  if (chainLower === 'solana') {
    // Solana addresses are base58 encoded and 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  
  // For Bitcoin
  if (chainLower === 'bitcoin') {
    // Basic Bitcoin address validation (P2PKH, P2SH, Bech32)
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,87}$/.test(address);
  }
  
  // For Cardano
  if (chainLower === 'cardano') {
    // Cardano addresses start with 'addr' and are bech32 encoded
    return /^addr[a-z0-9]{98}$/.test(address);
  }
  
  return false;
}

/**
 * Get total wallet value (native + tokens)
 * @param {string} address - Wallet address
 * @param {string} chain - Blockchain
 * @param {Array} tokenAddresses - Optional array of token addresses
 * @returns {Promise<Object>} Balance breakdown
 */
async function getTotalBalance(address, chain, tokenAddresses = []) {
  try {
    const nativeBalance = await getNativeBalance(address, chain);
    
    let tokenBalances = [];
    if (tokenAddresses && tokenAddresses.length > 0) {
      tokenBalances = await Promise.all(
        tokenAddresses.map(async (tokenAddr) => {
          try {
            const balance = await getTokenBalance(address, tokenAddr, chain);
            return { token: tokenAddr, balance };
          } catch (error) {
            console.error(`Failed to fetch token ${tokenAddr}:`, error);
            return { token: tokenAddr, balance: 0, error: error.message };
          }
        })
      );
    }
    
    return {
      address,
      chain,
      nativeBalance,
      tokenBalances,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error getting total balance:`, error);
    throw error;
  }
}

/**
 * Clear balance cache for a specific address or all
 * @param {string} address - Optional address to clear
 */
function clearCache(address = null) {
  if (address) {
    // Clear all cache entries for this address
    for (const key of balanceCache.keys()) {
      if (key.includes(address)) {
        balanceCache.delete(key);
      }
    }
  } else {
    // Clear entire cache
    balanceCache.clear();
  }
}

module.exports = {
  getNativeBalance,
  getTokenBalance,
  getTotalBalance,
  getTransaction,
  getGasPrice,
  verifySignature,
  isValidAddress,
  clearCache
};
