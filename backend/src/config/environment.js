const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, "../../.env") });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  DB: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASS: process.env.DB_PASS,
    NAME: process.env.DB_NAME,
    PORT: process.env.DB_PORT || 3306,
  },

  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  },

  RESEND_API_KEY: process.env.RESEND_API_KEY,
};
