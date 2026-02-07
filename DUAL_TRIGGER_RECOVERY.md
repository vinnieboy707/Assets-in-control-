# Dual Trigger Error Recovery System with Automatic Advancement

## Overview

The **Dual Trigger Error Recovery System** is an intelligent, automatic error recovery mechanism that:
1. Detects failures, applies recovery strategies, and validates the fix
2. Uses DIFFERENT strategies for each attempt (never repeating failed approaches)
3. **Automatically advances to the next validation upon success**
4. Escalates through multiple strategies until success or manual intervention

## How It Works

### The Dual Trigger Flow with Automatic Advancement

```
Error Occurs
    ↓
Detect & Classify Error
    ↓
Apply Strategy #1 (Primary)
    ↓
Re-run Validation
    ↓
Success? → ✅ AUTOMATICALLY ADVANCE TO NEXT VALIDATION
    ↓ No
Apply Strategy #2 (Secondary - DIFFERENT from #1)
    ↓
Re-run Validation
    ↓
Success? → ✅ AUTOMATICALLY ADVANCE TO NEXT VALIDATION
    ↓ No
Apply Strategy #3 (if available)
    ↓
Re-run Validation
    ↓
Success? → ✅ AUTOMATICALLY ADVANCE TO NEXT VALIDATION
    ↓ No
Flag for Manual Intervention 🚨
```

### Validation Chain with Auto-Advancement

```
Validation 1
    ↓ Pass
Auto-Advance ➡️
    ↓
Validation 2
    ↓ Pass
Auto-Advance ➡️
    ↓
Validation 3
    ↓ Pass
Complete ✅
```

**Key Features:**
- ✅ After successful recovery, **automatically proceeds** to next validation
- ✅ Context data flows through the entire chain
- ✅ Optional validations can be skipped without stopping the chain
- ✅ Each validation can have success/failure callbacks

### Key Principle: Different Strategies

**Why use different strategies?**
> If the first solution didn't fix it the first time, why would it the second time?

The system automatically selects **different** recovery strategies for each attempt:
- **Attempt 1**: Primary strategy (most common fix)
- **Attempt 2**: Secondary strategy (alternative approach)
- **Attempt 3**: Tertiary strategy (last resort)
- **After 3 attempts**: Flag for manual intervention

## Error Types & Recovery Strategies

### 1. RPC Errors (Blockchain Connection Issues)

**Primary Strategy**: Switch to Backup RPC
```javascript
// Switches from failed RPC to alternative endpoint
cloudflare-eth.com → rpc.ankr.com/eth → eth.llamarpc.com
```

**Secondary Strategy**: Increase Timeout and Retry
```javascript
// Doubles the timeout for the request
5000ms → 10000ms → 20000ms
```

### 2. Database Errors

**Primary Strategy**: Reconnect to Database
```javascript
// Closes and reopens database connection
```

**Secondary Strategy**: Check and Repair Database Schema
```javascript
// Verifies schema integrity and repairs if needed
```

### 3. Address Validation Errors

**Primary Strategy**: Auto-correct Address Format
```javascript
// Example corrections:
'742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
→ '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'

// Converts to checksum format
```

**Secondary Strategy**: Validate with Alternative Method
```javascript
// Uses different validation algorithm
```

### 4. Network Timeout Errors

**Primary Strategy**: Exponential Backoff Retry
```javascript
// Waits before retry with increasing delay
Attempt 1: 1000ms
Attempt 2: 2000ms
Attempt 3: 4000ms
Max: 10000ms
```

**Secondary Strategy**: Switch to Alternative Endpoint
```javascript
// Changes to backup network endpoint
```

### 5. API Validation Errors

**Primary Strategy**: Sanitize and Retry
```javascript
// Cleans input data
input = input.trim().replace(/[<>]/g, '')
```

**Secondary Strategy**: Use Default Values
```javascript
// Applies safe default values for missing fields
```

