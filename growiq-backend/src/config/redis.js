// src/config/redis.js
// Redis client for caching and job queue
const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let redis;

try {
    redis = new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        lazyConnect: true, // Don't connect immediately - allows graceful fallback
    });

    redis.on('connect', () => {
        logger.info('Redis connected');
    });

    redis.on('error', (err) => {
        logger.warn('Redis connection error (caching disabled):', err.message);
    });
} catch (error) {
    logger.warn('Redis not available — caching disabled. App will work without it.');
    // Create a mock redis that does nothing (graceful fallback)
    redis = {
        get: async () => null,
        set: async () => 'OK',
        del: async () => 0,
        setex: async () => 'OK',
        exists: async () => 0,
        connect: async () => { },
        status: 'mock',
    };
}

// Cache helpers
const cache = {
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    async set(key, data, ttlSeconds = 900) {
        try {
            await redis.setex(key, ttlSeconds, JSON.stringify(data));
        } catch {
            // Silently fail - cache is optional
        }
    },

    async del(key) {
        try {
            await redis.del(key);
        } catch {
            // Silently fail
        }
    },

    async invalidate(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch {
            // Silently fail
        }
    },
};

module.exports = { redis, cache };
