/**
 * Notification Service
 * Handles browser notifications for transactions and important events
 */

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.checkPermission();
  }

  /**
   * Check current notification permission
   */
  checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   */
  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.log('Notification permission denied');
        return null;
      }
    }

    const defaultOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    return new Notification(title, defaultOptions);
  }

  /**
   * Show transaction notification
   * @param {string} type - Transaction type
   * @param {Object} transaction - Transaction details
   */
  async notifyTransaction(type, transaction) {
    const titles = {
      stake: '🏦 Staking Transaction',
      unstake: '🔓 Unstaking Transaction',
      withdraw: '💸 Withdrawal',
      deposit: '💰 Deposit',
      trade: '🔄 Trade',
      completed: '✅ Transaction Completed',
      failed: '❌ Transaction Failed'
    };

    const title = titles[type] || '📢 Transaction Update';
    
    const body = type === 'completed' 
      ? `Your ${transaction.type} of ${transaction.amount} ${transaction.cryptocurrency} has been completed successfully.`
      : type === 'failed'
      ? `Your ${transaction.type} transaction failed. Please try again.`
      : `${transaction.amount} ${transaction.cryptocurrency} - Status: ${transaction.status}`;

    return this.showNotification(title, {
      body,
      tag: `transaction-${transaction.id}`,
      data: transaction
    });
  }

  /**
   * Show wallet notification
   * @param {string} message - Notification message
   */
  async notifyWallet(message) {
    return this.showNotification('💼 Wallet Update', {
      body: message,
      tag: 'wallet-update'
    });
  }

  /**
   * Show price alert notification
   * @param {string} crypto - Cryptocurrency symbol
   * @param {number} price - Current price
   * @param {number} change - Price change percentage
   */
  async notifyPriceAlert(crypto, price, change) {
    const emoji = change >= 0 ? '📈' : '📉';
    const direction = change >= 0 ? 'up' : 'down';
    
    return this.showNotification(`${emoji} Price Alert: ${crypto}`, {
      body: `${crypto} is ${direction} ${Math.abs(change).toFixed(2)}% to $${price.toFixed(2)}`,
      tag: `price-${crypto}`
    });
  }

  /**
   * Show staking notification
   * @param {string} message - Notification message
   */
  async notifyStaking(message) {
    return this.showNotification('🏦 Staking Update', {
      body: message,
      tag: 'staking-update'
    });
  }

  /**
   * Show airdrop notification
   * @param {string} name - Airdrop name
   * @param {number} amount - Airdrop amount
   * @param {string} crypto - Cryptocurrency
   */
  async notifyAirdrop(name, amount, crypto) {
    return this.showNotification('🎁 Airdrop Available!', {
      body: `New airdrop: ${name} - ${amount} ${crypto}`,
      tag: 'airdrop-notification',
      requireInteraction: true
    });
  }

  /**
   * Check if notifications are supported
   */
  isSupported() {
    return 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus() {
    return this.permission;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