## Usage

### Using Validation Chains (Recommended)

The best way to use the recovery system is through **Validation Chains**, which automatically advance through multiple checks:

```javascript
const { ValidationChain } = require('./validationChain');

// Create a chain
const chain = new ValidationChain('Wallet Creation');

chain
  .addValidation({
    name: 'Validate Address Format',
    validate: async (ctx) => {
      // Your validation logic
      if (isValidAddress(ctx.address)) {
        return { success: true };
      }
      return { success: false, error: new Error('Invalid address') };
    },
    onSuccess: (ctx) => {
      console.log('✅ Address validated, auto-advancing...');
    }
  })
  .addValidation({
    name: 'Fetch Balance',
    validate: async (ctx) => {
      const balance = await fetchBalance(ctx.address);
      ctx.balance = balance;
      return { success: true, context: ctx };
    },
    onSuccess: (ctx) => {
      console.log('✅ Balance fetched, auto-advancing...');
    }
  })
  .addValidation({
    name: 'Save to Database',
    validate: async (ctx) => {
      await saveWallet(ctx);
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ Wallet saved!');
    }
  });

// Execute the chain - automatically advances through all validations
const result = await chain.execute({ address: '0x123...', type: 'ethereum' });

if (result.success) {
  console.log('All validations passed!');
  console.log(`Completed ${result.completedValidations}/${result.totalValidations}`);
}
```

**What happens:**
1. ✅ Address validates → **Auto-advances** to balance fetch
2. ✅ Balance fetched → **Auto-advances** to database save
3. ✅ Database saved → Chain completes

**If any step fails:**
1. ⚠️ Validation fails → Recovery Strategy #1 applied
2. ↻ Re-validates → Still fails? → Recovery Strategy #2 (DIFFERENT)
3. ↻ Re-validates → Success? → **Auto-advances** to next validation

### In Route Handlers

```javascript
const { withRecovery } = require('./recoveryMiddleware');

// Wrap your route handler
router.post('/wallets', withRecovery(async (req, res) => {
  // Your code here - errors are automatically recovered
  const wallet = await createWallet(req.body);
  res.json({ wallet });
}));
```

### In Async Functions

```javascript
const { withRecoveryAsync } = require('./recoveryMiddleware');

async function fetchBalance(address, chain) {
  const result = await withRecoveryAsync(
    async (ctx) => {
      return await blockchain.getNativeBalance(ctx.address, ctx.chain);
    },
    { address, chain },
    // Optional validation function
    async (ctx) => {
      const balance = await blockchain.getNativeBalance(ctx.address, ctx.chain);
      return { success: balance >= 0 };
    }
  );
  
  if (result.success) {
    return result.result;
  } else {
    throw new Error(result.error);
  }
}
```

### Manual Recovery

```javascript
const errorRecovery = require('./errorRecovery');

try {
  // Your operation
  await riskyOperation();
} catch (error) {
  // Attempt recovery
  const result = await errorRecovery.recover(
    error,
    { operation: 'riskyOperation', param: 'value' },
    async (ctx) => {
      // Validation function
      await riskyOperation();
      return { success: true };
    }
  );
  
  if (result.recovered) {
    console.log(`✅ Recovered with: ${result.strategy}`);
  } else {
    console.error(`🚨 Manual intervention required`);
  }
}
```

## API Endpoints

### Check Recovery Status

```http
GET /api/recovery/status
```

**Response:**
```json
{
  "status": "operational",
  "recoverySystem": "active",
  "recentRecoveries": [
    {
      "timestamp": "2026-02-07T20:00:00.000Z",
      "errorType": "RPC_ERROR",
      "strategy": "Switch to Backup RPC",
      "success": true
    }
  ],
  "totalRecoveries": 42
}
```

### Clear Recovery Log

```http
POST /api/recovery/clear
```

## Monitoring

### Recovery Logs

