const dotenv = require('dotenv');
dotenv.config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET'];
requiredEnv.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  MPESA: {
    CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
    PASSKEY: process.env.MPESA_PASSKEY,
    SHORTCODE: process.env.MPESA_SHORTCODE,
    CALLBACK_URL: process.env.MPESA_CALLBACK_URL
  }
};