const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Report', {
  id         : { type: DataTypes.CHAR(36),    primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  reporter_id: { type: DataTypes.CHAR(36),    allowNull: false },
  reported_id: { type: DataTypes.CHAR(36),    allowNull: false },
  reason     : { type: DataTypes.STRING(500), allowNull: false },
  status     : { type: DataTypes.ENUM('pending','reviewed','dismissed'), defaultValue: 'pending' },
}, {
  tableName  : 'reports',
  timestamps : true,
  underscored: true,
  updatedAt  : false,
});
