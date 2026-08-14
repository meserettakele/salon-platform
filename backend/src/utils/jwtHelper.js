const jwt = require("jsonwebtoken");

// Ensure you have JWT_SECRET and JWT_EXPIRES_IN configured in your environment vars
const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secure_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
