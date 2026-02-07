const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
const db = require('./database');
db.initDatabase();

// Initialize error recovery system
const errorRecovery = require('./errorRecovery');
const { errorRecoveryMiddleware } = require('./recoveryMiddleware');

// API Routes
const walletRoutes = require('./routes/wallets');
const stakingRoutes = require('./routes/staking');
const transactionRoutes = require('./routes/transactions');
const airdropRoutes = require('./routes/airdrops');
const authRoutes = require('./routes/auth');
const priceRoutes = require('./routes/prices');
const exportRoutes = require('./routes/export');

app.use('/api/wallets', walletRoutes);
app.use('/api/staking', stakingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/airdrops', airdropRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Recovery system status endpoint
app.get('/api/recovery/status', (req, res) => {
  const log = errorRecovery.getRecoveryLog();
  res.json({
    status: 'operational',
    recoverySystem: 'active',
    recentRecoveries: log.slice(-10), // Last 10 recoveries
    totalRecoveries: log.length
  });
});

// Clear recovery log endpoint (for testing/maintenance)
app.post('/api/recovery/clear', (req, res) => {
  errorRecovery.clearRecoveryLog();
  res.json({ message: 'Recovery log cleared' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Global error handler with recovery (must be last)
app.use(errorRecoveryMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`🔧 Dual Trigger Error Recovery System: ACTIVE`);
});
