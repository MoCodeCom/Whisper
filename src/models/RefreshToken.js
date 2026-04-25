const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('RefreshToken', {
  id        : { type: DataTypes.CHAR(36),     primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id   : { type: DataTypes.CHAR(36),     allowNull: false },
  token_hash: { type: DataTypes.STRING(255),  allowNull: false, unique: true },
  expires_at: { type: DataTypes.DATE,         allowNull: false },
}, {
  tableName  : 'refresh_tokens',
  timestamps : true,
  underscored: true,
  updatedAt  : false,
});
