// src/utils/encryption.js
// AES-256-GCM symmetric encryption for storing platform tokens
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
// Derive a 32-byte key from JWT_SECRET (dev-safe, use a dedicated key in prod)
const KEY = crypto
    .createHash('sha256')
    .update(process.env.JWT_SECRET || 'growiq-dev-secret-change-in-production')
    .digest();

function encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Store as: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(stored) {
    if (!stored) return null;
    try {
        const [ivHex, authTagHex, encrypted] = stored.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch {
        return null;
    }
}

module.exports = { encrypt, decrypt };
