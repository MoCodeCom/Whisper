const svc = require('../../modules/mobile_modules/auth.service');

exports.register = async (req, res, next) => {
  try { res.status(201).json(await svc.register(req.body)); } catch (e) { next(e); }
};
exports.sendOtp = async (req, res, next) => {
  try { res.json(await svc.sendOtp(req.body)); } catch (e) { next(e); }
};
exports.verifyOtpAndRegister = async (req, res, next) => {
  try { res.status(201).json(await svc.verifyOtpAndRegister(req.body)); } catch (e) { next(e); }
};
exports.sendPasswordResetOtp = async (req, res, next) => {
  try { res.json(await svc.sendPasswordResetOtp(req.body)); } catch (e) { next(e); }
};
exports.verifyResetOtpAndChangePassword = async (req, res, next) => {
  try { res.json(await svc.verifyResetOtpAndChangePassword(req.body)); } catch (e) { next(e); }
};
exports.login = async (req, res, next) => {
  try { res.json(await svc.login(req.body)); } catch (e) { next(e); }
};
exports.refresh = async (req, res, next) => {
  try { res.json(await svc.refresh(req.body.refreshToken)); } catch (e) { next(e); }
};
exports.logout = async (req, res, next) => {
  try { await svc.logout(req.user.id, req.body.refreshToken); res.json({ message: 'Logged out' }); } catch (e) { next(e); }
};
exports.me = async (req, res, next) => {
  try { res.json(await svc.getMe(req.user.id)); } catch (e) { next(e); }
};
