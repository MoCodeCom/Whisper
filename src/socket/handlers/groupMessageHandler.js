/**
 * Group Message Handler
 *
 * send_group_message → receive_group_message (all group members)
 *
 * Offline queue:
 *   One pending_group_messages row is written for every non-sender member.
 *   For members who are ONLINE  → emit immediately + delete their row.
 *   For members who are OFFLINE → row stays; delivered when they next connect.
 *
 * Encrypted with AES-256-GCM (same key as pending_messages).
 */

const { GroupMember, PendingGroupMessage } = require('../../models');
const { encrypt }  = require('../../utils/encryption');
const logger       = require('../../utils/logger');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Persist one pending row for a single receiver.
 * The full socket payload { groupId, from, message } is encrypted and stored.
 */
const storePendingGroupMessage = async (groupId, messageId, senderId, receiverId, from, message) => {
  try {
    const plaintext = JSON.stringify({ groupId, from, message });
    const encrypted = encrypt(plaintext);
    const sentAt    = message.timestamp ? new Date(message.timestamp) : new Date();
    const expiresAt = new Date(sentAt.getTime() + THIRTY_DAYS_MS);

    await PendingGroupMessage.create({
      group_id          : groupId,
      message_id        : messageId,
      sender_id         : senderId,
      receiver_id       : receiverId,
      encrypted_content : encrypted,
      message_type      : ['text', 'image', 'audio', 'file'].includes(message.type) ? message.type : 'file',
      sent_at           : sentAt,
      expires_at        : expiresAt,
    });
  } catch (err) {
    // Ignore unique-constraint errors (duplicate delivery attempt)
    if (err.name !== 'SequelizeUniqueConstraintError') {
      logger.error('[GroupMessageHandler] storePendingGroupMessage error: ' + err.message);
    }
  }
};

const register = (io, socket, userSocketMap) => {

  socket.on('send_group_message', async ({ groupId, message }) => {
    if (!groupId || !message) return;

    try {
      const members = await GroupMember.findAll({ where: { group_id: groupId } });

      for (const member of members) {
        // Never queue for the sender themselves
        if (member.user_id === socket.userId) continue;

        const messageId       = message.id || require('crypto').randomUUID();
        const recipientSocket = userSocketMap.get(member.user_id);

        // Always write the pending row first (guarantees no message is lost)
        await storePendingGroupMessage(
          groupId,
          messageId,
          socket.userId,
          member.user_id,
          socket.userProfile,
          message,
        );

        if (recipientSocket) {
          // Member is online → deliver in real time and remove their pending row
          io.to(recipientSocket).emit('receive_group_message', {
            groupId,
            from   : socket.userProfile,
            message,
          });

          // Clean up the row we just wrote (it was already delivered)
          await PendingGroupMessage.destroy({
            where: { message_id: messageId, receiver_id: member.user_id },
          });
        }
        // Offline members: pending row stays until they connect
      }

      // Acknowledge delivery to the sender
      socket.emit('group_message_delivered', { messageId: message.id, groupId });

    } catch (err) {
      logger.error('[GroupMessageHandler] send_group_message error: ' + err.message);
    }
  });

};

module.exports = { register };
