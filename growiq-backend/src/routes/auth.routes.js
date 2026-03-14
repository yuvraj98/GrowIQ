// src/routes/auth.routes.js
// Authentication routes
const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter');
const AuthController = require('../controllers/auth.controller');

// POST /auth/register — Register new agency
router.post('/register', authLimiter, AuthController.register);

// POST /auth/login — Login and get JWT
router.post('/login', authLimiter, AuthController.login);

// POST /auth/refresh — Refresh access token
router.post('/refresh', AuthController.refresh);

// POST /auth/forgot-password
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
