// src/middleware/errorHandler.js
// Global error handling middleware
const logger = require('../utils/logger');

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });

    // Joi validation error
    if (err.isJoi) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.details?.[0]?.message || 'Invalid request data',
                details: err.details,
            },
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid token' },
        });
    }

    // PostgreSQL unique violation
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            error: { code: 'DUPLICATE_ENTRY', message: 'Resource already exists' },
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            error: { code: 'REFERENCE_ERROR', message: 'Referenced resource not found' },
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message,
        },
    });
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`,
        },
    });
};

module.exports = { errorHandler, notFoundHandler };
