const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/cp_controllers/media.controller');

router.get(    '/',    controller.listMedia);
router.delete( '/:id', controller.deleteMedia);

module.exports = router;
