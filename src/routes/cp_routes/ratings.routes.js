const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/cp_controllers/ratings.controller');

router.get(    '/',    controller.listRatings);
router.delete( '/:id', controller.deleteRating);

module.exports = router;
