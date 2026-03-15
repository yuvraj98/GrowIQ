// src/controllers/team.controller.js
const TeamService = require('../services/team.service');

class TeamController {
    /**
     * GET /api/v1/team
     * Get all agency members
     */
    static async getMembers(req, res, next) {
        try {
            const members = await TeamService.getTeamMembers(req.user.agencyId);
            res.json({ success: true, data: members });
        } catch (err) { next(err); }
    }

    /**
     * POST /api/v1/team/invite
     * Invite a new team member
     */
    static async inviteMember(req, res, next) {
        try {
            const { name, email, role, password } = req.body;
            const validRoles = ['owner', 'manager', 'finance', 'viewer'];
            
            if (!validRoles.includes(role)) {
                return res.status(400).json({ success: false, error: { message: 'Invalid role' } });
            }

            const member = await TeamService.inviteMember(
                req.user.agencyId, 
                name, 
                email, 
                role, 
                password || 'DMTrack!123' // default mock password for dev
            );
            
            res.json({ success: true, data: member, message: 'Team member added successfully' });
        } catch (err) {
            if (err.message.includes('already registered')) {
                return res.status(400).json({ success: false, error: { message: err.message } });
            }
            next(err);
        }
    }

    /**
     * PATCH /api/v1/team/:id/role
     */
    static async updateRole(req, res, next) {
        try {
            const { role } = req.body;
            const validRoles = ['owner', 'manager', 'finance', 'viewer'];
            
            if (!validRoles.includes(role)) {
                return res.status(400).json({ success: false, error: { message: 'Invalid role' } });
            }

            const member = await TeamService.updateRole(req.user.agencyId, req.params.id, role);
            res.json({ success: true, data: member });
        } catch (err) { 
            next(err); 
        }
    }

    /**
     * PATCH /api/v1/team/:id/status
     */
    static async updateStatus(req, res, next) {
        try {
            const { is_active } = req.body;
            
            if (req.user.id === req.params.id && !is_active) {
                return res.status(400).json({ success: false, error: { message: 'Cannot suspend yourself' }});
            }

            const member = await TeamService.updateStatus(req.user.agencyId, req.params.id, is_active);
            res.json({ success: true, data: member });
        } catch (err) { next(err); }
    }

    /**
     * DELETE /api/v1/team/:id
     */
    static async deleteMember(req, res, next) {
        try {
            if (req.user.id === req.params.id) {
                return res.status(400).json({ success: false, error: { message: 'Cannot delete yourself' }});
            }

            await TeamService.deleteMember(req.user.agencyId, req.params.id);
            res.json({ success: true, message: 'Team member removed' });
        } catch (err) { next(err); }
    }
}

module.exports = TeamController;
