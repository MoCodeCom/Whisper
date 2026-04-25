const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Group', {
  id        : { type: DataTypes.CHAR(36),    primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name      : { type: DataTypes.STRING(100), allowNull: false },
  avatar_url: { type: DataTypes.TEXT,        allowNull: true,  defaultValue: null },
  created_by: { type: DataTypes.CHAR(36),    allowNull: false },
  status    : { type: DataTypes.STRING(150), allowNull: true,  defaultValue: 'A new group on Wisber!' },
  is_active : { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
}, {
  tableName  : 'groups',
  timestamps : true,
  underscored: true,
});
