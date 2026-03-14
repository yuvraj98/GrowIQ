const Joi = require('joi');
const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
    /**
     * @route POST /api/v1/auth/register
     */
    static async register(req, res, next) {
        try {
            // Validation Schema
            const schema = Joi.object({
                agency: Joi.object({
                    name: Joi.string().required().max(255),
                    plan: Joi.string().valid('free', 'pro', 'enterprise').default('free')
                }).required(),
                user: Joi.object({
                    name: Joi.string().required().max(255),
                    email: Joi.string().email().required(),
                    password: Joi.string().min(8).required()
                }).required()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const result = await AuthService.registerAgency(value.agency, value.user);

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: result.user.id,
                        name: result.user.name,
                        email: result.user.email,
                        role: result.user.role,
                        agencyId: result.agency.id
                    },
                    agency: result.agency,
                    tokens: result.tokens
                }
            });
        } catch (error) {
            logger.error('Registration error:', error);
            if (error.message === 'Email already registered') {
                return res.status(409).json({
                    success: false,
                    error: { code: 'CONFLICT', message: error.message }
                });
            }
            next(error);
        }
    }

    /**
     * @route POST /api/v1/auth/login
     */
    static async login(req, res, next) {
        try {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const { user, tokens } = await AuthService.login(value.email, value.password);

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        agencyId: user.agency_id
                    },
                    tokens
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
            if (error.message === 'Invalid email or password' || error.message === 'Account is inactive') {
                return res.status(401).json({
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: error.message }
                });
            }
            next(error);
        }
    }

    /**
     * @route POST /api/v1/auth/refresh
     */
    static async refresh(req, res, next) {
        try {
            const schema = Joi.object({
                refreshToken: Joi.string().required()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const tokens = await AuthService.refreshToken(value.refreshToken);

            res.status(200).json({
                success: true,
                data: { tokens }
            });
        } catch (error) {
            logger.error('Refresh token error:', error);
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: error.message }
            });
        }
    }
    /**
     * @route POST /api/v1/auth/forgot-password
     */
    static async forgotPassword(req, res, next) {
        try {
            const schema = Joi.object({
                email: Joi.string().email().required()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            await AuthService.forgotPassword(value.email);

            res.status(200).json({
                success: true,
                message: 'Password reset link sent to your email'
            });
        } catch (error) {
            logger.error('Forgot password error:', error);
            // Don't reveal if user exists for security, but we'll follow previous pattern for now
            if (error.message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: error.message }
                });
            }
            next(error);
        }
    }

    /**
     * @route POST /api/v1/auth/reset-password
     */
    static async resetPassword(req, res, next) {
        try {
            const schema = Joi.object({
                token: Joi.string().required(),
                password: Joi.string().min(8).required()
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            await AuthService.resetPassword(value.token, value.password);

            res.status(200).json({
                success: true,
                message: 'Password has been reset successfully'
            });
        } catch (error) {
            logger.error('Reset password error:', error);
            return res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: error.message }
            });
        }
    }
}

module.exports = AuthController;
