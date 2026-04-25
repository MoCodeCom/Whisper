const svc = require('../../modules/cp_modules/dashboard.service');

exports.login    = async (req, res, next) => { try { res.json(await svc.adminLogin(req.body)); } catch (e) { next(e); } };
exports.getStats = async (req, res, next) => { try { res.json(await svc.getStats()); }          catch (e) { next(e); } };
