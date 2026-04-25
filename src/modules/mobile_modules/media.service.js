const { Media }  = require('../../models');
const { v4: uuid } = require('uuid');
const path         = require('path');
const fs           = require('fs');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

exports.uploadImage = async (uploaderId, file) => {
  const ext      = file.mimetype.split('/')[1] || 'jpg';
  const filename = uuid() + '.' + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);
  const url   = (process.env.BASE_URL || 'http://localhost:3000') + '/uploads/' + filename;
  const media = await Media.create({ uploader_id: uploaderId, url, mime_type: file.mimetype, size_bytes: file.size });
  return { id: media.id, url: media.url };
};

exports.confirmMedia = async (mediaId) => {
  const media = await Media.findByPk(mediaId);
  if (!media) return;                      // already gone — no-op
  const filePath = path.join(UPLOAD_DIR, path.basename(media.url));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await media.destroy();
};
