const { DataTypes } = require('sequelize');

/**
 * app_content — stores editable text pages (about, privacy policy, etc.)
 *
 * key   : unique slug, e.g. 'about' | 'privacy'
 * title : display heading shown in the app modal header
 * body  : full markdown/plain text content
 * version: optional version string shown as sub-heading (e.g. "1.0.0", "2025-04-24")
 */
module.exports = (sequelize) => sequelize.define('AppContent', {
  key    : { type: DataTypes.STRING(50),  primaryKey: true },
  title  : { type: DataTypes.STRING(255), allowNull: false },
  body   : { type: DataTypes.TEXT('long'), allowNull: false },
  version: { type: DataTypes.STRING(20),  allowNull: true,  defaultValue: null },
}, {
  tableName  : 'app_content',
  timestamps : true,
  underscored: true,
});
