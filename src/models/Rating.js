const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Rating', {
  id      : { type: DataTypes.CHAR(36),    primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  rater_id: { type: DataTypes.CHAR(36),    allowNull: false },
  // NULL means this is an app rating (no specific user being rated)
  rated_id: { type: DataTypes.CHAR(36),    allowNull: true,  defaultValue: null },
  score   : { type: DataTypes.TINYINT,     allowNull: false, validate: { min: 1, max: 5 } },
  comment : { type: DataTypes.STRING(500), allowNull: true,  defaultValue: null },
}, {
  tableName  : 'ratings',
  timestamps : true,
  underscored: true,
  indexes    : [{ unique: true, fields: ['rater_id', 'rated_id'] }],
});
