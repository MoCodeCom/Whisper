const { Media }    = require('../../models');
const { v4: uuid } = require('uuid');
const path         = require('path');
const fs           = require('fs');

const UPLOAD_DIR   = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MEDIA_EXPIRY_DAYS = 30; // chat media auto-deleted 30 days after upload if not confirmed

/**
 * @param {string}  uploaderId - uploader user id
 * @param {object}  file       - multer file object
 * @param {boolean} permanent  - true for profile pictures / group avatars (never auto-deleted)
 */
exports.uploadImage = async (uploaderId, file, permanent = false) => {
  const origExt  = path.extname(file.originalname || '').slice(1).toLowerCase();
  const mimeExt  = (file.mimetype || '').split('/')[1] || 'jpg';
  const ext      = origExt || mimeExt;
  const filename = uuid() + '.' + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);
  const url        = (process.env.BASE_URL || 'http://localhost:3000') + '/uploads/' + filename;
  const expires_at = permanent ? null : new Date(Date.now() + MEDIA_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const media      = await Media.create({
    uploader_id : uploaderId,
    url,
    mime_type   : file.mimetype,
    size_bytes  : file.size,
    is_permanent: permanent,
    expires_at,
  });
  return { id: media.id, url: media.url };
};

exports.confirmMedia = async (mediaId) => {
  const media = await Media.findByPk(mediaId);
  if (!media) return;           // already gone — no-op
  if (media.is_permanent) return; // never delete permanent media
  const filePath = path.join(UPLOAD_DIR, path.basename(media.url));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await media.destroy();
};

/**
 * Delete all expired non-permanent media files + DB rows.
 * Called by the daily cleanup job in server.js.
 */
exports.cleanExpiredMedia = async () => {
  const { Op } = require('sequelize');
  const expired = await Media.findAll({
    where: {
      is_permanent: false,
      expires_at  : { [Op.lt]: new Date() },
    },
  });
  for (const media of expired) {
    const filePath = path.join(UPLOAD_DIR, path.basename(media.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await media.destroy();
  }
  return expired.length;
};
