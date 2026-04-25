const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('User', {
  id           : { type: DataTypes.CHAR(36),  primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  phone        : { type: DataTypes.STRING(20), allowNull: false, unique: true },
  name         : { type: DataTypes.STRING(100), allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  avatar_url   : { type: DataTypes.TEXT,       allowNull: true,  defaultValue: null },
  status       : { type: DataTypes.STRING(150), defaultValue: 'Hey, I am using Wisber!' },
  language     : { type: DataTypes.STRING(10),  defaultValue: 'en' },
  language_name: { type: DataTypes.STRING(50),  defaultValue: 'English' },
  gender       : { type: DataTypes.ENUM('male','female','other'), defaultValue: 'male' },
  role         : { type: DataTypes.ENUM('user','admin','superadmin','banned'), defaultValue: 'user' },
  is_online         : { type: DataTypes.BOOLEAN,                              defaultValue: false },
  last_seen         : { type: DataTypes.DATE,   allowNull: true,              defaultValue: null },
  last_seen_privacy : { type: DataTypes.ENUM('everyone','contacts','nobody'), defaultValue: 'everyone' },
}, {
  tableName  : 'users',
  timestamps : true,
  underscored: true,
});
