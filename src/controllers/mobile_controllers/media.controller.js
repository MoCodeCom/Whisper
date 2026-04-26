const svc = require('../../modules/mobile_modules/media.service');

// Temporary chat media (images, audio, documents) — deleted after delivery or expiry
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) { const e = new Error('No file provided'); e.status = 400; throw e; }
    res.status(201).json(await svc.uploadImage(req.user.id, req.file, false));
  } catch (e) { next(e); }
};

// Permanent media (profile pictures, group avatars) — never auto-deleted
exports.uploadPermanent = async (req, res, next) => {
  try {
    if (!req.file) { const e = new Error('No file provided'); e.status = 400; throw e; }
    res.status(201).json(await svc.uploadImage(req.user.id, req.file, true));
  } catch (e) { next(e); }
};

exports.confirmMedia = async (req, res, next) => {
  try {
    await svc.confirmMedia(req.params.id);
    res.json({ message: 'Confirmed' });
  } catch (e) { next(e); }
};
