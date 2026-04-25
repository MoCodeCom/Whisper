const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/cp_controllers/dashboard.controller');

router.get('/stats', controller.getStats);

module.exports = router;
