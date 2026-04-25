const { User } = require('../../models');

const onConnect = (_io, socket) => {
  User.update({ is_online: true, last_seen: new Date() }, { where: { id: socket.userId } }).catch(() => {});
  // Only broadcast if user allows others to see their online status
  if (socket.lastSeenPrivacy === 'everyone') {
    socket.broadcast.emit('user_online', { userId: socket.userId });
  }
};

const onDisconnect = (_io, socket) => {
  const lastSeen = new Date();
  User.update({ is_online: false, last_seen: lastSeen }, { where: { id: socket.userId } }).catch(() => {});
  // Only include lastSeen timestamp if the user's privacy allows it
  const payload = { userId: socket.userId };
  if (socket.lastSeenPrivacy === 'everyone') {
    payload.lastSeen = lastSeen.toISOString();
  }
  socket.broadcast.emit('user_offline', payload);
};

module.exports = { onConnect, onDisconnect };
