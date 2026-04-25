const { Rating, User, sequelize } = require('../../models');
const { fn, col, Op, literal }    = require('sequelize');

const err = (msg, s) => Object.assign(new Error(msg), { status: s });

// ── User-to-user rating ───────────────────────────────────────────────────────
exports.rateUser = async (raterId, { rated_id, score, comment }) => {
  if (raterId === rated_id) throw err('Cannot rate yourself', 400);
  const target = await User.findByPk(rated_id);
  if (!target) throw err('User not found', 404);

  const [rating, created] = await Rating.findOrCreate({
    where   : { rater_id: raterId, rated_id },
    defaults: { score, comment: comment || null },
  });
  if (!created) await rating.update({ score, comment: comment || null });
  return { message: 'Rating submitted' };
};

// ── App rating (rated_id = NULL — user rating the Wisber app itself) ──────────
// Uses raw upsert to avoid NULL uniqueness issues in MySQL.
exports.rateApp = async (raterId, { score, comment }) => {
  // INSERT ... ON DUPLICATE KEY UPDATE
  // The unique key on (rater_id, rated_id) doesn't catch NULLs in MySQL,
  // so we check existence manually, then insert or update.
  await sequelize.transaction(async (t) => {
    const existing = await Rating.findOne({
      where      : { rater_id: raterId, rated_id: null },
      transaction: t,
      lock       : true,
    });

    if (existing) {
      await existing.update(
        { score, comment: comment || null },
        { transaction: t }
      );
    } else {
      await Rating.create(
        { rater_id: raterId, rated_id: null, score, comment: comment || null },
        { transaction: t }
      );
    }
  });

  return { message: 'App rating submitted' };
};

// ── Get average rating for a user ─────────────────────────────────────────────
exports.getUserRating = async (userId) => {
  const result = await Rating.findOne({
    where     : { rated_id: userId },
    attributes: [[fn('AVG', col('score')), 'average'], [fn('COUNT', col('id')), 'total']],
    raw       : true,
  });
  return {
    average: parseFloat(result?.average || 0).toFixed(1),
    total  : Number(result?.total || 0),
  };
};

// ── Get all ratings given by this user (user-to-user only) ────────────────────
exports.getMyRatings = async (raterId) => {
  return Rating.findAll({
    where  : { rater_id: raterId, rated_id: { [Op.ne]: null } },
    include: [{ model: User, as: 'rated', attributes: ['id','name','avatar_url'] }],
  });
};
