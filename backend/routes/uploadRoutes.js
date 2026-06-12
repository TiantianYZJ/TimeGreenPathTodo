const express = require('express');
const router = express.Router();
const { upload, uploadAvatar } = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/auth');

router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

module.exports = router;
