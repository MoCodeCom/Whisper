const svc = require('../../modules/cp_modules/users.service');

exports.listUsers  = async (req, res, next) => { try { res.json(await svc.listUsers(req.query)); }           catch (e) { next(e); } };
exports.banUser    = async (req, res, next) => { try { res.json(await svc.banUser(req.params.id)); }          catch (e) { next(e); } };
exports.unbanUser  = async (req, res, next) => { try { res.json(await svc.unbanUser(req.params.id)); }        catch (e) { next(e); } };
exports.deleteUser  = async (req, res, next) => { try { res.json(await svc.deleteUser(req.params.id)); }         catch (e) { next(e); } };
exports.createAdmin = async (req, res, next) => { try { res.status(201).json(await svc.createAdmin(req.body)); } catch (e) { next(e); } };
