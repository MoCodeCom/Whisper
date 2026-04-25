const express  = require('express');
const router   = express.Router();
const cpAuth   = require('../../middleware/cpAuth');
const dashCtrl = require('../../controllers/cp_controllers/dashboard.controller');

// Public CP login (no cpAuth middleware)
router.post('/auth/login', dashCtrl.login);

// Protected CP routes
router.use('/dashboard', cpAuth, require('./dashboard.routes'));
router.use('/users',     cpAuth, require('./users.routes'));
router.use('/reports',   cpAuth, require('./reports.routes'));
router.use('/ratings',   cpAuth, require('./ratings.routes'));
router.use('/media',     cpAuth, require('./media.routes'));
router.use('/ads',       cpAuth, require('./ads.routes'));
router.use('/groups',    cpAuth, require('./groups.routes'));

module.exports = router;
