// src/middleware/validator.js
// Request validation middleware using Joi
const Joi = require('joi');

/**
 * Creates a validation middleware for request body
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                    details: error.details.map((d) => ({
                        field: d.path.join('.'),
                        message: d.message,
                    })),
                },
            });
        }

        req.body = value;
        next();
    };
};

/**
 * Creates a validation middleware for query parameters
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid query parameters',
                    details: error.details.map((d) => ({
                        field: d.path.join('.'),
                        message: d.message,
                    })),
                },
            });
        }

        req.query = value;
        next();
    };
};

/**
 * Creates a validation middleware for URL parameters
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid URL parameters',
                    details: error.details.map((d) => ({
                        field: d.path.join('.'),
                        message: d.message,
                    })),
                },
            });
        }

        req.params = value;
        next();
    };
};

module.exports = { validateBody, validateQuery, validateParams };
