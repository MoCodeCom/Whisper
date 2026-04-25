const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('PushToken', {
  id      : { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id : { type: DataTypes.CHAR(36), allowNull: false },
  token   : { type: DataTypes.TEXT,     allowNull: false },
  platform: { type: DataTypes.ENUM('ios','android'), allowNull: false },
}, {
  tableName  : 'push_tokens',
  timestamps : true,
  underscored: true,
});
