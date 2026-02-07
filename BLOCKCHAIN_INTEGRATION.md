# Blockchain Integration Guide

## Overview

This application now uses **production-grade on-chain blockchain integration** to fetch real wallet balances and verify transactions. Mock data has been completely removed.

## Features

### ✅ Real Blockchain Balance Fetching
- Fetches actual token balances from Ethereum, Polygon, and BSC networks
- Uses ethers.js v6 for reliable RPC communication
- Implements smart caching (60-second TTL) to reduce RPC calls

### ✅ Address Validation
- Validates wallet addresses before operations
- Supports multiple blockchain formats:
  - **EVM Chains** (Ethereum, Polygon, BSC): checksummed addresses
  - **Solana**: Base58 encoded addresses
  - **Bitcoin**: P2PKH, P2SH, Bech32 formats
  - **Cardano**: Bech32 encoded addresses

### ✅ Signature Verification
- Cryptographic verification of wallet ownership
- Uses ECDSA signature recovery
- Prevents unauthorized wallet claims

### ✅ Production-Ready Architecture
- Error handling with detailed logging
- Retry logic with exponential backoff (coming soon)
- Rate limiting to prevent RPC abuse
- Environment-based configuration

## Configuration

### Environment Variables

Create a `.env` file in the root directory (use `.env.example` as template):

```bash
# RPC Endpoints (use your own API keys for production)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Cache Settings
BALANCE_CACHE_TTL=60000  # 60 seconds

# Rate Limiting
MAX_RPC_REQUESTS_PER_SECOND=10
```

### Recommended RPC Providers

#### Free Options:
- **Ethereum**: Cloudflare ETH (https://cloudflare-eth.com)
- **Polygon**: Official RPC (https://polygon-rpc.com)
- **BSC**: Binance official (https://bsc-dataseed.binance.org)

#### Paid Options (Better Reliability):
- **Alchemy**: https://www.alchemy.com (recommended)
- **Infura**: https://infura.io
- **QuickNode**: https://quicknode.com

## API Endpoints

### Wallet Operations

#### Add Wallet with Real Balance
```http
POST /api/wallets
Content-Type: application/json

{
  "name": "My Ethereum Wallet",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "type": "ethereum",
  "location": "MetaMask"
}
```

**Response:**
```json
{
  "message": "Wallet added successfully with real on-chain balance",
  "wallet": {
    "id": "uuid",
    "name": "My Ethereum Wallet",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "type": "ethereum",
    "balance": 1.234567,  // Real ETH balance fetched from blockchain
    "verified": 0,
    "location": "MetaMask"
  }
}
```

#### Refresh Balance from Blockchain
```http
PUT /api/wallets/:id/refresh
```

**Response:**
```json
{
  "message": "Balance refreshed from blockchain",
  "balance": 1.234567,
  "timestamp": "2026-02-07T19:49:15.079Z"
}
```

#### Verify Wallet Ownership
```http
PUT /api/wallets/:id/verify
Content-Type: application/json

{
  "message": "I own this wallet",
  "signature": "0x..."  // Signed message from wallet
}
```

## How It Works

### Balance Fetching Flow

```
User Adds Wallet
    ↓
Address Validation
    ↓
Query Blockchain RPC
    ↓
Fetch Native Balance (ETH/MATIC/BNB)
    ↓
Cache Result (60s)
    ↓
Store in Database
    ↓
Return to User
```

### Wallet Verification Flow

```
User Requests Verification
    ↓
User Signs Message with Private Key
    ↓
Signature Sent to Server
    ↓
Server Recovers Address from Signature
    ↓
Compare with Stored Wallet Address
    ↓
Mark as Verified if Match
```

## Code Examples

### Fetching Native Balance

```javascript
const blockchain = require('./blockchain');

// Get Ethereum balance
const ethBalance = await blockchain.getNativeBalance(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'ethereum'
);

console.log(`Balance: ${ethBalance} ETH`);
```

### Fetching ERC20 Token Balance

```javascript
// Get USDC balance on Ethereum
const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const tokenBalance = await blockchain.getTokenBalance(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  usdcAddress,
  'ethereum'
);

console.log(`USDC Balance: ${tokenBalance}`);
```

### Verifying Signature

```javascript
const isValid = blockchain.verifySignature(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'I own this wallet',
  '0x...'  // Signature
);

if (isValid) {
  console.log('Wallet ownership verified!');
}
```

## Security Considerations

### ✅ What We DO:
- Fetch balances from public RPC endpoints
- Verify wallet ownership via signatures
- Validate all addresses before operations
- Cache results to minimize RPC calls
- Log errors for monitoring

### ❌ What We DON'T DO:
- **NEVER** store private keys on the server
- **NEVER** initiate transactions on behalf of users
- **NEVER** expose sensitive user data
- **NEVER** trust client-provided balances

## Testing

### Test with Real Wallets

You can test with any public Ethereum address:

**Vitalik's Wallet:**
```
Address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Type: ethereum
```

**USDC Contract:**
```
Address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Type: ethereum
```

### Expected Behavior

1. **Adding a wallet**: Should fetch real balance from blockchain (may take 1-3 seconds)
2. **Refreshing balance**: Should update with current on-chain balance
3. **Invalid address**: Should return validation error
4. **Unsupported chain**: Should start with 0 balance and allow manual refresh

## Troubleshooting

### "Failed to fetch balance from blockchain"

**Causes:**
- RPC endpoint is down or rate-limited
- Network connectivity issues
- Invalid API key in .env file

**Solutions:**
- Check your RPC endpoint configuration
- Try using public endpoints
- Verify network connection
- Check console logs for detailed error

### "Invalid address format"

**Causes:**
- Address doesn't match blockchain format
- Typo in address
- Wrong blockchain selected

**Solutions:**
- Verify address on block explorer
- Check address format for specific chain
- Ensure correct blockchain is selected

### Slow Balance Fetching

**Causes:**
- RPC endpoint latency
- Network congestion
- Rate limiting

**Solutions:**
- Use premium RPC provider (Alchemy, Infura)
- Implement parallel requests for multiple wallets
- Increase cache TTL to reduce fresh queries

## Future Enhancements

- [ ] Token balance tracking (ERC20, BEP20)
- [ ] Historical balance charts
- [ ] Gas price estimation
- [ ] Transaction monitoring
- [ ] Multi-signature wallet support
- [ ] Hardware wallet integration
- [ ] NFT balance tracking
- [ ] DeFi position tracking

## Support

For issues related to blockchain integration:
1. Check the console logs for detailed errors
2. Verify your RPC configuration
3. Test with public RPC endpoints
4. Open an issue with error logs

## Resources

- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Ethereum JSON-RPC Specification](https://ethereum.org/en/developers/docs/apis/json-rpc/)
- [EIP-712: Typed Structured Data](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
