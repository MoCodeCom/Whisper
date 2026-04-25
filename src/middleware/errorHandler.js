const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  // Log the full Sequelize / MySQL original error if present
  const detail = err.original?.message || err.parent?.message || err.sql || '';
  logger.error((err.stack || err.message || String(err)) + (detail ? '\n  MySQL: ' + detail : ''));
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
};

module.exports = errorHandler;
