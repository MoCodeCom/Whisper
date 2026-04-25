const { User } = require('../../models');
const { Op }   = require('sequelize');

const err = (msg, s) => Object.assign(new Error(msg), { status: s });

const ATTRS = ['id','name','phone','gender','language','language_name','status','avatar_url','is_online','last_seen','last_seen_privacy'];

/** Format a user row. selfView=true skips privacy masking (own profile). */
const fmt = (u, selfView = false) => {
  const showPresence = selfView || u.last_seen_privacy === 'everyone';
  return {
    id             : u.id,
    name           : u.name,
    phone          : u.phone,
    gender         : u.gender,
    language       : u.language,
    languageName   : u.language_name,
    status         : u.status,
    avatar         : u.avatar_url,   // app uses 'avatar' as field name
    is_online      : showPresence ? u.is_online  : false,
    last_seen      : showPresence ? u.last_seen   : null,
    lastSeenPrivacy: u.last_seen_privacy,
  };
};

exports.getProfile = async (userId, selfView = false) => {
  const user = await User.findByPk(userId, { attributes: ATTRS });
  if (!user) throw err('User not found', 404);
  return fmt(user, selfView);
};

exports.search = async (requesterId, query) => {
  if (!query || query.trim().length < 2) return [];
  const q = `%${query.trim()}%`;
  const rows = await User.findAll({
    where: {
      [Op.and]: [
        { id: { [Op.ne]: requesterId } },
        { role: { [Op.ne]: 'banned' } },
        {
          [Op.or]: [
            { phone: { [Op.like]: q } },
            { name:  { [Op.like]: q } },
          ],
        },
      ],
    },
    attributes: ['id','name','phone','avatar_url','status','is_online','last_seen_privacy'],
    limit: 20,
  });
  return rows.map((u) => ({
    id       : u.id,
    name     : u.name,
    phone    : u.phone,
    avatar   : u.avatar_url,   // consistent with app field name
    avatar_url: u.avatar_url,  // kept for ContactsScreen which reads avatar_url
    status   : u.status,
    // Don't expose online status in search results if user has restricted it
    is_online: u.last_seen_privacy === 'everyone' ? u.is_online : false,
  }));
};

exports.deleteAccount = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw err('User not found', 404);
  await user.destroy();
};

exports.updateProfile = async (userId, data) => {
  const MAP = {
    name           : 'name',
    status         : 'status',
    language       : 'language',
    languageName   : 'language_name',
    gender         : 'gender',
    avatar         : 'avatar_url',   // app sends 'avatar', DB column is 'avatar_url'
    avatar_url     : 'avatar_url',   // keep legacy key for compatibility
    lastSeenPrivacy: 'last_seen_privacy',
  };
  const updates = {};
  for (const [k, v] of Object.entries(data)) {
    if (MAP[k]) updates[MAP[k]] = v;
  }
  if (Object.keys(updates).length) {
    await User.update(updates, { where: { id: userId } });
  }
  return exports.getProfile(userId, true); // own profile — no masking
};
