const svc = require('../../modules/mobile_modules/ads.service');

exports.getActiveAds = async (_req, res, next) => {
  try {
    const ads = await svc.getActiveAds();
    res.json({ ads });
  } catch (e) { next(e); }
};
