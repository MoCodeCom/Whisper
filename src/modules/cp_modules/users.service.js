const { User } = require('../../models');
const { Op }   = require('sequelize');
const bcrypt   = require('bcryptjs');

const err = (msg, s) => Object.assign(new Error(msg), { status: s });

exports.listUsers = async ({ page=1, limit=20, search='' }) => {
  const offset = (Number(page)-1) * Number(limit);
  const where  = search
    ? { [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { phone: { [Op.like]: `%${search}%` } }] }
    : {};

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: ['id','name','phone','gender','status','avatar_url','is_online','last_seen','created_at','role'],
    order     : [['created_at', 'DESC']],
    limit     : Number(limit),
    offset,
  });
  return { data: rows, total: count, page: Number(page), limit: Number(limit) };
};

exports.banUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw err('User not found', 404);
  if (['admin','superadmin'].includes(user.role)) throw err('Cannot ban admin', 403);
  await user.update({ role: 'banned' });
  return { message: 'User banned' };
};

exports.unbanUser = async (id) => {
  await User.update({ role: 'user' }, { where: { id, role: 'banned' } });
  return { message: 'User unbanned' };
};

exports.deleteUser = async (id) => {
  await User.destroy({ where: { id } });
  return { message: 'User deleted' };
};

exports.createAdmin = async ({ name, phone, password, role }) => {
  if (!['admin', 'superadmin'].includes(role)) throw err('Invalid role', 400);
  const existing = await User.findOne({ where: { phone } });
  if (existing) throw err('Phone number already in use', 409);
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, phone, password_hash, role });
  return { message: 'Admin created', id: user.id };
};
