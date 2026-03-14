// src/utils/fileStorage.js
// File storage — toggles between local filesystem (free) and AWS S3
const fs = require('fs').promises;
const path = require('path');
const env = require('../config/env');
const logger = require('./logger');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * Upload a file — local or S3
 */
async function uploadFile(filePath, key) {
    if (env.USE_S3) {
        // TODO: Sprint 16 — S3 upload
        logger.info(`[S3] Would upload ${key} to S3`);
        return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    }

    // Local filesystem
    const destPath = path.join(UPLOADS_DIR, key);
    const destDir = path.dirname(destPath);

    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(filePath, destPath);

    logger.info(`[LocalStorage] File saved: ${key}`);
    return `/uploads/${key}`;
}

/**
 * Get file URL — local or S3
 */
function getFileUrl(key) {
    if (env.USE_S3) {
        return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    }
    return `/uploads/${key}`;
}

/**
 * Delete a file
 */
async function deleteFile(key) {
    if (env.USE_S3) {
        logger.info(`[S3] Would delete ${key} from S3`);
        return;
    }

    const filePath = path.join(UPLOADS_DIR, key);
    try {
        await fs.unlink(filePath);
        logger.info(`[LocalStorage] File deleted: ${key}`);
    } catch {
        // File might not exist
    }
}

// Ensure uploads directory exists
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(() => { });

module.exports = { uploadFile, getFileUrl, deleteFile };
