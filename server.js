require('dotenv').config();
const http               = require('http');
const app                = require('./src/app');
const { initSocket }     = require('./src/socket/stock');
const { validateEnv }    = require('./src/config/env');
const logger             = require('./src/utils/logger');
const { sequelize, PendingMessage, PendingGroupMessage, AppContent } = require('./src/models');
const { Op }             = require('sequelize');

validateEnv();

const PORT   = process.env.PORT || 3000;
const server = http.createServer(app);

initSocket(server);

/**
 * Drop FK constraints that cause charset/collation incompatibility errors,
 * then apply column changes that Sequelize sync cannot handle on its own.
 * Runs BEFORE sync so the server always starts cleanly.
 * Each statement is wrapped individually — failure of one never blocks the rest.
 */
const runMigrations = async () => {
  const steps = [
    // ── Drop FK constraints that conflict with charset differences ────────
    // ratings
    { sql: 'ALTER TABLE ratings DROP FOREIGN KEY ratings_ibfk_1',         label: 'drop ratings_ibfk_1' },
    { sql: 'ALTER TABLE ratings DROP FOREIGN KEY ratings_ibfk_2',         label: 'drop ratings_ibfk_2' },
    // pending_messages
    { sql: 'ALTER TABLE pending_messages DROP FOREIGN KEY pending_messages_ibfk_1', label: 'drop pm_ibfk_1' },
    { sql: 'ALTER TABLE pending_messages DROP FOREIGN KEY pending_messages_ibfk_2', label: 'drop pm_ibfk_2' },

    // ── Column changes Sequelize alter cannot do automatically ────────────
    { sql: 'ALTER TABLE ratings MODIFY COLUMN rated_id CHAR(36) NULL DEFAULT NULL', label: 'ratings.rated_id nullable' },
    { sql: "ALTER TABLE `groups` ADD COLUMN status VARCHAR(150) DEFAULT 'A new group on Wisber!'", label: 'groups.status' },
    { sql: "ALTER TABLE `groups` ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1",              label: 'groups.is_active' },
  ];

  for (const { sql, label } of steps) {
    try {
      await sequelize.query(sql);
      logger.info(`[Migration] OK: ${label}`);
    } catch (err) {
      const code = err.original?.errno;
      // 1091 = FK/key doesn't exist (already dropped) — safe to ignore
      // 1025 = error on rename (already gone) — safe to ignore
      if (code === 1091 || code === 1025) {
        logger.info(`[Migration] Already applied: ${label}`);
      } else {
        logger.warn(`[Migration] Skipped "${label}": ${err.original?.message || err.message}`);
      }
    }
  }
};

const start = async () => {
  try {
    // 1. Drop conflicting FK constraints FIRST (before sync touches the tables)
    await runMigrations();

    // 2. Sync all Sequelize models — creates missing tables only, never alters existing ones.
    //    Using alter:true accumulates duplicate indexes on every restart and hits MySQL's
    //    64-key-per-table limit. Column changes are handled above in runMigrations() instead.
    await sequelize.sync();
    logger.info('[DB] All tables synced');

    // 3. Seed default app_content rows (INSERT IGNORE — only runs if row missing)
    await AppContent.findOrCreate({
      where   : { key: 'about' },
      defaults: {
        title  : 'About Wisber',
        body   : 'Wisber is a secure messaging app developed by Nema International Limited.\n\nMore information about Wisber will be available here soon.',
        version: '1.0.0',
      },
    });
    await AppContent.findOrCreate({
      where   : { key: 'privacy' },
      defaults: {
        title  : 'Privacy Policy',
        body   : 'Your privacy is important to us at Nema International Limited.\n\nThe full Privacy Policy will be available here soon.',
        version: null,
      },
    });
    logger.info('[DB] app_content seeded');

    // 4. Daily cleanup: delete expired pending messages (1-to-1 and group)
    const runCleanup = async () => {
      try {
        const deleted = await PendingMessage.destroy({
          where: { expires_at: { [Op.lt]: new Date() } },
        });
        if (deleted > 0) logger.info(`[Cleanup] Removed ${deleted} expired pending message(s)`);

        const deletedGroup = await PendingGroupMessage.destroy({
          where: { expires_at: { [Op.lt]: new Date() } },
        });
        if (deletedGroup > 0) logger.info(`[Cleanup] Removed ${deletedGroup} expired pending group message(s)`);
      } catch (e) {
        logger.error('[Cleanup] Failed: ' + e.message);
      }
    };
    runCleanup();
    setInterval(runCleanup, 24 * 60 * 60 * 1000);

    server.listen(PORT, () => logger.info(`Wisber backend running on port ${PORT}`));
  } catch (err) {
    logger.error('[Startup] Failed: ' + (err.original?.message || err.message));
    process.exit(1);
  }
};

start();
