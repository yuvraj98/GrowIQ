const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, transaction } = require('../config/db');
const env = require('../config/env');
const logger = require('../utils/logger');
const MailService = require('../utils/mailService');

class AuthService {
    /**
     * Generate access and refresh tokens
     */
    static generateTokens(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            agencyId: user.agency_id || user.agencyId,
        };

        const accessToken = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        });

        const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        });

        return { accessToken, refreshToken };
    }

    /**
     * Register a new agency and owner user
     */
    static async registerAgency(agencyData, userData) {
        return await transaction(async (client) => {
            // Check if email exists
            const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [userData.email]);
            if (existingUser.rows.length > 0) {
                throw new Error('Email already registered');
            }

            // Create agency
            const agencyResult = await client.query(
                'INSERT INTO agencies (name, plan) VALUES ($1, $2) RETURNING id, name, plan',
                [agencyData.name, agencyData.plan || 'free']
            );
            const agency = agencyResult.rows[0];

            // Hash password
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(userData.password, salt);

            // Create owner user
            const userResult = await client.query(
                `INSERT INTO users (agency_id, name, email, password_hash, role) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING id, agency_id, name, email, role`,
                [agency.id, userData.name, userData.email, passwordHash, 'owner']
            );
            const user = userResult.rows[0];

            // Generate tokens
            const tokens = this.generateTokens({
                ...user,
                agencyId: agency.id
            });

            return { user, agency, tokens };
        });
    }

    /**
     * Login user
     */
    static async login(email, password) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            throw new Error('Invalid email or password');
        }

        const user = result.rows[0];

        if (!user.is_active) {
            throw new Error('Account is inactive');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const tokens = this.generateTokens(user);

        // Remove sensitive generic data
        delete user.password_hash;

        return { user, tokens };
    }

    /**
     * Refresh access token
     */
    static async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
            
            // Check if user still exists and is active
            const result = await query('SELECT id, email, role, agency_id, is_active FROM users WHERE id = $1', [decoded.id]);
            if (result.rows.length === 0 || !result.rows[0].is_active) {
                throw new Error('User inactive or deleted');
            }

            const user = result.rows[0];
            const tokens = this.generateTokens(user);

            return tokens;
        } catch (error) {
            logger.error('Token refresh error:', error);
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Handle forgot password
     */
    static async forgotPassword(email) {
        const result = await query('SELECT id, email FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = result.rows[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await query(
            'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
            [token, expires, user.id]
        );

        await MailService.sendPasswordResetEmail(user.email, token);
        return true;
    }

    /**
     * Handle reset password
     */
    static async resetPassword(token, newPassword) {
        const result = await query(
            'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
            [token, new Date()]
        );

        if (result.rows.length === 0) {
            throw new Error('Invalid or expired reset token');
        }

        const user = result.rows[0];
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await query(
            'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
            [passwordHash, user.id]
        );

        return true;
    }
}

module.exports = AuthService;
