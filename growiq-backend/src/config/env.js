// src/config/env.js
// Environment variable validation and defaults
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  
  // Database (PostgreSQL)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
  DB_NAME: process.env.DB_NAME || 'dmtrack_development',
  DB_USER: process.env.DB_USER || 'dmtrack',
  DB_PASSWORD: process.env.DB_PASSWORD || 'dmtrack_dev_2026',
  
  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dmtrack-dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dmtrack-refresh-secret-change-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // AI Service
  AI_SERVICE_MODE: process.env.AI_SERVICE_MODE || 'mock', // 'mock' or 'live'
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  
  // External APIs - Toggle
  USE_MOCK_APIS: process.env.USE_MOCK_APIS === 'true' || process.env.NODE_ENV === 'development',
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_SECRET: process.env.RAZORPAY_SECRET || '',
  RAZORPAY_MODE: process.env.RAZORPAY_MODE || 'test',
  
  // Email
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'ethereal', // 'ethereal' or 'sendgrid'
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@dmtrack.in',
  
  // File Storage
  USE_S3: process.env.USE_S3 === 'true',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'dmtrack-files',
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // WhatsApp
  WHATSAPP_MODE: process.env.WHATSAPP_MODE || 'mock', // 'mock' or 'live'
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || '',
};

// Validate required vars in production
if (env.NODE_ENV === 'production') {
  const required = ['DB_HOST', 'DB_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = env;
