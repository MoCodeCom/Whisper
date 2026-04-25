const svc = require('../../modules/cp_modules/media.service');

exports.listMedia   = async (req, res, next) => { try { res.json(await svc.listMedia(req.query)); }        catch (e) { next(e); } };
exports.deleteMedia = async (req, res, next) => { try { res.json(await svc.deleteMedia(req.params.id)); }  catch (e) { next(e); } };
