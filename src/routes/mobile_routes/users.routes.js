const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/mobile_controllers/users.controller');
const auth       = require('../../middleware/auth');
const validate   = require('../../middleware/validate');
const Joi        = require('joi');

const updateSchema = Joi.object({
  name           : Joi.string().min(2).max(100),
  status         : Joi.string().max(150).allow(''),
  language       : Joi.string().max(10),
  languageName   : Joi.string().max(50),
  gender         : Joi.string().valid('male','female','other'),
  avatar         : Joi.string().uri().allow(null, ''),
  avatar_url     : Joi.string().uri().allow(null, ''),
  lastSeenPrivacy: Joi.string().valid('everyone','contacts','nobody'),
});

router.get(    '/me',     auth,                        controller.getMe);
router.get(    '/search', auth,                        controller.search);
router.get(    '/:id',    auth,                        controller.getProfile);
router.put(    '/me',     auth, validate(updateSchema), controller.updateProfile);
router.delete( '/me',     auth,                        controller.deleteMe);

module.exports = router;