All recovery attempts are logged with:
- Timestamp
- Error type
- Strategy applied
- Success/failure
- Context details

```javascript
const errorRecovery = require('./errorRecovery');

// Get recovery history
const log = errorRecovery.getRecoveryLog();
console.log(log);
```

### Console Output

The system provides detailed console output:

```
⚠️ Request failed (attempt 1/3): getaddrinfo ENOTFOUND cloudflare-eth.com
🔧 Attempting automatic recovery...
🔧 Recovery initiated for RPC_ERROR (ID: getaddrinfo_ENOTFOUND...)
📋 Applying Strategy #1: Switch to Backup RPC
✓ Strategy applied. Re-running validation...
✅ Recovery successful! Validation passed.
```

## Configuration

### Environment Variables

```bash
# Maximum recovery attempts before manual intervention
RECOVERY_MAX_ATTEMPTS=3

# Cache TTL for balance queries
BALANCE_CACHE_TTL=60000

# Multiple RPC endpoints for automatic fallback
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_RPC_BACKUP_1=https://cloudflare-eth.com
ETHEREUM_RPC_BACKUP_2=https://rpc.ankr.com/eth
```

### Custom Strategies

Add your own recovery strategies:

```javascript
const errorRecovery = require('./errorRecovery');

errorRecovery.registerStrategy('CUSTOM_ERROR', [
  {
    name: 'My Primary Fix',
    priority: 1,
    action: async (error, context) => {
      // Your recovery logic
      return {
        success: true,
        action: 'Description of what was done',
        newContext: { ...context, fixed: true }
      };
    }
  },
  {
    name: 'My Secondary Fix',
    priority: 2,
    action: async (error, context) => {
      // Different recovery approach
      return {
        success: true,
        action: 'Different approach applied',
        newContext: { ...context, alternativeApplied: true }
      };
    }
  }
]);
```

## Benefits

### 1. Automatic Recovery
- No manual intervention needed for common errors
- System self-heals automatically
- Reduces downtime

### 2. Intelligent Strategy Selection
- Different strategies for each attempt
- Learns from failures
- Escalates appropriately

### 3. Production-Ready
- Comprehensive error handling
- Detailed logging
- Graceful degradation

### 4. Improved Reliability
- Multiple fallback options
- Automatic retry with backoff
- Network resilience

## Examples

### Example 1: RPC Failure Recovery

```
User adds wallet with address 0x742d35...
    ↓
Balance fetch fails (RPC_ERROR: ENOTFOUND cloudflare-eth.com)
    ↓
System applies Strategy #1: Switch to Backup RPC
    ↓
Switches to rpc.ankr.com/eth
    ↓
Re-runs balance fetch
    ↓
✅ Success! Balance: 1.234 ETH
```

### Example 2: Address Format Recovery

```
User enters: 742d35Cc6634C0532925a3b844Bc9e7595f0bEb
    ↓
Validation fails (ADDRESS_VALIDATION_ERROR)
    ↓
System applies Strategy #1: Auto-correct Address Format
    ↓
Adds 0x prefix: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
    ↓
Re-runs validation
    ↓
✅ Success! Address accepted
```

### Example 3: Multiple Failures → Escalation

```
Database query fails
    ↓
Strategy #1: Reconnect to Database → FAILED
    ↓
Strategy #2: Check and Repair Schema → FAILED
    ↓
Strategy #3: Reset Connection Pool → FAILED
    ↓
🚨 MANUAL INTERVENTION REQUIRED
    ↓
Flag sent to monitoring
User receives: "Service temporarily unavailable"
```

## Testing

### Test Recovery System

```javascript
const errorRecovery = require('./errorRecovery');

// Simulate an error
const testError = new Error('ENOTFOUND cloudflare-eth.com');
const context = { address: '0x123...', chain: 'ethereum' };

const result = await errorRecovery.recover(testError, context);

if (result.recovered) {
  console.log('✅ Recovery test passed');
} else {
  console.log('❌ Recovery test failed');
}
```

