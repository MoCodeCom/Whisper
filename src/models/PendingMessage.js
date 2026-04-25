const { DataTypes } = require('sequelize');

/**
 * Temporary message store for offline recipients.
 *
 * Lifecycle:
 *  1. Message saved here when receiver is offline.
 *  2. All rows for a receiver are delivered + deleted when they connect.
 *  3. Rows whose expires_at < NOW() are deleted by the daily cleanup job
 *     (messages kept for at most 21 days).
 *
 * Content is AES-256-GCM encrypted before storage.
 */
module.exports = (sequelize) =>
  sequelize.define('PendingMessage', {
    id: {
      type         : DataTypes.UUID,
      defaultValue : DataTypes.UUIDV4,
      primaryKey   : true,
    },
    sender_id: {
      type      : DataTypes.UUID,
      allowNull : false,
    },
    receiver_id: {
      type      : DataTypes.UUID,
      allowNull : false,
    },
    // Encrypted JSON string: { from: senderProfile, message: messageObj }
    encrypted_content: {
      type      : DataTypes.TEXT('long'),
      allowNull : false,
    },
    message_type: {
      type         : DataTypes.ENUM('text', 'image', 'audio', 'file'),
      allowNull    : false,
      defaultValue : 'text',
    },
    // Original timestamp from the client (preserved so receiver sees correct time)
    sent_at: {
      type      : DataTypes.DATE,
      allowNull : false,
    },
    // sent_at + 21 days — indexed so expiry cleanup is fast
    expires_at: {
      type      : DataTypes.DATE,
      allowNull : false,
    },
  }, {
    tableName  : 'pending_messages',
    timestamps : true,
    indexes    : [
      { fields: ['receiver_id'] },   // fast fetch on user connect
      { fields: ['expires_at']  },   // fast DELETE on cleanup job
    ],
  });
