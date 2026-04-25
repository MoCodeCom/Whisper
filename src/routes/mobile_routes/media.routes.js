const express    = require('express');
const router     = express.Router();
const controller = require('../../controllers/mobile_controllers/media.controller');
const auth       = require('../../middleware/auth');
const multer     = require('multer');

const upload = multer({
  storage   : multer.memoryStorage(),
  limits    : { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed')),
});

const uploadAudio = multer({
  storage   : multer.memoryStorage(),
  limits    : { fileSize: 20 * 1024 * 1024 }, // 20 MB for voice messages
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('audio/') ? cb(null, true) : cb(new Error('Only audio files are allowed')),
});

const uploadDocument = multer({
  storage   : multer.memoryStorage(),
  limits    : { fileSize: 50 * 1024 * 1024 }, // 50 MB for documents
  fileFilter: (_req, file, cb) => cb(null, true), // accept all file types
});

router.post('/upload',          auth, upload.single('image'),             controller.uploadImage);
router.post('/upload-audio',    auth, uploadAudio.single('audio'),        controller.uploadImage);
router.post('/upload-document', auth, uploadDocument.single('document'),  controller.uploadImage);
router.post('/:id/confirm',     auth,                                      controller.confirmMedia);

module.exports = router;
