const svc = require('../../modules/cp_modules/ads.service');

exports.list = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 20;
    res.json(await svc.listAds({ page, limit }));
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    res.json(await svc.getAd(req.params.id));
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.title) {
      const e = new Error('title is required'); e.status = 400; throw e;
    }
    const ad = await svc.createAd(req.body, req.file || null);
    res.status(201).json(ad);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const ad = await svc.updateAd(req.params.id, req.body, req.file || null);
    res.json(ad);
  } catch (e) { next(e); }
};

exports.toggle = async (req, res, next) => {
  try {
    res.json(await svc.toggleAd(req.params.id));
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await svc.deleteAd(req.params.id);
    res.json({ message: 'Ad deleted' });
  } catch (e) { next(e); }
};
