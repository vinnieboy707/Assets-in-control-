const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validate JWT_SECRET is set in production
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production environment');
}

// Use a default only in development
const SECRET = JWT_SECRET || 'dev-secret-key-only-for-local-testing';

/**
 * Generate JWT token
 */
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Hash password
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Authentication middleware
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

/**
 * Optional authentication middleware (allows both authenticated and guest access)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticateToken,
  optionalAuth
};
