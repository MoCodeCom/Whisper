const express             = require('express');
const router              = express.Router();
const controller          = require('../../controllers/mobile_controllers/auth.controller');
const validate            = require('../../middleware/validate');
const auth                = require('../../middleware/auth');
const { authLimiter }     = require('../../middleware/rateLimiter');
const Joi                 = require('joi');

const registerSchema = Joi.object({
  phone        : Joi.string().pattern(/^\+?\d[\d\s\-()+]{5,19}$/).required(),
  name         : Joi.string().min(2).max(100).required(),
  password     : Joi.string().min(6).required(),
  gender       : Joi.string().valid('male','female','other').default('male'),
  language     : Joi.string().max(10).default('en'),
  languageName : Joi.string().max(50).default('English'),
});

const loginSchema = Joi.object({
  phone    : Joi.string().required(),
  password : Joi.string().required(),
});

const sendOtpSchema = Joi.object({
  phone        : Joi.string().pattern(/^\+?\d[\d\s\-()+]{5,19}$/).required(),
  name         : Joi.string().min(2).max(100).required(),
  password     : Joi.string().min(6).required(),
  gender       : Joi.string().valid('male','female','other').default('male'),
  language     : Joi.string().max(10).default('en'),
  languageName : Joi.string().max(50).default('English'),
});

const verifyOtpSchema = Joi.object({
  phone : Joi.string().required(),
  code  : Joi.string().length(6).pattern(/^\d{6}$/).required(),
});

const forgotPasswordSchema = Joi.object({
  phone: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  phone      : Joi.string().required(),
  code       : Joi.string().length(6).pattern(/^\d{6}$/).required(),
  newPassword: Joi.string().min(8).required(),
});

router.post('/send-otp',        authLimiter, validate(sendOtpSchema),        controller.sendOtp);
router.post('/verify-otp',      authLimiter, validate(verifyOtpSchema),      controller.verifyOtpAndRegister);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.sendPasswordResetOtp);
router.post('/reset-password',  authLimiter, validate(resetPasswordSchema),  controller.verifyResetOtpAndChangePassword);
router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login',    authLimiter, validate(loginSchema),    controller.login);
router.post('/refresh',  authLimiter,                           controller.refresh);
router.post('/logout',   auth,                                  controller.logout);
router.get( '/me',       auth,                                  controller.me);

module.exports = router;
