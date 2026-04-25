const { Ad }       = require('../../models');
const { v4: uuid } = require('uuid');
const path         = require('path');
const fs           = require('fs');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'ads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const BASE_URL = () => process.env.BASE_URL || 'http://localhost:3000';

/** Save an uploaded image buffer to disk, return its public URL */
const saveImage = (file) => {
  const ext      = (file.mimetype.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const filename = `ad_${uuid()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);
  return `${BASE_URL()}/uploads/ads/${filename}`;
};

/** Delete an ad image file from disk (ignores errors if already gone) */
const deleteImage = (imageUrl) => {
  if (!imageUrl) return;
  try {
    const filename = path.basename(imageUrl);
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (_) {}
};

exports.listAds = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await Ad.findAndCountAll({
    order : [['sort_order', 'ASC'], ['created_at', 'DESC']],
    limit,
    offset,
  });
  return { total: count, page, limit, ads: rows };
};

exports.getAd = async (id) => {
  const ad = await Ad.findByPk(id);
  if (!ad) { const e = new Error('Ad not found'); e.status = 404; throw e; }
  return ad;
};

exports.createAd = async (data, file) => {
  const image_url = file ? saveImage(file) : null;
  return Ad.create({
    id         : uuid(),
    title      : data.title,
    description: data.description  || null,
    image_url,
    link_url   : data.link_url     || null,
    link_label : data.link_label   || 'Learn More',
    is_active  : data.is_active !== undefined ? Boolean(Number(data.is_active)) : true,
    sort_order : data.sort_order !== undefined ? Number(data.sort_order) : 0,
  });
};

exports.updateAd = async (id, data, file) => {
  const ad = await Ad.findByPk(id);
  if (!ad) { const e = new Error('Ad not found'); e.status = 404; throw e; }

  // If a new image was uploaded, save it and delete the old one
  let image_url = ad.image_url;
  if (file) {
    deleteImage(ad.image_url);
    image_url = saveImage(file);
  }
  // Allow explicitly clearing the image by sending image_url=''
  if (data.image_url === '') {
    deleteImage(ad.image_url);
    image_url = null;
  }

  await ad.update({
    title      : data.title       !== undefined ? data.title       : ad.title,
    description: data.description !== undefined ? data.description : ad.description,
    image_url,
    link_url   : data.link_url    !== undefined ? data.link_url    : ad.link_url,
    link_label : data.link_label  !== undefined ? data.link_label  : ad.link_label,
    is_active  : data.is_active   !== undefined ? Boolean(Number(data.is_active)) : ad.is_active,
    sort_order : data.sort_order  !== undefined ? Number(data.sort_order) : ad.sort_order,
  });
  return ad;
};

exports.toggleAd = async (id) => {
  const ad = await Ad.findByPk(id);
  if (!ad) { const e = new Error('Ad not found'); e.status = 404; throw e; }
  await ad.update({ is_active: !ad.is_active });
  return ad;
};

exports.deleteAd = async (id) => {
  const ad = await Ad.findByPk(id);
  if (!ad) { const e = new Error('Ad not found'); e.status = 404; throw e; }
  deleteImage(ad.image_url);
  await ad.destroy();
};
