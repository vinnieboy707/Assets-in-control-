# On-Chain Verification Examples

This document shows how to use the on-chain verification features.

## Overview

All blockchain operations can now be externally verified using block explorers. The system provides:

- Transaction verification with confirmations
- Balance verification at any block height  
- Smart contract verification
- Transaction history retrieval
- Block explorer URL generation

## API Examples

### 1. Get Block Explorer URL for Transaction

```bash
GET /api/verification/transaction/:chain/:txHash
```

**Example:**
```bash
curl http://localhost:5000/api/verification/transaction/ethereum/0x1234...
```

**Response:**
```json
{
  "success": true,
  "chain": "ethereum",
  "txHash": "0x1234...",
  "explorerUrl": "https://etherscan.io/tx/0x1234..."
}
```

### 2. Get Block Explorer URL for Address

```bash
GET /api/verification/address/:chain/:address
```

**Example:**
```bash
curl http://localhost:5000/api/verification/address/polygon/0xabcd...
```

**Response:**
```json
{
  "success": true,
  "chain": "polygon",
  "address": "0xabcd...",
  "explorerUrl": "https://polygonscan.com/address/0xabcd..."
}
```

### 3. Verify Transaction On-Chain

```bash
GET /api/verification/verify-transaction/:chain/:txHash
```

**Example:**
```bash
curl http://localhost:5000/api/verification/verify-transaction/ethereum/0x5a0b...
```

**Response:**
```json
{
  "verified": true,
  "txHash": "0x5a0b...",
  "blockNumber": 19123456,
  "blockHash": "0xabc...",
  "confirmations": 125,
  "timestamp": 1709876543,
  "from": "0x1234...",
  "to": "0x5678...",
  "gasUsed": "21000",
  "status": "success",
  "logs": 0,
  "contractAddress": null,
  "explorerUrl": "https://etherscan.io/tx/0x5a0b..."
}
```

### 4. Get Verifiable Balance

```bash
GET /api/verification/balance/:chain/:address
GET /api/verification/balance/:chain/:address?blockNumber=19000000
```

**Example:**
```bash
curl http://localhost:5000/api/verification/balance/ethereum/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

**Response:**
```json
{
  "verified": true,
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "balance": "1234.567890123456",
  "balanceWei": "1234567890123456789012",
  "blockNumber": 19234567,
  "blockHash": "0xdef...",
  "timestamp": 1709876543,
  "verifiableAt": 19234567,
  "explorerUrl": "https://etherscan.io/address/0xd8dA..."
}
```

**Historical Balance Example:**
```bash
curl "http://localhost:5000/api/verification/balance/ethereum/0xd8dA.../balance?blockNumber=19000000"
```

This retrieves the balance at a specific block in the past, allowing historical verification.

### 5. Verify Smart Contract

```bash
GET /api/verification/contract/:chain/:address
```

**Example:**
```bash
curl http://localhost:5000/api/verification/contract/ethereum/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```

**Response (for USDC contract):**
```json
{
  "verified": true,
  "isContract": true,
  "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "bytecodeHash": "0x9876...",
  "bytecodeSize": 12345,
  "explorerUrl": "https://etherscan.io/address/0xA0b..."
}
```

**Response (for regular address):**
```json
{
  "verified": false,
  "isContract": false,
  "message": "Address is not a contract"
}
```

### 6. Get Transaction History

```bash
GET /api/verification/history/:chain/:address
GET /api/verification/history/:chain/:address?fromBlock=19000000&toBlock=19100000
```

**Example:**
```bash
curl "http://localhost:5000/api/verification/history/ethereum/0xA0b8.../history?fromBlock=19000000"
```

**Response:**
```json
{
  "success": true,
  "chain": "ethereum",
  "address": "0xA0b8...",
  "fromBlock": 19000000,
  "toBlock": 19234567,
  "transactionCount": 45,
  "transactions": [
    {
      "blockNumber": 19123456,
      "blockHash": "0xabc...",
      "txHash": "0x5a0b...",
      "address": "0xA0b8...",
      "topics": ["0x...", "0x..."],
      "data": "0x...",
      "logIndex": 12
    },
    ...
  ],
  "explorerUrl": "https://etherscan.io/address/0xA0b8..."
}
```

