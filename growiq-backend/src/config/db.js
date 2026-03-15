// src/config/db.js
// PostgreSQL connection pool
const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

const poolConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
    };

poolConfig.max = 20;
poolConfig.idleTimeoutMillis = 30000;
poolConfig.connectionTimeoutMillis = 5000;

// Required for cloud databases like Supabase or Neon to prevent connection drops in production environments
if (env.NODE_ENV === 'production' || (env.DB_HOST && env.DB_HOST.includes('supabase.co')) || process.env.DATABASE_URL) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', () => {
    logger.info('PostgreSQL connected');
});

pool.on('error', (err) => {
    logger.error('PostgreSQL pool error:', err);
});

// Helper function for queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug(`Query executed in ${duration}ms: ${text.substring(0, 80)}...`);
        return result;
    } catch (error) {
        logger.error(`Query failed: ${text.substring(0, 80)}...`, error);
        throw error;
    }
};

// Transaction helper
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { pool, query, transaction };
