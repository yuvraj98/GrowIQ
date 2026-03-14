// src/routes/team.routes.js
const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/team.controller');
const { authorize } = require('../middleware/auth');

router.get('/', authorize('owner', 'manager'), TeamController.getMembers);
router.post('/invite', authorize('owner'), TeamController.inviteMember);
router.patch('/:id/role', authorize('owner'), TeamController.updateRole);
router.patch('/:id/status', authorize('owner'), TeamController.updateStatus);
router.delete('/:id', authorize('owner'), TeamController.deleteMember);

module.exports = router;
