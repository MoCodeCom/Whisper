/**
 * Message handler — relay + offline queue.
 *
 * Real-time relay (receiver online):
 *   send_message / send_image / send_audio / send_document  →  receive_*
 *
 * Offline queue (receiver offline):
 *   Payload is AES-256-GCM encrypted and saved to pending_messages table.
 *   Delivered + deleted when receiver next connects (handled in stock.js).
 *   Expires automatically after 21 days via daily cleanup job.
 *
 * Routing priority: phone number → UUID
 */

const { PendingMessage } = require('../../models');
const { encrypt }        = require('../../utils/encryption');
const logger             = require('../../utils/logger');

const TWENTY_ONE_DAYS_MS = 21 * 24 * 60 * 60 * 1000;

/** Resolve the recipient's socket ID: phone first, UUID fallback */
const resolveSocket = (userSocketMap, phoneSocketMap, to, toPhone) =>
  (toPhone && phoneSocketMap.get(toPhone)) || userSocketMap.get(to);

/**
 * Save a message to the pending_messages table (receiver is offline).
 * The full payload { from, message } is JSON-serialised then AES-encrypted.
 */
const storePending = async (senderId, receiverId, from, message) => {
  try {
    const plaintext = JSON.stringify({ from, message });
    const encrypted = encrypt(plaintext);
    const sentAt    = message.timestamp ? new Date(message.timestamp) : new Date();
    const expiresAt = new Date(sentAt.getTime() + TWENTY_ONE_DAYS_MS);

    await PendingMessage.create({
      sender_id         : senderId,
      receiver_id       : receiverId,
      encrypted_content : encrypted,
      message_type      : ['text', 'image', 'audio', 'file'].includes(message.type) ? message.type : 'file',
      sent_at           : sentAt,
      expires_at        : expiresAt,
    });
  } catch (err) {
    logger.error('[MessageHandler] Failed to store pending message: ' + err.message);
  }
};

const register = (io, socket, userSocketMap, phoneSocketMap) => {

  // ── Text / voice / file messages ─────────────────────────────────────────
  socket.on('send_message', async ({ to, toPhone, message }) => {
    const recipientSocket = resolveSocket(userSocketMap, phoneSocketMap, to, toPhone);

    if (recipientSocket) {
      io.to(recipientSocket).emit('receive_message', { from: socket.userProfile, message });
      socket.emit('message_delivered', { messageId: message.id, to });
    } else {
      // Receiver offline — queue message encrypted in DB
      await storePending(socket.userId, to, socket.userProfile, message);
      socket.emit('message_pending', { messageId: message.id, to });
    }
  });

  // ── Image relay ──────────────────────────────────────────────────────────
  socket.on('send_image', async ({ to, toPhone, message }) => {
    const recipientSocket = resolveSocket(userSocketMap, phoneSocketMap, to, toPhone);

    if (recipientSocket) {
      io.to(recipientSocket).emit('receive_image', { from: socket.userProfile, message });
      socket.emit('message_delivered', { messageId: message.id, to });
    } else {
      await storePending(socket.userId, to, socket.userProfile, { ...message, type: 'image' });
      socket.emit('message_pending', { messageId: message.id, to });
    }
  });

  // ── Audio relay ──────────────────────────────────────────────────────────
  socket.on('send_audio', async ({ to, toPhone, message }) => {
    const recipientSocket = resolveSocket(userSocketMap, phoneSocketMap, to, toPhone);

    if (recipientSocket) {
      io.to(recipientSocket).emit('receive_audio', { from: socket.userProfile, message });
      socket.emit('message_delivered', { messageId: message.id, to });
    } else {
      await storePending(socket.userId, to, socket.userProfile, { ...message, type: 'audio' });
      socket.emit('message_pending', { messageId: message.id, to });
    }
  });

  // ── Document relay ────────────────────────────────────────────────────────
  socket.on('send_document', async ({ to, toPhone, message }) => {
    const recipientSocket = resolveSocket(userSocketMap, phoneSocketMap, to, toPhone);

    if (recipientSocket) {
      io.to(recipientSocket).emit('receive_document', { from: socket.userProfile, message });
      socket.emit('message_delivered', { messageId: message.id, to });
    } else {
      await storePending(socket.userId, to, socket.userProfile, message);
      socket.emit('message_pending', { messageId: message.id, to });
    }
  });

  // ── Read receipt relay ────────────────────────────────────────────────────
  socket.on('message_read', ({ to, toPhone, messageId }) => {
    const recipientSocket = resolveSocket(userSocketMap, phoneSocketMap, to, toPhone);
    if (recipientSocket) {
      io.to(recipientSocket).emit('message_read', { from: socket.userId, messageId });
    }
  });
};

module.exports = { register };
