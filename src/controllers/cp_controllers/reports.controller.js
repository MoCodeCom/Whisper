const svc = require('../../modules/cp_modules/reports.service');

exports.listReports  = async (req, res, next) => { try { res.json(await svc.listReports(req.query)); }             catch (e) { next(e); } };
exports.updateStatus = async (req, res, next) => { try { res.json(await svc.updateStatus(req.params.id, req.body.status)); } catch (e) { next(e); } };
