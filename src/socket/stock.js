const { Server }          = require('socket.io');
let _io = null;
const getIo = () => _io;
const { verifyAccess }    = require('../utils/jwt');
const logger              = require('../utils/logger');
const messageHandler      = require('./handlers/messageHandler');
const presenceHandler     = require('./handlers/presenceHandler');
const typingHandler       = require('./handlers/typeingHandler');
const groupMessageHandler = require('./handlers/groupMessageHandler');
const { User, PendingMessage, PendingGroupMessage } = require('../models');
const { decrypt }         = require('../utils/encryption');
const { Op }              = require('sequelize');

// userId (UUID) → socketId   — primary routing key
const userSocketMap  = new Map();
// phone (digits-only, e.g. 447460726920) → socketId   — secondary routing key
const phoneSocketMap = new Map();

/**
 * Fetch all pending messages for a receiver, emit them as a single
 * `pending_messages` event, then delete them from the DB.
 */
const deliverPendingMessages = async (socket) => {
  try {
    const rows = await PendingMessage.findAll({
      where: { receiver_id: socket.userId },
      order: [['sent_at', 'ASC']],   // deliver in send order
    });

    if (!rows.length) return;

    // Decrypt each row and build payload array
    const messages = rows
      .map((row) => {
        try {
          return JSON.parse(decrypt(row.encrypted_content));
          // Shape: { from: senderProfile, message: messageObj }
        } catch (e) {
          logger.warn('[Socket] Could not decrypt pending message ' + row.id + ': ' + e.message);
          return null;
        }
      })
      .filter(Boolean);

    if (messages.length) {
      socket.emit('pending_messages', messages);
      logger.info(`[Socket] Delivered ${messages.length} pending message(s) to ${socket.userId}`);
    }

    // Delete all rows — whether or not decryption succeeded — so they are not re-delivered
    await PendingMessage.destroy({
      where: { receiver_id: socket.userId },
    });

  } catch (err) {
    logger.error('[Socket] deliverPendingMessages error: ' + err.message);
  }
};

/**
 * Fetch all pending GROUP messages for this user, emit each one as a
 * standard `receive_group_message` event (same shape the client already
 * handles), then delete all their rows.
 *
 * Messages are delivered in chronological order so the client stores them
 * in the correct sequence.
 */
const deliverPendingGroupMessages = async (socket) => {
  try {
    const rows = await PendingGroupMessage.findAll({
      where : { receiver_id: socket.userId },
      order : [['sent_at', 'ASC']],
    });

    if (!rows.length) return;

    let delivered = 0;
    for (const row of rows) {
      try {
        const payload = JSON.parse(decrypt(row.encrypted_content));
        // payload shape: { groupId, from: senderProfile, message: messageObj }
        socket.emit('receive_group_message', payload);
        delivered++;
      } catch (e) {
        logger.warn('[Socket] Could not decrypt pending group message ' + row.id + ': ' + e.message);
      }
    }

    // Delete all rows for this user regardless of decryption outcome
    await PendingGroupMessage.destroy({ where: { receiver_id: socket.userId } });

    if (delivered) {
      logger.info(`[Socket] Delivered ${delivered} pending group message(s) to ${socket.userId}`);
    }
  } catch (err) {
    logger.error('[Socket] deliverPendingGroupMessages error: ' + err.message);
  }
};

const initSocket = (httpServer) => {
  _io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET','POST'] },
  });

  // ── JWT auth middleware ──────────────────────────────────────────────────
  _io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try { socket.userId = verifyAccess(token).id; next(); }
    catch { next(new Error('Invalid token')); }
  });

  _io.on('connection', async (socket) => {
    const { userId } = socket;
    userSocketMap.set(userId, socket.id);
    logger.info('[Socket] Connected: ' + userId);

    // Load sender profile + phone so messageHandler can relay and route by phone
    try {
      const u = await User.findByPk(userId, { attributes: ['id','name','avatar_url','phone','last_seen_privacy'] });
      socket.userProfile        = u
        ? { id: u.id, name: u.name, avatar: u.avatar_url }
        : { id: userId, name: 'Unknown', avatar: null };
      socket.userPhone          = u?.phone || null;
      socket.lastSeenPrivacy    = u?.last_seen_privacy || 'everyone';
      if (socket.userPhone) phoneSocketMap.set(socket.userPhone, socket.id);
    } catch {
      socket.userProfile = { id: userId, name: 'Unknown', avatar: null };
      socket.userPhone   = null;
    }

    // Deliver any messages that arrived while this user was offline
    await deliverPendingMessages(socket);
    await deliverPendingGroupMessages(socket);

    presenceHandler.onConnect(_io, socket, userSocketMap);
    messageHandler.register(_io, socket, userSocketMap, phoneSocketMap);
    typingHandler.register(_io, socket, userSocketMap);
    groupMessageHandler.register(_io, socket, userSocketMap);

    socket.on('disconnect', () => {
      userSocketMap.delete(userId);
      if (socket.userPhone) phoneSocketMap.delete(socket.userPhone);
      logger.info('[Socket] Disconnected: ' + userId);
      presenceHandler.onDisconnect(_io, socket, userSocketMap);
    });
  });

  return _io;
};

module.exports = { initSocket, getIo, userSocketMap, phoneSocketMap };
