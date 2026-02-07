# Automated Deployment Guide

## 🚀 100% Automatic Deployment

This guide explains how to deploy Assets in Control with **zero manual configuration** - everything is automated!

## Quick Start (One Command)

```bash
./quick-start.sh
```

That's it! This single command will:
- Install all dependencies
- Build the frontend
- Initialize the database
- Start the server

## Deployment Options

### Option 1: Quick Start (Recommended for Testing)

```bash
chmod +x quick-start.sh
./quick-start.sh
```

The application will start automatically at `http://localhost:5000`

### Option 2: Full Deployment Setup

```bash
chmod +x deploy.sh
./deploy.sh
```

This creates all necessary configuration files and provides multiple deployment options.

### Option 3: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 4: PM2 (Production Recommended)

```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Deploy and start
./deploy.sh
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### Option 5: Systemd Service (Linux)

```bash
# Run deployment script
./deploy.sh

# Install systemd service
sudo cp assets-in-control.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable assets-in-control
sudo systemctl start assets-in-control

# Check status
sudo systemctl status assets-in-control
```

## On-Chain Verification

The application now includes comprehensive on-chain verification endpoints:

### Verify Transaction
```bash
GET /api/verification/verify-transaction/:chain/:txHash
```

Returns:
- Transaction status (success/failed)
- Block number and hash
- Confirmations
- Gas used
- Block explorer link

### Get Verifiable Balance
```bash
GET /api/verification/balance/:chain/:address
```

Returns:
- Balance at current or specific block
- Block verification data
- Timestamp
- Block explorer link

### Verify Contract
```bash
GET /api/verification/contract/:chain/:address
```

Returns:
- Contract verification status
- Bytecode hash
- Contract size
- Block explorer link

### Get Transaction History
```bash
GET /api/verification/history/:chain/:address?fromBlock=0&toBlock=latest
```

Returns:
- All transactions/events for address
- Block numbers and hashes
- Transaction hashes
- Log data

### Get Block Explorer URLs
```bash
GET /api/verification/transaction/:chain/:txHash
GET /api/verification/address/:chain/:address
GET /api/verification/explorers
```

## Environment Configuration

The `.env` file is automatically created from `.env.example`. Key variables:

```bash
# Server
PORT=5000
NODE_ENV=production

# Authentication
JWT_SECRET=your-secret-key-change-in-production

# Blockchain RPC
ETHEREUM_RPC_URL=https://cloudflare-eth.com
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Cache
BALANCE_CACHE_TTL=60000
```

## Zero-Configuration Features

### ✅ Automatic Database Initialization
The SQLite database is automatically created and initialized on first run.

### ✅ Automatic Dependency Installation
Both backend and frontend dependencies are installed automatically.

### ✅ Automatic Frontend Build
The React frontend is built and optimized automatically.

### ✅ Automatic Port Management
If port 5000 is in use, the script handles it automatically.

### ✅ Automatic Process Management
Multiple process manager configurations are created (PM2, systemd, Docker).

### ✅ Automatic SSL/TLS Setup (with Nginx)
Nginx configuration file is created for reverse proxy setup.

## Monitoring & Health Checks

### Health Check Endpoint
```bash
GET /api/health
```

Returns server status.

### Recovery System Status
```bash
GET /api/recovery/status
```

Returns error recovery system status and recent recoveries.

## Production Deployment Checklist

1. ✅ Run deployment script: `./deploy.sh`
2. ✅ Update `.env` with production values
3. ✅ Set strong `JWT_SECRET`
4. ✅ Configure RPC endpoints with API keys
5. ✅ Set up SSL/TLS certificate
6. ✅ Configure firewall (allow port 80/443)
7. ✅ Set up domain name and DNS
8. ✅ Install and configure Nginx (if using reverse proxy)
9. ✅ Start application with PM2 or systemd
10. ✅ Set up monitoring and logging

## Nginx Reverse Proxy Setup

The deployment script creates `nginx.conf`. To use it:

```bash
# Copy to Nginx sites directory
sudo cp nginx.conf /etc/nginx/sites-available/assets-in-control
sudo ln -s /etc/nginx/sites-available/assets-in-control /etc/nginx/sites-enabled/

# Update domain name in the config
sudo nano /etc/nginx/sites-enabled/assets-in-control

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Troubleshooting

### Port Already in Use
The deployment script automatically kills processes on port 5000.

### Build Failures
The script uses `--legacy-peer-deps` to handle React 19 peer dependency issues.

### Database Issues
The database is automatically initialized. To reset:
```bash
rm server/assets.db
node -e "const db = require('./server/database'); db.initDatabase();"
```

### View Logs

**PM2:**
```bash
pm2 logs assets-in-control
```

**Systemd:**
```bash
sudo journalctl -u assets-in-control -f
```

**Docker:**
```bash
docker-compose logs -f
```

## Updating the Application

### Update Code
```bash
git pull origin main
```

### Redeploy
```bash
./deploy.sh

# Restart with PM2
pm2 restart assets-in-control

# Or with systemd
sudo systemctl restart assets-in-control

# Or with Docker
docker-compose down
docker-compose up -d --build
```

## Performance Optimization

The deployment includes:
- ✅ Production build optimization
- ✅ Static file caching
- ✅ API response caching
- ✅ Rate limiting
- ✅ Compression (if using Nginx)
- ✅ Load balancing ready

## Security Features

- ✅ Rate limiting on all endpoints
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Environment variable security

## Backup Strategy

### Database Backup
```bash
# Backup database
cp server/assets.db server/assets.db.backup

# Automated daily backup (add to crontab)
0 2 * * * cp /path/to/assets.db /path/to/backups/assets-$(date +\%Y\%m\%d).db
```

## Support

For issues:
1. Check logs (PM2/systemd/Docker)
2. Verify `.env` configuration
3. Check blockchain RPC endpoints
4. Ensure port 5000 is available
5. Review ENHANCEMENTS.md for features

## Architecture

```
┌─────────────────┐
│   Nginx/Proxy   │ (Optional)
└────────┬────────┘
         │
┌────────▼────────┐
│  Express Server │
│   Port: 5000    │
├─────────────────┤
│  - Auth Routes  │
│  - API Routes   │
│  - Verification │
│  - Static Files │
└────────┬────────┘
         │
    ┌────▼────┐
    │ SQLite  │
    │Database │
    └─────────┘
```

## What's Deployed

- ✅ Backend API (Express.js)
- ✅ Frontend SPA (React)
- ✅ Database (SQLite)
- ✅ Blockchain Integration (Ethers.js)
- ✅ Authentication System (JWT)
- ✅ Price Tracking (CoinGecko)
- ✅ Analytics Dashboard
- ✅ Export System
- ✅ Multi-language Support
- ✅ PWA Support
- ✅ **On-Chain Verification System** ⭐

## Success!

If everything is working:
- ✅ Server responds at `http://localhost:5000`
- ✅ Health check returns OK
- ✅ Frontend loads correctly
- ✅ Database is initialized
- ✅ Blockchain connections work
- ✅ On-chain verification is available

## Next Steps

1. Access application: `http://localhost:5000`
2. Create admin account
3. Add wallets
4. Start managing assets
5. Verify transactions on-chain!

---

**Need help?** Check the documentation or open an issue on GitHub.
