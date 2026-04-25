const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/mobile_controllers/contacts.controller');
const auth       = require('../../middleware/auth');

router.get(   '/',            auth, controller.getContacts);
router.get(   '/search',      auth, controller.searchByPhone);
router.post(  '/',            auth, controller.addContact);
router.delete('/:id',         auth, controller.removeContact);
router.post(  '/block/:id',   auth, controller.blockUser);
router.delete('/block/:id',   auth, controller.unblockUser);
router.get(   '/blocked',     auth, controller.getBlockedList);

module.exports = router;
