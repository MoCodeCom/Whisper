const { Rating, User } = require('../../models');

exports.listRatings = async ({ page=1, limit=20 }) => {
  const offset = (Number(page)-1) * Number(limit);

  // Separate count (simple) from data fetch (with joins) to avoid subQuery issues
  const total = await Rating.count();

  const rows = await Rating.findAll({
    order : [['created_at', 'DESC']],
    limit : Number(limit),
    offset,
  });

  // Fetch user info for raters in a separate query
  const raterIds = [...new Set(rows.map(r => r.rater_id).filter(Boolean))];
  const raters   = raterIds.length
    ? await User.findAll({ where: { id: raterIds }, attributes: ['id','name','phone'] })
    : [];
  const raterMap = Object.fromEntries(raters.map(u => [u.id, u]));

  const fmt = (r) => {
    const rater = raterMap[r.rater_id] || null;
    return {
      id        : r.id,
      rater_id  : r.rater_id,
      rated_id  : r.rated_id,
      score     : r.score,
      comment   : r.comment,
      created_at: r.created_at,
      updated_at: r.updatedAt || r.updated_at,
      rater     : rater ? { id: rater.id, name: rater.name, phone: rater.phone } : null,
    };
  };

  return { data: rows.map(fmt), total, page: Number(page), limit: Number(limit) };
};

exports.deleteRating = async (id) => {
  await Rating.destroy({ where: { id } });
  return { message: 'Rating deleted' };
};
