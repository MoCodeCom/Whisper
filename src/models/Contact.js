const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Contact', {
  id        : { type: DataTypes.CHAR(36),     primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  owner_id  : { type: DataTypes.CHAR(36),     allowNull: false },
  contact_id: { type: DataTypes.CHAR(36),     allowNull: false },
  nickname  : { type: DataTypes.STRING(100),  allowNull: true, defaultValue: null },
}, {
  tableName  : 'contacts',
  timestamps : true,
  underscored: true,
  updatedAt  : false,
  indexes    : [{ unique: true, fields: ['owner_id', 'contact_id'] }],
});
