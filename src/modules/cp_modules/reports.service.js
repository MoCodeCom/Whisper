const { Report, User } = require('../../models');

const err            = (msg, s) => Object.assign(new Error(msg), { status: s });
const VALID_STATUSES = ['pending','reviewed','dismissed'];

exports.listReports = async ({ page=1, limit=20, status='' }) => {
  const offset = (Number(page)-1) * Number(limit);
  const where  = (status && VALID_STATUSES.includes(status)) ? { status } : {};

  const { count, rows } = await Report.findAndCountAll({
    where,
    include: [
      { model: User, as: 'reporter', attributes: ['id','name','phone'] },
      { model: User, as: 'reported', attributes: ['id','name','phone'] },
    ],
    order : [['created_at', 'DESC']],
    limit : Number(limit),
    offset,
  });
  return { data: rows, total: count, page: Number(page), limit: Number(limit) };
};

exports.updateStatus = async (id, status) => {
  if (!VALID_STATUSES.includes(status)) throw err('Invalid status', 400);
  await Report.update({ status }, { where: { id } });
  return { message: 'Report updated' };
};
