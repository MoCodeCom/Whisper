const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/cp_controllers/users.controller');

router.get(    '/',          controller.listUsers);
router.post(   '/',          controller.createAdmin);
router.put(    '/:id/ban',   controller.banUser);
router.put(    '/:id/unban', controller.unbanUser);
router.delete( '/:id',       controller.deleteUser);

module.exports = router;
