const sequelize = require('../config/db');

const User           = require('./User')(sequelize);
const RefreshToken   = require('./RefreshToken')(sequelize);
const PushToken      = require('./PushToken')(sequelize);
const Contact        = require('./Contact')(sequelize);
const BlockedUser    = require('./BlockedUser')(sequelize);
const Rating         = require('./Rating')(sequelize);
const Media          = require('./Media')(sequelize);
const Report         = require('./Report')(sequelize);
const PendingMessage      = require('./PendingMessage')(sequelize);
const PendingGroupMessage = require('./PendingGroupMessage')(sequelize);
const Ad                  = require('./Ad')(sequelize);
const Group               = require('./Group')(sequelize);
const GroupMember         = require('./GroupMember')(sequelize);
const AppContent          = require('./AppContent')(sequelize);

// ── Associations ──────────────────────────────────────────────────────────────
User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(PushToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
PushToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Contact, { as: 'ownedContacts', foreignKey: 'owner_id',   onDelete: 'CASCADE' });
User.hasMany(Contact, { as: 'contactedBy',   foreignKey: 'contact_id', onDelete: 'CASCADE' });
Contact.belongsTo(User, { as: 'owner',       foreignKey: 'owner_id' });
Contact.belongsTo(User, { as: 'contactUser', foreignKey: 'contact_id' });

User.hasMany(BlockedUser, { as: 'blockedUsers',   foreignKey: 'blocker_id', onDelete: 'CASCADE' });
User.hasMany(BlockedUser, { as: 'blockedByUsers', foreignKey: 'blocked_id', onDelete: 'CASCADE' });
BlockedUser.belongsTo(User, { as: 'blocker', foreignKey: 'blocker_id' });
BlockedUser.belongsTo(User, { as: 'blocked', foreignKey: 'blocked_id' });

// constraints: false — rated_id can be NULL (app ratings), avoids charset FK mismatch
User.hasMany(Rating, { as: 'givenRatings',    foreignKey: 'rater_id', constraints: false });
User.hasMany(Rating, { as: 'receivedRatings', foreignKey: 'rated_id', constraints: false });
Rating.belongsTo(User, { as: 'rater', foreignKey: 'rater_id', constraints: false });
Rating.belongsTo(User, { as: 'rated', foreignKey: 'rated_id', constraints: false });

User.hasMany(Media, { foreignKey: 'uploader_id', onDelete: 'CASCADE' });
Media.belongsTo(User, { as: 'uploader', foreignKey: 'uploader_id' });

User.hasMany(Report, { as: 'submittedReports', foreignKey: 'reporter_id', onDelete: 'CASCADE' });
User.hasMany(Report, { as: 'receivedReports',  foreignKey: 'reported_id', onDelete: 'CASCADE' });
Report.belongsTo(User, { as: 'reporter', foreignKey: 'reporter_id' });
Report.belongsTo(User, { as: 'reported', foreignKey: 'reported_id' });

// Pending messages — constraints: false so rows survive if sender account is deleted
PendingMessage.belongsTo(User, { as: 'sender',   foreignKey: 'sender_id',   constraints: false });
PendingMessage.belongsTo(User, { as: 'receiver', foreignKey: 'receiver_id', constraints: false });
User.hasMany(PendingMessage,   { as: 'pendingOutbox', foreignKey: 'sender_id',   constraints: false });
User.hasMany(PendingMessage,   { as: 'pendingInbox',  foreignKey: 'receiver_id', constraints: false });

// Pending group messages — constraints: false for same reason
PendingGroupMessage.belongsTo(User,  { as: 'groupSender',   foreignKey: 'sender_id',   constraints: false });
PendingGroupMessage.belongsTo(User,  { as: 'groupReceiver', foreignKey: 'receiver_id', constraints: false });
PendingGroupMessage.belongsTo(Group, { foreignKey: 'group_id', constraints: false });
User.hasMany(PendingGroupMessage,    { as: 'pendingGroupInbox', foreignKey: 'receiver_id', constraints: false });

// Groups — constraints: false avoids charset FK conflicts with users table
Group.hasMany(GroupMember, { foreignKey: 'group_id', onDelete: 'CASCADE' });
GroupMember.belongsTo(Group,  { foreignKey: 'group_id' });
GroupMember.belongsTo(User,   { foreignKey: 'user_id',  constraints: false });
User.hasMany(GroupMember,     { foreignKey: 'user_id',  constraints: false });

module.exports = {
  sequelize,
  User, RefreshToken, PushToken,
  Contact, BlockedUser,
  Rating, Media, Report,
  PendingMessage, PendingGroupMessage,
  Ad,
  Group, GroupMember,
  AppContent,
};
