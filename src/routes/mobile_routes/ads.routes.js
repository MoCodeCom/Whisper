const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/mobile_controllers/ads.controller');
const auth       = require('../../middleware/auth');

// GET /api/mobile/ads — returns active ads for the HomeScreen
router.get('/', auth, controller.getActiveAds);

module.exports = router;
