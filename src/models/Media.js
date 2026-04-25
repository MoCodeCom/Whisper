const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Media', {
  id         : { type: DataTypes.CHAR(36),     primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  uploader_id: { type: DataTypes.CHAR(36),     allowNull: false },
  url        : { type: DataTypes.TEXT,         allowNull: false },
  mime_type  : { type: DataTypes.STRING(100),  allowNull: true },
  size_bytes : { type: DataTypes.INTEGER,      allowNull: true },
}, {
  tableName  : 'media',
  timestamps : true,
  underscored: true,
  updatedAt  : false,
});
