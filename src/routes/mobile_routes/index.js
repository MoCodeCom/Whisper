const express = require('express');
const router  = express.Router();

router.use('/auth',     require('./auth.routes'));
router.use('/users',    require('./users.routes'));
router.use('/contacts', require('./contacts.routes'));
router.use('/ratings',  require('./ratings.routes'));
router.use('/media',    require('./media.routes'));
router.use('/reports',  require('./reports.routes'));
router.use('/ads',      require('./ads.routes'));
router.use('/groups',      require('./groups.routes'));
router.use('/app-content', require('./appContent.routes'));

module.exports = router;
