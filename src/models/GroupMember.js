const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('GroupMember', {
  id      : { type: DataTypes.INTEGER,   primaryKey: true, autoIncrement: true },
  group_id: { type: DataTypes.CHAR(36),  allowNull: false },
  user_id : { type: DataTypes.CHAR(36),  allowNull: false },
  role    : { type: DataTypes.ENUM('admin', 'member'), defaultValue: 'member' },
}, {
  tableName  : 'group_members',
  timestamps : false,
  underscored: true,
  indexes    : [{ unique: true, fields: ['group_id', 'user_id'] }],
});
