const svc = require('../../modules/mobile_modules/contacts.service');

exports.getContacts   = async (req, res, next) => { try { res.json(await svc.getContacts(req.user.id)); } catch (e) { next(e); } };
exports.searchByPhone = async (req, res, next) => { try { res.json(await svc.searchByPhone(req.query.phone)); } catch (e) { next(e); } };
exports.addContact    = async (req, res, next) => { try { res.status(201).json(await svc.addContact(req.user.id, req.body)); } catch (e) { next(e); } };
exports.removeContact = async (req, res, next) => { try { await svc.removeContact(req.user.id, req.params.id); res.json({ message: 'Removed' }); } catch (e) { next(e); } };
exports.blockUser     = async (req, res, next) => { try { await svc.blockUser(req.user.id, req.params.id); res.json({ message: 'Blocked' }); } catch (e) { next(e); } };
exports.unblockUser   = async (req, res, next) => { try { await svc.unblockUser(req.user.id, req.params.id); res.json({ message: 'Unblocked' }); } catch (e) { next(e); } };
exports.getBlockedList= async (req, res, next) => { try { res.json(await svc.getBlockedList(req.user.id)); } catch (e) { next(e); } };
