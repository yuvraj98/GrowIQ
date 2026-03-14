// src/services/whatsappService.js
// WhatsApp service — mock for free development
const env = require('../config/env');
const logger = require('../utils/logger');

async function sendWhatsAppMessage({ phone, message }) {
    if (env.WHATSAPP_MODE === 'live') {
        // TODO: Sprint 10 — 360dialog API integration
        logger.info(`[360dialog] Would send WhatsApp to ${phone}`);
        return;
    }

    // Mock — just log it
    logger.info(`[MockWhatsApp] To: ${phone} | Message: ${message.substring(0, 100)}...`);
}

module.exports = { sendWhatsAppMessage };