### Integration Tests

```bash
# Start server with recovery system
npm start

# Watch console for recovery messages
# Test with intentional failures
curl -X POST http://localhost:5000/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"address": "invalid", "type": "ethereum"}'

# Should see recovery attempts in console
```

## Troubleshooting

### Recovery Not Working

1. **Check Error Classification**
   - Verify error type is recognized
   - Add custom strategy if needed

2. **Check Strategy Execution**
   - Review console logs
   - Verify strategy actions complete

3. **Check Validation Function**
   - Ensure validation properly tests fix
   - Return correct success/failure status

### Too Many Manual Interventions

1. **Add More Strategies**
   - Expand strategy registry
   - Add more fallback options

2. **Increase Max Attempts**
   - Adjust `maxAttempts` in ErrorRecoveryManager
   - Balance between retries and user experience

3. **Improve Primary Strategies**
   - Analyze which strategies fail most
   - Optimize primary recovery methods

## Best Practices

1. **Always Provide Validation Function**
   - Ensures fix actually worked
   - Prevents false positives

2. **Make Strategies Idempotent**
   - Safe to run multiple times
   - No side effects from retries

3. **Log Everything**
   - Track all recovery attempts
   - Monitor for patterns

4. **Test Recovery Paths**
   - Simulate failures
   - Verify recovery works

5. **Monitor Manual Interventions**
   - Track escalation rate
   - Add strategies for common failures

## Validation Chain Features

### Optional vs Required Validations

```javascript
chain
  .addValidation({
    name: 'Optional Email Validation',
    required: false, // Won't stop chain if it fails
    validate: async (ctx) => {
      return { success: await validateEmail(ctx.email) };
    }
  })
  .addValidation({
    name: 'Critical Security Check',
    required: true, // Will stop chain if it fails
    validate: async (ctx) => {
      return { success: await securityCheck(ctx) };
    }
  });
```

### Context Flow

Context data automatically flows through the entire chain:

```javascript
const result = await chain.execute({ 
  userId: '123', 
  action: 'transfer' 
});

// Each validation can read and modify context
// Final result.context contains all accumulated data
console.log(result.context); // { userId: '123', action: 'transfer', balance: 100, ... }
```

### Success and Failure Callbacks

```javascript
chain.addValidation({
  name: 'Process Payment',
  validate: async (ctx) => {
    // validation logic
  },
  onSuccess: (ctx) => {
    console.log(`Payment processed: $${ctx.amount}`);
    sendEmail(ctx.email, 'Payment successful');
  },
  onFailure: (ctx, error) => {
    console.error(`Payment failed: ${error.message}`);
    logToMonitoring(error);
  }
});
```

### Pre-built Chains

Use ready-made chains for common operations:

```javascript
const { walletCreationChain, transactionChain } = require('./validationChain');

// Wallet creation with auto-advancement
const result = await walletCreationChain({
  address: '0x123...',
  type: 'ethereum',
  name: 'My Wallet'
});

// Transaction processing with auto-advancement
const txResult = await transactionChain({
  walletId: 'abc123',
  amount: 100,
  balance: 500
});
```

## Future Enhancements

- [ ] Machine learning for strategy selection
- [ ] Predictive failure detection
- [ ] Automatic strategy optimization
- [ ] Integration with monitoring tools
- [ ] Recovery performance metrics
- [ ] A/B testing for strategies
- [ ] User notification system
- [ ] Recovery time SLA tracking
- [x] Validation chains with auto-advancement ✅
- [x] Context flow through validations ✅
- [x] Optional vs required validations ✅

## Support

For issues with the recovery system:
1. Check recovery logs: `GET /api/recovery/status`
2. Review console output for recovery attempts
3. Verify strategies are registered correctly
4. Check validation functions return proper format
5. Test validation chains with test suite

## License

MIT
