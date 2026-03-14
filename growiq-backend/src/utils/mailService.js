const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./logger');

class MailService {
    static async createTransporter() {
        if (env.EMAIL_SERVICE === 'ethereal') {
            // Generate test SMTP service account from ethereal.email
            const testAccount = await nodemailer.createTestAccount();
            return nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
        } else {
            // Real SendGrid transport would go here
            return nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                auth: {
                    user: 'apikey',
                    pass: env.SENDGRID_API_KEY
                }
            });
        }
    }

    static async sendMail({ to, subject, html }) {
        try {
            const transporter = await this.createTransporter();
            const info = await transporter.sendMail({
                from: env.EMAIL_FROM,
                to,
                subject,
                html,
            });

            logger.info(`Email sent: ${info.messageId}`);
            if (env.EMAIL_SERVICE === 'ethereal') {
                logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            return info;
        } catch (error) {
            logger.error('Failed to send email:', error);
            throw error;
        }
    }

    static async sendPasswordResetEmail(email, token) {
        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
        return await this.sendMail({
            to: email,
            subject: 'GrowIQ — Password Reset Request',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6366f1;">Reset Your Password</h2>
                    <p>You requested a password reset for your GrowIQ account. Click the button below to set a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Reset Password</a>
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        });
    }
}

module.exports = MailService;
