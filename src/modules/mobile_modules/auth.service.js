const { User, RefreshToken }                    = require('../../models');
const { Op }                                    = require('sequelize');
const { hashPassword, comparePassword }         = require('../../utils/hash');
const { signAccess, signRefresh, verifyRefresh }= require('../../utils/jwt');
const { normalizePhone }                        = require('../../utils/phone');
const { sendVerificationCode, checkVerificationCode } = require('../../utils/twilio');
const crypto                                    = require('crypto');

// ── In-memory store for registration data while OTP is pending ────────────────
// Map<normalizedPhone, { expiresAt, userData }>
// The OTP itself is managed by Twilio Verify — we only store user data here.
const otpStore = new Map();

// ── In-memory store for password-reset — tracks which userId is resetting ─────
// Map<normalizedPhone, { expiresAt, userId }>
const resetOtpStore = new Map();

const hashTok  = (t)        => crypto.createHash('sha256').update(t).digest('hex');
const err      = (msg, s)   => Object.assign(new Error(msg), { status: s });
const fmtUser  = (u)        => ({
  id: u.id, name: u.name, phone: u.phone, gender: u.gender,
  language: u.language, languageName: u.language_name,
  status: u.status, avatar: u.avatar_url,
});

const storeRefresh = async (userId, token) => {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user_id: userId, token_hash: hashTok(token), expires_at: expires });
};

exports.sendOtp = async ({ phone, name, password, gender, language, languageName }) => {
  const p = normalizePhone(phone);
  if (!p) throw err('Invalid phone number', 422);

  const existing = await User.findOne({ where: { phone: p } });
  if (existing) throw err('Phone already registered', 409);

  // Store registration data — OTP is handled entirely by Twilio Verify
  otpStore.set(p, {
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    userData : { phone: p, name, password, gender, language, languageName },
  });

  await sendVerificationCode(p);

  return { message: 'OTP sent' };
};

exports.verifyOtpAndRegister = async ({ phone, code }) => {
  const p      = normalizePhone(phone) || phone;
  const stored = otpStore.get(p);

  if (!stored) throw err('OTP not found. Please request a new code.', 400);
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(p);
    throw err('OTP has expired. Please request a new code.', 400);
  }

  // Verify with Twilio — throws if code is wrong
  await checkVerificationCode(p, code);

  otpStore.delete(p);
  return exports.register(stored.userData);
};

exports.register = async ({ phone, name, password, gender, language, languageName }) => {
  const p = normalizePhone(phone);
  if (!p) throw err('Invalid phone number', 422);

  const existing = await User.findOne({ where: { phone: p } });
  if (existing) throw err('Phone already registered', 409);

  const user = await User.create({
    phone: p, name,
    password_hash: await hashPassword(password),
    gender       : gender       || 'male',
    language     : language     || 'en',
    language_name: languageName || 'English',
  });

  const accessToken  = signAccess({ id: user.id, role: 'user' });
  const refreshToken = signRefresh({ id: user.id });
  await storeRefresh(user.id, refreshToken);
  return { token: accessToken, refreshToken, user: fmtUser(user) };
};

exports.sendPasswordResetOtp = async ({ phone }) => {
  const p = normalizePhone(phone) || phone;
  if (!p) throw err('Invalid phone number', 422);

  const user = await User.findOne({ where: { phone: p } });
  if (!user) throw err('No account found for this phone number', 404);

  // Store which user is resetting — OTP managed by Twilio Verify
  resetOtpStore.set(p, {
    expiresAt: Date.now() + 10 * 60 * 1000,
    userId   : user.id,
  });

  await sendVerificationCode(p);

  return { message: 'Reset code sent' };
};

exports.verifyResetOtpAndChangePassword = async ({ phone, code, newPassword }) => {
  const p      = normalizePhone(phone) || phone;
  const stored = resetOtpStore.get(p);

  if (!stored) throw err('OTP not found. Please request a new code.', 400);
  if (Date.now() > stored.expiresAt) {
    resetOtpStore.delete(p);
    throw err('OTP has expired. Please request a new code.', 400);
  }

  // Verify with Twilio — throws if code is wrong
  await checkVerificationCode(p, code);

  resetOtpStore.delete(p);

  const hashed = await hashPassword(newPassword);
  await User.update({ password_hash: hashed }, { where: { id: stored.userId } });

  return { message: 'Password updated successfully' };
};

exports.login = async ({ phone, password }) => {
  const p    = normalizePhone(phone) || phone;
  const user = await User.findOne({ where: { phone: p } });
  if (!user)                                      throw err('Invalid phone or password', 401);
  if (!await comparePassword(password, user.password_hash)) throw err('Invalid phone or password', 401);
  if (user.role === 'banned')                     throw err('Account banned', 403);

  await user.update({ is_online: true, last_seen: new Date() });

  const accessToken  = signAccess({ id: user.id, role: user.role || 'user' });
  const refreshToken = signRefresh({ id: user.id });
  await storeRefresh(user.id, refreshToken);
  return { token: accessToken, refreshToken, user: fmtUser(user) };
};

exports.refresh = async (refreshToken) => {
  if (!refreshToken) throw err('Refresh token required', 400);
  let payload;
  try { payload = verifyRefresh(refreshToken); } catch { throw err('Invalid refresh token', 401); }

  const th     = hashTok(refreshToken);
  const stored = await RefreshToken.findOne({
    where: { user_id: payload.id, token_hash: th, expires_at: { [Op.gt]: new Date() } },
  });
  if (!stored) throw err('Refresh token expired or revoked', 401);

  await stored.destroy();
  const newAccess  = signAccess({ id: payload.id, role: 'user' });
  const newRefresh = signRefresh({ id: payload.id });
  await storeRefresh(payload.id, newRefresh);
  return { token: newAccess, refreshToken: newRefresh };
};

exports.logout = async (userId, refreshToken) => {
  if (refreshToken) {
    await RefreshToken.destroy({ where: { user_id: userId, token_hash: hashTok(refreshToken) } });
  }
  await User.update({ is_online: false, last_seen: new Date() }, { where: { id: userId } });
};

exports.getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id','name','phone','gender','language','language_name','status','avatar_url'],
  });
  if (!user) throw err('User not found', 404);
  return fmtUser(user);
};
