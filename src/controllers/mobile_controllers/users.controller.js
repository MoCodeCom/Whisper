const svc    = require('../../modules/mobile_modules/users.service');
const { getIo } = require('../../socket/stock');

exports.getMe = async (req, res, next) => {
  try { res.json(await svc.getProfile(req.user.id, true)); } catch (e) { next(e); }
};
exports.search = async (req, res, next) => {
  try { res.json(await svc.search(req.user.id, req.query.q || '')); } catch (e) { next(e); }
};
exports.getProfile = async (req, res, next) => {
  try { res.json(await svc.getProfile(req.params.id)); } catch (e) { next(e); }
};
exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await svc.updateProfile(req.user.id, req.body);
    // Broadcast profile change to ALL online users so they can refresh contact data
    const io = getIo();
    if (io) {
      io.emit('profile_updated', {
        userId: updated.id,
        name  : updated.name,
        avatar: updated.avatar,
        status: updated.status,
      });
    }
    res.json(updated);
  } catch (e) { next(e); }
};
exports.deleteMe = async (req, res, next) => {
  try { await svc.deleteAccount(req.user.id); res.json({ message: 'Account deleted' }); } catch (e) { next(e); }
};
