# Assets in Control

A full-stack cryptocurrency wallet management application that allows you to connect all your different wallets, manage staked cryptocurrencies, and perform transactions like withdrawals, trades, and deposits - all from a unified dashboard.

## Features

✅ **Wallet Management**
- Connect multiple cryptocurrency wallets
- Support for Ethereum, Bitcoin, Binance Smart Chain, Polygon, Solana, and Cardano
- Verify wallet connections
- View wallet balances in real-time

✅ **Staking Dashboard**
- View all staked assets across all wallets
- See total staked amounts by cryptocurrency
- Monitor APY (Annual Percentage Yield) for each stake
- Unstake assets with a single click
- Summary view of total staked value

✅ **Transaction Management**
- Stake cryptocurrency
- Withdraw funds
- Trade crypto for cash
- Deposit to external accounts
- View transaction history with status tracking

✅ **Unified Dashboard**
- Clean, modern interface
- Tabbed navigation for easy access
- Real-time balance updates
- Responsive design

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- RESTful API architecture
- CORS enabled for frontend communication

### Frontend
- **React** (v19.2.4)
- **Axios** for API communication
- Modern CSS with gradient designs
- Component-based architecture

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Assets-in-control-
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure environment variables (optional)**
   ```bash
   # Create .env file in root directory if needed
   echo "PORT=5000" > .env
   
   # Create .env file in client directory if needed
   cp client/.env.example client/.env
   ```

4. **Start the application**
   ```bash
   # Option 1: Run both frontend and backend concurrently
   npm run dev

   # Option 2: Run backend only
   npm run server

   # Option 3: Run frontend only (in client directory)
   cd client && npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Wallets
- `GET /api/wallets` - Get all wallets
- `GET /api/wallets/:id` - Get wallet by ID
- `POST /api/wallets` - Add new wallet
- `PUT /api/wallets/:id/verify` - Verify wallet
- `PUT /api/wallets/:id/balance` - Update wallet balance
- `DELETE /api/wallets/:id` - Delete wallet

### Staking
- `GET /api/staking` - Get all staked assets
- `GET /api/staking/wallet/:walletId` - Get staked assets by wallet
- `GET /api/staking/summary` - Get staking summary
- `POST /api/staking` - Stake cryptocurrency
- `PUT /api/staking/:id/unstake` - Unstake asset
- `DELETE /api/staking/:id` - Remove staked asset

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/wallet/:walletId` - Get transactions by wallet
- `POST /api/transactions/withdraw` - Create withdrawal
- `POST /api/transactions/trade` - Create trade transaction
- `POST /api/transactions/deposit` - Create deposit transaction
- `PUT /api/transactions/:id/status` - Update transaction status

## Usage Guide

### Adding a Wallet

1. Click the "Wallets" tab
2. Click "+ Add New Wallet" button
3. Enter wallet details:
   - Wallet Name (e.g., "My Ethereum Wallet")
   - Wallet Address (e.g., "0x...")
   - Select Wallet Type
4. Click "Add Wallet"
5. Verify the wallet by clicking "Verify" button

### Staking Cryptocurrency

1. Go to the "Transactions" tab
2. Click "Stake Assets" button
3. Select wallet, cryptocurrency, and amount
4. Submit the transaction
5. View staked assets in the "Staking Dashboard" tab

### Viewing Staking Summary

1. Navigate to "Staking Dashboard" tab
2. View summary cards showing:
   - Total cryptocurrencies staked
   - Total staked value
   - Number of active stakes
3. Scroll down to see detailed tables of:
   - All staked assets
   - Staking summary by cryptocurrency

### Managing Transactions

1. Go to "Transactions" tab
2. Use quick action buttons:
   - **Stake Assets**: Add new staking position
   - **Withdraw**: Remove funds from wallet
   - **Trade for Cash**: Convert crypto to fiat
   - **Deposit**: Add funds to wallet
3. View transaction history in the table below

### Unstaking Assets

1. Go to "Staking Dashboard" tab
2. Find the asset you want to unstake
3. Click the "Unstake" button
4. Confirm the action
5. Check "Transactions" tab for the unstake transaction

## Database Schema

### Wallets Table
- `id` (TEXT) - Primary key
- `name` (TEXT) - Wallet name
- `address` (TEXT) - Wallet address (unique)
- `type` (TEXT) - Wallet type (ethereum, bitcoin, etc.)
- `balance` (REAL) - Current balance
- `verified` (INTEGER) - Verification status
- `created_at` (DATETIME) - Creation timestamp

### Staked Assets Table
- `id` (TEXT) - Primary key
- `wallet_id` (TEXT) - Foreign key to wallets
- `cryptocurrency` (TEXT) - Cryptocurrency type
- `amount` (REAL) - Staked amount
- `staked_at` (DATETIME) - Stake timestamp
- `apy` (REAL) - Annual percentage yield
- `status` (TEXT) - Status (active, unstaking)

### Transactions Table
- `id` (TEXT) - Primary key
- `wallet_id` (TEXT) - Foreign key to wallets
- `type` (TEXT) - Transaction type (withdraw, trade, deposit, unstake)
- `cryptocurrency` (TEXT) - Cryptocurrency type
- `amount` (REAL) - Transaction amount
- `status` (TEXT) - Transaction status (pending, completed)
- `created_at` (DATETIME) - Transaction timestamp

## Development

### Project Structure
```
Assets-in-control-/
├── server/               # Backend server
│   ├── index.js         # Express server
│   ├── database.js      # Database configuration
│   └── routes/          # API routes
│       ├── wallets.js
│       ├── staking.js
│       └── transactions.js
├── client/              # React frontend
│   ├── public/
│   └── src/
│       ├── components/  # React components
│       ├── services/    # API services
│       ├── styles/      # CSS styles
│       └── App.js       # Main app component
├── package.json         # Root dependencies
└── README.md           # This file
```

### Available Scripts

In the root directory:
- `npm start` - Start backend server only
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend with nodemon
- `npm run client` - Start frontend
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## Security Notes

⚠️ **Important**: This is a demonstration application. For production use:
- Implement proper authentication and authorization
- Use environment variables for sensitive data
- Add input validation and sanitization
- Implement rate limiting
- Use HTTPS for all connections
- Secure the database with proper credentials
- Add proper error handling and logging
- Implement wallet connection verification with actual blockchain APIs

## Future Enhancements

- [ ] Real blockchain integration (Web3.js, ethers.js)
- [ ] User authentication and multi-user support
- [ ] Real-time price tracking
- [ ] Portfolio analytics and charts
- [ ] Push notifications for transactions
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Export transaction history
- [ ] Advanced filtering and search

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
