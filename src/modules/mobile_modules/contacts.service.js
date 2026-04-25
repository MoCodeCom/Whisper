const { Contact, User, BlockedUser } = require('../../models');
const { normalizePhone }             = require('../../utils/phone');

const err        = (msg, s) => Object.assign(new Error(msg), { status: s });
const USER_ATTRS = ['id','name','phone','avatar_url','status','is_online','last_seen'];

exports.getContacts = async (ownerId) => {
  return Contact.findAll({
    where  : { owner_id: ownerId },
    include: [{ model: User, as: 'contactUser', attributes: USER_ATTRS }],
    order  : [[{ model: User, as: 'contactUser' }, 'name', 'ASC']],
  });
};

exports.searchByPhone = async (phone) => {
  const p = normalizePhone(phone);
  if (!p) throw err('Invalid phone number', 422);
  const user = await User.findOne({ where: { phone: p }, attributes: [...USER_ATTRS, 'phone'] });
  if (!user) throw err('No user found with that phone', 404);
  return user;
};

exports.addContact = async (ownerId, { contact_id, nickname }) => {
  if (ownerId === contact_id) throw err('Cannot add yourself', 400);
  const target = await User.findByPk(contact_id);
  if (!target) throw err('User not found', 404);

  const [contact] = await Contact.findOrCreate({
    where   : { owner_id: ownerId, contact_id },
    defaults: { nickname: nickname || null },
  });
  if (nickname !== undefined) await contact.update({ nickname: nickname || null });
  return contact;
};

exports.removeContact = async (ownerId, contactId) => {
  await Contact.destroy({ where: { owner_id: ownerId, contact_id: contactId } });
};

exports.blockUser = async (blockerId, blockedId) => {
  if (blockerId === blockedId) throw err('Cannot block yourself', 400);
  await BlockedUser.findOrCreate({ where: { blocker_id: blockerId, blocked_id: blockedId } });
};

exports.unblockUser = async (blockerId, blockedId) => {
  await BlockedUser.destroy({ where: { blocker_id: blockerId, blocked_id: blockedId } });
};

exports.getBlockedList = async (userId) => {
  return BlockedUser.findAll({
    where  : { blocker_id: userId },
    include: [{ model: User, as: 'blocked', attributes: USER_ATTRS }],
  });
};
