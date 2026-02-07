const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'assets.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  db.serialize(() => {
    // Wallets table
    db.run(`
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        balance REAL DEFAULT 0,
        verified INTEGER DEFAULT 0,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Staked assets table
    db.run(`
      CREATE TABLE IF NOT EXISTS staked_assets (
        id TEXT PRIMARY KEY,
        wallet_id TEXT NOT NULL,
        cryptocurrency TEXT NOT NULL,
        amount REAL NOT NULL,
        staked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        unstake_deadline DATETIME,
        apy REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        lock_period_days INTEGER DEFAULT 0,
        FOREIGN KEY (wallet_id) REFERENCES wallets(id)
      )
    `);

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        wallet_id TEXT NOT NULL,
        type TEXT NOT NULL,
        cryptocurrency TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_id) REFERENCES wallets(id)
      )
    `);

    // Airdrops table
    db.run(`
      CREATE TABLE IF NOT EXISTS airdrops (
        id TEXT PRIMARY KEY,
        wallet_id TEXT NOT NULL,
        name TEXT NOT NULL,
        cryptocurrency TEXT NOT NULL,
        amount REAL DEFAULT 0,
        eligibility_criteria TEXT,
        claim_deadline DATETIME,
        claimed INTEGER DEFAULT 0,
        claimed_at DATETIME,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_id) REFERENCES wallets(id)
      )
    `);

    console.log('Database initialized successfully');
  });
};

module.exports = {
  db,
  initDatabase
};
