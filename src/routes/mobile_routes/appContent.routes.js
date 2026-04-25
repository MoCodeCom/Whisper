const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/mobile_controllers/appContent.controller');

// Public read — no auth needed so unauthenticated screens can fetch content
router.get('/:key', controller.getContent);

// Write — protected, called from control panel only (add admin middleware when ready)
router.put('/:key', controller.updateContent);

module.exports = router;