### 7. Get Supported Block Explorers

```bash
GET /api/verification/explorers
```

**Example:**
```bash
curl http://localhost:5000/api/verification/explorers
```

**Response:**
```json
{
  "success": true,
  "explorers": {
    "ethereum": "https://etherscan.io",
    "polygon": "https://polygonscan.com",
    "binance": "https://bscscan.com",
    "sepolia": "https://sepolia.etherscan.io",
    "mumbai": "https://mumbai.polygonscan.com"
  }
}
```

## Frontend Integration Example

```javascript
// Get verifiable balance
async function getVerifiableBalance(chain, address) {
  const response = await fetch(
    `/api/verification/balance/${chain}/${address}`
  );
  const data = await response.json();
  
  if (data.verified) {
    console.log(`Balance: ${data.balance} at block ${data.blockNumber}`);
    console.log(`Verify on explorer: ${data.explorerUrl}`);
  }
}

// Verify a transaction
async function verifyTransaction(chain, txHash) {
  const response = await fetch(
    `/api/verification/verify-transaction/${chain}/${txHash}`
  );
  const data = await response.json();
  
  if (data.verified) {
    console.log(`Transaction ${data.status}`);
    console.log(`Block: ${data.blockNumber}`);
    console.log(`Confirmations: ${data.confirmations}`);
    console.log(`View on explorer: ${data.explorerUrl}`);
  }
}

// Get block explorer link
function getExplorerLink(chain, txHash) {
  return fetch(`/api/verification/transaction/${chain}/${txHash}`)
    .then(r => r.json())
    .then(data => data.explorerUrl);
}
```

## Verification Workflow

### For Wallet Operations

1. User adds wallet with address
2. Backend fetches balance from blockchain
3. Balance is stored with block number and timestamp
4. User can verify balance at that block on explorer
5. Block explorer link is provided for external verification

### For Transactions

1. Transaction is submitted to blockchain
2. Backend monitors transaction status
3. Transaction receipt is retrieved with full details
4. Confirmations are tracked
5. Explorer link provided for independent verification
6. All data (block hash, gas used, status) can be verified on-chain

### For Historical Data

1. User requests balance at specific block number
2. Backend queries blockchain at that block
3. Returns balance with block verification data
4. User can verify historical state on block explorer

## Why This Matters

### Transparency
Every operation provides data that can be independently verified on public block explorers.

### Trust
Users don't need to trust the application - they can verify everything themselves.

### Audit Trail
All blockchain operations have verifiable timestamps, block numbers, and hashes.

### Compliance
Verifiable on-chain data supports regulatory compliance and auditing.

## Supported Chains

- **Ethereum** (Mainnet) - etherscan.io
- **Polygon** (Mainnet) - polygonscan.com  
- **Binance Smart Chain** - bscscan.com
- **Sepolia** (Testnet) - sepolia.etherscan.io
- **Mumbai** (Testnet) - mumbai.polygonscan.com

## Rate Limiting

All verification endpoints use the standard API rate limiter:
- 100 requests per 15 minutes per IP

## Error Handling

All endpoints return proper error messages:

```json
{
  "verified": false,
  "error": "Transaction not found or not mined yet"
}
```

Or:

```json
{
  "success": false,
  "error": "Failed to verify transaction",
  "message": "Provider connection timeout"
}
```

## Best Practices

1. **Cache Explorer URLs** - They don't change, so cache them client-side
2. **Check Confirmations** - Wait for multiple confirmations before considering a transaction final
3. **Verify Independently** - Always provide users with explorer links to verify themselves
4. **Handle Pending States** - Transactions may not be mined immediately
5. **Use Block Numbers** - For historical queries, specify exact block numbers

## Testing

Use real transactions from block explorers to test:

1. Pick a transaction from Etherscan
2. Call verification endpoint with that transaction hash
3. Compare API response with Etherscan data
4. Verify all fields match

## Security Considerations

- All verification is read-only
- No private keys are involved
- Data comes directly from blockchain
- Rate limiting prevents abuse
- All operations are idempotent

## Future Enhancements

Potential additions:
- NFT verification
- Token transfer verification  
- DeFi position verification
- Multi-signature verification
- Cross-chain verification

---

**Ready to verify your blockchain operations?** Start using the verification endpoints now!
