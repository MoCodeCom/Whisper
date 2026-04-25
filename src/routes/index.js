const express       = require('express');
const router        = express.Router();
const mobileRoutes  = require('./mobile_routes');
const cpRoutes      = require('./cp_routes');

router.use('/mobile', mobileRoutes);
router.use('/cp',     cpRoutes);

module.exports = router;
