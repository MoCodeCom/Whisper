const svc = require('../../modules/mobile_modules/reports.service');

exports.submitReport = async (req, res, next) => {
  try { res.status(201).json(await svc.submitReport(req.user.id, req.body)); } catch (e) { next(e); }
};
