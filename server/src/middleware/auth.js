// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to check if user is authenticated (optional)
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }
  next();
};

module.exports = {
  verifyToken,
  isAuthenticated,
};