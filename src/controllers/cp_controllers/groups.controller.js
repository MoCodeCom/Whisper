const { Group, GroupMember, User } = require('../../models');
const { Op } = require('sequelize');

const memberInclude = {
  model  : GroupMember,
  include: [{ model: User, attributes: ['name', 'avatar_url', 'phone'] }],
};

const fmt = (g) => ({
  id        : g.id,
  name      : g.name,
  avatar    : g.avatar_url,
  status    : g.status,
  is_active : g.is_active,
  created_by: g.created_by,
  created_at: g.created_at,
  members   : (g.GroupMembers || []).map(m => ({
    userId: m.user_id,
    name  : m.User?.name       || '',
    avatar: m.User?.avatar_url || null,
    phone : m.User?.phone      || null,
    role  : m.role,
  })),
});

exports.list = async (req, res, next) => {
  try {
    const page   = Number(req.query.page)  || 1;
    const limit  = Number(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;
    const where  = search ? { name: { [Op.like]: `%${search}%` } } : {};

    const { count, rows } = await Group.findAndCountAll({
      where,
      include: [memberInclude],
      order  : [['created_at', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows.map(fmt), total: count, page, limit });
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const g = await Group.findByPk(req.params.id, { include: [memberInclude] });
    if (!g) { const e = new Error('Group not found'); e.status = 404; throw e; }
    res.json(fmt(g));
  } catch (e) { next(e); }
};

exports.ban = async (req, res, next) => {
  try {
    const g = await Group.findByPk(req.params.id);
    if (!g) { const e = new Error('Group not found'); e.status = 404; throw e; }
    await g.update({ is_active: false });
    res.json({ message: 'Group banned' });
  } catch (e) { next(e); }
};

exports.unban = async (req, res, next) => {
  try {
    const g = await Group.findByPk(req.params.id);
    if (!g) { const e = new Error('Group not found'); e.status = 404; throw e; }
    await g.update({ is_active: true });
    res.json({ message: 'Group unbanned' });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await Group.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Group deleted' });
  } catch (e) { next(e); }
};
