const { Media, User } = require('../../models');
const fs   = require('fs');
const path = require('path');

const err = (msg, s) => Object.assign(new Error(msg), { status: s });

exports.listMedia = async ({ page=1, limit=20 }) => {
  const offset = (Number(page)-1) * Number(limit);
  const { count, rows } = await Media.findAndCountAll({
    include: [{ model: User, as: 'uploader', attributes: ['id','name'] }],
    order  : [['created_at', 'DESC']],
    limit  : Number(limit),
    offset,
  });
  return { data: rows, total: count, page: Number(page), limit: Number(limit) };
};

exports.deleteMedia = async (id) => {
  const media = await Media.findByPk(id);
  if (!media) throw err('Media not found', 404);
  const filename = (media.url || '').split('/uploads/')[1];
  if (filename) {
    const fp = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  await media.destroy();
  return { message: 'Media deleted' };
};
