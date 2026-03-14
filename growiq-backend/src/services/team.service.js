// src/services/team.service.js
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

class TeamService {
    /**
     * Get all active and inactive team members for an agency
     */
    static async getTeamMembers(agencyId) {
        const result = await query(`
            SELECT id, name, email, role, is_active, created_at
            FROM users
            WHERE agency_id = $1
            ORDER BY created_at ASC
        `, [agencyId]);
        return result.rows;
    }

    /**
     * Invite/create a new team member
     */
    static async inviteMember(agencyId, name, email, role, password) {
        const check = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) throw new Error('Email already registered');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const result = await query(`
            INSERT INTO users (agency_id, name, email, password_hash, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, role, is_active, created_at
        `, [agencyId, name, email, hash, role]);

        return result.rows[0];
    }

    /**
     * Update member's role
     */
    static async updateRole(agencyId, userId, role) {
        const result = await query(`
            UPDATE users SET role = $1, updated_at = NOW()
            WHERE id = $2 AND agency_id = $3
            RETURNING id, name, email, role, is_active
        `, [role, userId, agencyId]);
        
        if (!result.rows.length) throw new Error('User not found in your agency');
        return result.rows[0];
    }

    /**
     * Suspend or active a member
     */
    static async updateStatus(agencyId, userId, isActive) {
        const result = await query(`
            UPDATE users SET is_active = $1, updated_at = NOW()
            WHERE id = $2 AND agency_id = $3
            RETURNING id, name, email, role, is_active
        `, [isActive, userId, agencyId]);
        
        if (!result.rows.length) throw new Error('User not found in your agency');
        return result.rows[0];
    }

    /**
     * Delete team member forever
     */
    static async deleteMember(agencyId, userId) {
        const result = await query(`
            DELETE FROM users WHERE id = $1 AND agency_id = $2 RETURNING id
        `, [userId, agencyId]);
        
        if (!result.rows.length) throw new Error('User not found in your agency');
    }
}

module.exports = TeamService;
