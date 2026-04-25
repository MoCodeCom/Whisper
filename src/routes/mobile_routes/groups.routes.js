const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/mobile_controllers/groups.controller');
const auth       = require('../../middleware/auth');

router.post  ('/',                    auth, controller.createGroup);
router.get   ('/',                    auth, controller.getMyGroups);
router.put   ('/:id',                 auth, controller.updateGroup);
router.post  ('/:id/members',         auth, controller.addMember);
router.delete('/:id/members/:userId', auth, controller.removeMember);
router.delete('/:id',                 auth, controller.deleteGroup);

module.exports = router;
