/**
 * Groups Controller — create/read/manage group members.
 * Groups are stored in MySQL; messages are relayed via socket only (local-first).
 */
const { Group, GroupMember, User } = require('../../models');
const { getIo, userSocketMap }     = require('../../socket/stock');

/** Emit a socket event to a specific user if they are online */
const emitToUser = (userId, event, payload) => {
  const io       = getIo();
  const socketId = userSocketMap.get(userId);
  if (io && socketId) {
    io.to(socketId).emit(event, payload);
  }
};

/** Helper: get full group object with members array */
const buildGroupResponse = async (groupId) => {
  const group = await Group.findByPk(groupId);
  if (!group) return null;

  const members = await GroupMember.findAll({
    where  : { group_id: groupId },
    include: [{ model: User, attributes: ['id', 'name', 'avatar_url', 'phone'] }],
  });

  return {
    id        : group.id,
    name      : group.name,
    avatar    : group.avatar_url,
    status    : group.status ?? 'A new group on Wisber!',
    created_by: group.created_by,
    created_at: group.created_at,
    members   : members.map((m) => ({
      userId: m.user_id,
      name  : m.User?.name    ?? 'Unknown',
      avatar: m.User?.avatar_url ?? null,
      phone : m.User?.phone   ?? null,
      role  : m.role,
    })),
  };
};

// ── POST /groups ───────────────────────────────────────────────────────────────
const createGroup = async (req, res, next) => {
  try {
    const { name, memberIds = [], avatar = null, status = null } = req.body;
    const adminId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = await Group.create({
      name      : name.trim(),
      created_by: adminId,
      avatar_url: avatar || null,
      status    : status?.trim() || 'A new group on Wisber!',
    });

    // Creator is always admin
    await GroupMember.create({ group_id: group.id, user_id: adminId, role: 'admin' });

    // Add other members
    const uniqueIds = [...new Set(memberIds)].filter((id) => id !== adminId);
    for (const uid of uniqueIds) {
      const exists = await User.findByPk(uid, { attributes: ['id'] });
      if (exists) {
        await GroupMember.findOrCreate({
          where   : { group_id: group.id, user_id: uid },
          defaults: { role: 'member' },
        });
      }
    }

    const response = await buildGroupResponse(group.id);

    // Notify each non-creator member that they were added to the group
    for (const uid of uniqueIds) {
      emitToUser(uid, 'added_to_group', response);
    }

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

// ── GET /groups ────────────────────────────────────────────────────────────────
const getMyGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const memberships = await GroupMember.findAll({ where: { user_id: userId } });
    const groupIds    = memberships.map((m) => m.group_id);

    const results = [];
    for (const gid of groupIds) {
      const g = await buildGroupResponse(gid);
      if (g) results.push(g);
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// ── POST /groups/:id/members ───────────────────────────────────────────────────
const addMember = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const { userId }      = req.body;
    const requesterId     = req.user.id;

    // Only admins can add members
    const requesterMembership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: requesterId },
    });
    if (!requesterMembership || requesterMembership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    const user = await User.findByPk(userId, { attributes: ['id', 'name', 'avatar_url', 'phone'] });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [member, created] = await GroupMember.findOrCreate({
      where   : { group_id: groupId, user_id: userId },
      defaults: { role: 'member' },
    });

    // Notify the added user in real-time
    if (created) {
      const groupResponse = await buildGroupResponse(groupId);
      emitToUser(userId, 'added_to_group', groupResponse);
    }

    res.json({
      userId : user.id,
      name   : user.name,
      avatar : user.avatar_url,
      phone  : user.phone,
      role   : member.role,
      created,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /groups/:id/members/:userId ─────────────────────────────────────────
const removeMember = async (req, res, next) => {
  try {
    const { id: groupId, userId } = req.params;
    const requesterId             = req.user.id;

    // Admin can remove anyone; member can only remove themselves (leave)
    if (requesterId !== userId) {
      const requesterMembership = await GroupMember.findOne({
        where: { group_id: groupId, user_id: requesterId },
      });
      if (!requesterMembership || requesterMembership.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can remove other members' });
      }
    }

    // Don't allow removing the last admin
    const target = await GroupMember.findOne({ where: { group_id: groupId, user_id: userId } });
    if (target?.role === 'admin') {
      const adminCount = await GroupMember.count({ where: { group_id: groupId, role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the only admin. Assign another admin first.' });
      }
    }

    await GroupMember.destroy({ where: { group_id: groupId, user_id: userId } });

    // Notify the removed user in real-time
    emitToUser(userId, 'removed_from_group', { groupId });

    res.json({ removed: true });
  } catch (err) {
    next(err);
  }
};

// ── PUT /groups/:id ────────────────────────────────────────────────────────────
const updateGroup = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const { name, avatar, status } = req.body;
    const requesterId = req.user.id;

    const membership = await GroupMember.findOne({ where: { group_id: groupId, user_id: requesterId } });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update group info' });
    }

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (avatar !== undefined) updates.avatar_url = avatar || null;
    if (status !== undefined) updates.status = status?.trim() || null;

    if (Object.keys(updates).length) {
      await Group.update(updates, { where: { id: groupId } });
    }

    const response = await buildGroupResponse(groupId);

    // Notify all group members of the update
    const allMembers = await GroupMember.findAll({ where: { group_id: groupId } });
    for (const m of allMembers) {
      emitToUser(m.user_id, 'group_updated', {
        groupId: response.id,
        name   : response.name,
        avatar : response.avatar,
        status : response.status,
      });
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /groups/:id ─────────────────────────────────────────────────────────
const deleteGroup = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const requesterId     = req.user.id;

    const membership = await GroupMember.findOne({ where: { group_id: groupId, user_id: requesterId } });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete the group' });
    }

    // Notify all members before deleting
    const allMembers = await GroupMember.findAll({ where: { group_id: groupId } });
    for (const m of allMembers) {
      if (m.user_id !== requesterId) {
        emitToUser(m.user_id, 'group_deleted', { groupId });
      }
    }

    await GroupMember.destroy({ where: { group_id: groupId } });
    await Group.destroy({ where: { id: groupId } });
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { createGroup, getMyGroups, addMember, removeMember, deleteGroup, updateGroup };
