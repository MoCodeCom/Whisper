const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const controller = require('../../controllers/cp_controllers/ads.controller');

// Image upload: stored in memory, service writes to disk under uploads/ads/
const upload = multer({
  storage   : multer.memoryStorage(),
  limits    : { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed')),
});

// GET    /api/cp/ads          — list all ads (paginated)
// POST   /api/cp/ads          — create ad  (multipart: image field optional)
// GET    /api/cp/ads/:id      — get single ad
// PUT    /api/cp/ads/:id      — update ad  (multipart: image field optional)
// PATCH  /api/cp/ads/:id/toggle — flip is_active
// DELETE /api/cp/ads/:id      — delete ad + image file

router.get   ('/',             controller.list);
router.post  ('/',             upload.single('image'), controller.create);
router.get   ('/:id',          controller.get);
router.put   ('/:id',          upload.single('image'), controller.update);
router.patch ('/:id/toggle',   controller.toggle);
router.delete('/:id',          controller.remove);

module.exports = router;
