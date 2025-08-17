/**
 * Authentication utilities using jsonwebtoken.
 */

const jwt = require("jsonwebtoken");

/**
 * JWT secret from environment variable with fallback for demo.
 * In production, this should be set via VERCEL_JWT_SECRET environment variable.
 * @type {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || process.env.VERCEL_JWT_SECRET || "my-secret-key-fallback-for-demo";

/**
 * Generate a JWT for the given payload.
 * @param {{ id: string, username: string }} payload - Minimal user payload
 * @param {{ expiresIn?: string | number }} [options]
 * @returns {string} Signed JWT
 */
function generateToken(payload, options = {}) {
  const { expiresIn = "1h" } = options;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT string and return the decoded payload, or null if invalid/expired.
 * @param {string} token
 * @returns {{ id: string, username: string } | null}
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_err) {
    return null;
  }
}

/**
 * Extract minimal user info from a JWT.
 * @param {string} token
 * @returns {{ id: string, username: string } | null}
 */
function getUserFromToken(token) {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return { id: decoded.id, username: decoded.username };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
  getUserFromToken,
}; 