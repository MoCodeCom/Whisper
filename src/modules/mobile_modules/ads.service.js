const { Ad } = require('../../models');

/**
 * Return all active ads ordered by sort_order ASC.
 * Called by the mobile app on HomeScreen load.
 */
exports.getActiveAds = async () => {
  return Ad.findAll({
    where     : { is_active: true },
    order     : [['sort_order', 'ASC'], ['created_at', 'ASC']],
    attributes: ['id', 'title', 'description', 'image_url', 'link_url', 'link_label'],
  });
};
