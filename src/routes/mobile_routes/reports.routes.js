const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/mobile_controllers/reports.controller');
const auth       = require('../../middleware/auth');
const validate   = require('../../middleware/validate');
const Joi        = require('joi');

const reportSchema = Joi.object({
  reported_id : Joi.string().required(),
  reason      : Joi.string().min(10).max(500).required(),
});

router.post('/', auth, validate(reportSchema), controller.submitReport);

module.exports = router;
