const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('BlockedUser', {
  id        : { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  blocker_id: { type: DataTypes.CHAR(36), allowNull: false },
  blocked_id: { type: DataTypes.CHAR(36), allowNull: false },
}, {
  tableName  : 'blocked_users',
  timestamps : true,
  underscored: true,
  updatedAt  : false,
  indexes    : [{ unique: true, fields: ['blocker_id', 'blocked_id'] }],
});
