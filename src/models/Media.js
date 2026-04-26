const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Media', {
  id           : { type: DataTypes.CHAR(36),     primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  uploader_id  : { type: DataTypes.CHAR(36),     allowNull: false },
  url          : { type: DataTypes.TEXT,         allowNull: false },
  mime_type    : { type: DataTypes.STRING(100),  allowNull: true },
  size_bytes   : { type: DataTypes.INTEGER,      allowNull: true },
  // Permanent media (profile pictures, ads) — never auto-deleted
  is_permanent : { type: DataTypes.BOOLEAN,      allowNull: false, defaultValue: false },
  // Temp media (chat images, audio, documents) — deleted after delivery or expiry
  // NULL for permanent media
  expires_at   : { type: DataTypes.DATE,         allowNull: true,  defaultValue: null },
}, {
  tableName  : 'media',
  timestamps : true,
  underscored: true,
  updatedAt  : false,
});
