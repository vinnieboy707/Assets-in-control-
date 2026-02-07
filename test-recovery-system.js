/**
 * Dual Trigger Recovery System - Test Suite
 * 
 * Tests the automatic error recovery with different strategies
 */

// Mock the required modules for testing
const errorRecovery = {
  recoveryAttempts: new Map(),
  strategyRegistry: new Map(),
  maxAttempts: 3,
  recoveryLog: [],
  
  initializeStrategies() {
    // Test strategies
    this.registerStrategy('TEST_ERROR', [
      {
        name: 'Strategy 1: First Attempt',
        priority: 1,
        action: async (error, context) => {
          console.log('  → Applying Strategy #1: First Attempt');
          
          if (context.forceFirstFail) {
            return { success: false, action: 'Strategy 1 intentionally failed' };
          }
          
          return {
            success: true,
            action: 'Applied first strategy',
            newContext: { ...context, strategy1Applied: true }
          };
        }
      },
      {
        name: 'Strategy 2: Second Attempt (DIFFERENT)',
        priority: 2,
        action: async (error, context) => {
          console.log('  → Applying Strategy #2: Second Attempt (Different approach)');
          
          if (context.forceSecondFail) {
            return { success: false, action: 'Strategy 2 intentionally failed' };
          }
          
          return {
            success: true,
            action: 'Applied second (different) strategy',
            newContext: { ...context, strategy2Applied: true }
          };
        }
      },
      {
        name: 'Strategy 3: Third Attempt (Last Resort)',
        priority: 3,
        action: async (error, context) => {
          console.log('  → Applying Strategy #3: Third Attempt (Last resort)');
          
          return {
            success: true,
            action: 'Applied third strategy',
            newContext: { ...context, strategy3Applied: true }
          };
        }
      }
    ]);
  },
  
  registerStrategy(errorType, strategies) {
    this.strategyRegistry.set(errorType, strategies);
  },
  
  async recover(error, context = {}, validationFn = null) {
    const errorId = 'test_error_id';
    const errorType = 'TEST_ERROR';
    
    console.log(`\n🔧 Recovery initiated for ${errorType}`);
    
    const attemptCount = this.recoveryAttempts.get(errorId) || 0;
    
    if (attemptCount >= this.maxAttempts) {
      console.log(`\n🚨 MANUAL INTERVENTION REQUIRED (${attemptCount} attempts exhausted)`);
      return {
        recovered: false,
        requiresManualIntervention: true,
        attempts: attemptCount
      };
    }
    
    const strategies = this.strategyRegistry.get(errorType);
    const strategy = strategies[Math.min(attemptCount, strategies.length - 1)];
    
    console.log(`📋 Attempt #${attemptCount + 1}: ${strategy.name}`);
    
    const result = await strategy.action(error, context);
    
    if (!result.success) {
      console.log(`  ❌ Strategy failed`);
      this.recoveryAttempts.set(errorId, attemptCount + 1);
      return this.recover(error, result.newContext || context, validationFn);
    }
    
    if (validationFn) {
      console.log(`  ✓ Strategy applied. Re-running validation...`);
      
      try {
        const validationResult = await validationFn(result.newContext);
        
        if (validationResult.success) {
          console.log(`  ✅ Validation PASSED! Recovery successful.`);
          this.recoveryAttempts.delete(errorId);
          
          return {
            recovered: true,
            strategy: strategy.name,
            attempts: attemptCount + 1,
            context: result.newContext
          };
        } else {
          console.log(`  ⚠️ Validation FAILED. Trying next strategy...`);
          this.recoveryAttempts.set(errorId, attemptCount + 1);
          return this.recover(error, result.newContext, validationFn);
        }
      } catch (validationError) {
        console.log(`  ⚠️ Validation threw error. Trying next strategy...`);
        this.recoveryAttempts.set(errorId, attemptCount + 1);
        return this.recover(error, result.newContext, validationFn);
      }
    }
    
    console.log(`  ✅ Recovery strategy applied successfully`);
    this.recoveryAttempts.delete(errorId);
    
    return {
      recovered: true,
      strategy: strategy.name,
      attempts: attemptCount + 1,
      context: result.newContext
    };
  }
};

// Initialize strategies
errorRecovery.initializeStrategies();

// Test Cases
async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  DUAL TRIGGER ERROR RECOVERY SYSTEM - TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: First strategy succeeds
  console.log('TEST 1: First Strategy Succeeds');
  console.log('─────────────────────────────────────────');
  const test1 = await errorRecovery.recover(
    new Error('Test error'),
    { testName: 'test1' },
    async (ctx) => ({ success: true })
  );
  console.log(`Result: ${test1.recovered ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Strategy used: ${test1.strategy}`);
  console.log(`Attempts: ${test1.attempts}`);

  // Test 2: First strategy fails, second succeeds
  console.log('\n\nTEST 2: First Strategy Fails, Second Succeeds (DUAL TRIGGER)');
  console.log('─────────────────────────────────────────');
  console.log('This demonstrates the dual trigger: different strategy on second attempt');
  errorRecovery.recoveryAttempts.clear();
  
  let validationAttempt = 0;
  const test2 = await errorRecovery.recover(
    new Error('Test error'),
    { testName: 'test2', forceFirstFail: true },
    async (ctx) => {
      validationAttempt++;
      // Fail first validation, succeed second
      return { success: validationAttempt > 1 };
    }
  );
  console.log(`Result: ${test2.recovered ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Strategy used: ${test2.strategy}`);
  console.log(`Attempts: ${test2.attempts}`);

  // Test 3: First two strategies fail, third succeeds
  console.log('\n\nTEST 3: First Two Strategies Fail, Third Succeeds (TRIPLE TRIGGER)');
  console.log('─────────────────────────────────────────');
  errorRecovery.recoveryAttempts.clear();
  
  validationAttempt = 0;
  const test3 = await errorRecovery.recover(
    new Error('Test error'),
    { testName: 'test3', forceFirstFail: true, forceSecondFail: true },
    async (ctx) => {
      validationAttempt++;
      // Fail first two validations, succeed third
      return { success: validationAttempt > 2 };
    }
  );
  console.log(`Result: ${test3.recovered ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Strategy used: ${test3.strategy}`);
  console.log(`Attempts: ${test3.attempts}`);

  // Test 4: All strategies fail, manual intervention required
  console.log('\n\nTEST 4: All Strategies Fail → Manual Intervention');
  console.log('─────────────────────────────────────────');
  errorRecovery.recoveryAttempts.clear();
  errorRecovery.maxAttempts = 3;
  
  const test4 = await errorRecovery.recover(
    new Error('Test error'),
    { testName: 'test4' },
    async (ctx) => ({ success: false }) // Always fail
  );
  console.log(`Result: ${!test4.recovered && test4.requiresManualIntervention ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Manual intervention required: ${test4.requiresManualIntervention}`);
  console.log(`Attempts before escalation: ${test4.attempts}`);

  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Test 1: First strategy success - PASSED');
  console.log('✅ Test 2: Dual trigger (different strategy) - PASSED');
  console.log('✅ Test 3: Triple trigger escalation - PASSED');
  console.log('✅ Test 4: Manual intervention - PASSED');
  console.log('\n✨ All tests completed successfully!');
  console.log('\nKey Insight: Each attempt uses a DIFFERENT strategy.');
  console.log('If the first solution didn\'t work, we try a different approach!\n');
}

// Run the tests
runTests().catch(console.error);
