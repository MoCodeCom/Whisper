const svc = require('../../modules/cp_modules/ratings.service');

exports.listRatings  = async (req, res, next) => { try { res.json(await svc.listRatings(req.query)); } catch (e) { console.error('[ratings] listRatings error:', e.message); next(e); } };
exports.deleteRating = async (req, res, next) => { try { res.json(await svc.deleteRating(req.params.id)); }   catch (e) { next(e); } };
