const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/mobile_controllers/ratings.controller');
const auth       = require('../../middleware/auth');
const validate   = require('../../middleware/validate');
const Joi        = require('joi');

const userRatingSchema = Joi.object({
  rated_id : Joi.string().uuid().required(),
  score    : Joi.number().integer().min(1).max(5).required(),
  comment  : Joi.string().max(500).allow('', null).optional(),
});

const appRatingSchema = Joi.object({
  score   : Joi.number().integer().min(1).max(5).required(),
  comment : Joi.string().max(500).allow('', null).optional(),
});

// POST /api/mobile/ratings/app  — rate the Wisber app (no rated_id needed)
router.post('/app',      auth, validate(appRatingSchema),  controller.rateApp);

// POST /api/mobile/ratings      — rate another user
router.post('/',         auth, validate(userRatingSchema), controller.rateUser);

// GET  /api/mobile/ratings/user/:id — get average rating for a user
router.get('/user/:id',  auth,                             controller.getUserRating);

// GET  /api/mobile/ratings/mine — get all ratings given by me
router.get('/mine',      auth,                             controller.getMyRatings);

module.exports = router;
