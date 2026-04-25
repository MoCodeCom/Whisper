const svc = require('../../modules/mobile_modules/ratings.service');

exports.rateUser      = async (req, res, next) => { try { res.json(await svc.rateUser(req.user.id, req.body));    } catch (e) { next(e); } };
exports.rateApp       = async (req, res, next) => { try { res.json(await svc.rateApp(req.user.id, req.body));     } catch (e) { next(e); } };
exports.getUserRating = async (req, res, next) => { try { res.json(await svc.getUserRating(req.params.id));       } catch (e) { next(e); } };
exports.getMyRatings  = async (req, res, next) => { try { res.json(await svc.getMyRatings(req.user.id));          } catch (e) { next(e); } };
