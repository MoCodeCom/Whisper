const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Ad', {
  id         : { type: DataTypes.CHAR(36),    primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  title      : { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT,        allowNull: true  },
  image_url  : { type: DataTypes.STRING(500), allowNull: true  },
  link_url   : { type: DataTypes.STRING(500), allowNull: true  },
  link_label : { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Learn More' },
  is_active  : { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true  },
  sort_order : { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0     },
}, {
  tableName  : 'ads',
  timestamps : true,
  underscored: true,
});
