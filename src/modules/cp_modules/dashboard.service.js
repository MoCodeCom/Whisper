const { User, Report, Rating } = require('../../models');
const { fn, col }              = require('sequelize');
const { comparePassword }      = require('../../utils/hash');
const { signAccess }           = require('../../utils/jwt');

const err = (msg, s) => Object.assign(new Error(msg), { status: s });

exports.adminLogin = async ({ phone, password }) => {
  const admin = await User.findOne({ where: { phone, role: ['admin','superadmin'] } });
  if (!admin) throw err('Invalid credentials', 401);
  if (!await comparePassword(password, admin.password_hash)) throw err('Invalid credentials', 401);
  const token = signAccess({ id: admin.id, role: admin.role });
  return { token, user: { id: admin.id, name: admin.name, role: admin.role } };
};

exports.getStats = async () => {
  const totalUsers     = await User.count({ where: { role: 'user' } });
  const onlineUsers    = await User.count({ where: { role: 'user', is_online: true } });
  const pendingReports = await Report.count({ where: { status: 'pending' } });
  const ratingsStats   = await Rating.findOne({
    attributes: [[fn('COUNT', col('id')), 'total'], [fn('AVG', col('score')), 'average']],
    raw: true,
  });
  const recentUsers = await User.findAll({
    attributes: ['id','name','phone','created_at'],
    order     : [['created_at', 'DESC']],
    limit     : 5,
  });
  return {
    users  : { total: totalUsers, online: onlineUsers },
    reports: { pending: pendingReports },
    ratings: { total: Number(ratingsStats?.total || 0), average: parseFloat(ratingsStats?.average || 0).toFixed(1) },
    recentUsers,
  };
};
