const { AppContent } = require('../../models');

// ── GET /app-content/:key ──────────────────────────────────────────────────────
// Public — no auth required.  key = 'about' | 'privacy'
const getContent = async (req, res, next) => {
  try {
    const { key } = req.params;
    const row = await AppContent.findByPk(key);
    if (!row) return res.status(404).json({ error: 'Content not found' });
    res.json({
      key    : row.key,
      title  : row.title,
      body   : row.body,
      version: row.version,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /app-content/:key  (admin only — called from control panel) ────────────
const updateContent = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { title, body, version } = req.body;

    const [row, created] = await AppContent.findOrCreate({
      where   : { key },
      defaults: { title: title ?? key, body: body ?? '', version: version ?? null },
    });

    if (!created) {
      if (title   !== undefined) row.title   = title;
      if (body    !== undefined) row.body    = body;
      if (version !== undefined) row.version = version;
      await row.save();
    }

    res.json({ key: row.key, title: row.title, body: row.body, version: row.version });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContent, updateContent };
