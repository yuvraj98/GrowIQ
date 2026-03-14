// src/services/emailService.js
// Email service — toggles between Ethereal (free) and SendGrid
const env = require('../config/env');
const logger = require('../utils/logger');

async function sendEmail({ to, subject, html, attachments }) {
    if (env.EMAIL_SERVICE === 'sendgrid') {
        // TODO: Sprint 2 — SendGrid integration
        logger.info(`[SendGrid] Would send email to ${to}: ${subject}`);
        return;
    }

    // Ethereal / Mock — just log it
    logger.info(`[MockEmail] To: ${to} | Subject: ${subject}`);
    logger.info(`[MockEmail] Email logged (not sent). Use SendGrid for real delivery.`);
}

module.exports = { sendEmail };
