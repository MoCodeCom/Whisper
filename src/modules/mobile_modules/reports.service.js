const { Report, User } = require('../../models');

const err = (msg, s) => Object.assign(new Error(msg), { status: s });

exports.submitReport = async (reporterId, { reported_id, reason }) => {
  if (reporterId === reported_id) throw err('Cannot report yourself', 400);
  const target = await User.findByPk(reported_id);
  if (!target) throw err('User not found', 404);
  await Report.create({ reporter_id: reporterId, reported_id, reason });
  return { message: 'Report submitted' };
};
