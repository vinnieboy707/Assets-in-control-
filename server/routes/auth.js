const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../auth');
const { v4: uuidv4 } = require('uuid');
const { authLimiter, apiLimiter } = require('../rateLimiter');

/**
 * Register new user
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get().get(
        'SELECT id FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await auth.hashPassword(password);

    // Create user
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    await new Promise((resolve, reject) => {
      db.get().run(
        `INSERT INTO users (id, email, password, name, created_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, email, hashedPassword, name || null, createdAt],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Generate token
    const token = auth.generateToken(userId, email);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * Login user
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const user = await new Promise((resolve, reject) => {
      db.get().get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await auth.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await new Promise((resolve, reject) => {
      db.get().run(
        'UPDATE users SET last_login = ? WHERE id = ?',
        [new Date().toISOString(), user.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Generate token
    const token = auth.generateToken(user.id, user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * Get current user
 */
router.get('/me', apiLimiter, auth.authenticateToken, async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      db.get().get(
        'SELECT id, email, name, created_at, last_login FROM users WHERE id = ?',
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * Update user profile
 */
router.put('/profile', apiLimiter, auth.authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    await new Promise((resolve, reject) => {
      db.get().run(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, req.user.userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Change password
 */
router.put('/password', authLimiter, auth.authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user
    const user = await new Promise((resolve, reject) => {
      db.get().get(
        'SELECT password FROM users WHERE id = ?',
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await auth.comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await auth.hashPassword(newPassword);

    // Update password
    await new Promise((resolve, reject) => {
      db.get().run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
