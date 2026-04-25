const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/cp_controllers/reports.controller');

router.get( '/',     controller.listReports);
router.put( '/:id',  controller.updateStatus);

module.exports = router;
