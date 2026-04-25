const { DataTypes } = require('sequelize');

/**
 * Temporary store for group messages whose receiver was offline at send time.
 *
 * Lifecycle:
 *  1. On send_group_message: one row created per non-sender group member.
 *  2. If a member is online at send time  → row created then immediately deleted
 *     after the socket event is emitted to them.
 *  3. If a member is offline at send time → row stays until they connect.
 *  4. On user connect: all their rows are emitted as receive_group_message events,
 *     then deleted.
 *  5. Rows older than expires_at are removed by the daily cleanup job.
 *
 * Content is AES-256-GCM encrypted before storage (same as pending_messages).
 */
module.exports = (sequelize) =>
  sequelize.define('PendingGroupMessage', {
    id: {
      type         : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV4,
      primaryKey   : true,
    },
    // The group this message belongs to
    group_id: {
      type      : DataTypes.UUID,
      allowNull : false,
    },
    // The message's own client-generated ID (used for deduplication + targeted delete)
    message_id: {
      type      : DataTypes.UUID,
      allowNull : false,
    },
    sender_id: {
      type      : DataTypes.UUID,
      allowNull : false,
    },
    // The group member who has not yet received this message
    receiver_id: {
      type      : DataTypes.UUID,
      allowNull : false,
    },
    // Encrypted JSON: { groupId, from: senderProfile, message: messageObj }
    encrypted_content: {
      type      : DataTypes.TEXT('long'),
      allowNull : false,
    },
    message_type: {
      type         : DataTypes.ENUM('text', 'image', 'audio', 'file'),
      allowNull    : false,
      defaultValue : 'text',
    },
    // Original client timestamp — preserved so receiver sees correct send time
    sent_at: {
      type      : DataTypes.DATE,
      allowNull : false,
    },
    // sent_at + 30 days — row expires if receiver never comes back online
    expires_at: {
      type      : DataTypes.DATE,
      allowNull : false,
    },
  }, {
    tableName  : 'pending_group_messages',
    timestamps : true,
    indexes    : [
      { unique: true, fields: ['message_id', 'receiver_id'] }, // prevent duplicates
      { fields: ['receiver_id'] },  // fast fetch on connect
      { fields: ['expires_at']  },  // fast DELETE on cleanup
    ],
  });
